import React from 'react';
import { Modal, View, Text, TouchableOpacity, ScrollView, StyleSheet } from 'react-native';
import { formatDateReadable } from '../../utils/formatting';
import { useTheme } from '../../context/ThemeContext';
import { Ionicons } from '@expo/vector-icons';

const getStatusColor = (status) => {
  if (!status) return '#6b7280';
  const s = status.toLowerCase();
  if (s.includes('new')) return '#3b82f6';
  if (s.includes('converted')) return '#10b981';
  if (s.includes('not') || s.includes('dropped')) return '#ef4444';
  return '#6b7280';
};

const Section = ({ title, children }) => (
  <View style={styles.section}>
    <Text style={styles.sectionTitle}>{title}</Text>
    {children}
  </View>
);

const Row = ({ label, value }) => (
  <View style={styles.row}>
    <Text style={styles.rowLabel}>{label}</Text>
    <Text style={styles.rowValue}>{value ?? '-'}</Text>
  </View>
);

const LeadDetailModal = ({ visible, lead, onClose }) => {
  const { colors } = useTheme();
  if (!lead) return null;

  let education = [];
  try {
    education = typeof lead.education_background === 'string' ? JSON.parse(lead.education_background) : lead.education_background || [];
  } catch (e) {
    education = lead.education_background || [];
  }

  return (
    <Modal visible={visible} animationType="slide" transparent>
      <View style={styles.overlay}>
        <View style={[styles.container, { backgroundColor: colors.card }]}> 
          <View style={styles.header}>
            <Text style={styles.title}>Lead Details</Text>
            <TouchableOpacity onPress={onClose}><Ionicons name="close" size={24} color={colors.text} /></TouchableOpacity>
          </View>

          <ScrollView style={styles.content}>
            <Section title="Personal Information">
              <Row label="Name" value={lead.name} />
              <Row label="Email" value={lead.email} />
              <Row label="Phone" value={lead.phone} />
              <Row label="Gender" value={lead.gender} />
              <Row label="DOB" value={lead.dob ? formatDateReadable(lead.dob) : ''} />
              <Row label="City" value={lead.city} />
              <Row label="Address" value={lead.address} />
            </Section>

            <Section title="Inquiry Details">
              <Row label="Inquiry Type" value={lead.inquiry_type || lead.lead_type} />
              <Row label="Source" value={lead.source} />
              <Row label="Branch" value={lead.branch} />
              <Row label="Country" value={lead.country} />
              <Row label="Course" value={lead.course_name} />
              <Row label="Status" value={lead.status} />
              <Row label="Payment Status" value={lead.payment_status} />
              <Row label="Eligibility" value={lead.eligibility_status} />
              <Row label="Follow Up Date" value={lead.follow_up_date ? formatDateReadable(lead.follow_up_date) : ''} />
              <Row label="Next Follow Up" value={lead.next_followup_date ? formatDateReadable(lead.next_followup_date) : ''} />
              <Row label="Date of Inquiry" value={lead.inquiry_date ? formatDateReadable(lead.inquiry_date) : lead.created_at ? formatDateReadable(lead.created_at) : ''} />
              <Row label="Updated At" value={lead.updated_at ? formatDateReadable(lead.updated_at) : ''} />
            </Section>

            <Section title="Education Background">
              {Array.isArray(education) && education.length ? (
                education.map((ed, idx) => (
                  <View key={idx} style={{ marginBottom: 8 }}>
                    <Text style={{ fontWeight: '700' }}>{ed.level || ed.degree || `Education ${idx + 1}`}</Text>
                    <Text>{ed.institution ? `${ed.institution} · ${ed.year || ''}` : ''}</Text>
                    <Text>{ed.gpa ? `GPA: ${ed.gpa}` : ''}</Text>
                  </View>
                ))
              ) : (
                <Text>No education details</Text>
              )}
              {lead.visa_refused === 'yes' ? <Row label="Visa Refused Reason" value={lead.refusal_reason} /> : null}
            </Section>

            <Section title="English Proficiency">
              <Row label="Test" value={lead.english_test} />
              <Row label="Overall" value={lead.english_overall_score} />
              <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginTop: 6 }}>
                <View style={{ flex: 1 }}><Text style={styles.smallLabel}>Reading</Text><Text>{lead.english_reading ?? '-'}</Text></View>
                <View style={{ flex: 1 }}><Text style={styles.smallLabel}>Writing</Text><Text>{lead.english_writing ?? '-'}</Text></View>
                <View style={{ flex: 1 }}><Text style={styles.smallLabel}>Speaking</Text><Text>{lead.english_speaking ?? '-'}</Text></View>
                <View style={{ flex: 1 }}><Text style={styles.smallLabel}>Listening</Text><Text>{lead.english_listening ?? '-'}</Text></View>
              </View>
            </Section>

            <Section title="Work Experience">
              <Row label="Company" value={lead.company_name} />
              <Row label="Job Title" value={lead.job_title} />
              <Row label="Duration" value={lead.job_duration} />
            </Section>

            <Section title="Additional Info">
              <Row label="Counselor" value={lead.counselor_name} />
              <Row label="Notes" value={lead.notes} />
            </Section>

          </ScrollView>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: { flex: 1, justifyContent: 'flex-end', backgroundColor: 'rgba(0,0,0,0.4)' },
  container: { maxHeight: '85%', borderTopLeftRadius: 12, borderTopRightRadius: 12, padding: 12 },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 },
  title: { fontSize: 18, fontWeight: '700' },
  content: { },
  section: { padding: 10, borderRadius: 8, backgroundColor: '#f8fafc', marginBottom: 10 },
  sectionTitle: { fontWeight: '700', marginBottom: 6 },
  row: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 6 },
  rowLabel: { fontWeight: '600', color: '#374151' },
  rowValue: { color: '#111827', maxWidth: '65%', textAlign: 'right' },
  smallLabel: { fontWeight: '600', marginBottom: 4 },
});

export default LeadDetailModal;
