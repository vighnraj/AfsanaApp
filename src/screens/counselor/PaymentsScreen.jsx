// Counselor Payments/Invoices Screen - Full API Integration

import React, { useState, useEffect, useCallback } from 'react';
import {
    View,
    Text,
    StyleSheet,
    FlatList,
    TouchableOpacity,
    RefreshControl,
    Dimensions,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';

import { useAuth } from '../../context/AuthContext';
import api from '../../api/index';
import { colors, spacing, borderRadius, fontSizes, shadows } from '../../context/ThemeContext';
import { LoadingSpinner, LoadingList } from '../../components/common/Loading';
import { showToast } from '../../components/common/Toast';
import { formatDateReadable, formatCurrency } from '../../utils/formatting';

const { width: screenWidth } = Dimensions.get('window');
const isSmallDevice = screenWidth < 375;

const PaymentsScreen = ({ navigation }) => {
    const { user } = useAuth();

    const [invoices, setInvoices] = useState([]);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const [activeFilter, setActiveFilter] = useState('all');

    const fetchInvoices = useCallback(async () => {
        try {
            const counselorId = user?.counselor_id || user?.id;
            if (!counselorId) {
                setLoading(false);
                return;
            }
            // Get student invoices for counselor's students
            const response = await api.get(`students/invoices/${counselorId}`);
            const invoicesArray = Array.isArray(response.data) ? response.data : response.data.invoices || [];
            setInvoices(invoicesArray);
        } catch (error) {
            console.error('Fetch invoices error:', error);
            showToast.error('Error', 'Failed to load invoices');
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    }, [user?.counselor_id, user?.id]);

    useEffect(() => {
        fetchInvoices();
    }, [fetchInvoices]);

    const onRefresh = () => {
        setRefreshing(true);
        fetchInvoices();
    };

    const getFilteredInvoices = () => {
        if (activeFilter === 'all') return invoices;
        return invoices.filter(inv => String(inv.status || '').toLowerCase() === activeFilter);
    };

    const getStatusColor = (status) => {
        const safeStatus = String(status || '').toLowerCase();
        switch (safeStatus) {
            case 'paid':
            case 'completed':
                return colors.success;
            case 'pending':
                return colors.warning;
            case 'overdue':
                return colors.danger;
            default:
                return colors.gray400;
        }
    };

    const renderFilterChips = () => (
        <View style={styles.filterContainer}>
            {['all', 'pending', 'paid', 'overdue'].map((filter) => (
                <TouchableOpacity
                    key={filter}
                    style={[
                        styles.filterChip,
                        activeFilter === filter && styles.filterChipActive,
                    ]}
                    onPress={() => setActiveFilter(filter)}
                >
                    <Text style={[
                        styles.filterText,
                        activeFilter === filter && styles.filterTextActive,
                    ]}>
                        {filter.charAt(0).toUpperCase() + filter.slice(1)}
                    </Text>
                </TouchableOpacity>
            ))}
        </View>
    );

    const renderInvoiceItem = ({ item }) => (
        <TouchableOpacity
            style={[styles.invoiceCard, shadows.sm]}
            activeOpacity={0.7}
        >
            <View style={styles.cardHeader}>
                <View style={[styles.iconContainer, { backgroundColor: colors.infoBg }]}>
                    <Ionicons name="document-text" size={24} color={colors.info} />
                </View>
                <View style={styles.invoiceInfo}>
                    <Text style={styles.invoiceNumber}>
                        Invoice #{item.invoice_number || item.id}
                    </Text>
                    <Text style={styles.studentName} numberOfLines={1}>
                        {item.student_name || 'Student'}
                    </Text>
                </View>
                <View style={[styles.statusBadge, { backgroundColor: getStatusColor(item.status) + '20' }]}>
                    <Text style={[styles.statusText, { color: getStatusColor(item.status) }]}>
                        {item.status || 'Pending'}
                    </Text>
                </View>
            </View>

            <View style={styles.amountSection}>
                <View>
                    <Text style={styles.amountLabel}>Amount</Text>
                    <Text style={styles.amountValue}>{formatCurrency(item.total_amount || item.amount || 0)}</Text>
                </View>
                <View style={styles.dateInfo}>
                    <Text style={styles.dateLabel}>Due Date</Text>
                    <Text style={styles.dateValue}>
                        {item.due_date ? formatDateReadable(item.due_date) : 'N/A'}
                    </Text>
                </View>
            </View>

            {item.description && (
                <Text style={styles.description} numberOfLines={1}>
                    {item.description}
                </Text>
            )}
        </TouchableOpacity>
    );

    const renderEmptyState = () => (
        <View style={styles.emptyContainer}>
            <Ionicons name="card-outline" size={80} color={colors.gray300} />
            <Text style={styles.emptyTitle}>No Invoices Found</Text>
            <Text style={styles.emptySubtext}>
                {activeFilter !== 'all'
                    ? `No ${activeFilter} invoices`
                    : 'No student invoices to display'
                }
            </Text>
        </View>
    );

    if (loading) {
        return (
            <SafeAreaView style={styles.safeArea} edges={['top']}>
                <View style={styles.header}>
                    <Text style={styles.headerTitle}>Student Invoices</Text>
                </View>
                <LoadingList count={5} />
            </SafeAreaView>
        );
    }

    const filteredInvoices = getFilteredInvoices();

    // Calculate totals
    const totalAmount = invoices.reduce((sum, inv) => sum + (inv.total_amount || inv.amount || 0), 0);
    const paidAmount = invoices
        .filter(inv => String(inv.status || '').toLowerCase() === 'paid')
        .reduce((sum, inv) => sum + (inv.total_amount || inv.amount || 0), 0);

    return (
        <SafeAreaView style={styles.safeArea} edges={['top']}>
            {/* Header removed - using Navigation Header */}

            {/* Summary Cards */}
            <View style={styles.summaryContainer}>
                <View style={[styles.summaryCard, { backgroundColor: colors.infoBg }]}>
                    <Text style={styles.summaryLabel}>Total</Text>
                    <Text style={[styles.summaryValue, { color: colors.info }]}>
                        {formatCurrency(totalAmount)}
                    </Text>
                </View>
                <View style={[styles.summaryCard, { backgroundColor: colors.successBg }]}>
                    <Text style={styles.summaryLabel}>Collected</Text>
                    <Text style={[styles.summaryValue, { color: colors.success }]}>
                        {formatCurrency(paidAmount)}
                    </Text>
                </View>
            </View>

            {/* Filter Chips */}
            {renderFilterChips()}

            {/* Invoices List */}
            <FlatList
                data={filteredInvoices}
                keyExtractor={(item) => item.id?.toString()}
                renderItem={renderInvoiceItem}
                contentContainerStyle={styles.listContent}
                showsVerticalScrollIndicator={false}
                refreshControl={
                    <RefreshControl
                        refreshing={refreshing}
                        onRefresh={onRefresh}
                        colors={[colors.primary]}
                        tintColor={colors.primary}
                    />
                }
                ListEmptyComponent={renderEmptyState}
                ItemSeparatorComponent={() => <View style={{ height: spacing.sm }} />}
            />
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    safeArea: {
        flex: 1,
        backgroundColor: colors.background,
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingHorizontal: spacing.md,
        paddingVertical: spacing.sm,
        backgroundColor: colors.primary,
    },
    headerTitle: {
        fontSize: isSmallDevice ? fontSizes.xl : fontSizes.h3,
        fontWeight: '700',
        color: colors.white,
    },
    headerSubtitle: {
        fontSize: fontSizes.sm,
        color: colors.white,
        opacity: 0.8,
        marginTop: 2,
    },
    summaryContainer: {
        flexDirection: 'row',
        paddingHorizontal: spacing.md,
        paddingVertical: spacing.sm,
        backgroundColor: colors.white,
    },
    summaryCard: {
        flex: 1,
        padding: spacing.md,
        borderRadius: borderRadius.md,
        marginHorizontal: spacing.xs,
        alignItems: 'center',
    },
    summaryLabel: {
        fontSize: fontSizes.sm,
        color: colors.textSecondary,
    },
    summaryValue: {
        fontSize: fontSizes.xl,
        fontWeight: '700',
        marginTop: 4,
    },
    filterContainer: {
        flexDirection: 'row',
        paddingHorizontal: spacing.md,
        paddingVertical: spacing.sm,
        backgroundColor: colors.white,
        borderBottomWidth: 1,
        borderBottomColor: colors.gray100,
    },
    filterChip: {
        paddingHorizontal: spacing.md,
        paddingVertical: spacing.xs,
        borderRadius: borderRadius.full,
        backgroundColor: colors.gray100,
        marginRight: spacing.sm,
    },
    filterChipActive: {
        backgroundColor: colors.primary,
    },
    filterText: {
        fontSize: fontSizes.sm,
        color: colors.textSecondary,
        fontWeight: '500',
    },
    filterTextActive: {
        color: colors.white,
    },
    listContent: {
        padding: spacing.md,
        paddingBottom: spacing.xxl,
    },
    invoiceCard: {
        backgroundColor: colors.white,
        borderRadius: borderRadius.lg,
        padding: spacing.md,
    },
    cardHeader: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    iconContainer: {
        width: 44,
        height: 44,
        borderRadius: borderRadius.md,
        alignItems: 'center',
        justifyContent: 'center',
    },
    invoiceInfo: {
        flex: 1,
        marginLeft: spacing.sm,
        marginRight: spacing.sm,
    },
    invoiceNumber: {
        fontSize: fontSizes.md,
        fontWeight: '600',
        color: colors.text,
    },
    studentName: {
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
    amountSection: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginTop: spacing.md,
        paddingTop: spacing.sm,
        borderTopWidth: 1,
        borderTopColor: colors.gray100,
    },
    amountLabel: {
        fontSize: fontSizes.sm,
        color: colors.textSecondary,
    },
    amountValue: {
        fontSize: fontSizes.xl,
        fontWeight: '700',
        color: colors.primary,
        marginTop: 2,
    },
    dateInfo: {
        alignItems: 'flex-end',
    },
    dateLabel: {
        fontSize: fontSizes.sm,
        color: colors.textSecondary,
    },
    dateValue: {
        fontSize: fontSizes.md,
        fontWeight: '500',
        color: colors.text,
        marginTop: 2,
    },
    description: {
        fontSize: fontSizes.sm,
        color: colors.textSecondary,
        marginTop: spacing.sm,
    },
    emptyContainer: {
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: spacing.xxl * 2,
    },
    emptyTitle: {
        fontSize: fontSizes.xl,
        fontWeight: '600',
        color: colors.text,
        marginTop: spacing.md,
    },
    emptySubtext: {
        fontSize: fontSizes.md,
        color: colors.textSecondary,
        marginTop: spacing.xs,
        textAlign: 'center',
    },
});

export default PaymentsScreen;
