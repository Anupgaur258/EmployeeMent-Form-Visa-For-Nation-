import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import mongoose from 'mongoose';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const PENDING_FILE = path.join(__dirname, '..', 'uploads', 'pending_submissions.json');

/**
 * Read all pending submissions from persistent file
 */
export const getPendingSubmissions = () => {
  try {
    if (!fs.existsSync(PENDING_FILE)) {
      return [];
    }
    const data = fs.readFileSync(PENDING_FILE, 'utf8');
    if (!data || !data.trim()) return [];
    const parsed = JSON.parse(data);
    return Array.isArray(parsed) ? parsed : [];
  } catch (err) {
    console.error('[Sync Service] Error reading pending submissions file:', err.message);
    return [];
  }
};

/**
 * Save pending submissions list atomically to disk
 */
const writePendingSubmissions = (submissions) => {
  try {
    const dir = path.dirname(PENDING_FILE);
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
    fs.writeFileSync(PENDING_FILE, JSON.stringify(submissions, null, 2), 'utf8');
  } catch (err) {
    console.error('[Sync Service] Error writing pending submissions file:', err.message);
  }
};

/**
 * Save a newly captured offline submission to durable persistent file
 * Ensures all form fields and file metadata remain associated
 */
export const savePendingSubmission = (submissionData) => {
  const pending = getPendingSubmissions();

  // Deduplicate by clientSubmissionId if already present in queue
  const existingIdx = pending.findIndex(
    (p) => p.clientSubmissionId === submissionData.clientSubmissionId
  );

  if (existingIdx !== -1) {
    // Update existing entry with latest data
    pending[existingIdx] = {
      ...pending[existingIdx],
      ...submissionData,
      updatedAt: new Date().toISOString()
    };
  } else {
    pending.unshift({
      ...submissionData,
      _id: `pending_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
      createdAt: submissionData.createdAt || new Date().toISOString(),
      syncStatus: 'pending',
      retryCount: 0
    });
  }

  writePendingSubmissions(pending);
  console.log(`[Sync Service] Persisted offline submission for "${submissionData.fullName}" (ID: ${submissionData.clientSubmissionId})`);
  return pending[0];
};

let isSyncRunning = false;

/**
 * Synchronize all pending submissions to MongoDB Atlas
 * Runs automatically upon MongoDB connection or reconnect
 */
export const processPendingSubmissions = async () => {
  if (isSyncRunning) return;
  if (mongoose.connection.readyState !== 1) {
    return;
  }

  const pending = getPendingSubmissions();
  if (pending.length === 0) return;

  isSyncRunning = true;
  console.log(`[Sync Service] Found ${pending.length} pending submission(s). Starting sync to MongoDB Atlas...`);

  const remaining = [];
  let syncedCount = 0;

  try {
    const Lead = mongoose.model('Lead');

    for (const sub of pending) {
      try {
        // Idempotency check: Check if already persisted in MongoDB Atlas
        let existing = null;
        if (sub.clientSubmissionId) {
          existing = await Lead.findOne({ clientSubmissionId: sub.clientSubmissionId });
        }

        if (existing) {
          console.log(`[Sync Service] Submission "${sub.fullName}" (${sub.clientSubmissionId}) already exists in MongoDB. Skipping duplicate.`);
          syncedCount++;
          continue; // Successfully accounted for, don't keep in pending
        }

        // Prepare clean lead document for MongoDB
        const leadDoc = {
          ...sub,
          syncStatus: 'synced'
        };
        // Remove temporary client-side / offline ID
        delete leadDoc._id;

        const saved = await Lead.create(leadDoc);
        console.log(`[Sync Service] ✅ Persisted to MongoDB Atlas: "${saved.fullName}" (MongoDB ID: ${saved._id})`);
        syncedCount++;
      } catch (insertErr) {
        console.error(`[Sync Service] Failed to insert submission for "${sub.fullName}":`, insertErr.message);
        // Keep in queue for next retry
        sub.retryCount = (sub.retryCount || 0) + 1;
        sub.lastError = insertErr.message;
        sub.lastAttempt = new Date().toISOString();
        remaining.push(sub);
      }
    }

    writePendingSubmissions(remaining);

    if (syncedCount > 0) {
      console.log(`[Sync Service] ✅ Successfully synchronized ${syncedCount} submission(s) to MongoDB Atlas. ${remaining.length} remaining.`);
    }
  } catch (err) {
    console.error('[Sync Service] Unexpected sync error:', err.message);
  } finally {
    isSyncRunning = false;
  }
};

/**
 * Delete a submission from pending queue by ID
 */
export const deletePendingSubmission = (id) => {
  const pending = getPendingSubmissions();
  const filtered = pending.filter(
    (p) => p._id !== id && p.clientSubmissionId !== id
  );
  writePendingSubmissions(filtered);
  return filtered.length < pending.length;
};

