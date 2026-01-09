// Admin Student List Screen

import React, { useState, useEffect, useCallback } from 'react';
import {
    View,
    Text,
    StyleSheet,
    FlatList,
    TouchableOpacity,
    RefreshControl,
    TextInput,
    Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';

import { getAllStudents, deleteStudent } from '../../api/studentApi';
import { colors, spacing, borderRadius, fontSizes, shadows } from '../../context/ThemeContext';
import { LoadingSpinner } from '../../components/common/Loading';
import { showToast } from '../../components/common/Toast';
import { formatDateReadable, getInitials } from '../../utils/formatting';
import CustomHeader from '../../components/common/CustomHeader';

const StudentListScreen = ({ navigation }) => {
    const [students, setStudents] = useState([]);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');

    const fetchStudents = useCallback(async () => {
        try {
            const data = await getAllStudents();
            setStudents(Array.isArray(data) ? data : data.students || []);
        } catch (error) {
            console.error('Fetch students error:', error);
            showToast.error('Error', 'Failed to load students');
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    }, []);

    useEffect(() => {
        fetchStudents();
    }, [fetchStudents]);

    const onRefresh = () => {
        setRefreshing(true);
        fetchStudents();
    };

    const handleDeleteStudent = async (studentId, studentName) => {
        Alert.alert(
            'Delete Student',
            `Are you sure you want to delete ${studentName}? This action cannot be undone.`,
            [
                { text: 'Cancel', style: 'cancel' },
                {
                    text: 'Delete',
                    style: 'destructive',
                    onPress: async () => {
                        try {
                            await deleteStudent(studentId);
                            showToast.success('Success', 'Student deleted successfully');
                            fetchStudents();
                        } catch (error) {
                            console.error('Delete student error:', error);
                            showToast.error('Error', 'Failed to delete student');
                        }
                    }
                }
            ]
        );
    };

    const handleEditStudent = (student) => {
        navigation.navigate('AddStudent', { student });
    };

    const filteredStudents = students.filter(student => {
        if (!searchQuery) return true;
        const query = searchQuery.toLowerCase();
        return (
            student.full_name?.toLowerCase().includes(query) ||
            student.email?.toLowerCase().includes(query) ||
            student.phone?.toLowerCase().includes(query)
        );
    });

    const renderStudentItem = ({ item }) => (
        <View style={[styles.studentCard, shadows.sm]}>
            <TouchableOpacity
                onPress={() => navigation.navigate('StudentDetail', { studentId: item.id })}
            >
                <View style={styles.cardHeader}>
                    <View style={[styles.avatar, { backgroundColor: `${colors.primary}20` }]}>
                        <Text style={styles.avatarText}>{getInitials(item.full_name)}</Text>
                    </View>
                    <View style={styles.headerInfo}>
                        <Text style={styles.name} numberOfLines={1}>{item.full_name}</Text>
                        <Text style={styles.email} numberOfLines={1}>{item.email}</Text>
                    </View>
                    <TouchableOpacity style={styles.actionButton}>
                        <Ionicons name="chevron-forward" size={20} color={colors.gray400} />
                    </TouchableOpacity>
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
                    {item.university_name && (
                        <View style={styles.detailItem}>
                            <Ionicons name="school-outline" size={14} color={colors.textSecondary} />
                            <Text style={styles.detailText}>{item.university_name}</Text>
                        </View>
                    )}
                </View>

                {item.counselor_name && (
                    <View style={styles.counselorTag}>
                        <Ionicons name="person-outline" size={12} color={colors.primary} />
                        <Text style={styles.counselorText}>Counselor: {item.counselor_name}</Text>
                    </View>
                )}
            </TouchableOpacity>

            {/* Action Buttons */}
            <View style={styles.actionButtons}>
                <TouchableOpacity
                    style={[styles.cardActionButton, { backgroundColor: `${colors.primary}15` }]}
                    onPress={() => handleEditStudent(item)}
                >
                    <Ionicons name="create-outline" size={18} color={colors.primary} />
                    <Text style={[styles.cardActionText, { color: colors.primary }]}>Edit</Text>
                </TouchableOpacity>
                <TouchableOpacity
                    style={[styles.cardActionButton, { backgroundColor: `${colors.error}15` }]}
                    onPress={() => handleDeleteStudent(item.id, item.full_name)}
                >
                    <Ionicons name="trash-outline" size={18} color={colors.error} />
                    <Text style={[styles.cardActionText, { color: colors.error }]}>Delete</Text>
                </TouchableOpacity>
            </View>
        </View>
    );

    if (loading) {
        return (
            <View style={styles.safeArea}>
                <CustomHeader title="Students" showBack={false} />
                <LoadingSpinner />
            </View>
        );
    }

    return (
        <View style={styles.safeArea}>
            <CustomHeader
                title="Students"
                subtitle={`${students.length} total`}
                showBack={false}
            />

            {/* Search Bar */}
            <View style={styles.searchContainer}>
                <View style={styles.searchBar}>
                    <Ionicons name="search" size={20} color={colors.gray400} />
                    <TextInput
                        style={styles.searchInput}
                        placeholder="Search students..."
                        placeholderTextColor={colors.gray400}
                        value={searchQuery}
                        onChangeText={setSearchQuery}
                    />
                    {searchQuery ? (
                        <TouchableOpacity onPress={() => setSearchQuery('')}>
                            <Ionicons name="close-circle" size={20} color={colors.gray400} />
                        </TouchableOpacity>
                    ) : null}
                </View>
            </View>

            {/* Results Count */}
            <Text style={styles.resultsCount}>
                {filteredStudents.length} student{filteredStudents.length !== 1 ? 's' : ''} found
            </Text>

            {/* List */}
            <FlatList
                data={filteredStudents}
                keyExtractor={(item) => item.id?.toString()}
                renderItem={renderStudentItem}
                contentContainerStyle={styles.listContent}
                showsVerticalScrollIndicator={false}
                refreshControl={
                    <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
                }
                ListEmptyComponent={
                    <View style={styles.emptyContainer}>
                        <Ionicons name="school-outline" size={64} color={colors.gray300} />
                        <Text style={styles.emptyText}>No students found</Text>
                    </View>
                }
            />

            {/* Add Student FAB */}
            <TouchableOpacity
                style={[styles.fab, shadows.lg]}
                onPress={() => navigation.navigate('AddStudent')}
            >
                <Ionicons name="add" size={30} color={colors.white} />
            </TouchableOpacity>
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
        padding: spacing.md,
        backgroundColor: colors.primary,
    },
    title: {
        fontSize: fontSizes.h3,
        fontWeight: '700',
        color: colors.white,
    },
    subtitle: {
        fontSize: fontSizes.md,
        color: colors.white,
        opacity: 0.8,
    },
    searchContainer: {
        padding: spacing.md,
        backgroundColor: colors.white,
    },
    searchBar: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: colors.gray50,
        borderRadius: borderRadius.md,
        paddingHorizontal: spacing.sm,
        height: 44,
    },
    searchInput: {
        flex: 1,
        marginLeft: spacing.sm,
        fontSize: fontSizes.md,
        color: colors.text,
    },
    resultsCount: {
        fontSize: fontSizes.sm,
        color: colors.textSecondary,
        paddingHorizontal: spacing.md,
        paddingVertical: spacing.xs,
    },
    listContent: {
        padding: spacing.md,
        paddingTop: 0,
    },
    studentCard: {
        backgroundColor: colors.white,
        borderRadius: borderRadius.lg,
        padding: spacing.md,
        marginBottom: spacing.sm,
    },
    cardHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: spacing.sm,
    },
    avatar: {
        width: 48,
        height: 48,
        borderRadius: 24,
        alignItems: 'center',
        justifyContent: 'center',
    },
    avatarText: {
        fontSize: fontSizes.lg,
        fontWeight: '600',
        color: colors.primary,
    },
    headerInfo: {
        flex: 1,
        marginLeft: spacing.sm,
    },
    name: {
        fontSize: fontSizes.md,
        fontWeight: '600',
        color: colors.text,
    },
    email: {
        fontSize: fontSizes.sm,
        color: colors.textSecondary,
    },
    actionButton: {
        padding: spacing.xs,
    },
    cardDetails: {
        flexDirection: 'row',
        flexWrap: 'wrap',
    },
    detailItem: {
        flexDirection: 'row',
        alignItems: 'center',
        marginRight: spacing.md,
        marginTop: spacing.xs,
    },
    detailText: {
        fontSize: fontSizes.sm,
        color: colors.textSecondary,
        marginLeft: 4,
    },
    counselorTag: {
        flexDirection: 'row',
        alignItems: 'center',
        marginTop: spacing.sm,
        paddingTop: spacing.sm,
        borderTopWidth: 1,
        borderTopColor: colors.gray100,
    },
    counselorText: {
        fontSize: fontSizes.sm,
        color: colors.primary,
        marginLeft: 4,
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
        right: spacing.lg,
        bottom: 80, // Lifted for floating tabs
        width: 60,
        height: 60,
        borderRadius: 30,
        backgroundColor: colors.primary,
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 10,
    },
    actionButtons: {
        flexDirection: 'row',
        marginTop: spacing.sm,
        paddingTop: spacing.sm,
        borderTopWidth: 1,
        borderTopColor: colors.gray100,
        gap: spacing.sm,
    },
    cardActionButton: {
        flex: 1,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: spacing.sm,
        paddingHorizontal: spacing.xs,
        borderRadius: borderRadius.md,
        gap: 6,
    },
    cardActionText: {
        fontSize: fontSizes.sm,
        fontWeight: '600',
    },
});

export default StudentListScreen;
