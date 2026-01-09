// Payment Form Modal with Receipt Upload

import React, { useState, useEffect } from 'react';
import {
    View,
    Text,
    StyleSheet,
    Modal,
    ScrollView,
    TouchableOpacity,
    TextInput,
    ActivityIndicator,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Picker } from '@react-native-picker/picker';
import * as DocumentPicker from 'expo-document-picker';

import { colors, spacing, borderRadius, fontSizes, shadows } from '../../context/ThemeContext';
import { showToast } from '../common/Toast';
import {
    createPayment,
    getAllBranches,
    getAllStudents,
    getAllUniversities,
} from '../../api/applicationApi';

const PaymentFormModal = ({ visible, onClose, onSuccess }) => {
    const [loading, setLoading] = useState(false);
    const [branches, setBranches] = useState([]);
    const [students, setStudents] = useState([]);
    const [universities, setUniversities] = useState([]);

    // Form fields
    const [branch, setBranch] = useState('');
    const [studentId, setStudentId] = useState('');
    const [whatsapp, setWhatsapp] = useState('');
    const [email, setEmail] = useState('');
    const [groupName, setGroupName] = useState('');
    const [university, setUniversity] = useState('');
    const [universityOther, setUniversityOther] = useState('');
    const [country, setCountry] = useState('');
    const [countryOther, setCountryOther] = useState('');
    const [paymentMethod, setPaymentMethod] = useState('');
    const [paymentMethodOther, setPaymentMethodOther] = useState('');
    const [paymentType, setPaymentType] = useState('');
    const [paymentTypeOther, setPaymentTypeOther] = useState('');
    const [file, setFile] = useState(null);
    const [assistant, setAssistant] = useState('');
    const [note, setNote] = useState('');

    // Fetch data
    useEffect(() => {
        if (visible) {
            fetchData();
        }
    }, [visible]);

    const fetchData = async () => {
        try {
            const [branchesData, studentsData, universitiesData] = await Promise.all([
                getAllBranches(),
                getAllStudents(),
                getAllUniversities(),
            ]);
            setBranches(branchesData);
            setStudents(studentsData);
            setUniversities(universitiesData);
        } catch (error) {
            console.error('Fetch data error:', error);
        }
    };

    // Auto-fill student data when student is selected
    useEffect(() => {
        if (studentId) {
            const student = students.find((s) => s.id.toString() === studentId);
            if (student) {
                setWhatsapp(student.phone_number || '');
                setEmail(student.email || '');
            }
        }
    }, [studentId, students]);

    // Handle file selection
    const handlePickFile = async () => {
        try {
            const result = await DocumentPicker.getDocumentAsync({
                type: '*/*',
                copyToCacheDirectory: true,
            });

            if (result.type === 'success' || !result.canceled) {
                const selectedFile = result.assets ? result.assets[0] : result;
                setFile(selectedFile);
                showToast.success('File Selected', selectedFile.name);
            }
        } catch (error) {
            console.error('File picker error:', error);
            showToast.error('Error', 'Failed to select file');
        }
    };

    // Handle submit
    const handleSubmit = async () => {
        // Validation
        if (!branch) {
            showToast.error('Validation', 'Please select a branch');
            return;
        }
        if (!studentId) {
            showToast.error('Validation', 'Please select a student');
            return;
        }
        if (!university) {
            showToast.error('Validation', 'Please select a university');
            return;
        }
        if (university === 'Other' && !universityOther) {
            showToast.error('Validation', 'Please enter university name');
            return;
        }
        if (!country) {
            showToast.error('Validation', 'Please select a country');
            return;
        }
        if (country === 'Other' && !countryOther) {
            showToast.error('Validation', 'Please enter country name');
            return;
        }
        if (!paymentMethod) {
            showToast.error('Validation', 'Please select payment method');
            return;
        }
        if (paymentMethod === 'Other' && !paymentMethodOther) {
            showToast.error('Validation', 'Please enter payment method');
            return;
        }
        if (!paymentType) {
            showToast.error('Validation', 'Please select payment type');
            return;
        }
        if (paymentType === 'Other' && !paymentTypeOther) {
            showToast.error('Validation', 'Please enter payment type');
            return;
        }
        if (!file) {
            showToast.error('Validation', 'Please upload payment proof');
            return;
        }

        setLoading(true);
        try {
            const formData = new FormData();
            formData.append('branch', branch);
            formData.append('name', studentId);
            formData.append('whatsapp', whatsapp);
            formData.append('email', email);
            formData.append('groupName', groupName);
            formData.append('university', university === 'Other' ? universityOther : university);
            formData.append('country', country === 'Other' ? countryOther : country);
            formData.append('paymentMethod', paymentMethod === 'Other' ? paymentMethodOther : paymentMethod);
            formData.append('paymentType', paymentType === 'Other' ? paymentTypeOther : paymentType);
            formData.append('assistant', assistant);
            formData.append('note', note);
            formData.append('file', {
                uri: file.uri,
                type: file.mimeType || 'application/octet-stream',
                name: file.name,
            });

            await createPayment(formData);
            showToast.success('Success', 'Payment created successfully');
            handleClose();
            if (onSuccess) onSuccess();
        } catch (error) {
            console.error('Create payment error:', error);
            showToast.error('Error', 'Failed to create payment');
        } finally {
            setLoading(false);
        }
    };

    // Reset form
    const handleClose = () => {
        setBranch('');
        setStudentId('');
        setWhatsapp('');
        setEmail('');
        setGroupName('');
        setUniversity('');
        setUniversityOther('');
        setCountry('');
        setCountryOther('');
        setPaymentMethod('');
        setPaymentMethodOther('');
        setPaymentType('');
        setPaymentTypeOther('');
        setFile(null);
        setAssistant('');
        setNote('');
        onClose();
    };

    const countries = [
        'USA', 'UK', 'Canada', 'Australia', 'Germany', 'France', 'Netherlands',
        'Sweden', 'Denmark', 'Norway', 'Singapore', 'New Zealand', 'Other'
    ];

    const paymentMethods = [
        'Bkash', 'Bkash to Bank', 'Bank Transfer', 'Cash', 'Bank Deposit', 'Other'
    ];

    const paymentTypes = [
        'File Opening Charge',
        'Application Fee',
        'After Offer Letter Charge',
        'Insurance Fee',
        'Bank Statement',
        'After Visa',
        'Accommodation',
        'Other'
    ];

    return (
        <Modal visible={visible} animationType="slide" presentationStyle="pageSheet">
            <View style={styles.container}>
                {/* Header */}
                <View style={styles.header}>
                    <TouchableOpacity onPress={handleClose} style={styles.headerButton}>
                        <Ionicons name="close" size={24} color={colors.text} />
                    </TouchableOpacity>
                    <Text style={styles.headerTitle}>Create Payment</Text>
                    <View style={{ width: 40 }} />
                </View>

                <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
                    {/* Branch */}
                    <Text style={styles.label}>Branch *</Text>
                    <View style={styles.pickerContainer}>
                        <Picker
                            selectedValue={branch}
                            onValueChange={(value) => setBranch(value)}
                            style={styles.picker}
                        >
                            <Picker.Item label="-- Select Branch --" value="" />
                            {branches.map((b) => (
                                <Picker.Item key={b.id} label={b.name} value={b.id.toString()} />
                            ))}
                        </Picker>
                    </View>

                    {/* Student */}
                    <Text style={styles.label}>Student Name *</Text>
                    <View style={styles.pickerContainer}>
                        <Picker
                            selectedValue={studentId}
                            onValueChange={(value) => setStudentId(value)}
                            style={styles.picker}
                        >
                            <Picker.Item label="-- Select Student --" value="" />
                            {students.map((s) => (
                                <Picker.Item key={s.id} label={s.name || s.email} value={s.id.toString()} />
                            ))}
                        </Picker>
                    </View>

                    {/* WhatsApp */}
                    <Text style={styles.label}>WhatsApp Number</Text>
                    <TextInput
                        style={styles.input}
                        placeholder="Enter WhatsApp number"
                        placeholderTextColor={colors.gray400}
                        value={whatsapp}
                        onChangeText={setWhatsapp}
                        keyboardType="phone-pad"
                    />

                    {/* Email */}
                    <Text style={styles.label}>Email</Text>
                    <TextInput
                        style={styles.input}
                        placeholder="Enter email"
                        placeholderTextColor={colors.gray400}
                        value={email}
                        onChangeText={setEmail}
                        keyboardType="email-address"
                        autoCapitalize="none"
                    />

                    {/* Group Name */}
                    <Text style={styles.label}>Group Name (Optional)</Text>
                    <TextInput
                        style={styles.input}
                        placeholder="Enter group name"
                        placeholderTextColor={colors.gray400}
                        value={groupName}
                        onChangeText={setGroupName}
                    />

                    {/* University */}
                    <Text style={styles.label}>University *</Text>
                    <View style={styles.pickerContainer}>
                        <Picker
                            selectedValue={university}
                            onValueChange={(value) => setUniversity(value)}
                            style={styles.picker}
                        >
                            <Picker.Item label="-- Select University --" value="" />
                            {universities.map((u) => (
                                <Picker.Item key={u.id} label={u.name} value={u.id.toString()} />
                            ))}
                            <Picker.Item label="Other" value="Other" />
                        </Picker>
                    </View>
                    {university === 'Other' && (
                        <TextInput
                            style={[styles.input, styles.inputMargin]}
                            placeholder="Enter university name"
                            placeholderTextColor={colors.gray400}
                            value={universityOther}
                            onChangeText={setUniversityOther}
                        />
                    )}

                    {/* Country */}
                    <Text style={styles.label}>Country *</Text>
                    <View style={styles.pickerContainer}>
                        <Picker
                            selectedValue={country}
                            onValueChange={(value) => setCountry(value)}
                            style={styles.picker}
                        >
                            <Picker.Item label="-- Select Country --" value="" />
                            {countries.map((c, idx) => (
                                <Picker.Item key={idx} label={c} value={c} />
                            ))}
                        </Picker>
                    </View>
                    {country === 'Other' && (
                        <TextInput
                            style={[styles.input, styles.inputMargin]}
                            placeholder="Enter country name"
                            placeholderTextColor={colors.gray400}
                            value={countryOther}
                            onChangeText={setCountryOther}
                        />
                    )}

                    {/* Payment Method */}
                    <Text style={styles.label}>Payment Method *</Text>
                    <View style={styles.pickerContainer}>
                        <Picker
                            selectedValue={paymentMethod}
                            onValueChange={(value) => setPaymentMethod(value)}
                            style={styles.picker}
                        >
                            <Picker.Item label="-- Select Payment Method --" value="" />
                            {paymentMethods.map((pm, idx) => (
                                <Picker.Item key={idx} label={pm} value={pm} />
                            ))}
                        </Picker>
                    </View>
                    {paymentMethod === 'Other' && (
                        <TextInput
                            style={[styles.input, styles.inputMargin]}
                            placeholder="Enter payment method"
                            placeholderTextColor={colors.gray400}
                            value={paymentMethodOther}
                            onChangeText={setPaymentMethodOther}
                        />
                    )}

                    {/* Payment Type */}
                    <Text style={styles.label}>Payment Type *</Text>
                    <View style={styles.pickerContainer}>
                        <Picker
                            selectedValue={paymentType}
                            onValueChange={(value) => setPaymentType(value)}
                            style={styles.picker}
                        >
                            <Picker.Item label="-- Select Payment Type --" value="" />
                            {paymentTypes.map((pt, idx) => (
                                <Picker.Item key={idx} label={pt} value={pt} />
                            ))}
                        </Picker>
                    </View>
                    {paymentType === 'Other' && (
                        <TextInput
                            style={[styles.input, styles.inputMargin]}
                            placeholder="Enter payment type"
                            placeholderTextColor={colors.gray400}
                            value={paymentTypeOther}
                            onChangeText={setPaymentTypeOther}
                        />
                    )}

                    {/* File Upload */}
                    <Text style={styles.label}>Upload Payment Proof *</Text>
                    <TouchableOpacity style={styles.fileButton} onPress={handlePickFile}>
                        <Ionicons name="cloud-upload-outline" size={24} color={colors.primary} />
                        <Text style={styles.fileButtonText}>
                            {file ? file.name : 'Select File'}
                        </Text>
                    </TouchableOpacity>

                    {/* Assistant */}
                    <Text style={styles.label}>Name of Assistant (Optional)</Text>
                    <TextInput
                        style={styles.input}
                        placeholder="Enter assistant name"
                        placeholderTextColor={colors.gray400}
                        value={assistant}
                        onChangeText={setAssistant}
                    />

                    {/* Note */}
                    <Text style={styles.label}>Note (Optional)</Text>
                    <TextInput
                        style={styles.textArea}
                        placeholder="Enter note"
                        placeholderTextColor={colors.gray400}
                        value={note}
                        onChangeText={setNote}
                        multiline
                        numberOfLines={4}
                        textAlignVertical="top"
                    />
                </ScrollView>

                {/* Footer */}
                <View style={styles.footer}>
                    <TouchableOpacity
                        style={[styles.submitButton, loading && styles.submitButtonDisabled]}
                        onPress={handleSubmit}
                        disabled={loading}
                    >
                        {loading ? (
                            <ActivityIndicator size="small" color={colors.white} />
                        ) : (
                            <Text style={styles.submitButtonText}>Create Payment</Text>
                        )}
                    </TouchableOpacity>
                </View>
            </View>
        </Modal>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: colors.background,
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: spacing.md,
        backgroundColor: colors.white,
        borderBottomWidth: 1,
        borderBottomColor: colors.gray100,
        ...shadows.sm,
    },
    headerButton: {
        padding: spacing.xs,
    },
    headerTitle: {
        fontSize: fontSizes.lg,
        fontWeight: '700',
        color: colors.text,
    },
    content: {
        flex: 1,
        padding: spacing.md,
    },
    label: {
        fontSize: fontSizes.sm,
        fontWeight: '600',
        color: colors.text,
        marginTop: spacing.md,
        marginBottom: spacing.xs,
    },
    pickerContainer: {
        borderWidth: 1,
        borderColor: colors.gray200,
        borderRadius: borderRadius.md,
        backgroundColor: colors.white,
    },
    picker: {
        height: 50,
    },
    input: {
        borderWidth: 1,
        borderColor: colors.gray200,
        borderRadius: borderRadius.md,
        padding: spacing.sm,
        backgroundColor: colors.white,
        fontSize: fontSizes.sm,
        color: colors.text,
    },
    inputMargin: {
        marginTop: spacing.xs,
    },
    textArea: {
        borderWidth: 1,
        borderColor: colors.gray200,
        borderRadius: borderRadius.md,
        padding: spacing.sm,
        backgroundColor: colors.white,
        fontSize: fontSizes.sm,
        color: colors.text,
        minHeight: 100,
    },
    fileButton: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        padding: spacing.md,
        backgroundColor: `${colors.primary}10`,
        borderRadius: borderRadius.md,
        borderWidth: 2,
        borderColor: colors.primary,
        borderStyle: 'dashed',
        gap: spacing.sm,
    },
    fileButtonText: {
        fontSize: fontSizes.sm,
        fontWeight: '600',
        color: colors.primary,
    },
    footer: {
        padding: spacing.md,
        backgroundColor: colors.white,
        borderTopWidth: 1,
        borderTopColor: colors.gray100,
        ...shadows.sm,
    },
    submitButton: {
        backgroundColor: colors.primary,
        padding: spacing.md,
        borderRadius: borderRadius.md,
        alignItems: 'center',
    },
    submitButtonDisabled: {
        opacity: 0.6,
    },
    submitButtonText: {
        fontSize: fontSizes.md,
        fontWeight: '600',
        color: colors.white,
    },
});

export default PaymentFormModal;
