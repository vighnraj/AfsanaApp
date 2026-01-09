// Student Payments Screen

import React, { useState, useEffect, useCallback } from 'react';
import {
    View,
    Text,
    StyleSheet,
    FlatList,
    TouchableOpacity,
    RefreshControl,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import * as SecureStore from 'expo-secure-store';

import { getStudentPayments } from '../../api/studentApi';
import { colors, spacing, borderRadius, fontSizes, shadows } from '../../context/ThemeContext';
import { LoadingSpinner } from '../../components/common/Loading';
import { showToast } from '../../components/common/Toast';
import { formatDateReadable, formatCurrency } from '../../utils/formatting';
import { CustomHeader, NotificationBell } from '../../components/common';

const PaymentsScreen = ({ navigation }) => {
    const [payments, setPayments] = useState([]);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);

    const fetchPayments = useCallback(async () => {
        try {
            const studentId = await SecureStore.getItemAsync('student_id');
            if (studentId) {
                const data = await getStudentPayments(studentId);
                setPayments(Array.isArray(data) ? data : data.payments || []);
            }
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

    const getStatusColor = (status) => {
        const safeStatus = String(status || '').toLowerCase();
        switch (safeStatus) {
            case 'paid':
                return colors.success;
            case 'pending':
                return colors.warning;
            case 'overdue':
                return colors.danger;
            default:
                return colors.gray400;
        }
    };

    const renderPaymentItem = ({ item }) => (
        <View style={[styles.paymentCard, shadows.sm]}>
            <View style={styles.cardHeader}>
                <View style={styles.paymentInfo}>
                    <Text style={styles.paymentTitle}>{item.description || 'Payment'}</Text>
                    <Text style={styles.invoiceNumber}>Invoice #{item.invoice_number || item.id}</Text>
                </View>
                <View style={[styles.statusBadge, { backgroundColor: getStatusColor(item.status) + '20' }]}>
                    <Text style={[styles.statusText, { color: getStatusColor(item.status) }]}>
                        {item.status || 'Pending'}
                    </Text>
                </View>
            </View>

            <View style={styles.amountRow}>
                <Text style={styles.amount}>{formatCurrency(item.amount || 0)}</Text>
                <Text style={styles.dateText}>{formatDateReadable(item.due_date || item.created_at)}</Text>
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

    return (
        <SafeAreaView style={styles.safeArea} edges={['bottom']}>
            <CustomHeader title="Payments" showBack={true} rightAction={<NotificationBell />} />
            <FlatList
                data={payments}
                keyExtractor={(item) => item.id?.toString()}
                renderItem={renderPaymentItem}
                contentContainerStyle={styles.listContent}
                showsVerticalScrollIndicator={false}
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
    paymentInfo: {
        flex: 1,
    },
    paymentTitle: {
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
});

export default PaymentsScreen;
