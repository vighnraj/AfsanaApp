// Invoice Download Screen

import React, { useState, useEffect, useContext } from 'react';
import {
    View,
    Text,
    StyleSheet,
    ScrollView,
    TouchableOpacity,
    ActivityIndicator,
    RefreshControl,
    TextInput,
    Modal,
    Alert,
    Platform,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import * as Print from 'expo-print';
import * as Sharing from 'expo-sharing';
import * as FileSystem from 'expo-file-system';

import { AuthContext } from '../../context/AuthContext';
import { colors, spacing, borderRadius, fontSizes, shadows } from '../../context/ThemeContext';
import { showToast } from '../../components/common/Toast';
import { getStudentInvoices, getPaymentsByStudentId } from '../../api/applicationApi';
import DatePickerModal from '../../components/common/DatePickerModal';

const InvoiceDownloadScreen = ({ navigation }) => {
    const { user } = useContext(AuthContext);
    const [loading, setLoading] = useState(false);
    const [refreshing, setRefreshing] = useState(false);
    const [invoices, setInvoices] = useState([]);
    const [filteredInvoices, setFilteredInvoices] = useState([]);

    // Filters
    const [searchQuery, setSearchQuery] = useState('');
    const [startDate, setStartDate] = useState(null);
    const [endDate, setEndDate] = useState(null);
    const [showFilters, setShowFilters] = useState(false);

    // Date Picker
    const [showDatePicker, setShowDatePicker] = useState(false);
    const [datePickerMode, setDatePickerMode] = useState('start');

    // Invoice Detail Modal
    const [showInvoiceModal, setShowInvoiceModal] = useState(false);
    const [selectedInvoice, setSelectedInvoice] = useState(null);
    const [invoicePayments, setInvoicePayments] = useState([]);

    useEffect(() => {
        fetchInvoices();
    }, []);

    // Apply filters
    useEffect(() => {
        let filtered = [...invoices];

        // Search filter
        if (searchQuery) {
            filtered = filtered.filter(
                (invoice) =>
                    invoice.student_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
                    invoice.invoice_id?.toLowerCase().includes(searchQuery.toLowerCase())
            );
        }

        // Date range filter
        if (startDate) {
            filtered = filtered.filter(
                (invoice) => new Date(invoice.payment_date) >= new Date(startDate)
            );
        }
        if (endDate) {
            filtered = filtered.filter(
                (invoice) => new Date(invoice.payment_date) <= new Date(endDate)
            );
        }

        setFilteredInvoices(filtered);
    }, [searchQuery, startDate, endDate, invoices]);

    const fetchInvoices = async () => {
        setLoading(true);
        try {
            const data = await getStudentInvoices(user.id);
            setInvoices(data);
            setFilteredInvoices(data);
        } catch (error) {
            console.error('Fetch invoices error:', error);
            showToast.error('Error', 'Failed to fetch invoices');
        } finally {
            setLoading(false);
        }
    };

    const onRefresh = async () => {
        setRefreshing(true);
        await fetchInvoices();
        setRefreshing(false);
    };

    const handleClearFilters = () => {
        setSearchQuery('');
        setStartDate(null);
        setEndDate(null);
    };

    const handleDateSelect = (date) => {
        if (datePickerMode === 'start') {
            setStartDate(date);
        } else {
            setEndDate(date);
        }
        setShowDatePicker(false);
    };

    const openDatePicker = (mode) => {
        setDatePickerMode(mode);
        setShowDatePicker(true);
    };

    const formatDate = (dateString) => {
        if (!dateString) return 'N/A';
        const date = new Date(dateString);
        return date.toLocaleDateString('en-GB');
    };

    const formatCurrency = (amount) => {
        if (!amount) return '₹0.00';
        return `₹${parseFloat(amount).toLocaleString('en-IN', {
            minimumFractionDigits: 2,
            maximumFractionDigits: 2,
        })}`;
    };

    const handleViewInvoice = async (invoice) => {
        setSelectedInvoice(invoice);
        try {
            // Fetch detailed payment information
            const payments = await getPaymentsByStudentId(invoice.student_id);
            setInvoicePayments(payments);
            setShowInvoiceModal(true);
        } catch (error) {
            console.error('Fetch payment details error:', error);
            showToast.error('Error', 'Failed to fetch payment details');
        }
    };

    const generateInvoiceHTML = (invoice, payments) => {
        const totalAmount = parseFloat(invoice.payment_amount || 0);
        const taxAmount = parseFloat(invoice.tax || 0);
        const grandTotal = parseFloat(invoice.total || 0);

        return `
            <!DOCTYPE html>
            <html>
            <head>
                <meta charset="UTF-8">
                <style>
                    body {
                        font-family: Arial, sans-serif;
                        padding: 40px;
                        line-height: 1.6;
                    }
                    .header {
                        text-align: center;
                        margin-bottom: 30px;
                        border-bottom: 3px solid #2196F3;
                        padding-bottom: 20px;
                    }
                    .header h1 {
                        color: #2196F3;
                        margin: 0;
                        font-size: 32px;
                    }
                    .header p {
                        margin: 5px 0;
                        color: #666;
                    }
                    .invoice-info {
                        display: flex;
                        justify-content: space-between;
                        margin-bottom: 30px;
                    }
                    .invoice-info div {
                        width: 48%;
                    }
                    .invoice-info h3 {
                        color: #2196F3;
                        margin-bottom: 10px;
                        font-size: 18px;
                    }
                    .invoice-info p {
                        margin: 5px 0;
                        color: #333;
                    }
                    table {
                        width: 100%;
                        border-collapse: collapse;
                        margin-bottom: 30px;
                    }
                    th {
                        background-color: #2196F3;
                        color: white;
                        padding: 12px;
                        text-align: left;
                        font-weight: 600;
                    }
                    td {
                        padding: 12px;
                        border-bottom: 1px solid #ddd;
                    }
                    .totals {
                        float: right;
                        width: 300px;
                        margin-top: 20px;
                    }
                    .totals table {
                        margin: 0;
                    }
                    .totals td {
                        border: none;
                        padding: 8px;
                    }
                    .totals .grand-total {
                        background-color: #2196F3;
                        color: white;
                        font-weight: bold;
                        font-size: 18px;
                    }
                    .footer {
                        clear: both;
                        text-align: center;
                        margin-top: 50px;
                        padding-top: 20px;
                        border-top: 2px solid #ddd;
                        color: #666;
                        font-size: 14px;
                    }
                    .notes {
                        margin-top: 30px;
                        padding: 15px;
                        background-color: #f5f5f5;
                        border-left: 4px solid #2196F3;
                    }
                    .notes h4 {
                        margin: 0 0 10px 0;
                        color: #2196F3;
                    }
                </style>
            </head>
            <body>
                <div class="header">
                    <h1>INVOICE</h1>
                    <p>Student Recruitment CRM</p>
                    <p>Email: info@crm.com | Phone: +1-234-567-8900</p>
                </div>

                <div class="invoice-info">
                    <div>
                        <h3>Invoice Details</h3>
                        <p><strong>Invoice ID:</strong> ${invoice.invoice_id || 'N/A'}</p>
                        <p><strong>Date:</strong> ${formatDate(invoice.payment_date)}</p>
                        <p><strong>Payment Method:</strong> ${invoice.payment_method || 'N/A'}</p>
                    </div>
                    <div>
                        <h3>Student Information</h3>
                        <p><strong>Name:</strong> ${invoice.student_name || 'N/A'}</p>
                        <p><strong>Email:</strong> ${invoice.email || 'N/A'}</p>
                        <p><strong>University:</strong> ${invoice.university || 'N/A'}</p>
                    </div>
                </div>

                <table>
                    <thead>
                        <tr>
                            <th>Description</th>
                            <th>Payment Type</th>
                            <th>Amount</th>
                        </tr>
                    </thead>
                    <tbody>
                        ${payments.map((payment) => `
                            <tr>
                                <td>${payment.note || 'Payment'}</td>
                                <td>${payment.payment_type || 'N/A'}</td>
                                <td>${formatCurrency(payment.amount)}</td>
                            </tr>
                        `).join('')}
                    </tbody>
                </table>

                <div class="totals">
                    <table>
                        <tr>
                            <td><strong>Subtotal:</strong></td>
                            <td style="text-align: right;">${formatCurrency(totalAmount)}</td>
                        </tr>
                        <tr>
                            <td><strong>Tax:</strong></td>
                            <td style="text-align: right;">${formatCurrency(taxAmount)}</td>
                        </tr>
                        <tr class="grand-total">
                            <td><strong>Total:</strong></td>
                            <td style="text-align: right;">${formatCurrency(grandTotal)}</td>
                        </tr>
                    </table>
                </div>

                ${invoice.notes ? `
                <div class="notes">
                    <h4>Notes</h4>
                    <p>${invoice.notes}</p>
                </div>
                ` : ''}

                <div class="footer">
                    <p>Thank you for your payment!</p>
                    <p>This is a computer-generated invoice and does not require a signature.</p>
                </div>
            </body>
            </html>
        `;
    };

    const handleDownloadInvoice = async () => {
        if (!selectedInvoice) return;

        try {
            showToast.info('Generating', 'Creating PDF invoice...');

            const html = generateInvoiceHTML(selectedInvoice, invoicePayments);

            // Generate PDF
            const { uri } = await Print.printToFileAsync({ html });

            // Define file path
            const fileName = `Invoice_${selectedInvoice.invoice_id || 'Unknown'}.pdf`;
            const fileUri = `${FileSystem.documentDirectory}${fileName}`;

            // Move file
            await FileSystem.moveAsync({
                from: uri,
                to: fileUri,
            });

            // Share or save
            if (await Sharing.isAvailableAsync()) {
                await Sharing.shareAsync(fileUri, {
                    mimeType: 'application/pdf',
                    dialogTitle: 'Download Invoice',
                    UTI: 'com.adobe.pdf',
                });
                showToast.success('Success', 'Invoice downloaded successfully');
            } else {
                Alert.alert('Success', `Invoice saved to: ${fileUri}`);
            }
        } catch (error) {
            console.error('Download invoice error:', error);
            showToast.error('Error', 'Failed to download invoice');
        }
    };

    const handlePrintInvoice = async () => {
        if (!selectedInvoice) return;

        try {
            const html = generateInvoiceHTML(selectedInvoice, invoicePayments);
            await Print.printAsync({ html });
        } catch (error) {
            console.error('Print invoice error:', error);
            showToast.error('Error', 'Failed to print invoice');
        }
    };

    const renderInvoiceCard = (invoice) => (
        <TouchableOpacity
            key={invoice.id}
            style={[styles.card, shadows.sm]}
            onPress={() => handleViewInvoice(invoice)}
        >
            <View style={styles.cardHeader}>
                <View style={styles.invoiceIdContainer}>
                    <Ionicons name="receipt" size={20} color={colors.primary} />
                    <Text style={styles.invoiceId}>{invoice.invoice_id || 'N/A'}</Text>
                </View>
                <Text style={styles.invoiceDate}>{formatDate(invoice.payment_date)}</Text>
            </View>

            <View style={styles.cardBody}>
                <View style={styles.infoRow}>
                    <Ionicons name="person" size={16} color={colors.textSecondary} />
                    <Text style={styles.studentName}>{invoice.student_name || 'N/A'}</Text>
                </View>
                <View style={styles.infoRow}>
                    <Ionicons name="school" size={16} color={colors.textSecondary} />
                    <Text style={styles.universityName} numberOfLines={1}>
                        {invoice.university || 'N/A'}
                    </Text>
                </View>
            </View>

            <View style={styles.cardFooter}>
                <View style={styles.amountContainer}>
                    <Text style={styles.amountLabel}>Total Amount</Text>
                    <Text style={styles.amountValue}>{formatCurrency(invoice.total)}</Text>
                </View>
                <Ionicons name="chevron-forward" size={20} color={colors.primary} />
            </View>
        </TouchableOpacity>
    );

    return (
        <View style={styles.container}>
            {/* Header */}
            <View style={[styles.header, shadows.sm]}>
                <TouchableOpacity onPress={() => navigation.goBack()}>
                    <Ionicons name="arrow-back" size={24} color={colors.text} />
                </TouchableOpacity>
                <Text style={styles.headerTitle}>Student Invoices</Text>
                <TouchableOpacity onPress={() => setShowFilters(!showFilters)}>
                    <Ionicons
                        name={showFilters ? 'close' : 'filter'}
                        size={24}
                        color={colors.primary}
                    />
                </TouchableOpacity>
            </View>

            {/* Filters */}
            {showFilters && (
                <View style={[styles.filterPanel, shadows.sm]}>
                    <TextInput
                        style={styles.searchInput}
                        placeholder="Search by student or invoice ID..."
                        value={searchQuery}
                        onChangeText={setSearchQuery}
                        placeholderTextColor={colors.textSecondary}
                    />

                    <View style={styles.dateFilters}>
                        <TouchableOpacity
                            style={styles.dateButton}
                            onPress={() => openDatePicker('start')}
                        >
                            <Ionicons name="calendar" size={16} color={colors.primary} />
                            <Text style={styles.dateButtonText}>
                                {startDate ? formatDate(startDate) : 'Start Date'}
                            </Text>
                        </TouchableOpacity>

                        <TouchableOpacity
                            style={styles.dateButton}
                            onPress={() => openDatePicker('end')}
                        >
                            <Ionicons name="calendar" size={16} color={colors.primary} />
                            <Text style={styles.dateButtonText}>
                                {endDate ? formatDate(endDate) : 'End Date'}
                            </Text>
                        </TouchableOpacity>
                    </View>

                    <TouchableOpacity style={styles.clearButton} onPress={handleClearFilters}>
                        <Text style={styles.clearButtonText}>Clear Filters</Text>
                    </TouchableOpacity>
                </View>
            )}

            {/* Content */}
            {loading ? (
                <View style={styles.loadingContainer}>
                    <ActivityIndicator size="large" color={colors.primary} />
                    <Text style={styles.loadingText}>Loading invoices...</Text>
                </View>
            ) : (
                <ScrollView
                    style={styles.content}
                    refreshControl={
                        <RefreshControl
                            refreshing={refreshing}
                            onRefresh={onRefresh}
                            colors={[colors.primary]}
                        />
                    }
                >
                    {filteredInvoices.length === 0 ? (
                        <View style={styles.emptyContainer}>
                            <Ionicons name="receipt-outline" size={64} color={colors.gray300} />
                            <Text style={styles.emptyText}>No invoices found</Text>
                        </View>
                    ) : (
                        filteredInvoices.map((invoice) => renderInvoiceCard(invoice))
                    )}
                </ScrollView>
            )}

            {/* Invoice Detail Modal */}
            <Modal visible={showInvoiceModal} animationType="slide" transparent>
                <View style={styles.modalOverlay}>
                    <View style={[styles.modalContainer, shadows.lg]}>
                        {/* Modal Header */}
                        <View style={styles.modalHeader}>
                            <Text style={styles.modalTitle}>Invoice Details</Text>
                            <TouchableOpacity onPress={() => setShowInvoiceModal(false)}>
                                <Ionicons name="close" size={24} color={colors.text} />
                            </TouchableOpacity>
                        </View>

                        {selectedInvoice && (
                            <ScrollView style={styles.modalContent}>
                                {/* Invoice Info */}
                                <View style={styles.invoiceSection}>
                                    <Text style={styles.sectionTitle}>Invoice Information</Text>
                                    <View style={styles.detailRow}>
                                        <Text style={styles.detailLabel}>Invoice ID:</Text>
                                        <Text style={styles.detailValue}>
                                            {selectedInvoice.invoice_id || 'N/A'}
                                        </Text>
                                    </View>
                                    <View style={styles.detailRow}>
                                        <Text style={styles.detailLabel}>Date:</Text>
                                        <Text style={styles.detailValue}>
                                            {formatDate(selectedInvoice.payment_date)}
                                        </Text>
                                    </View>
                                    <View style={styles.detailRow}>
                                        <Text style={styles.detailLabel}>Payment Method:</Text>
                                        <Text style={styles.detailValue}>
                                            {selectedInvoice.payment_method || 'N/A'}
                                        </Text>
                                    </View>
                                </View>

                                {/* Student Info */}
                                <View style={styles.invoiceSection}>
                                    <Text style={styles.sectionTitle}>Student Information</Text>
                                    <View style={styles.detailRow}>
                                        <Text style={styles.detailLabel}>Name:</Text>
                                        <Text style={styles.detailValue}>
                                            {selectedInvoice.student_name || 'N/A'}
                                        </Text>
                                    </View>
                                    <View style={styles.detailRow}>
                                        <Text style={styles.detailLabel}>Email:</Text>
                                        <Text style={styles.detailValue}>
                                            {selectedInvoice.email || 'N/A'}
                                        </Text>
                                    </View>
                                    <View style={styles.detailRow}>
                                        <Text style={styles.detailLabel}>University:</Text>
                                        <Text style={styles.detailValue}>
                                            {selectedInvoice.university || 'N/A'}
                                        </Text>
                                    </View>
                                </View>

                                {/* Payment Breakdown */}
                                <View style={styles.invoiceSection}>
                                    <Text style={styles.sectionTitle}>Payment Details</Text>
                                    {invoicePayments.map((payment, index) => (
                                        <View key={index} style={styles.paymentItem}>
                                            <Text style={styles.paymentDescription}>
                                                {payment.note || 'Payment'}
                                            </Text>
                                            <Text style={styles.paymentAmount}>
                                                {formatCurrency(payment.amount)}
                                            </Text>
                                        </View>
                                    ))}
                                </View>

                                {/* Totals */}
                                <View style={styles.totalsSection}>
                                    <View style={styles.totalRow}>
                                        <Text style={styles.totalLabel}>Subtotal:</Text>
                                        <Text style={styles.totalValue}>
                                            {formatCurrency(selectedInvoice.payment_amount)}
                                        </Text>
                                    </View>
                                    <View style={styles.totalRow}>
                                        <Text style={styles.totalLabel}>Tax:</Text>
                                        <Text style={styles.totalValue}>
                                            {formatCurrency(selectedInvoice.tax)}
                                        </Text>
                                    </View>
                                    <View style={[styles.totalRow, styles.grandTotalRow]}>
                                        <Text style={styles.grandTotalLabel}>Total:</Text>
                                        <Text style={styles.grandTotalValue}>
                                            {formatCurrency(selectedInvoice.total)}
                                        </Text>
                                    </View>
                                </View>

                                {selectedInvoice.notes && (
                                    <View style={styles.notesSection}>
                                        <Text style={styles.sectionTitle}>Notes</Text>
                                        <Text style={styles.notesText}>{selectedInvoice.notes}</Text>
                                    </View>
                                )}
                            </ScrollView>
                        )}

                        {/* Modal Footer */}
                        <View style={styles.modalFooter}>
                            <TouchableOpacity
                                style={[styles.actionButton, styles.printButton]}
                                onPress={handlePrintInvoice}
                            >
                                <Ionicons name="print" size={20} color={colors.primary} />
                                <Text style={styles.printButtonText}>Print</Text>
                            </TouchableOpacity>

                            <TouchableOpacity
                                style={[styles.actionButton, styles.downloadButton]}
                                onPress={handleDownloadInvoice}
                            >
                                <Ionicons name="download" size={20} color={colors.white} />
                                <Text style={styles.downloadButtonText}>Download PDF</Text>
                            </TouchableOpacity>
                        </View>
                    </View>
                </View>
            </Modal>

            {/* Date Picker Modal */}
            <DatePickerModal
                visible={showDatePicker}
                onClose={() => setShowDatePicker(false)}
                onSelectDate={handleDateSelect}
                selectedDate={datePickerMode === 'start' ? startDate : endDate}
            />
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: colors.background,
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: spacing.md,
        backgroundColor: colors.white,
    },
    headerTitle: {
        fontSize: fontSizes.lg,
        fontWeight: '700',
        color: colors.text,
    },
    filterPanel: {
        padding: spacing.md,
        backgroundColor: colors.white,
        borderBottomWidth: 1,
        borderBottomColor: colors.gray100,
    },
    searchInput: {
        padding: spacing.sm,
        backgroundColor: colors.gray50,
        borderRadius: borderRadius.md,
        fontSize: fontSizes.sm,
        color: colors.text,
        marginBottom: spacing.sm,
    },
    dateFilters: {
        flexDirection: 'row',
        gap: spacing.sm,
        marginBottom: spacing.sm,
    },
    dateButton: {
        flex: 1,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        padding: spacing.sm,
        backgroundColor: `${colors.primary}10`,
        borderRadius: borderRadius.md,
        gap: spacing.xs,
    },
    dateButtonText: {
        fontSize: fontSizes.sm,
        color: colors.primary,
        fontWeight: '500',
    },
    clearButton: {
        padding: spacing.sm,
        backgroundColor: colors.gray100,
        borderRadius: borderRadius.md,
        alignItems: 'center',
    },
    clearButtonText: {
        fontSize: fontSizes.sm,
        color: colors.textSecondary,
        fontWeight: '600',
    },
    loadingContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    loadingText: {
        marginTop: spacing.sm,
        fontSize: fontSizes.sm,
        color: colors.textSecondary,
    },
    content: {
        flex: 1,
        padding: spacing.md,
    },
    emptyContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        paddingVertical: spacing.xxl,
    },
    emptyText: {
        marginTop: spacing.md,
        fontSize: fontSizes.md,
        color: colors.textSecondary,
    },
    card: {
        backgroundColor: colors.white,
        borderRadius: borderRadius.lg,
        padding: spacing.md,
        marginBottom: spacing.md,
    },
    cardHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: spacing.sm,
    },
    invoiceIdContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: spacing.xs,
    },
    invoiceId: {
        fontSize: fontSizes.md,
        fontWeight: '700',
        color: colors.text,
    },
    invoiceDate: {
        fontSize: fontSizes.xs,
        color: colors.textSecondary,
    },
    cardBody: {
        marginBottom: spacing.sm,
    },
    infoRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: spacing.xs,
        marginBottom: spacing.xs,
    },
    studentName: {
        fontSize: fontSizes.sm,
        color: colors.text,
        fontWeight: '500',
    },
    universityName: {
        fontSize: fontSizes.sm,
        color: colors.textSecondary,
        flex: 1,
    },
    cardFooter: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingTop: spacing.sm,
        borderTopWidth: 1,
        borderTopColor: colors.gray100,
    },
    amountContainer: {
        flex: 1,
    },
    amountLabel: {
        fontSize: fontSizes.xs,
        color: colors.textSecondary,
        marginBottom: 2,
    },
    amountValue: {
        fontSize: fontSizes.lg,
        fontWeight: '700',
        color: colors.primary,
    },
    modalOverlay: {
        flex: 1,
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
        justifyContent: 'flex-end',
    },
    modalContainer: {
        backgroundColor: colors.white,
        borderTopLeftRadius: borderRadius.xl,
        borderTopRightRadius: borderRadius.xl,
        maxHeight: '90%',
    },
    modalHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: spacing.md,
        borderBottomWidth: 1,
        borderBottomColor: colors.gray100,
    },
    modalTitle: {
        fontSize: fontSizes.lg,
        fontWeight: '700',
        color: colors.text,
    },
    modalContent: {
        padding: spacing.md,
    },
    invoiceSection: {
        marginBottom: spacing.md,
        padding: spacing.md,
        backgroundColor: colors.gray50,
        borderRadius: borderRadius.md,
    },
    sectionTitle: {
        fontSize: fontSizes.md,
        fontWeight: '700',
        color: colors.text,
        marginBottom: spacing.sm,
    },
    detailRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginBottom: spacing.xs,
    },
    detailLabel: {
        fontSize: fontSizes.sm,
        color: colors.textSecondary,
        fontWeight: '500',
    },
    detailValue: {
        fontSize: fontSizes.sm,
        color: colors.text,
        fontWeight: '600',
        flex: 1,
        textAlign: 'right',
    },
    paymentItem: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        paddingVertical: spacing.xs,
        borderBottomWidth: 1,
        borderBottomColor: colors.gray100,
    },
    paymentDescription: {
        fontSize: fontSizes.sm,
        color: colors.text,
        flex: 1,
    },
    paymentAmount: {
        fontSize: fontSizes.sm,
        color: colors.text,
        fontWeight: '600',
    },
    totalsSection: {
        marginBottom: spacing.md,
        padding: spacing.md,
        backgroundColor: colors.gray50,
        borderRadius: borderRadius.md,
    },
    totalRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginBottom: spacing.xs,
    },
    totalLabel: {
        fontSize: fontSizes.sm,
        color: colors.textSecondary,
        fontWeight: '500',
    },
    totalValue: {
        fontSize: fontSizes.sm,
        color: colors.text,
        fontWeight: '600',
    },
    grandTotalRow: {
        paddingTop: spacing.sm,
        borderTopWidth: 2,
        borderTopColor: colors.primary,
        marginTop: spacing.xs,
    },
    grandTotalLabel: {
        fontSize: fontSizes.md,
        color: colors.text,
        fontWeight: '700',
    },
    grandTotalValue: {
        fontSize: fontSizes.md,
        color: colors.primary,
        fontWeight: '700',
    },
    notesSection: {
        marginBottom: spacing.md,
        padding: spacing.md,
        backgroundColor: `${colors.info}10`,
        borderLeftWidth: 4,
        borderLeftColor: colors.info,
        borderRadius: borderRadius.md,
    },
    notesText: {
        fontSize: fontSizes.sm,
        color: colors.text,
        lineHeight: 20,
    },
    modalFooter: {
        flexDirection: 'row',
        padding: spacing.md,
        borderTopWidth: 1,
        borderTopColor: colors.gray100,
        gap: spacing.sm,
    },
    actionButton: {
        flex: 1,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        padding: spacing.sm,
        borderRadius: borderRadius.md,
        gap: spacing.xs,
    },
    printButton: {
        backgroundColor: `${colors.primary}10`,
    },
    printButtonText: {
        fontSize: fontSizes.sm,
        fontWeight: '600',
        color: colors.primary,
    },
    downloadButton: {
        backgroundColor: colors.primary,
    },
    downloadButtonText: {
        fontSize: fontSizes.sm,
        fontWeight: '600',
        color: colors.white,
    },
});

export default InvoiceDownloadScreen;
