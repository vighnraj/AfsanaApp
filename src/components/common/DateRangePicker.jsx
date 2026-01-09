import React, { useState } from 'react';
import { View, Text, TouchableOpacity, Platform, StyleSheet } from 'react-native';
import DateTimePicker from '@react-native-community/datetimepicker';
import { formatDateReadable } from '../../utils/formatting';
import { useTheme } from '../../context/ThemeContext';

const DateRangePicker = ({ label, startDate, endDate, onStartDateChange, onEndDateChange }) => {
  const { colors, fontSizes } = useTheme();
  const [showStart, setShowStart] = useState(false);
  const [showEnd, setShowEnd] = useState(false);

  const onChangeStart = (event, selectedDate) => {
    setShowStart(Platform.OS === 'ios');
    if (selectedDate) onStartDateChange(selectedDate.toISOString());
  };

  const onChangeEnd = (event, selectedDate) => {
    setShowEnd(Platform.OS === 'ios');
    if (selectedDate) onEndDateChange(selectedDate.toISOString());
  };

  return (
    <View style={styles.container}>
      {label ? <Text style={[styles.label, { color: colors.text, fontSize: fontSizes.small }]}>{label}</Text> : null}
      <View style={styles.row}>
        <TouchableOpacity style={[styles.input, { borderColor: colors.border }]} onPress={() => setShowStart(true)}>
          <Text style={{ color: startDate ? colors.text : colors.muted }}>{startDate ? formatDateReadable(startDate) : 'From'}</Text>
        </TouchableOpacity>
        <TouchableOpacity style={[styles.input, { borderColor: colors.border }]} onPress={() => setShowEnd(true)}>
          <Text style={{ color: endDate ? colors.text : colors.muted }}>{endDate ? formatDateReadable(endDate) : 'To'}</Text>
        </TouchableOpacity>
      </View>

      {showStart && (
        <DateTimePicker
          value={startDate ? new Date(startDate) : new Date()}
          mode="date"
          display={Platform.OS === 'ios' ? 'spinner' : 'default'}
          onChange={onChangeStart}
        />
      )}

      {showEnd && (
        <DateTimePicker
          value={endDate ? new Date(endDate) : new Date()}
          mode="date"
          display={Platform.OS === 'ios' ? 'spinner' : 'default'}
          onChange={onChangeEnd}
        />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: { marginVertical: 6 },
  label: { marginBottom: 6, fontWeight: '600' },
  row: { flexDirection: 'row', justifyContent: 'space-between' },
  input: { flex: 1, padding: 10, borderWidth: 1, borderRadius: 6, marginRight: 8, backgroundColor: '#fff' },
});

export default DateRangePicker;
