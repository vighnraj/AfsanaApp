// Counselor Leads Screen - Full API Integration

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
import { getCounselorLeads, updateLead } from '../../api/leadApi';
import { colors, spacing, borderRadius, fontSizes, shadows } from '../../context/ThemeContext';
import { LoadingSpinner, LoadingList } from '../../components/common/Loading';
import { showToast } from '../../components/common/Toast';
import { formatDateReadable, getInitials } from '../../utils/formatting';
import { STATUS_OPTIONS } from '../../utils/constants';
import { CustomHeader } from '../../components/common';

const { width: screenWidth } = Dimensions.get('window');
const isSmallDevice = screenWidth < 375;

const LeadsScreen = ({ navigation }) => {
    const { user } = useAuth();

    const [leads, setLeads] = useState([]);
    const [filteredLeads, setFilteredLeads] = useState([]);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');

    const fetchLeads = useCallback(async () => {
        try {
            const counselorId = user?.counselor_id || user?.id;
            if (!counselorId) {
                setLoading(false);
                return;
            }
            const data = await getCounselorLeads(counselorId);
            const leadsArray = Array.isArray(data) ? data : data.leads || [];
            setLeads(leadsArray);
            setFilteredLeads(leadsArray);
        } catch (error) {
            console.error('Fetch leads error:', error);
            showToast.error('Error', 'Failed to load leads');
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    }, [user?.counselor_id, user?.id]);

    useEffect(() => {
        fetchLeads();
    }, [fetchLeads]);

    // Filter leads based on search
    useEffect(() => {
        if (!searchQuery.trim()) {
            setFilteredLeads(leads);
        } else {
            const query = searchQuery.toLowerCase();
            const filtered = leads.filter(lead =>
                lead.full_name?.toLowerCase().includes(query) ||
                lead.email?.toLowerCase().includes(query) ||
                lead.phone?.includes(query)
            );
            setFilteredLeads(filtered);
        }
    }, [searchQuery, leads]);

    const onRefresh = () => {
        setRefreshing(true);
        fetchLeads();
    };

    const getStatusColor = (status) => {
        const statusOption = STATUS_OPTIONS.find(s => s.value === status);
        return statusOption?.color || colors.gray400;
    };

    const renderLeadItem = ({ item }) => (
        <TouchableOpacity
            style={[styles.leadCard, shadows.sm]}
            onPress={() => navigation.navigate('LeadDetail', { leadId: item.inquiry_id || item.id })}
            activeOpacity={0.7}
        >
            {/* Avatar and Basic Info */}
            <View style={styles.cardHeader}>
                <View style={[styles.avatar, { backgroundColor: colors.primaryLight + '20' }]}>
                    <Text style={styles.avatarText}>
                        {getInitials(item.full_name || 'NA')}
                    </Text>
                </View>
                <View style={styles.leadInfo}>
                    <Text style={styles.leadName} numberOfLines={1}>
                        {item.full_name || 'Unknown'}
                    </Text>
                    <Text style={styles.leadEmail} numberOfLines={1}>
                        {item.email || 'No email'}
                    </Text>
                </View>
                <View style={[styles.statusBadge, { backgroundColor: getStatusColor(item.status) + '20' }]}>
                    <Text style={[styles.statusText, { color: getStatusColor(item.status) }]}>
                        {item.status || 'New'}
                    </Text>
                </View>
            </View>

            {/* Additional Details */}
            <View style={styles.cardDetails}>
                {item.phone && (
                    <View style={styles.detailItem}>
                        <Ionicons name="call-outline" size={14} color={colors.textSecondary} />
                        <Text style={styles.detailText}>{item.phone}</Text>
                    </View>
                )}
                {item.country_of_interest && (
                    <View style={styles.detailItem}>
                        <Ionicons name="globe-outline" size={14} color={colors.textSecondary} />
                        <Text style={styles.detailText}>{item.country_of_interest}</Text>
                    </View>
                )}
                <View style={styles.detailItem}>
                    <Ionicons name="calendar-outline" size={14} color={colors.textSecondary} />
                    <Text style={styles.detailText}>{formatDateReadable(item.created_at)}</Text>
                </View>
            </View>

            {/* Action Footer */}
            <View style={styles.cardFooter}>
                <TouchableOpacity
                    style={styles.actionButton}
                    onPress={() => navigation.navigate('LeadDetail', { leadId: item.inquiry_id || item.id })}
                >
                    <Text style={styles.actionText}>View Details</Text>
                    <Ionicons name="chevron-forward" size={16} color={colors.primary} />
                </TouchableOpacity>
            </View>
        </TouchableOpacity>
    );

    const renderEmptyState = () => (
        <View style={styles.emptyContainer}>
            <Ionicons name="people-outline" size={80} color={colors.gray300} />
            <Text style={styles.emptyTitle}>No Leads Found</Text>
            <Text style={styles.emptySubtext}>
                {searchQuery ? 'Try a different search term' : 'You have no assigned leads yet'}
            </Text>
        </View>
    );

    if (loading) {
        return (
            <SafeAreaView style={styles.safeArea} edges={['top']}>
                <View style={styles.header}>
                    <Text style={styles.headerTitle}>My Leads</Text>
                </View>
                <LoadingList count={5} />
            </SafeAreaView>
        );
    }

    return (
        <View style={styles.safeArea}>
            <CustomHeader
                title="My Leads"
                subtitle={`${filteredLeads.length} total`}
                showBack={false}
            />

            {/* Search Bar */}
            <View style={styles.searchContainer}>
                <View style={styles.searchInputWrapper}>
                    <Ionicons name="search" size={20} color={colors.gray400} />
                    <TextInput
                        style={styles.searchInput}
                        placeholder="Search by name, email, or phone..."
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

            {/* Leads List */}
            <FlatList
                data={filteredLeads}
                keyExtractor={(item) => item.id?.toString()}
                renderItem={renderLeadItem}
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
    leadCard: {
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
        color: colors.primary,
    },
    leadInfo: {
        flex: 1,
        marginLeft: spacing.sm,
        marginRight: spacing.sm,
    },
    leadName: {
        fontSize: isSmallDevice ? fontSizes.md : fontSizes.lg,
        fontWeight: '600',
        color: colors.text,
    },
    leadEmail: {
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
        justifyContent: 'flex-end',
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

export default LeadsScreen;
