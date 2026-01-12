// Payments Screen - Admin with Full CRUD

import React, { useState, useEffect, useCallback } from 'react';
import {
    View,
    Text,
    StyleSheet,
    FlatList,
    TouchableOpacity,
    RefreshControl,
    Modal,
    TextInput,
    ScrollView,
    Alert,
    ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';

import { getPayments } from '../../api/userApi';
import { createPayment } from '../../api/applicationApi';
import api from '../../api/index';
import { colors, spacing, borderRadius, fontSizes, shadows } from '../../context/ThemeContext';
import { LoadingSpinner } from '../../components/common/Loading';
import { showToast } from '../../components/common/Toast';
import { formatDateReadable, formatCurrency } from '../../utils/formatting';
import FilterDropdown from '../../components/common/FilterDropdown';
import { BOTTOM_TAB_SPACING, BOTTOM_TAB_HEIGHT } from '../../utils/constants';
import { validateWithToast } from '../../utils/validation';

const PAYMENT_STATUS_OPTIONS = ['Pending', 'Paid', 'Overdue', 'Cancelled'];
const PAYMENT_TYPE_OPTIONS = ['Tuition', 'Application Fee', 'Visa Fee', 'Other'];

const PaymentsScreen = ({ navigation }) => {
    const [payments, setPayments] = useState([]);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const [showAnalytics, setShowAnalytics] = useState(true);

    // Calculate analytics
    const analytics = React.useMemo(() => {
        const totalPayments = payments.length;
        const paidPayments = payments.filter(p => String(p.status || '').toLowerCase() === 'paid');
        const pendingPayments = payments.filter(p => String(p.status || '').toLowerCase() === 'pending');
        const overduePayments = payments.filter(p => String(p.status || '').toLowerCase() === 'overdue');

        const totalCollected = paidPayments.reduce((sum, p) => sum + (parseFloat(p.amount || p.total_amount) || 0), 0);
        const totalPending = pendingPayments.reduce((sum, p) => sum + (parseFloat(p.amount || p.total_amount) || 0), 0);
        const totalOverdue = overduePayments.reduce((sum, p) => sum + (parseFloat(p.amount || p.total_amount) || 0), 0);
        const totalAmount = payments.reduce((sum, p) => sum + (parseFloat(p.amount || p.total_amount) || 0), 0);

        // Payment types breakdown
        const byType = {};
        payments.forEach(p => {
            const type = p.payment_type || 'Other';
            byType[type] = (byType[type] || 0) + (parseFloat(p.amount || p.total_amount) || 0);
        });

        return {
            totalPayments,
            paidCount: paidPayments.length,
            pendingCount: pendingPayments.length,
            overdueCount: overduePayments.length,
            totalCollected,
            totalPending,
            totalOverdue,
            totalAmount,
            collectionRate: totalAmount > 0 ? ((totalCollected / totalAmount) * 100).toFixed(1) : 0,
            byType,
        };
    }, [payments]);

    // Modal State
    const [modalVisible, setModalVisible] = useState(false);
    const [saving, setSaving] = useState(false);
    const [editingPayment, setEditingPayment] = useState(null);
    const [formData, setFormData] = useState({
        student_name: '',
        amount: '',
        description: '',
        due_date: '',
        status: 'Pending',
        payment_type: 'Tuition',
    });

    const fetchPayments = useCallback(async () => {
        try {
            const data = await getPayments();
            setPayments(Array.isArray(data) ? data : data.payments || []);
        } catch (error) {
            console.error('Fetch payments error:', error);
            showToast.error('Error', 'Failed to load payments');
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    }, []);

    useEffect(() => {
        fetchPayments();
    }, [fetchPayments]);

    const onRefresh = () => {
        setRefreshing(true);
        fetchPayments();
    };

    const handleCreatePayment = () => {
        setEditingPayment(null);
        setFormData({
            student_name: '',
            amount: '',
            description: '',
            due_date: '',
            status: 'Pending',
            payment_type: 'Tuition',
        });
        setModalVisible(true);
    };

    const handleEditPayment = (payment) => {
        setEditingPayment(payment);
        setFormData({
            student_name: payment.student_name || '',
            amount: String(payment.amount || payment.total_amount || ''),
            description: payment.description || '',
            due_date: payment.due_date || '',
            status: payment.status || 'Pending',
            payment_type: payment.payment_type || 'Tuition',
        });
        setModalVisible(true);
    };

    const handleDeletePayment = (paymentId, studentName) => {
        Alert.alert(
            'Delete Payment',
            `Are you sure you want to delete the payment for "${studentName}"?`,
            [
                { text: 'Cancel', style: 'cancel' },
                {
                    text: 'Delete',
                    style: 'destructive',
                    onPress: async () => {
                        try {
                            await api.delete(`payments/${paymentId}`);
                            showToast.success('Success', 'Payment deleted successfully');
                            fetchPayments();
                        } catch (error) {
                            console.error('Delete payment error:', error);
                            showToast.error('Error', 'Failed to delete payment');
                        }
                    }
                }
            ]
        );
    };

    const handleUpdateStatus = async (paymentId, newStatus) => {
        try {
            await api.patch(`payments/${paymentId}`, { status: newStatus });
            showToast.success('Success', `Status updated to ${newStatus}`);
            fetchPayments();
        } catch (error) {
            console.error('Update status error:', error);
            showToast.error('Error', 'Failed to update status');
        }
    };

    const handleSubmit = async () => {
        // Validate using schema
        if (!validateWithToast('payment', formData, showToast)) {
            return;
        }

        setSaving(true);
        try {
            const paymentData = new FormData();
            Object.keys(formData).forEach(key => {
                if (formData[key]) {
                    paymentData.append(key, formData[key]);
                }
            });

            if (editingPayment) {
                await api.put(`payments/${editingPayment.id}`, formData);
                showToast.success('Success', 'Payment updated successfully');
            } else {
                await createPayment(paymentData);
                showToast.success('Success', 'Payment created successfully');
            }
            setModalVisible(false);
            fetchPayments();
        } catch (error) {
            console.error('Submit payment error:', error);
            showToast.error('Error', `Failed to ${editingPayment ? 'update' : 'create'} payment`);
        } finally {
            setSaving(false);
        }
    };

    const getStatusColor = (status) => {
        const safeStatus = String(status || '').toLowerCase();
        switch (safeStatus) {
            case 'paid':
                return colors.success;
            case 'pending':
                return colors.warning;
            case 'overdue':
                return colors.error;
            case 'cancelled':
                return colors.gray500;
            default:
                return colors.gray400;
        }
    };

    const renderPaymentItem = ({ item }) => (
        <View style={[styles.paymentCard, shadows.sm]}>
            <TouchableOpacity onPress={() => handleEditPayment(item)}>
                <View style={styles.cardHeader}>
                    <View style={styles.studentInfo}>
                        <Text style={styles.studentName}>{item.student_name || 'Student'}</Text>
                        <Text style={styles.invoiceNumber}>Invoice #{item.invoice_number || item.id}</Text>
                    </View>
                    <View style={[styles.statusBadge, { backgroundColor: getStatusColor(item.status) + '20' }]}>
                        <Text style={[styles.statusText, { color: getStatusColor(item.status) }]}>
                            {item.status || 'Pending'}
                        </Text>
                    </View>
                </View>

                <View style={styles.amountRow}>
                    <Text style={styles.amount}>{formatCurrency(item.amount || item.total_amount || 0)}</Text>
                    <Text style={styles.dateText}>{formatDateReadable(item.created_at || item.due_date)}</Text>
                </View>

                {item.description && (
                    <Text style={styles.description} numberOfLines={1}>{item.description}</Text>
                )}
            </TouchableOpacity>

            {/* Action Buttons */}
            <View style={styles.actionButtons}>
                <TouchableOpacity
                    style={[styles.actionBtn, { backgroundColor: `${item.status === 'Paid' ? colors.warning : colors.success}15` }]}
                    onPress={() => handleUpdateStatus(item.id, item.status === 'Paid' ? 'Pending' : 'Paid')}
                >
                    <Ionicons
                        name={item.status === 'Paid' ? 'refresh' : 'checkmark-done'}
                        size={16}
                        color={item.status === 'Paid' ? colors.warning : colors.success}
                    />
                    <Text style={[styles.actionBtnText, { color: item.status === 'Paid' ? colors.warning : colors.success }]}>
                        {item.status === 'Paid' ? 'Unpaid' : 'Mark Paid'}
                    </Text>
                </TouchableOpacity>
                <TouchableOpacity
                    style={[styles.actionBtn, { backgroundColor: `${colors.primary}15` }]}
                    onPress={() => handleEditPayment(item)}
                >
                    <Ionicons name="create-outline" size={16} color={colors.primary} />
                    <Text style={[styles.actionBtnText, { color: colors.primary }]}>Edit</Text>
                </TouchableOpacity>
                <TouchableOpacity
                    style={[styles.actionBtn, { backgroundColor: `${colors.error}15` }]}
                    onPress={() => handleDeletePayment(item.id, item.student_name)}
                >
                    <Ionicons name="trash-outline" size={16} color={colors.error} />
                    <Text style={[styles.actionBtnText, { color: colors.error }]}>Delete</Text>
                </TouchableOpacity>
            </View>
        </View>
    );

    if (loading) {
        return (
            <SafeAreaView style={styles.safeArea}>
                <LoadingSpinner />
            </SafeAreaView>
        );
    }

    // Render analytics section
    const renderAnalyticsHeader = () => (
        <View style={styles.analyticsContainer}>
            {/* Toggle Button */}
            <TouchableOpacity
                style={styles.analyticsToggle}
                onPress={() => setShowAnalytics(!showAnalytics)}
            >
                <View style={styles.analyticsToggleLeft}>
                    <Ionicons name="analytics" size={20} color={colors.primary} />
                    <Text style={styles.analyticsToggleText}>Payment Analytics</Text>
                </View>
                <Ionicons name={showAnalytics ? 'chevron-up' : 'chevron-down'} size={20} color={colors.primary} />
            </TouchableOpacity>

            {showAnalytics && (
                <>
                    {/* Summary Cards */}
                    <View style={styles.summaryRow}>
                        <View style={[styles.summaryCard, { backgroundColor: colors.primary }]}>
                            <Text style={styles.summaryValue}>{formatCurrency(analytics.totalCollected)}</Text>
                            <Text style={styles.summaryLabel}>Collected</Text>
                            <View style={styles.summaryBadge}>
                                <Text style={styles.summaryBadgeText}>{analytics.paidCount} paid</Text>
                            </View>
                        </View>
                        <View style={[styles.summaryCard, { backgroundColor: colors.warning }]}>
                            <Text style={styles.summaryValue}>{formatCurrency(analytics.totalPending)}</Text>
                            <Text style={styles.summaryLabel}>Pending</Text>
                            <View style={styles.summaryBadge}>
                                <Text style={styles.summaryBadgeText}>{analytics.pendingCount} pending</Text>
                            </View>
                        </View>
                    </View>

                    <View style={styles.summaryRow}>
                        <View style={[styles.summaryCard, { backgroundColor: colors.error }]}>
                            <Text style={styles.summaryValue}>{formatCurrency(analytics.totalOverdue)}</Text>
                            <Text style={styles.summaryLabel}>Overdue</Text>
                            <View style={styles.summaryBadge}>
                                <Text style={styles.summaryBadgeText}>{analytics.overdueCount} overdue</Text>
                            </View>
                        </View>
                        <View style={[styles.summaryCard, { backgroundColor: colors.success }]}>
                            <Text style={styles.summaryValue}>{analytics.collectionRate}%</Text>
                            <Text style={styles.summaryLabel}>Collection Rate</Text>
                            <View style={styles.summaryBadge}>
                                <Text style={styles.summaryBadgeText}>{analytics.totalPayments} total</Text>
                            </View>
                        </View>
                    </View>

                    {/* Payment Types Breakdown */}
                    <View style={[styles.breakdownCard, shadows.sm]}>
                        <Text style={styles.breakdownTitle}>Payment Types Breakdown</Text>
                        {Object.entries(analytics.byType).map(([type, amount], index) => (
                            <View key={type} style={styles.breakdownRow}>
                                <View style={styles.breakdownLeft}>
                                    <View style={[styles.breakdownDot, { backgroundColor: [colors.primary, colors.success, colors.warning, colors.info][index % 4] }]} />
                                    <Text style={styles.breakdownType}>{type}</Text>
                                </View>
                                <Text style={styles.breakdownAmount}>{formatCurrency(amount)}</Text>
                            </View>
                        ))}
                        {Object.keys(analytics.byType).length === 0 && (
                            <Text style={styles.noDataText}>No payment data available</Text>
                        )}
                    </View>
                </>
            )}
        </View>
    );

    return (
        <SafeAreaView style={styles.safeArea} edges={['bottom']}>
            <FlatList
                data={payments}
                keyExtractor={(item) => item.id?.toString()}
                renderItem={renderPaymentItem}
                contentContainerStyle={styles.listContent}
                showsVerticalScrollIndicator={false}
                ListHeaderComponent={renderAnalyticsHeader}
                refreshControl={
                    <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
                }
                ListEmptyComponent={
                    <View style={styles.emptyContainer}>
                        <Ionicons name="card-outline" size={64} color={colors.gray300} />
                        <Text style={styles.emptyText}>No payments found</Text>
                    </View>
                }
            />

            {/* FAB */}
            <TouchableOpacity
                style={[styles.fab, shadows.lg]}
                onPress={handleCreatePayment}
            >
                <Ionicons name="add" size={28} color={colors.white} />
            </TouchableOpacity>

            {/* Create/Edit Payment Modal */}
            <Modal
                visible={modalVisible}
                animationType="slide"
                transparent={true}
                onRequestClose={() => setModalVisible(false)}
            >
                <View style={styles.modalOverlay}>
                    <View style={styles.modalContent}>
                        <View style={styles.modalHeader}>
                            <Text style={styles.modalTitle}>
                                {editingPayment ? 'Edit Payment' : 'Create New Payment'}
                            </Text>
                            <TouchableOpacity onPress={() => setModalVisible(false)}>
                                <Ionicons name="close" size={24} color={colors.text} />
                            </TouchableOpacity>
                        </View>

                        <ScrollView style={styles.modalForm}>
                            <View style={styles.inputGroup}>
                                <Text style={styles.inputLabel}>Student Name *</Text>
                                <TextInput
                                    style={styles.input}
                                    value={formData.student_name}
                                    onChangeText={(text) => setFormData({ ...formData, student_name: text })}
                                    placeholder="Enter student name"
                                />
                            </View>

                            <View style={styles.inputGroup}>
                                <Text style={styles.inputLabel}>Amount *</Text>
                                <TextInput
                                    style={styles.input}
                                    value={formData.amount}
                                    onChangeText={(text) => setFormData({ ...formData, amount: text })}
                                    placeholder="Enter amount"
                                    keyboardType="numeric"
                                />
                            </View>

                            <View style={styles.inputGroup}>
                                <Text style={styles.inputLabel}>Description</Text>
                                <TextInput
                                    style={[styles.input, styles.textArea]}
                                    value={formData.description}
                                    onChangeText={(text) => setFormData({ ...formData, description: text })}
                                    placeholder="Enter description"
                                    multiline
                                    numberOfLines={3}
                                />
                            </View>

                            <View style={styles.inputGroup}>
                                <Text style={styles.inputLabel}>Due Date</Text>
                                <TextInput
                                    style={styles.input}
                                    value={formData.due_date}
                                    onChangeText={(text) => setFormData({ ...formData, due_date: text })}
                                    placeholder="YYYY-MM-DD"
                                />
                            </View>

                            <FilterDropdown
                                label="Status"
                                value={formData.status}
                                options={PAYMENT_STATUS_OPTIONS.map(s => ({ value: s, label: s }))}
                                onChange={(val) => setFormData({ ...formData, status: val })}
                            />

                            <FilterDropdown
                                label="Payment Type"
                                value={formData.payment_type}
                                options={PAYMENT_TYPE_OPTIONS.map(t => ({ value: t, label: t }))}
                                onChange={(val) => setFormData({ ...formData, payment_type: val })}
                            />

                            <View style={{ height: 40 }} />
                        </ScrollView>

                        <View style={styles.modalFooter}>
                            <TouchableOpacity
                                style={[styles.cancelBtn, shadows.sm]}
                                onPress={() => setModalVisible(false)}
                            >
                                <Text style={styles.cancelBtnText}>Cancel</Text>
                            </TouchableOpacity>
                            <TouchableOpacity
                                style={[styles.saveBtn, shadows.md, saving && styles.disabledBtn]}
                                onPress={handleSubmit}
                                disabled={saving}
                            >
                                {saving ? (
                                    <ActivityIndicator color={colors.white} size="small" />
                                ) : (
                                    <Text style={styles.saveBtnText}>
                                        {editingPayment ? 'Update Payment' : 'Create Payment'}
                                    </Text>
                                )}
                            </TouchableOpacity>
                        </View>
                    </View>
                </View>
            </Modal>
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    safeArea: {
        flex: 1,
        backgroundColor: colors.background,
    },
    listContent: {
        padding: spacing.md,
        paddingBottom: BOTTOM_TAB_SPACING,
    },
    paymentCard: {
        backgroundColor: colors.white,
        borderRadius: borderRadius.lg,
        padding: spacing.md,
        marginBottom: spacing.sm,
    },
    cardHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'flex-start',
        marginBottom: spacing.sm,
    },
    studentInfo: {
        flex: 1,
    },
    studentName: {
        fontSize: fontSizes.md,
        fontWeight: '600',
        color: colors.text,
    },
    invoiceNumber: {
        fontSize: fontSizes.sm,
        color: colors.textSecondary,
        marginTop: 2,
    },
    statusBadge: {
        paddingHorizontal: spacing.sm,
        paddingVertical: 4,
        borderRadius: borderRadius.sm,
    },
    statusText: {
        fontSize: fontSizes.xs,
        fontWeight: '600',
    },
    amountRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: spacing.xs,
    },
    amount: {
        fontSize: fontSizes.xl,
        fontWeight: '700',
        color: colors.primary,
    },
    dateText: {
        fontSize: fontSizes.sm,
        color: colors.textSecondary,
    },
    description: {
        fontSize: fontSizes.sm,
        color: colors.textSecondary,
        fontStyle: 'italic',
    },
    actionButtons: {
        flexDirection: 'row',
        marginTop: spacing.sm,
        paddingTop: spacing.sm,
        borderTopWidth: 1,
        borderTopColor: colors.gray100,
        gap: spacing.xs,
    },
    actionBtn: {
        flex: 1,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: spacing.sm,
        paddingHorizontal: 6,
        borderRadius: borderRadius.md,
        gap: 4,
    },
    actionBtnText: {
        fontSize: fontSizes.xs,
        fontWeight: '600',
    },
    emptyContainer: {
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: spacing.xxl,
    },
    emptyText: {
        fontSize: fontSizes.md,
        color: colors.textSecondary,
        marginTop: spacing.md,
    },
    fab: {
        position: 'absolute',
        right: spacing.md,
        bottom: BOTTOM_TAB_HEIGHT + 20,
        width: 56,
        height: 56,
        borderRadius: 28,
        backgroundColor: colors.success,
        alignItems: 'center',
        justifyContent: 'center',
    },
    // Modal Styles
    modalOverlay: {
        flex: 1,
        backgroundColor: 'rgba(0,0,0,0.5)',
        justifyContent: 'flex-end',
    },
    modalContent: {
        backgroundColor: colors.white,
        borderTopLeftRadius: borderRadius.xl,
        borderTopRightRadius: borderRadius.xl,
        maxHeight: '90%',
    },
    modalHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: spacing.lg,
        borderBottomWidth: 1,
        borderBottomColor: colors.gray100,
    },
    modalTitle: {
        fontSize: fontSizes.lg,
        fontWeight: '700',
        color: colors.text,
    },
    modalForm: {
        padding: spacing.md,
    },
    inputGroup: {
        marginBottom: spacing.md,
    },
    inputLabel: {
        fontSize: 14,
        fontWeight: '600',
        color: colors.textSecondary,
        marginBottom: 6,
    },
    input: {
        backgroundColor: colors.gray50,
        borderRadius: borderRadius.md,
        padding: spacing.md,
        fontSize: 15,
        color: colors.text,
        borderWidth: 1,
        borderColor: colors.gray200,
    },
    textArea: {
        height: 80,
        textAlignVertical: 'top',
    },
    modalFooter: {
        flexDirection: 'row',
        padding: spacing.md,
        gap: spacing.md,
        borderTopWidth: 1,
        borderTopColor: colors.gray100,
    },
    cancelBtn: {
        flex: 1,
        padding: spacing.md,
        borderRadius: borderRadius.md,
        backgroundColor: colors.white,
        borderWidth: 1,
        borderColor: colors.gray200,
        alignItems: 'center',
    },
    cancelBtnText: {
        fontWeight: '600',
        color: colors.textSecondary,
    },
    saveBtn: {
        flex: 2,
        padding: spacing.md,
        borderRadius: borderRadius.md,
        backgroundColor: colors.success,
        alignItems: 'center',
    },
    saveBtnText: {
        fontWeight: '700',
        color: colors.white,
    },
    disabledBtn: {
        opacity: 0.7,
    },
    // Analytics Styles
    analyticsContainer: {
        marginBottom: spacing.md,
    },
    analyticsToggle: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        backgroundColor: colors.white,
        padding: spacing.md,
        borderRadius: borderRadius.lg,
        marginBottom: spacing.sm,
        ...shadows.sm,
    },
    analyticsToggleLeft: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    analyticsToggleText: {
        fontSize: fontSizes.md,
        fontWeight: '700',
        color: colors.text,
        marginLeft: spacing.sm,
    },
    summaryRow: {
        flexDirection: 'row',
        gap: spacing.sm,
        marginBottom: spacing.sm,
    },
    summaryCard: {
        flex: 1,
        padding: spacing.md,
        borderRadius: borderRadius.lg,
    },
    summaryValue: {
        fontSize: fontSizes.lg,
        fontWeight: '800',
        color: colors.white,
    },
    summaryLabel: {
        fontSize: fontSizes.xs,
        color: 'rgba(255,255,255,0.8)',
        marginTop: 2,
    },
    summaryBadge: {
        backgroundColor: 'rgba(255,255,255,0.2)',
        paddingHorizontal: 6,
        paddingVertical: 2,
        borderRadius: 4,
        alignSelf: 'flex-start',
        marginTop: spacing.xs,
    },
    summaryBadgeText: {
        fontSize: 10,
        color: colors.white,
        fontWeight: '600',
    },
    breakdownCard: {
        backgroundColor: colors.white,
        padding: spacing.md,
        borderRadius: borderRadius.lg,
    },
    breakdownTitle: {
        fontSize: fontSizes.sm,
        fontWeight: '700',
        color: colors.text,
        marginBottom: spacing.sm,
    },
    breakdownRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingVertical: spacing.xs,
        borderBottomWidth: 1,
        borderBottomColor: colors.gray100,
    },
    breakdownLeft: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    breakdownDot: {
        width: 8,
        height: 8,
        borderRadius: 4,
        marginRight: spacing.sm,
    },
    breakdownType: {
        fontSize: fontSizes.sm,
        color: colors.text,
    },
    breakdownAmount: {
        fontSize: fontSizes.sm,
        fontWeight: '600',
        color: colors.text,
    },
    noDataText: {
        fontSize: fontSizes.sm,
        color: colors.textSecondary,
        textAlign: 'center',
        paddingVertical: spacing.md,
    },
});

export default PaymentsScreen;
