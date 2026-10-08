import { useState } from 'react';

import "./App.css";

import VisaForNationLogo from './assets/VisaForNationLogo.png';

import {
  User,
  Briefcase,
  GraduationCap,
  Users,
  FileText,
  CheckCircle2,
  Plus,
  Trash2,
  AlertCircle,
  Camera,
  Landmark,
  Upload,
  Loader2
} from 'lucide-react';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api';

export default function App() {

  const [photoPreview, setPhotoPreview] = useState(null);
  const [photoFile, setPhotoFile] = useState(null);
  const [errors, setErrors] = useState({});
  const [submitted, setSubmitted] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState(null);


  // Get today's local date in YYYY-MM-DD format
  const getTodayDate = () => {
    const today = new Date();
    const year = today.getFullYear();
    const month = String(today.getMonth() + 1).padStart(2, '0');
    const day = String(today.getDate()).padStart(2, '0');

    return `${year}-${month}-${day}`;
  };

  // Position list
  const POSITION_OPTIONS = [
    'Immigration consultant (Sales)',
    'Sr. Immigration consultant (Sales)',
    'Case Manager (Documents)',
    'HR Manager (HR Department)',
    'SEO (IT)',
    'Developer (IT)',
    'Marketing Head (IT)',
    'Content Writer (IT)',
    'Front Desk Executive (Admin)',
    'Account Manager (Account)',
    'Office Staff'
  ];

  // Language list
  const MAIN_LANGUAGES = [
    'Hindi',
    'English',
    'Marathi',
    'Bengali',
    'Telugu',
    'Tamil',
    'Gujarati',
    'Urdu',
    'Kannada',
    'Odia',
    'Malayalam',
    'Punjabi',
    'Assamese',
    'Maithili',
    'Santhali',
    'Other'
  ];

  const [formData, setFormData] = useState({
    positionJoiningFor: '',

    // Interview Date - User can change this
    applicationDate: getTodayDate(),

    // Personal Info
    fullName: '',
    fatherHusbandName: '',
    fatherHusbandOccupation: '',
    dob: '',
    age: '',
    gender: 'Male',
    genderOther: '',
    emailId: '',
    religion: 'Hindu',
    religionOther: '',
    nationality: 'Indian',
    nationalityOther: '',
    maritalStatus: 'Single',
    maritalOther: '',
    aadhaarNo: '',
    mobileNo: '',
    whatsappNo: '',

    // Emergency Contacts
    emergencyNo1: '',
    emergencyRelativeName1: '',
    emergencyRelation1: '',

    emergencyNo2: '',
    emergencyRelativeName2: '',
    emergencyRelation2: '',

    // Address
    presentAddress: '',
    permanentAddress: '',
    sameAsCurrentAddress: false,
    district: '',
    state: '',
    postalCode: '',

    // Languages
    languages: [
      {
        language: 'Hindi',
        otherLang: '',
        fluency: 'Advance'
      },
      {
        language: 'English',
        otherLang: '',
        fluency: 'Intermediate'
      }
    ],

    // Family
    familyDetails: [
      {
        name: '',
        age: '',
        relationship: '',
        occupation: ''
      }
    ],

    // Education
    educationHistory: [
      {
        examPassed: '10th Class',
        schoolCollege: '',
        yearPassing: '',
        marksCGPA: '',
        subjects: '',
        isDefault: true
      },
      {
        examPassed: '12th Class',
        schoolCollege: '',
        yearPassing: '',
        marksCGPA: '',
        subjects: '',
        isDefault: true
      }
    ],

    // Experience
    isFresher: false,

    experienceDetails: [
      {
        companyName: '',
        companyAddress: '',
        designation: '',
        periodFrom: '',
        periodTo: '',
        ctc: '',
        reasonLeaving: ''
      }
    ],

    // Bank Details - ALL REQUIRED
    bankDetails: {
      bankName: '',
      accountNo: '',
      ifscCode: '',
      branchName: ''
    },

    // Reference
    reference: {
      name: '',
      relationship: '',
      address: '',
      mobileNo: ''
    },

    // Documents
    documents: {
      updatedCv: null,
      aadhaarFront: null,
      aadhaarBack: null,
      panCard: null,
      educationalCertificates: null,
      bankPassbook: null,
      offerLetter: null,
      salarySlips: null,
      bankStatements: null,
      resignationLetter: null,
      experienceLetter: null,
      rentAgreement: null
    },

    offeredSalary: '',
    joiningDate: '',

    declarationName: '',
    declarationDate: getTodayDate(),
    signature: ''
  });

  // Calculate age from DOB
  const calculateAge = (dobValue) => {
    if (!dobValue) return '';

    const birthDate = new Date(dobValue);
    const today = new Date();

    let computedAge =
      today.getFullYear() - birthDate.getFullYear();

    const monthDiff =
      today.getMonth() - birthDate.getMonth();

    if (
      monthDiff < 0 ||
      (
        monthDiff === 0 &&
        today.getDate() < birthDate.getDate()
      )
    ) {
      computedAge--;
    }

    return computedAge >= 0
      ? computedAge.toString()
      : '0';
  };

  // Validation helper
  const validateField = (name, value) => {
    let error = '';

    const phoneRegex = /^[6-9]\d{9}$/;
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    const aadhaarRegex = /^\d{12}$/;
    const postalRegex = /^\d{6}$/;

    switch (name) {

      case 'positionJoiningFor':
        if (!value.trim()) {
          error = 'Position is required';
        }
        break;

      case 'fullName':
        if (!value.trim()) {
          error = 'Full Name is required';
        }
        break;

      case 'dob':
        if (!value) {
          error = 'Date of Birth is required';
        }
        break;

      case 'emailId':
        if (!value.trim()) {
          error = 'Email ID is required';
        } else if (!emailRegex.test(value)) {
          error = 'Enter a valid email address';
        }
        break;

      case 'aadhaarNo':
        if (!value.trim()) {
          error = 'Aadhaar Number is required';
        } else if (!aadhaarRegex.test(value)) {
          error = 'Aadhaar Number must be exactly 12 digits';
        }
        break;

      case 'mobileNo':
        if (!value.trim()) {
          error = 'Mobile Number is required';
        } else if (!phoneRegex.test(value)) {
          error = 'Enter a valid 10-digit mobile number';
        }
        break;

      case 'whatsappNo':
        if (!value.trim()) {
          error = 'WhatsApp Number is required';
        } else if (!phoneRegex.test(value)) {
          error = 'Enter a valid 10-digit WhatsApp number';
        }
        break;

      case 'emergencyNo1':
        if (!value.trim()) {
          error = 'Emergency Contact 1 is required';
        } else if (!phoneRegex.test(value)) {
          error = 'Enter a valid 10-digit number';
        }
        break;

      case 'emergencyNo2':
        if (!value.trim()) {
          error = 'Emergency Contact 2 is required';
        } else if (!phoneRegex.test(value)) {
          error = 'Enter a valid 10-digit number';
        }
        break;

      case 'emergencyRelativeName1':
        if (!value.trim()) {
          error = 'Relative Name is required';
        }
        break;

      case 'emergencyRelation1':
        if (!value.trim()) {
          error = 'Relation is required';
        }
        break;

      case 'emergencyRelativeName2':
        if (!value.trim()) {
          error = 'Relative Name is required';
        }
        break;

      case 'emergencyRelation2':
        if (!value.trim()) {
          error = 'Relation is required';
        }
        break;

      case 'presentAddress':
        if (!value.trim()) {
          error = 'Current address is required';
        }
        break;

      case 'permanentAddress':
        if (!value.trim()) {
          error = 'Permanent address is required';
        }
        break;

      case 'postalCode':
        if (!value.trim()) {
          error = 'Postal Code is required';
        } else if (!postalRegex.test(value)) {
          error = 'Postal Code must be exactly 6 digits';
        }
        break;

      case 'declarationName':
        if (!value.trim()) {
          error = 'Declaration Name is required';
        }
        break;

      default:
        break;
    }

    return error;
  };

  // Standard input handler with live validation
  const handleChange = (e) => {
    const {
      name,
      value,
      type,
      checked
    } = e.target;

    if (
      type === 'checkbox' &&
      name === 'sameAsCurrentAddress'
    ) {
      setFormData((prev) => ({
        ...prev,
        sameAsCurrentAddress: checked,
        permanentAddress: checked
          ? prev.presentAddress
          : ''
      }));

      if (checked) {
        setErrors((prev) => ({
          ...prev,
          permanentAddress: null
        }));
      }

      return;
    }

    setFormData((prev) => {
      const updated = {
        ...prev,
        [name]: value
      };

      if (name === 'dob') {
        updated.age = calculateAge(value);
      }

      if (
        name === 'presentAddress' &&
        prev.sameAsCurrentAddress
      ) {
        updated.permanentAddress = value;
      }

      return updated;
    });

    const fieldError = validateField(name, value);

    setErrors((prev) => ({
      ...prev,
      [name]: fieldError || null
    }));
  };

  // Photo upload
  const handlePhotoUpload = (e) => {
    const file = e.target.files[0];

    if (!file) return;

    const allowedTypes = [
      'image/jpeg',
      'image/png',
      'image/jpg',
      'image/webp'
    ];

    if (!allowedTypes.includes(file.type)) {
      setErrors((prev) => ({
        ...prev,
        photo: 'Please upload a valid image file'
      }));
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      setErrors((prev) => ({
        ...prev,
        photo: 'Image size must be less than 5 MB'
      }));
      return;
    }

    setPhotoPreview(URL.createObjectURL(file));
    setPhotoFile(file);

    setErrors((prev) => ({
      ...prev,
      photo: null
    }));
  };

  // File upload
  const handleFileUpload = (docKey, file) => {
    if (!file) return;

    const allowedTypes = [
      'application/pdf',
      'image/jpeg',
      'image/png',
      'image/jpg',
      'image/webp'
    ];

    if (!allowedTypes.includes(file.type)) {
      setErrors((prev) => ({
        ...prev,
        [`doc_${docKey}`]:
          'Only PDF, JPG, JPEG, PNG or WEBP files are allowed'
      }));
      return;
    }

    if (file.size > 10 * 1024 * 1024) {
      setErrors((prev) => ({
        ...prev,
        [`doc_${docKey}`]:
          'File size must be less than 10 MB'
      }));
      return;
    }

    setFormData((prev) => ({
      ...prev,
      documents: {
        ...prev.documents,
        [docKey]: file
      }
    }));

    setErrors((prev) => ({
      ...prev,
      [`doc_${docKey}`]: null
    }));
  };

  // Bank Details Handler
  const handleBankChange = (e) => {
    const {
      name,
      value
    } = e.target;

    let cleanValue = value;

    if (name === 'accountNo') {
      cleanValue = value
        .replace(/\D/g, '')
        .slice(0, 18);
    }

    if (name === 'ifscCode') {
      cleanValue = value
        .replace(/\s/g, '')
        .toUpperCase()
        .slice(0, 11);
    }

    setFormData((prev) => ({
      ...prev,
      bankDetails: {
        ...prev.bankDetails,
        [name]: cleanValue
      }
    }));

    let error = '';

    if (!cleanValue.trim()) {
      error = `${name === 'bankName'
        ? 'Bank Name'
        : name === 'accountNo'
          ? 'Account Number'
          : name === 'ifscCode'
            ? 'IFSC Code'
            : 'Branch Name'
        } is required`;
    }

    if (
      name === 'accountNo' &&
      cleanValue &&
      (cleanValue.length < 9 || cleanValue.length > 18)
    ) {
      error = 'Account Number must be between 9 and 18 digits';
    }

    if (
      name === 'ifscCode' &&
      cleanValue &&
      !/^[A-Z]{4}0[A-Z0-9]{6}$/.test(cleanValue)
    ) {
      error = 'Enter a valid IFSC Code';
    }

    setErrors((prev) => ({
      ...prev,
      [`bank_${name}`]: error || null
    }));
  };

  // Reference
  const handleReferenceChange = (e) => {
    const {
      name,
      value
    } = e.target;

    let cleanValue = value;

    if (name === 'mobileNo') {
      cleanValue = value
        .replace(/\D/g, '')
        .slice(0, 10);
    }

    setFormData((prev) => ({
      ...prev,
      reference: {
        ...prev.reference,
        [name]: cleanValue
      }
    }));

    if (name === 'mobileNo') {
      const phoneRegex = /^[6-9]\d{9}$/;

      setErrors((prev) => ({
        ...prev,
        referenceMobileNo:
          cleanValue && !phoneRegex.test(cleanValue)
            ? 'Enter a valid 10-digit mobile number'
            : null
      }));
    }
  };

  // Language handler
  const handleLanguageChange = (
    index,
    field,
    value
  ) => {
    const updatedLangs = [
      ...formData.languages
    ];

    updatedLangs[index] = {
      ...updatedLangs[index],
      [field]: value
    };

    setFormData((prev) => ({
      ...prev,
      languages: updatedLangs
    }));
  };

  const addLanguage = () => {
    setFormData((prev) => ({
      ...prev,
      languages: [
        ...prev.languages,
        {
          language: 'Hindi',
          otherLang: '',
          fluency: 'Intermediate'
        }
      ]
    }));
  };

  const removeLanguage = (index) => {
    if (formData.languages.length <= 1) return;

    setFormData((prev) => ({
      ...prev,
      languages: prev.languages.filter(
        (_, i) => i !== index
      )
    }));
  };

  // Table handler
  const handleTableChange = (
    listName,
    index,
    field,
    value
  ) => {
    const updatedList = [
      ...formData[listName]
    ];

    updatedList[index] = {
      ...updatedList[index],
      [field]: value
    };

    setFormData((prev) => ({
      ...prev,
      [listName]: updatedList
    }));
  };

  const addRow = (
    listName,
    emptyObj
  ) => {
    setFormData((prev) => ({
      ...prev,
      [listName]: [
        ...prev[listName],
        emptyObj
      ]
    }));
  };

  const removeRow = (
    listName,
    index
  ) => {
    if (formData[listName].length <= 1) {
      return;
    }

    const updatedList =
      formData[listName].filter(
        (_, i) => i !== index
      );

    setFormData((prev) => ({
      ...prev,
      [listName]: updatedList
    }));
  };

  // Fresher checkbox
  const handleFresherChange = (e) => {
    const checked = e.target.checked;

    setFormData((prev) => ({
      ...prev,
      isFresher: checked,
      experienceDetails: checked
        ? []
        : prev.experienceDetails.length
          ? prev.experienceDetails
          : [
              {
                companyName: '',
                companyAddress: '',
                designation: '',
                periodFrom: '',
                periodTo: '',
                ctc: '',
                reasonLeaving: ''
              }
            ]
    }));

    setErrors((prev) => {
      const updated = {
        ...prev
      };

      delete updated.experience;

      return updated;
    });
  };

  // Full validation
  const validateForm = () => {
    const errs = {};

    // Position
    if (!formData.positionJoiningFor) {
      errs.positionJoiningFor =
        'Position is required';
    }

    // Interview Date
    if (!formData.applicationDate) {
      errs.applicationDate =
        'Interview Date is required';
    }

    // Full Name
    if (!formData.fullName.trim()) {
      errs.fullName =
        'Full Name is required';
    }

    // DOB
    if (!formData.dob) {
      errs.dob =
        'Date of Birth is required';
    }

    // Email
    const emailRegex =
      /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if (!formData.emailId.trim()) {
      errs.emailId =
        'Email ID is required';
    } else if (
      !emailRegex.test(formData.emailId)
    ) {
      errs.emailId =
        'Enter a valid email address';
    }

    // Aadhaar
    const aadhaarRegex =
      /^\d{12}$/;

    if (!formData.aadhaarNo.trim()) {
      errs.aadhaarNo =
        'Aadhaar Number is required';
    } else if (
      !aadhaarRegex.test(
        formData.aadhaarNo
      )
    ) {
      errs.aadhaarNo =
        'Aadhaar Number must be exactly 12 digits';
    }

    // Phone
    const phoneRegex =
      /^[6-9]\d{9}$/;

    if (
      !formData.mobileNo.trim() ||
      !phoneRegex.test(
        formData.mobileNo
      )
    ) {
      errs.mobileNo =
        'Enter valid 10-digit mobile number';
    }

    if (
      !formData.whatsappNo.trim() ||
      !phoneRegex.test(
        formData.whatsappNo
      )
    ) {
      errs.whatsappNo =
        'Enter valid 10-digit WhatsApp number';
    }

    // Emergency 1
    if (
      !formData.emergencyRelativeName1.trim()
    ) {
      errs.emergencyRelativeName1 =
        'Relative Name is required';
    }

    if (
      !formData.emergencyRelation1.trim()
    ) {
      errs.emergencyRelation1 =
        'Relation is required';
    }

    if (
      !formData.emergencyNo1.trim() ||
      !phoneRegex.test(
        formData.emergencyNo1
      )
    ) {
      errs.emergencyNo1 =
        'Enter valid 10-digit emergency contact';
    }

    // Emergency 2
    if (
      !formData.emergencyRelativeName2.trim()
    ) {
      errs.emergencyRelativeName2 =
        'Relative Name is required';
    }

    if (
      !formData.emergencyRelation2.trim()
    ) {
      errs.emergencyRelation2 =
        'Relation is required';
    }

    if (
      !formData.emergencyNo2.trim() ||
      !phoneRegex.test(
        formData.emergencyNo2
      )
    ) {
      errs.emergencyNo2 =
        'Enter valid 10-digit emergency contact';
    }

    // Address
    if (!formData.presentAddress.trim()) {
      errs.presentAddress =
        'Current address is required';
    }

    if (!formData.permanentAddress.trim()) {
      errs.permanentAddress =
        'Permanent address is required';
    }

    // Postal
    const postalRegex =
      /^\d{6}$/;

    if (
      !formData.postalCode.trim() ||
      !postalRegex.test(
        formData.postalCode
      )
    ) {
      errs.postalCode =
        'Postal Code must be exactly 6 digits';
    }

    // Education
    formData.educationHistory.forEach(
      (item, idx) => {
        if (item.isDefault) {

          if (!item.schoolCollege.trim()) {
            errs[`edu_school_${idx}`] =
              'School/College name required';
          }

          if (!item.yearPassing.trim()) {
            errs[`edu_year_${idx}`] =
              'Year required';
          }

          if (!item.marksCGPA.trim()) {
            errs[`edu_marks_${idx}`] =
              'Marks/CGPA required';
          }
        }
      }
    );

    // Experience
    if (!formData.isFresher) {
      if (
        !formData.experienceDetails.length
      ) {
        errs.experience =
          'Please add experience details or select "I am Fresher"';
      }
    }

    // BANK DETAILS - ALL REQUIRED

    // Bank Name
    if (!formData.bankDetails.bankName.trim()) {
      errs.bank_bankName =
        'Bank Name is required';
    }

    // Account Number
    const accountNo =
      formData.bankDetails.accountNo.trim();

    if (!accountNo) {
      errs.bank_accountNo =
        'Account Number is required';
    } else if (
      !/^\d{9,18}$/.test(accountNo)
    ) {
      errs.bank_accountNo =
        'Account Number must be between 9 and 18 digits';
    }

    // IFSC
    const ifscCode =
      formData.bankDetails.ifscCode.trim().toUpperCase();

    if (!ifscCode) {
      errs.bank_ifscCode =
        'IFSC Code is required';
    } else if (
      !/^[A-Z]{4}0[A-Z0-9]{6}$/.test(ifscCode)
    ) {
      errs.bank_ifscCode =
        'Enter a valid IFSC Code';
    }

    // Branch
    if (!formData.bankDetails.branchName.trim()) {
      errs.bank_branchName =
        'Branch Name is required';
    }

    // CV
    if (!formData.documents.updatedCv) {
      errs.doc_updatedCv =
        'Updated CV / Resume is mandatory';
    }

    // Aadhaar Front
    if (!formData.documents.aadhaarFront) {
      errs.doc_aadhaarFront =
        'Aadhaar Front is required';
    }

    // Aadhaar Back
    if (!formData.documents.aadhaarBack) {
      errs.doc_aadhaarBack =
        'Aadhaar Back is required';
    }

    // Declaration
    if (!formData.declarationName.trim()) {
      errs.declarationName =
        'Declaration Name is required';
    }

    setErrors(errs);

    return Object.keys(errs).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const isValid = validateForm();

    if (isValid) {
      setIsSubmitting(true);
      setSubmitError(null);

      try {
        const payload = new FormData();

        const scalarFields = [
          'positionJoiningFor', 'applicationDate', 'fullName', 'fatherHusbandName',
          'fatherHusbandOccupation', 'dob', 'age', 'gender', 'genderOther',
          'emailId', 'religion', 'religionOther', 'nationality', 'nationalityOther',
          'maritalStatus', 'maritalOther', 'aadhaarNo', 'mobileNo', 'whatsappNo',
          'emergencyNo1', 'emergencyRelativeName1', 'emergencyRelation1',
          'emergencyNo2', 'emergencyRelativeName2', 'emergencyRelation2',
          'presentAddress', 'permanentAddress', 'sameAsCurrentAddress',
          'district', 'state', 'postalCode', 'isFresher', 'offeredSalary',
          'joiningDate', 'declarationName', 'declarationDate', 'signature'
        ];

        scalarFields.forEach((key) => {
          if (formData[key] !== undefined && formData[key] !== null) {
            payload.append(key, formData[key]);
          }
        });

        // Nested JSON arrays & objects
        payload.append('languages', JSON.stringify(formData.languages || []));
        payload.append('familyDetails', JSON.stringify(formData.familyDetails || []));
        payload.append('educationHistory', JSON.stringify(formData.educationHistory || []));
        payload.append('experienceDetails', JSON.stringify(formData.experienceDetails || []));
        payload.append('bankDetails', JSON.stringify(formData.bankDetails || {}));
        payload.append('reference', JSON.stringify(formData.reference || {}));

        // Photograph file
        if (photoFile) {
          payload.append('photo', photoFile);
        }

        // Uploaded document files
        if (formData.documents) {
          Object.entries(formData.documents).forEach(([docKey, docVal]) => {
            if (docVal && (docVal instanceof File || docVal instanceof Blob)) {
              payload.append(docKey, docVal);
            }
          });
        }

        const res = await fetch(`${API_BASE_URL}/leads`, {
          method: 'POST',
          body: payload
        });

        const data = await res.json();

        if (!res.ok) {
          throw new Error(data.message || 'Failed to submit application');
        }

        setSubmitted(true);
        window.scrollTo({
          top: 0,
          behavior: 'smooth'
        });
      } catch (err) {
        console.error('Submission error:', err);
        setSubmitError(err.message || 'Error submitting application. Please try again.');
        window.scrollTo({
          top: 0,
          behavior: 'smooth'
        });
      } finally {
        setIsSubmitting(false);
      }
    } else {
      const firstErrorKey =
        Object.keys(
          validateAndGetErrors()
        )[0];

      if (firstErrorKey) {
        const fieldName = firstErrorKey.startsWith('bank_')
          ? firstErrorKey.replace('bank_', '')
          : firstErrorKey;

        const el = document.getElementsByName(fieldName)[0];

        if (el) {
          el.scrollIntoView({
            behavior: 'smooth',
            block: 'center'
          });

          el.focus?.();
        }
      }
    }
  };

  // Used only for locating first error after validation
  const validateAndGetErrors = () => {
    const errs = {};

    if (!formData.positionJoiningFor) {
      errs.positionJoiningFor = true;
    }

    if (!formData.applicationDate) {
      errs.applicationDate = true;
    }

    if (!formData.fullName.trim()) {
      errs.fullName = true;
    }

    if (!formData.dob) {
      errs.dob = true;
    }

    if (!formData.emailId.trim()) {
      errs.emailId = true;
    }

    if (!formData.aadhaarNo.trim()) {
      errs.aadhaarNo = true;
    }

    if (!formData.mobileNo.trim()) {
      errs.mobileNo = true;
    }

    if (!formData.whatsappNo.trim()) {
      errs.whatsappNo = true;
    }

    if (!formData.emergencyRelativeName1.trim()) {
      errs.emergencyRelativeName1 = true;
    }

    if (!formData.emergencyRelation1.trim()) {
      errs.emergencyRelation1 = true;
    }

    if (!formData.emergencyNo1.trim()) {
      errs.emergencyNo1 = true;
    }

    if (!formData.emergencyRelativeName2.trim()) {
      errs.emergencyRelativeName2 = true;
    }

    if (!formData.emergencyRelation2.trim()) {
      errs.emergencyRelation2 = true;
    }

    if (!formData.emergencyNo2.trim()) {
      errs.emergencyNo2 = true;
    }

    if (!formData.presentAddress.trim()) {
      errs.presentAddress = true;
    }

    if (!formData.permanentAddress.trim()) {
      errs.permanentAddress = true;
    }

    if (!formData.postalCode.trim()) {
      errs.postalCode = true;
    }

    // Education
    formData.educationHistory.forEach(
      (item, idx) => {
        if (item.isDefault) {
          if (!item.schoolCollege.trim()) {
            errs[`edu_school_${idx}`] = true;
          }

          if (!item.yearPassing.trim()) {
            errs[`edu_year_${idx}`] = true;
          }

          if (!item.marksCGPA.trim()) {
            errs[`edu_marks_${idx}`] = true;
          }
        }
      }
    );

    // Experience
    if (
      !formData.isFresher &&
      !formData.experienceDetails.length
    ) {
      errs.experience = true;
    }

    // Bank Details
    if (!formData.bankDetails.bankName.trim()) {
      errs.bank_bankName = true;
    }

    if (
      !formData.bankDetails.accountNo.trim()
    ) {
      errs.bank_accountNo = true;
    } else if (
      !/^\d{9,18}$/.test(
        formData.bankDetails.accountNo
      )
    ) {
      errs.bank_accountNo = true;
    }

    if (
      !formData.bankDetails.ifscCode.trim()
    ) {
      errs.bank_ifscCode = true;
    } else if (
      !/^[A-Z]{4}0[A-Z0-9]{6}$/.test(
        formData.bankDetails.ifscCode
      )
    ) {
      errs.bank_ifscCode = true;
    }

    if (
      !formData.bankDetails.branchName.trim()
    ) {
      errs.bank_branchName = true;
    }

    if (!formData.documents.updatedCv) {
      errs.doc_updatedCv = true;
    }

    if (!formData.documents.aadhaarFront) {
      errs.doc_aadhaarFront = true;
    }

    if (!formData.documents.aadhaarBack) {
      errs.doc_aadhaarBack = true;
    }

    if (!formData.declarationName.trim()) {
      errs.declarationName = true;
    }

    return errs;
  };

  const inputStyle =
    "w-full p-2.5 bg-white border border-slate-300 rounded-md text-xs sm:text-sm text-slate-800 focus:ring-2 focus:ring-red-500 focus:border-red-500 outline-none transition-all placeholder:text-slate-400 font-medium";

  const tableInputStyle =
    "w-full min-w-[150px] p-2.5 border rounded text-xs sm:text-sm outline-none focus:border-red-500 focus:ring-1 focus:ring-red-300";

  const errorMessage = (message) => {
    if (!message) return null;

    return (
      <p className="text-xs text-red-500 mt-1 flex items-center gap-1">
        <AlertCircle className="w-3 h-3" />
        {message}
      </p>
    );
  };

  return (
    <div className="min-h-screen bg-slate-100 py-6 sm:py-10 px-3 sm:px-6 lg:px-8 font-sans text-slate-800">

      <div className="max-w-5xl mx-auto bg-white rounded-xl shadow-xl overflow-hidden border border-slate-200">

        {/* Header Branding Section */}
        <div className="bg-gradient-to-r from-red-700 via-red-600 to-red-800 text-white p-6 sm:p-8 relative">

          <img
            src={VisaForNationLogo}
            alt="Visa For Nation Logo"
            className="absolute left-6 sm:left-8 top-6 sm:top-8 h-16 sm:h-20 w-auto object-contain bg-white/95 p-1.5 rounded-lg shadow-md"
          />

          <div className="flex justify-center items-center text-center min-h-[120px] sm:min-h-[130px] px-20 sm:px-28">

            <div>

              <span className="inline-block bg-white text-red-700 font-black px-3 py-0.5 rounded-full text-[10px] sm:text-xs tracking-wider uppercase mb-1 shadow">
                Official Employment Application
              </span>

              <h1 className="text-2xl sm:text-3xl md:text-4xl font-extrabold tracking-tight">
                VISA FOR NATION PVT. LTD.
              </h1>

              <p className="text-red-100 text-xs sm:text-sm uppercase font-semibold tracking-wide mt-0.5">
                Application Form for Employment
              </p>

              <p className="text-[11px] text-red-200 italic mt-0.5">
                
              </p>

            </div>

          </div>

        </div>

        {submitted ? (

          <div className="p-10 text-center space-y-4">

            <CheckCircle2 className="w-20 h-20 text-emerald-500 mx-auto" />

            <h2 className="text-2xl font-bold text-slate-800">
              Application Submitted Successfully!
            </h2>

            <p className="text-slate-600 max-w-md mx-auto text-sm">
              Thank you for applying to Visa For Nation. Our recruitment team will review your application and documents.
            </p>

            <button
              onClick={() => {
                setSubmitted(false);
                setPhotoPreview(null);
                setPhotoFile(null);
                setSubmitError(null);
              }}
              className="mt-4 bg-red-600 hover:bg-red-700 text-white font-bold py-2.5 px-6 rounded-lg transition shadow-md"
            >
              Fill Another Form
            </button>

          </div>

        ) : (

          <form
            onSubmit={handleSubmit}
            className="p-4 sm:p-8 md:p-10 space-y-8"
          >

            {submitError && (
              <div className="bg-red-50 border-l-4 border-red-500 p-4 rounded-md flex items-center justify-between text-red-700">
                <div className="flex items-center gap-2">
                  <AlertCircle className="w-5 h-5 flex-shrink-0" />
                  <span className="text-sm font-semibold">{submitError}</span>
                </div>
                <button
                  type="button"
                  onClick={() => setSubmitError(null)}
                  className="text-xs bg-red-100 hover:bg-red-200 text-red-800 px-2 py-1 rounded"
                >
                  Dismiss
                </button>
              </div>
            )}


            {/* Position & Interview Date */}

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 bg-slate-50 p-5 rounded-lg border border-slate-200">

              <div className="md:col-span-2 space-y-4">

                {/* Position Dropdown */}

                <div>

                  <label className="block text-xs font-bold uppercase text-slate-700 mb-1">
                    Position Joining For <span className="text-red-500">*</span>
                  </label>

                  <select
                    name="positionJoiningFor"
                    value={formData.positionJoiningFor}
                    onChange={handleChange}
                    className={`${inputStyle} ${
                      errors.positionJoiningFor
                        ? 'border-red-500 bg-red-50'
                        : ''
                    }`}
                  >

                    <option value="">
                      Select Position
                    </option>

                    {POSITION_OPTIONS.map(
                      (position) => (
                        <option
                          key={position}
                          value={position}
                        >
                          {position}
                        </option>
                      )
                    )}

                  </select>

                  {errorMessage(
                    errors.positionJoiningFor
                  )}

                </div>

                {/* Interview Date - USER CAN CHANGE */}

                <div>

                  <label className="block text-xs font-bold uppercase text-slate-700 mb-1">
                    Interview Date <span className="text-red-500">*</span>
                  </label>

                  <input
                    type="date"
                    name="applicationDate"
                    value={formData.applicationDate}
                    onChange={handleChange}
                    className={`${inputStyle} ${
                      errors.applicationDate
                        ? 'border-red-500 bg-red-50'
                        : ''
                    }`}
                  />

                  {errorMessage(
                    errors.applicationDate
                  )}

                </div>

              </div>

              {/* Joining Date */}

              <div>

                <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                  Joining Date
                </label>

                <input
                  type="date"
                  name="joiningDate"
                  value={formData.joiningDate}
                  onChange={handleChange}
                  className={inputStyle}
                />

              </div>

            </div>

            {/* SECTION 1 */}

            <section className="space-y-4">

              <div className="border-l-4 border-red-600 pl-3 flex items-center gap-2">

                <User className="w-5 h-5 text-red-600" />

                <h2 className="text-base font-bold uppercase text-slate-800 tracking-wider">
                  1. Personal Information
                </h2>

              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">

                {/* Full Name */}

                <div>

                  <label className="block text-xs font-bold text-slate-600 uppercase mb-1">
                    Full Name *
                  </label>

                  <input
                    type="text"
                    name="fullName"
                    value={formData.fullName}
                    onChange={handleChange}
                    placeholder="Full Name"
                    className={`${inputStyle} ${
                      errors.fullName
                        ? 'border-red-500 bg-red-50'
                        : ''
                    }`}
                  />

                  {errorMessage(errors.fullName)}

                </div>

                {/* Father/Husband */}

                <div>

                  <label className="block text-xs font-bold text-slate-600 uppercase mb-1">
                    Father / Husband Name
                  </label>

                  <input
                    type="text"
                    name="fatherHusbandName"
                    value={formData.fatherHusbandName}
                    onChange={handleChange}
                    placeholder="Father or Husband Name"
                    className={inputStyle}
                  />

                </div>

                {/* Occupation */}

                <div>

                  <label className="block text-xs font-bold text-slate-600 uppercase mb-1">
                    Father / Husband Occupation
                  </label>

                  <input
                    type="text"
                    name="fatherHusbandOccupation"
                    value={formData.fatherHusbandOccupation}
                    onChange={handleChange}
                    placeholder="Occupation"
                    className={inputStyle}
                  />

                </div>

                {/* DOB */}

                <div>

                  <label className="block text-xs font-bold text-slate-600 uppercase mb-1">
                    Date of Birth *
                  </label>

                  <input
                    type="date"
                    name="dob"
                    value={formData.dob}
                    onChange={handleChange}
                    className={`${inputStyle} ${
                      errors.dob
                        ? 'border-red-500 bg-red-50'
                        : ''
                    }`}
                  />

                  {errorMessage(errors.dob)}

                </div>

                {/* Age */}

                <div>

                  <label className="block text-xs font-bold text-slate-600 uppercase mb-1">
                    Age 
                  </label>

                  <input
                    type="text"
                    name="age"
                    value={formData.age}
                    readOnly
                    placeholder="Calculated automatically"
                    className={`${inputStyle} bg-slate-100 text-slate-600 font-bold cursor-not-allowed`}
                  />

                </div>

                {/* Gender */}

                <div>

                  <label className="block text-xs font-bold text-slate-600 uppercase mb-1">
                    Gender
                  </label>

                  <select
                    name="gender"
                    value={formData.gender}
                    onChange={handleChange}
                    className={inputStyle}
                  >

                    <option value="Male">
                      Male
                    </option>

                    <option value="Female">
                      Female
                    </option>

                    <option value="Other">
                      Other
                    </option>

                  </select>

                  {formData.gender === 'Other' && (

                    <input
                      type="text"
                      name="genderOther"
                      value={formData.genderOther}
                      onChange={handleChange}
                      placeholder="Specify Gender"
                      className={`${inputStyle} mt-2`}
                    />

                  )}

                </div>

                {/* Email */}

                <div className="md:col-span-2">

                  <label className="block text-xs font-bold text-slate-600 uppercase mb-1">
                    Email ID *
                  </label>

                  <input
                    type="email"
                    name="emailId"
                    value={formData.emailId}
                    onChange={handleChange}
                    placeholder="e.g. name@example.com"
                    className={`${inputStyle} ${
                      errors.emailId
                        ? 'border-red-500 bg-red-50'
                        : ''
                    }`}
                  />

                  {errorMessage(errors.emailId)}

                </div>

                {/* Aadhaar */}

                <div>

                  <label className="block text-xs font-bold text-slate-600 uppercase mb-1">
                    Aadhaar Number *
                  </label>

                  <input
                    type="text"
                    name="aadhaarNo"
                    maxLength={12}
                    inputMode="numeric"
                    value={formData.aadhaarNo}
                    onChange={(e) => {

                      const val =
                        e.target.value
                          .replace(/\D/g, '')
                          .slice(0, 12);

                      handleChange({
                        target: {
                          name: 'aadhaarNo',
                          value: val
                        }
                      });

                    }}
                    placeholder="Enter 12-digit Aadhaar Number"
                    className={`${inputStyle} ${
                      errors.aadhaarNo
                        ? 'border-red-500 bg-red-50'
                        : ''
                    }`}
                  />

                  {errorMessage(errors.aadhaarNo)}

                </div>

                {/* Religion */}

                <div>

                  <label className="block text-xs font-bold text-slate-600 uppercase mb-1">
                    Religion
                  </label>

                  <select
                    name="religion"
                    value={formData.religion}
                    onChange={handleChange}
                    className={inputStyle}
                  >

                    <option value="Hindu">
                      Hindu
                    </option>

                    <option value="Muslim">
                      Muslim
                    </option>

                    <option value="Sikh">
                      Sikh
                    </option>

                    <option value="Christian">
                      Christian
                    </option>

                    <option value="Other">
                      Other
                    </option>

                  </select>

                  {formData.religion === 'Other' && (

                    <input
                      type="text"
                      name="religionOther"
                      value={formData.religionOther}
                      onChange={handleChange}
                      placeholder="Type Religion Name"
                      className={`${inputStyle} mt-2`}
                    />

                  )}

                </div>

                {/* Nationality */}

                <div>

                  <label className="block text-xs font-bold text-slate-600 uppercase mb-1">
                    Nationality
                  </label>

                  <select
                    name="nationality"
                    value={formData.nationality}
                    onChange={handleChange}
                    className={inputStyle}
                  >

                    <option value="Indian">
                      Indian
                    </option>

                    <option value="Nepal">
                      Nepal
                    </option>

                    <option value="Other">
                      Other
                    </option>

                  </select>

                  {formData.nationality === 'Other' && (

                    <input
                      type="text"
                      name="nationalityOther"
                      value={formData.nationalityOther}
                      onChange={handleChange}
                      placeholder="Type Nationality"
                      className={`${inputStyle} mt-2`}
                    />

                  )}

                </div>

                {/* Marital */}

                <div>

                  <label className="block text-xs font-bold text-slate-600 uppercase mb-1">
                    Marital Status
                  </label>

                  <select
                    name="maritalStatus"
                    value={formData.maritalStatus}
                    onChange={handleChange}
                    className={inputStyle}
                  >

                    <option value="Single">
                      Single
                    </option>

                    <option value="Married">
                      Married
                    </option>

                    <option value="Divorced">
                      Divorced
                    </option>

                    <option value="Other">
                      Other
                    </option>

                  </select>

                  {formData.maritalStatus === 'Other' && (

                    <input
                      type="text"
                      name="maritalOther"
                      value={formData.maritalOther}
                      onChange={handleChange}
                      placeholder="Type Marital Status"
                      className={`${inputStyle} mt-2`}
                    />

                  )}

                </div>

                {/* Mobile */}

                <div>

                  <label className="block text-xs font-bold text-slate-600 uppercase mb-1">
                    Mobile No. *
                  </label>

                  <input
                    type="tel"
                    name="mobileNo"
                    maxLength={10}
                    inputMode="numeric"
                    value={formData.mobileNo}
                    onChange={(e) => {

                      const val =
                        e.target.value
                          .replace(/\D/g, '')
                          .slice(0, 10);

                      handleChange({
                        target: {
                          name: 'mobileNo',
                          value: val
                        }
                      });

                    }}
                    placeholder="10-digit Mobile Number"
                    className={`${inputStyle} ${
                      errors.mobileNo
                        ? 'border-red-500 bg-red-50'
                        : ''
                    }`}
                  />

                  {errorMessage(errors.mobileNo)}

                </div>

                {/* WhatsApp */}

                <div>

                  <label className="block text-xs font-bold text-slate-600 uppercase mb-1">
                    WhatsApp Number *
                  </label>

                  <input
                    type="tel"
                    name="whatsappNo"
                    maxLength={10}
                    inputMode="numeric"
                    value={formData.whatsappNo}
                    onChange={(e) => {

                      const val =
                        e.target.value
                          .replace(/\D/g, '')
                          .slice(0, 10);

                      handleChange({
                        target: {
                          name: 'whatsappNo',
                          value: val
                        }
                      });

                    }}
                    placeholder="10-digit WhatsApp Number"
                    className={`${inputStyle} ${
                      errors.whatsappNo
                        ? 'border-red-500 bg-red-50'
                        : ''
                    }`}
                  />

                  {errorMessage(errors.whatsappNo)}

                </div>

                {/* Emergency Contact 1 - Name */}

                <div>

                  <label className="block text-xs font-bold text-slate-600 uppercase mb-1">
                    Emergency Relative Name 1 *
                  </label>

                  <input
                    type="text"
                    name="emergencyRelativeName1"
                    value={formData.emergencyRelativeName1}
                    onChange={handleChange}
                    placeholder="Relative Full Name"
                    className={`${inputStyle} ${
                      errors.emergencyRelativeName1
                        ? 'border-red-500 bg-red-50'
                        : ''
                    }`}
                  />

                  {errorMessage(
                    errors.emergencyRelativeName1
                  )}

                </div>

                {/* Emergency Contact 1 - Relation */}

                <div>

                  <label className="block text-xs font-bold text-slate-600 uppercase mb-1">
                    Relation 1 *
                  </label>

                  <input
                    type="text"
                    name="emergencyRelation1"
                    value={formData.emergencyRelation1}
                    onChange={handleChange}
                    placeholder="e.g. Father, Mother, Brother"
                    className={`${inputStyle} ${
                      errors.emergencyRelation1
                        ? 'border-red-500 bg-red-50'
                        : ''
                    }`}
                  />

                  {errorMessage(
                    errors.emergencyRelation1
                  )}

                </div>

                {/* Emergency Contact 1 - Number */}

                <div>

                  <label className="block text-xs font-bold text-slate-600 uppercase mb-1">
                    Emergency Contact No. 1 *
                  </label>

                  <input
                    type="tel"
                    name="emergencyNo1"
                    maxLength={10}
                    inputMode="numeric"
                    value={formData.emergencyNo1}
                    onChange={(e) => {

                      const val =
                        e.target.value
                          .replace(/\D/g, '')
                          .slice(0, 10);

                      handleChange({
                        target: {
                          name: 'emergencyNo1',
                          value: val
                        }
                      });

                    }}
                    placeholder="10-digit Contact Number"
                    className={`${inputStyle} ${
                      errors.emergencyNo1
                        ? 'border-red-500 bg-red-50'
                        : ''
                    }`}
                  />

                  {errorMessage(
                    errors.emergencyNo1
                  )}

                </div>

                {/* Emergency Contact 2 - Name */}

                <div>

                  <label className="block text-xs font-bold text-slate-600 uppercase mb-1">
                    Emergency Relative Name 2 *
                  </label>

                  <input
                    type="text"
                    name="emergencyRelativeName2"
                    value={formData.emergencyRelativeName2}
                    onChange={handleChange}
                    placeholder="Relative Full Name"
                    className={`${inputStyle} ${
                      errors.emergencyRelativeName2
                        ? 'border-red-500 bg-red-50'
                        : ''
                    }`}
                  />

                  {errorMessage(
                    errors.emergencyRelativeName2
                  )}

                </div>

                {/* Emergency Contact 2 - Relation */}

                <div>

                  <label className="block text-xs font-bold text-slate-600 uppercase mb-1">
                    Relation 2 *
                  </label>

                  <input
                    type="text"
                    name="emergencyRelation2"
                    value={formData.emergencyRelation2}
                    onChange={handleChange}
                    placeholder="e.g. Father, Mother, Brother"
                    className={`${inputStyle} ${
                      errors.emergencyRelation2
                        ? 'border-red-500 bg-red-50'
                        : ''
                    }`}
                  />

                  {errorMessage(
                    errors.emergencyRelation2
                  )}

                </div>

                {/* Emergency Contact 2 - Number */}

                <div>

                  <label className="block text-xs font-bold text-slate-600 uppercase mb-1">
                    Emergency Contact No. 2 *
                  </label>

                  <input
                    type="tel"
                    name="emergencyNo2"
                    maxLength={10}
                    inputMode="numeric"
                    value={formData.emergencyNo2}
                    onChange={(e) => {

                      const val =
                        e.target.value
                          .replace(/\D/g, '')
                          .slice(0, 10);

                      handleChange({
                        target: {
                          name: 'emergencyNo2',
                          value: val
                        }
                      });

                    }}
                    placeholder="10-digit Contact Number"
                    className={`${inputStyle} ${
                      errors.emergencyNo2
                        ? 'border-red-500 bg-red-50'
                        : ''
                    }`}
                  />

                  {errorMessage(
                    errors.emergencyNo2
                  )}

                </div>

                {/* Current Address */}

                <div className="md:col-span-3">

                  <label className="block text-xs font-bold text-slate-600 uppercase mb-1">
                    Current Address *
                  </label>

                  <textarea
                    name="presentAddress"
                    rows="3"
                    value={formData.presentAddress}
                    onChange={handleChange}
                    placeholder="Full Current Address"
                    className={`${inputStyle} ${
                      errors.presentAddress
                        ? 'border-red-500 bg-red-50'
                        : ''
                    }`}
                  />

                  {errorMessage(
                    errors.presentAddress
                  )}

                </div>

                {/* Same Address */}

                <div className="md:col-span-3 flex items-center gap-2 py-1">

                  <input
                    type="checkbox"
                    id="sameAsCurrentAddress"
                    name="sameAsCurrentAddress"
                    checked={formData.sameAsCurrentAddress}
                    onChange={handleChange}
                    className="w-4 h-4 text-red-600 rounded border-slate-300 focus:ring-red-500 cursor-pointer"
                  />

                  <label
                    htmlFor="sameAsCurrentAddress"
                    className="text-xs font-bold text-slate-700 cursor-pointer select-none"
                  >
                    Permanent address same as current address
                  </label>

                </div>

                {/* Permanent Address */}

                <div className="md:col-span-3">

                  <label className="block text-xs font-bold text-slate-600 uppercase mb-1">
                    Permanent Address (as per National ID) *
                  </label>

                  <textarea
                    name="permanentAddress"
                    rows="3"
                    value={formData.permanentAddress}
                    onChange={handleChange}
                    disabled={formData.sameAsCurrentAddress}
                    placeholder="Full Permanent Address"
                    className={`${inputStyle} ${
                      formData.sameAsCurrentAddress
                        ? 'bg-slate-100 text-slate-500'
                        : ''
                    } ${
                      errors.permanentAddress
                        ? 'border-red-500 bg-red-50'
                        : ''
                    }`}
                  />

                  {errorMessage(
                    errors.permanentAddress
                  )}

                </div>

                {/* District */}

                <div>

                  <label className="block text-xs font-bold text-slate-600 uppercase mb-1">
                    District
                  </label>

                  <input
                    type="text"
                    name="district"
                    value={formData.district}
                    onChange={handleChange}
                    placeholder="District"
                    className={inputStyle}
                  />

                </div>

                {/* State */}

                <div>

                  <label className="block text-xs font-bold text-slate-600 uppercase mb-1">
                    State
                  </label>

                  <input
                    type="text"
                    name="state"
                    value={formData.state}
                    onChange={handleChange}
                    placeholder="State"
                    className={inputStyle}
                  />

                </div>

                {/* Postal Code */}

                <div>

                  <label className="block text-xs font-bold text-slate-600 uppercase mb-1">
                    Postal Code *
                  </label>

                  <input
                    type="text"
                    name="postalCode"
                    maxLength={6}
                    inputMode="numeric"
                    value={formData.postalCode}
                    onChange={(e) => {

                      const val =
                        e.target.value
                          .replace(/\D/g, '')
                          .slice(0, 6);

                      handleChange({
                        target: {
                          name: 'postalCode',
                          value: val
                        }
                      });

                    }}
                    placeholder="6-digit Postal Code"
                    className={`${inputStyle} ${
                      errors.postalCode
                        ? 'border-red-500 bg-red-50'
                        : ''
                    }`}
                  />

                  {errorMessage(
                    errors.postalCode
                  )}

                </div>

              </div>

            </section>

            {/* SECTION 2: LANGUAGES */}

            <section className="space-y-4">

              <div className="border-l-4 border-red-600 pl-3 flex items-center justify-between">

                <div className="flex items-center gap-2">

                  <Users className="w-5 h-5 text-red-600" />

                  <h2 className="text-base font-bold uppercase text-slate-800 tracking-wider">
                    2. Languages Known & Fluency Level
                  </h2>

                </div>

              </div>

              <div className="space-y-3 bg-slate-50 p-4 rounded-lg border border-slate-200">

                {formData.languages.map(
                  (item, idx) => (

                    <div
                      key={idx}
                      className="flex flex-col md:flex-row items-start md:items-center gap-3 bg-white p-3 rounded-md border border-slate-200 shadow-sm"
                    >

                      <div className="w-full md:w-1/3">

                        <label className="block text-[11px] font-bold text-slate-600 uppercase mb-1">
                          Language
                        </label>

                        <select
                          value={item.language}
                          onChange={(e) =>
                            handleLanguageChange(
                              idx,
                              'language',
                              e.target.value
                            )
                          }
                          className={inputStyle}
                        >

                          {MAIN_LANGUAGES.map(
                            (lang) => (
                              <option
                                key={lang}
                                value={lang}
                              >
                                {lang}
                              </option>
                            )
                          )}

                        </select>

                        {item.language === 'Other' && (

                          <input
                            type="text"
                            value={item.otherLang}
                            onChange={(e) =>
                              handleLanguageChange(
                                idx,
                                'otherLang',
                                e.target.value
                              )
                            }
                            placeholder="Type Language Name"
                            className={`${inputStyle} mt-1.5`}
                          />

                        )}

                      </div>

                      <div className="w-full md:w-1/2">

                        <label className="block text-[11px] font-bold text-slate-600 uppercase mb-1">
                          Fluency Level
                        </label>

                        <div className="flex flex-wrap items-center gap-4 pt-1">

                          {[
                            'Beginner',
                            'Intermediate',
                            'Advance'
                          ].map(
                            (level) => (

                              <label
                                key={level}
                                className="flex items-center gap-1.5 text-xs font-semibold text-slate-700 cursor-pointer"
                              >

                                <input
                                  type="radio"
                                  name={`fluency_${idx}`}
                                  value={level}
                                  checked={
                                    item.fluency === level
                                  }
                                  onChange={(e) =>
                                    handleLanguageChange(
                                      idx,
                                      'fluency',
                                      e.target.value
                                    )
                                  }
                                  className="w-4 h-4 text-red-600 focus:ring-red-500"
                                />

                                {level}

                              </label>

                            )
                          )}

                        </div>

                      </div>

                      {formData.languages.length > 1 && (

                        <div className="md:mt-4">

                          <button
                            type="button"
                            onClick={() =>
                              removeLanguage(idx)
                            }
                            className="text-red-500 hover:text-red-700 p-1 rounded"
                            title="Remove Language"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>

                        </div>

                      )}

                    </div>

                  )
                )}

                <button
                  type="button"
                  onClick={addLanguage}
                  className="flex items-center gap-1 text-xs font-semibold text-red-600 hover:text-red-800 transition pt-1"
                >
                  <Plus className="w-4 h-4" />
                  Add More Language
                </button>

              </div>

            </section>

            {/* SECTION 3: EDUCATION */}

            <section className="space-y-4">

              <div className="border-l-4 border-red-600 pl-3 flex items-center gap-2">

                <GraduationCap className="w-5 h-5 text-red-600" />

                <h2 className="text-base font-bold uppercase text-slate-800 tracking-wider">
                  3. Education History
                </h2>

              </div>

              <div className="overflow-x-auto border rounded-lg border-slate-200">

                <table className="w-full min-w-[900px] text-left text-sm">

                  <thead className="bg-slate-100 border-b text-xs font-bold text-slate-700 uppercase">

                    <tr>

                      <th className="p-3 w-36">
                        Examination *
                      </th>

                      <th className="p-3">
                        School / College / University *
                      </th>

                      <th className="p-3 w-28">
                        Passing Year *
                      </th>

                      <th className="p-3 w-28">
                        Marks / CGPA *
                      </th>

                      <th className="p-3">
                        Subjects
                      </th>

                      <th className="p-3 w-12 text-center">
                        Action
                      </th>

                    </tr>

                  </thead>

                  <tbody>

                    {formData.educationHistory.map(
                      (item, index) => (

                        <tr
                          key={index}
                          className="border-b last:border-0 hover:bg-slate-50"
                        >

                          <td className="p-2 font-bold text-slate-800">

                            {item.isDefault ? (

                              <span className="bg-red-50 text-red-700 px-2 py-1 rounded text-xs font-bold border border-red-200">
                                {item.examPassed}
                              </span>

                            ) : (

                              <input
                                type="text"
                                value={item.examPassed}
                                onChange={(e) =>
                                  handleTableChange(
                                    'educationHistory',
                                    index,
                                    'examPassed',
                                    e.target.value
                                  )
                                }
                                placeholder="Degree / Diploma"
                                className={tableInputStyle}
                              />

                            )}

                          </td>

                          <td className="p-2">

                            <input
                              type="text"
                              value={item.schoolCollege}
                              onChange={(e) =>
                                handleTableChange(
                                  'educationHistory',
                                  index,
                                  'schoolCollege',
                                  e.target.value
                                )
                              }
                              placeholder="School / College Name"
                              className={`${tableInputStyle} ${
                                errors[`edu_school_${index}`]
                                  ? 'border-red-500 bg-red-50'
                                  : ''
                              }`}
                            />

                          </td>

                          <td className="p-2">

                            <input
                              type="text"
                              maxLength={4}
                              inputMode="numeric"
                              value={item.yearPassing}
                              onChange={(e) => {

                                const value =
                                  e.target.value
                                    .replace(/\D/g, '')
                                    .slice(0, 4);

                                handleTableChange(
                                  'educationHistory',
                                  index,
                                  'yearPassing',
                                  value
                                );

                              }}
                              placeholder="YYYY"
                              className={`${tableInputStyle} ${
                                errors[`edu_year_${index}`]
                                  ? 'border-red-500 bg-red-50'
                                  : ''
                              }`}
                            />

                          </td>

                          <td className="p-2">

                            <input
                              type="text"
                              value={item.marksCGPA}
                              onChange={(e) =>
                                handleTableChange(
                                  'educationHistory',
                                  index,
                                  'marksCGPA',
                                  e.target.value
                                )
                              }
                              placeholder="e.g. 85%"
                              className={`${tableInputStyle} ${
                                errors[`edu_marks_${index}`]
                                  ? 'border-red-500 bg-red-50'
                                  : ''
                              }`}
                            />

                          </td>

                          <td className="p-2">

                            <input
                              type="text"
                              value={item.subjects}
                              onChange={(e) =>
                                handleTableChange(
                                  'educationHistory',
                                  index,
                                  'subjects',
                                  e.target.value
                                )
                              }
                              placeholder="Main Subjects"
                              className={tableInputStyle}
                            />

                          </td>

                          <td className="p-2 text-center">

                            {!item.isDefault && (

                              <button
                                type="button"
                                onClick={() =>
                                  removeRow(
                                    'educationHistory',
                                    index
                                  )
                                }
                                className="text-red-500 hover:text-red-700 p-1 rounded"
                              >
                                <Trash2 className="w-4 h-4" />
                              </button>

                            )}

                          </td>

                        </tr>

                      )
                    )}

                  </tbody>

                </table>

              </div>

              <button
                type="button"
                onClick={() =>
                  addRow(
                    'educationHistory',
                    {
                      examPassed: '',
                      schoolCollege: '',
                      yearPassing: '',
                      marksCGPA: '',
                      subjects: '',
                      isDefault: false
                    }
                  )
                }
                className="flex items-center gap-1 text-xs font-semibold text-red-600 hover:text-red-800 transition"
              >
                <Plus className="w-4 h-4" />
                Add More Education
              </button>

            </section>

            {/* SECTION 4: EXPERIENCE */}

            <section className="space-y-4">

              <div className="border-l-4 border-red-600 pl-3 flex items-center justify-between">

                <div className="flex items-center gap-2">

                  <Briefcase className="w-5 h-5 text-red-600" />

                  <h2 className="text-base font-bold uppercase text-slate-800 tracking-wider">
                    4. Experience
                  </h2>

                </div>

              </div>

              {/* Fresher Checkbox */}

              <div className="bg-slate-50 p-4 rounded-lg border border-slate-200">

                <label className="flex items-center gap-2 cursor-pointer">

                  <input
                    type="checkbox"
                    checked={formData.isFresher}
                    onChange={handleFresherChange}
                    className="w-4 h-4 text-red-600 rounded border-slate-300 focus:ring-red-500"
                  />

                  <span className="text-sm font-bold text-slate-700">
                    I am Fresher
                  </span>

                </label>

                <p className="text-[11px] text-slate-500 mt-1 ml-6">
                  Select this if you do not have any previous work experience.
                </p>

              </div>

              {!formData.isFresher && (

                <>

                  <div className="overflow-x-auto border rounded-lg border-slate-200">

                    <table className="w-full min-w-[1250px] text-left text-sm">

                      <thead className="bg-slate-100 border-b text-xs font-bold text-slate-700 uppercase">

                        <tr>

                          <th className="p-3 min-w-[220px]">
                            Company Name
                          </th>

                          <th className="p-3 min-w-[280px]">
                            Company Address
                          </th>

                          <th className="p-3 min-w-[180px]">
                            Designation
                          </th>

                          <th className="p-3 min-w-[150px]">
                            From Date
                          </th>

                          <th className="p-3 min-w-[150px]">
                            To Date
                          </th>

                          <th className="p-3 min-w-[150px]">
                            CTC
                          </th>

                          <th className="p-3 min-w-[230px]">
                            Reason for Leaving
                          </th>

                          <th className="p-3 w-12 text-center">
                            Action
                          </th>

                        </tr>

                      </thead>

                      <tbody>

                        {formData.experienceDetails.map(
                          (item, index) => (

                            <tr
                              key={index}
                              className="border-b last:border-0 hover:bg-slate-50"
                            >

                              <td className="p-2 align-top">

                                <input
                                  type="text"
                                  value={item.companyName}
                                  onChange={(e) =>
                                    handleTableChange(
                                      'experienceDetails',
                                      index,
                                      'companyName',
                                      e.target.value
                                    )
                                  }
                                  placeholder="Company Name"
                                  className={tableInputStyle}
                                />

                              </td>

                              <td className="p-2 align-top">

                                <textarea
                                  rows="3"
                                  value={item.companyAddress}
                                  onChange={(e) =>
                                    handleTableChange(
                                      'experienceDetails',
                                      index,
                                      'companyAddress',
                                      e.target.value
                                    )
                                  }
                                  placeholder="Complete Company Address"
                                  className={`${tableInputStyle} resize-y min-h-[72px]`}
                                />

                              </td>

                              <td className="p-2 align-top">

                                <input
                                  type="text"
                                  value={item.designation}
                                  onChange={(e) =>
                                    handleTableChange(
                                      'experienceDetails',
                                      index,
                                      'designation',
                                      e.target.value
                                    )
                                  }
                                  placeholder="Designation"
                                  className={tableInputStyle}
                                />

                              </td>

                              <td className="p-2 align-top">

                                <input
                                  type="date"
                                  value={item.periodFrom}
                                  onChange={(e) =>
                                    handleTableChange(
                                      'experienceDetails',
                                      index,
                                      'periodFrom',
                                      e.target.value
                                    )
                                  }
                                  className={tableInputStyle}
                                />

                              </td>

                              <td className="p-2 align-top">

                                <input
                                  type="date"
                                  value={item.periodTo}
                                  onChange={(e) =>
                                    handleTableChange(
                                      'experienceDetails',
                                      index,
                                      'periodTo',
                                      e.target.value
                                    )
                                  }
                                  className={tableInputStyle}
                                />

                              </td>

                              <td className="p-2 align-top">

                                <input
                                  type="text"
                                  value={item.ctc}
                                  onChange={(e) =>
                                    handleTableChange(
                                      'experienceDetails',
                                      index,
                                      'ctc',
                                      e.target.value
                                    )
                                  }
                                  placeholder="CTC Amount"
                                  className={tableInputStyle}
                                />

                              </td>

                              <td className="p-2 align-top">

                                <textarea
                                  rows="3"
                                  value={item.reasonLeaving}
                                  onChange={(e) =>
                                    handleTableChange(
                                      'experienceDetails',
                                      index,
                                      'reasonLeaving',
                                      e.target.value
                                    )
                                  }
                                  placeholder="Reason for leaving"
                                  className={`${tableInputStyle} resize-y min-h-[72px]`}
                                />

                              </td>

                              <td className="p-2 text-center align-top">

                                <button
                                  type="button"
                                  onClick={() =>
                                    removeRow(
                                      'experienceDetails',
                                      index
                                    )
                                  }
                                  className="text-red-500 hover:text-red-700 p-1 rounded"
                                >
                                  <Trash2 className="w-4 h-4" />
                                </button>

                              </td>

                            </tr>

                          )
                        )}

                      </tbody>

                    </table>

                  </div>

                  <button
                    type="button"
                    onClick={() =>
                      addRow(
                        'experienceDetails',
                        {
                          companyName: '',
                          companyAddress: '',
                          designation: '',
                          periodFrom: '',
                          periodTo: '',
                          ctc: '',
                          reasonLeaving: ''
                        }
                      )
                    }
                    className="flex items-center gap-1 text-xs font-semibold text-red-600 hover:text-red-800 transition"
                  >
                    <Plus className="w-4 h-4" />
                    Add Experience Row
                  </button>

                </>

              )}

            </section>

            {/* SECTION 5: BANK DETAILS */}

            <section className="space-y-4">

              <div className="border-l-4 border-red-600 pl-3 flex items-center gap-2">

                <Landmark className="w-5 h-5 text-red-600" />

                <h2 className="text-base font-bold uppercase text-slate-800 tracking-wider">
                  5. Bank Details
                </h2>

              </div>

              <div className="grid grid-cols-1 md:grid-cols-4 gap-4 bg-slate-50 p-4 rounded-lg border border-slate-200">

                {/* Bank Name */}

                <div>

                  <label className="block text-xs font-bold text-slate-600 uppercase mb-1">
                    Bank Name <span className="text-red-500">*</span>
                  </label>

                  <input
                    type="text"
                    name="bankName"
                    value={formData.bankDetails.bankName}
                    onChange={handleBankChange}
                    placeholder="e.g. HDFC Bank"
                    className={`${inputStyle} ${
                      errors.bank_bankName
                        ? 'border-red-500 bg-red-50'
                        : ''
                    }`}
                  />

                  {errorMessage(
                    errors.bank_bankName
                  )}

                </div>

                {/* Account Number */}

                <div>

                  <label className="block text-xs font-bold text-slate-600 uppercase mb-1">
                    Account Number <span className="text-red-500">*</span>
                  </label>

                  <input
                    type="text"
                    name="accountNo"
                    value={formData.bankDetails.accountNo}
                    onChange={handleBankChange}
                    placeholder="Account Number"
                    inputMode="numeric"
                    maxLength={18}
                    className={`${inputStyle} ${
                      errors.bank_accountNo
                        ? 'border-red-500 bg-red-50'
                        : ''
                    }`}
                  />

                  {errorMessage(
                    errors.bank_accountNo
                  )}

                </div>

                {/* IFSC */}

                <div>

                  <label className="block text-xs font-bold text-slate-600 uppercase mb-1">
                    IFSC Code <span className="text-red-500">*</span>
                  </label>

                  <input
                    type="text"
                    name="ifscCode"
                    value={formData.bankDetails.ifscCode}
                    onChange={handleBankChange}
                    placeholder="e.g. HDFC0001234"
                    maxLength={11}
                    className={`${inputStyle} ${
                      errors.bank_ifscCode
                        ? 'border-red-500 bg-red-50'
                        : ''
                    }`}
                  />

                  {errorMessage(
                    errors.bank_ifscCode
                  )}

                </div>

                {/* Branch */}

                <div>

                  <label className="block text-xs font-bold text-slate-600 uppercase mb-1">
                    Branch Name <span className="text-red-500">*</span>
                  </label>

                  <input
                    type="text"
                    name="branchName"
                    value={formData.bankDetails.branchName}
                    onChange={handleBankChange}
                    placeholder="Branch Name"
                    className={`${inputStyle} ${
                      errors.bank_branchName
                        ? 'border-red-500 bg-red-50'
                        : ''
                    }`}
                  />

                  {errorMessage(
                    errors.bank_branchName
                  )}

                </div>

              </div>

              <p className="text-[11px] text-slate-500">
                All bank details are mandatory and must match the applicant's bank account.
              </p>

            </section>

            {/* SECTION 6: REFERENCE */}

            <section className="space-y-4">

              <div className="border-l-4 border-red-600 pl-3 flex items-center gap-2">

                <Users className="w-5 h-5 text-red-600" />

                <h2 className="text-base font-bold uppercase text-slate-800 tracking-wider">
                  6. Employee Reference Details
                </h2>

              </div>

              <div className="grid grid-cols-1 md:grid-cols-4 gap-4 bg-slate-50 p-4 rounded-lg border border-slate-200">

                <div>

                  <label className="block text-xs font-bold text-slate-600 uppercase mb-1">
                    Reference Person Name
                  </label>

                  <input
                    type="text"
                    name="name"
                    value={formData.reference.name}
                    onChange={handleReferenceChange}
                    placeholder="Full Name"
                    className={inputStyle}
                  />

                </div>

                <div>

                  <label className="block text-xs font-bold text-slate-600 uppercase mb-1">
                    Relationship / Designation
                  </label>

                  <input
                    type="text"
                    name="relationship"
                    value={formData.reference.relationship}
                    onChange={handleReferenceChange}
                    placeholder="e.g. Employee / Manager / Friend"
                    className={inputStyle}
                  />

                </div>

                <div>

                  <label className="block text-xs font-bold text-slate-600 uppercase mb-1">
                    Reference Address
                  </label>

                  <textarea
                    name="address"
                    rows="2"
                    value={formData.reference.address}
                    onChange={handleReferenceChange}
                    placeholder="Complete Address"
                    className={`${inputStyle} resize-y`}
                  />

                </div>

                <div>

                  <label className="block text-xs font-bold text-slate-600 uppercase mb-1">
                    Reference Mobile No.
                  </label>

                  <input
                    type="tel"
                    name="mobileNo"
                    maxLength={10}
                    inputMode="numeric"
                    value={formData.reference.mobileNo}
                    onChange={handleReferenceChange}
                    placeholder="10-digit Mobile No."
                    className={`${inputStyle} ${
                      errors.referenceMobileNo
                        ? 'border-red-500 bg-red-50'
                        : ''
                    }`}
                  />

                  {errorMessage(
                    errors.referenceMobileNo
                  )}

                </div>

              </div>

            </section>

            {/* SECTION 7: DOCUMENTS */}

            <section className="space-y-4">

              <div className="border-l-4 border-red-600 pl-3 flex items-center gap-2">

                <FileText className="w-5 h-5 text-red-600" />

                <div>

                  <h2 className="text-base font-bold uppercase text-slate-800 tracking-wider">
                    7. Documents Upload
                  </h2>

                  <p className="text-xs text-slate-500 italic">
                    Please upload soft copies of your mandatory joining documents:
                  </p>

                </div>

              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 bg-slate-50 p-4 rounded-lg border border-slate-200">

                {[
                  {
                    id: 'updatedCv',
                    label: 'Updated CV / Resume *',
                    required: true
                  },
                  {
                    id: 'aadhaarFront',
                    label: 'Aadhaar Card - Front *',
                    required: true
                  },
                  {
                    id: 'aadhaarBack',
                    label: 'Aadhaar Card - Back *',
                    required: true
                  },
                  {
                    id: 'panCard',
                    label: 'PAN Card'
                  },
                  {
                    id: 'educationalCertificates',
                    label: 'Educational Certificates'
                  },
                  {
                    id: 'bankPassbook',
                    label: 'Bank Passbook / Cancelled Cheque'
                  },
                  {
                    id: 'offerLetter',
                    label: 'Offer Letter'
                  },
                  {
                    id: 'salarySlips',
                    label: 'Salary Slips'
                  },
                  {
                    id: 'bankStatements',
                    label: "6 Months' Bank Statements"
                  },
                  {
                    id: 'resignationLetter',
                    label: 'Resignation Letter'
                  },
                  {
                    id: 'experienceLetter',
                    label: 'Experience Letter'
                  },
                  {
                    id: 'rentAgreement',
                    label: 'Rent Agreement (if on rent)'
                  }
                ].map((doc) => (

                  <div
                    key={doc.id}
                    className="bg-white p-3 rounded-md border border-slate-200 flex flex-col justify-between"
                  >

                    <div>

                      <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                        {doc.label}
                      </label>

                      <div className="flex items-center gap-2 mt-2">

                        <label className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-100 hover:bg-red-50 text-slate-700 hover:text-red-700 text-xs font-semibold rounded border border-slate-300 cursor-pointer transition">

                          <Upload className="w-3.5 h-3.5" />

                          Choose File

                          <input
                            type="file"
                            accept=".pdf,.jpg,.jpeg,.png,.webp"
                            onChange={(e) =>
                              handleFileUpload(
                                doc.id,
                                e.target.files[0]
                              )
                            }
                            className="hidden"
                          />

                        </label>

                        <span className="text-[11px] text-slate-500 truncate max-w-[150px]">

                          {formData.documents[doc.id]
                            ? formData.documents[doc.id].name
                            : 'No file chosen'}

                        </span>

                      </div>

                    </div>

                    {errors[`doc_${doc.id}`] && (

                      <p className="text-[11px] text-red-500 font-bold mt-1.5 flex items-center gap-1">

                        <AlertCircle className="w-3 h-3" />

                        {errors[`doc_${doc.id}`]}

                      </p>

                    )}

                  </div>

                ))}

              </div>

            </section>

            {/* SECTION 8: JOINING & SALARY */}

            <section className="bg-slate-50 p-4 rounded-lg border border-slate-200 grid grid-cols-1 md:grid-cols-2 gap-4">

              {/* Salary */}

              <div>

                <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                  Offered Salary
                </label>

                <input
                  type="text"
                  name="offeredSalary"
                  value={formData.offeredSalary}
                  onChange={handleChange}
                  placeholder="Offered CTC / Salary"
                  className={inputStyle}
                />

              </div>

              {/* Photograph */}

              <div className="flex flex-col items-center justify-center border-2 border-dashed border-slate-300 rounded-lg p-3 bg-white hover:border-red-500 transition cursor-pointer relative">

                {photoPreview ? (

                  <img
                    src={photoPreview}
                    alt="Passport Photo"
                    className="w-28 h-32 object-cover rounded shadow border"
                  />

                ) : (

                  <div className="text-center p-2">

                    <Camera className="w-8 h-8 text-slate-400 mx-auto mb-1" />

                    <p className="text-xs font-bold text-slate-600 uppercase">
                      Upload Photograph
                    </p>

                    <p className="text-[10px] text-slate-400">
                      Passport size photo
                    </p>

                  </div>

                )}

                <input
                  type="file"
                  accept="image/jpeg,image/png,image/jpg,image/webp"
                  onChange={handlePhotoUpload}
                  className="absolute inset-0 opacity-0 cursor-pointer"
                />

              </div>

            </section>

            {errors.photo && (

              <p className="text-xs text-red-500 text-center">
                {errors.photo}
              </p>

            )}

            {/* SECTION 9: DECLARATION */}

            <section className="space-y-4 bg-red-50/50 p-5 rounded-lg border border-red-200">

              <h2 className="text-md font-bold uppercase text-red-700 tracking-wider">
                Declaration by Candidate
              </h2>

              <p className="text-xs text-slate-700 leading-relaxed italic">

                "I{' '}

                <input
                  type="text"
                  name="declarationName"
                  value={formData.declarationName}
                  onChange={handleChange}
                  placeholder="Candidate Full Name"
                  className={`inline-block w-48 p-1 px-2 mx-1 border-b-2 bg-white text-xs font-bold text-slate-900 outline-none ${
                    errors.declarationName
                      ? 'border-red-500'
                      : 'border-slate-400 focus:border-red-600'
                  }`}
                />

                hereby declare that the information furnished above is true and complete to the best of my knowledge and belief. I understand that in the event of my information being found false or incorrect at any stage, my appointment shall be liable to cancellation or any compensation in lieu thereof."

              </p>

              {errorMessage(
                errors.declarationName
              )}

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-3">

                <div>

                  <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                    Date
                  </label>

                  <input
                    type="date"
                    name="declarationDate"
                    value={formData.declarationDate}
                    readOnly
                    className="w-full p-2 rounded border border-slate-300 text-sm bg-slate-100 outline-none cursor-not-allowed"
                  />

                </div>

                <div>

                  <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                    Signature of Candidate (Type Name)
                  </label>

                  <input
                    type="text"
                    name="signature"
                    value={formData.signature}
                    onChange={handleChange}
                    placeholder="Signature Name"
                    className="w-full p-2 rounded border border-slate-300 text-sm bg-white outline-none font-serif italic text-slate-900"
                  />

                </div>

              </div>

            </section>

            {/* Submit */}

            <div className="pt-4 text-center">

              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full sm:w-auto bg-gradient-to-r from-red-600 to-red-800 hover:from-red-700 hover:to-red-900 text-white font-extrabold py-3.5 px-12 rounded-lg shadow-lg hover:shadow-xl transition duration-200 uppercase tracking-wider text-sm sm:text-base disabled:cursor-not-allowed disabled:opacity-70"
              >
                {isSubmitting ? (
                  <span className="flex items-center justify-center gap-2">
                    <Loader2 className="h-5 w-5 animate-spin" />
                    Submitting...
                  </span>
                ) : (
                  'Submit Application'
                )}
              </button>

            </div>

          </form>

        )}

      </div>

    </div>
  );
}

