// Country Multi-Select Component

import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

import { colors, spacing, borderRadius, fontSizes } from '../../context/ThemeContext';

const COUNTRIES = [
    'Germany',
    'Canada',
    'UK',
    'USA',
    'Hungary',
    'Cyprus',
    'Malaysia',
    'Lithuania',
    'Latvia',
    'New Zealand',
    'Estonia',
    'Australia',
    'South Korea',
    'Georgia',
    'Denmark',
    'Netherlands',
    'Sweden',
    'Norway',
    'Belgium',
    'Romania',
    'Russia',
    'Turkey',
    'Ireland',
    'Portugal',
    'Others',
];

const CountryMultiSelect = ({ selectedCountries = [], onSelectionChange }) => {
    const isSelected = (country) => selectedCountries.includes(country);

    const toggleCountry = (country) => {
        let newSelection;
        if (isSelected(country)) {
            newSelection = selectedCountries.filter((c) => c !== country);
        } else {
            newSelection = [...selectedCountries, country];
        }
        onSelectionChange(newSelection);
    };

    return (
        <View style={styles.container}>
            <Text style={styles.title}>
                Preferred Countries <Text style={styles.optional}>(Select multiple)</Text>
            </Text>

            <ScrollView
                style={styles.scrollContainer}
                contentContainerStyle={styles.checkboxContainer}
                nestedScrollEnabled={true}
            >
                {COUNTRIES.map((country) => (
                    <TouchableOpacity
                        key={country}
                        style={[
                            styles.checkboxItem,
                            isSelected(country) && styles.checkboxItemSelected,
                        ]}
                        onPress={() => toggleCountry(country)}
                        activeOpacity={0.7}
                    >
                        <View
                            style={[
                                styles.checkbox,
                                isSelected(country) && styles.checkboxSelected,
                            ]}
                        >
                            {isSelected(country) && (
                                <Ionicons name="checkmark" size={16} color={colors.white} />
                            )}
                        </View>
                        <Text
                            style={[
                                styles.checkboxLabel,
                                isSelected(country) && styles.checkboxLabelSelected,
                            ]}
                        >
                            {country}
                        </Text>
                    </TouchableOpacity>
                ))}
            </ScrollView>

            {selectedCountries.length > 0 && (
                <View style={styles.selectedContainer}>
                    <Text style={styles.selectedTitle}>
                        Selected ({selectedCountries.length}):
                    </Text>
                    <Text style={styles.selectedText}>{selectedCountries.join(', ')}</Text>
                </View>
            )}
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        marginBottom: spacing.md,
    },
    title: {
        fontSize: fontSizes.sm,
        fontWeight: '600',
        color: colors.text,
        marginBottom: spacing.sm,
    },
    optional: {
        fontSize: fontSizes.xs,
        fontWeight: '400',
        color: colors.textSecondary,
    },
    scrollContainer: {
        maxHeight: 300,
        borderWidth: 1,
        borderColor: colors.gray200,
        borderRadius: borderRadius.md,
        padding: spacing.sm,
    },
    checkboxContainer: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: spacing.sm,
    },
    checkboxItem: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: spacing.xs,
        paddingHorizontal: spacing.sm,
        borderRadius: borderRadius.md,
        backgroundColor: colors.gray50,
        minWidth: '30%',
    },
    checkboxItemSelected: {
        backgroundColor: `${colors.primary}10`,
    },
    checkbox: {
        width: 20,
        height: 20,
        borderRadius: 4,
        borderWidth: 2,
        borderColor: colors.gray300,
        marginRight: spacing.xs,
        justifyContent: 'center',
        alignItems: 'center',
    },
    checkboxSelected: {
        backgroundColor: colors.primary,
        borderColor: colors.primary,
    },
    checkboxLabel: {
        fontSize: fontSizes.sm,
        color: colors.text,
    },
    checkboxLabelSelected: {
        color: colors.primary,
        fontWeight: '600',
    },
    selectedContainer: {
        marginTop: spacing.sm,
        padding: spacing.sm,
        backgroundColor: `${colors.success}10`,
        borderRadius: borderRadius.md,
        borderLeftWidth: 4,
        borderLeftColor: colors.success,
    },
    selectedTitle: {
        fontSize: fontSizes.xs,
        fontWeight: '700',
        color: colors.success,
        marginBottom: 4,
    },
    selectedText: {
        fontSize: fontSizes.xs,
        color: colors.textSecondary,
        lineHeight: 18,
    },
});

export default CountryMultiSelect;
