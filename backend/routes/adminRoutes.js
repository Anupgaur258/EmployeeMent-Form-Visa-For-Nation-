import express from 'express';
import jwt from 'jsonwebtoken';
import Lead from '../models/Lead.js';
import { isDBConnected } from '../config/db.js';
import { adminAuthMiddleware } from '../middleware/auth.js';
import { deleteFileFromDrive } from '../services/googleDrive.js';
import { getPendingSubmissions, deletePendingSubmission } from '../services/syncService.js';

const router = express.Router();

/**
 * POST /api/admin/login
 * Verify admin password from .env and return signed JWT token
 */
router.post('/login', async (req, res) => {
  try {
    const { password } = req.body;
    const configuredPassword = process.env.ADMIN_PASSWORD || 'Admin@Visa2026!';

    if (!password) {
      return res.status(400).json({
        success: false,
        message: 'Password is required'
      });
    }

    if (password !== configuredPassword) {
      return res.status(401).json({
        success: false,
        message: 'Invalid admin credentials. Access denied.'
      });
    }

    const secret = process.env.JWT_SECRET || 'visa_for_nation_super_secret_jwt_key_2026_xyz';
    const token = jwt.sign({ role: 'admin', loggedInAt: new Date() }, secret, {
      expiresIn: '7d'
    });

    return res.json({
      success: true,
      message: 'Admin authenticated successfully',
      token
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: 'Authentication failed',
      error: error.message
    });
  }
});

/**
 * GET /api/admin/stats
 * Dashboard metrics combining MongoDB Atlas and persistent pending submissions
 */
router.get('/stats', adminAuthMiddleware, async (req, res) => {
  try {
    const pendingOffline = getPendingSubmissions();
    const pendingOfflineCount = pendingOffline.length;

    if (!isDBConnected()) {
      return res.json({
        success: true,
        stats: {
          total: pendingOfflineCount,
          pending: pendingOfflineCount,
          inReview: 0,
          shortlisted: 0,
          interviewed: 0,
          selected: 0,
          rejected: 0,
          pendingOfflineSync: pendingOfflineCount
        },
        databaseConnected: false
      });
    }

    const total = await Lead.countDocuments();
    const pending = await Lead.countDocuments({ status: 'Pending' });
    const inReview = await Lead.countDocuments({ status: 'In Review' });
    const shortlisted = await Lead.countDocuments({ status: 'Shortlisted' });
    const interviewed = await Lead.countDocuments({ status: 'Interviewed' });
    const selected = await Lead.countDocuments({ status: 'Selected' });
    const rejected = await Lead.countDocuments({ status: 'Rejected' });

    res.json({
      success: true,
      stats: {
        total: total + pendingOfflineCount,
        pending: pending + pendingOfflineCount,
        inReview,
        shortlisted,
        interviewed,
        selected,
        rejected,
        pendingOfflineSync: pendingOfflineCount
      },
      databaseConnected: true
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to fetch stats',
      error: error.message
    });
  }
});

/**
 * GET /api/admin/leads
 * Get all leads sorted newest first (createdAt: -1) with sync status
 */
router.get('/leads', adminAuthMiddleware, async (req, res) => {
  try {
    const { search, status } = req.query;
    const pendingOffline = getPendingSubmissions();

    let dbLeads = [];
    if (isDBConnected()) {
      const query = {};

      if (status && status !== 'All') {
        query.status = status;
      }

      if (search && search.trim()) {
        const searchRegex = new RegExp(search.trim(), 'i');
        query.$or = [
          { fullName: searchRegex },
          { emailId: searchRegex },
          { mobileNo: searchRegex },
          { positionJoiningFor: searchRegex },
          { aadhaarNo: searchRegex }
        ];
      }

      dbLeads = await Lead.find(query).sort({ createdAt: -1 });
    }

    // Filter pending offline leads matching query
    let filteredPending = pendingOffline;
    if (status && status !== 'All') {
      filteredPending = filteredPending.filter((l) => l.status === status);
    }
    if (search && search.trim()) {
      const s = search.toLowerCase();
      filteredPending = filteredPending.filter(
        (l) =>
          (l.fullName && l.fullName.toLowerCase().includes(s)) ||
          (l.emailId && l.emailId.toLowerCase().includes(s)) ||
          (l.mobileNo && l.mobileNo.includes(s)) ||
          (l.positionJoiningFor && l.positionJoiningFor.toLowerCase().includes(s)) ||
          (l.aadhaarNo && l.aadhaarNo.includes(s))
      );
    }

    // Combine: Unsynced pending leads displayed at the top
    const combinedLeads = [...filteredPending, ...dbLeads];

    res.json({
      success: true,
      count: combinedLeads.length,
      leads: combinedLeads,
      databaseConnected: isDBConnected(),
      pendingOfflineCount: pendingOffline.length
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to fetch leads',
      error: error.message
    });
  }
});

/**
 * GET /api/admin/leads/:id
 * Get complete details of a specific candidate lead
 */
router.get('/leads/:id', adminAuthMiddleware, async (req, res) => {
  try {
    const { id } = req.params;

    // Check pending offline submissions first if id starts with pending_
    if (id.startsWith('pending_')) {
      const pending = getPendingSubmissions();
      const match = pending.find((p) => p._id === id);
      if (match) {
        return res.json({ success: true, lead: match, source: 'offline_queue' });
      }
    }

    if (isDBConnected()) {
      const lead = await Lead.findById(id);
      if (lead) {
        return res.json({ success: true, lead, source: 'mongodb' });
      }
    }

    // Fallback: check pending queue by ID
    const pending = getPendingSubmissions();
    const match = pending.find((p) => p._id === id || p.clientSubmissionId === id);
    if (match) {
      return res.json({ success: true, lead: match, source: 'offline_queue' });
    }

    return res.status(404).json({ success: false, message: 'Lead not found' });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to fetch lead details',
      error: error.message
    });
  }
});

/**
 * PUT /api/admin/leads/:id
 * Update status, notes, or lead details
 */
router.put('/leads/:id', adminAuthMiddleware, async (req, res) => {
  try {
    const { id } = req.params;

    if (id.startsWith('pending_')) {
      return res.status(400).json({
        success: false,
        message: 'Cannot modify lead while pending synchronization to database.'
      });
    }

    if (!isDBConnected()) {
      return res.status(503).json({
        success: false,
        message: 'Database is disconnected. Cannot update lead at this time.'
      });
    }

    const updatedLead = await Lead.findByIdAndUpdate(
      id,
      { $set: req.body },
      { new: true, runValidators: true }
    );

    if (!updatedLead) {
      return res.status(404).json({
        success: false,
        message: 'Lead not found'
      });
    }

    res.json({
      success: true,
      message: 'Lead updated successfully',
      lead: updatedLead
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to update lead',
      error: error.message
    });
  }
});

/**
 * DELETE /api/admin/leads/:id
 * Delete lead and cleanup associated files from Drive / local storage
 */
router.delete('/leads/:id', adminAuthMiddleware, async (req, res) => {
  try {
    const { id } = req.params;

    if (id.startsWith('pending_')) {
      const removed = deletePendingSubmission(id);
      if (removed) {
        return res.json({ success: true, message: 'Pending lead removed from queue' });
      }
      return res.status(404).json({ success: false, message: 'Lead not found in pending queue' });
    }

    if (!isDBConnected()) {
      return res.status(503).json({
        success: false,
        message: 'Database is disconnected. Cannot delete lead from database at this time.'
      });
    }

    const lead = await Lead.findById(id);
    if (!lead) {
      return res.status(404).json({
        success: false,
        message: 'Lead not found'
      });
    }

    // Cleanup associated files
    if (lead.documents) {
      const docEntries = Object.values(
        lead.documents.toObject ? lead.documents.toObject() : lead.documents
      );
      for (const doc of docEntries) {
        if (doc && (doc.fileId || doc.fileName)) {
          try {
            await deleteFileFromDrive(doc.fileId, doc.fileName);
          } catch (e) {
            console.warn(`[Delete] File deletion notice: ${e.message}`);
          }
        }
      }
    }

    await Lead.findByIdAndDelete(id);

    res.json({
      success: true,
      message: 'Lead and associated documents deleted successfully'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to delete lead',
      error: error.message
    });
  }
});

export default router;
