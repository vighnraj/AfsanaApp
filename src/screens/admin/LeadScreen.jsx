// Admin Lead Screen - Enhanced with Status Change and Assign Counselor Modals

import React, { useState, useEffect, useCallback, useMemo } from 'react';
import {
    View,
    Text,
    StyleSheet,
    FlatList,
    TouchableOpacity,
    RefreshControl,
    TextInput,
    Modal,
    ScrollView,
    ActivityIndicator,
    Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';

import { getLeads, updateLead, assignInquiry, deleteLead } from '../../api/leadApi';
import { getStaffById, getCounselors } from '../../api/userApi';
import { useAuth } from '../../context/AuthContext';
import { colors, spacing, borderRadius, fontSizes, shadows } from '../../context/ThemeContext';
import { LoadingSpinner } from '../../components/common/Loading';
import { showToast } from '../../components/common/Toast';
import { formatDateReadable, getInitials } from '../../utils/formatting';
import { STATUS_OPTIONS, COUNTRIES, PRIORITY_OPTIONS, LEAD_TYPE_OPTIONS, BRANCH_OPTIONS, FOLLOW_UP_PRESETS, SORT_OPTIONS } from '../../utils/constants';
import DateRangePicker from '../../components/common/DateRangePicker';
import FilterDropdown from '../../components/common/FilterDropdown';
import LeadDetailModal from '../../components/lead/LeadDetailModal';
import CustomHeader from '../../components/common/CustomHeader';

const LeadScreen = ({ navigation }) => {
    const { user } = useAuth();
    const [leads, setLeads] = useState([]);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');

    // Modal states
    const [statusModalVisible, setStatusModalVisible] = useState(false);
    const [assignModalVisible, setAssignModalVisible] = useState(false);
    const [selectedLead, setSelectedLead] = useState(null);
    const [selectedLeadForDetails, setSelectedLeadForDetails] = useState(null);
    const [showLeadDetailsModal, setShowLeadDetailsModal] = useState(false);
    const [counselors, setCounselors] = useState([]);
    const [selectedStatus, setSelectedStatus] = useState('');
    const [selectedCounselor, setSelectedCounselor] = useState(null);
    const [modalLoading, setModalLoading] = useState(false);
    const [notes, setNotes] = useState('');
    const [followUpDate, setFollowUpDate] = useState('');
    const [nextFollowUpDate, setNextFollowUpDate] = useState('');

    // Filter states
    const [showFilters, setShowFilters] = useState(false);
    const [filters, setFilters] = useState({
        status: '',
        country: '',
        counselor: '',
        source: '',
        branch: '',
        priority: '',
        leadType: '',
        followUp: '',
        sortBy: 'newToOld',
        startDate: '',
        endDate: '',
        followUpDoneFrom: '',
        followUpDoneTo: '',
        nextFollowUpFrom: '',
        nextFollowUpTo: '',
    });

    // tempFilters used inside panel until user clicks Apply
    const [tempFilters, setTempFilters] = useState(filters);
    const fetchLeads = useCallback(async () => {
        try {
            let apiFilters = {};

            // Logic to fetch staff branch (matches Frontend)
            if (user?.id && user?.role === 'staff') {
                try {
                    const staffData = await getStaffById(user.id);
                    const staff = Array.isArray(staffData) ? staffData[0] : staffData;

                    if (staff?.branch) {
                        apiFilters.branch = staff.branch;
                        apiFilters.created_at = staff.created_at ? new Date(staff.created_at).toISOString().split("T")[0] : null;
                    }
                } catch (staffError) {
                    console.warn('Error fetching staff branch:', staffError);
                }
            }

            const data = await getLeads(apiFilters);
            setLeads(Array.isArray(data) ? data : data.leads || []);
        } catch (error) {
            console.error('Fetch leads error:', error);
            showToast.error('Error', 'Failed to load leads');
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    }, [user]);

    const fetchCounselors = async () => {
        try {
            const data = await getCounselors();
            setCounselors(Array.isArray(data) ? data : []);
        } catch (error) {
            console.error('Error fetching counselors:', error);
        }
    };

    useEffect(() => {
        fetchLeads();
        fetchCounselors();
    }, [fetchLeads]);

    const onRefresh = () => {
        setRefreshing(true);
        fetchLeads();
    };

    const getStatusColor = (status) => {
        const option = STATUS_OPTIONS.find(s => s.value === status);
        return option?.color || colors.gray400;
    };

    // Memoized filtered leads applying full filter set and sorting
    const filteredLeads = useMemo(() => {
        const applyDateInRange = (dateStr, from, to) => {
            if (!dateStr) return false;
            const d = new Date(dateStr).setHours(0, 0, 0, 0);
            if (from) {
                const f = new Date(from).setHours(0, 0, 0, 0);
                if (d < f) return false;
            }
            if (to) {
                const t = new Date(to).setHours(0, 0, 0, 0);
                if (d > t) return false;
            }
            return true;
        };

        const presetMatches = (lead, preset) => {
            if (!preset) return true;
            const today = new Date();
            const leadFollow = lead.follow_up_date ? new Date(lead.follow_up_date) : null;
            if (preset === 'today') {
                return leadFollow && (new Date(leadFollow).toDateString() === today.toDateString());
            }
            if (preset === 'yesterday') {
                const y = new Date(); y.setDate(y.getDate() - 1);
                return leadFollow && (new Date(leadFollow).toDateString() === y.toDateString());
            }
            if (preset === 'nextWeek') {
                const start = new Date(); start.setDate(start.getDate() + 1);
                const end = new Date(); end.setDate(end.getDate() + 7);
                return leadFollow && new Date(leadFollow) >= start && new Date(leadFollow) <= end;
            }
            if (preset === 'thisWeek') {
                const start = new Date(); start.setDate(start.getDate() - start.getDay());
                const end = new Date(start); end.setDate(start.getDate() + 6);
                return leadFollow && new Date(leadFollow) >= start && new Date(leadFollow) <= end;
            }
            if (preset === 'overdue') {
                return leadFollow && new Date(leadFollow) < new Date();
            }
            return true;
        };

        let list = leads.filter(lead => {
            // Search
            if (searchQuery) {
                const q = searchQuery.toLowerCase();
                if (!(lead.name?.toLowerCase().includes(q) || lead.email?.toLowerCase().includes(q) || lead.phone?.toLowerCase().includes(q))) return false;
            }

            if (filters.status && lead.status !== filters.status) return false;
            if (filters.country && lead.country !== filters.country) return false;
            if (filters.counselor && String(lead.counselor_id) !== String(filters.counselor)) return false;
            if (filters.source && lead.source !== filters.source) return false;
            if (filters.branch && lead.branch !== filters.branch) return false;
            if (filters.priority && lead.priority !== filters.priority) return false;
            if (filters.leadType && (lead.lead_type || lead.inquiry_type) !== filters.leadType) return false;

            // Date ranges
            if (filters.startDate || filters.endDate) {
                const created = lead.created_at || lead.inquiry_date || lead.date;
                if (!applyDateInRange(created, filters.startDate, filters.endDate)) return false;
            }

            if (filters.followUpDoneFrom || filters.followUpDoneTo) {
                if (!applyDateInRange(lead.follow_up_done_at, filters.followUpDoneFrom, filters.followUpDoneTo)) return false;
            }

            if (filters.nextFollowUpFrom || filters.nextFollowUpTo) {
                if (!applyDateInRange(lead.next_followup_date, filters.nextFollowUpFrom, filters.nextFollowUpTo)) return false;
            }

            // Follow-up preset
            if (filters.followUp && !presetMatches(lead, filters.followUp)) return false;

            return true;
        });

        // Sorting
        if (filters.sortBy === 'newToOld') {
            list.sort((a, b) => new Date(b.created_at || b.inquiry_date) - new Date(a.created_at || a.inquiry_date));
        } else if (filters.sortBy === 'oldToNew') {
            list.sort((a, b) => new Date(a.created_at || a.inquiry_date) - new Date(b.created_at || b.inquiry_date));
        } else if (filters.sortBy === 'aToZ') {
            list.sort((a, b) => (a.name || '').localeCompare(b.name || ''));
        } else if (filters.sortBy === 'zToA') {
            list.sort((a, b) => (b.name || '').localeCompare(a.name || ''));
        }

        return list;
    }, [leads, searchQuery, filters]);

    // Handle status change
    const handleStatusChange = async () => {
        if (!selectedLead || !selectedStatus) return;

        setModalLoading(true);
        try {
            await updateLead(selectedLead.id, {
                status: selectedStatus,
            });
            showToast.success('Success', 'Status updated successfully');
            setStatusModalVisible(false);
            setSelectedLead(null);
            setSelectedStatus('');
            fetchLeads();
        } catch (error) {
            console.error('Status update error:', error);
            showToast.error('Error', 'Failed to update status');
        } finally {
            setModalLoading(false);
        }
    };

    // Handle counselor assignment
    const handleAssignCounselor = async () => {
        if (!selectedLead || !selectedCounselor) return;

        // follow-up date is required
        if (!followUpDate) {
            showToast.error('Validation', 'Follow-up date is required');
            return;
        }

        setModalLoading(true);
        try {
            await assignInquiry({
                inquiry_id: selectedLead.id,
                counselor_id: selectedCounselor.id,
                follow_up_date: followUpDate || null,
                next_followup_date: nextFollowUpDate || null,
                notes: notes,
            });
            showToast.success('Success', 'Counselor assigned successfully');
            setAssignModalVisible(false);
            setSelectedLead(null);
            setSelectedCounselor(null);
            setNotes('');
            setFollowUpDate('');
            setNextFollowUpDate('');
            fetchLeads();
        } catch (error) {
            console.error('Assign counselor error:', error);
            showToast.error('Error', 'Failed to assign counselor');
        } finally {
            setModalLoading(false);
        }
    };

    // Handle delete lead
    const handleDelete = (lead) => {
        Alert.alert(
            'Delete Lead',
            `Are you sure you want to delete ${lead.name}?`,
            [
                { text: 'Cancel', style: 'cancel' },
                {
                    text: 'Delete',
                    style: 'destructive',
                    onPress: async () => {
                        setLoading(true);
                        try {
                            await deleteLead(lead.id);
                            showToast.success('Success', 'Lead deleted successfully');
                            fetchLeads(); // Refresh list
                        } catch (error) {
                            console.error('Delete error:', error);
                            showToast.error('Error', 'Failed to delete lead');
                        } finally {
                            setLoading(false);
                        }
                    }
                }
            ]
        );
    };

    // Open status modal
    const openStatusModal = (lead) => {
        setSelectedLead(lead);
        setSelectedStatus(lead.status || 'New');
        setStatusModalVisible(true);
    };

    // Open assign modal
    const openAssignModal = (lead) => {
        setSelectedLead(lead);
        setAssignModalVisible(true);
    };

    const renderLeadItem = ({ item }) => (
        <TouchableOpacity
            style={[styles.leadCard, shadows.sm]}
            onPress={() => openStatusModal(item)}
            onLongPress={() => openAssignModal(item)}
        >
            <View style={styles.cardHeader}>
                <View style={[styles.avatar, { backgroundColor: `${colors.success}20` }]}>
                    <Text style={styles.avatarText}>{getInitials(item.name)}</Text>
                </View>
                <View style={styles.headerInfo}>
                    <Text style={styles.name} numberOfLines={1}>{item.name}</Text>
                    <Text style={styles.email} numberOfLines={1}>{item.email}</Text>
                </View>
                <TouchableOpacity
                    style={[styles.statusBadge, { backgroundColor: getStatusColor(item.status) + '20' }]}
                    onPress={() => openStatusModal(item)}
                >
                    <Text style={[styles.statusText, { color: getStatusColor(item.status) }]}>
                        {item.status || 'New'}
                    </Text>
                </TouchableOpacity>
            </View>

            <View style={styles.cardDetails}>
                <View style={styles.detailItem}>
                    <Ionicons name="call-outline" size={14} color={colors.textSecondary} />
                    <Text style={styles.detailText}>{item.phone || 'N/A'}</Text>
                </View>
                <View style={styles.detailItem}>
                    <Ionicons name="location-outline" size={14} color={colors.textSecondary} />
                    <Text style={styles.detailText}>{item.country || 'N/A'}</Text>
                </View>
                <View style={styles.detailItem}>
                    <Ionicons name="briefcase-outline" size={14} color={colors.textSecondary} />
                    <Text style={styles.detailText}>{item.intake || 'N/A'}</Text>
                </View>
            </View>

            <View style={styles.cardActions}>
                <View style={{ flexDirection: 'row', alignItems: 'center', flex: 1 }}>
                    {item.counselor_name ? (
                        <View style={styles.counselorTag}>
                            <Ionicons name="person-outline" size={12} color={colors.primary} />
                            <Text style={styles.counselorText}>{item.counselor_name}</Text>
                        </View>
                    ) : (
                        <TouchableOpacity
                            style={styles.assignButton}
                            onPress={() => openAssignModal(item)}
                        >
                            <Ionicons name="person-add-outline" size={14} color={colors.primary} />
                            <Text style={styles.assignButtonText}>Assign</Text>
                        </TouchableOpacity>
                    )}
                </View>

                <TouchableOpacity
                    style={{ padding: 4, marginRight: 8 }}
                    onPress={() => setSelectedLeadForDetails(item) || setShowLeadDetailsModal(true)}
                >
                    <Ionicons name="information-circle-outline" size={20} color={colors.primary} />
                </TouchableOpacity>

                <TouchableOpacity
                    style={{ padding: 4, marginRight: 8 }}
                    onPress={() => navigation.navigate('AddLead', { lead: item })}
                >
                    <Ionicons name="create-outline" size={20} color={colors.primary} />
                </TouchableOpacity>

                <TouchableOpacity
                    style={{ padding: 4 }}
                    onPress={() => handleDelete(item)}
                >
                    <Ionicons name="trash-outline" size={20} color={colors.error} />
                </TouchableOpacity>
            </View>
        </TouchableOpacity>
    );

    // Status Change Modal
    const renderStatusModal = () => (
        <Modal
            visible={statusModalVisible}
            animationType="slide"
            transparent={true}
            onRequestClose={() => setStatusModalVisible(false)}
        >
            <View style={styles.modalOverlay}>
                <View style={styles.modalContent}>
                    <View style={styles.modalHeader}>
                        <Text style={styles.modalTitle}>Change Status</Text>
                        <TouchableOpacity onPress={() => setStatusModalVisible(false)}>
                            <Ionicons name="close" size={24} color={colors.text} />
                        </TouchableOpacity>
                    </View>

                    {selectedLead && (
                        <Text style={styles.modalSubtitle}>
                            Lead: {selectedLead.name}
                        </Text>
                    )}

                    <ScrollView style={styles.statusList}>
                        {STATUS_OPTIONS.map((option) => (
                            <TouchableOpacity
                                key={option.value}
                                style={[
                                    styles.statusOption,
                                    selectedStatus === option.value && styles.statusOptionSelected,
                                ]}
                                onPress={() => setSelectedStatus(option.value)}
                            >
                                <View style={[styles.statusDot, { backgroundColor: option.color }]} />
                                <Text style={styles.statusOptionText}>{option.label}</Text>
                                {selectedStatus === option.value && (
                                    <Ionicons name="checkmark" size={20} color={colors.primary} />
                                )}
                            </TouchableOpacity>
                        ))}
                    </ScrollView>

                    <TouchableOpacity
                        style={[styles.modalButton, modalLoading && styles.modalButtonDisabled]}
                        onPress={handleStatusChange}
                        disabled={modalLoading}
                    >
                        {modalLoading ? (
                            <ActivityIndicator color={colors.white} />
                        ) : (
                            <Text style={styles.modalButtonText}>Update Status</Text>
                        )}
                    </TouchableOpacity>
                </View>
            </View>
        </Modal>
    );

    // Assign Counselor Modal
    const renderAssignModal = () => (
        <Modal
            visible={assignModalVisible}
            animationType="slide"
            transparent={true}
            onRequestClose={() => setAssignModalVisible(false)}
        >
            <View style={styles.modalOverlay}>
                <View style={styles.modalContent}>
                    <View style={styles.modalHeader}>
                        <Text style={styles.modalTitle}>Assign Counselor</Text>
                        <TouchableOpacity onPress={() => setAssignModalVisible(false)}>
                            <Ionicons name="close" size={24} color={colors.text} />
                        </TouchableOpacity>
                    </View>

                    {selectedLead && (
                        <Text style={styles.modalSubtitle}>
                            Lead: {selectedLead.name}
                        </Text>
                    )}

                    <ScrollView style={styles.counselorList}>
                        {counselors.map((counselor) => (
                            <TouchableOpacity
                                key={counselor.id}
                                style={[
                                    styles.counselorOption,
                                    selectedCounselor?.id === counselor.id && styles.counselorOptionSelected,
                                ]}
                                onPress={() => setSelectedCounselor(counselor)}
                            >
                                <View style={styles.counselorAvatar}>
                                    <Text style={styles.counselorAvatarText}>
                                        {getInitials(counselor.full_name)}
                                    </Text>
                                </View>
                                <Text style={styles.counselorOptionText}>{counselor.full_name}</Text>
                                {selectedCounselor?.id === counselor.id && (
                                    <Ionicons name="checkmark" size={20} color={colors.primary} />
                                )}
                            </TouchableOpacity>
                        ))}
                    </ScrollView>

                    <DateRangePicker
                        label="Follow-Up Date"
                        startDate={followUpDate}
                        endDate={null}
                        onStartDateChange={(d) => setFollowUpDate(d)}
                        onEndDateChange={() => { }}
                    />

                    <DateRangePicker
                        label="Next Follow-Up Date"
                        startDate={nextFollowUpDate}
                        endDate={null}
                        onStartDateChange={(d) => setNextFollowUpDate(d)}
                        onEndDateChange={() => { }}
                    />

                    <TextInput
                        style={styles.notesInput}
                        placeholder="Add notes (optional)"
                        placeholderTextColor={colors.gray400}
                        value={notes}
                        onChangeText={setNotes}
                        multiline
                    />

                    <TouchableOpacity
                        style={[styles.modalButton, modalLoading && styles.modalButtonDisabled]}
                        onPress={handleAssignCounselor}
                        disabled={modalLoading || !selectedCounselor}
                    >
                        {modalLoading ? (
                            <ActivityIndicator color={colors.white} />
                        ) : (
                            <Text style={styles.modalButtonText}>Assign Counselor</Text>
                        )}
                    </TouchableOpacity>
                </View>
            </View>
        </Modal>
    );

    // Filter Panel (expanded with full options)
    const renderFilters = () => (
        showFilters && (
            <View style={styles.filterPanel}>
                <ScrollView horizontal={false}>
                    <DateRangePicker
                        label="Inquiry Date Range"
                        startDate={tempFilters.startDate}
                        endDate={tempFilters.endDate}
                        onStartDateChange={(d) => setTempFilters({ ...tempFilters, startDate: d })}
                        onEndDateChange={(d) => setTempFilters({ ...tempFilters, endDate: d })}
                    />

                    <DateRangePicker
                        label="Last Follow-Up Range"
                        startDate={tempFilters.followUpDoneFrom}
                        endDate={tempFilters.followUpDoneTo}
                        onStartDateChange={(d) => setTempFilters({ ...tempFilters, followUpDoneFrom: d })}
                        onEndDateChange={(d) => setTempFilters({ ...tempFilters, followUpDoneTo: d })}
                    />

                    <DateRangePicker
                        label="Next Follow-Up Range"
                        startDate={tempFilters.nextFollowUpFrom}
                        endDate={tempFilters.nextFollowUpTo}
                        onStartDateChange={(d) => setTempFilters({ ...tempFilters, nextFollowUpFrom: d })}
                        onEndDateChange={(d) => setTempFilters({ ...tempFilters, nextFollowUpTo: d })}
                    />

                    <View style={{ flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between' }}>
                        <View style={{ width: '48%' }}>
                            <FilterDropdown
                                label="Status"
                                value={tempFilters.status}
                                options={STATUS_OPTIONS}
                                onChange={(v) => setTempFilters({ ...tempFilters, status: v })}
                                placeholder="All"
                            />
                        </View>

                        <View style={{ width: '48%' }}>
                            <FilterDropdown
                                label="Counselor"
                                value={tempFilters.counselor}
                                options={counselors.map(c => ({ value: c.id, label: c.full_name }))}
                                onChange={(v) => setTempFilters({ ...tempFilters, counselor: v })}
                                placeholder="All"
                            />
                        </View>

                        <View style={{ width: '48%' }}>
                            <FilterDropdown
                                label="Country"
                                value={tempFilters.country}
                                options={COUNTRIES}
                                onChange={(v) => setTempFilters({ ...tempFilters, country: v })}
                                placeholder="All"
                            />
                        </View>

                        <View style={{ width: '48%' }}>
                            <FilterDropdown
                                label="Source"
                                value={tempFilters.source}
                                options={LEAD_SOURCE_OPTIONS}
                                onChange={(v) => setTempFilters({ ...tempFilters, source: v })}
                                placeholder="All"
                            />
                        </View>

                        <View style={{ width: '48%' }}>
                            <FilterDropdown
                                label="Branch"
                                value={tempFilters.branch}
                                options={BRANCH_OPTIONS}
                                onChange={(v) => setTempFilters({ ...tempFilters, branch: v })}
                                placeholder="All"
                                enabled={user?.role !== 'staff'}
                            />
                        </View>

                        <View style={{ width: '48%' }}>
                            <FilterDropdown
                                label="Priority"
                                value={tempFilters.priority}
                                options={PRIORITY_OPTIONS}
                                onChange={(v) => setTempFilters({ ...tempFilters, priority: v })}
                                placeholder="All"
                            />
                        </View>

                        <View style={{ width: '48%' }}>
                            <FilterDropdown
                                label="Lead Type"
                                value={tempFilters.leadType}
                                options={LEAD_TYPE_OPTIONS}
                                onChange={(v) => setTempFilters({ ...tempFilters, leadType: v })}
                                placeholder="All"
                            />
                        </View>

                        <View style={{ width: '48%' }}>
                            <FilterDropdown
                                label="Follow-Up Preset"
                                value={tempFilters.followUp}
                                options={FOLLOW_UP_PRESETS}
                                onChange={(v) => setTempFilters({ ...tempFilters, followUp: v })}
                                placeholder="None"
                            />
                        </View>

                        <View style={{ width: '48%' }}>
                            <FilterDropdown
                                label="Sort By"
                                value={tempFilters.sortBy}
                                options={SORT_OPTIONS}
                                onChange={(v) => setTempFilters({ ...tempFilters, sortBy: v })}
                                placeholder="Sort"
                            />
                        </View>
                    </View>

                    <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginTop: 12 }}>
                        <TouchableOpacity
                            style={[styles.modalButton, { backgroundColor: '#e5e7eb' }]}
                            onPress={() => {
                                setTempFilters({
                                    status: '', country: '', counselor: '', source: '', branch: '', priority: '', leadType: '', followUp: '', sortBy: 'newToOld', startDate: '', endDate: '', followUpDoneFrom: '', followUpDoneTo: '', nextFollowUpFrom: '', nextFollowUpTo: ''
                                });
                            }}
                        >
                            <Text style={[styles.modalButtonText, { color: '#111827' }]}>Reset</Text>
                        </TouchableOpacity>

                        <TouchableOpacity
                            style={styles.modalButton}
                            onPress={() => { setFilters({ ...tempFilters }); setShowFilters(false); }}
                        >
                            <Text style={styles.modalButtonText}>Apply Filters</Text>
                        </TouchableOpacity>
                    </View>
                </ScrollView>
            </View>
        )
    );

    if (loading) {
        return (
            <View style={styles.safeArea}>
                <CustomHeader title="Leads Management" showBack={false} />
                <LoadingSpinner />
            </View>
        );
    }

    return (
        <View style={styles.safeArea}>
            <CustomHeader
                title="Leads Management"
                showBack={false}
                rightAction={
                    <View style={styles.headerActions}>
                        <TouchableOpacity
                            style={styles.filterButton}
                            onPress={() => setShowFilters(!showFilters)}
                        >
                            <Ionicons
                                name={showFilters ? "options" : "options-outline"}
                                size={22}
                                color={colors.primary}
                            />
                        </TouchableOpacity>
                        <TouchableOpacity
                            style={styles.addButton}
                            onPress={() => navigation.navigate('AddLead')}
                        >
                            <Ionicons name="add" size={24} color={colors.primary} />
                        </TouchableOpacity>
                    </View>
                }
            />

            {/* Tab Navigation */}
            <View style={styles.tabs}>
                <TouchableOpacity
                    style={styles.tabActive}
                    onPress={() => {/* Stay on leads */ }}
                >
                    <Text style={styles.tabTextActive}>Leads</Text>
                </TouchableOpacity>
                <TouchableOpacity
                    style={styles.tab}
                    onPress={() => navigation.navigate('InquiryList')}
                >
                    <Text style={styles.tabText}>Inquiries</Text>
                </TouchableOpacity>
            </View>

            {/* Filters */}
            {renderFilters()}

            {/* Search Bar */}
            <View style={styles.searchContainer}>
                <View style={styles.searchBar}>
                    <Ionicons name="search" size={20} color={colors.gray400} />
                    <TextInput
                        style={styles.searchInput}
                        placeholder="Search leads..."
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
                {filteredLeads.length} lead{filteredLeads.length !== 1 ? 's' : ''} found
            </Text>

            {/* List */}
            <FlatList
                data={filteredLeads}
                keyExtractor={(item) => item.id?.toString()}
                renderItem={renderLeadItem}
                contentContainerStyle={styles.listContent}
                showsVerticalScrollIndicator={false}
                refreshControl={
                    <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
                }
                ListEmptyComponent={
                    <View style={styles.emptyContainer}>
                        <Ionicons name="people-outline" size={64} color={colors.gray300} />
                        <Text style={styles.emptyText}>No leads found</Text>
                    </View>
                }
            />

            {/* Modals */}
            {renderStatusModal()}
            {renderAssignModal()}
            <LeadDetailModal
                visible={showLeadDetailsModal}
                lead={selectedLeadForDetails}
                onClose={() => { setShowLeadDetailsModal(false); setSelectedLeadForDetails(null); }}
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
        padding: spacing.md,
        backgroundColor: colors.primary,
    },
    headerActions: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    title: {
        fontSize: fontSizes.h3,
        fontWeight: '700',
        color: colors.white,
    },
    filterButton: {
        width: 40,
        height: 40,
        borderRadius: 20,
        backgroundColor: colors.gray100,
        alignItems: 'center',
        justifyContent: 'center',
        marginRight: spacing.sm,
    },
    addButton: {
        width: 40,
        height: 40,
        borderRadius: 20,
        backgroundColor: colors.gray100,
        alignItems: 'center',
        justifyContent: 'center',
    },
    tabs: {
        flexDirection: 'row',
        backgroundColor: colors.white,
        paddingHorizontal: spacing.md,
        borderBottomWidth: 1,
        borderBottomColor: colors.gray100,
    },
    tab: {
        paddingVertical: spacing.sm,
        paddingHorizontal: spacing.md,
        marginRight: spacing.sm,
    },
    tabActive: {
        paddingVertical: spacing.sm,
        paddingHorizontal: spacing.md,
        marginRight: spacing.sm,
        borderBottomWidth: 2,
        borderBottomColor: colors.primary,
    },
    tabText: {
        fontSize: fontSizes.md,
        color: colors.textSecondary,
    },
    tabTextActive: {
        fontSize: fontSizes.md,
        color: colors.primary,
        fontWeight: '600',
    },
    filterPanel: {
        backgroundColor: colors.white,
        padding: spacing.md,
        borderBottomWidth: 1,
        borderBottomColor: colors.gray100,
    },
    filterRow: {
        marginBottom: spacing.sm,
    },
    filterItem: {},
    filterLabel: {
        fontSize: fontSizes.sm,
        color: colors.textSecondary,
        marginBottom: spacing.xs,
    },
    filterChip: {
        paddingHorizontal: spacing.sm,
        paddingVertical: spacing.xs,
        borderRadius: borderRadius.full,
        backgroundColor: colors.gray100,
        marginRight: spacing.xs,
    },
    filterChipActive: {
        backgroundColor: colors.primary,
    },
    filterChipText: {
        fontSize: fontSizes.sm,
        color: colors.text,
    },
    filterChipTextActive: {
        color: colors.white,
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
    leadCard: {
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
        width: 44,
        height: 44,
        borderRadius: 22,
        alignItems: 'center',
        justifyContent: 'center',
    },
    avatarText: {
        fontSize: fontSizes.lg,
        fontWeight: '600',
        color: colors.success,
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
    cardActions: {
        marginTop: spacing.sm,
        paddingTop: spacing.sm,
        borderTopWidth: 1,
        borderTopColor: colors.gray100,
    },
    counselorTag: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    counselorText: {
        fontSize: fontSizes.sm,
        color: colors.primary,
        marginLeft: 4,
    },
    assignButton: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    assignButtonText: {
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
    // Modal styles
    modalOverlay: {
        flex: 1,
        backgroundColor: 'rgba(0,0,0,0.5)',
        justifyContent: 'flex-end',
    },
    modalContent: {
        backgroundColor: colors.white,
        borderTopLeftRadius: borderRadius.xl,
        borderTopRightRadius: borderRadius.xl,
        padding: spacing.lg,
        maxHeight: '80%',
    },
    modalHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: spacing.md,
    },
    modalTitle: {
        fontSize: fontSizes.lg,
        fontWeight: '700',
        color: colors.text,
    },
    modalSubtitle: {
        fontSize: fontSizes.md,
        color: colors.textSecondary,
        marginBottom: spacing.md,
    },
    statusList: {
        maxHeight: 300,
    },
    statusOption: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: spacing.md,
        borderRadius: borderRadius.md,
        marginBottom: spacing.xs,
    },
    statusOptionSelected: {
        backgroundColor: `${colors.primary}10`,
    },
    statusDot: {
        width: 12,
        height: 12,
        borderRadius: 6,
        marginRight: spacing.sm,
    },
    statusOptionText: {
        flex: 1,
        fontSize: fontSizes.md,
        color: colors.text,
    },
    counselorList: {
        maxHeight: 250,
    },
    counselorOption: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: spacing.md,
        borderRadius: borderRadius.md,
        marginBottom: spacing.xs,
    },
    counselorOptionSelected: {
        backgroundColor: `${colors.primary}10`,
    },
    counselorAvatar: {
        width: 36,
        height: 36,
        borderRadius: 18,
        backgroundColor: `${colors.primary}20`,
        alignItems: 'center',
        justifyContent: 'center',
        marginRight: spacing.sm,
    },
    counselorAvatarText: {
        fontSize: fontSizes.sm,
        fontWeight: '600',
        color: colors.primary,
    },
    counselorOptionText: {
        flex: 1,
        fontSize: fontSizes.md,
        color: colors.text,
    },
    notesInput: {
        backgroundColor: colors.gray50,
        borderRadius: borderRadius.md,
        padding: spacing.md,
        fontSize: fontSizes.md,
        color: colors.text,
        minHeight: 80,
        marginTop: spacing.md,
        textAlignVertical: 'top',
    },
    modalButton: {
        backgroundColor: colors.primary,
        borderRadius: borderRadius.md,
        padding: spacing.md,
        alignItems: 'center',
        marginTop: spacing.md,
    },
    modalButtonDisabled: {
        opacity: 0.6,
    },
    modalButtonText: {
        fontSize: fontSizes.md,
        fontWeight: '600',
        color: colors.white,
    },
});

export default LeadScreen;
