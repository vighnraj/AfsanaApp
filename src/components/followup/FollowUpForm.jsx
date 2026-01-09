// Follow-Up Form Component
import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import DateTimePicker from '@react-native-community/datetimepicker';
import { Dropdown } from 'react-native-element-dropdown';
import { colors, spacing, fontSizes } from '../../context/ThemeContext';
import { Input, Button } from '../common';

const FOLLOWUP_TYPES = [
  { label: 'Call', value: 'call' },
  { label: 'Email', value: 'email' },
  { label: 'WhatsApp', value: 'whatsapp' },
  { label: 'Meeting', value: 'meeting' },
  { label: 'Office Visit', value: 'visit' },
];

const PRIORITY_OPTIONS = [
  { label: 'Low', value: 'low' },
  { label: 'Medium', value: 'medium' },
  { label: 'High', value: 'high' },
  { label: 'Urgent', value: 'urgent' },
];

const FollowUpForm = ({ initialData = {}, onSubmit, onCancel }) => {
  const [formData, setFormData] = useState({
    type: initialData.type || 'call',
    scheduled_date: initialData.scheduled_date ? new Date(initialData.scheduled_date) : new Date(),
    notes: initialData.notes || '',
    priority: initialData.priority || 'medium',
    status: initialData.status || 'scheduled',
  });

  const [showDatePicker, setShowDatePicker] = useState(false);
  const [showTimePicker, setShowTimePicker] = useState(false);

  const updateField = (field, value) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleDateChange = (event, selectedDate) => {
    setShowDatePicker(false);
    if (selectedDate) {
      updateField('scheduled_date', selectedDate);
    }
  };

  const handleTimeChange = (event, selectedTime) => {
    setShowTimePicker(false);
    if (selectedTime) {
      const newDate = new Date(formData.scheduled_date);
      newDate.setHours(selectedTime.getHours());
      newDate.setMinutes(selectedTime.getMinutes());
      updateField('scheduled_date', newDate);
    }
  };

  const handleSubmit = () => {
    if (!formData.type || !formData.scheduled_date) {
      alert('Please fill in all required fields');
      return;
    }
    onSubmit(formData);
  };

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      {/* Follow-up Type */}
      <View style={styles.field}>
        <Text style={styles.label}>Follow-up Type *</Text>
        <Dropdown
          style={styles.dropdown}
          data={FOLLOWUP_TYPES}
          labelField="label"
          valueField="value"
          placeholder="Select type"
          value={formData.type}
          onChange={(item) => updateField('type', item.value)}
          renderLeftIcon={() => (
            <Ionicons name="list-outline" size={20} color={colors.textSecondary} />
          )}
        />
      </View>

      {/* Date & Time */}
      <View style={styles.field}>
        <Text style={styles.label}>Scheduled Date & Time *</Text>
        <View style={styles.dateTimeContainer}>
          <TouchableOpacity style={styles.dateButton} onPress={() => setShowDatePicker(true)}>
            <Ionicons name="calendar-outline" size={20} color={colors.primary} />
            <Text style={styles.dateText}>
              {formData.scheduled_date.toLocaleDateString()}
            </Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.dateButton} onPress={() => setShowTimePicker(true)}>
            <Ionicons name="time-outline" size={20} color={colors.primary} />
            <Text style={styles.dateText}>
              {formData.scheduled_date.toLocaleTimeString([], {
                hour: '2-digit',
                minute: '2-digit',
              })}
            </Text>
          </TouchableOpacity>
        </View>

        {showDatePicker && (
          <DateTimePicker
            value={formData.scheduled_date}
            mode="date"
            display="default"
            onChange={handleDateChange}
          />
        )}

        {showTimePicker && (
          <DateTimePicker
            value={formData.scheduled_date}
            mode="time"
            display="default"
            onChange={handleTimeChange}
          />
        )}
      </View>

      {/* Priority */}
      <View style={styles.field}>
        <Text style={styles.label}>Priority</Text>
        <Dropdown
          style={styles.dropdown}
          data={PRIORITY_OPTIONS}
          labelField="label"
          valueField="value"
          placeholder="Select priority"
          value={formData.priority}
          onChange={(item) => updateField('priority', item.value)}
          renderLeftIcon={() => (
            <Ionicons name="flag-outline" size={20} color={colors.textSecondary} />
          )}
        />
      </View>

      {/* Notes */}
      <View style={styles.field}>
        <Text style={styles.label}>Notes / Agenda</Text>
        <Input
          value={formData.notes}
          onChangeText={(text) => updateField('notes', text)}
          placeholder="Enter notes or agenda for this follow-up..."
          multiline
          numberOfLines={4}
          style={styles.notesInput}
        />
      </View>

      {/* Actions */}
      <View style={styles.actions}>
        {onCancel && (
          <Button
            title="Cancel"
            variant="outline"
            onPress={onCancel}
            style={styles.button}
          />
        )}
        <Button
          title={initialData.id ? 'Update' : 'Create'}
          onPress={handleSubmit}
          style={styles.button}
        />
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  field: {
    marginBottom: spacing.lg,
  },
  label: {
    fontSize: fontSizes.md,
    fontWeight: '600',
    color: colors.text,
    marginBottom: spacing.xs,
  },
  dropdown: {
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 8,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    backgroundColor: colors.white,
  },
  dateTimeContainer: {
    flexDirection: 'row',
    gap: spacing.sm,
  },
  dateButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 8,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.md,
    backgroundColor: colors.white,
  },
  dateText: {
    fontSize: fontSizes.md,
    color: colors.text,
    marginLeft: spacing.sm,
  },
  notesInput: {
    height: 100,
    textAlignVertical: 'top',
  },
  actions: {
    flexDirection: 'row',
    marginTop: spacing.lg,
    gap: spacing.sm,
  },
  button: {
    flex: 1,
  },
});

export default FollowUpForm;
