// Processor Dashboard Screen
import React, { useState, useEffect, useCallback } from 'react';
import { View, Text, StyleSheet, ScrollView, RefreshControl, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../../context/AuthContext';
import { getProcessorDashboard } from '../../api/dashboardApi';
import { colors, spacing, borderRadius, fontSizes, shadows } from '../../context/ThemeContext';
import Card from '../../components/common/Card';
import { LoadingSpinner } from '../../components/common/Loading';
import { showToast } from '../../components/common/Toast';
import { CustomHeader, NotificationBell } from '../../components/common';

const DashboardScreen = ({ navigation }) => {
    const { user, logout } = useAuth();
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const [data, setData] = useState(null);

    const fetchData = useCallback(async () => {
        try {
            const processorId = user?.processor_id || user?.id;
            if (!processorId) {
                setLoading(false);
                return;
            }
            const result = await getProcessorDashboard(processorId);
            setData(result);
        } catch (error) {
            showToast.error('Error', 'Failed to load dashboard');
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    }, [user?.processor_id, user?.id]);

    useEffect(() => { fetchData(); }, [fetchData]);
    const onRefresh = () => { setRefreshing(true); fetchData(); };

    const kpiData = [
        { title: 'Assigned Students', value: data?.assignedStudents || 0, icon: 'people', iconColor: colors.primary },
        { title: 'Active Processing', value: data?.activeProcessing || 0, icon: 'airplane', iconColor: colors.success },
        { title: 'Pending Docs', value: data?.pendingDocs || 0, icon: 'document', iconColor: colors.warning },
        { title: 'Completed', value: data?.completed || 0, icon: 'checkmark-circle', iconColor: colors.info },
    ];

    if (loading) return <SafeAreaView style={styles.safeArea}><LoadingSpinner /></SafeAreaView>;

    return (
        <SafeAreaView style={styles.safeArea} edges={['bottom']}>
            <CustomHeader title="Processor Dashboard" showBack={false} rightAction={<NotificationBell />} />
            <ScrollView style={styles.container} contentContainerStyle={styles.content} refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}>
                <View style={styles.header}>
                    <View>
                        <Text style={styles.greeting}>Welcome,</Text>
                        <Text style={styles.userName}>{user?.full_name || 'Processor'}</Text>
                    </View>
                </View>
                <Text style={styles.sectionTitle}>Overview</Text>
                <View style={styles.kpiGrid}>
                    {kpiData.map((item, i) => (<View key={i} style={styles.kpiItem}><Card {...item} /></View>))}
                </View>
            </ScrollView>
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    safeArea: { flex: 1, backgroundColor: colors.background },
    container: { flex: 1 }, content: { padding: spacing.md, paddingBottom: spacing.xxl },
    header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: spacing.lg },
    greeting: { fontSize: fontSizes.md, color: colors.textSecondary }, userName: { fontSize: fontSizes.h3, fontWeight: '700', color: colors.text },
    logoutButton: { width: 44, height: 44, borderRadius: 22, backgroundColor: colors.dangerBg, alignItems: 'center', justifyContent: 'center' },
    sectionTitle: { fontSize: fontSizes.lg, fontWeight: '600', color: colors.text, marginBottom: spacing.sm },
    kpiGrid: { flexDirection: 'row', flexWrap: 'wrap', marginHorizontal: -spacing.xs }, kpiItem: { width: '50%', padding: spacing.xs },
});

export default DashboardScreen;
