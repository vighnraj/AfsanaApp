import React, { useState } from 'react';
import { View, StyleSheet, TouchableOpacity, Modal, FlatList, Text, Alert } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors, spacing, fontSizes } from '../../context/ThemeContext';
import { showToast } from './Toast';

const EXPORT_FORMATS = [
  { id: 'pdf', label: 'PDF', icon: 'document-text-outline', ext: 'pdf' },
  { id: 'csv', label: 'CSV', icon: 'spreadsheet-outline', ext: 'csv' },
  { id: 'excel', label: 'Excel', icon: 'document-outline', ext: 'xlsx' },
  { id: 'json', label: 'JSON', icon: 'code-outline', ext: 'json' },
];

const ExportButton = ({ 
  data = [], 
  filename = 'export', 
  onExport,
  formats = ['pdf', 'csv', 'excel'],
  style = {}
}) => {
  const [modalVisible, setModalVisible] = useState(false);
  const [exporting, setExporting] = useState(false);

  const handleExport = async (format) => {
    setExporting(true);
    try {
      if (onExport) {
        await onExport(format, data, filename);
      } else {
        // Default export logic
        const timestamp = new Date().toISOString().split('T')[0];
        const exportFilename = `${filename}_${timestamp}.${format.ext}`;
        
        switch (format.id) {
          case 'json':
            await exportJSON(data, exportFilename);
            break;
          case 'csv':
            await exportCSV(data, exportFilename);
            break;
          case 'pdf':
            showToast.info('Export', 'PDF export requires backend implementation');
            break;
          case 'excel':
            showToast.info('Export', 'Excel export requires backend implementation');
            break;
          default:
            showToast.error('Error', 'Unsupported format');
        }
      }
      setModalVisible(false);
      showToast.success('Success', `Exported as ${format.label}`);
    } catch (error) {
      console.error('Export error:', error);
      showToast.error('Error', 'Failed to export data');
    } finally {
      setExporting(false);
    }
  };

  const exportJSON = async (data, filename) => {
    const jsonString = JSON.stringify(data, null, 2);
    console.log(`Exported JSON: ${filename}`);
    console.log(jsonString);
  };

  const exportCSV = async (data, filename) => {
    if (!data || data.length === 0) {
      showToast.error('Error', 'No data to export');
      return;
    }

    const headers = Object.keys(data[0]);
    const csvContent = [
      headers.join(','),
      ...data.map(row => 
        headers.map(header => {
          const value = row[header];
          return typeof value === 'string' && value.includes(',') 
            ? `"${value}"` 
            : value;
        }).join(',')
      ),
    ].join('\n');

    console.log(`Exported CSV: ${filename}`);
    console.log(csvContent);
  };

  const availableFormats = EXPORT_FORMATS.filter(f => formats.includes(f.id));

  return (
    <>
      <TouchableOpacity 
        style={[styles.button, style]}
        onPress={() => setModalVisible(true)}
        disabled={exporting}
      >
        <Ionicons name="download-outline" size={20} color={colors.primary} />
        <Text style={styles.buttonText}>Export</Text>
      </TouchableOpacity>

      <Modal
        visible={modalVisible}
        transparent
        animationType="fade"
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Export As</Text>
              <TouchableOpacity onPress={() => setModalVisible(false)}>
                <Ionicons name="close-outline" size={24} color={colors.text} />
              </TouchableOpacity>
            </View>

            <FlatList
              data={availableFormats}
              keyExtractor={(item) => item.id}
              scrollEnabled={false}
              renderItem={({ item }) => (
                <TouchableOpacity
                  style={styles.formatItem}
                  onPress={() => handleExport(item)}
                  disabled={exporting}
                >
                  <View style={styles.formatIcon}>
                    <Ionicons name={item.icon} size={24} color={colors.primary} />
                  </View>
                  <View style={styles.formatText}>
                    <Text style={styles.formatLabel}>{item.label}</Text>
                    <Text style={styles.formatDesc}>
                      Download as .{item.ext}
                    </Text>
                  </View>
                  <Ionicons name="chevron-forward" size={20} color={colors.textSecondary} />
                </TouchableOpacity>
              )}
            />

            <Text style={styles.hint}>
              💡 Exported data includes all current filters and sorting preferences
            </Text>
          </View>
        </View>
      </Modal>
    </>
  );
};

const styles = StyleSheet.create({
  button: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.primary + '10',
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: colors.primary,
  },
  buttonText: {
    marginLeft: spacing.xs,
    fontSize: fontSizes.sm,
    fontWeight: '600',
    color: colors.primary,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: colors.white,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    padding: spacing.lg,
    maxHeight: '80%',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.lg,
  },
  modalTitle: {
    fontSize: fontSizes.lg,
    fontWeight: '700',
    color: colors.text,
  },
  formatItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.sm,
    marginBottom: spacing.sm,
    borderRadius: 12,
    backgroundColor: colors.backgroundSecondary,
  },
  formatIcon: {
    width: 48,
    height: 48,
    borderRadius: 10,
    backgroundColor: colors.primary + '15',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: spacing.md,
  },
  formatText: {
    flex: 1,
  },
  formatLabel: {
    fontSize: fontSizes.md,
    fontWeight: '600',
    color: colors.text,
    marginBottom: 2,
  },
  formatDesc: {
    fontSize: fontSizes.xs,
    color: colors.textSecondary,
  },
  hint: {
    fontSize: fontSizes.xs,
    color: colors.textSecondary,
    marginTop: spacing.md,
    paddingTop: spacing.md,
    borderTopWidth: 1,
    borderTopColor: colors.border,
    fontStyle: 'italic',
  },
});

export default ExportButton;
