import express from 'express';
import jwt from 'jsonwebtoken';
import Lead from '../models/Lead.js';
import { adminAuthMiddleware } from '../middleware/auth.js';
import { deleteFileFromDrive } from '../services/googleDrive.js';

const router = express.Router();

/**
 * POST /api/admin/login
 * Verify admin password from .env and return JWT token
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
        message: 'Invalid admin password. Access denied.'
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
 * Quick dashboard metrics
 */
router.get('/stats', adminAuthMiddleware, async (req, res) => {
  try {
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
        total,
        pending,
        inReview,
        shortlisted,
        interviewed,
        selected,
        rejected
      }
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
 * Get all leads sorted newest first (createdAt: -1)
 */
router.get('/leads', adminAuthMiddleware, async (req, res) => {
  try {
    const { search, status } = req.query;
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

    // Always sort by createdAt: -1 so newest appears at the very top!
    const leads = await Lead.find(query).sort({ createdAt: -1 });

    res.json({
      success: true,
      count: leads.length,
      leads
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
 * Get complete details of a specific user/lead
 */
router.get('/leads/:id', adminAuthMiddleware, async (req, res) => {
  try {
    const lead = await Lead.findById(req.params.id);
    if (!lead) {
      return res.status(404).json({
        success: false,
        message: 'Lead not found'
      });
    }

    res.json({
      success: true,
      lead
    });
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
 * Update status, notes, or lead details (CRUD Update)
 */
router.put('/leads/:id', adminAuthMiddleware, async (req, res) => {
  try {
    const updatedLead = await Lead.findByIdAndUpdate(
      req.params.id,
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
 * Delete lead and cleanup associated files from Drive (CRUD Delete)
 */
router.delete('/leads/:id', adminAuthMiddleware, async (req, res) => {
  try {
    const lead = await Lead.findById(req.params.id);
    if (!lead) {
      return res.status(404).json({
        success: false,
        message: 'Lead not found'
      });
    }

    // Try deleting files from Google Drive
    if (lead.documents) {
      const docEntries = Object.values(lead.documents.toObject ? lead.documents.toObject() : lead.documents);
      for (const doc of docEntries) {
        if (doc && doc.fileId && doc.storageType === 'gdrive') {
          try {
            await deleteFileFromDrive(doc.fileId);
          } catch (e) {
            console.warn(`[Delete] File delete warning: ${e.message}`);
          }
        }
      }
    }

    await Lead.findByIdAndDelete(req.params.id);

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
