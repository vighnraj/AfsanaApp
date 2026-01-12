// Processor Navigator - Bottom Tabs + Stack

import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createStackNavigator } from '@react-navigation/stack';
import { Ionicons } from '@expo/vector-icons';

// Screens
import { DashboardScreen, StudentDetailsScreen, VisaProcessingScreen, MoreScreen } from '../screens/processor';
import ProfileScreen from '../screens/common/ProfileScreen';

import { colors } from '../context/ThemeContext';
import { getTabScreenOptions } from './navigationStyles';
import CustomHeader from '../components/common/CustomHeader';

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
    headerShown: true,
    animationEnabled: true,
};

// Student Stack
const StudentStack = () => (
    <Stack.Navigator screenOptions={commonStackOptions}>
        <Stack.Screen name="StudentDetails" component={StudentDetailsScreen} options={{ title: 'Assigned Students' }} />
        <Stack.Screen name="VisaProcess" component={VisaProcessingScreen} options={{ title: 'Visa Processing' }} />
    </Stack.Navigator>
);

// More Stack
const MoreStack = () => (
    <Stack.Navigator screenOptions={commonStackOptions}>
        <Stack.Screen name="MoreMenu" component={MoreScreen} options={{ headerShown: false }} />
        <Stack.Screen name="Profile" component={ProfileScreen} options={{ title: 'My Profile' }} />
    </Stack.Navigator>
);

const ProcessorNavigator = () => {
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
                        case 'Students':
                            iconName = focused ? 'people' : 'people-outline';
                            break;
                        case 'VisaProcessing':
                            iconName = focused ? 'airplane' : 'airplane-outline';
                            break;
                        case 'More':
                            iconName = focused ? 'menu' : 'menu-outline';
                            break;
                        default:
                            iconName = 'circle';
                    }

                    return <Ionicons name={iconName} size={size} color={color} />;
                },
                tabBarActiveTintColor: colors.primary,
                tabBarInactiveTintColor: colors.gray400,
            })}
        >
            <Tab.Screen name="Dashboard" component={DashboardScreen} />
            <Tab.Screen name="Students" component={StudentStack} />
            <Tab.Screen name="VisaProcessing" component={VisaProcessingScreen} />
            <Tab.Screen name="More" component={MoreStack} />
        </Tab.Navigator>
    );
};

export default ProcessorNavigator;
