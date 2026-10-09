import express from 'express';
import multer from 'multer';
import Lead from '../models/Lead.js';
import { uploadFileToDrive } from '../services/googleDrive.js';

const router = express.Router();

// Memory storage for direct streaming to Google Drive or local saving
const storage = multer.memoryStorage();
const upload = multer({
  storage,
  limits: {
    fileSize: 15 * 1024 * 1024 // 15MB limit per file
  }
});

// List of all file fields allowed from the lead form
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
 * POST /api/leads - Create new lead submission with file attachments
 */
router.post('/', upload.fields(fileFields), async (req, res) => {
  try {
    const body = req.body;
    const applicantName = body.fullName || 'Applicant';

    console.log(`[Leads API] New lead submission received for: ${applicantName} (${body.emailId || 'no email'})`);

    // Process files and upload to Google Drive
    const uploadedDocs = {};
    if (req.files) {
      for (const field of fileFields) {
        const fileArr = req.files[field.name];
        if (fileArr && fileArr.length > 0) {
          const file = fileArr[0];
          console.log(`[Leads API] Uploading ${field.name} for ${applicantName}...`);
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

    // Boolean conversions
    const sameAsCurrentAddress = body.sameAsCurrentAddress === 'true' || body.sameAsCurrentAddress === true;
    const isFresher = body.isFresher === 'true' || body.isFresher === true;

    // Create MongoDB Lead document
    const newLead = new Lead({
      positionJoiningFor: body.positionJoiningFor || '',
      applicationDate: body.applicationDate || new Date().toISOString().split('T')[0],

      fullName: body.fullName || '',
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

      status: 'Pending'
    });

    const savedLead = await newLead.save();

    console.log(`[Leads API] Lead saved successfully in MongoDB. ID: ${savedLead._id}`);

    res.status(201).json({
      success: true,
      message: 'Application submitted successfully!',
      leadId: savedLead._id,
      lead: savedLead
    });
  } catch (error) {
    console.error('[Leads API] Error creating lead:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to submit application. Please try again.',
      error: error.message
    });
  }
});

export default router;
