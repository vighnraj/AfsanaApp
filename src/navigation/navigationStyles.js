import { Platform } from 'react-native';
import { colors, shadows, borderRadius, fontSizes } from '../context/ThemeContext';

export const getTabScreenOptions = () => ({
    headerShown: false,
    tabBarStyle: {
        height: Platform.OS === 'ios' ? 85 : 65,
        backgroundColor: colors.white,
        borderTopWidth: 0,
        ...shadows.md, // Premium floating shadow
        paddingBottom: Platform.OS === 'ios' ? 25 : 10,
        paddingTop: 10,
        position: 'absolute',
        bottom: 0,
        left: 0,
        right: 0,
        elevation: 8,
        borderTopLeftRadius: 0,
        borderTopRightRadius: 0,
    },
    tabBarLabelStyle: {
        fontSize: 11,
        fontWeight: '600',
        marginBottom: 0,
    },
    tabBarActiveTintColor: colors.primary,
    tabBarInactiveTintColor: colors.gray400,
    tabBarHideOnKeyboard: true,
});

export const getStackScreenOptions = () => ({
    headerShown: false, // We will use CustomHeader manually in screens or as a custom header component
    cardStyle: { backgroundColor: colors.background },
});
