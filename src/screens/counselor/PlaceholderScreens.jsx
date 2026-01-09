// Placeholder screens for Counselor, Staff, Processor, MasterAdmin
// Basic screen structure that displays role-appropriate content

import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { colors, spacing, fontSizes } from '../../context/ThemeContext';

// Counselor Leads Screen
export const LeadsScreen = () => (
    <SafeAreaView style={styles.container} edges={['top']}>
        <View style={styles.header}>
            <Text style={styles.headerTitle}>My Leads</Text>
        </View>
        <View style={styles.content}>
            <Ionicons name="people" size={64} color={colors.gray300} />
            <Text style={styles.title}>Leads Management</Text>
            <Text style={styles.description}>View and manage your assigned leads</Text>
        </View>
    </SafeAreaView>
);

// Counselor Students Screen
export const StudentsScreen = () => (
    <SafeAreaView style={styles.container} edges={['top']}>
        <View style={styles.header}>
            <Text style={styles.headerTitle}>My Students</Text>
        </View>
        <View style={styles.content}>
            <Ionicons name="school" size={64} color={colors.gray300} />
            <Text style={styles.title}>Students Management</Text>
            <Text style={styles.description}>View and manage your assigned students</Text>
        </View>
    </SafeAreaView>
);

// Counselor Tasks Screen
export const TasksScreen = () => (
    <SafeAreaView style={styles.container} edges={['top']}>
        <View style={styles.header}>
            <Text style={styles.headerTitle}>Tasks</Text>
        </View>
        <View style={styles.content}>
            <Ionicons name="checkbox" size={64} color={colors.gray300} />
            <Text style={styles.title}>Task Management</Text>
            <Text style={styles.description}>View your assigned tasks</Text>
        </View>
    </SafeAreaView>
);

// Counselor Payments Screen
export const PaymentsScreen = () => (
    <SafeAreaView style={styles.container} edges={['top']}>
        <View style={styles.header}>
            <Text style={styles.headerTitle}>Student Invoices</Text>
        </View>
        <View style={styles.content}>
            <Ionicons name="card" size={64} color={colors.gray300} />
            <Text style={styles.title}>Invoice Management</Text>
            <Text style={styles.description}>View student payment invoices</Text>
        </View>
    </SafeAreaView>
);

// Counselor More Screen
export const MoreScreen = () => (
    <SafeAreaView style={styles.container} edges={['top']}>
        <View style={styles.header}>
            <Text style={styles.headerTitle}>More</Text>
        </View>
        <View style={styles.content}>
            <Ionicons name="menu" size={64} color={colors.gray300} />
            <Text style={styles.title}>More Options</Text>
            <Text style={styles.description}>Additional features and settings</Text>
        </View>
    </SafeAreaView>
);

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: colors.background },
    header: { padding: spacing.md, backgroundColor: colors.primary },
    headerTitle: { fontSize: fontSizes.h3, fontWeight: '700', color: colors.white },
    content: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: spacing.lg },
    title: { fontSize: fontSizes.h3, fontWeight: '700', color: colors.text, marginTop: spacing.md },
    description: { fontSize: fontSizes.md, color: colors.textSecondary, marginTop: spacing.sm, textAlign: 'center' },
});

// Export all as default for single-file convenience
export default { LeadsScreen, StudentsScreen, TasksScreen, PaymentsScreen, MoreScreen };
