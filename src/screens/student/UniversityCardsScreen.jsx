// University Cards Screen

import React, { useState, useEffect, useCallback } from 'react';
import {
    View,
    Text,
    StyleSheet,
    FlatList,
    TouchableOpacity,
    RefreshControl,
    TextInput,
    Image,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';

import { getUniversities } from '../../api/visaApi';
import { colors, spacing, borderRadius, fontSizes, shadows } from '../../context/ThemeContext';
import { LoadingSpinner } from '../../components/common/Loading';
import { showToast } from '../../components/common/Toast';

const UniversityCardsScreen = ({ navigation }) => {
    const [universities, setUniversities] = useState([]);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');

    const fetchUniversities = useCallback(async () => {
        try {
            const data = await getUniversities();
            setUniversities(Array.isArray(data) ? data : data.universities || []);
        } catch (error) {
            console.error('Fetch universities error:', error);
            showToast.error('Error', 'Failed to load universities');
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    }, []);

    useEffect(() => {
        fetchUniversities();
    }, [fetchUniversities]);

    const onRefresh = () => {
        setRefreshing(true);
        fetchUniversities();
    };

    const filteredUniversities = universities.filter(uni => {
        if (!searchQuery) return true;
        const query = searchQuery.toLowerCase();
        return (
            uni.name?.toLowerCase().includes(query) ||
            uni.university_name?.toLowerCase().includes(query) ||
            uni.country?.toLowerCase().includes(query)
        );
    });

    const renderUniversityItem = ({ item }) => (
        <TouchableOpacity
            style={[styles.universityCard, shadows.md]}
            onPress={() => navigation.navigate('SearchPrograms', { university: item })}
        >
            <View style={styles.cardImage}>
                <Ionicons name="school" size={40} color={colors.primary} />
            </View>

            <View style={styles.cardContent}>
                <Text style={styles.universityName} numberOfLines={2}>
                    {item.name || item.university_name}
                </Text>

                <View style={styles.locationRow}>
                    <Ionicons name="location-outline" size={14} color={colors.textSecondary} />
                    <Text style={styles.locationText}>{item.country || 'Country'}</Text>
                </View>

                {item.program_count && (
                    <View style={styles.programsRow}>
                        <Ionicons name="book-outline" size={14} color={colors.textSecondary} />
                        <Text style={styles.programsText}>{item.program_count} Programs</Text>
                    </View>
                )}

                <TouchableOpacity style={styles.applyButton}>
                    <Text style={styles.applyButtonText}>View Programs</Text>
                    <Ionicons name="arrow-forward" size={16} color={colors.white} />
                </TouchableOpacity>
            </View>
        </TouchableOpacity>
    );

    if (loading) {
        return (
            <SafeAreaView style={styles.safeArea}>
                <LoadingSpinner />
            </SafeAreaView>
        );
    }

    return (
        <SafeAreaView style={styles.safeArea} edges={['bottom']}>
            {/* Search Bar */}
            <View style={styles.searchContainer}>
                <View style={styles.searchBar}>
                    <Ionicons name="search" size={20} color={colors.gray400} />
                    <TextInput
                        style={styles.searchInput}
                        placeholder="Search universities..."
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

            {/* Results */}
            <Text style={styles.resultsCount}>
                {filteredUniversities.length} universit{filteredUniversities.length !== 1 ? 'ies' : 'y'} found
            </Text>

            <FlatList
                data={filteredUniversities}
                keyExtractor={(item) => item.id?.toString()}
                renderItem={renderUniversityItem}
                numColumns={2}
                columnWrapperStyle={styles.columnWrapper}
                contentContainerStyle={styles.listContent}
                showsVerticalScrollIndicator={false}
                refreshControl={
                    <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
                }
                ListEmptyComponent={
                    <View style={styles.emptyContainer}>
                        <Ionicons name="school-outline" size={64} color={colors.gray300} />
                        <Text style={styles.emptyText}>No universities found</Text>
                    </View>
                }
            />
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    safeArea: {
        flex: 1,
        backgroundColor: colors.background,
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
        padding: spacing.sm,
    },
    columnWrapper: {
        justifyContent: 'space-between',
        paddingHorizontal: spacing.xs,
    },
    universityCard: {
        backgroundColor: colors.white,
        borderRadius: borderRadius.lg,
        marginBottom: spacing.sm,
        width: '48%',
        overflow: 'hidden',
    },
    cardImage: {
        height: 80,
        backgroundColor: `${colors.primary}10`,
        alignItems: 'center',
        justifyContent: 'center',
    },
    cardContent: {
        padding: spacing.sm,
    },
    universityName: {
        fontSize: fontSizes.md,
        fontWeight: '600',
        color: colors.text,
        minHeight: 40,
    },
    locationRow: {
        flexDirection: 'row',
        alignItems: 'center',
        marginTop: spacing.xs,
    },
    locationText: {
        fontSize: fontSizes.sm,
        color: colors.textSecondary,
        marginLeft: 4,
    },
    programsRow: {
        flexDirection: 'row',
        alignItems: 'center',
        marginTop: 2,
    },
    programsText: {
        fontSize: fontSizes.sm,
        color: colors.textSecondary,
        marginLeft: 4,
    },
    applyButton: {
        backgroundColor: colors.primary,
        borderRadius: borderRadius.sm,
        paddingVertical: spacing.xs,
        paddingHorizontal: spacing.sm,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        marginTop: spacing.sm,
    },
    applyButtonText: {
        fontSize: fontSizes.sm,
        fontWeight: '600',
        color: colors.white,
        marginRight: 4,
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
});

export default UniversityCardsScreen;
