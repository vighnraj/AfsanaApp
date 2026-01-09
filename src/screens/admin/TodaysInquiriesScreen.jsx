// Today's Inquiries Screen

import React, { useState, useEffect } from 'react';
import {
    View,
    Text,
    StyleSheet,
    ScrollView,
    TouchableOpacity,
    ActivityIndicator,
    RefreshControl,
    Modal,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';

import { colors, spacing, borderRadius, fontSizes, shadows } from '../../context/ThemeContext';
import { showToast } from '../../components/common/Toast';
import { getAllInquiries, getInquiryById } from '../../api/leadApi';
import CustomHeader from '../../components/common/CustomHeader';

const TodaysInquiriesScreen = ({ navigation }) => {
    const [loading, setLoading] = useState(false);
    const [refreshing, setRefreshing] = useState(false);
    const [todaysInquiries, setTodaysInquiries] = useState([]);

    // Detail Modal
    const [showDetailModal, setShowDetailModal] = useState(false);
    const [selectedInquiry, setSelectedInquiry] = useState(null);

    useEffect(() => {
        fetchTodaysInquiries();
    }, []);

    const fetchTodaysInquiries = async () => {
        setLoading(true);
        try {
            const allInquiries = await getAllInquiries();

            // Filter for today's inquiries
            const today = new Date().toISOString().split('T')[0];
            const filtered = allInquiries.filter((inquiry) => {
                const inquiryDate = inquiry.date_of_inquiry
                    ? inquiry.date_of_inquiry.split('T')[0]
                    : null;
                return inquiryDate === today;
            });

            setTodaysInquiries(filtered);
        } catch (error) {
            console.error('Fetch today\'s inquiries error:', error);
            showToast.error('Error', 'Failed to fetch inquiries');
        } finally {
            setLoading(false);
        }
    };

    const onRefresh = async () => {
        setRefreshing(true);
        await fetchTodaysInquiries();
        setRefreshing(false);
    };

    const handleViewDetails = async (inquiry) => {
        try {
            const detailedInquiry = await getInquiryById(inquiry.id);
            setSelectedInquiry(detailedInquiry);
            setShowDetailModal(true);
        } catch (error) {
            console.error('Fetch inquiry details error:', error);
            showToast.error('Error', 'Failed to fetch inquiry details');
        }
    };

    const getSourceColor = (source) => {
        const colors_map = {
            'Walk-in': colors.primary,
            'Phone Call': colors.success,
            'Email': colors.info,
            'Website': colors.warning,
            'Referral': colors.secondary,
            'Social Media': colors.purple,
            'Event': colors.orange,
            'Partner': colors.teal,
        };
        return colors_map[source] || colors.gray400;
    };

    const formatDate = (dateString) => {
        if (!dateString) return 'N/A';
        const date = new Date(dateString);
        return date.toLocaleString('en-GB', {
            year: 'numeric',
            month: 'short',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
        });
    };

    const renderInquiryCard = (inquiry) => (
        <TouchableOpacity
            key={inquiry.id}
            style={[styles.card, shadows.sm]}
            onPress={() => handleViewDetails(inquiry)}
        >
            <View style={styles.cardHeader}>
                <View style={styles.nameContainer}>
                    <Ionicons name="person" size={20} color={colors.primary} />
                    <Text style={styles.name}>{inquiry.name}</Text>
                </View>
                <View
                    style={[
                        styles.sourceBadge,
                        { backgroundColor: `${getSourceColor(inquiry.source)}20` },
                    ]}
                >
                    <Text
                        style={[styles.sourceBadgeText, { color: getSourceColor(inquiry.source) }]}
                    >
                        {inquiry.source}
                    </Text>
                </View>
            </View>

            <View style={styles.cardBody}>
                <View style={styles.infoRow}>
                    <Ionicons name="mail" size={16} color={colors.textSecondary} />
                    <Text style={styles.infoText}>{inquiry.email || 'N/A'}</Text>
                </View>

                <View style={styles.infoRow}>
                    <Ionicons name="call" size={16} color={colors.textSecondary} />
                    <Text style={styles.infoText}>{inquiry.phone_number || 'N/A'}</Text>
                </View>

                <View style={styles.infoRow}>
                    <Ionicons name="location" size={16} color={colors.textSecondary} />
                    <Text style={styles.infoText}>{inquiry.city || 'N/A'}</Text>
                </View>

                {inquiry.course_interested_in && (
                    <View style={styles.infoRow}>
                        <Ionicons name="school" size={16} color={colors.textSecondary} />
                        <Text style={styles.infoText} numberOfLines={1}>
                            {inquiry.course_interested_in}
                        </Text>
                    </View>
                )}
            </View>

            <View style={styles.cardFooter}>
                <View style={styles.timeContainer}>
                    <Ionicons name="time" size={14} color={colors.textSecondary} />
                    <Text style={styles.timeText}>{formatDate(inquiry.date_of_inquiry)}</Text>
                </View>
                <Ionicons name="chevron-forward" size={20} color={colors.primary} />
            </View>
        </TouchableOpacity>
    );



    return (
        <SafeAreaView style={styles.container} edges={['bottom', 'left', 'right']}>
            {/* Header */}
            <CustomHeader
                title="Today's Inquiries"
                subtitle={`${todaysInquiries.length} inquiries today`}
                showBack={true}
                onBack={() => navigation.goBack()}
            />

            {/* Summary Card */}
            <View style={[styles.summaryCard, shadows.sm]}>
                <View style={styles.summaryItem}>
                    <Ionicons name="people" size={32} color={colors.primary} />
                    <View style={styles.summaryInfo}>
                        <Text style={styles.summaryLabel}>Total Inquiries</Text>
                        <Text style={styles.summaryValue}>{todaysInquiries.length}</Text>
                    </View>
                </View>
            </View>

            {/* Content */}
            {loading ? (
                <View style={styles.loadingContainer}>
                    <ActivityIndicator size="large" color={colors.primary} />
                    <Text style={styles.loadingText}>Loading today's inquiries...</Text>
                </View>
            ) : (
                <ScrollView
                    style={styles.content}
                    refreshControl={
                        <RefreshControl
                            refreshing={refreshing}
                            onRefresh={onRefresh}
                            colors={[colors.primary]}
                        />
                    }
                >
                    {todaysInquiries.length === 0 ? (
                        <View style={styles.emptyContainer}>
                            <Ionicons name="calendar-outline" size={64} color={colors.gray300} />
                            <Text style={styles.emptyText}>No inquiries for today</Text>
                            <Text style={styles.emptySubText}>
                                New inquiries will appear here
                            </Text>
                        </View>
                    ) : (
                        todaysInquiries.map((inquiry) => renderInquiryCard(inquiry))
                    )}
                </ScrollView>
            )}



            {/* Detail Modal */}
            {selectedInquiry && (
                <Modal visible={showDetailModal} animationType="slide" transparent>
                    <View style={styles.modalOverlay}>
                        <View style={[styles.modalContainer, shadows.lg]}>
                            {/* Modal Header */}
                            <View style={styles.modalHeader}>
                                <Text style={styles.modalTitle}>Inquiry Details</Text>
                                <TouchableOpacity onPress={() => setShowDetailModal(false)}>
                                    <Ionicons name="close" size={24} color={colors.text} />
                                </TouchableOpacity>
                            </View>

                            {/* Modal Content */}
                            <ScrollView style={styles.modalContent}>
                                {/* Personal Information */}
                                <View style={styles.section}>
                                    <Text style={styles.sectionTitle}>Personal Information</Text>
                                    <View style={styles.detailRow}>
                                        <Text style={styles.detailLabel}>Name:</Text>
                                        <Text style={styles.detailValue}>{selectedInquiry.name}</Text>
                                    </View>
                                    <View style={styles.detailRow}>
                                        <Text style={styles.detailLabel}>Email:</Text>
                                        <Text style={styles.detailValue}>{selectedInquiry.email || 'N/A'}</Text>
                                    </View>
                                    <View style={styles.detailRow}>
                                        <Text style={styles.detailLabel}>Phone:</Text>
                                        <Text style={styles.detailValue}>
                                            {selectedInquiry.phone_number || 'N/A'}
                                        </Text>
                                    </View>
                                    <View style={styles.detailRow}>
                                        <Text style={styles.detailLabel}>City:</Text>
                                        <Text style={styles.detailValue}>{selectedInquiry.city || 'N/A'}</Text>
                                    </View>
                                    <View style={styles.detailRow}>
                                        <Text style={styles.detailLabel}>Source:</Text>
                                        <Text style={styles.detailValue}>{selectedInquiry.source || 'N/A'}</Text>
                                    </View>
                                </View>

                                {/* Academic Information */}
                                <View style={styles.section}>
                                    <Text style={styles.sectionTitle}>Academic Interest</Text>
                                    <View style={styles.detailRow}>
                                        <Text style={styles.detailLabel}>Course:</Text>
                                        <Text style={styles.detailValue}>
                                            {selectedInquiry.course_interested_in || 'N/A'}
                                        </Text>
                                    </View>
                                    {selectedInquiry.preferred_countries && (
                                        <View style={styles.detailRow}>
                                            <Text style={styles.detailLabel}>Preferred Countries:</Text>
                                            <Text style={styles.detailValue}>
                                                {Array.isArray(selectedInquiry.preferred_countries)
                                                    ? selectedInquiry.preferred_countries.join(', ')
                                                    : selectedInquiry.preferred_countries || 'N/A'}
                                            </Text>
                                        </View>
                                    )}
                                </View>

                                {/* Education Background */}
                                {selectedInquiry.education_level && (
                                    <View style={styles.section}>
                                        <Text style={styles.sectionTitle}>Education Background</Text>
                                        <View style={styles.detailRow}>
                                            <Text style={styles.detailLabel}>Education Level:</Text>
                                            <Text style={styles.detailValue}>
                                                {selectedInquiry.education_level}
                                            </Text>
                                        </View>
                                        {selectedInquiry.field_of_study && (
                                            <View style={styles.detailRow}>
                                                <Text style={styles.detailLabel}>Field of Study:</Text>
                                                <Text style={styles.detailValue}>
                                                    {selectedInquiry.field_of_study}
                                                </Text>
                                            </View>
                                        )}
                                    </View>
                                )}

                                {/* English Proficiency */}
                                {selectedInquiry.english_proficiency && (
                                    <View style={styles.section}>
                                        <Text style={styles.sectionTitle}>English Proficiency</Text>
                                        <View style={styles.detailRow}>
                                            <Text style={styles.detailLabel}>Level:</Text>
                                            <Text style={styles.detailValue}>
                                                {selectedInquiry.english_proficiency}
                                            </Text>
                                        </View>
                                    </View>
                                )}

                                {/* Inquiry Date */}
                                <View style={styles.section}>
                                    <Text style={styles.sectionTitle}>Inquiry Information</Text>
                                    <View style={styles.detailRow}>
                                        <Text style={styles.detailLabel}>Date & Time:</Text>
                                        <Text style={styles.detailValue}>
                                            {formatDate(selectedInquiry.date_of_inquiry)}
                                        </Text>
                                    </View>
                                </View>
                            </ScrollView>

                            {/* Modal Footer */}
                            <View style={styles.modalFooter}>
                                <TouchableOpacity
                                    style={styles.closeButton}
                                    onPress={() => setShowDetailModal(false)}
                                >
                                    <Text style={styles.closeButtonText}>Close</Text>
                                </TouchableOpacity>
                            </View>
                        </View>
                    </View>
                </Modal>
            )}
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: colors.background,
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: spacing.md,
        backgroundColor: colors.white,
    },
    headerTitle: {
        fontSize: fontSizes.lg,
        fontWeight: '700',
        color: colors.text,
        flex: 1,
        marginLeft: spacing.md,
    },
    countBadge: {
        backgroundColor: colors.primary,
        width: 36,
        height: 36,
        borderRadius: 18,
        justifyContent: 'center',
        alignItems: 'center',
    },
    countText: {
        fontSize: fontSizes.md,
        fontWeight: '700',
        color: colors.white,
    },
    summaryCard: {
        backgroundColor: colors.white,
        margin: spacing.md,
        padding: spacing.md,
        borderRadius: borderRadius.lg,
    },
    summaryItem: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: spacing.md,
    },
    summaryInfo: {
        flex: 1,
    },
    summaryLabel: {
        fontSize: fontSizes.sm,
        color: colors.textSecondary,
        marginBottom: 4,
    },
    summaryValue: {
        fontSize: fontSizes.xxl,
        fontWeight: '700',
        color: colors.text,
    },
    loadingContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    loadingText: {
        marginTop: spacing.sm,
        fontSize: fontSizes.sm,
        color: colors.textSecondary,
    },
    content: {
        flex: 1,
        padding: spacing.md,
        paddingBottom: 100,
    },
    emptyContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        paddingVertical: spacing.xxl,
    },
    emptyText: {
        marginTop: spacing.md,
        fontSize: fontSizes.md,
        fontWeight: '600',
        color: colors.textSecondary,
    },
    emptySubText: {
        marginTop: spacing.xs,
        fontSize: fontSizes.sm,
        color: colors.gray400,
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
    },
    nameContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: spacing.xs,
        flex: 1,
    },
    name: {
        fontSize: fontSizes.md,
        fontWeight: '700',
        color: colors.text,
    },
    sourceBadge: {
        paddingHorizontal: spacing.sm,
        paddingVertical: 4,
        borderRadius: borderRadius.md,
    },
    sourceBadgeText: {
        fontSize: fontSizes.xs,
        fontWeight: '600',
    },
    cardBody: {
        gap: spacing.xs,
        marginBottom: spacing.sm,
    },
    infoRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: spacing.xs,
    },
    infoText: {
        fontSize: fontSizes.sm,
        color: colors.textSecondary,
        flex: 1,
    },
    cardFooter: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingTop: spacing.sm,
        borderTopWidth: 1,
        borderTopColor: colors.gray100,
    },
    timeContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 4,
    },
    timeText: {
        fontSize: fontSizes.xs,
        color: colors.textSecondary,
    },
    modalOverlay: {
        flex: 1,
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
        justifyContent: 'flex-end',
    },
    modalContainer: {
        backgroundColor: colors.white,
        borderTopLeftRadius: borderRadius.xl,
        borderTopRightRadius: borderRadius.xl,
        maxHeight: '90%',
    },
    modalHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: spacing.md,
        borderBottomWidth: 1,
        borderBottomColor: colors.gray100,
    },
    modalTitle: {
        fontSize: fontSizes.lg,
        fontWeight: '700',
        color: colors.text,
    },
    modalContent: {
        padding: spacing.md,
    },
    section: {
        marginBottom: spacing.md,
        padding: spacing.md,
        backgroundColor: colors.gray50,
        borderRadius: borderRadius.md,
    },
    sectionTitle: {
        fontSize: fontSizes.md,
        fontWeight: '700',
        color: colors.text,
        marginBottom: spacing.sm,
    },
    detailRow: {
        flexDirection: 'row',
        marginBottom: spacing.xs,
    },
    detailLabel: {
        fontSize: fontSizes.sm,
        color: colors.textSecondary,
        fontWeight: '500',
        width: 140,
    },
    detailValue: {
        fontSize: fontSizes.sm,
        color: colors.text,
        fontWeight: '600',
        flex: 1,
    },
    modalFooter: {
        padding: spacing.md,
        borderTopWidth: 1,
        borderTopColor: colors.gray100,
    },
    closeButton: {
        backgroundColor: colors.primary,
        padding: spacing.sm,
        borderRadius: borderRadius.md,
        alignItems: 'center',
    },
    closeButtonText: {
        fontSize: fontSizes.sm,
        fontWeight: '600',
        color: colors.white,
    },

});

export default TodaysInquiriesScreen;
