// Search Programs Screen
import React, { useState, useEffect, useCallback } from 'react';
import { View, Text, StyleSheet, FlatList, TextInput, TouchableOpacity, RefreshControl, Image } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { getUniversities } from '../../api/visaApi';
import { colors, spacing, borderRadius, fontSizes, shadows } from '../../context/ThemeContext';
import { CustomHeader, LoadingSpinner } from '../../components/common';

const SearchProgramsScreen = ({ navigation }) => {
    const [universities, setUniversities] = useState([]);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');

    const fetchUniversities = useCallback(async () => {
        try {
            const data = await getUniversities();
            setUniversities(Array.isArray(data) ? data : []);
        } catch (error) {
            console.error('Fetch universities error:', error);
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    }, []);

    useEffect(() => {
        fetchUniversities();
    }, [fetchUniversities]);

    const filteredUniversities = universities.filter(u =>
        u.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        u.location?.toLowerCase().includes(searchQuery.toLowerCase())
    );

    const renderUniversity = ({ item }) => (
        <TouchableOpacity
            style={[styles.uniCard, shadows.md]}
            onPress={() => navigation.navigate('UniversityDetail', { university: item })}
        >
            <View style={styles.uniHeader}>
                <View style={styles.uniIcon}>
                    <Ionicons name="school" size={28} color={colors.primary} />
                </View>
                <View style={styles.uniTitleBox}>
                    <Text style={styles.uniName}>{item.name}</Text>
                    <View style={styles.locationBox}>
                        <Ionicons name="location-outline" size={14} color={colors.textSecondary} />
                        <Text style={styles.locationText}>{item.location || 'Global'}</Text>
                    </View>
                </View>
            </View>
            <View style={styles.tagsRow}>
                <View style={styles.tag}><Text style={styles.tagText}>Top Ranked</Text></View>
                <View style={[styles.tag, { backgroundColor: colors.success + '15' }]}><Text style={[styles.tagText, { color: colors.success }]}>Available</Text></View>
            </View>
            <TouchableOpacity style={styles.viewBtn} onPress={() => navigation.navigate('UniversityDetail', { university: item })}>
                <Text style={styles.viewBtnText}>View Programs</Text>
                <Ionicons name="arrow-forward" size={16} color={colors.primary} />
            </TouchableOpacity>
        </TouchableOpacity>
    );

    if (loading) return <LoadingSpinner />;

    return (
        <View style={styles.safeArea}>
            {/* CustomHeader removed - using Stack Header */}
            <View style={styles.searchContainer}>
                <View style={styles.searchBar}>
                    <Ionicons name="search" size={20} color={colors.gray400} />
                    <TextInput
                        style={styles.searchInput}
                        placeholder="Search universities or countries..."
                        value={searchQuery}
                        onChangeText={setSearchQuery}
                    />
                </View>
            </View>
            <FlatList
                data={filteredUniversities}
                keyExtractor={(item) => item.id.toString()}
                renderItem={renderUniversity}
                contentContainerStyle={styles.list}
                refreshControl={<RefreshControl refreshing={refreshing} onRefresh={() => { setRefreshing(true); fetchUniversities(); }} />}
                ListEmptyComponent={<Text style={styles.emptyText}>No universities found</Text>}
            />
        </View>
    );
};

const styles = StyleSheet.create({
    safeArea: { flex: 1, backgroundColor: colors.background },
    searchContainer: { padding: spacing.md, backgroundColor: colors.white },
    searchBar: { flexDirection: 'row', alignItems: 'center', backgroundColor: colors.gray50, borderRadius: borderRadius.md, paddingHorizontal: spacing.sm, height: 44 },
    searchInput: { flex: 1, marginLeft: spacing.sm, fontSize: fontSizes.md },
    list: { padding: spacing.md },
    uniCard: { backgroundColor: colors.white, borderRadius: borderRadius.xl, padding: spacing.md, marginBottom: spacing.md, borderLeftWidth: 4, borderLeftColor: colors.primary },
    uniHeader: { flexDirection: 'row', alignItems: 'center' },
    uniIcon: { width: 50, height: 50, borderRadius: 25, backgroundColor: colors.primary + '10', alignItems: 'center', justifyContent: 'center' },
    uniTitleBox: { marginLeft: spacing.md, flex: 1 },
    uniName: { fontSize: fontSizes.md, fontWeight: '700', color: colors.text },
    locationBox: { flexDirection: 'row', alignItems: 'center', marginTop: 2 },
    locationText: { fontSize: fontSizes.xs, color: colors.textSecondary, marginLeft: 2 },
    tagsRow: { flexDirection: 'row', marginTop: spacing.sm },
    tag: { backgroundColor: colors.primary + '15', paddingHorizontal: 8, paddingVertical: 2, borderRadius: 4, marginRight: 8 },
    tagText: { fontSize: 10, fontWeight: '600', color: colors.primary },
    viewBtn: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginTop: spacing.md, paddingTop: spacing.sm, borderTopWidth: 1, borderTopColor: colors.gray100 },
    viewBtnText: { fontSize: fontSizes.sm, fontWeight: '600', color: colors.primary },
    emptyText: { textAlign: 'center', marginTop: 50, color: colors.textSecondary },
});

export default SearchProgramsScreen;
