// Processor Navigator - Bottom Tabs + Stack

import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createStackNavigator } from '@react-navigation/stack';
import { Ionicons } from '@expo/vector-icons';

// Screens
import { DashboardScreen, StudentDetailsScreen, VisaProcessingScreen, MoreScreen } from '../screens/processor';
import ProfileScreen from '../screens/common/ProfileScreen';
import NotificationCenterScreen from '../screens/notification/NotificationCenterScreen';

import { colors, fontSizes } from '../context/ThemeContext';
import ChatListScreen from '../screens/common/ChatListScreen';
import ChatScreen from '../screens/common/ChatScreen';

const Tab = createBottomTabNavigator();
const Stack = createStackNavigator();

// Student Stack
const StudentStack = () => (
    <Stack.Navigator
        screenOptions={{
            headerStyle: { backgroundColor: colors.primary },
            headerTintColor: colors.white,
            headerTitleStyle: { fontWeight: '600' },
        }}
    >
        <Stack.Screen name="StudentDetails" component={StudentDetailsScreen} options={{ title: 'Assigned Students' }} />
        <Stack.Screen name="VisaProcess" component={VisaProcessingScreen} options={{ title: 'Visa Processing' }} />
    </Stack.Navigator>
);

// More Stack
const MoreStack = () => (
    <Stack.Navigator
        screenOptions={{
            headerStyle: { backgroundColor: colors.primary },
            headerTintColor: colors.white,
            headerTitleStyle: { fontWeight: '600' },
        }}
    >
        <Stack.Screen name="MoreMenu" component={MoreScreen} options={{ headerShown: false }} />
        <Stack.Screen name="ChatList" component={ChatListScreen} options={{ headerShown: false }} />
        <Stack.Screen name="Chat" component={ChatScreen} options={{ headerShown: false }} />
        <Stack.Screen name="Profile" component={ProfileScreen} options={{ title: 'My Profile' }} />
        <Stack.Screen name="NotificationCenter" component={NotificationCenterScreen} options={{ headerShown: false }} />
    </Stack.Navigator>
);

const ProcessorNavigator = () => {
    return (
        <Tab.Navigator
            screenOptions={({ route }) => ({
                headerShown: false,
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
                tabBarStyle: {
                    backgroundColor: colors.white,
                    borderTopColor: colors.gray200,
                    paddingBottom: 5,
                    paddingTop: 5,
                    height: 60,
                },
                tabBarLabelStyle: {
                    fontSize: fontSizes.xs,
                    fontWeight: '500',
                },
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
