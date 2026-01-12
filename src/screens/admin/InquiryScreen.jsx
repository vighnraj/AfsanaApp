// Admin Inquiry Screen

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
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';

import { getInquiries, updateInquiry, assignInquiry, deleteInquiry } from '../../api/leadApi';
import { getCounselors, getStaffById } from '../../api/userApi';
import { useAuth } from '../../context/AuthContext';
import { colors, spacing, borderRadius, fontSizes, shadows } from '../../context/ThemeContext';
import { BOTTOM_TAB_SPACING } from '../../utils/constants';
import DateRangePicker from '../../components/common/DateRangePicker';
import FilterDropdown from '../../components/common/FilterDropdown';
import LeadDetailModal from '../../components/lead/LeadDetailModal';
import { COUNTRIES, INQUIRY_TYPE_OPTIONS, BRANCH_OPTIONS, PRIORITY_OPTIONS, SORT_OPTIONS, LEAD_SOURCE_OPTIONS, FOLLOW_UP_PRESETS, STATUS_OPTIONS } from '../../utils/constants';
import { LoadingSpinner } from '../../components/common/Loading';
import { showToast } from '../../components/common/Toast';
import { formatDateReadable, getInitials } from '../../utils/formatting';
import CustomHeader from '../../components/common/CustomHeader';

const InquiryScreen = ({ navigation }) => {
    const [inquiries, setInquiries] = useState([]);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');
    const { user } = useAuth();
    const [showFilters, setShowFilters] = useState(false);
    const [filters, setFilters] = useState({
        search: '',
        status: '',
        country: '',
        counselor: '',
        source: '',
        branch: '',
        priority: '',
        inquiryType: '',
        sortBy: 'newToOld',
        startDate: '',
        endDate: '',
    });
    const [tempFilters, setTempFilters] = useState(filters);
    const [counselors, setCounselors] = useState([]);
    const [statusModalVisible, setStatusModalVisible] = useState(false);
    const [assignModalVisible, setAssignModalVisible] = useState(false);
    const [selectedInquiry, setSelectedInquiry] = useState(null);
    const [selectedStatus, setSelectedStatus] = useState('');
    const [selectedCounselor, setSelectedCounselor] = useState(null);
    const [notes, setNotes] = useState('');
    const [followUpDate, setFollowUpDate] = useState('');
    const [nextFollowUpDate, setNextFollowUpDate] = useState('');
    const [modalLoading, setModalLoading] = useState(false);
    const [selectedInquiryForDetails, setSelectedInquiryForDetails] = useState(null);
    const [showInquiryDetailsModal, setShowInquiryDetailsModal] = useState(false);
    const [deleteModalVisible, setDeleteModalVisible] = useState(false);
    const [inquiryToDelete, setInquiryToDelete] = useState(null);
    const [selectedInquiries, setSelectedInquiries] = useState([]);
    const [bulkAssignModalVisible, setBulkAssignModalVisible] = useState(false);

    const fetchInquiries = useCallback(async () => {
        try {
            let apiFilters = {};
            if (user?.id && user?.role === 'staff') {
                try {
                    const staffData = await getStaffById(user.id);
                    const staff = Array.isArray(staffData) ? staffData[0] : staffData;
                    if (staff?.branch) apiFilters.branch = staff.branch;
                } catch (err) {
                    console.warn('Error fetching staff branch for inquiries', err);
                }
            }

            const data = await getInquiries(apiFilters);
            setInquiries(Array.isArray(data) ? data : data.inquiries || []);
        } catch (error) {
            console.error('Fetch inquiries error:', error);
            showToast.error('Error', 'Failed to load inquiries');
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    }, [user]);

    useEffect(() => {
        fetchInquiries();
        // fetch counselors for assign modal
        (async () => {
            try {
                const data = await getCounselors();
                setCounselors(Array.isArray(data) ? data : []);
            } catch (e) { console.warn('Counselors fetch error', e); }
        })();
    }, [fetchInquiries]);

    const onRefresh = () => {
        setRefreshing(true);
        fetchInquiries();
    };

    const getStatusColor = (status) => {
        const option = STATUS_OPTIONS.find(s => s.value === status);
        return option?.color || colors.gray400;
    };

    const openStatusModal = (inquiry) => {
        setSelectedInquiry(inquiry);
        setSelectedStatus(inquiry.status || 'New');
        setStatusModalVisible(true);
    };

    const openAssignModal = (inquiry) => {
        setSelectedInquiry(inquiry);
        setAssignModalVisible(true);
    };

    const handleStatusChange = async () => {
        if (!selectedInquiry || !selectedStatus) return;
        setModalLoading(true);
        try {
            await updateInquiry(selectedInquiry.id, { status: selectedStatus });
            showToast.success('Success', 'Status updated');
            setStatusModalVisible(false);
            setSelectedInquiry(null);
            fetchInquiries();
        } catch (e) {
            console.error('Status update', e);
            showToast.error('Error', 'Failed to update status');
        } finally { setModalLoading(false); }
    };

    const handleAssignCounselor = async () => {
        if (!selectedInquiry || !selectedCounselor) return;
        if (!followUpDate) { showToast.error('Validation', 'Follow-up date is required'); return; }
        setModalLoading(true);
        try {
            await assignInquiry({ inquiry_id: selectedInquiry.id, counselor_id: selectedCounselor.id, follow_up_date: followUpDate || null, next_followup_date: nextFollowUpDate || null, notes });
            showToast.success('Success', 'Counselor assigned');
            setAssignModalVisible(false);
            setSelectedInquiry(null);
            setSelectedCounselor(null);
            setNotes(''); setFollowUpDate(''); setNextFollowUpDate('');
            fetchInquiries();
        } catch (e) { console.error('Assign error', e); showToast.error('Error', 'Failed to assign'); }
        finally { setModalLoading(false); }
    };

    const openDeleteModal = (inquiry) => {
        setInquiryToDelete(inquiry);
        setDeleteModalVisible(true);
    };

    const handleDeleteInquiry = async () => {
        if (!inquiryToDelete) return;
        setModalLoading(true);
        try {
            await deleteInquiry(inquiryToDelete.id);
            showToast.success('Success', 'Inquiry deleted successfully');
            setDeleteModalVisible(false);
            setInquiryToDelete(null);
            fetchInquiries();
        } catch (e) {
            console.error('Delete inquiry error:', e);
            showToast.error('Error', 'Failed to delete inquiry');
        } finally {
            setModalLoading(false);
        }
    };

    const toggleInquirySelection = (inquiryId) => {
        setSelectedInquiries(prev => {
            if (prev.includes(inquiryId)) {
                return prev.filter(id => id !== inquiryId);
            }
            return [...prev, inquiryId];
        });
    };

    const toggleSelectAll = () => {
        if (selectedInquiries.length === filteredInquiries.length) {
            setSelectedInquiries([]);
        } else {
            setSelectedInquiries(filteredInquiries.map(inq => inq.id));
        }
    };

    const handleBulkAssign = async () => {
        if (selectedInquiries.length === 0) {
            showToast.error('Validation', 'Please select at least one inquiry');
            return;
        }
        if (!selectedCounselor) {
            showToast.error('Validation', 'Please select a counselor');
            return;
        }
        if (!followUpDate) {
            showToast.error('Validation', 'Follow-up date is required');
            return;
        }

        setModalLoading(true);
        try {
            // Assign each selected inquiry
            for (const inquiryId of selectedInquiries) {
                await assignInquiry({
                    inquiry_id: inquiryId,
                    counselor_id: selectedCounselor.id,
                    follow_up_date: followUpDate,
                    next_followup_date: nextFollowUpDate || null,
                    notes
                });
            }
            showToast.success('Success', `${selectedInquiries.length} inquiries assigned successfully`);
            setBulkAssignModalVisible(false);
            setSelectedInquiries([]);
            setSelectedCounselor(null);
            setNotes('');
            setFollowUpDate('');
            setNextFollowUpDate('');
            fetchInquiries();
        } catch (e) {
            console.error('Bulk assign error:', e);
            showToast.error('Error', 'Failed to assign inquiries');
        } finally {
            setModalLoading(false);
        }
    };

    const renderStatusModal = () => (
        <Modal visible={statusModalVisible} animationType="slide" transparent onRequestClose={() => setStatusModalVisible(false)}>
            <View style={styles.modalOverlay}>
                <View style={styles.modalContent}>
                    <View style={styles.modalHeader}>
                        <Text style={styles.modalTitle}>Change Status</Text>
                        <TouchableOpacity onPress={() => setStatusModalVisible(false)}><Ionicons name="close" size={24} color={colors.text} /></TouchableOpacity>
                    </View>
                    <ScrollView style={styles.statusList}>
                        {STATUS_OPTIONS.map(opt => (
                            <TouchableOpacity key={opt.value} style={[styles.statusOption, selectedStatus === opt.value && styles.statusOptionSelected]} onPress={() => setSelectedStatus(opt.value)}>
                                <View style={[styles.statusDot, { backgroundColor: opt.color }]} />
                                <Text style={styles.statusOptionText}>{opt.label}</Text>
                                {selectedStatus === opt.value && <Ionicons name="checkmark" size={20} color={colors.primary} />}
                            </TouchableOpacity>
                        ))}
                    </ScrollView>
                    <TouchableOpacity style={[styles.modalButton, modalLoading && styles.modalButtonDisabled]} onPress={handleStatusChange} disabled={modalLoading}>
                        {modalLoading ? <ActivityIndicator color={colors.white} /> : <Text style={styles.modalButtonText}>Update Status</Text>}
                    </TouchableOpacity>
                </View>
            </View>
        </Modal>
    );

    const renderAssignModal = () => (
        <Modal visible={assignModalVisible} animationType="slide" transparent onRequestClose={() => setAssignModalVisible(false)}>
            <View style={styles.modalOverlay}>
                <View style={styles.modalContent}>
                    <View style={styles.modalHeader}>
                        <Text style={styles.modalTitle}>Assign Counselor</Text>
                        <TouchableOpacity onPress={() => setAssignModalVisible(false)}><Ionicons name="close" size={24} color={colors.text} /></TouchableOpacity>
                    </View>

                    <ScrollView style={styles.counselorList}>
                        {counselors.map(c => (
                            <TouchableOpacity key={c.id} style={[styles.counselorOption, selectedCounselor?.id === c.id && styles.counselorOptionSelected]} onPress={() => setSelectedCounselor(c)}>
                                <View style={styles.counselorAvatar}><Text style={styles.counselorAvatarText}>{getInitials(c.full_name)}</Text></View>
                                <Text style={styles.counselorOptionText}>{c.full_name}</Text>
                                {selectedCounselor?.id === c.id && <Ionicons name="checkmark" size={20} color={colors.primary} />}
                            </TouchableOpacity>
                        ))}
                    </ScrollView>

                    <DateRangePicker label="Follow-Up Date" value={followUpDate} onChange={(d) => setFollowUpDate(d)} mode="date" />
                    <DateRangePicker label="Next Follow-Up Date" value={nextFollowUpDate} onChange={(d) => setNextFollowUpDate(d)} mode="date" />

                    <TextInput style={styles.notesInput} placeholder="Notes (optional)" placeholderTextColor={colors.gray400} value={notes} onChangeText={setNotes} multiline />

                    <TouchableOpacity style={[styles.modalButton, modalLoading && styles.modalButtonDisabled]} onPress={handleAssignCounselor} disabled={modalLoading || !selectedCounselor}>
                        {modalLoading ? <ActivityIndicator color={colors.white} /> : <Text style={styles.modalButtonText}>Assign</Text>}
                    </TouchableOpacity>
                </View>
            </View>
        </Modal>
    );

    const renderBulkAssignModal = () => (
        <Modal visible={bulkAssignModalVisible} animationType="slide" transparent onRequestClose={() => setBulkAssignModalVisible(false)}>
            <View style={styles.modalOverlay}>
                <View style={styles.modalContent}>
                    <View style={styles.modalHeader}>
                        <Text style={styles.modalTitle}>Bulk Assign ({selectedInquiries.length} selected)</Text>
                        <TouchableOpacity onPress={() => setBulkAssignModalVisible(false)}><Ionicons name="close" size={24} color={colors.text} /></TouchableOpacity>
                    </View>

                    <ScrollView style={styles.counselorList}>
                        {counselors.map(c => (
                            <TouchableOpacity key={c.id} style={[styles.counselorOption, selectedCounselor?.id === c.id && styles.counselorOptionSelected]} onPress={() => setSelectedCounselor(c)}>
                                <View style={styles.counselorAvatar}><Text style={styles.counselorAvatarText}>{getInitials(c.full_name)}</Text></View>
                                <Text style={styles.counselorOptionText}>{c.full_name}</Text>
                                {selectedCounselor?.id === c.id && <Ionicons name="checkmark" size={20} color={colors.primary} />}
                            </TouchableOpacity>
                        ))}
                    </ScrollView>

                    <DateRangePicker label="Follow-Up Date" value={followUpDate} onChange={(d) => setFollowUpDate(d)} mode="date" />
                    <DateRangePicker label="Next Follow-Up Date" value={nextFollowUpDate} onChange={(d) => setNextFollowUpDate(d)} mode="date" />

                    <TextInput style={styles.notesInput} placeholder="Notes (optional)" placeholderTextColor={colors.gray400} value={notes} onChangeText={setNotes} multiline />

                    <TouchableOpacity style={[styles.modalButton, modalLoading && styles.modalButtonDisabled]} onPress={handleBulkAssign} disabled={modalLoading || !selectedCounselor}>
                        {modalLoading ? <ActivityIndicator color={colors.white} /> : <Text style={styles.modalButtonText}>Assign to {selectedInquiries.length} Inquiries</Text>}
                    </TouchableOpacity>
                </View>
            </View>
        </Modal>
    );

    const renderDeleteModal = () => (
        <Modal visible={deleteModalVisible} animationType="fade" transparent onRequestClose={() => setDeleteModalVisible(false)}>
            <View style={styles.modalOverlay}>
                <View style={[styles.modalContent, { maxHeight: '40%' }]}>
                    <View style={styles.modalHeader}>
                        <Text style={styles.modalTitle}>Delete Inquiry</Text>
                        <TouchableOpacity onPress={() => setDeleteModalVisible(false)}>
                            <Ionicons name="close" size={24} color={colors.text} />
                        </TouchableOpacity>
                    </View>

                    <View style={{ paddingVertical: spacing.lg }}>
                        <Ionicons name="warning" size={48} color={colors.error} style={{ alignSelf: 'center', marginBottom: spacing.md }} />
                        <Text style={styles.deleteWarningText}>
                            Are you sure you want to delete this inquiry?
                        </Text>
                        <Text style={styles.deleteSubText}>
                            {inquiryToDelete?.name}
                        </Text>
                        <Text style={[styles.deleteSubText, { fontSize: fontSizes.sm, marginTop: spacing.xs }]}>
                            This action cannot be undone.
                        </Text>
                    </View>

                    <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
                        <TouchableOpacity
                            style={[styles.modalButton, { backgroundColor: colors.gray300, flex: 0.48 }]}
                            onPress={() => setDeleteModalVisible(false)}
                        >
                            <Text style={[styles.modalButtonText, { color: colors.text }]}>Cancel</Text>
                        </TouchableOpacity>

                        <TouchableOpacity
                            style={[styles.modalButton, { backgroundColor: colors.error, flex: 0.48 }, modalLoading && styles.modalButtonDisabled]}
                            onPress={handleDeleteInquiry}
                            disabled={modalLoading}
                        >
                            {modalLoading ? <ActivityIndicator color={colors.white} /> : <Text style={styles.modalButtonText}>Delete</Text>}
                        </TouchableOpacity>
                    </View>
                </View>
            </View>
        </Modal>
    );

    const filteredInquiries = useMemo(() => {
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

        let list = inquiries.filter(inquiry => {
            if (searchQuery) {
                const q = searchQuery.toLowerCase();
                if (!(inquiry.name?.toLowerCase().includes(q) || inquiry.email?.toLowerCase().includes(q) || inquiry.phone?.toLowerCase().includes(q))) return false;
            }
            if (filters.status && inquiry.status !== filters.status) return false;
            if (filters.country && inquiry.country !== filters.country) return false;
            if (filters.counselor && String(inquiry.counselor_id) !== String(filters.counselor)) return false;
            if (filters.source && inquiry.source !== filters.source) return false;
            if (filters.branch && inquiry.branch !== filters.branch) return false;
            if (filters.priority && inquiry.priority !== filters.priority) return false;
            if (filters.inquiryType && (inquiry.inquiry_type || inquiry.lead_type) !== filters.inquiryType) return false;

            if (filters.startDate || filters.endDate) {
                if (!applyDateInRange(inquiry.created_at, filters.startDate, filters.endDate)) return false;
            }

            return true;
        });

        if (filters.sortBy === 'newToOld') list.sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
        if (filters.sortBy === 'oldToNew') list.sort((a, b) => new Date(a.created_at) - new Date(b.created_at));
        if (filters.sortBy === 'aToZ') list.sort((a, b) => (a.name || '').localeCompare(b.name || ''));
        if (filters.sortBy === 'zToA') list.sort((a, b) => (b.name || '').localeCompare(a.name || ''));

        return list;
    }, [inquiries, searchQuery, filters]);

    const renderInquiryItem = ({ item }) => {
        const isSelected = selectedInquiries.includes(item.id);

        return (
            <View style={[styles.inquiryCard, shadows.sm]}>
                <View style={styles.cardHeader}>
                    <TouchableOpacity
                        onPress={() => toggleInquirySelection(item.id)}
                        style={styles.checkbox}
                    >
                        <Ionicons
                            name={isSelected ? 'checkbox' : 'square-outline'}
                            size={24}
                            color={isSelected ? colors.primary : colors.gray400}
                        />
                    </TouchableOpacity>

                    <View style={[styles.avatar, { backgroundColor: `${colors.primary}20` }]}>
                        <Text style={styles.avatarText}>{getInitials(item.name)}</Text>
                    </View>
                    <View style={styles.headerInfo}>
                        <Text style={styles.name} numberOfLines={1}>{item.name}</Text>
                        <Text style={styles.email} numberOfLines={1}>{item.email}</Text>
                    </View>
                    <TouchableOpacity style={[styles.statusBadge, { backgroundColor: getStatusColor(item.status) + '20' }]} onPress={() => openStatusModal(item)}>
                        <Text style={[styles.statusText, { color: getStatusColor(item.status) }]}>{item.status || 'New'}</Text>
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
                        <Ionicons name="calendar-outline" size={14} color={colors.textSecondary} />
                        <Text style={styles.detailText}>{formatDateReadable(item.created_at)}</Text>
                    </View>
                </View>

                <View style={{ flexDirection: 'row', justifyContent: 'flex-end', marginTop: spacing.sm }}>
                    <TouchableOpacity onPress={() => openAssignModal(item)} style={{ padding: 6, marginRight: 6 }}>
                        <Ionicons name="person-add-outline" size={18} color={colors.primary} />
                    </TouchableOpacity>

                    <TouchableOpacity onPress={() => { setSelectedInquiryForDetails(item); setShowInquiryDetailsModal(true); }} style={{ padding: 6, marginRight: 6 }}>
                        <Ionicons name="information-circle-outline" size={18} color={colors.primary} />
                    </TouchableOpacity>

                    <TouchableOpacity onPress={() => navigation.navigate('EditInquiry', { inquiry: item })} style={{ padding: 6, marginRight: 6 }}>
                        <Ionicons name="create-outline" size={18} color={colors.primary} />
                    </TouchableOpacity>

                    <TouchableOpacity onPress={() => openDeleteModal(item)} style={{ padding: 6 }}>
                        <Ionicons name="trash-outline" size={18} color={colors.error} />
                    </TouchableOpacity>
                </View>
            </View>
        );
    };

    if (loading) {
        return (
            <View style={styles.safeArea}>
                <CustomHeader title="Inquiries" showBack={false} />
                <LoadingSpinner />
            </View>
        );
    }

    return (
        <View style={styles.safeArea}>
            <CustomHeader
                title="Inquiries"
                showBack={false}
                rightAction={
                    <View style={{ flexDirection: 'row' }}>
                        <TouchableOpacity style={{ marginRight: spacing.md }} onPress={() => setShowFilters(!showFilters)}>
                            <Ionicons name={showFilters ? 'options' : 'options-outline'} size={24} color={colors.primary} />
                        </TouchableOpacity>
                        <TouchableOpacity onPress={() => navigation.navigate('AddLead')}>
                            <Ionicons name="add" size={28} color={colors.primary} />
                        </TouchableOpacity>
                    </View>
                }
            />

            {/* Bulk Actions Bar */}
            {selectedInquiries.length > 0 && (
                <View style={styles.bulkActionsBar}>
                    <TouchableOpacity onPress={toggleSelectAll} style={styles.selectAllButton}>
                        <Ionicons
                            name={selectedInquiries.length === filteredInquiries.length ? 'checkbox' : 'square-outline'}
                            size={24}
                            color={colors.primary}
                        />
                        <Text style={styles.bulkActionText}>
                            {selectedInquiries.length === filteredInquiries.length ? 'Deselect All' : 'Select All'}
                        </Text>
                    </TouchableOpacity>

                    <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                        <Text style={styles.selectedCount}>{selectedInquiries.length} selected</Text>
                        <TouchableOpacity
                            style={styles.bulkAssignButton}
                            onPress={() => setBulkAssignModalVisible(true)}
                        >
                            <Ionicons name="person-add" size={20} color={colors.white} />
                            <Text style={styles.bulkAssignButtonText}>Bulk Assign</Text>
                        </TouchableOpacity>
                    </View>
                </View>
            )}

            {showFilters && (
                <View style={styles.filterPanel}>
                    <DateRangePicker
                        label="Inquiry Date Range"
                        startDate={tempFilters.startDate}
                        endDate={tempFilters.endDate}
                        onStartDateChange={(d) => setTempFilters({ ...tempFilters, startDate: d })}
                        onEndDateChange={(d) => setTempFilters({ ...tempFilters, endDate: d })}
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
                                label="Source"
                                value={tempFilters.source}
                                options={LEAD_SOURCE_OPTIONS}
                                onChange={(v) => setTempFilters({ ...tempFilters, source: v })}
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
                                label="Country"
                                value={tempFilters.country}
                                options={COUNTRIES}
                                onChange={(v) => setTempFilters({ ...tempFilters, country: v })}
                                placeholder="All"
                            />
                        </View>

                        <View style={{ width: '48%' }}>
                            <FilterDropdown
                                label="Inquiry Type"
                                value={tempFilters.inquiryType}
                                options={INQUIRY_TYPE_OPTIONS}
                                onChange={(v) => setTempFilters({ ...tempFilters, inquiryType: v })}
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
                            onPress={() => { setTempFilters({ search: '', status: '', country: '', counselor: '', source: '', branch: '', priority: '', inquiryType: '', sortBy: 'newToOld', startDate: '', endDate: '' }); }}
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
                </View>
            )}

            {/* Search Bar */}
            <View style={styles.searchContainer}>
                <View style={styles.searchBar}>
                    <Ionicons name="search" size={20} color={colors.gray400} />
                    <TextInput
                        style={styles.searchInput}
                        placeholder="Search inquiries..."
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
                {filteredInquiries.length} inquir{filteredInquiries.length !== 1 ? 'ies' : 'y'} found
            </Text>

            {/* List */}
            <FlatList
                data={filteredInquiries}
                keyExtractor={(item) => item.id?.toString()}
                renderItem={renderInquiryItem}
                contentContainerStyle={styles.listContent}
                showsVerticalScrollIndicator={false}
                refreshControl={
                    <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
                }
                ListEmptyComponent={
                    <View style={styles.emptyContainer}>
                        <Ionicons name="mail-outline" size={64} color={colors.gray300} />
                        <Text style={styles.emptyText}>No inquiries found</Text>
                    </View>
                }
            />
            {renderStatusModal()}
            {renderAssignModal()}
            {renderBulkAssignModal()}
            {renderDeleteModal()}
            <LeadDetailModal
                visible={showInquiryDetailsModal}
                lead={selectedInquiryForDetails}
                onClose={() => { setShowInquiryDetailsModal(false); setSelectedInquiryForDetails(null); }}
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
    title: {
        fontSize: fontSizes.h3,
        fontWeight: '700',
        color: colors.white,
    },
    addButton: {
        width: 40,
        height: 40,
        borderRadius: 20,
        backgroundColor: 'rgba(255,255,255,0.2)',
        alignItems: 'center',
        justifyContent: 'center',
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
        paddingBottom: BOTTOM_TAB_SPACING,
    },
    inquiryCard: {
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
        marginTop: spacing.xs,
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
    // Modal styles (copied from LeadScreen for parity)
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
    checkbox: {
        marginRight: spacing.sm,
    },
    bulkActionsBar: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        backgroundColor: `${colors.primary}10`,
        padding: spacing.md,
        borderBottomWidth: 1,
        borderBottomColor: colors.gray200,
    },
    selectAllButton: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    bulkActionText: {
        fontSize: fontSizes.sm,
        color: colors.primary,
        fontWeight: '600',
        marginLeft: spacing.xs,
    },
    selectedCount: {
        fontSize: fontSizes.sm,
        color: colors.textSecondary,
        marginRight: spacing.sm,
    },
    bulkAssignButton: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: colors.primary,
        paddingHorizontal: spacing.md,
        paddingVertical: spacing.xs,
        borderRadius: borderRadius.md,
    },
    bulkAssignButtonText: {
        fontSize: fontSizes.sm,
        color: colors.white,
        fontWeight: '600',
        marginLeft: spacing.xs,
    },
    deleteWarningText: {
        fontSize: fontSizes.md,
        color: colors.text,
        textAlign: 'center',
        fontWeight: '600',
        marginBottom: spacing.sm,
    },
    deleteSubText: {
        fontSize: fontSizes.md,
        color: colors.textSecondary,
        textAlign: 'center',
    },
    filterPanel: {
        backgroundColor: colors.white,
        padding: spacing.md,
        borderBottomWidth: 1,
        borderBottomColor: colors.gray200,
    },
});

export default InquiryScreen;
