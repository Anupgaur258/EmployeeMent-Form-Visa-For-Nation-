import express from 'express';
import multer from 'multer';
import crypto from 'crypto';
import path from 'path';
import Lead from '../models/Lead.js';
import { isDBConnected } from '../config/db.js';
import { uploadFileToDrive } from '../services/googleDrive.js';
import { savePendingSubmission } from '../services/syncService.js';

const router = express.Router();

// Memory storage for file buffering before Drive/local streaming
const storage = multer.memoryStorage();

// Allowed MIME types for uploaded documents
const ALLOWED_MIME_TYPES = [
  'image/jpeg',
  'image/png',
  'image/jpg',
  'image/webp',
  'application/pdf'
];

const upload = multer({
  storage,
  limits: {
    fileSize: 10 * 1024 * 1024 // 10MB per file limit
  },
  fileFilter: (req, file, cb) => {
    if (ALLOWED_MIME_TYPES.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error(`Invalid file type for ${file.fieldname}. Allowed types: PDF, JPG, JPEG, PNG, WEBP.`));
    }
  }
});

// List of all expected document fields
const fileFields = [
  { name: 'photo', maxCount: 1 },
  { name: 'updatedCv', maxCount: 1 },
  { name: 'aadhaarFront', maxCount: 1 },
  { name: 'aadhaarBack', maxCount: 1 },
  { name: 'panCard', maxCount: 1 },
  { name: 'educationalCertificates', maxCount: 1 },
  { name: 'bankPassbook', maxCount: 1 },
  { name: 'offerLetter', maxCount: 1 },
  { name: 'salarySlips', maxCount: 1 },
  { name: 'bankStatements', maxCount: 1 },
  { name: 'resignationLetter', maxCount: 1 },
  { name: 'experienceLetter', maxCount: 1 },
  { name: 'rentAgreement', maxCount: 1 }
];

/**
 * Helper to safely parse JSON strings or return original value
 */
const safeJsonParse = (val, defaultVal) => {
  if (!val) return defaultVal;
  if (typeof val === 'object') return val;
  try {
    return JSON.parse(val);
  } catch (e) {
    return defaultVal;
  }
};

/**
 * POST /api/leads - Create new lead submission with file attachments and idempotency
 */
router.post('/', upload.fields(fileFields), async (req, res) => {
  try {
    const body = req.body;
    const applicantName = (body.fullName || '').trim();

    // Required Field Validations
    if (!applicantName) {
      return res.status(400).json({ success: false, message: 'Full Name is required.' });
    }
    if (!body.positionJoiningFor) {
      return res.status(400).json({ success: false, message: 'Position is required.' });
    }
    if (!body.emailId) {
      return res.status(400).json({ success: false, message: 'Email ID is required.' });
    }
    if (!body.mobileNo) {
      return res.status(400).json({ success: false, message: 'Mobile Number is required.' });
    }

    // Stable Client Submission ID for Idempotency / Duplicate Prevention
    const clientSubmissionId =
      body.clientSubmissionId ||
      crypto
        .createHash('sha256')
        .update(
          `${body.emailId.toLowerCase().trim()}_${body.mobileNo.trim()}_${(body.positionJoiningFor || '').trim()}_${(body.applicationDate || '').trim()}`
        )
        .digest('hex');

    // If MongoDB is connected, check for duplicates
    if (isDBConnected()) {
      const existing = await Lead.findOne({ clientSubmissionId });
      if (existing) {
        console.log(`[Leads API] Duplicate submission prevented for: ${applicantName} (${clientSubmissionId})`);
        return res.status(200).json({
          success: true,
          message: 'Application already received and saved.',
          leadId: existing._id,
          lead: existing,
          isDuplicate: true
        });
      }
    }

    console.log(`[Leads API] Processing application for: ${applicantName} (${body.emailId})`);

    // Process uploaded documents
    const uploadedDocs = {};
    if (req.files) {
      for (const field of fileFields) {
        const fileArr = req.files[field.name];
        if (fileArr && fileArr.length > 0) {
          const file = fileArr[0];
          console.log(`[Leads API] Processing ${field.name} (${file.originalname}) for ${applicantName}...`);
          const docInfo = await uploadFileToDrive(file, applicantName, field.name);
          if (docInfo) {
            uploadedDocs[field.name] = docInfo;
          }
        }
      }
    }

    // Parse nested objects and arrays sent via FormData
    const languages = safeJsonParse(body.languages, []);
    const familyDetails = safeJsonParse(body.familyDetails, []);
    const educationHistory = safeJsonParse(body.educationHistory, []);
    const experienceDetails = safeJsonParse(body.experienceDetails, []);
    const bankDetails = safeJsonParse(body.bankDetails, {});
    const reference = safeJsonParse(body.reference, {});

    const sameAsCurrentAddress = body.sameAsCurrentAddress === 'true' || body.sameAsCurrentAddress === true;
    const isFresher = body.isFresher === 'true' || body.isFresher === true;

    // Build normalized Lead data structure
    const leadData = {
      positionJoiningFor: body.positionJoiningFor || '',
      applicationDate: body.applicationDate || new Date().toISOString().split('T')[0],

      fullName: applicantName,
      fatherHusbandName: body.fatherHusbandName || '',
      fatherHusbandOccupation: body.fatherHusbandOccupation || '',
      dob: body.dob || '',
      age: body.age || '',
      gender: body.gender || 'Male',
      genderOther: body.genderOther || '',
      emailId: body.emailId || '',
      religion: body.religion || 'Hindu',
      religionOther: body.religionOther || '',
      nationality: body.nationality || 'Indian',
      nationalityOther: body.nationalityOther || '',
      maritalStatus: body.maritalStatus || 'Single',
      maritalOther: body.maritalOther || '',
      aadhaarNo: body.aadhaarNo || '',
      mobileNo: body.mobileNo || '',
      whatsappNo: body.whatsappNo || '',

      emergencyNo1: body.emergencyNo1 || '',
      emergencyRelativeName1: body.emergencyRelativeName1 || '',
      emergencyRelation1: body.emergencyRelation1 || '',
      emergencyNo2: body.emergencyNo2 || '',
      emergencyRelativeName2: body.emergencyRelativeName2 || '',
      emergencyRelation2: body.emergencyRelation2 || '',

      presentAddress: body.presentAddress || '',
      permanentAddress: body.permanentAddress || '',
      sameAsCurrentAddress,
      district: body.district || '',
      state: body.state || '',
      postalCode: body.postalCode || '',

      languages,
      familyDetails,
      educationHistory,
      isFresher,
      experienceDetails,
      bankDetails,
      reference,

      documents: uploadedDocs,

      offeredSalary: body.offeredSalary || '',
      joiningDate: body.joiningDate || '',
      declarationName: body.declarationName || '',
      declarationDate: body.declarationDate || '',
      signature: body.signature || '',

      status: 'Pending',
      clientSubmissionId,
      syncStatus: 'synced'
    };

    // Branch: MongoDB is connected vs disconnected
    if (isDBConnected()) {
      const newLead = new Lead(leadData);
      const savedLead = await newLead.save();

      console.log(`[Leads API] ✅ Lead saved durably to MongoDB Atlas: ID ${savedLead._id}`);

      return res.status(201).json({
        success: true,
        message: 'Application submitted successfully!',
        leadId: savedLead._id,
        lead: savedLead,
        syncStatus: 'synced'
      });
    } else {
      // Disconnected: Store in durable persistent queue but DO NOT claim false success
      leadData.syncStatus = 'pending';
      const queuedLead = savePendingSubmission(leadData);

      console.warn(`[Leads API] ⚠️ Database disconnected. Lead queued in persistent storage (ID: ${queuedLead._id}).`);

      return res.status(503).json({
        success: false,
        message:
          'Database is temporarily unavailable. Your application has been securely queued offline and will be synchronized once MongoDB Atlas connectivity is restored.',
        error: 'Database unavailable',
        leadId: queuedLead._id,
        clientSubmissionId,
        queued: true
      });
    }
  } catch (error) {
    console.error('[Leads API] Error creating lead:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Failed to submit application. Please try again.',
      error: error.message
    });
  }
});

export default router;
