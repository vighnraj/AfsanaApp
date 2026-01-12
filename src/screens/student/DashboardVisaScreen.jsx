// Student Dashboard Visa Screen - 12-step visa journey

import React, { useState, useEffect, useCallback } from 'react';
import {
    View,
    Text,
    StyleSheet,
    ScrollView,
    TouchableOpacity,
    RefreshControl,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import * as SecureStore from 'expo-secure-store';

import { getStudentById } from '../../api/studentApi';
import { getUniversities, getVisaProcessByUniversityAndStudent } from '../../api/visaApi';
import { useAuth } from '../../context/AuthContext';
import { colors, spacing, borderRadius, fontSizes, shadows } from '../../context/ThemeContext';
import { LoadingSpinner } from '../../components/common/Loading';
import { showToast } from '../../components/common/Toast';
import { VISA_STAGES, BOTTOM_TAB_SPACING } from '../../utils/constants';
import { CustomHeader, NotificationBell } from '../../components/common';
import { useScrollToHideTabs } from '../../hooks/useScrollToHideTabs';

const DashboardVisaScreen = ({ navigation }) => {
    const { onScroll } = useScrollToHideTabs(navigation);
    const { user, logout } = useAuth();

    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const [universities, setUniversities] = useState([]);
    const [selectedUniversity, setSelectedUniversity] = useState(null);
    const [currentStep, setCurrentStep] = useState(0);
    const [studentData, setStudentData] = useState(null);
    const [visaData, setVisaData] = useState(null);

    const fetchData = useCallback(async () => {
        try {
            const studentId = await SecureStore.getItemAsync('student_id');

            // Fetch student data
            if (studentId) {
                const student = await getStudentById(studentId);
                setStudentData(student);
            }

            // Fetch universities
            const uniData = await getUniversities();
            const uniList = Array.isArray(uniData) ? uniData : uniData.universities || [];
            setUniversities(uniList);

            if (uniList.length > 0) {
                setSelectedUniversity(uniList[0]);
            }
        } catch (error) {
            console.error('Fetch data error:', error);
            showToast.error('Error', 'Failed to load data');
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    }, []);

    useEffect(() => {
        fetchData();
    }, [fetchData]);

    // Fetch visa process when university changes
    useEffect(() => {
        const fetchVisaProcess = async () => {
            if (!selectedUniversity) return;

            try {
                const studentId = await SecureStore.getItemAsync('student_id');
                if (studentId && selectedUniversity.id) {
                    const visa = await getVisaProcessByUniversityAndStudent(selectedUniversity.id, studentId);
                    setVisaData(visa);
                    // Determine current step based on visa data
                    // This logic would match the web frontend's step calculation
                }
            } catch (error) {
                // Might not have visa process yet
                console.log('No visa process found');
            }
        };

        fetchVisaProcess();
    }, [selectedUniversity]);

    const onRefresh = () => {
        setRefreshing(true);
        fetchData();
    };

    const handleLogout = async () => {
        try {
            await logout();
            showToast.success('Logged Out', 'See you soon!');
        } catch (error) {
            console.error('Logout error:', error);
        }
    };

    const renderStepIndicator = (step, index) => {
        const isCompleted = index < currentStep;
        const isCurrent = index === currentStep;

        return (
            <TouchableOpacity
                key={index}
                style={styles.stepContainer}
                onPress={() => setCurrentStep(index)}
            >
                <View style={[
                    styles.stepCircle,
                    isCompleted && styles.stepCompleted,
                    isCurrent && styles.stepCurrent,
                ]}>
                    {isCompleted ? (
                        <Ionicons name="checkmark" size={16} color={colors.white} />
                    ) : (
                        <Text style={[
                            styles.stepNumber,
                            (isCompleted || isCurrent) && styles.stepNumberActive,
                        ]}>
                            {index + 1}
                        </Text>
                    )}
                </View>
                <Text style={[
                    styles.stepLabel,
                    isCurrent && styles.stepLabelActive,
                ]} numberOfLines={1}>
                    {step.label}
                </Text>
            </TouchableOpacity>
        );
    };

    if (loading) {
        return (
            <View style={styles.safeArea}>
                <CustomHeader title="Visa Journey" showBack={false} rightAction={<NotificationBell />} />
                <LoadingSpinner />
            </View>
        );
    }

    return (
        // Fixed syntax
        <SafeAreaView style={styles.safeArea} edges={['top', 'left', 'right']}>
            <CustomHeader title="Visa Journey" showBack={false} rightAction={<NotificationBell />} useSafeArea={false} />
            <ScrollView
                style={styles.container}
                contentContainerStyle={[styles.content, { paddingBottom: BOTTOM_TAB_SPACING }]}
                showsVerticalScrollIndicator={false}
                onScroll={onScroll}
                scrollEventThrottle={16}
                refreshControl={
                    <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
                }
            >
                {/* Header Sub-Greeting */}
                <View style={styles.subHeader}>
                    <View>
                        <Text style={styles.greeting}>Welcome,</Text>
                        <Text style={styles.userName}>{studentData?.full_name || user?.full_name || 'Student'}</Text>
                    </View>
                </View>

                {/* University Selector */}
                <View style={styles.universitySection}>
                    <Text style={styles.sectionTitle}>Select University</Text>
                    <ScrollView
                        horizontal
                        showsHorizontalScrollIndicator={false}
                        contentContainerStyle={styles.universityScroll}
                    >
                        {universities.map((uni, index) => (
                            <TouchableOpacity
                                key={uni.id || index}
                                style={[
                                    styles.universityCard,
                                    selectedUniversity?.id === uni.id && styles.universityCardSelected,
                                    shadows.sm,
                                ]}
                                onPress={() => setSelectedUniversity(uni)}
                            >
                                <Ionicons
                                    name="school"
                                    size={24}
                                    color={selectedUniversity?.id === uni.id ? colors.white : colors.primary}
                                />
                                <Text style={[
                                    styles.universityName,
                                    selectedUniversity?.id === uni.id && styles.universityNameSelected,
                                ]} numberOfLines={2}>
                                    {uni.name || uni.university_name}
                                </Text>
                            </TouchableOpacity>
                        ))}
                    </ScrollView>
                </View>

                {/* Visa Journey Stepper */}
                <View style={styles.stepperSection}>
                    <Text style={styles.sectionTitle}>Visa Journey</Text>
                    <Text style={styles.sectionSubtitle}>Step {currentStep + 1} of {VISA_STAGES.length}</Text>

                    <ScrollView
                        horizontal
                        showsHorizontalScrollIndicator={false}
                        contentContainerStyle={styles.stepperScroll}
                    >
                        {VISA_STAGES.map((step, index) => renderStepIndicator(step, index))}
                    </ScrollView>
                </View>

                {/* Current Step Card */}
                <View style={[styles.currentStepCard, shadows.lg]}>
                    <View style={styles.currentStepHeader}>
                        <Ionicons name={VISA_STAGES[currentStep]?.icon || 'document'} size={32} color={colors.primary} />
                        <View style={styles.currentStepInfo}>
                            <Text style={styles.currentStepTitle}>
                                Step {currentStep + 1}: {VISA_STAGES[currentStep]?.label}
                            </Text>
                            <Text style={styles.currentStepStatus}>
                                {currentStep === 0 ? 'In Progress' : 'Pending'}
                            </Text>
                        </View>
                    </View>

                    <Text style={styles.currentStepDescription}>
                        Complete this step to proceed with your visa application process.
                    </Text>

                    <TouchableOpacity
                        style={styles.completeButton}
                        onPress={() => navigation.navigate('More', { screen: 'VisaProcessing' })}
                    >
                        <Text style={styles.completeButtonText}>Continue to Form</Text>
                        <Ionicons name="arrow-forward" size={20} color={colors.white} />
                    </TouchableOpacity>
                </View>

                {/* Quick Actions */}
                <Text style={styles.sectionTitle}>Quick Actions</Text>
                <View style={styles.quickActions}>
                    <TouchableOpacity
                        style={[styles.actionCard, shadows.sm]}
                        onPress={() => navigation.navigate('Profile')}
                    >
                        <View style={[styles.actionIcon, { backgroundColor: `${colors.primary}20` }]}>
                            <Ionicons name="person" size={24} color={colors.primary} />
                        </View>
                        <Text style={styles.actionText}>My Profile</Text>
                    </TouchableOpacity>

                    <TouchableOpacity
                        style={[styles.actionCard, shadows.sm]}
                        onPress={() => navigation.navigate('Applications')}
                    >
                        <View style={[styles.actionIcon, { backgroundColor: `${colors.success}20` }]}>
                            <Ionicons name="document-text" size={24} color={colors.success} />
                        </View>
                        <Text style={styles.actionText}>Applications</Text>
                    </TouchableOpacity>

                    <TouchableOpacity
                        style={[styles.actionCard, shadows.sm]}
                        onPress={() => navigation.navigate('Universities')}
                    >
                        <View style={[styles.actionIcon, { backgroundColor: `${colors.warning}20` }]}>
                            <Ionicons name="school" size={24} color={colors.warning} />
                        </View>
                        <Text style={styles.actionText}>Universities</Text>
                    </TouchableOpacity>

                    <TouchableOpacity
                        style={[styles.actionCard, shadows.sm]}
                        onPress={() => navigation.navigate('More', { screen: 'Payments' })}
                    >
                        <View style={[styles.actionIcon, { backgroundColor: `${colors.secondary}20` }]}>
                            <Ionicons name="card" size={24} color={colors.secondary} />
                        </View>
                        <Text style={styles.actionText}>Payments</Text>
                    </TouchableOpacity>
                </View>
            </ScrollView>
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    safeArea: {
        flex: 1,
        backgroundColor: colors.background,
    },
    container: {
        flex: 1,
    },
    content: {
        padding: spacing.md,
        paddingBottom: spacing.xxl,
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: spacing.lg,
    },
    greeting: {
        fontSize: fontSizes.md,
        color: colors.textSecondary,
    },
    userName: {
        fontSize: fontSizes.h3,
        fontWeight: '700',
        color: colors.text,
    },
    profileButton: {
        width: 44,
        height: 44,
        borderRadius: 22,
        backgroundColor: colors.dangerBg,
        alignItems: 'center',
        justifyContent: 'center',
    },
    sectionTitle: {
        fontSize: fontSizes.lg,
        fontWeight: '600',
        color: colors.text,
        marginBottom: spacing.xs,
    },
    sectionSubtitle: {
        fontSize: fontSizes.sm,
        color: colors.textSecondary,
        marginBottom: spacing.sm,
    },
    universitySection: {
        marginBottom: spacing.lg,
    },
    universityScroll: {
        paddingVertical: spacing.xs,
    },
    universityCard: {
        backgroundColor: colors.white,
        borderRadius: borderRadius.lg,
        padding: spacing.md,
        marginRight: spacing.sm,
        width: 120,
        alignItems: 'center',
    },
    universityCardSelected: {
        backgroundColor: colors.primary,
    },
    universityName: {
        fontSize: fontSizes.sm,
        color: colors.text,
        textAlign: 'center',
        marginTop: spacing.xs,
    },
    universityNameSelected: {
        color: colors.white,
    },
    stepperSection: {
        marginBottom: spacing.lg,
    },
    stepperScroll: {
        paddingVertical: spacing.sm,
    },
    stepContainer: {
        alignItems: 'center',
        marginRight: spacing.md,
        width: 60,
    },
    stepCircle: {
        width: 32,
        height: 32,
        borderRadius: 16,
        backgroundColor: colors.gray200,
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: 4,
    },
    stepCompleted: {
        backgroundColor: colors.success,
    },
    stepCurrent: {
        backgroundColor: colors.primary,
    },
    stepNumber: {
        fontSize: fontSizes.sm,
        fontWeight: '600',
        color: colors.textSecondary,
    },
    stepNumberActive: {
        color: colors.white,
    },
    stepLabel: {
        fontSize: fontSizes.xs,
        color: colors.textSecondary,
        textAlign: 'center',
    },
    stepLabelActive: {
        color: colors.primary,
        fontWeight: '600',
    },
    currentStepCard: {
        backgroundColor: colors.white,
        borderRadius: borderRadius.lg,
        padding: spacing.lg,
        marginBottom: spacing.lg,
    },
    currentStepHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: spacing.md,
    },
    currentStepInfo: {
        flex: 1,
        marginLeft: spacing.md,
    },
    currentStepTitle: {
        fontSize: fontSizes.lg,
        fontWeight: '600',
        color: colors.text,
    },
    currentStepStatus: {
        fontSize: fontSizes.sm,
        color: colors.warning,
        marginTop: 2,
    },
    currentStepDescription: {
        fontSize: fontSizes.md,
        color: colors.textSecondary,
        marginBottom: spacing.md,
        lineHeight: 22,
    },
    completeButton: {
        backgroundColor: colors.primary,
        borderRadius: borderRadius.md,
        paddingVertical: spacing.sm + 2,
        paddingHorizontal: spacing.md,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
    },
    completeButtonText: {
        fontSize: fontSizes.md,
        fontWeight: '600',
        color: colors.white,
        marginRight: spacing.xs,
    },
    quickActions: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        marginHorizontal: -spacing.xs,
    },
    actionCard: {
        width: '48%',
        backgroundColor: colors.white,
        borderRadius: borderRadius.lg,
        padding: spacing.md,
        margin: '1%',
        alignItems: 'center',
    },
    actionIcon: {
        width: 48,
        height: 48,
        borderRadius: 24,
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: spacing.sm,
    },
    actionText: {
        fontSize: fontSizes.sm,
        fontWeight: '500',
        color: colors.text,
        textAlign: 'center',
    },
});

export default DashboardVisaScreen;
