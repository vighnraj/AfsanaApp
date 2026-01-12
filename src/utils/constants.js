// App Constants - Static data lists matching web frontend

// Countries list
export const COUNTRIES = [
    'Hungary',
    'UK',
    'Cyprus',
    'Canada',
    'Malaysia',
    'Lithuania',
    'Latvia',
    'Germany',
    'New Zealand',
    'USA',
    'Estonia',
    'Australia',
    'South Korea',
    'Georgia',
    'Denmark',
    'Netherlands',
    'Sweden',
    'Norway',
    'Belgium',
    'Romania',
    'Russia',
    'Turkey',
    'Ireland',
    'Portugal',
    'Malta',
    'Others',
];

// Inquiry/Lead Status options (matches frontend)
export const STATUS_OPTIONS = [
    { value: 'New', label: 'New', color: '#3b82f6' },
    { value: 'New Lead', label: 'New Lead', color: '#6366f1' },
    { value: 'In Review', label: 'In Review', color: '#f59e0b' },
    { value: 'Converted to lead', label: 'Converted to Lead', color: '#8b5cf6' },
    { value: 'Not Interested', label: 'Not Interested', color: '#ef4444' },
    { value: 'Next Intake Interested', label: 'Next Intake Interested', color: '#a855f7' },
    { value: 'Registered', label: 'Registered', color: '#7c3aed' },
    { value: 'Converted to student', label: 'Converted to Student', color: '#10b981' },
    { value: 'Dropped', label: 'Dropped', color: '#dc2626' },
];

// Intake options
export const INTAKE_OPTIONS = [
    { value: 'February', label: 'February' },
    { value: 'September', label: 'September' },
    { value: 'Other', label: 'Other' },
];

// Lead Source options
export const LEAD_SOURCE_OPTIONS = [
    'Whatsapp',
    'Facebook',
    'YouTube',
    'Website',
    'Referral',
    'Event',
    'Agent',
    'Office Visit',
    'Hotline',
    'Seminar',
    'Expo',
    'Other',
];

// Visa processing stages
export const VISA_STAGES = [
    { key: 'application', label: 'Registration', icon: 'person', apiField: 'registration_visa_processing_stage' },
    { key: 'interview', label: 'Documents', icon: 'document-text', apiField: 'documents_visa_processing_stage' },
    { key: 'visa', label: 'University Application', icon: 'business', apiField: 'university_application_visa_processing_stage' },
    { key: 'fee', label: 'Fee Payment', icon: 'card', apiField: 'fee_payment_visa_processing_stage' },
    { key: 'zoom', label: 'Interview', icon: 'videocam', apiField: 'university_interview_visa_processing_stage' },
    { key: 'conditionalOffer', label: 'Offer Letter', icon: 'document', apiField: 'offer_letter_visa_processing_stage' },
    { key: 'tuitionFee', label: 'Tuition Fee', icon: 'cash', apiField: 'tuition_fee_visa_processing_stage' },
    { key: 'mainofferletter', label: 'Final Offer', icon: 'checkmark-done', apiField: 'final_offer_visa_processing_stage' },
    { key: 'embassydocument', label: 'Embassy Docs', icon: 'folder', apiField: 'embassy_docs_visa_processing_stage' },
    { key: 'embassyappoint', label: 'Appointment', icon: 'calendar', apiField: 'appointment_visa_processing_stage' },
    { key: 'embassyinterview', label: 'Interview', icon: 'mic', apiField: 'visa_approval_visa_processing_stage' },
    { key: 'visaStatus', label: 'Visa Status', icon: 'airplane', apiField: 'visa_rejection_visa_processing_stage' },
];

// User roles
export const USER_ROLES = [
    { value: 'admin', label: 'Admin' },
    { value: 'student', label: 'Student' },
    { value: 'counselor', label: 'Counselor' },
    { value: 'staff', label: 'Staff' },
    { value: 'processors', label: 'Processor' },
    { value: 'masteradmin', label: 'Master Admin' },
];

// Dashboard navigation by role
export const ROLE_DASHBOARD = {
    admin: 'AdminDashboard',
    student: 'StudentDashboard',
    counselor: 'CounselorDashboard',
    staff: 'StaffDashboard',
    processors: 'ProcessorDashboard',
    masteradmin: 'MasterAdminDashboard',
};

// Date range filter options
export const DATE_RANGE_OPTIONS = [
    { value: '', label: 'All Time' },
    { value: 'Today', label: 'Today' },
    { value: 'ThisWeek', label: 'This Week' },
    { value: 'ThisMonth', label: 'This Month' },
    { value: 'ThisYear', label: 'This Year' },
];

// Priority options (web parity)
export const PRIORITY_OPTIONS = [
    'Low',
    'Medium',
    'High',
];

// Lead / Inquiry type options
export const LEAD_TYPE_OPTIONS = [
    'student_visa',
    'visit_visa',
    'work_visa',
    'short_visa',
    'german_course',
    'english_course',
    'others',
];

export const INQUIRY_TYPE_OPTIONS = LEAD_TYPE_OPTIONS;

// Education levels
export const EDUCATION_LEVEL_OPTIONS = [
    { value: 'ssc', label: 'SSC' },
    { value: 'hsc', label: 'HSC' },
    { value: 'diploma', label: 'Diploma' },
    { value: 'bachelor', label: 'Bachelor' },
    { value: 'master', label: 'Master' },
];

// Test types
export const TEST_TYPE_OPTIONS = [
    { value: 'ielts', label: 'IELTS' },
    { value: 'toefl', label: 'TOEFL' },
    { value: 'pte', label: 'PTE' },
    { value: 'pte_core', label: 'PTE Core' },
    { value: 'pte_academic', label: 'PTE Academic' },
    { value: 'duolingo', label: 'Duolingo' },
    { value: 'other', label: 'Other' },
    { value: 'no_test', label: 'No Test Yet' },
];

// Study Level options
export const STUDY_LEVEL_OPTIONS = [
    { value: 'undergraduate', label: 'Undergraduate' },
    { value: 'postgraduate', label: 'Postgraduate' },
    { value: 'diploma', label: 'Diploma' },
    { value: 'certificate', label: 'Certificate' },
    { value: 'doctorate', label: 'Doctorate/PhD' },
    { value: 'foundation', label: 'Foundation' },
    { value: 'language', label: 'Language Course' },
];

// Study Field options
export const STUDY_FIELD_OPTIONS = [
    { value: 'business', label: 'Business & Management' },
    { value: 'engineering', label: 'Engineering & Technology' },
    { value: 'computer_science', label: 'Computer Science & IT' },
    { value: 'medicine', label: 'Medicine & Health Sciences' },
    { value: 'arts', label: 'Arts & Humanities' },
    { value: 'law', label: 'Law' },
    { value: 'science', label: 'Natural Sciences' },
    { value: 'social_science', label: 'Social Sciences' },
    { value: 'education', label: 'Education' },
    { value: 'hospitality', label: 'Hospitality & Tourism' },
    { value: 'agriculture', label: 'Agriculture' },
    { value: 'other', label: 'Other' },
];

// Medium of Instruction options
export const MEDIUM_OF_INSTRUCTION_OPTIONS = [
    { value: 'english', label: 'English' },
    { value: 'bangla', label: 'Bangla' },
    { value: 'both', label: 'Both English & Bangla' },
    { value: 'other', label: 'Other' },
];

// Country codes for phone numbers
export const COUNTRY_CODES = [
    { code: '+880', country: 'Bangladesh', flag: '🇧🇩' },
    { code: '+91', country: 'India', flag: '🇮🇳' },
    { code: '+92', country: 'Pakistan', flag: '🇵🇰' },
    { code: '+977', country: 'Nepal', flag: '🇳🇵' },
    { code: '+94', country: 'Sri Lanka', flag: '🇱🇰' },
    { code: '+1', country: 'USA/Canada', flag: '🇺🇸' },
    { code: '+44', country: 'UK', flag: '🇬🇧' },
    { code: '+61', country: 'Australia', flag: '🇦🇺' },
    { code: '+49', country: 'Germany', flag: '🇩🇪' },
    { code: '+33', country: 'France', flag: '🇫🇷' },
    { code: '+971', country: 'UAE', flag: '🇦🇪' },
    { code: '+966', country: 'Saudi Arabia', flag: '🇸🇦' },
    { code: '+965', country: 'Kuwait', flag: '🇰🇼' },
    { code: '+974', country: 'Qatar', flag: '🇶🇦' },
    { code: '+973', country: 'Bahrain', flag: '🇧🇭' },
    { code: '+968', country: 'Oman', flag: '🇴🇲' },
    { code: '+60', country: 'Malaysia', flag: '🇲🇾' },
    { code: '+65', country: 'Singapore', flag: '🇸🇬' },
    { code: '+82', country: 'South Korea', flag: '🇰🇷' },
    { code: '+81', country: 'Japan', flag: '🇯🇵' },
    { code: '+86', country: 'China', flag: '🇨🇳' },
    { code: '+39', country: 'Italy', flag: '🇮🇹' },
    { code: '+34', country: 'Spain', flag: '🇪🇸' },
    { code: '+31', country: 'Netherlands', flag: '🇳🇱' },
    { code: '+36', country: 'Hungary', flag: '🇭🇺' },
];

// Branch options
export const BRANCH_OPTIONS = [
    'Dhaka',
    'Sylhet',
];

// Follow-up preset options
export const FOLLOW_UP_PRESETS = [
    'today',
    'yesterday',
    'nextWeek',
    'thisWeek',
    'overdue',
];

// Sort options
export const SORT_OPTIONS = [
    { value: 'newToOld', label: 'Newest First' },
    { value: 'oldToNew', label: 'Oldest First' },
    { value: 'aToZ', label: 'Name A → Z' },
    { value: 'zToA', label: 'Name Z → A' },
];

// Document types for upload
export const DOCUMENT_TYPES = [
    { key: 'passport_doc', label: 'Passport' },
    { key: 'photo_doc', label: 'Photo' },
    { key: 'ssc_doc', label: 'SSC Certificate' },
    { key: 'hsc_doc', label: 'HSC Transcript' },
    { key: 'bachelor_doc', label: "Bachelor's Certificate" },
    { key: 'ielts_doc', label: 'IELTS/English Certificate' },
    { key: 'cv_doc', label: 'CV' },
    { key: 'sop_doc', label: 'SOP' },
    { key: 'medical_doc', label: 'Medical Certificate' },
    { key: 'other_doc', label: 'Other Documents' },
];

// API error messages
export const ERROR_MESSAGES = {
    NETWORK_ERROR: 'Network error. Please check your connection.',
    AUTH_ERROR: 'Authentication failed. Please login again.',
    PERMISSION_ERROR: 'You do not have permission to perform this action.',
    VALIDATION_ERROR: 'Please check the form for errors.',
    SERVER_ERROR: 'Server error. Please try again later.',
    UNKNOWN_ERROR: 'An unexpected error occurred.',
};

// Session timeout in milliseconds (10 minutes)
export const SESSION_TIMEOUT = 10 * 60 * 1000;

// Follow-up types
export const FOLLOW_UP_TYPES = [
    { value: 'Call', label: 'Call' },
    { value: 'Email', label: 'Email' },
    { value: 'WhatsApp', label: 'WhatsApp' },
    { value: 'Office Visit', label: 'Office Visit' },
    { value: 'Seminar', label: 'Seminar' },
    { value: 'Other', label: 'Other' },
];

// Follow-up statuses
export const FOLLOW_UP_STATUSES = [
    { value: 'Follow-Up Scheduled', label: 'Scheduled' },
    { value: 'Awaiting Response', label: 'Awaiting Response' },
    { value: 'Interested', label: 'Interested' },
    { value: 'Not Interested', label: 'Not Interested' },
    { value: 'Converted to Client', label: 'Converted to Client' },
];

// Note types
export const NOTE_TYPES = [
    { value: 'Follow-up', label: 'Follow-up' },
    { value: 'Meeting', label: 'Meeting' },
    { value: 'Call', label: 'Call' },
    { value: 'Email', label: 'Email' },
    { value: 'Feedback', label: 'Feedback' },
    { value: 'Other', label: 'Other' },
];

// Pagination defaults
export const PAGINATION = {
    DEFAULT_PAGE: 1,
    DEFAULT_LIMIT: 10,
    MAX_LIMIT: 50,
};

export default {
    COUNTRIES,
    STATUS_OPTIONS,
    INTAKE_OPTIONS,
    LEAD_SOURCE_OPTIONS,
    VISA_STAGES,
    USER_ROLES,
    ROLE_DASHBOARD,
    DATE_RANGE_OPTIONS,
    PRIORITY_OPTIONS,
    LEAD_TYPE_OPTIONS,
    INQUIRY_TYPE_OPTIONS,
    EDUCATION_LEVEL_OPTIONS,
    TEST_TYPE_OPTIONS,
    STUDY_LEVEL_OPTIONS,
    STUDY_FIELD_OPTIONS,
    MEDIUM_OF_INSTRUCTION_OPTIONS,
    COUNTRY_CODES,
    BRANCH_OPTIONS,
    FOLLOW_UP_PRESETS,
    SORT_OPTIONS,
    DOCUMENT_TYPES,
    FOLLOW_UP_TYPES,
    FOLLOW_UP_STATUSES,
    NOTE_TYPES,
    ERROR_MESSAGES,
    SESSION_TIMEOUT,
    PAGINATION,
    BOTTOM_TAB_SPACING: 120, // Height of tab bar + extra padding
    BOTTOM_TAB_HEIGHT: 105,  // Max height of tab bar
};
