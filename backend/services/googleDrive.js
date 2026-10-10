import { google } from 'googleapis';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { Readable } from 'stream';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Ensure local uploads directory exists as persistent local storage / fallback
const LOCAL_UPLOADS_DIR = path.join(__dirname, '..', 'uploads');
if (!fs.existsSync(LOCAL_UPLOADS_DIR)) {
  fs.mkdirSync(LOCAL_UPLOADS_DIR, { recursive: true });
}

/**
 * Check if OAuth2 credentials are configured and not dummy placeholders
 */
const hasValidOAuth2Config = () => {
  const clientId = process.env.GOOGLE_CLIENT_ID;
  const clientSecret = process.env.GOOGLE_CLIENT_SECRET;
  const refreshToken = process.env.GOOGLE_REFRESH_TOKEN;

  if (!clientId || !clientSecret || !refreshToken) return false;

  const invalidPlaceholders = [
    'our_client_secret_here',
    'google_refresh_token_here',
    'your_client_secret',
    'your_refresh_token'
  ];

  if (invalidPlaceholders.some((ph) => clientSecret.includes(ph) || refreshToken.includes(ph))) {
    return false;
  }

  return true;
};

/**
 * Initialize Google Drive Client
 * Priority 1: User OAuth2 (Required for personal Google Drive accounts to use user's storage quota)
 * Priority 2: Service Account (Supported for Google Workspace Shared/Team Drives)
 */
export const getDriveClient = () => {
  // 1. Try OAuth2 first (User Storage Quota)
  if (hasValidOAuth2Config()) {
    try {
      const oauth2Client = new google.auth.OAuth2(
        process.env.GOOGLE_CLIENT_ID,
        process.env.GOOGLE_CLIENT_SECRET
      );
      oauth2Client.setCredentials({ refresh_token: process.env.GOOGLE_REFRESH_TOKEN });
      return { client: google.drive({ version: 'v3', auth: oauth2Client }), authType: 'oauth2' };
    } catch (err) {
      console.warn('[Google Drive] OAuth2 client init error:', err.message);
    }
  }

  // 2. Try Service Account (Workspace Shared Drives)
  const serviceEmail = process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL;
  let privateKey = process.env.GOOGLE_PRIVATE_KEY;

  if (serviceEmail && privateKey) {
    try {
      privateKey = privateKey.replace(/\\n/g, '\n');
      const auth = new google.auth.JWT(
        serviceEmail,
        null,
        privateKey,
        ['https://www.googleapis.com/auth/drive.file', 'https://www.googleapis.com/auth/drive']
      );
      return { client: google.drive({ version: 'v3', auth }), authType: 'service_account' };
    } catch (err) {
      console.warn('[Google Drive] Service Account client init error:', err.message);
    }
  }

  return null;
};

/**
 * Convert Buffer to Readable Stream for Google Drive API
 */
const bufferToStream = (buffer) => {
  const stream = new Readable();
  stream.push(buffer);
  stream.push(null);
  return stream;
};

/**
 * Upload a candidate document to Google Drive (with resilient local storage fallback)
 * @param {Object} file - Multer file object
 * @param {String} applicantName - Candidate's name for file identification
 * @param {String} fieldName - Form field name (photo, updatedCv, etc.)
 * @returns {Promise<Object>} file metadata with webViewLink & webContentLink
 */
export const uploadFileToDrive = async (file, applicantName = 'Applicant', fieldName = 'doc') => {
  if (!file) return null;

  const driveInfo = getDriveClient();
  const folderId = process.env.GOOGLE_DRIVE_FOLDER_ID;

  // Clean candidate name and original filename
  const cleanApplicant = (applicantName || 'Applicant').replace(/[^a-zA-Z0-9_-]/g, '_');
  const originalName = file.originalname || 'document';
  const cleanOriginal = originalName.replace(/[^a-zA-Z0-9._-]/g, '_');
  const ext = path.extname(originalName);
  const baseName = path.basename(cleanOriginal, ext);

  // Safe unique filename preserving the original filename
  const safeFilename = `${cleanApplicant}_${fieldName}_${baseName}_${Date.now()}${ext}`;

  if (driveInfo && folderId) {
    try {
      const fileMetadata = {
        name: `${cleanApplicant}_${fieldName}_${cleanOriginal}`,
        parents: [folderId]
      };

      const media = {
        mimeType: file.mimetype,
        body: file.buffer ? bufferToStream(file.buffer) : fs.createReadStream(file.path)
      };

      const response = await driveInfo.client.files.create({
        requestBody: fileMetadata,
        media: media,
        fields: 'id, name, webViewLink, webContentLink, size',
        supportsAllDrives: true,
        supportsTeamDrives: true
      });

      const fileId = response.data.id;

      // Attempt setting public read permission so admin can preview in portal
      try {
        await driveInfo.client.permissions.create({
          fileId: fileId,
          requestBody: { role: 'reader', type: 'anyone' },
          supportsAllDrives: true
        });
      } catch (permError) {
        // Non-fatal if organization policy disables public sharing
      }

      console.log(`[Google Drive] File uploaded successfully (${driveInfo.authType}): ${safeFilename} (${fileId})`);

      return {
        fileId: fileId,
        fileName: safeFilename,
        originalName: originalName,
        mimeType: file.mimetype,
        size: file.size,
        webViewLink: response.data.webViewLink || `https://drive.google.com/file/d/${fileId}/view`,
        webContentLink: response.data.webContentLink || `https://drive.google.com/uc?id=${fileId}&export=download`,
        storageType: 'gdrive'
      };
    } catch (uploadError) {
      const isQuotaError =
        uploadError.message?.includes('storage quota') ||
        uploadError.response?.data?.error?.message?.includes('storage quota');

      if (isQuotaError) {
        console.warn(`\n⚠️  [Google Drive Storage Notice]`);
        console.warn(`   Personal Google Drive folders require OAuth2 user credentials (GOOGLE_CLIENT_SECRET & GOOGLE_REFRESH_TOKEN).`);
        console.warn(`   Google Service Accounts have 0 bytes quota on personal Drives unless hosted in a Google Workspace Shared Drive.`);
        console.warn(`   👉 Document "${originalName}" is safely stored in local server storage.\n`);
      } else {
        console.warn(`[Google Drive] Upload failed for "${originalName}": ${uploadError.message}. Storing locally.`);
      }
    }
  }

  // Persistent Fallback: Store in local uploads directory
  try {
    const localFilePath = path.join(LOCAL_UPLOADS_DIR, safeFilename);
    if (file.buffer) {
      fs.writeFileSync(localFilePath, file.buffer);
    } else if (file.path) {
      fs.copyFileSync(file.path, localFilePath);
    }

    const hostUrl = process.env.BACKEND_PUBLIC_URL || `http://localhost:${process.env.PORT || 5000}`;
    const fileUrl = `${hostUrl}/uploads/${safeFilename}`;

    return {
      fileId: `local_${Date.now()}_${Math.random().toString(36).substring(2, 8)}`,
      fileName: safeFilename,
      originalName: originalName,
      mimeType: file.mimetype,
      size: file.size,
      webViewLink: fileUrl,
      webContentLink: fileUrl,
      storageType: 'local'
    };
  } catch (localError) {
    console.error(`[Storage] Failed to save locally:`, localError.message);
    throw new Error(`Failed to save file "${originalName}": ${localError.message}`);
  }
};

/**
 * Delete a file from Google Drive or local storage
 */
export const deleteFileFromDrive = async (fileId, fileName) => {
  if (!fileId) return;

  if (fileId.startsWith('local_') || !fileId) {
    if (fileName) {
      const localFilePath = path.join(LOCAL_UPLOADS_DIR, fileName);
      if (fs.existsSync(localFilePath)) {
        try {
          fs.unlinkSync(localFilePath);
          console.log(`[Storage] Deleted local file: ${fileName}`);
        } catch (e) {
          console.warn(`[Storage] Could not delete local file: ${e.message}`);
        }
      }
    }
    return;
  }

  const driveInfo = getDriveClient();
  if (!driveInfo) return;

  try {
    await driveInfo.client.files.delete({ fileId, supportsAllDrives: true });
    console.log(`[Google Drive] Deleted file: ${fileId}`);
  } catch (err) {
    console.warn(`[Google Drive] Failed to delete file ${fileId}:`, err.message);
  }
};
