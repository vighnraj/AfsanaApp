import React, { useState, useEffect, useCallback } from 'react';
import {
    View,
    Text,
    StyleSheet,
    ScrollView,
    TouchableOpacity,
    RefreshControl,
    Linking,
    Platform,
    Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { getLeadById, updateLead, getFollowUpHistory, getNoteHistory, createNote, createFollowUpHistory, deleteNote, deleteFollowUpHistory, deleteLead, updatePriority } from '../../api/leadApi';
import { colors, spacing, borderRadius, fontSizes, shadows } from '../../context/ThemeContext';
import { CustomHeader } from '../../components/common';
import { LoadingSpinner } from '../../components/common/Loading';
import { showToast } from '../../components/common/Toast';
import { formatDateReadable, getInitials } from '../../utils/formatting';
import { STATUS_OPTIONS, FOLLOW_UP_TYPES, FOLLOW_UP_STATUSES, NOTE_TYPES } from '../../utils/constants';
import DateRangePicker from '../../components/common/DateRangePicker';
import FilterDropdown from '../../components/common/FilterDropdown';
import { useAuth } from '../../context/AuthContext';
import { TextInput, Modal, ActivityIndicator } from 'react-native';
import { BOTTOM_TAB_SPACING } from '../../utils/constants';

const LeadDetailScreen = ({ navigation, route }) => {
    const { leadId } = route.params;
    const { user } = useAuth();
    const insets = useSafeAreaInsets();

    const [lead, setLead] = useState(null);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const [activeTab, setActiveTab] = useState('info'); // 'info' or 'history'
    const [followUpHistory, setFollowUpHistory] = useState([]);
    const [noteHistory, setNoteHistory] = useState([]);

    // Modal states
    const [noteModalVisible, setNoteModalVisible] = useState(false);
    const [followUpModalVisible, setFollowUpModalVisible] = useState(false);
    const [modalLoading, setModalLoading] = useState(false);

    // New note state
    const [noteText, setNoteText] = useState('');
    const [noteType, setNoteType] = useState('Follow-up');

    // New follow-up state
    const [fuDate, setFuDate] = useState(new Date().toISOString().split('T')[0]);
    const [fuType, setFuType] = useState('Call');
    const [fuNotes, setFuNotes] = useState('');
    const [fuNextDate, setFuNextDate] = useState('');
    const [fuLastDate, setFuLastDate] = useState('');
    const [fuStatus, setFuStatus] = useState('Interested');

    const fetchLeadDetails = useCallback(async () => {
        try {
            const data = await getLeadById(leadId);
            const leadData = data.data || data;
            setLead(leadData);

            // Fetch history in parallel
            const [fuHistory, nHistory] = await Promise.all([
                getFollowUpHistory(leadId),
                getNoteHistory(leadId)
            ]);

            setFollowUpHistory(Array.isArray(fuHistory.data) ? fuHistory.data : (Array.isArray(fuHistory) ? fuHistory : []));
            setNoteHistory(Array.isArray(nHistory.data) ? nHistory.data : (Array.isArray(nHistory) ? nHistory : []));

        } catch (error) {
            console.error('Fetch lead details error:', error);
            showToast.error('Error', 'Failed to load lead details');
            navigation.goBack();
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    }, [leadId, navigation]);

    useEffect(() => {
        fetchLeadDetails();
    }, [fetchLeadDetails]);

    const onRefresh = () => {
        setRefreshing(true);
        fetchLeadDetails();
    };

    const handleCall = () => {
        if (lead?.phone || lead?.phone_number) {
            Linking.openURL(`tel:${lead.phone || lead.phone_number}`);
        } else {
            showToast.info('Info', 'No phone number available');
        }
    };

    const handleEmail = () => {
        if (lead?.email) {
            Linking.openURL(`mailto:${lead.email}`);
        } else {
            showToast.info('Info', 'No email address available');
        }
    };

    const handleWhatsApp = () => {
        const phone = lead?.phone || lead?.phone_number;
        if (phone) {
            const formattedPhone = phone.replace(/\D/g, '');
            Linking.openURL(`whatsapp://send?phone=${formattedPhone}`);
        } else {
            showToast.info('Info', 'No phone number available');
        }
    };

    const handleAddNote = async () => {
        if (!noteText) return;
        setModalLoading(true);
        try {
            await createNote({
                inquiry_id: leadId,
                counselor_id: lead.counselor_id,
                staff_id: user.id,
                note: noteText,
                noteType: noteType
            });
            showToast.success('Success', 'Note added');
            setNoteModalVisible(false);
            setNoteText('');
            fetchLeadDetails();
        } catch (err) {
            showToast.error('Error', 'Failed to add note');
        } finally {
            setModalLoading(false);
        }
    };

    const handleAddFollowUp = async () => {
        if (!fuNotes || !fuDate) return;
        setModalLoading(true);
        try {
            await createFollowUpHistory({
                inquiry_id: leadId,
                counselor_id: lead.counselor_id,
                date: fuDate,
                type: fuType,
                notes: fuNotes,
                next_followup_date: fuNextDate || null,
                last_followup_date: fuLastDate || null,
                status: fuStatus,
            });
            showToast.success('Success', 'Follow-up added');
            setFollowUpModalVisible(false);
            setFuNotes('');
            fetchLeadDetails();
        } catch (err) {
            showToast.error('Error', 'Failed to add follow-up');
        } finally {
            setModalLoading(false);
        }
    };

    const handleDeleteNote = async (noteId) => {
        Alert.alert(
            'Delete Note',
            'Are you sure you want to delete this note?',
            [
                { text: 'Cancel', style: 'cancel' },
                {
                    text: 'Delete',
                    style: 'destructive',
                    onPress: async () => {
                        try {
                            await deleteNote(noteId);
                            showToast.success('Success', 'Note deleted');
                            fetchLeadDetails();
                        } catch (error) {
                            showToast.error('Error', 'Failed to delete note');
                        }
                    }
                }
            ]
        );
    };

    const handleDeleteFollowUp = async (followUpId) => {
        Alert.alert(
            'Delete Follow-up',
            'Are you sure you want to delete this follow-up?',
            [
                { text: 'Cancel', style: 'cancel' },
                {
                    text: 'Delete',
                    style: 'destructive',
                    onPress: async () => {
                        try {
                            await deleteFollowUpHistory(followUpId);
                            showToast.success('Success', 'Follow-up deleted');
                            fetchLeadDetails();
                        } catch (error) {
                            showToast.error('Error', 'Failed to delete follow-up');
                        }
                    }
                }
            ]
        );
    };

    const handleDeleteLead = async () => {
        Alert.alert(
            'Delete Lead',
            'Are you sure you want to delete this lead? This action cannot be undone.',
            [
                { text: 'Cancel', style: 'cancel' },
                {
                    text: 'Delete',
                    style: 'destructive',
                    onPress: async () => {
                        try {
                            await deleteLead(leadId);
                            showToast.success('Success', 'Lead deleted');
                            navigation.goBack();
                        } catch (error) {
                            showToast.error('Error', 'Failed to delete lead');
                        }
                    }
                }
            ]
        );
    };

    const handleUpdatePriority = async (newPriority) => {
        try {
            await updatePriority(leadId, newPriority);
            showToast.success('Success', 'Priority updated');
            fetchLeadDetails();
        } catch (error) {
            showToast.error('Error', 'Failed to update priority');
        }
    };

    // Status color helper
    const getStatusColor = (status) => {
        const statusOption = STATUS_OPTIONS.find(s => s.value === status);
        return statusOption?.color || colors.primary;
    };

    if (loading) {
        return (
            <View style={styles.container}>
                <CustomHeader title="Lead Details" showBack={true} />
                <LoadingSpinner />
            </View>
        );
    }

    if (!lead) return null;

    return (
        <View style={styles.container}>
            <CustomHeader
                title="Lead Details"
                showBack={true}
                rightAction={
                    <View style={{ flexDirection: 'row', gap: 16 }}>
                        <TouchableOpacity onPress={() => navigation.navigate('AddLead', { lead: lead })}>
                            <Ionicons name="create-outline" size={24} color={colors.primary} />
                        </TouchableOpacity>
                        <TouchableOpacity onPress={handleDeleteLead}>
                            <Ionicons name="trash-outline" size={24} color={colors.error} />
                        </TouchableOpacity>
                    </View>
                }
            />

            <ScrollView
                refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
                contentContainerStyle={[styles.content, { paddingBottom: BOTTOM_TAB_SPACING }]}
            >
                {/* Profile Header Card */}
                <View style={[styles.card, shadows.md, styles.profileCard]}>
                    <View style={styles.avatarContainer}>
                        <View style={[styles.avatar, { backgroundColor: colors.primaryLight + '30' }]}>
                            <Text style={styles.avatarText}>{getInitials(lead.full_name || lead.name || 'NA')}</Text>
                        </View>
                    </View>
                    <Text style={styles.name}>{lead.full_name || lead.name || 'Unknown'}</Text>
                    <Text style={styles.sourceText}>via {lead.source || 'Direct'}</Text>

                    <View style={[styles.statusBadge, { backgroundColor: getStatusColor(lead.status || lead.lead_status) + '20' }]}>
                        <Text style={[styles.statusText, { color: getStatusColor(lead.status || lead.lead_status) }]}>
                            {lead.status || lead.lead_status || 'New'}
                        </Text>
                    </View>

                    {/* Priority Dropdown */}
                    <View style={{ marginTop: spacing.sm, width: '100%' }}>
                        <FilterDropdown
                            label="Priority"
                            value={lead.priority || 'Medium'}
                            options={['Low', 'Medium', 'High', 'Urgent']}
                            onChange={handleUpdatePriority}
                        />
                    </View>

                    {/* Action Buttons */}
                    <View style={styles.actionRow}>
                        <TouchableOpacity style={[styles.actionButton, styles.callButton]} onPress={handleCall}>
                            <Ionicons name="call" size={20} color={colors.white} />
                            <Text style={styles.actionButtonText}>Call</Text>
                        </TouchableOpacity>
                        <TouchableOpacity style={[styles.actionButton, styles.emailButton]} onPress={handleEmail}>
                            <Ionicons name="mail" size={20} color={colors.primary} />
                            <Text style={[styles.actionButtonText, { color: colors.primary }]}>Email</Text>
                        </TouchableOpacity>
                        <TouchableOpacity style={[styles.actionButton, styles.whatsappButton]} onPress={handleWhatsApp}>
                            <Ionicons name="logo-whatsapp" size={20} color={colors.white} />
                            <Text style={styles.actionButtonText}>Chat</Text>
                        </TouchableOpacity>
                    </View>
                </View>

                {/* Tabs */}
                <View style={styles.tabContainer}>
                    <TouchableOpacity
                        style={[styles.tab, activeTab === 'info' && styles.activeTab]}
                        onPress={() => setActiveTab('info')}
                    >
                        <Text style={[styles.tabText, activeTab === 'info' && styles.activeTabText]}>Info</Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                        style={[styles.tab, activeTab === 'history' && styles.activeTab]}
                        onPress={() => setActiveTab('history')}
                    >
                        <Text style={[styles.tabText, activeTab === 'history' && styles.activeTabText]}>Timeline</Text>
                    </TouchableOpacity>
                </View>

                {activeTab === 'info' ? (
                    <View style={styles.infoSection}>
                        <View style={[styles.card, shadows.sm]}>
                            <Text style={styles.sectionHeader}>Contact Information</Text>
                            <InfoRow icon="call-outline" label="Phone" value={lead.phone || lead.phone_number} />
                            <InfoRow icon="mail-outline" label="Email" value={lead.email} />
                            <InfoRow icon="location-outline" label="Location" value={`${lead.city || ''}, ${lead.country || ''}`} />
                        </View>

                        <View style={[styles.card, shadows.sm]}>
                            <Text style={styles.sectionHeader}>Lead Details</Text>
                            <InfoRow icon="business-outline" label="Branch" value={lead.branch} />
                            <InfoRow icon="person-outline" label="Counselor" value={lead.counselor_name || lead.assignee || 'Unassigned'} />
                            <InfoRow icon="school-outline" label="Interest" value={lead.inquiry_type || lead.course_interest} />
                            <InfoRow icon="calendar-outline" label="Created" value={formatDateReadable(lead.created_at)} />
                        </View>
                    </View>
                ) : (
                    <View style={styles.infoSection}>
                        <View style={styles.timelineHeader}>
                            <Text style={styles.sectionHeader}>History Timeline</Text>
                            <View style={{ flexDirection: 'row', gap: 8 }}>
                                <TouchableOpacity
                                    style={styles.addButtonSmall}
                                    onPress={() => setNoteModalVisible(true)}
                                >
                                    <Ionicons name="document-text-outline" size={16} color={colors.white} />
                                    <Text style={styles.addButtonTextSmall}>Note</Text>
                                </TouchableOpacity>
                                <TouchableOpacity
                                    style={[styles.addButtonSmall, { backgroundColor: colors.success }]}
                                    onPress={() => setFollowUpModalVisible(true)}
                                >
                                    <Ionicons name="calendar-outline" size={16} color={colors.white} />
                                    <Text style={styles.addButtonTextSmall}>Follow-up</Text>
                                </TouchableOpacity>
                            </View>
                        </View>

                        {/* Combined and sorted timeline entries */}
                        {[
                            ...noteHistory.map(n => ({ ...n, entryType: 'note', sortDate: new Date(n.created_at) })),
                            ...followUpHistory.map(f => ({ ...f, entryType: 'followup', sortDate: new Date(f.date || f.created_at) }))
                        ].sort((a, b) => b.sortDate - a.sortDate).map((entry, idx) => (
                            <View key={`${entry.entryType}-${idx}`} style={styles.timelineEntry}>
                                <View style={styles.timelineLeft}>
                                    <View style={[styles.timelineIcon, {
                                        backgroundColor: entry.entryType === 'note' ? colors.infoLight + '30' : colors.successLight + '30'
                                    }]}>
                                        <Ionicons
                                            name={entry.entryType === 'note' ? "document-text" : "calendar"}
                                            size={18}
                                            color={entry.entryType === 'note' ? colors.info : colors.success}
                                        />
                                    </View>
                                    {idx < (noteHistory.length + followUpHistory.length - 1) && <View style={styles.timelineLine} />}
                                </View>
                                <View style={[styles.timelineContent, shadows.sm]}>
                                    <View style={styles.timelineInfoHeader}>
                                        <View style={{ flex: 1 }}>
                                            <Text style={styles.timelineType}>
                                                {entry.entryType === 'note' ? (entry.noteType || 'General Note') : `Follow-up: ${entry.type}`}
                                            </Text>
                                            <Text style={styles.timelineDate}>{formatDateReadable(entry.sortDate)}</Text>
                                        </View>
                                        <TouchableOpacity
                                            onPress={() => entry.entryType === 'note' ? handleDeleteNote(entry.id) : handleDeleteFollowUp(entry.id)}
                                            style={styles.deleteButton}
                                        >
                                            <Ionicons name="trash-outline" size={18} color={colors.error} />
                                        </TouchableOpacity>
                                    </View>
                                    <Text style={styles.timelineBody}>{entry.entryType === 'note' ? entry.note : entry.notes}</Text>
                                    {entry.entryType === 'followup' && entry.status && (
                                        <View style={[styles.miniBadge, { backgroundColor: getStatusColor(entry.status) + '20' }]}>
                                            <Text style={[styles.miniBadgeText, { color: getStatusColor(entry.status) }]}>{entry.status}</Text>
                                        </View>
                                    )}
                                    <Text style={styles.timelineAuthor}>By {entry.counselor_name || entry.staff_name || 'System'}</Text>
                                </View>
                            </View>
                        ))}

                        {noteHistory.length === 0 && followUpHistory.length === 0 && (
                            <View style={[styles.card, shadows.sm, { padding: spacing.xl, alignItems: 'center' }]}>
                                <Ionicons name="time-outline" size={48} color={colors.gray300} />
                                <Text style={{ color: colors.gray400, marginTop: 10 }}>No history entries found</Text>
                            </View>
                        )}
                    </View>
                )}

            </ScrollView>

            {/* Note Modal */}
            <Modal visible={noteModalVisible} transparent animationType="slide">
                <View style={styles.modalOverlay}>
                    <View style={styles.modalContent}>
                        <View style={styles.modalHeader}>
                            <Text style={styles.modalTitle}>Add Note</Text>
                            <TouchableOpacity onPress={() => setNoteModalVisible(false)}><Ionicons name="close" size={24} color={colors.text} /></TouchableOpacity>
                        </View>
                        <FilterDropdown label="Note Type" value={noteType} options={NOTE_TYPES} onChange={setNoteType} />
                        <TextInput style={styles.textArea} placeholder="Enter your note here..." multiline value={noteText} onChangeText={setNoteText} />
                        <TouchableOpacity style={[styles.saveButton, modalLoading && { opacity: 0.7 }]} onPress={handleAddNote} disabled={modalLoading}>
                            {modalLoading ? <ActivityIndicator color={colors.white} /> : <Text style={styles.saveButtonText}>Save Note</Text>}
                        </TouchableOpacity>
                    </View>
                </View>
            </Modal>

            {/* Follow-up Modal */}
            <Modal visible={followUpModalVisible} transparent animationType="slide">
                <View style={styles.modalOverlay}>
                    <ScrollView contentContainerStyle={{ flexGrow: 1, justifyContent: 'flex-end' }}>
                        <View style={styles.modalContent}>
                            <View style={styles.modalHeader}>
                                <Text style={styles.modalTitle}>Add Follow-up</Text>
                                <TouchableOpacity onPress={() => setFollowUpModalVisible(false)}><Ionicons name="close" size={24} color={colors.text} /></TouchableOpacity>
                            </View>

                            <DateRangePicker label="Actual Date" startDate={fuDate} endDate={null} onStartDateChange={setFuDate} onEndDateChange={() => { }} />
                            <View style={{ flexDirection: 'row', gap: 8 }}>
                                <View style={{ flex: 1 }}><FilterDropdown label="Type" value={fuType} options={FOLLOW_UP_TYPES} onChange={setFuType} /></View>
                                <View style={{ flex: 1 }}><FilterDropdown label="Status" value={fuStatus} options={FOLLOW_UP_STATUSES} onChange={setFuStatus} /></View>
                            </View>
                            <DateRangePicker label="Next Follow-up" startDate={fuNextDate} endDate={null} onStartDateChange={setFuNextDate} onEndDateChange={() => { }} />
                            <DateRangePicker label="Last Follow-up" startDate={fuLastDate} endDate={null} onStartDateChange={setFuLastDate} onEndDateChange={() => { }} />
                            <TextInput style={styles.textArea} placeholder="Enter notes..." multiline value={fuNotes} onChangeText={setFuNotes} />

                            <TouchableOpacity style={[styles.saveButton, modalLoading && { opacity: 0.7 }]} onPress={handleAddFollowUp} disabled={modalLoading}>
                                {modalLoading ? <ActivityIndicator color={colors.white} /> : <Text style={styles.saveButtonText}>Save Follow-up</Text>}
                            </TouchableOpacity>
                        </View>
                    </ScrollView>
                </View>
            </Modal>
        </View>
    );
};

const InfoRow = ({ icon, label, value }) => (
    <View style={styles.infoRow}>
        <View style={styles.iconBox}>
            <Ionicons name={icon} size={18} color={colors.textSecondary} />
        </View>
        <View style={styles.infoContent}>
            <Text style={styles.infoLabel}>{label}</Text>
            <Text style={styles.infoValue}>{value || 'N/A'}</Text>
        </View>
    </View>
);

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: colors.background,
    },
    content: {
        padding: spacing.md,
    },
    card: {
        backgroundColor: colors.white,
        borderRadius: borderRadius.lg,
        padding: spacing.md,
        marginBottom: spacing.md,
    },
    profileCard: {
        alignItems: 'center',
    },
    avatarContainer: {
        marginBottom: spacing.sm,
    },
    avatar: {
        width: 80,
        height: 80,
        borderRadius: 40,
        alignItems: 'center',
        justifyContent: 'center',
    },
    avatarText: {
        fontSize: fontSizes.h2,
        fontWeight: '700',
        color: colors.primary,
    },
    name: {
        fontSize: fontSizes.h3,
        fontWeight: '700',
        color: colors.text,
        marginBottom: 2,
    },
    sourceText: {
        fontSize: fontSizes.sm,
        color: colors.textSecondary,
        marginBottom: spacing.md,
    },
    statusBadge: {
        paddingHorizontal: spacing.md,
        paddingVertical: 4,
        borderRadius: borderRadius.full,
        marginBottom: spacing.lg,
    },
    statusText: {
        fontSize: fontSizes.sm,
        fontWeight: '600',
    },
    actionRow: {
        flexDirection: 'row',
        justifyContent: 'center',
        width: '100%',
        gap: spacing.md,
    },
    actionButton: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: 10,
        paddingHorizontal: 16,
        borderRadius: borderRadius.md,
        minWidth: 100,
    },
    callButton: {
        backgroundColor: colors.primary,
    },
    emailButton: {
        backgroundColor: colors.white,
        borderWidth: 1,
        borderColor: colors.primary,
    },
    whatsappButton: {
        backgroundColor: '#25D366',
    },
    actionButtonText: {
        fontWeight: '600',
        marginLeft: 6,
        color: colors.white,
    },
    tabContainer: {
        flexDirection: 'row',
        marginBottom: spacing.md,
        backgroundColor: colors.white,
        borderRadius: borderRadius.lg,
        padding: 4,
    },
    tab: {
        flex: 1,
        paddingVertical: 12,
        alignItems: 'center',
        borderRadius: borderRadius.md,
    },
    activeTab: {
        backgroundColor: colors.background,
    },
    tabText: {
        fontWeight: '600',
        color: colors.textSecondary,
    },
    activeTabText: {
        color: colors.text,
    },
    sectionHeader: {
        fontSize: fontSizes.md,
        fontWeight: '700',
        color: colors.text,
        marginBottom: spacing.md,
    },
    infoRow: {
        flexDirection: 'row',
        marginBottom: spacing.md,
        alignItems: 'center',
    },
    iconBox: {
        width: 36,
        height: 36,
        borderRadius: borderRadius.circle,
        backgroundColor: colors.gray50,
        alignItems: 'center',
        justifyContent: 'center',
        marginRight: spacing.md,
    },
    infoContent: {
        flex: 1,
    },
    infoLabel: {
        fontSize: fontSizes.xs,
        color: colors.textSecondary,
        textTransform: 'uppercase',
    },
    infoValue: {
        fontSize: fontSizes.md,
        color: colors.text,
        fontWeight: '500',
    },
    timelineHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: spacing.md,
    },
    addButtonSmall: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: colors.primary,
        paddingHorizontal: 10,
        paddingVertical: 6,
        borderRadius: borderRadius.sm,
        gap: 4,
    },
    addButtonTextSmall: {
        color: colors.white,
        fontSize: 12,
        fontWeight: '600',
    },
    timelineEntry: {
        flexDirection: 'row',
        marginBottom: 0,
    },
    timelineLeft: {
        alignItems: 'center',
        marginRight: spacing.md,
        width: 40,
    },
    timelineIcon: {
        width: 36,
        height: 36,
        borderRadius: 18,
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: colors.gray100,
        zIndex: 1,
    },
    timelineLine: {
        width: 2,
        flex: 1,
        backgroundColor: colors.gray200,
        marginVertical: 4,
    },
    timelineContent: {
        flex: 1,
        backgroundColor: colors.white,
        borderRadius: borderRadius.md,
        padding: spacing.md,
        marginBottom: spacing.lg,
    },
    timelineInfoHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginBottom: 4,
        alignItems: 'flex-start',
    },
    deleteButton: {
        padding: 4,
    },
    timelineType: {
        fontWeight: '700',
        fontSize: 14,
        color: colors.text,
    },
    timelineDate: {
        fontSize: 11,
        color: colors.textSecondary,
    },
    timelineBody: {
        fontSize: 14,
        color: colors.textSecondary,
        lineHeight: 20,
        marginBottom: 8,
    },
    timelineAuthor: {
        fontSize: 11,
        color: colors.gray400,
        fontStyle: 'italic',
        marginTop: 4,
    },
    miniBadge: {
        alignSelf: 'flex-start',
        paddingHorizontal: 8,
        paddingVertical: 2,
        borderRadius: 4,
        marginBottom: 4,
    },
    miniBadgeText: {
        fontSize: 10,
        fontWeight: '600',
    },
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
    },
    modalHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: spacing.lg,
    },
    modalTitle: {
        fontSize: fontSizes.lg,
        fontWeight: '700',
    },
    textArea: {
        backgroundColor: colors.gray50,
        borderRadius: borderRadius.md,
        padding: spacing.md,
        height: 100,
        textAlignVertical: 'top',
        marginTop: spacing.md,
        marginBottom: spacing.lg,
    },
    saveButton: {
        backgroundColor: colors.primary,
        borderRadius: borderRadius.md,
        padding: spacing.md,
        alignItems: 'center',
    },
    saveButtonText: {
        color: colors.white,
        fontWeight: '700',
    },
});

export default LeadDetailScreen;
