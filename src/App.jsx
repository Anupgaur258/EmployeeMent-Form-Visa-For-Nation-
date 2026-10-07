import { useState } from 'react';
import "./App.css";
import VisaForNationLogo from './assets/VisaForNationLogo.png';
import { 
  User, Briefcase, GraduationCap, Users, FileText, 
  CheckCircle2, Plus, Trash2, AlertCircle, Camera, Landmark, Upload
} from 'lucide-react';

export default function App() {
  const [photoPreview, setPhotoPreview] = useState(null);
  const [errors, setErrors] = useState({});
  const [submitted, setSubmitted] = useState(false);

  // Helper to get today's date YYYY-MM-DD
  const getTodayDate = () => new Date().toISOString().split('T')[0];

  // Language list choices
  const MAIN_LANGUAGES = [
    'Hindi', 'English', 'Marathi', 'Bengali', 'Telugu', 'Tamil', 
    'Gujarati', 'Urdu', 'Kannada', 'Odia', 'Malayalam', 'Punjabi', 
    'Assamese', 'Maithili', 'Santhali', 'Other'
  ];

  const [formData, setFormData] = useState({
    positionJoiningFor: '',
    applicationDate: getTodayDate(),
    
    // Personal Info
    fullName: '',
    fatherHusbandName: '',
    fatherHusbandOccupation: '',
    dob: '',
    age: '',
    gender: 'Male',
    genderOther: '',
    emailId: '', // Moved after gender
    religion: 'Hindu',
    religionOther: '',
    nationality: 'Indian',
    nationalityOther: '',
    maritalStatus: 'Single',
    maritalOther: '',
    aadhaarNo: '', // Added 12-digit Aadhaar
    mobileNo: '',
    whatsappNo: '', // Added WhatsApp Number
    emergencyNo1: '', // Required relative emergency contact 1
    emergencyNo2: '', // Required relative emergency contact 2
    noOfChildren: '0',
    noOfDependents: '0',
    
    // Address
    presentAddress: '',
    permanentAddress: '',
    sameAsCurrentAddress: false,
    district: '',
    state: '',
    postalCode: '', // Renamed from postCode

    // Dynamic Languages with Fluency
    languages: [
      { language: 'Hindi', otherLang: '', fluency: 'Advance' },
      { language: 'English', otherLang: '', fluency: 'Intermediate' }
    ],

    // Tables & Lists
    familyDetails: [{ name: '', age: '', relationship: '', occupation: '' }],
    
    // Default 10th and 12th open
    educationHistory: [
      { examPassed: '10th Class', schoolCollege: '', yearPassing: '', marksCGPA: '', subjects: '', isDefault: true },
      { examPassed: '12th Class', schoolCollege: '', yearPassing: '', marksCGPA: '', subjects: '', isDefault: true }
    ],
    
    experienceDetails: [{ companyNameAddress: '', designation: '', periodFrom: '', periodTo: '', ctc: '', reasonLeaving: '' }],
    
    // Bank Details Section
    bankDetails: {
      bankName: '',
      accountNo: '',
      ifscCode: '',
      branchName: ''
    },

    // Single Reference Requirement
    reference: { name: '', designationRelationship: '', address: '', mobileNo: '' },

    // File Uploads
    documents: {
      updatedCv: null,
      aadhaarCard: null,
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

  // Calculate age automatically from DOB
  const calculateAge = (dobValue) => {
    if (!dobValue) return '';
    const birthDate = new Date(dobValue);
    const today = new Date();
    let computedAge = today.getFullYear() - birthDate.getFullYear();
    const monthDiff = today.getMonth() - birthDate.getMonth();
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
      computedAge--;
    }
    return computedAge >= 0 ? computedAge.toString() : '0';
  };

  // Handle standard input changes & live validation clearing
  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;

    if (type === 'checkbox' && name === 'sameAsCurrentAddress') {
      setFormData((prev) => ({
        ...prev,
        sameAsCurrentAddress: checked,
        permanentAddress: checked ? prev.presentAddress : ''
      }));
      return;
    }

    setFormData((prev) => {
      const updated = { ...prev, [name]: value };

      // Auto calculate age when DOB changes
      if (name === 'dob') {
        updated.age = calculateAge(value);
      }

      // Auto update permanent address if sameAsCurrentAddress is checked
      if (name === 'presentAddress' && prev.sameAsCurrentAddress) {
        updated.permanentAddress = value;
      }

      return updated;
    });

    // Clear error on user edit
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: null }));
    }
  };

  // Handle Photo Upload
  const handlePhotoUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      setPhotoPreview(URL.createObjectURL(file));
    }
  };

  // Handle Document File Inputs
  const handleFileUpload = (docKey, file) => {
    setFormData((prev) => ({
      ...prev,
      documents: { ...prev.documents, [docKey]: file }
    }));
    if (errors[`doc_${docKey}`]) {
      setErrors((prev) => ({ ...prev, [`doc_${docKey}`]: null }));
    }
  };

  // Handle Bank Details
  const handleBankChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      bankDetails: { ...prev.bankDetails, [name]: value }
    }));
    if (errors[`bank_${name}`]) {
      setErrors((prev) => ({ ...prev, [`bank_${name}`]: null }));
    }
  };

  // Handle Reference Change
  const handleReferenceChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      reference: { ...prev.reference, [name]: value }
    }));
  };

  // Languages Handler
  const handleLanguageChange = (index, field, value) => {
    const updatedLangs = [...formData.languages];
    updatedLangs[index][field] = value;
    setFormData((prev) => ({ ...prev, languages: updatedLangs }));
  };

  const addLanguage = () => {
    setFormData((prev) => ({
      ...prev,
      languages: [...prev.languages, { language: 'Hindi', otherLang: '', fluency: 'Intermediate' }]
    }));
  };

  const removeLanguage = (index) => {
    if (formData.languages.length <= 1) return;
    setFormData((prev) => ({
      ...prev,
      languages: prev.languages.filter((_, i) => i !== index)
    }));
  };

  // Table Change Handler
  const handleTableChange = (listName, index, field, value) => {
    const updatedList = [...formData[listName]];
    updatedList[index][field] = value;
    setFormData((prev) => ({ ...prev, [listName]: updatedList }));
  };

  const addRow = (listName, emptyObj) => {
    setFormData((prev) => ({
      ...prev,
      [listName]: [...prev[listName], emptyObj]
    }));
  };

  const removeRow = (listName, index) => {
    if (formData[listName].length <= 1) return;
    const updatedList = formData[listName].filter((_, i) => i !== index);
    setFormData((prev) => ({ ...prev, [listName]: updatedList }));
  };

  // Strict Validation Rules
  const validateForm = () => {
    let errs = {};

    if (!formData.positionJoiningFor.trim()) errs.positionJoiningFor = 'Position is required';
    if (!formData.fullName.trim()) errs.fullName = 'Full Name is required';
    if (!formData.dob) errs.dob = 'Date of Birth is required';
    
    // Email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!formData.emailId.trim()) {
      errs.emailId = 'Email ID is required';
    } else if (!emailRegex.test(formData.emailId)) {
      errs.emailId = 'Enter a valid Email ID';
    }

    // Aadhaar 12-digit validation
    const aadhaarRegex = /^\d{12}$/;
    if (!formData.aadhaarNo.trim()) {
      errs.aadhaarNo = 'Aadhaar Number is required';
    } else if (!aadhaarRegex.test(formData.aadhaarNo.replace(/\s/g, ''))) {
      errs.aadhaarNo = 'Aadhaar Number must be exactly 12 digits';
    }

    // Phone validations (10 digits)
    const phoneRegex = /^[6-9]\d{9}$/;
    if (!formData.mobileNo.trim() || !phoneRegex.test(formData.mobileNo)) {
      errs.mobileNo = 'Enter valid 10-digit mobile number';
    }
    if (!formData.whatsappNo.trim() || !phoneRegex.test(formData.whatsappNo)) {
      errs.whatsappNo = 'Enter valid 10-digit WhatsApp number';
    }

    // Mandatory Relative Emergency Numbers
    if (!formData.emergencyNo1.trim() || !phoneRegex.test(formData.emergencyNo1)) {
      errs.emergencyNo1 = 'Enter valid 10-digit relative emergency contact';
    }
    if (!formData.emergencyNo2.trim() || !phoneRegex.test(formData.emergencyNo2)) {
      errs.emergencyNo2 = 'Enter valid 10-digit second relative emergency contact';
    }

    // Address
    if (!formData.presentAddress.trim()) errs.presentAddress = 'Present address is required';
    if (!formData.permanentAddress.trim()) errs.permanentAddress = 'Permanent address is required';
    if (!formData.postalCode.trim()) errs.postalCode = 'Postal Code is required';

    // Mandatory Education check for 10th and 12th
    formData.educationHistory.forEach((item, idx) => {
      if (item.isDefault) {
        if (!item.schoolCollege.trim()) errs[`edu_school_${idx}`] = 'School/College name required';
        if (!item.yearPassing.trim()) errs[`edu_year_${idx}`] = 'Year required';
        if (!item.marksCGPA.trim()) errs[`edu_marks_${idx}`] = 'Marks/CGPA required';
      }
    });

    // Updated CV Required
    if (!formData.documents.updatedCv) {
      errs.doc_updatedCv = 'Updated CV / Resume is mandatory';
    }

    if (!formData.declarationName.trim()) errs.declarationName = 'Declaration Name is required';

    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (validateForm()) {
      setSubmitted(true);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } else {
      // Scroll to first error
      const firstErrorKey = Object.keys(errors)[0];
      if (firstErrorKey) {
        const el = document.getElementsByName(firstErrorKey)[0];
        if (el) el.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }
    }
  };

  const inputStyle = "w-full p-2.5 bg-white border border-slate-300 rounded-md text-xs sm:text-sm text-slate-800 focus:ring-2 focus:ring-red-500 focus:border-red-500 outline-none transition-all placeholder:text-slate-400 font-medium";

  return (
    <div className="min-h-screen bg-slate-100 py-6 sm:py-10 px-3 sm:px-6 lg:px-8 font-sans text-slate-800">
      <div className="max-w-5xl mx-auto bg-white rounded-xl shadow-xl overflow-hidden border border-slate-200">
        
        {/* Header Branding Section with Logo on Top-Left */}
        <div className="bg-gradient-to-r from-red-700 via-red-600 to-red-800 text-white p-6 sm:p-8 relative">
          <div className="flex flex-col sm:flex-row items-center sm:items-start gap-4">
            <img 
              src={VisaForNationLogo} 
              alt="Visa For Nation Logo" 
              className="h-16 sm:h-20 w-auto object-contain bg-white/95 p-1.5 rounded-lg shadow-md" 
            />
            <div className="text-center sm:text-left">
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
            <h2 className="text-2xl font-bold text-slate-800">Application Submitted Successfully!</h2>
            <p className="text-slate-600 max-w-md mx-auto text-sm">
              Thank you for applying to Visa For Nation. Our recruitment team will review your application and documents.
            </p>
            <button 
              onClick={() => { setSubmitted(false); setPhotoPreview(null); }} 
              className="mt-4 bg-red-600 hover:bg-red-700 text-white font-bold py-2.5 px-6 rounded-lg transition shadow-md"
            >
              Fill Another Form
            </button>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="p-4 sm:p-8 md:p-10 space-y-8">

            {/* Position & Photo Box */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 bg-slate-50 p-5 rounded-lg border border-slate-200">
              <div className="md:col-span-2 space-y-4">
                <div>
                  <label className="block text-xs font-bold uppercase text-slate-700 mb-1">
                    Position Joining For <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    name="positionJoiningFor"
                    value={formData.positionJoiningFor}
                    onChange={handleChange}
                    placeholder="e.g. Visa Consultant / Software Engineer"
                    className={`${inputStyle} ${errors.positionJoiningFor ? 'border-red-500 bg-red-50' : ''}`}
                  />
                  {errors.positionJoiningFor && (
                    <p className="text-xs text-red-500 mt-1 flex items-center gap-1">
                      <AlertCircle className="w-3 h-3" /> {errors.positionJoiningFor}
                    </p>
                  )}
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase text-slate-700 mb-1">Current Date</label>
                  <input
                    type="date"
                    name="applicationDate"
                    value={formData.applicationDate}
                    onChange={handleChange}
                    className={inputStyle}
                  />
                </div>
              </div>

              {/* Photograph Upload */}
              <div className="flex flex-col items-center justify-center border-2 border-dashed border-slate-300 rounded-lg p-3 bg-white hover:border-red-500 transition cursor-pointer relative">
                {photoPreview ? (
                  <img src={photoPreview} alt="Passport Photo" className="w-28 h-32 object-cover rounded shadow border" />
                ) : (
                  <div className="text-center p-2">
                    <Camera className="w-8 h-8 text-slate-400 mx-auto mb-1" />
                    <p className="text-xs font-bold text-slate-600 uppercase">Upload Photograph</p>
                    <p className="text-[10px] text-slate-400">Passport size photo</p>
                  </div>
                )}
                <input 
                  type="file" 
                  accept="image/*" 
                  onChange={handlePhotoUpload} 
                  className="absolute inset-0 opacity-0 cursor-pointer"
                />
              </div>
            </div>

            {/* SECTION 1: PERSONAL INFORMATION */}
            <section className="space-y-4">
              <div className="border-l-4 border-red-600 pl-3 flex items-center gap-2">
                <User className="w-5 h-5 text-red-600" />
                <h2 className="text-base font-bold uppercase text-slate-800 tracking-wider">1. Personal Information</h2>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {/* Full Name */}
                <div>
                  <label className="block text-xs font-bold text-slate-600 uppercase mb-1">Full Name *</label>
                  <input
                    type="text"
                    name="fullName"
                    value={formData.fullName}
                    onChange={handleChange}
                    placeholder="Full Name"
                    className={`${inputStyle} ${errors.fullName ? 'border-red-500 bg-red-50' : ''}`}
                  />
                  {errors.fullName && <p className="text-xs text-red-500 mt-1">{errors.fullName}</p>}
                </div>

                {/* Father / Husband Name */}
                <div>
                  <label className="block text-xs font-bold text-slate-600 uppercase mb-1">Father / Husband Name</label>
                  <input
                    type="text"
                    name="fatherHusbandName"
                    value={formData.fatherHusbandName}
                    onChange={handleChange}
                    placeholder="Father or Husband Name"
                    className={inputStyle}
                  />
                </div>

                {/* Father / Husband Occupation */}
                <div>
                  <label className="block text-xs font-bold text-slate-600 uppercase mb-1">Father / Husband Occupation</label>
                  <input
                    type="text"
                    name="fatherHusbandOccupation"
                    value={formData.fatherHusbandOccupation}
                    onChange={handleChange}
                    placeholder="Occupation"
                    className={inputStyle}
                  />
                </div>

                {/* Date of Birth */}
                <div>
                  <label className="block text-xs font-bold text-slate-600 uppercase mb-1">Date of Birth *</label>
                  <input
                    type="date"
                    name="dob"
                    value={formData.dob}
                    onChange={handleChange}
                    className={`${inputStyle} ${errors.dob ? 'border-red-500 bg-red-50' : ''}`}
                  />
                  {errors.dob && <p className="text-xs text-red-500 mt-1">{errors.dob}</p>}
                </div>

                {/* Age (Auto calculated) */}
                <div>
                  <label className="block text-xs font-bold text-slate-600 uppercase mb-1">Age (Auto-calculated)</label>
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
                  <label className="block text-xs font-bold text-slate-600 uppercase mb-1">Gender</label>
                  <select
                    name="gender"
                    value={formData.gender}
                    onChange={handleChange}
                    className={inputStyle}
                  >
                    <option value="Male">Male</option>
                    <option value="Female">Female</option>
                    <option value="Other">Other</option>
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

                {/* Email ID (Moved after Gender) */}
                <div className="md:col-span-2">
                  <label className="block text-xs font-bold text-slate-600 uppercase mb-1">Email ID *</label>
                  <input
                    type="email"
                    name="emailId"
                    value={formData.emailId}
                    onChange={handleChange}
                    placeholder="e.g. name@example.com"
                    className={`${inputStyle} ${errors.emailId ? 'border-red-500 bg-red-50' : ''}`}
                  />
                  {errors.emailId && <p className="text-xs text-red-500 mt-1">{errors.emailId}</p>}
                </div>

                {/* Aadhaar Number Field */}
                <div>
                  <label className="block text-xs font-bold text-slate-600 uppercase mb-1">Aadhaar Number *</label>
                  <input
                    type="text"
                    name="aadhaarNo"
                    maxLength={12}
                    value={formData.aadhaarNo}
                    onChange={(e) => {
                      const val = e.target.value.replace(/\D/g, '');
                      handleChange({ target: { name: 'aadhaarNo', value: val } });
                    }}
                    placeholder="Enter 12-digit Aadhaar Number"
                    className={`${inputStyle} ${errors.aadhaarNo ? 'border-red-500 bg-red-50' : ''}`}
                  />
                  {errors.aadhaarNo && <p className="text-xs text-red-500 mt-1">{errors.aadhaarNo}</p>}
                </div>

                {/* Religion Dropdown */}
                <div>
                  <label className="block text-xs font-bold text-slate-600 uppercase mb-1">Religion</label>
                  <select
                    name="religion"
                    value={formData.religion}
                    onChange={handleChange}
                    className={inputStyle}
                  >
                    <option value="Hindu">Hindu</option>
                    <option value="Muslim">Muslim</option>
                    <option value="Sikh">Sikh</option>
                    <option value="Christian">Christian</option>
                    <option value="Other">Other</option>
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

                {/* Nationality Dropdown */}
                <div>
                  <label className="block text-xs font-bold text-slate-600 uppercase mb-1">Nationality</label>
                  <select
                    name="nationality"
                    value={formData.nationality}
                    onChange={handleChange}
                    className={inputStyle}
                  >
                    <option value="Indian">Indian</option>
                    <option value="Nepal">Nepal</option>
                    <option value="Other">Other</option>
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

                {/* Marital Status Dropdown */}
                <div>
                  <label className="block text-xs font-bold text-slate-600 uppercase mb-1">Marital Status</label>
                  <select
                    name="maritalStatus"
                    value={formData.maritalStatus}
                    onChange={handleChange}
                    className={inputStyle}
                  >
                    <option value="Single">Single</option>
                    <option value="Married">Married</option>
                    <option value="Divorced">Divorced</option>
                    <option value="Other">Other</option>
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

                {/* Mobile No. */}
                <div>
                  <label className="block text-xs font-bold text-slate-600 uppercase mb-1">Mobile No. *</label>
                  <input
                    type="tel"
                    name="mobileNo"
                    maxLength={10}
                    value={formData.mobileNo}
                    onChange={(e) => {
                      const val = e.target.value.replace(/\D/g, '');
                      handleChange({ target: { name: 'mobileNo', value: val } });
                    }}
                    placeholder="10-digit Mobile Number"
                    className={`${inputStyle} ${errors.mobileNo ? 'border-red-500 bg-red-50' : ''}`}
                  />
                  {errors.mobileNo && <p className="text-xs text-red-500 mt-1">{errors.mobileNo}</p>}
                </div>

                {/* WhatsApp Number */}
                <div>
                  <label className="block text-xs font-bold text-slate-600 uppercase mb-1">WhatsApp Number *</label>
                  <input
                    type="tel"
                    name="whatsappNo"
                    maxLength={10}
                    value={formData.whatsappNo}
                    onChange={(e) => {
                      const val = e.target.value.replace(/\D/g, '');
                      handleChange({ target: { name: 'whatsappNo', value: val } });
                    }}
                    placeholder="10-digit WhatsApp Number"
                    className={`${inputStyle} ${errors.whatsappNo ? 'border-red-500 bg-red-50' : ''}`}
                  />
                  {errors.whatsappNo && <p className="text-xs text-red-500 mt-1">{errors.whatsappNo}</p>}
                </div>

                {/* Relative Emergency Contact 1 */}
                <div>
                  <label className="block text-xs font-bold text-slate-600 uppercase mb-1">Relative Emergency No. 1 *</label>
                  <input
                    type="tel"
                    name="emergencyNo1"
                    maxLength={10}
                    value={formData.emergencyNo1}
                    onChange={(e) => {
                      const val = e.target.value.replace(/\D/g, '');
                      handleChange({ target: { name: 'emergencyNo1', value: val } });
                    }}
                    placeholder="1st Relative Emergency Contact"
                    className={`${inputStyle} ${errors.emergencyNo1 ? 'border-red-500 bg-red-50' : ''}`}
                  />
                  {errors.emergencyNo1 && <p className="text-xs text-red-500 mt-1">{errors.emergencyNo1}</p>}
                </div>

                {/* Relative Emergency Contact 2 */}
                <div>
                  <label className="block text-xs font-bold text-slate-600 uppercase mb-1">Relative Emergency No. 2 *</label>
                  <input
                    type="tel"
                    name="emergencyNo2"
                    maxLength={10}
                    value={formData.emergencyNo2}
                    onChange={(e) => {
                      const val = e.target.value.replace(/\D/g, '');
                      handleChange({ target: { name: 'emergencyNo2', value: val } });
                    }}
                    placeholder="2nd Relative Emergency Contact"
                    className={`${inputStyle} ${errors.emergencyNo2 ? 'border-red-500 bg-red-50' : ''}`}
                  />
                  {errors.emergencyNo2 && <p className="text-xs text-red-500 mt-1">{errors.emergencyNo2}</p>}
                </div>

                {/* Children & Dependents */}
                <div>
                  <label className="block text-xs font-bold text-slate-600 uppercase mb-1">No. Of Children</label>
                  <input
                    type="number"
                    name="noOfChildren"
                    value={formData.noOfChildren}
                    onChange={handleChange}
                    className={inputStyle}
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-600 uppercase mb-1">No. of Dependents on Earnings</label>
                  <input
                    type="number"
                    name="noOfDependents"
                    value={formData.noOfDependents}
                    onChange={handleChange}
                    className={inputStyle}
                  />
                </div>

                {/* Current Address */}
                <div className="md:col-span-3">
                  <label className="block text-xs font-bold text-slate-600 uppercase mb-1">Current Address *</label>
                  <textarea
                    name="presentAddress"
                    rows="2"
                    value={formData.presentAddress}
                    onChange={handleChange}
                    placeholder="Full Current Address"
                    className={`${inputStyle} ${errors.presentAddress ? 'border-red-500 bg-red-50' : ''}`}
                  ></textarea>
                  {errors.presentAddress && <p className="text-xs text-red-500 mt-1">{errors.presentAddress}</p>}
                </div>

                {/* Checkbox Same as Current Address */}
                <div className="md:col-span-3 flex items-center gap-2 py-1">
                  <input
                    type="checkbox"
                    id="sameAsCurrentAddress"
                    name="sameAsCurrentAddress"
                    checked={formData.sameAsCurrentAddress}
                    onChange={handleChange}
                    className="w-4 h-4 text-red-600 rounded border-slate-300 focus:ring-red-500 cursor-pointer"
                  />
                  <label htmlFor="sameAsCurrentAddress" className="text-xs font-bold text-slate-700 cursor-pointer select-none">
                    Permanent address same as current address
                  </label>
                </div>

                {/* Permanent Address */}
                <div className="md:col-span-3">
                  <label className="block text-xs font-bold text-slate-600 uppercase mb-1">Permanent Address (as per National ID) *</label>
                  <textarea
                    name="permanentAddress"
                    rows="2"
                    value={formData.permanentAddress}
                    onChange={handleChange}
                    disabled={formData.sameAsCurrentAddress}
                    placeholder="Full Permanent Address"
                    className={`${inputStyle} ${formData.sameAsCurrentAddress ? 'bg-slate-100 text-slate-500' : ''} ${
                      errors.permanentAddress ? 'border-red-500 bg-red-50' : ''
                    }`}
                  ></textarea>
                  {errors.permanentAddress && <p className="text-xs text-red-500 mt-1">{errors.permanentAddress}</p>}
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-600 uppercase mb-1">District</label>
                  <input
                    type="text"
                    name="district"
                    value={formData.district}
                    onChange={handleChange}
                    placeholder="District"
                    className={inputStyle}
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-600 uppercase mb-1">State</label>
                  <input
                    type="text"
                    name="state"
                    value={formData.state}
                    onChange={handleChange}
                    placeholder="State"
                    className={inputStyle}
                  />
                </div>

                {/* Renamed Postal Code */}
                <div>
                  <label className="block text-xs font-bold text-slate-600 uppercase mb-1">Postal Code *</label>
                  <input
                    type="text"
                    name="postalCode"
                    maxLength={6}
                    value={formData.postalCode}
                    onChange={(e) => {
                      const val = e.target.value.replace(/\D/g, '');
                      handleChange({ target: { name: 'postalCode', value: val } });
                    }}
                    placeholder="6-digit Postal Code"
                    className={`${inputStyle} ${errors.postalCode ? 'border-red-500 bg-red-50' : ''}`}
                  />
                  {errors.postalCode && <p className="text-xs text-red-500 mt-1">{errors.postalCode}</p>}
                </div>
              </div>
            </section>

            {/* SECTION 2: LANGUAGES KNOWN WITH FLUENCY LEVEL */}
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
                {formData.languages.map((item, idx) => (
                  <div key={idx} className="flex flex-col md:flex-row items-start md:items-center gap-3 bg-white p-3 rounded-md border border-slate-200 shadow-sm">
                    {/* Language Dropdown */}
                    <div className="w-full md:w-1/3">
                      <label className="block text-[11px] font-bold text-slate-600 uppercase mb-1">Language</label>
                      <select
                        value={item.language}
                        onChange={(e) => handleLanguageChange(idx, 'language', e.target.value)}
                        className={inputStyle}
                      >
                        {MAIN_LANGUAGES.map((lang) => (
                          <option key={lang} value={lang}>{lang}</option>
                        ))}
                      </select>
                      {item.language === 'Other' && (
                        <input
                          type="text"
                          value={item.otherLang}
                          onChange={(e) => handleLanguageChange(idx, 'otherLang', e.target.value)}
                          placeholder="Type Language Name"
                          className={`${inputStyle} mt-1.5`}
                        />
                      )}
                    </div>

                    {/* Fluency Radio Tick */}
                    <div className="w-full md:w-1/2">
                      <label className="block text-[11px] font-bold text-slate-600 uppercase mb-1">Fluency Level</label>
                      <div className="flex items-center gap-4 pt-1">
                        {['Beginner', 'Intermediate', 'Advance'].map((level) => (
                          <label key={level} className="flex items-center gap-1.5 text-xs font-semibold text-slate-700 cursor-pointer">
                            <input
                              type="radio"
                              name={`fluency_${idx}`}
                              value={level}
                              checked={item.fluency === level}
                              onChange={(e) => handleLanguageChange(idx, 'fluency', e.target.value)}
                              className="w-4 h-4 text-red-600 focus:ring-red-500"
                            />
                            {level}
                          </label>
                        ))}
                      </div>
                    </div>

                    {/* Remove button */}
                    {formData.languages.length > 1 && (
                      <div className="md:mt-4">
                        <button
                          type="button"
                          onClick={() => removeLanguage(idx)}
                          className="text-red-500 hover:text-red-700 p-1 rounded"
                          title="Remove Language"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    )}
                  </div>
                ))}

                <button
                  type="button"
                  onClick={addLanguage}
                  className="flex items-center gap-1 text-xs font-semibold text-red-600 hover:text-red-800 transition pt-1"
                >
                  <Plus className="w-4 h-4" /> Add More Language
                </button>
              </div>
            </section>

            {/* SECTION 3: EDUCATION HISTORY (Default 10th & 12th open) */}
            <section className="space-y-4">
              <div className="border-l-4 border-red-600 pl-3 flex items-center gap-2">
                <GraduationCap className="w-5 h-5 text-red-600" />
                <h2 className="text-base font-bold uppercase text-slate-800 tracking-wider">3. Education History</h2>
              </div>

              <div className="overflow-x-auto border rounded-lg border-slate-200">
                <table className="w-full text-left text-sm">
                  <thead className="bg-slate-100 border-b text-xs font-bold text-slate-700 uppercase">
                    <tr>
                      <th className="p-3 w-36">Examination *</th>
                      <th className="p-3">School / College / University *</th>
                      <th className="p-3 w-28">Passing Year *</th>
                      <th className="p-3 w-28">Marks / CGPA *</th>
                      <th className="p-3">Subjects</th>
                      <th className="p-3 w-12 text-center">Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {formData.educationHistory.map((item, index) => (
                      <tr key={index} className="border-b last:border-0 hover:bg-slate-50">
                        <td className="p-2 font-bold text-slate-800">
                          {item.isDefault ? (
                            <span className="bg-red-50 text-red-700 px-2 py-1 rounded text-xs font-bold border border-red-200">
                              {item.examPassed}
                            </span>
                          ) : (
                            <input
                              type="text"
                              value={item.examPassed}
                              onChange={(e) => handleTableChange('educationHistory', index, 'examPassed', e.target.value)}
                              placeholder="Degree / Diploma"
                              className="w-full p-1.5 border rounded text-xs outline-none focus:border-red-500"
                            />
                          )}
                        </td>
                        <td className="p-2">
                          <input
                            type="text"
                            value={item.schoolCollege}
                            onChange={(e) => handleTableChange('educationHistory', index, 'schoolCollege', e.target.value)}
                            placeholder="School / College Name"
                            className={`w-full p-1.5 border rounded text-xs outline-none focus:border-red-500 ${
                              errors[`edu_school_${index}`] ? 'border-red-500 bg-red-50' : ''
                            }`}
                          />
                        </td>
                        <td className="p-2">
                          <input
                            type="text"
                            maxLength={4}
                            value={item.yearPassing}
                            onChange={(e) => handleTableChange('educationHistory', index, 'yearPassing', e.target.value)}
                            placeholder="YYYY"
                            className={`w-full p-1.5 border rounded text-xs outline-none focus:border-red-500 ${
                              errors[`edu_year_${index}`] ? 'border-red-500 bg-red-50' : ''
                            }`}
                          />
                        </td>
                        <td className="p-2">
                          <input
                            type="text"
                            value={item.marksCGPA}
                            onChange={(e) => handleTableChange('educationHistory', index, 'marksCGPA', e.target.value)}
                            placeholder="e.g. 85%"
                            className={`w-full p-1.5 border rounded text-xs outline-none focus:border-red-500 ${
                              errors[`edu_marks_${index}`] ? 'border-red-500 bg-red-50' : ''
                            }`}
                          />
                        </td>
                        <td className="p-2">
                          <input
                            type="text"
                            value={item.subjects}
                            onChange={(e) => handleTableChange('educationHistory', index, 'subjects', e.target.value)}
                            placeholder="Main Subjects"
                            className="w-full p-1.5 border rounded text-xs outline-none focus:border-red-500"
                          />
                        </td>
                        <td className="p-2 text-center">
                          {!item.isDefault && (
                            <button
                              type="button"
                              onClick={() => removeRow('educationHistory', index)}
                              className="text-red-500 hover:text-red-700 p-1 rounded"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              <button
                type="button"
                onClick={() => addRow('educationHistory', { examPassed: '', schoolCollege: '', yearPassing: '', marksCGPA: '', subjects: '', isDefault: false })}
                className="flex items-center gap-1 text-xs font-semibold text-red-600 hover:text-red-800 transition"
              >
                <Plus className="w-4 h-4" /> Add More Education
              </button>
            </section>

            {/* SECTION 4: EXPERIENCE (CTC Renamed) */}
            <section className="space-y-4">
              <div className="border-l-4 border-red-600 pl-3 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Briefcase className="w-5 h-5 text-red-600" />
                  <h2 className="text-base font-bold uppercase text-slate-800 tracking-wider">4. Experience</h2>
                </div>
              </div>

              <div className="overflow-x-auto border rounded-lg border-slate-200">
                <table className="w-full text-left text-sm">
                  <thead className="bg-slate-100 border-b text-xs font-bold text-slate-700 uppercase">
                    <tr>
                      <th className="p-3">Company & Address</th>
                      <th className="p-3">Designation</th>
                      <th className="p-3 w-32">From Date</th>
                      <th className="p-3 w-32">To Date</th>
                      <th className="p-3 w-28">CTC</th>
                      <th className="p-3">Reason for Leaving</th>
                      <th className="p-3 w-12 text-center">Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {formData.experienceDetails.map((item, index) => (
                      <tr key={index} className="border-b last:border-0 hover:bg-slate-50">
                        <td className="p-2">
                          <input
                            type="text"
                            value={item.companyNameAddress}
                            onChange={(e) => handleTableChange('experienceDetails', index, 'companyNameAddress', e.target.value)}
                            placeholder="Company Name & Address"
                            className="w-full p-1.5 border rounded text-xs outline-none focus:border-red-500"
                          />
                        </td>
                        <td className="p-2">
                          <input
                            type="text"
                            value={item.designation}
                            onChange={(e) => handleTableChange('experienceDetails', index, 'designation', e.target.value)}
                            placeholder="Designation"
                            className="w-full p-1.5 border rounded text-xs outline-none focus:border-red-500"
                          />
                        </td>
                        <td className="p-2">
                          <input
                            type="date"
                            value={item.periodFrom}
                            onChange={(e) => handleTableChange('experienceDetails', index, 'periodFrom', e.target.value)}
                            className="w-full p-1 border rounded text-xs outline-none focus:border-red-500"
                          />
                        </td>
                        <td className="p-2">
                          <input
                            type="date"
                            value={item.periodTo}
                            onChange={(e) => handleTableChange('experienceDetails', index, 'periodTo', e.target.value)}
                            className="w-full p-1 border rounded text-xs outline-none focus:border-red-500"
                          />
                        </td>
                        <td className="p-2">
                          <input
                            type="text"
                            value={item.ctc}
                            onChange={(e) => handleTableChange('experienceDetails', index, 'ctc', e.target.value)}
                            placeholder="CTC Amount"
                            className="w-full p-1.5 border rounded text-xs outline-none focus:border-red-500"
                          />
                        </td>
                        <td className="p-2">
                          <input
                            type="text"
                            value={item.reasonLeaving}
                            onChange={(e) => handleTableChange('experienceDetails', index, 'reasonLeaving', e.target.value)}
                            placeholder="Reason for leaving"
                            className="w-full p-1.5 border rounded text-xs outline-none focus:border-red-500"
                          />
                        </td>
                        <td className="p-2 text-center">
                          <button
                            type="button"
                            onClick={() => removeRow('experienceDetails', index)}
                            className="text-red-500 hover:text-red-700 p-1 rounded"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              <button
                type="button"
                onClick={() => addRow('experienceDetails', { companyNameAddress: '', designation: '', periodFrom: '', periodTo: '', ctc: '', reasonLeaving: '' })}
                className="flex items-center gap-1 text-xs font-semibold text-red-600 hover:text-red-800 transition"
              >
                <Plus className="w-4 h-4" /> Add Experience Row
              </button>
            </section>

            {/* SECTION 5: BANK DETAILS */}
            <section className="space-y-4">
              <div className="border-l-4 border-red-600 pl-3 flex items-center gap-2">
                <Landmark className="w-5 h-5 text-red-600" />
                <h2 className="text-base font-bold uppercase text-slate-800 tracking-wider">5. Bank Details</h2>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-4 gap-4 bg-slate-50 p-4 rounded-lg border border-slate-200">
                <div>
                  <label className="block text-xs font-bold text-slate-600 uppercase mb-1">Bank Name</label>
                  <input
                    type="text"
                    name="bankName"
                    value={formData.bankDetails.bankName}
                    onChange={handleBankChange}
                    placeholder="e.g. HDFC Bank"
                    className={inputStyle}
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-600 uppercase mb-1">Account Number</label>
                  <input
                    type="text"
                    name="accountNo"
                    value={formData.bankDetails.accountNo}
                    onChange={handleBankChange}
                    placeholder="Account Number"
                    className={inputStyle}
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-600 uppercase mb-1">IFSC Code</label>
                  <input
                    type="text"
                    name="ifscCode"
                    value={formData.bankDetails.ifscCode}
                    onChange={handleBankChange}
                    placeholder="e.g. HDFC0001234"
                    className={inputStyle}
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-600 uppercase mb-1">Branch Name</label>
                  <input
                    type="text"
                    name="branchName"
                    value={formData.bankDetails.branchName}
                    onChange={handleBankChange}
                    placeholder="Branch Name"
                    className={inputStyle}
                  />
                </div>
              </div>
            </section>

            {/* SECTION 6: REFERENCE (Only 1 Reference Required) */}
            <section className="space-y-4">
              <div className="border-l-4 border-red-600 pl-3 flex items-center gap-2">
                <Users className="w-5 h-5 text-red-600" />
                <h2 className="text-base font-bold uppercase text-slate-800 tracking-wider">6. Reference (Refer Name)</h2>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-4 gap-4 bg-slate-50 p-4 rounded-lg border border-slate-200">
                <div>
                  <label className="block text-xs font-bold text-slate-600 uppercase mb-1">Name of Reference</label>
                  <input
                    type="text"
                    name="name"
                    value={formData.reference.name}
                    onChange={handleReferenceChange}
                    placeholder="Reference Name"
                    className={inputStyle}
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-600 uppercase mb-1">Designation / Relationship</label>
                  <input
                    type="text"
                    name="designationRelationship"
                    value={formData.reference.designationRelationship}
                    onChange={handleReferenceChange}
                    placeholder="Relationship or Role"
                    className={inputStyle}
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-600 uppercase mb-1">Address</label>
                  <input
                    type="text"
                    name="address"
                    value={formData.reference.address}
                    onChange={handleReferenceChange}
                    placeholder="Address"
                    className={inputStyle}
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-600 uppercase mb-1">Mobile No.</label>
                  <input
                    type="tel"
                    name="mobileNo"
                    maxLength={10}
                    value={formData.reference.mobileNo}
                    onChange={handleReferenceChange}
                    placeholder="10-digit Mobile No."
                    className={inputStyle}
                  />
                </div>
              </div>
            </section>

            {/* SECTION 7: DOCUMENTS UPLOAD (With Mandatory Updated CV File Upload) */}
            <section className="space-y-4">
              <div className="border-l-4 border-red-600 pl-3 flex items-center gap-2">
                <FileText className="w-5 h-5 text-red-600" />
                <div>
                  <h2 className="text-base font-bold uppercase text-slate-800 tracking-wider">7. Documents Upload</h2>
                  <p className="text-xs text-slate-500 italic">Please upload soft copies of your mandatory joining documents:</p>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 bg-slate-50 p-4 rounded-lg border border-slate-200">
                {[
                  { id: 'updatedCv', label: 'Updated CV / Resume *', required: true },
                  { id: 'aadhaarCard', label: 'Aadhaar Card Copy' },
                  { id: 'panCard', label: 'PAN Card Copy' },
                  { id: 'educationalCertificates', label: 'Educational Certificates' },
                  { id: 'bankPassbook', label: 'Bank Passbook / Cheque' },
                  { id: 'offerLetter', label: 'Offer Letter' },
                  { id: 'salarySlips', label: 'Salary Slips' },
                  { id: 'bankStatements', label: "6 Months' Bank Statements" },
                  { id: 'resignationLetter', label: 'Resignation Letter' },
                  { id: 'experienceLetter', label: 'Experience Letter' },
                  { id: 'rentAgreement', label: 'Rent Agreement (if on rent)' },
                ].map((doc) => (
                  <div key={doc.id} className="bg-white p-3 rounded-md border border-slate-200 flex flex-col justify-between">
                    <div>
                      <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                        {doc.label}
                      </label>
                      <div className="flex items-center gap-2 mt-2">
                        <label className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-100 hover:bg-red-50 text-slate-700 hover:text-red-700 text-xs font-semibold rounded border border-slate-300 cursor-pointer transition">
                          <Upload className="w-3.5 h-3.5" /> Choose File
                          <input
                            type="file"
                            onChange={(e) => handleFileUpload(doc.id, e.target.files[0])}
                            className="hidden"
                          />
                        </label>
                        <span className="text-[11px] text-slate-500 truncate max-w-[120px]">
                          {formData.documents[doc.id] ? formData.documents[doc.id].name : 'No file chosen'}
                        </span>
                      </div>
                    </div>
                    {errors[`doc_${doc.id}`] && (
                      <p className="text-[11px] text-red-500 font-bold mt-1.5">{errors[`doc_${doc.id}`]}</p>
                    )}
                  </div>
                ))}
              </div>
            </section>

            {/* SECTION 8: JOINING & SALARY */}
            <section className="bg-slate-50 p-4 rounded-lg border border-slate-200 grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Offered Salary</label>
                <input
                  type="text"
                  name="offeredSalary"
                  value={formData.offeredSalary}
                  onChange={handleChange}
                  placeholder="Offered CTC / Salary"
                  className={inputStyle}
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Joining Date</label>
                <input
                  type="date"
                  name="joiningDate"
                  value={formData.joiningDate}
                  onChange={handleChange}
                  className={inputStyle}
                />
              </div>
            </section>

            {/* SECTION 9: DECLARATION BY CANDIDATE */}
            <section className="space-y-4 bg-red-50/50 p-5 rounded-lg border border-red-200">
              <h2 className="text-md font-bold uppercase text-red-700 tracking-wider">Declaration by Candidate</h2>

              <p className="text-xs text-slate-700 leading-relaxed italic">
                "I{' '}
                <input
                  type="text"
                  name="declarationName"
                  value={formData.declarationName}
                  onChange={handleChange}
                  placeholder="Candidate Full Name"
                  className={`inline-block w-48 p-1 px-2 mx-1 border-b-2 bg-white text-xs font-bold text-slate-900 outline-none ${
                    errors.declarationName ? 'border-red-500' : 'border-slate-400 focus:border-red-600'
                  }`}
                />
                hereby declare that the information furnished above is true and complete to the best of my knowledge and belief. I understand that in the event of my information being found false or incorrect at any stage, my appointment shall be liable to cancellation or any compensation in lieu thereof."
              </p>
              {errors.declarationName && <p className="text-xs text-red-500">{errors.declarationName}</p>}

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Date</label>
                  <input
                    type="date"
                    name="declarationDate"
                    value={formData.declarationDate}
                    onChange={handleChange}
                    className="w-full p-2 rounded border border-slate-300 text-sm bg-white outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Signature of Candidate (Type Name)</label>
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

            {/* Submit Button */}
            <div className="pt-4 text-center">
              <button
                type="submit"
                className="w-full sm:w-auto bg-gradient-to-r from-red-600 to-red-800 hover:from-red-700 hover:to-red-900 text-white font-extrabold py-3.5 px-12 rounded-lg shadow-lg hover:shadow-xl transition duration-200 uppercase tracking-wider text-sm sm:text-base"
              >
                Submit Application
              </button>
            </div>

          </form>
        )}
      </div>
    </div>
  );
}