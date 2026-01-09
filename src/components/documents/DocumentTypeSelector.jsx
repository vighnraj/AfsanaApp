// Document Type Selector Component
import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Dropdown } from 'react-native-element-dropdown';
import { Ionicons } from '@expo/vector-icons';
import { colors, spacing, fontSizes } from '../../context/ThemeContext';

const DOCUMENT_TYPES = [
  { label: 'Passport', value: 'passport' },
  { label: 'Photo', value: 'photo' },
  { label: 'SSC Certificate', value: 'ssc_certificate' },
  { label: 'HSC Certificate', value: 'hsc_certificate' },
  { label: "Bachelor's Certificate", value: 'bachelor_certificate' },
  { label: 'IELTS/TOEFL', value: 'ielts_toefl' },
  { label: 'CV/Resume', value: 'cv_resume' },
  { label: 'Statement of Purpose (SOP)', value: 'sop' },
  { label: 'Medical Certificate', value: 'medical_certificate' },
  { label: 'Bank Statement', value: 'bank_statement' },
  { label: 'Police Clearance Certificate', value: 'police_clearance' },
  { label: 'Birth Certificate', value: 'birth_certificate' },
  { label: 'Tax Proof/Income Tax', value: 'tax_proof' },
  { label: 'Business Documents', value: 'business_docs' },
  { label: 'CA Certificate', value: 'ca_certificate' },
  { label: 'Health/Travel Insurance', value: 'insurance' },
  { label: 'Residence Form', value: 'residence_form' },
  { label: 'Flight Booking', value: 'flight_booking' },
  { label: 'Family Certificate', value: 'family_certificate' },
  { label: 'Application Form', value: 'application_form' },
  { label: 'Other Documents', value: 'other' },
];

const DocumentTypeSelector = ({ value, onChange, label, error, required }) => {
  return (
    <View style={styles.container}>
      {label && (
        <Text style={styles.label}>
          {label}
          {required && <Text style={styles.required}> *</Text>}
        </Text>
      )}

      <Dropdown
        style={[styles.dropdown, error && styles.dropdownError]}
        placeholderStyle={styles.placeholderStyle}
        selectedTextStyle={styles.selectedTextStyle}
        inputSearchStyle={styles.inputSearchStyle}
        iconStyle={styles.iconStyle}
        data={DOCUMENT_TYPES}
        search
        maxHeight={300}
        labelField="label"
        valueField="value"
        placeholder="Select document type"
        searchPlaceholder="Search..."
        value={value}
        onChange={onChange}
        renderLeftIcon={() => (
          <Ionicons
            name="document-text-outline"
            size={20}
            color={colors.textSecondary}
            style={styles.icon}
          />
        )}
      />

      {error && <Text style={styles.errorText}>{error}</Text>}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginBottom: spacing.md,
  },
  label: {
    fontSize: fontSizes.md,
    fontWeight: '600',
    color: colors.text,
    marginBottom: spacing.xs,
  },
  required: {
    color: colors.danger,
  },
  dropdown: {
    height: 50,
    borderColor: colors.border,
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: spacing.md,
    backgroundColor: colors.white,
  },
  dropdownError: {
    borderColor: colors.danger,
  },
  placeholderStyle: {
    fontSize: fontSizes.md,
    color: colors.textSecondary,
  },
  selectedTextStyle: {
    fontSize: fontSizes.md,
    color: colors.text,
  },
  inputSearchStyle: {
    height: 40,
    fontSize: fontSizes.md,
    borderColor: colors.border,
  },
  iconStyle: {
    width: 20,
    height: 20,
  },
  icon: {
    marginRight: spacing.sm,
  },
  errorText: {
    color: colors.danger,
    fontSize: fontSizes.sm,
    marginTop: spacing.xs,
  },
});

export default DocumentTypeSelector;
export { DOCUMENT_TYPES };
