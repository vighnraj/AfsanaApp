// Modal Component

import React from 'react';
import {
    View,
    Text,
    StyleSheet,
    TouchableOpacity,
    Modal as RNModal,
    ScrollView,
    KeyboardAvoidingView,
    Platform,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors, spacing, borderRadius, fontSizes, shadows } from '../../context/ThemeContext';

const Modal = ({
    visible,
    onClose,
    title,
    children,
    footer,
    size = 'md', // 'sm', 'md', 'lg', 'full'
    closeOnBackdrop = true,
    showCloseButton = true,
    animationType = 'fade',
}) => {
    const getModalSize = () => {
        switch (size) {
            case 'sm':
                return { width: '75%', maxHeight: '50%' };
            case 'lg':
                return { width: '95%', maxHeight: '85%' };
            case 'full':
                return { width: '100%', height: '100%', borderRadius: 0 };
            default: // md
                return { width: '90%', maxHeight: '70%' };
        }
    };

    const sizeStyles = getModalSize();

    const handleBackdropPress = () => {
        if (closeOnBackdrop) {
            onClose();
        }
    };

    return (
        <RNModal
            visible={visible}
            transparent
            animationType={animationType}
            onRequestClose={onClose}
        >
            <KeyboardAvoidingView
                behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
                style={styles.keyboardView}
            >
                <TouchableOpacity
                    style={styles.backdrop}
                    activeOpacity={1}
                    onPress={handleBackdropPress}
                >
                    <TouchableOpacity
                        activeOpacity={1}
                        style={[
                            styles.container,
                            sizeStyles,
                            size !== 'full' && shadows.lg,
                        ]}
                        onPress={() => { }} // Prevent backdrop press
                    >
                        {/* Header */}
                        {(title || showCloseButton) && (
                            <View style={styles.header}>
                                <Text style={styles.title} numberOfLines={1}>
                                    {title}
                                </Text>
                                {showCloseButton && (
                                    <TouchableOpacity
                                        onPress={onClose}
                                        style={styles.closeButton}
                                        hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
                                    >
                                        <Ionicons name="close" size={24} color={colors.gray500} />
                                    </TouchableOpacity>
                                )}
                            </View>
                        )}

                        {/* Content */}
                        <ScrollView
                            style={styles.scrollView}
                            contentContainerStyle={styles.content}
                            showsVerticalScrollIndicator={false}
                        >
                            {children}
                        </ScrollView>

                        {/* Footer */}
                        {footer && <View style={styles.footer}>{footer}</View>}
                    </TouchableOpacity>
                </TouchableOpacity>
            </KeyboardAvoidingView>
        </RNModal>
    );
};

// Confirm Modal
export const ConfirmModal = ({
    visible,
    onClose,
    onConfirm,
    title = 'Confirm',
    message,
    confirmText = 'Confirm',
    cancelText = 'Cancel',
    confirmVariant = 'primary', // 'primary', 'danger'
    loading = false,
}) => {
    const confirmButtonStyle = confirmVariant === 'danger'
        ? styles.dangerButton
        : styles.primaryButton;

    return (
        <Modal
            visible={visible}
            onClose={onClose}
            title={title}
            size="sm"
            footer={
                <View style={styles.confirmFooter}>
                    <TouchableOpacity
                        style={[styles.footerButton, styles.cancelButton]}
                        onPress={onClose}
                        disabled={loading}
                    >
                        <Text style={styles.cancelButtonText}>{cancelText}</Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                        style={[styles.footerButton, confirmButtonStyle]}
                        onPress={onConfirm}
                        disabled={loading}
                    >
                        <Text style={styles.confirmButtonText}>{confirmText}</Text>
                    </TouchableOpacity>
                </View>
            }
        >
            <Text style={styles.confirmMessage}>{message}</Text>
        </Modal>
    );
};

const styles = StyleSheet.create({
    keyboardView: {
        flex: 1,
    },
    backdrop: {
        flex: 1,
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
        justifyContent: 'center',
        alignItems: 'center',
    },
    container: {
        backgroundColor: colors.white,
        borderRadius: borderRadius.lg,
        overflow: 'hidden',
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: spacing.md,
        paddingVertical: spacing.sm,
        borderBottomWidth: 1,
        borderBottomColor: colors.gray100,
    },
    title: {
        fontSize: fontSizes.lg,
        fontWeight: '600',
        color: colors.text,
        flex: 1,
    },
    closeButton: {
        padding: spacing.xs,
    },
    scrollView: {
        flexGrow: 0,
    },
    content: {
        padding: spacing.md,
    },
    footer: {
        borderTopWidth: 1,
        borderTopColor: colors.gray100,
        padding: spacing.md,
    },
    confirmFooter: {
        flexDirection: 'row',
        justifyContent: 'flex-end',
        gap: spacing.sm,
    },
    footerButton: {
        paddingVertical: spacing.sm,
        paddingHorizontal: spacing.lg,
        borderRadius: borderRadius.md,
        minWidth: 80,
        alignItems: 'center',
    },
    cancelButton: {
        backgroundColor: colors.gray100,
    },
    cancelButtonText: {
        color: colors.textSecondary,
        fontWeight: '500',
    },
    primaryButton: {
        backgroundColor: colors.primary,
    },
    dangerButton: {
        backgroundColor: colors.danger,
    },
    confirmButtonText: {
        color: colors.white,
        fontWeight: '600',
    },
    confirmMessage: {
        fontSize: fontSizes.md,
        color: colors.textSecondary,
        textAlign: 'center',
    },
});

export default Modal;
