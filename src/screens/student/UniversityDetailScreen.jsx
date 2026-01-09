// University Detail Screen
import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, Image, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors, spacing, borderRadius, fontSizes, shadows } from '../../context/ThemeContext';
import { CustomHeader, Button, LoadingSpinner } from '../../components/common';

const UniversityDetailScreen = ({ route, navigation }) => {
    const { university } = route.params;
    const [loading, setLoading] = useState(false);

    // In a real app, you'd fetch more details and programs here
    const programs = [
        { id: 1, name: 'Bachelor of Computer Science', duration: '3 Years', fee: '$25,000/yr' },
        { id: 2, name: 'Master of Data Science', duration: '2 Years', fee: '$30,000/yr' },
        { id: 3, name: 'MBA (Global Business)', duration: '1.5 Years', fee: '$35,000/yr' },
    ];

    if (loading) return <LoadingSpinner />;

    return (
        <View style={styles.safeArea}>
            {/* CustomHeader removed - using Stack Header */}
            <ScrollView contentContainerStyle={styles.content}>
                <View style={[styles.headerCard, shadows.sm]}>
                    <View style={styles.banner}>
                        <Ionicons name="school" size={60} color={colors.white} />
                    </View>
                    <View style={styles.headerInfo}>
                        <Text style={styles.uniName}>{university.name}</Text>
                        <View style={styles.locationBox}>
                            <Ionicons name="location" size={16} color={colors.primary} />
                            <Text style={styles.locationText}>{university.location || 'Global'}</Text>
                        </View>
                    </View>
                </View>

                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>About</Text>
                    <Text style={styles.description}>
                        {university.description || "This university is one of the world's leading institutions with a reputation for excellence in teaching and research. It offers a wide range of programs across various disciplines."}
                    </Text>
                </View>

                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>Available Programs</Text>
                    {programs.map(prog => (
                        <TouchableOpacity key={prog.id} style={[styles.progCard, shadows.sm]}>
                            <View style={styles.progInfo}>
                                <Text style={styles.progName}>{prog.name}</Text>
                                <View style={styles.progMeta}>
                                    <View style={styles.metaItem}>
                                        <Ionicons name="time-outline" size={14} color={colors.textSecondary} />
                                        <Text style={styles.metaText}>{prog.duration}</Text>
                                    </View>
                                    <View style={styles.metaItem}>
                                        <Ionicons name="cash-outline" size={14} color={colors.textSecondary} />
                                        <Text style={styles.metaText}>{prog.fee}</Text>
                                    </View>
                                </View>
                            </View>
                            <Ionicons name="chevron-forward" size={20} color={colors.primary} />
                        </TouchableOpacity>
                    ))}
                </View>

                <Button
                    title="Check Eligibility"
                    onPress={() => { }}
                    variant="outline"
                    style={styles.actionBtn}
                />
                <Button
                    title="Apply Now"
                    onPress={() => { }}
                    style={styles.actionBtn}
                    fullWidth
                />
            </ScrollView>
        </View>
    );
};

const styles = StyleSheet.create({
    safeArea: { flex: 1, backgroundColor: colors.background },
    content: { padding: spacing.md },
    headerCard: { backgroundColor: colors.white, borderRadius: borderRadius.xl, overflow: 'hidden', marginBottom: spacing.lg },
    banner: { height: 120, backgroundColor: colors.primary, alignItems: 'center', justifyContent: 'center' },
    headerInfo: { padding: spacing.md },
    uniName: { fontSize: fontSizes.lg, fontWeight: '700', color: colors.text },
    locationBox: { flexDirection: 'row', alignItems: 'center', marginTop: 4 },
    locationText: { fontSize: fontSizes.sm, color: colors.textSecondary, marginLeft: 4 },
    section: { marginBottom: spacing.lg },
    sectionTitle: { fontSize: fontSizes.md, fontWeight: '700', color: colors.text, marginBottom: spacing.sm },
    description: { fontSize: fontSizes.sm, color: colors.textSecondary, lineHeight: 20 },
    progCard: { backgroundColor: colors.white, borderRadius: borderRadius.lg, padding: spacing.md, flexDirection: 'row', alignItems: 'center', marginBottom: spacing.sm },
    progInfo: { flex: 1 },
    progName: { fontSize: fontSizes.md, fontWeight: '600', color: colors.text },
    progMeta: { flexDirection: 'row', marginTop: 4 },
    metaItem: { flexDirection: 'row', alignItems: 'center', marginRight: spacing.md },
    metaText: { fontSize: fontSizes.xs, color: colors.textSecondary, marginLeft: 4 },
    actionBtn: { marginBottom: spacing.sm },
});

export default UniversityDetailScreen;
