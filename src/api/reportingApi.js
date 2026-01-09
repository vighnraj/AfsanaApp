// Reporting and Analytics API functions

import api from './index';

/**
 * Get lead reports with filters
 * @param {object} filters - { startDate, endDate, branch, counselor, source, status }
 * @returns {Promise<object>}
 */
export const getLeadReports = async (filters = {}) => {
    try {
        const response = await api.get('AllConvertedLeadsinquiries');
        // Transform leads into report format
        return {
            summary: {
                total_leads: response.data?.length || 0,
                converted: response.data?.filter(l => l.status === 'converted').length || 0,
                in_progress: response.data?.filter(l => l.status === 'in_progress').length || 0,
                not_interested: response.data?.filter(l => l.status === 'not_interested').length || 0,
                conversion_rate: response.data?.length > 0 
                    ? Math.round((response.data?.filter(l => l.status === 'converted').length / response.data.length) * 100)
                    : 0,
            },
            data: response.data || [],
            conversion_funnel: [],
            source_distribution: [],
            monthly_trend: [],
        };
    } catch (error) {
        console.error('Error fetching lead reports:', error);
        // Return empty report structure on error
        return {
            summary: { total_leads: 0, converted: 0, in_progress: 0, not_interested: 0, conversion_rate: 0 },
            data: [],
            conversion_funnel: [],
            source_distribution: [],
            monthly_trend: [],
        };
    }
};

/**
 * Get student reports with filters
 * @param {object} filters - { startDate, endDate, branch, counselor, country, program }
 * @returns {Promise<object>}
 */
export const getStudentReports = async (filters = {}) => {
    try {
        const response = await api.get('auth/getAllStudents');
        // Transform students into report format
        return {
            summary: {
                total_students: response.data?.length || 0,
                enrolled: response.data?.filter(s => s.status === 'enrolled').length || 0,
                in_process: response.data?.filter(s => s.status === 'in_process').length || 0,
                not_enrolled: response.data?.filter(s => s.status === 'not_enrolled').length || 0,
            },
            data: response.data || [],
            country_distribution: [],
            program_distribution: [],
            monthly_trend: [],
        };
    } catch (error) {
        console.error('Error fetching student reports:', error);
        // Return empty report structure on error
        return {
            summary: { total_students: 0, enrolled: 0, in_process: 0, not_enrolled: 0 },
            data: [],
            country_distribution: [],
            program_distribution: [],
            monthly_trend: [],
        };
    }
};

/**
 * Get counselor performance reports
 * @param {object} filters - { startDate, endDate, counselorId }
 * @returns {Promise<object>}
 */
export const getCounselorPerformanceReports = async (filters = {}) => {
    try {
        const response = await api.get('counselor');
        // Transform counselors into performance report format
        return {
            summary: {
                total_counselors: response.data?.length || 0,
            },
            data: response.data || [],
            performance_metrics: [],
        };
    } catch (error) {
        console.error('Error fetching counselor reports:', error);
        return {
            summary: { total_counselors: 0 },
            data: [],
            performance_metrics: [],
        };
    }
};

/**
 * Get payment reports with filters
 * @param {object} filters - { startDate, endDate, branch, paymentType, status }
 * @returns {Promise<object>}
 */
export const getPaymentReports = async (filters = {}) => {
    try {
        const response = await api.get('payments');
        // Transform payments into report format
        return {
            summary: {
                total_payments: response.data?.length || 0,
                total_amount: response.data?.reduce((sum, p) => sum + (parseFloat(p.payment_amount) || 0), 0) || 0,
                completed: response.data?.filter(p => p.payment_status === 'completed').length || 0,
                pending: response.data?.filter(p => p.payment_status === 'pending').length || 0,
            },
            data: response.data || [],
            payment_by_method: [],
            payment_by_type: [],
            monthly_trend: [],
        };
    } catch (error) {
        console.error('Error fetching payment reports:', error);
        return {
            summary: { total_payments: 0, total_amount: 0, completed: 0, pending: 0 },
            data: [],
            payment_by_method: [],
            payment_by_type: [],
            monthly_trend: [],
        };
    }
};

/**
 * Get branch reports with filters
 * @param {object} filters - { startDate, endDate, branch }
 * @returns {Promise<object>}
 */
export const getBranchReports = async (filters = {}) => {
    try {
        const response = await api.get('branch');
        return {
            summary: { total_branches: response.data?.length || 0 },
            data: response.data || [],
        };
    } catch (error) {
        console.error('Error fetching branch reports:', error);
        return { summary: { total_branches: 0 }, data: [] };
    }
};

/**
 * Get application reports with filters
 * @param {object} filters - { startDate, endDate, university, status, counselor }
 * @returns {Promise<object>}
 */
export const getApplicationReports = async (filters = {}) => {
    try {
        const response = await api.get('application');
        return {
            summary: { total_applications: response.data?.length || 0 },
            data: response.data || [],
        };
    } catch (error) {
        console.error('Error fetching application reports:', error);
        return { summary: { total_applications: 0 }, data: [] };
    }
};

/**
 * Get visa reports with filters
 * @param {object} filters - { startDate, endDate, country, status, processor }
 * @returns {Promise<object>}
 */
export const getVisaReports = async (filters = {}) => {
    try {
        const response = await api.get('VisaProcess');
        return {
            summary: { total_visas: response.data?.length || 0 },
            data: response.data || [],
        };
    } catch (error) {
        console.error('Error fetching visa reports:', error);
        return { summary: { total_visas: 0 }, data: [] };
    }
};

/**
 * Export report data
 * @param {string} reportType - 'leads', 'students', 'counselor', 'payments', 'branch'
 * @param {string} format - 'csv', 'excel', 'pdf'
 * @param {object} filters
 * @returns {Promise<Blob>}
 */
export const exportReport = async (reportType, format, filters = {}) => {
    try {
        const response = await api.get(`${reportType}`, {
            responseType: 'blob',
        });
        return response.data;
    } catch (error) {
        console.error('Error exporting report:', error);
        throw error;
    }
};

/**
 * Get dashboard summary statistics
 * @param {object} filters - { startDate, endDate, branch }
 * @returns {Promise<object>}
 */
export const getDashboardSummary = async (filters = {}) => {
    try {
        // Fetch all data needed for dashboard
        const [leads, students, payments, applications] = await Promise.all([
            api.get('AllConvertedLeadsinquiries').catch(() => ({ data: [] })),
            api.get('auth/getAllStudents').catch(() => ({ data: [] })),
            api.get('payments').catch(() => ({ data: [] })),
            api.get('application').catch(() => ({ data: [] })),
        ]);

        return {
            total_leads: leads.data?.length || 0,
            total_students: students.data?.length || 0,
            total_payments: payments.data?.length || 0,
            total_applications: applications.data?.length || 0,
            total_revenue: payments.data?.reduce((sum, p) => sum + (parseFloat(p.payment_amount) || 0), 0) || 0,
        };
    } catch (error) {
        console.error('Error fetching dashboard summary:', error);
        return {
            total_leads: 0,
            total_students: 0,
            total_payments: 0,
            total_applications: 0,
            total_revenue: 0,
        };
    }
};

export default {
    getLeadReports,
    getStudentReports,
    getCounselorPerformanceReports,
    getPaymentReports,
    getBranchReports,
    getApplicationReports,
    getVisaReports,
    exportReport,
    getDashboardSummary,
};
