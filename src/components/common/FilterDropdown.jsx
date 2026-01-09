import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Picker } from '@react-native-picker/picker';
import { colors, fontSizes, borderRadius, spacing } from '../../context/ThemeContext';

const FilterDropdown = ({ label, value, options = [], onChange, placeholder = 'Select', enabled = true }) => {
  const normalizedOptions = options.map(opt => (typeof opt === 'string' ? { value: opt, label: opt } : opt));

  return (
    <View style={styles.container}>
      {label ? <Text style={styles.label}>{label}</Text> : null}
      <View style={styles.pickerWrap}>
        <Picker
          enabled={enabled}
          selectedValue={value}
          onValueChange={(val) => onChange(val)}
          style={styles.picker}>
          <Picker.Item label={placeholder} value="" />
          {normalizedOptions.map((opt) => (
            <Picker.Item key={opt.value ?? opt.label} label={opt.label ?? opt.value} value={opt.value ?? opt.label} />
          ))}
        </Picker>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { marginVertical: spacing.xs },
  label: { marginBottom: spacing.xs, fontWeight: '600', color: colors.text, fontSize: fontSizes.sm },
  pickerWrap: { borderWidth: 1, borderRadius: borderRadius.md, overflow: 'hidden', borderColor: colors.gray200, backgroundColor: colors.white },
  picker: { color: colors.text },
});

export default FilterDropdown;

