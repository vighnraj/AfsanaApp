// Staff Navigator - Bottom Tabs (Permission-based)

import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createStackNavigator } from '@react-navigation/stack';
import { Ionicons } from '@expo/vector-icons';

// Screens
import { DashboardScreen, InquiryScreen, LeadScreen, MoreScreen } from '../screens/staff';
import ProfileScreen from '../screens/common/ProfileScreen';
import VisaListScreen from '../screens/admin/VisaListScreen';
import VisaProcessingScreen from '../screens/student/VisaProcessingScreen';

import { colors, fontSizes } from '../context/ThemeContext';
import { useAuth } from '../context/AuthContext';

import { getTabScreenOptions } from './navigationStyles';
import { CustomHeader } from '../components/common';

const Tab = createBottomTabNavigator();
const Stack = createStackNavigator();

const commonStackOptions = {
    header: ({ navigation, route, options }) => (
        <CustomHeader
            title={options.title || route.name}
            showBack={navigation.canGoBack()}
            onBack={() => navigation.goBack()}
        />
    ),
    cardStyle: { backgroundColor: colors.background },
};

// More Stack
const MoreStack = () => (
    <Stack.Navigator screenOptions={commonStackOptions}>
        <Stack.Screen name="MoreMenu" component={MoreScreen} options={{ headerShown: false }} />
        <Stack.Screen name="VisaList" component={VisaListScreen} options={{ title: 'Visa Processing' }} />
        <Stack.Screen name="VisaProcessing" component={VisaProcessingScreen} options={{ title: 'Process Application' }} />
        <Stack.Screen name="Profile" component={ProfileScreen} options={{ title: 'My Profile' }} />
    </Stack.Navigator>
);

const StaffNavigator = () => {
    const { hasPermission } = useAuth();

    // Check staff permissions
    const canViewInquiry = hasPermission('Inquiry', 'view');
    const canViewLead = hasPermission('Lead', 'view');

    return (
        <Tab.Navigator
            screenOptions={({ route }) => ({
                ...getTabScreenOptions(),
                tabBarIcon: ({ focused, color, size }) => {
                    let iconName;

                    switch (route.name) {
                        case 'Dashboard':
                            iconName = focused ? 'grid' : 'grid-outline';
                            break;
                        case 'Inquiry':
                            iconName = focused ? 'mail' : 'mail-outline';
                            break;
                        case 'Lead':
                            iconName = focused ? 'people' : 'people-outline';
                            break;
                        case 'More':
                            iconName = focused ? 'menu' : 'menu-outline';
                            break;
                        default:
                            iconName = 'circle';
                    }

                    return <Ionicons name={iconName} size={24} color={color} />;
                },
            })}
        >
            <Tab.Screen name="Dashboard" component={DashboardScreen} />
            {canViewInquiry && <Tab.Screen name="Inquiry" component={InquiryScreen} />}
            {canViewLead && <Tab.Screen name="Lead" component={LeadScreen} />}
            <Tab.Screen name="More" component={MoreStack} />
        </Tab.Navigator>
    );
};

export default StaffNavigator;
