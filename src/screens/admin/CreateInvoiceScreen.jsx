// Create Invoice Screen
import React, { useState, useEffect } from 'react';
import {
    View,
    Text,
    StyleSheet,
    ScrollView,
    TextInput,
    TouchableOpacity,
    ActivityIndicator,
    Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors, spacing, borderRadius, fontSizes, shadows } from '../../context/ThemeContext';
import { showToast } from '../../components/common/Toast';
import CustomHeader from '../../components/common/CustomHeader';
import FilterDropdown from '../../components/common/FilterDropdown';
import { BOTTOM_TAB_SPACING } from '../../utils/constants';
import { createInvoice, getUniversities } from '../../api/userApi';
import { getStudents } from '../../api/studentApi';
import { useAuth } from '../../context/AuthContext';

const PAYMENT_METHODS = [
    { value: 'bank_transfer', label: 'Bank Transfer' },
    { value: 'cash', label: 'Cash' },
    { value: 'credit_card', label: 'Credit Card' },
    { value: 'mobile_banking', label: 'Mobile Banking' },
    { value: 'cheque', label: 'Cheque' },
];

const PAYMENT_TYPES = [
    { value: 'application_fee', label: 'Application Fee' },
    { value: 'tuition_fee', label: 'Tuition Fee' },
    { value: 'visa_fee', label: 'Visa Fee' },
    { value: 'service_charge', label: 'Service Charge' },
    { value: 'consultation_fee', label: 'Consultation Fee' },
    { value: 'other', label: 'Other' },
];

const TAX_RATES = [
    { value: '0', label: '0%' },
    { value: '5', label: '5%' },
    { value: '10', label: '10%' },
    { value: '15', label: '15%' },
    { value: '18', label: '18%' },
];

const CreateInvoiceScreen = ({ navigation }) => {
    const { user } = useAuth();
    const [loading, setLoading] = useState(false);
    const [initLoading, setInitLoading] = useState(true);
    const [students, setStudents] = useState([]);
    const [universities, setUniversities] = useState([]);

    const [formData, setFormData] = useState({
        student_id: '',
        university_id: '',
        payment_method: 'bank_transfer',
        payment_type: 'application_fee',
        amount: '',
        tax_rate: '0',
        discount: '0',
        notes: '',
        due_date: '',
    });

    // Invoice items (for itemized invoices)
    const [items, setItems] = useState([
        { description: '', quantity: '1', unit_price: '', amount: '' }
    ]);

    useEffect(() => {
        loadInitialData();
    }, []);

    const loadInitialData = async () => {
        try {
            const [studentsData, universitiesData] = await Promise.all([
                getStudents(),
                getUniversities(),
            ]);

            const studentList = (studentsData?.data || studentsData || []).map(s => ({
                value: s.id.toString(),
                label: `${s.full_name || s.name} (${s.email || 'No email'})`,
            }));

            const uniList = (universitiesData?.data || universitiesData || []).map(u => ({
                value: u.id.toString(),
                label: u.name,
            }));

            setStudents(studentList);
            setUniversities(uniList);
        } catch (error) {
            console.error('Load initial data error:', error);
            showToast.error('Error', 'Failed to load data');
        } finally {
            setInitLoading(false);
        }
    };

    const handleInputChange = (field, value) => {
        setFormData(prev => ({ ...prev, [field]: value }));
    };

    const handleItemChange = (index, field, value) => {
        const updated = [...items];
        updated[index][field] = value;

        // Auto-calculate amount
        if (field === 'quantity' || field === 'unit_price') {
            const qty = parseFloat(updated[index].quantity) || 0;
            const price = parseFloat(updated[index].unit_price) || 0;
            updated[index].amount = (qty * price).toFixed(2);
        }

        setItems(updated);
    };

    const addItem = () => {
        setItems([...items, { description: '', quantity: '1', unit_price: '', amount: '' }]);
    };

    const removeItem = (index) => {
        if (items.length > 1) {
            setItems(items.filter((_, i) => i !== index));
        }
    };

    // Calculate totals
    const subtotal = items.reduce((sum, item) => sum + (parseFloat(item.amount) || 0), 0);
    const taxAmount = subtotal * (parseFloat(formData.tax_rate) / 100);
    const discountAmount = parseFloat(formData.discount) || 0;
    const grandTotal = subtotal + taxAmount - discountAmount;

    const validateForm = () => {
        if (!formData.student_id) {
            Alert.alert('Validation Error', 'Please select a student');
            return false;
        }
        if (!formData.university_id) {
            Alert.alert('Validation Error', 'Please select a university');
            return false;
        }
        if (items.every(item => !item.description && !item.amount)) {
            if (!formData.amount || parseFloat(formData.amount) <= 0) {
                Alert.alert('Validation Error', 'Please enter an amount or add invoice items');
                return false;
            }
        }
        return true;
    };

    const handleSubmit = async () => {
        if (!validateForm()) return;

        setLoading(true);
        try {
            // Generate invoice ID
            const invoiceId = `INV-${Date.now().toString().slice(-8)}`;

            // Calculate amounts
            const totalAmount = items.some(i => i.amount) ? subtotal : parseFloat(formData.amount) || 0;
            const calculatedTax = totalAmount * (parseFloat(formData.tax_rate) / 100);
            const total = totalAmount + calculatedTax - discountAmount;

            const payload = {
                invoice_id: invoiceId,
                student_id: formData.student_id,
                university_id: formData.university_id,
                payment_method: formData.payment_method,
                payment_type: formData.payment_type,
                payment_amount: totalAmount,
                tax: calculatedTax,
                discount: discountAmount,
                total: total,
                notes: formData.notes,
                due_date: formData.due_date || null,
                items: items.filter(i => i.description || i.amount),
                created_by: user?.id,
                payment_date: new Date().toISOString().split('T')[0],
                status: 'pending',
            };

            await createInvoice(payload);
            showToast.success('Success', 'Invoice created successfully');
            navigation.goBack();
        } catch (error) {
            console.error('Create invoice error:', error);
            showToast.error('Error', error.response?.data?.message || 'Failed to create invoice');
        } finally {
            setLoading(false);
        }
    };

    if (initLoading) {
        return (
            <View style={styles.container}>
                <CustomHeader title="Create Invoice" />
                <View style={styles.loadingContainer}>
                    <ActivityIndicator size="large" color={colors.primary} />
                    <Text style={styles.loadingText}>Loading...</Text>
                </View>
            </View>
        );
    }

    return (
        <View style={styles.container}>
            <CustomHeader title="Create Invoice" />
            <ScrollView
                style={styles.scrollView}
                contentContainerStyle={{ paddingBottom: BOTTOM_TAB_SPACING }}
                showsVerticalScrollIndicator={false}
            >
                {/* Student & University Selection */}
                <View style={[styles.section, shadows.sm]}>
                    <Text style={styles.sectionTitle}>Invoice Details</Text>

                    <FilterDropdown
                        label="Select Student *"
                        value={formData.student_id}
                        options={students}
                        onChange={(val) => handleInputChange('student_id', val)}
                        placeholder="Choose a student"
                    />

                    <FilterDropdown
                        label="Select University *"
                        value={formData.university_id}
                        options={universities}
                        onChange={(val) => handleInputChange('university_id', val)}
                        placeholder="Choose a university"
                    />

                    <View style={styles.row}>
                        <View style={styles.col}>
                            <FilterDropdown
                                label="Payment Method"
                                value={formData.payment_method}
                                options={PAYMENT_METHODS}
                                onChange={(val) => handleInputChange('payment_method', val)}
                            />
                        </View>
                        <View style={styles.col}>
                            <FilterDropdown
                                label="Payment Type"
                                value={formData.payment_type}
                                options={PAYMENT_TYPES}
                                onChange={(val) => handleInputChange('payment_type', val)}
                            />
                        </View>
                    </View>
                </View>

                {/* Quick Amount Entry */}
                <View style={[styles.section, shadows.sm]}>
                    <Text style={styles.sectionTitle}>Quick Amount Entry</Text>
                    <Text style={styles.helperText}>Enter a single amount or use itemized billing below</Text>

                    <View style={styles.inputGroup}>
                        <Text style={styles.label}>Amount</Text>
                        <View style={styles.amountInput}>
                            <Text style={styles.currencySymbol}>$</Text>
                            <TextInput
                                style={styles.amountField}
                                value={formData.amount}
                                onChangeText={(v) => handleInputChange('amount', v)}
                                placeholder="0.00"
                                keyboardType="numeric"
                            />
                        </View>
                    </View>
                </View>

                {/* Itemized Billing */}
                <View style={[styles.section, shadows.sm]}>
                    <View style={styles.sectionHeader}>
                        <Text style={styles.sectionTitle}>Itemized Billing</Text>
                        <TouchableOpacity style={styles.addItemBtn} onPress={addItem}>
                            <Ionicons name="add" size={20} color={colors.primary} />
                        </TouchableOpacity>
                    </View>

                    {items.map((item, index) => (
                        <View key={index} style={styles.itemRow}>
                            <View style={styles.itemHeader}>
                                <Text style={styles.itemNumber}>Item #{index + 1}</Text>
                                {items.length > 1 && (
                                    <TouchableOpacity onPress={() => removeItem(index)}>
                                        <Ionicons name="trash-outline" size={18} color={colors.danger} />
                                    </TouchableOpacity>
                                )}
                            </View>

                            <TextInput
                                style={styles.input}
                                value={item.description}
                                onChangeText={(v) => handleItemChange(index, 'description', v)}
                                placeholder="Description"
                            />

                            <View style={styles.row}>
                                <View style={[styles.col, { flex: 1 }]}>
                                    <Text style={styles.smallLabel}>Qty</Text>
                                    <TextInput
                                        style={styles.smallInput}
                                        value={item.quantity}
                                        onChangeText={(v) => handleItemChange(index, 'quantity', v)}
                                        keyboardType="numeric"
                                    />
                                </View>
                                <View style={[styles.col, { flex: 2 }]}>
                                    <Text style={styles.smallLabel}>Unit Price</Text>
                                    <TextInput
                                        style={styles.smallInput}
                                        value={item.unit_price}
                                        onChangeText={(v) => handleItemChange(index, 'unit_price', v)}
                                        placeholder="0.00"
                                        keyboardType="numeric"
                                    />
                                </View>
                                <View style={[styles.col, { flex: 2 }]}>
                                    <Text style={styles.smallLabel}>Amount</Text>
                                    <View style={[styles.smallInput, styles.readOnlyInput]}>
                                        <Text style={styles.readOnlyText}>${item.amount || '0.00'}</Text>
                                    </View>
                                </View>
                            </View>
                        </View>
                    ))}
                </View>

                {/* Tax & Discount */}
                <View style={[styles.section, shadows.sm]}>
                    <Text style={styles.sectionTitle}>Tax & Discount</Text>

                    <View style={styles.row}>
                        <View style={styles.col}>
                            <FilterDropdown
                                label="Tax Rate"
                                value={formData.tax_rate}
                                options={TAX_RATES}
                                onChange={(val) => handleInputChange('tax_rate', val)}
                            />
                        </View>
                        <View style={styles.col}>
                            <Text style={styles.label}>Discount</Text>
                            <TextInput
                                style={styles.input}
                                value={formData.discount}
                                onChangeText={(v) => handleInputChange('discount', v)}
                                placeholder="0.00"
                                keyboardType="numeric"
                            />
                        </View>
                    </View>
                </View>

                {/* Summary */}
                <View style={[styles.summarySection, shadows.md]}>
                    <Text style={styles.summaryTitle}>Invoice Summary</Text>
                    <View style={styles.summaryRow}>
                        <Text style={styles.summaryLabel}>Subtotal</Text>
                        <Text style={styles.summaryValue}>${(formData.amount || subtotal).toFixed(2)}</Text>
                    </View>
                    <View style={styles.summaryRow}>
                        <Text style={styles.summaryLabel}>Tax ({formData.tax_rate}%)</Text>
                        <Text style={styles.summaryValue}>${taxAmount.toFixed(2)}</Text>
                    </View>
                    <View style={styles.summaryRow}>
                        <Text style={styles.summaryLabel}>Discount</Text>
                        <Text style={[styles.summaryValue, { color: colors.danger }]}>-${discountAmount.toFixed(2)}</Text>
                    </View>
                    <View style={[styles.summaryRow, styles.totalRow]}>
                        <Text style={styles.totalLabel}>Grand Total</Text>
                        <Text style={styles.totalValue}>
                            ${((parseFloat(formData.amount) || subtotal) + taxAmount - discountAmount).toFixed(2)}
                        </Text>
                    </View>
                </View>

                {/* Notes */}
                <View style={[styles.section, shadows.sm]}>
                    <Text style={styles.sectionTitle}>Additional Information</Text>

                    <View style={styles.inputGroup}>
                        <Text style={styles.label}>Due Date</Text>
                        <TextInput
                            style={styles.input}
                            value={formData.due_date}
                            onChangeText={(v) => handleInputChange('due_date', v)}
                            placeholder="YYYY-MM-DD"
                        />
                    </View>

                    <View style={styles.inputGroup}>
                        <Text style={styles.label}>Notes</Text>
                        <TextInput
                            style={[styles.input, styles.textArea]}
                            value={formData.notes}
                            onChangeText={(v) => handleInputChange('notes', v)}
                            placeholder="Additional notes or terms..."
                            multiline
                            numberOfLines={4}
                        />
                    </View>
                </View>

                {/* Submit Button */}
                <TouchableOpacity
                    style={[styles.submitButton, loading && styles.disabledButton]}
                    onPress={handleSubmit}
                    disabled={loading}
                >
                    {loading ? (
                        <ActivityIndicator color={colors.white} />
                    ) : (
                        <>
                            <Ionicons name="receipt-outline" size={20} color={colors.white} />
                            <Text style={styles.submitButtonText}>Create Invoice</Text>
                        </>
                    )}
                </TouchableOpacity>
            </ScrollView>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: colors.background,
    },
    loadingContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    loadingText: {
        marginTop: spacing.sm,
        color: colors.textSecondary,
    },
    scrollView: {
        flex: 1,
        padding: spacing.md,
    },
    section: {
        backgroundColor: colors.white,
        borderRadius: borderRadius.lg,
        padding: spacing.md,
        marginBottom: spacing.md,
    },
    sectionHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: spacing.sm,
    },
    sectionTitle: {
        fontSize: fontSizes.md,
        fontWeight: '700',
        color: colors.text,
        marginBottom: spacing.sm,
    },
    helperText: {
        fontSize: fontSizes.xs,
        color: colors.textSecondary,
        marginBottom: spacing.md,
    },
    row: {
        flexDirection: 'row',
        gap: spacing.sm,
    },
    col: {
        flex: 1,
    },
    inputGroup: {
        marginBottom: spacing.md,
    },
    label: {
        fontSize: fontSizes.sm,
        fontWeight: '600',
        color: colors.textSecondary,
        marginBottom: 6,
    },
    smallLabel: {
        fontSize: fontSizes.xs,
        fontWeight: '600',
        color: colors.textSecondary,
        marginBottom: 4,
    },
    input: {
        backgroundColor: colors.gray50,
        borderRadius: borderRadius.md,
        padding: spacing.md,
        fontSize: fontSizes.md,
        color: colors.text,
        borderWidth: 1,
        borderColor: colors.gray200,
    },
    smallInput: {
        backgroundColor: colors.gray50,
        borderRadius: borderRadius.sm,
        padding: spacing.sm,
        fontSize: fontSizes.sm,
        color: colors.text,
        borderWidth: 1,
        borderColor: colors.gray200,
    },
    readOnlyInput: {
        backgroundColor: colors.gray100,
        justifyContent: 'center',
    },
    readOnlyText: {
        fontSize: fontSizes.sm,
        color: colors.text,
        fontWeight: '600',
    },
    textArea: {
        height: 100,
        textAlignVertical: 'top',
    },
    amountInput: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: colors.gray50,
        borderRadius: borderRadius.md,
        borderWidth: 1,
        borderColor: colors.gray200,
    },
    currencySymbol: {
        paddingLeft: spacing.md,
        fontSize: fontSizes.lg,
        fontWeight: '700',
        color: colors.primary,
    },
    amountField: {
        flex: 1,
        padding: spacing.md,
        fontSize: fontSizes.lg,
        fontWeight: '600',
        color: colors.text,
    },
    addItemBtn: {
        width: 32,
        height: 32,
        borderRadius: 16,
        backgroundColor: `${colors.primary}15`,
        alignItems: 'center',
        justifyContent: 'center',
    },
    itemRow: {
        backgroundColor: colors.gray50,
        borderRadius: borderRadius.md,
        padding: spacing.sm,
        marginBottom: spacing.sm,
    },
    itemHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: spacing.xs,
    },
    itemNumber: {
        fontSize: fontSizes.xs,
        fontWeight: '600',
        color: colors.primary,
    },
    summarySection: {
        backgroundColor: colors.primary,
        borderRadius: borderRadius.lg,
        padding: spacing.lg,
        marginBottom: spacing.md,
    },
    summaryTitle: {
        fontSize: fontSizes.md,
        fontWeight: '700',
        color: colors.white,
        marginBottom: spacing.md,
    },
    summaryRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginBottom: spacing.xs,
    },
    summaryLabel: {
        fontSize: fontSizes.sm,
        color: 'rgba(255,255,255,0.8)',
    },
    summaryValue: {
        fontSize: fontSizes.sm,
        fontWeight: '600',
        color: colors.white,
    },
    totalRow: {
        marginTop: spacing.sm,
        paddingTop: spacing.sm,
        borderTopWidth: 1,
        borderTopColor: 'rgba(255,255,255,0.3)',
    },
    totalLabel: {
        fontSize: fontSizes.lg,
        fontWeight: '700',
        color: colors.white,
    },
    totalValue: {
        fontSize: fontSizes.xl,
        fontWeight: '800',
        color: colors.white,
    },
    submitButton: {
        backgroundColor: colors.success,
        borderRadius: borderRadius.lg,
        padding: spacing.lg,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        ...shadows.md,
    },
    disabledButton: {
        opacity: 0.7,
    },
    submitButtonText: {
        color: colors.white,
        fontSize: fontSizes.md,
        fontWeight: '700',
        marginLeft: spacing.sm,
    },
});

export default CreateInvoiceScreen;
