// Visa Process List Screen for Admin/Staff/Processors
import React, { useState, useEffect, useCallback } from 'react';
import {
    View,
    Text,
    StyleSheet,
    FlatList,
    TouchableOpacity,
    RefreshControl,
    TextInput,
    ActivityIndicator,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors, spacing, borderRadius, fontSizes, shadows } from '../../context/ThemeContext';
import { LoadingSpinner } from '../../components/common/Loading';
import { showToast } from '../../components/common/Toast';
import CustomHeader from '../../components/common/CustomHeader';
import visaApi from '../../api/visaApi';
import FilterDropdown from '../../components/common/FilterDropdown';
import { VISA_STAGES } from '../../utils/constants';
import { useAuth } from '../../context/AuthContext';

const VisaListScreen = ({ navigation }) => {
    const { user } = useAuth();
    const [data, setData] = useState([]);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');
    const [stageFilter, setStageFilter] = useState('');

    const fetchData = useCallback(async () => {
        try {
            let result = [];
            if (user?.role === 'admin' || user?.role === 'staff') {
                result = await visaApi.getVisaProcessingList();
            } else if (user?.role === 'counselor') {
                result = await visaApi.getVisaProcessByCounselorId(user.id);
            } else if (user?.role === 'processor') {
                result = await visaApi.getVisaProcessByProcessorId(user.id);
            }
            setData(Array.isArray(result) ? result : []);
        } catch (error) {
            console.error('Fetch visa list error:', error);
            showToast.error('Error', 'Failed to load visa applications');
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    }, [user]);

    useEffect(() => {
        if (user) fetchData();
    }, [fetchData, user]);

    const onRefresh = () => {
        setRefreshing(true);
        fetchData();
    };

    const getStageLabel = (row) => {
        // Calculate current stage based on completed flags
        let lastStage = 'Registration';
        VISA_STAGES.forEach(s => {
            if (row[s.apiField] === 1) {
                lastStage = s.label;
            }
        });
        return lastStage;
    };

    const filteredData = data.filter(item => {
        const name = item.full_name || item.student_name || '';
        const matchesSearch = !searchQuery ||
            name.toLowerCase().includes(searchQuery.toLowerCase()) ||
            item.email?.toLowerCase().includes(searchQuery.toLowerCase());

        const matchesStage = !stageFilter || getStageLabel(item) === stageFilter;

        return matchesSearch && matchesStage;
    });

    const renderItem = ({ item }) => (
        <TouchableOpacity
            style={[styles.card, shadows.sm]}
            onPress={() => navigation.navigate('VisaProcessing', {
                studentId: item.student_id || item.id,
                readOnly: false
            })}
        >
            <View style={styles.cardHeader}>
                <View style={styles.userInfo}>
                    <Text style={styles.userName}>{item.full_name || item.student_name || 'Unnamed Student'}</Text>
                    <Text style={styles.userEmail}>{item.email}</Text>
                </View>
                <View style={[styles.stageBadge, { backgroundColor: colors.primary + '15' }]}>
                    <Text style={[styles.stageText, { color: colors.primary }]}>{getStageLabel(item)}</Text>
                </View>
            </View>

            <View style={styles.uniInfo}>
                <Ionicons name="business-outline" size={14} color={colors.textSecondary} />
                <Text style={styles.uniText}>{item.university_name || 'Multiple Universities'}</Text>
            </View>

            <View style={styles.footer}>
                <Text style={styles.dateText}>Ref: {item.application_id || 'N/A'}</Text>
                <Ionicons name="chevron-forward" size={16} color={colors.gray400} />
            </View>
        </TouchableOpacity>
    );

    return (
        <View style={styles.container}>
            {/* CustomHeader removed - using Stack Header */}
            <View style={styles.filterSection}>
                <View style={styles.searchBar}>
                    <Ionicons name="search" size={18} color={colors.gray400} />
                    <TextInput
                        style={styles.searchInput}
                        placeholder="Search by name or email"
                        value={searchQuery}
                        onChangeText={setSearchQuery}
                    />
                </View>
                <FilterDropdown
                    placeholder="All Stages"
                    value={stageFilter}
                    options={VISA_STAGES.map(s => s.label)}
                    onChange={setStageFilter}
                />
            </View>

            {loading ? (
                <LoadingSpinner />
            ) : (
                <FlatList
                    data={filteredData}
                    keyExtractor={(item, index) => item.id?.toString() || index.toString()}
                    renderItem={renderItem}
                    contentContainerStyle={styles.list}
                    refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
                    ListEmptyComponent={
                        <View style={styles.empty}>
                            <Ionicons name="airplane-outline" size={64} color={colors.gray300} />
                            <Text style={styles.emptyText}>No applications found</Text>
                        </View>
                    }
                />
            )}
        </View>
    );
};

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: colors.background },
    filterSection: { padding: spacing.md, backgroundColor: colors.white, borderBottomWidth: 1, borderBottomColor: colors.gray100 },
    searchBar: { flexDirection: 'row', alignItems: 'center', backgroundColor: colors.gray100, borderRadius: borderRadius.md, paddingHorizontal: spacing.sm, height: 40, marginBottom: spacing.sm },
    searchInput: { flex: 1, marginLeft: spacing.sm, fontSize: fontSizes.sm, color: colors.text },
    list: { padding: spacing.md },
    card: { backgroundColor: colors.white, borderRadius: borderRadius.lg, padding: spacing.md, marginBottom: spacing.md },
    cardHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: spacing.sm },
    userInfo: { flex: 1 },
    userName: { fontSize: fontSizes.md, fontWeight: '700', color: colors.text },
    userEmail: { fontSize: fontSizes.xs, color: colors.textSecondary },
    stageBadge: { paddingHorizontal: 8, paddingVertical: 4, borderRadius: 4 },
    stageText: { fontSize: 10, fontWeight: '700' },
    uniInfo: { flexDirection: 'row', alignItems: 'center', marginBottom: spacing.sm },
    uniText: { marginLeft: 6, fontSize: fontSizes.sm, color: colors.textSecondary },
    footer: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', borderTopWidth: 1, borderTopColor: colors.gray50, paddingTop: spacing.sm },
    dateText: { fontSize: 10, color: colors.gray400 },
    empty: { alignItems: 'center', justifyContent: 'center', marginTop: 100 },
    emptyText: { marginTop: spacing.md, color: colors.textSecondary },
});

export default VisaListScreen;
