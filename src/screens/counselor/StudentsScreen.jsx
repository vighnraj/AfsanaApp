// Counselor Students Screen - Full API Integration

import React, { useState, useEffect, useCallback } from 'react';
import {
    View,
    Text,
    StyleSheet,
    FlatList,
    TouchableOpacity,
    RefreshControl,
    TextInput,
    Dimensions,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';

import { useAuth } from '../../context/AuthContext';
import { getCounselorStudents } from '../../api/studentApi';
import { colors, spacing, borderRadius, fontSizes, shadows } from '../../context/ThemeContext';
import { LoadingSpinner, LoadingList } from '../../components/common/Loading';
import { showToast } from '../../components/common/Toast';
import { formatDateReadable, getInitials } from '../../utils/formatting';
import { CustomHeader } from '../../components/common';

const { width: screenWidth } = Dimensions.get('window');
const isSmallDevice = screenWidth < 375;

const StudentsScreen = ({ navigation }) => {
    const { user } = useAuth();

    const [students, setStudents] = useState([]);
    const [filteredStudents, setFilteredStudents] = useState([]);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');

    const fetchStudents = useCallback(async () => {
        try {
            const counselorId = user?.counselor_id || user?.id;
            if (!counselorId) {
                setLoading(false);
                return;
            }
            const data = await getCounselorStudents(counselorId);
            const studentsArray = Array.isArray(data) ? data : data.students || [];
            setStudents(studentsArray);
            setFilteredStudents(studentsArray);
        } catch (error) {
            console.error('Fetch students error:', error);
            showToast.error('Error', 'Failed to load students');
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    }, [user?.counselor_id, user?.id]);

    useEffect(() => {
        fetchStudents();
    }, [fetchStudents]);

    // Filter students based on search
    useEffect(() => {
        if (!searchQuery.trim()) {
            setFilteredStudents(students);
        } else {
            const query = searchQuery.toLowerCase();
            const filtered = students.filter(student =>
                student.full_name?.toLowerCase().includes(query) ||
                student.email?.toLowerCase().includes(query) ||
                student.phone?.includes(query)
            );
            setFilteredStudents(filtered);
        }
    }, [searchQuery, students]);

    const onRefresh = () => {
        setRefreshing(true);
        fetchStudents();
    };

    const renderStudentItem = ({ item }) => (
        <TouchableOpacity
            style={[styles.studentCard, shadows.sm]}
            onPress={() => navigation.navigate('StudentDetail', { studentId: item.id })}
            activeOpacity={0.7}
        >
            <View style={styles.cardHeader}>
                <View style={[styles.avatar, { backgroundColor: colors.success + '20' }]}>
                    <Text style={styles.avatarText}>
                        {getInitials(item.full_name || 'NA')}
                    </Text>
                </View>
                <View style={styles.studentInfo}>
                    <Text style={styles.studentName} numberOfLines={1}>
                        {item.full_name || 'Unknown Student'}
                    </Text>
                    <Text style={styles.studentEmail} numberOfLines={1}>
                        {item.email || 'No email'}
                    </Text>
                </View>
                <View style={[styles.statusBadge, { backgroundColor: colors.successBg }]}>
                    <Text style={[styles.statusText, { color: colors.success }]}>
                        Active
                    </Text>
                </View>
            </View>

            <View style={styles.cardDetails}>
                {item.phone && (
                    <View style={styles.detailItem}>
                        <Ionicons name="call-outline" size={14} color={colors.textSecondary} />
                        <Text style={styles.detailText}>{item.phone}</Text>
                    </View>
                )}
                {item.country && (
                    <View style={styles.detailItem}>
                        <Ionicons name="location-outline" size={14} color={colors.textSecondary} />
                        <Text style={styles.detailText}>{item.country}</Text>
                    </View>
                )}
                <View style={styles.detailItem}>
                    <Ionicons name="school-outline" size={14} color={colors.textSecondary} />
                    <Text style={styles.detailText}>
                        {item.applications_count || 0} Applications
                    </Text>
                </View>
            </View>

            <View style={styles.cardFooter}>
                <TouchableOpacity
                    style={styles.actionButton}
                    onPress={() => navigation.navigate('More', { screen: 'Chat', params: { studentId: item.id } })}
                >
                    <Ionicons name="chatbubble-outline" size={18} color={colors.primary} />
                    <Text style={styles.actionText}>Message</Text>
                </TouchableOpacity>
                <TouchableOpacity
                    style={styles.actionButton}
                    onPress={() => navigation.navigate('StudentDetail', { studentId: item.id })}
                >
                    <Text style={styles.actionText}>View Profile</Text>
                    <Ionicons name="chevron-forward" size={16} color={colors.primary} />
                </TouchableOpacity>
            </View>
        </TouchableOpacity>
    );

    const renderEmptyState = () => (
        <View style={styles.emptyContainer}>
            <Ionicons name="school-outline" size={80} color={colors.gray300} />
            <Text style={styles.emptyTitle}>No Students Found</Text>
            <Text style={styles.emptySubtext}>
                {searchQuery ? 'Try a different search term' : 'You have no assigned students yet'}
            </Text>
        </View>
    );

    if (loading) {
        return (
            <View style={styles.safeArea}>
                <CustomHeader title="My Students" showBack={false} />
                <LoadingList count={5} />
            </View>
        );
    }

    return (
        <View style={styles.safeArea}>
            <CustomHeader
                title="My Students"
                subtitle={`${filteredStudents.length} total`}
                showBack={false}
            />

            {/* Search Bar */}
            <View style={styles.searchContainer}>
                <View style={styles.searchInputWrapper}>
                    <Ionicons name="search" size={20} color={colors.gray400} />
                    <TextInput
                        style={styles.searchInput}
                        placeholder="Search students..."
                        placeholderTextColor={colors.gray400}
                        value={searchQuery}
                        onChangeText={setSearchQuery}
                        returnKeyType="search"
                    />
                    {searchQuery.length > 0 && (
                        <TouchableOpacity onPress={() => setSearchQuery('')}>
                            <Ionicons name="close-circle" size={20} color={colors.gray400} />
                        </TouchableOpacity>
                    )}
                </View>
            </View>

            {/* Students List */}
            <FlatList
                data={filteredStudents}
                keyExtractor={(item) => item.id?.toString()}
                renderItem={renderStudentItem}
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
        </View>
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
    searchContainer: {
        paddingHorizontal: spacing.md,
        paddingVertical: spacing.sm,
        backgroundColor: colors.white,
        borderBottomWidth: 1,
        borderBottomColor: colors.gray100,
    },
    searchInputWrapper: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: colors.gray50,
        borderRadius: borderRadius.lg,
        paddingHorizontal: spacing.md,
        paddingVertical: spacing.sm,
    },
    searchInput: {
        flex: 1,
        marginLeft: spacing.sm,
        fontSize: fontSizes.md,
        color: colors.text,
        paddingVertical: 0,
    },
    listContent: {
        padding: spacing.md,
        paddingBottom: spacing.xxl,
    },
    studentCard: {
        backgroundColor: colors.white,
        borderRadius: borderRadius.lg,
        padding: spacing.md,
    },
    cardHeader: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    avatar: {
        width: isSmallDevice ? 40 : 48,
        height: isSmallDevice ? 40 : 48,
        borderRadius: isSmallDevice ? 20 : 24,
        alignItems: 'center',
        justifyContent: 'center',
    },
    avatarText: {
        fontSize: isSmallDevice ? fontSizes.md : fontSizes.lg,
        fontWeight: '600',
        color: colors.success,
    },
    studentInfo: {
        flex: 1,
        marginLeft: spacing.sm,
        marginRight: spacing.sm,
    },
    studentName: {
        fontSize: isSmallDevice ? fontSizes.md : fontSizes.lg,
        fontWeight: '600',
        color: colors.text,
    },
    studentEmail: {
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
    cardDetails: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        marginTop: spacing.sm,
        paddingTop: spacing.sm,
        borderTopWidth: 1,
        borderTopColor: colors.gray100,
    },
    detailItem: {
        flexDirection: 'row',
        alignItems: 'center',
        marginRight: spacing.md,
        marginBottom: spacing.xs,
    },
    detailText: {
        fontSize: fontSizes.sm,
        color: colors.textSecondary,
        marginLeft: 4,
    },
    cardFooter: {
        marginTop: spacing.sm,
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingTop: spacing.sm,
        borderTopWidth: 1,
        borderTopColor: colors.gray100,
    },
    actionButton: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: spacing.xs,
    },
    actionText: {
        fontSize: fontSizes.sm,
        color: colors.primary,
        fontWeight: '500',
        marginLeft: 4,
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
        paddingHorizontal: spacing.xl,
    },
});

export default StudentsScreen;
