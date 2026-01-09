// University Submissions Screen

import React, { useState, useEffect } from 'react';
import {
    View,
    Text,
    StyleSheet,
    ScrollView,
    TouchableOpacity,
    TextInput,
    FlatList,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { Picker } from '@react-native-picker/picker';

import { colors, spacing, borderRadius, fontSizes, shadows } from '../../context/ThemeContext';
import CustomHeader from '../../components/common/CustomHeader';
import { showToast } from '../../components/common/Toast';

const UniversitySubmissionsScreen = ({ navigation }) => {
    const [submissions, setSubmissions] = useState([]);
    const [filteredSubmissions, setFilteredSubmissions] = useState([]);
    const [searchQuery, setSearchQuery] = useState('');
    const [statusFilter, setStatusFilter] = useState('All');
    const [sortBy, setSortBy] = useState('date');

    // Sample data - In production, fetch from API
    useEffect(() => {
        const sampleData = [
            {
                id: 1,
                student_name: 'John Doe',
                university: 'University of Toronto',
                status: 'submitted',
                date: '2026-01-05',
            },
            {
                id: 2,
                student_name: 'Jane Smith',
                university: 'Harvard University',
                status: 'pending',
                date: '2026-01-08',
            },
            {
                id: 3,
                student_name: 'Mike Johnson',
                university: 'Oxford University',
                status: 'reviewed',
                date: '2026-01-03',
            },
            {
                id: 4,
                student_name: 'Sarah Williams',
                university: 'Stanford University',
                status: 'submitted',
                date: '2026-01-07',
            },
            {
                id: 5,
                student_name: 'David Brown',
                university: 'MIT',
                status: 'pending',
                date: '2026-01-09',
            },
        ];
        setSubmissions(sampleData);
        setFilteredSubmissions(sampleData);
    }, []);

    // Apply filters
    useEffect(() => {
        let filtered = [...submissions];

        // Search filter
        if (searchQuery) {
            filtered = filtered.filter(
                (sub) =>
                    sub.student_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                    sub.university.toLowerCase().includes(searchQuery.toLowerCase())
            );
        }

        // Status filter
        if (statusFilter !== 'All') {
            filtered = filtered.filter((sub) => sub.status === statusFilter.toLowerCase());
        }

        // Sort
        if (sortBy === 'date') {
            filtered.sort((a, b) => new Date(b.date) - new Date(a.date));
        } else if (sortBy === 'university') {
            filtered.sort((a, b) => a.university.localeCompare(b.university));
        }

        setFilteredSubmissions(filtered);
    }, [searchQuery, statusFilter, sortBy, submissions]);

    // Handle status change
    const handleStatusChange = (id, newStatus) => {
        const updated = submissions.map((sub) =>
            sub.id === id ? { ...sub, status: newStatus } : sub
        );
        setSubmissions(updated);
        showToast.success('Success', 'Status updated successfully');
    };

    // Handle delete
    const handleDelete = (id) => {
        const updated = submissions.filter((sub) => sub.id !== id);
        setSubmissions(updated);
        showToast.success('Success', 'Submission deleted successfully');
    };

    // Get status badge color
    const getStatusColor = (status) => {
        switch (status) {
            case 'submitted':
                return colors.success;
            case 'pending':
                return colors.warning;
            case 'reviewed':
                return colors.info;
            default:
                return colors.gray400;
        }
    };

    // Format date
    const formatDate = (dateString) => {
        const date = new Date(dateString);
        return date.toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' });
    };

    // Render submission card
    const renderSubmissionCard = ({ item }) => (
        <View style={[styles.card, shadows.sm]}>
            <View style={styles.cardHeader}>
                <View style={styles.cardHeaderLeft}>
                    <Ionicons name="school" size={20} color={colors.primary} />
                    <View style={styles.cardHeaderText}>
                        <Text style={styles.studentName}>{item.student_name}</Text>
                        <Text style={styles.universityName}>{item.university}</Text>
                    </View>
                </View>
                <TouchableOpacity onPress={() => handleDelete(item.id)}>
                    <Ionicons name="trash-outline" size={20} color={colors.error} />
                </TouchableOpacity>
            </View>

            <View style={styles.cardBody}>
                <View style={styles.infoRow}>
                    <Ionicons name="calendar-outline" size={16} color={colors.textSecondary} />
                    <Text style={styles.infoLabel}>Submission Date:</Text>
                    <Text style={styles.infoValue}>{formatDate(item.date)}</Text>
                </View>

                <View style={styles.statusRow}>
                    <Text style={styles.statusLabel}>Status:</Text>
                    <View style={styles.pickerContainer}>
                        <Picker
                            selectedValue={item.status}
                            onValueChange={(value) => handleStatusChange(item.id, value)}
                            style={styles.picker}
                        >
                            <Picker.Item label="Pending" value="pending" />
                            <Picker.Item label="Submitted" value="submitted" />
                            <Picker.Item label="Reviewed" value="reviewed" />
                        </Picker>
                    </View>
                </View>
            </View>

            <View
                style={[
                    styles.statusBadge,
                    { backgroundColor: `${getStatusColor(item.status)}20` },
                ]}
            >
                <Text style={[styles.statusBadgeText, { color: getStatusColor(item.status) }]}>
                    {item.status.charAt(0).toUpperCase() + item.status.slice(1)}
                </Text>
            </View>
        </View>
    );

    return (
        <SafeAreaView style={styles.safeArea} edges={['bottom']}>
            <CustomHeader
                title="University Submissions"
                showBack
                onBack={() => navigation.goBack()}
            />

            <View style={styles.container}>
                {/* Search Bar */}
                <View style={styles.searchContainer}>
                    <Ionicons name="search" size={20} color={colors.gray400} />
                    <TextInput
                        style={styles.searchInput}
                        placeholder="Search by student or university..."
                        placeholderTextColor={colors.gray400}
                        value={searchQuery}
                        onChangeText={setSearchQuery}
                    />
                    {searchQuery.length > 0 && (
                        <TouchableOpacity onPress={() => setSearchQuery('')}>
                            <Ionicons name="close-circle" size={20} color={colors.gray400} />
                        </TouchableOpacity>
                    )}
                </View>

                {/* Filters */}
                <View style={styles.filtersContainer}>
                    <View style={styles.filterItem}>
                        <Text style={styles.filterLabel}>Status</Text>
                        <View style={styles.filterPickerContainer}>
                            <Picker
                                selectedValue={statusFilter}
                                onValueChange={(value) => setStatusFilter(value)}
                                style={styles.filterPicker}
                            >
                                <Picker.Item label="All" value="All" />
                                <Picker.Item label="Pending" value="Pending" />
                                <Picker.Item label="Submitted" value="Submitted" />
                                <Picker.Item label="Reviewed" value="Reviewed" />
                            </Picker>
                        </View>
                    </View>

                    <View style={styles.filterItem}>
                        <Text style={styles.filterLabel}>Sort By</Text>
                        <View style={styles.filterPickerContainer}>
                            <Picker
                                selectedValue={sortBy}
                                onValueChange={(value) => setSortBy(value)}
                                style={styles.filterPicker}
                            >
                                <Picker.Item label="Date" value="date" />
                                <Picker.Item label="University" value="university" />
                            </Picker>
                        </View>
                    </View>
                </View>

                {/* Submissions List */}
                <FlatList
                    data={filteredSubmissions}
                    renderItem={renderSubmissionCard}
                    keyExtractor={(item) => item.id.toString()}
                    contentContainerStyle={styles.listContainer}
                    ListEmptyComponent={
                        <View style={styles.emptyContainer}>
                            <Ionicons name="document-text-outline" size={64} color={colors.gray300} />
                            <Text style={styles.emptyText}>No submissions found</Text>
                        </View>
                    }
                />
            </View>
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
    searchContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: colors.white,
        margin: spacing.md,
        padding: spacing.sm,
        borderRadius: borderRadius.md,
        ...shadows.sm,
        gap: spacing.xs,
    },
    searchInput: {
        flex: 1,
        fontSize: fontSizes.sm,
        color: colors.text,
        padding: 0,
    },
    filtersContainer: {
        flexDirection: 'row',
        paddingHorizontal: spacing.md,
        gap: spacing.sm,
        marginBottom: spacing.sm,
    },
    filterItem: {
        flex: 1,
    },
    filterLabel: {
        fontSize: fontSizes.xs,
        fontWeight: '600',
        color: colors.textSecondary,
        marginBottom: spacing.xs,
    },
    filterPickerContainer: {
        backgroundColor: colors.white,
        borderRadius: borderRadius.md,
        borderWidth: 1,
        borderColor: colors.gray200,
        ...shadows.sm,
    },
    filterPicker: {
        height: 40,
    },
    listContainer: {
        padding: spacing.md,
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
        paddingBottom: spacing.sm,
        borderBottomWidth: 1,
        borderBottomColor: colors.gray100,
    },
    cardHeaderLeft: {
        flexDirection: 'row',
        alignItems: 'center',
        flex: 1,
        gap: spacing.sm,
    },
    cardHeaderText: {
        flex: 1,
    },
    studentName: {
        fontSize: fontSizes.md,
        fontWeight: '700',
        color: colors.text,
    },
    universityName: {
        fontSize: fontSizes.sm,
        color: colors.textSecondary,
        marginTop: 2,
    },
    cardBody: {
        marginTop: spacing.sm,
    },
    infoRow: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: spacing.sm,
        gap: spacing.xs,
    },
    infoLabel: {
        fontSize: fontSizes.sm,
        color: colors.textSecondary,
        marginLeft: spacing.xs,
    },
    infoValue: {
        fontSize: fontSizes.sm,
        fontWeight: '600',
        color: colors.text,
        flex: 1,
    },
    statusRow: {
        flexDirection: 'row',
        alignItems: 'center',
        marginTop: spacing.sm,
    },
    statusLabel: {
        fontSize: fontSizes.sm,
        fontWeight: '600',
        color: colors.text,
        marginRight: spacing.sm,
    },
    pickerContainer: {
        flex: 1,
        borderWidth: 1,
        borderColor: colors.gray200,
        borderRadius: borderRadius.md,
        backgroundColor: colors.gray50,
    },
    picker: {
        height: 40,
    },
    statusBadge: {
        marginTop: spacing.sm,
        paddingVertical: spacing.xs,
        paddingHorizontal: spacing.sm,
        borderRadius: borderRadius.md,
        alignSelf: 'flex-start',
    },
    statusBadgeText: {
        fontSize: fontSizes.xs,
        fontWeight: '600',
    },
    emptyContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        paddingVertical: spacing.xxl * 2,
    },
    emptyText: {
        marginTop: spacing.md,
        fontSize: fontSizes.md,
        color: colors.textSecondary,
    },
});

export default UniversitySubmissionsScreen;
