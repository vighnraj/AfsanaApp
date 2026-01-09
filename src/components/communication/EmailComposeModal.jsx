// Email Compose Modal Component

import React, { useState } from 'react';
import {
    View,
    Text,
    StyleSheet,
    Modal,
    TextInput,
    TouchableOpacity,
    ScrollView,
    ActivityIndicator,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import * as DocumentPicker from 'expo-document-picker';

import { colors, spacing, borderRadius, fontSizes, shadows } from '../../context/ThemeContext';
import { showToast } from '../common/Toast';

const EmailComposeModal = ({ visible, onClose, recipient = '', onSend }) => {
    const [to, setTo] = useState(recipient);
    const [cc, setCc] = useState('');
    const [bcc, setBcc] = useState('');
    const [subject, setSubject] = useState('');
    const [body, setBody] = useState('');
    const [attachments, setAttachments] = useState([]);
    const [showCc, setShowCc] = useState(false);
    const [showBcc, setShowBcc] = useState(false);
    const [sending, setSending] = useState(false);

    // Reset form
    const resetForm = () => {
        setTo(recipient);
        setCc('');
        setBcc('');
        setSubject('');
        setBody('');
        setAttachments([]);
        setShowCc(false);
        setShowBcc(false);
        setSending(false);
    };

    // Handle close
    const handleClose = () => {
        if (to || subject || body || attachments.length > 0) {
            // Show confirmation dialog
            showToast.info('Draft Discarded', 'Your email draft was not saved');
        }
        resetForm();
        onClose();
    };

    // Pick attachment
    const handlePickAttachment = async () => {
        try {
            const result = await DocumentPicker.getDocumentAsync({
                type: '*/*',
                copyToCacheDirectory: true,
                multiple: true,
            });

            if (result.type === 'success' || !result.canceled) {
                const files = result.assets || [result];
                const newAttachments = files.map(file => ({
                    uri: file.uri,
                    name: file.name || 'attachment',
                    mimeType: file.mimeType || 'application/octet-stream',
                    size: file.size,
                }));
                setAttachments([...attachments, ...newAttachments]);
                showToast.success('Added', `${newAttachments.length} file(s) attached`);
            }
        } catch (error) {
            console.error('Document picker error:', error);
            showToast.error('Error', 'Failed to attach file');
        }
    };

    // Remove attachment
    const handleRemoveAttachment = (index) => {
        setAttachments(attachments.filter((_, i) => i !== index));
    };

    // Send email
    const handleSend = async () => {
        // Validation
        if (!to.trim()) {
            showToast.error('Validation', 'Recipient email is required');
            return;
        }

        if (!subject.trim()) {
            showToast.error('Validation', 'Subject is required');
            return;
        }

        if (!body.trim()) {
            showToast.error('Validation', 'Email body is required');
            return;
        }

        setSending(true);
        try {
            const emailData = {
                to: to.trim(),
                cc: cc.trim(),
                bcc: bcc.trim(),
                subject: subject.trim(),
                body: body.trim(),
                attachments,
            };

            if (onSend) {
                await onSend(emailData);
            }

            showToast.success('Sent', 'Email sent successfully');
            resetForm();
            onClose();
        } catch (error) {
            console.error('Send email error:', error);
            showToast.error('Error', 'Failed to send email');
        } finally {
            setSending(false);
        }
    };

    // Format file size
    const formatFileSize = (bytes) => {
        if (!bytes) return '0 B';
        const k = 1024;
        const sizes = ['B', 'KB', 'MB', 'GB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        return `${parseFloat((bytes / Math.pow(k, i)).toFixed(2))} ${sizes[i]}`;
    };

    return (
        <Modal
            visible={visible}
            animationType="slide"
            presentationStyle="pageSheet"
            onRequestClose={handleClose}
        >
            <View style={styles.container}>
                {/* Header */}
                <View style={styles.header}>
                    <TouchableOpacity onPress={handleClose} style={styles.headerButton}>
                        <Ionicons name="close" size={24} color={colors.text} />
                    </TouchableOpacity>
                    <Text style={styles.headerTitle}>New Email</Text>
                    <TouchableOpacity
                        onPress={handleSend}
                        style={[styles.headerButton, styles.sendHeaderButton]}
                        disabled={sending}
                    >
                        {sending ? (
                            <ActivityIndicator size="small" color={colors.primary} />
                        ) : (
                            <Ionicons name="send" size={20} color={colors.primary} />
                        )}
                    </TouchableOpacity>
                </View>

                <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
                    {/* To */}
                    <View style={styles.fieldContainer}>
                        <Text style={styles.fieldLabel}>To:</Text>
                        <TextInput
                            style={styles.fieldInput}
                            placeholder="recipient@example.com"
                            placeholderTextColor={colors.gray400}
                            value={to}
                            onChangeText={setTo}
                            keyboardType="email-address"
                            autoCapitalize="none"
                            autoCorrect={false}
                        />
                    </View>

                    {/* CC/BCC Buttons */}
                    {!showCc && !showBcc && (
                        <View style={styles.additionalFieldsButtons}>
                            <TouchableOpacity onPress={() => setShowCc(true)} style={styles.additionalFieldButton}>
                                <Text style={styles.additionalFieldButtonText}>Add Cc</Text>
                            </TouchableOpacity>
                            <TouchableOpacity onPress={() => setShowBcc(true)} style={styles.additionalFieldButton}>
                                <Text style={styles.additionalFieldButtonText}>Add Bcc</Text>
                            </TouchableOpacity>
                        </View>
                    )}

                    {/* Cc */}
                    {showCc && (
                        <View style={styles.fieldContainer}>
                            <Text style={styles.fieldLabel}>Cc:</Text>
                            <TextInput
                                style={styles.fieldInput}
                                placeholder="cc@example.com"
                                placeholderTextColor={colors.gray400}
                                value={cc}
                                onChangeText={setCc}
                                keyboardType="email-address"
                                autoCapitalize="none"
                                autoCorrect={false}
                            />
                        </View>
                    )}

                    {/* Bcc */}
                    {showBcc && (
                        <View style={styles.fieldContainer}>
                            <Text style={styles.fieldLabel}>Bcc:</Text>
                            <TextInput
                                style={styles.fieldInput}
                                placeholder="bcc@example.com"
                                placeholderTextColor={colors.gray400}
                                value={bcc}
                                onChangeText={setBcc}
                                keyboardType="email-address"
                                autoCapitalize="none"
                                autoCorrect={false}
                            />
                        </View>
                    )}

                    {/* Subject */}
                    <View style={styles.fieldContainer}>
                        <Text style={styles.fieldLabel}>Subject:</Text>
                        <TextInput
                            style={styles.fieldInput}
                            placeholder="Email subject"
                            placeholderTextColor={colors.gray400}
                            value={subject}
                            onChangeText={setSubject}
                            autoCapitalize="sentences"
                        />
                    </View>

                    {/* Attachments */}
                    {attachments.length > 0 && (
                        <View style={styles.attachmentsContainer}>
                            <Text style={styles.attachmentsLabel}>
                                Attachments ({attachments.length})
                            </Text>
                            {attachments.map((file, index) => (
                                <View key={index} style={styles.attachmentItem}>
                                    <View style={styles.attachmentInfo}>
                                        <Ionicons name="document-attach" size={20} color={colors.primary} />
                                        <View style={styles.attachmentText}>
                                            <Text style={styles.attachmentName} numberOfLines={1}>
                                                {file.name}
                                            </Text>
                                            <Text style={styles.attachmentSize}>
                                                {formatFileSize(file.size)}
                                            </Text>
                                        </View>
                                    </View>
                                    <TouchableOpacity onPress={() => handleRemoveAttachment(index)}>
                                        <Ionicons name="close-circle" size={24} color={colors.error} />
                                    </TouchableOpacity>
                                </View>
                            ))}
                        </View>
                    )}

                    {/* Body */}
                    <View style={styles.bodyContainer}>
                        <TextInput
                            style={styles.bodyInput}
                            placeholder="Compose your email..."
                            placeholderTextColor={colors.gray400}
                            value={body}
                            onChangeText={setBody}
                            multiline
                            textAlignVertical="top"
                            autoCapitalize="sentences"
                        />
                    </View>
                </ScrollView>

                {/* Footer with actions */}
                <View style={styles.footer}>
                    <TouchableOpacity onPress={handlePickAttachment} style={styles.footerButton}>
                        <Ionicons name="attach" size={24} color={colors.text} />
                        <Text style={styles.footerButtonText}>Attach</Text>
                    </TouchableOpacity>

                    <TouchableOpacity
                        onPress={handleSend}
                        style={[styles.sendButton, sending && styles.sendButtonDisabled]}
                        disabled={sending}
                    >
                        {sending ? (
                            <ActivityIndicator size="small" color={colors.white} />
                        ) : (
                            <>
                                <Ionicons name="send" size={20} color={colors.white} />
                                <Text style={styles.sendButtonText}>Send Email</Text>
                            </>
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
    sendHeaderButton: {
        backgroundColor: `${colors.primary}10`,
        borderRadius: borderRadius.md,
        paddingHorizontal: spacing.sm,
    },
    headerTitle: {
        fontSize: fontSizes.lg,
        fontWeight: '700',
        color: colors.text,
    },
    content: {
        flex: 1,
    },
    fieldContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: spacing.md,
        paddingVertical: spacing.sm,
        backgroundColor: colors.white,
        borderBottomWidth: 1,
        borderBottomColor: colors.gray100,
    },
    fieldLabel: {
        fontSize: fontSizes.md,
        fontWeight: '600',
        color: colors.textSecondary,
        width: 60,
    },
    fieldInput: {
        flex: 1,
        fontSize: fontSizes.md,
        color: colors.text,
        padding: 0,
    },
    additionalFieldsButtons: {
        flexDirection: 'row',
        paddingHorizontal: spacing.md,
        paddingVertical: spacing.sm,
        backgroundColor: colors.white,
        borderBottomWidth: 1,
        borderBottomColor: colors.gray100,
    },
    additionalFieldButton: {
        marginRight: spacing.md,
    },
    additionalFieldButtonText: {
        fontSize: fontSizes.sm,
        color: colors.primary,
        fontWeight: '600',
    },
    attachmentsContainer: {
        padding: spacing.md,
        backgroundColor: colors.white,
        borderBottomWidth: 1,
        borderBottomColor: colors.gray100,
    },
    attachmentsLabel: {
        fontSize: fontSizes.sm,
        fontWeight: '600',
        color: colors.textSecondary,
        marginBottom: spacing.xs,
    },
    attachmentItem: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingVertical: spacing.xs,
        paddingHorizontal: spacing.sm,
        backgroundColor: colors.gray50,
        borderRadius: borderRadius.md,
        marginTop: spacing.xs,
    },
    attachmentInfo: {
        flexDirection: 'row',
        alignItems: 'center',
        flex: 1,
    },
    attachmentText: {
        marginLeft: spacing.sm,
        flex: 1,
    },
    attachmentName: {
        fontSize: fontSizes.sm,
        color: colors.text,
        fontWeight: '500',
    },
    attachmentSize: {
        fontSize: fontSizes.xs,
        color: colors.textSecondary,
        marginTop: 2,
    },
    bodyContainer: {
        flex: 1,
        backgroundColor: colors.white,
        marginTop: spacing.xs,
    },
    bodyInput: {
        flex: 1,
        padding: spacing.md,
        fontSize: fontSizes.md,
        color: colors.text,
        minHeight: 300,
    },
    footer: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: spacing.md,
        backgroundColor: colors.white,
        borderTopWidth: 1,
        borderTopColor: colors.gray100,
        ...shadows.sm,
    },
    footerButton: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: spacing.sm,
    },
    footerButtonText: {
        fontSize: fontSizes.sm,
        color: colors.text,
        marginLeft: spacing.xs,
        fontWeight: '500',
    },
    sendButton: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: colors.primary,
        paddingVertical: spacing.sm,
        paddingHorizontal: spacing.lg,
        borderRadius: borderRadius.md,
    },
    sendButtonDisabled: {
        opacity: 0.6,
    },
    sendButtonText: {
        fontSize: fontSizes.md,
        fontWeight: '600',
        color: colors.white,
        marginLeft: spacing.xs,
    },
});

export default EmailComposeModal;
