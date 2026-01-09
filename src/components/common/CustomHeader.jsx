import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Platform } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { colors, shadows, fontSizes, spacing, borderRadius } from '../../context/ThemeContext';

/**
 * Custom Header Component
 * @param {string} title - Header title
 * @param {string} subtitle - Optional subtitle
 * @param {boolean} showBack - Show back button (default: false)
 * @param {function} onBack - Custom back handler (optional)
 * @param {React.Node} rightAction - Custom right side component (optional)
 * @param {boolean} transparent - Transparent background (default: false)
 * @param {string} menuIcon - Custom menu icon name (default: 'menu-outline') (if showBack is false)
 * @param {function} onMenu - Menu press handler
 */
const CustomHeader = ({
    title,
    subtitle,
    showBack = false,
    onBack,
    rightAction,
    transparent = false,
    menuIcon = 'menu-outline',
    onMenu,
}) => {
    const insets = useSafeAreaInsets();
    const navigation = useNavigation();

    const handleBack = () => {
        if (onBack) {
            onBack();
        } else {
            navigation.goBack();
        }
    };

    const StatusIcon = showBack ? 'chevron-back' : menuIcon;
    const onLeftPress = showBack ? handleBack : (onMenu || (() => navigation.openDrawer && navigation.openDrawer())); // Fallback to drawer if available

    // If it's a stack screen without back button, maybe show nothing or just Logo?
    // For now, if showBack is false and onMenu is undefined, and no drawer, we might show nothing or logo?
    // Let's assume standard behavior: Back or Menu/Logo.

    return (
        <View
            style={[
                styles.container,
                { paddingTop: insets.top },
                !transparent && styles.surface,
            ]}
        >
            <View style={styles.content}>
                {/* Left Action */}
                <TouchableOpacity
                    style={styles.leftButton}
                    onPress={onLeftPress}
                    disabled={!showBack && !onMenu && !navigation.openDrawer}
                >
                    {(showBack || onMenu || navigation.openDrawer) && (
                        <View style={[styles.iconContainer, !transparent && { backgroundColor: colors.gray50 }]}>
                            <Ionicons
                                name={StatusIcon}
                                size={22}
                                color={colors.text}
                            />
                        </View>
                    )}
                </TouchableOpacity>

                {/* Title Area */}
                <View style={styles.titleContainer}>
                    <Text style={styles.title} numberOfLines={1}>
                        {title}
                    </Text>
                    {subtitle && (
                        <Text style={styles.subtitle} numberOfLines={1}>
                            {subtitle}
                        </Text>
                    )}
                </View>

                {/* Right Action */}
                <View style={styles.rightButton}>
                    {rightAction}
                </View>
            </View>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        width: '100%',
        backgroundColor: 'transparent',
        zIndex: 100,
    },
    surface: {
        backgroundColor: colors.white,
        ...shadows.sm,
        borderBottomWidth: 1,
        borderBottomColor: colors.gray100,
    },
    content: {
        height: 60,
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: spacing.md,
        justifyContent: 'space-between',
    },
    leftButton: {
        width: 40,
        justifyContent: 'center',
        alignItems: 'flex-start',
    },
    iconContainer: {
        width: 36,
        height: 36,
        borderRadius: borderRadius.circle,
        justifyContent: 'center',
        alignItems: 'center',
    },
    titleContainer: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
        paddingHorizontal: spacing.sm,
    },
    title: {
        fontSize: fontSizes.h4, // Roughly 18
        fontWeight: '700',
        color: colors.text,
        letterSpacing: -0.5,
    },
    subtitle: {
        fontSize: fontSizes.xs,
        color: colors.textSecondary,
        marginTop: 2,
    },
    rightButton: {
        width: 40,
        alignItems: 'flex-end',
        justifyContent: 'center',
    },
});

export default CustomHeader;
