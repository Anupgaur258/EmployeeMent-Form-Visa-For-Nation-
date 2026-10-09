import mongoose from 'mongoose';

const DocumentFileSchema = new mongoose.Schema(
  {
    fileId: { type: String, default: '' },
    fileName: { type: String, default: '' },
    originalName: { type: String, default: '' },
    mimeType: { type: String, default: '' },
    size: { type: Number, default: 0 },
    webViewLink: { type: String, default: '' },
    webContentLink: { type: String, default: '' },
    storageType: { type: String, enum: ['gdrive', 'local'], default: 'local' }
  },
  { _id: false }
);

const LanguageSchema = new mongoose.Schema(
  {
    language: { type: String, default: '' },
    otherLang: { type: String, default: '' },
    fluency: { type: String, default: '' }
  },
  { _id: false }
);

const FamilyMemberSchema = new mongoose.Schema(
  {
    name: { type: String, default: '' },
    age: { type: String, default: '' },
    relationship: { type: String, default: '' },
    occupation: { type: String, default: '' }
  },
  { _id: false }
);

const EducationRecordSchema = new mongoose.Schema(
  {
    examPassed: { type: String, default: '' },
    schoolCollege: { type: String, default: '' },
    yearPassing: { type: String, default: '' },
    marksCGPA: { type: String, default: '' },
    subjects: { type: String, default: '' },
    isDefault: { type: Boolean, default: false }
  },
  { _id: false }
);

const ExperienceRecordSchema = new mongoose.Schema(
  {
    companyName: { type: String, default: '' },
    companyAddress: { type: String, default: '' },
    designation: { type: String, default: '' },
    periodFrom: { type: String, default: '' },
    periodTo: { type: String, default: '' },
    ctc: { type: String, default: '' },
    reasonLeaving: { type: String, default: '' }
  },
  { _id: false }
);

const BankDetailsSchema = new mongoose.Schema(
  {
    bankName: { type: String, default: '' },
    accountNo: { type: String, default: '' },
    ifscCode: { type: String, default: '' },
    branchName: { type: String, default: '' }
  },
  { _id: false }
);

const ReferenceSchema = new mongoose.Schema(
  {
    name: { type: String, default: '' },
    relationship: { type: String, default: '' },
    address: { type: String, default: '' },
    mobileNo: { type: String, default: '' }
  },
  { _id: false }
);

const DocumentsSchema = new mongoose.Schema(
  {
    photo: { type: DocumentFileSchema, default: null },
    updatedCv: { type: DocumentFileSchema, default: null },
    aadhaarFront: { type: DocumentFileSchema, default: null },
    aadhaarBack: { type: DocumentFileSchema, default: null },
    panCard: { type: DocumentFileSchema, default: null },
    educationalCertificates: { type: DocumentFileSchema, default: null },
    bankPassbook: { type: DocumentFileSchema, default: null },
    offerLetter: { type: DocumentFileSchema, default: null },
    salarySlips: { type: DocumentFileSchema, default: null },
    bankStatements: { type: DocumentFileSchema, default: null },
    resignationLetter: { type: DocumentFileSchema, default: null },
    experienceLetter: { type: DocumentFileSchema, default: null },
    rentAgreement: { type: DocumentFileSchema, default: null }
  },
  { _id: false }
);

const LeadSchema = new mongoose.Schema(
  {
    // Application Info
    positionJoiningFor: { type: String, required: true },
    applicationDate: { type: String, required: true },

    // Personal Details
    fullName: { type: String, required: true },
    fatherHusbandName: { type: String, default: '' },
    fatherHusbandOccupation: { type: String, default: '' },
    dob: { type: String, default: '' },
    age: { type: String, default: '' },
    gender: { type: String, default: 'Male' },
    genderOther: { type: String, default: '' },
    emailId: { type: String, required: true },
    religion: { type: String, default: 'Hindu' },
    religionOther: { type: String, default: '' },
    nationality: { type: String, default: 'Indian' },
    nationalityOther: { type: String, default: '' },
    maritalStatus: { type: String, default: 'Single' },
    maritalOther: { type: String, default: '' },
    aadhaarNo: { type: String, default: '' },
    mobileNo: { type: String, required: true },
    whatsappNo: { type: String, default: '' },

    // Emergency Contacts
    emergencyNo1: { type: String, default: '' },
    emergencyRelativeName1: { type: String, default: '' },
    emergencyRelation1: { type: String, default: '' },
    emergencyNo2: { type: String, default: '' },
    emergencyRelativeName2: { type: String, default: '' },
    emergencyRelation2: { type: String, default: '' },

    // Address
    presentAddress: { type: String, default: '' },
    permanentAddress: { type: String, default: '' },
    sameAsCurrentAddress: { type: Boolean, default: false },
    district: { type: String, default: '' },
    state: { type: String, default: '' },
    postalCode: { type: String, default: '' },

    // Languages
    languages: { type: [LanguageSchema], default: [] },

    // Family
    familyDetails: { type: [FamilyMemberSchema], default: [] },

    // Education
    educationHistory: { type: [EducationRecordSchema], default: [] },

    // Experience
    isFresher: { type: Boolean, default: false },
    experienceDetails: { type: [ExperienceRecordSchema], default: [] },

    // Bank Details
    bankDetails: { type: BankDetailsSchema, default: () => ({}) },

    // Reference
    reference: { type: ReferenceSchema, default: () => ({}) },

    // Uploaded Documents & Google Drive Links
    documents: { type: DocumentsSchema, default: () => ({}) },

    // Additional info
    offeredSalary: { type: String, default: '' },
    joiningDate: { type: String, default: '' },
    declarationName: { type: String, default: '' },
    declarationDate: { type: String, default: '' },
    signature: { type: String, default: '' },

    // Admin Management Status & Notes
    status: {
      type: String,
      enum: ['Pending', 'In Review', 'Shortlisted', 'Interviewed', 'Selected', 'Rejected'],
      default: 'Pending'
    },
    adminNotes: { type: String, default: '' }
  },
  {
    timestamps: true // adds createdAt and updatedAt
  }
);

// Index for fast search and listing newest first
LeadSchema.index({ createdAt: -1 });
LeadSchema.index({ fullName: 'text', emailId: 'text', mobileNo: 'text', positionJoiningFor: 'text' });

export default mongoose.model('Lead', LeadSchema);
