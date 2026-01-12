// Student Navigator - Bottom Tabs + Stack
import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createStackNavigator } from '@react-navigation/stack';
import { Ionicons } from '@expo/vector-icons';

// Screens
import DashboardVisaScreen from '../screens/student/DashboardVisaScreen';
import ProfileScreen from '../screens/student/ProfileScreen';
import MyApplicationsScreen from '../screens/student/MyApplicationsScreen';
import UniversityCardsScreen from '../screens/student/UniversityCardsScreen';
import MoreScreen from '../screens/student/MoreScreen';
import SearchProgramsScreen from '../screens/student/SearchProgramsScreen';
import PaymentsScreen from '../screens/student/PaymentsScreen';
import TasksScreen from '../screens/student/TasksScreen';
import VisaProcessingScreen from '../screens/student/VisaProcessingScreen';
import CommonProfileScreen from '../screens/common/ProfileScreen';
import UniversityDetailScreen from '../screens/student/UniversityDetailScreen';

// Chat Screens
import ChatListScreen from '../screens/chat/ChatListScreen';
import ChatBoxScreen from '../screens/chat/ChatBoxScreen';

// Admission Screens
import AdmissionWizardScreen from '../screens/admission/AdmissionWizardScreen';

import { colors } from '../context/ThemeContext';
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

// Profile Stack
const ProfileStack = () => (
    <Stack.Navigator screenOptions={commonStackOptions}>
        <Stack.Screen name="ProfileMain" component={ProfileScreen} options={{ title: 'My Profile' }} />
        <Stack.Screen name="SearchPrograms" component={SearchProgramsScreen} options={{ title: 'Search Programs' }} />
        <Stack.Screen name="UniversityDetail" component={UniversityDetailScreen} options={{ title: 'University Details' }} />
    </Stack.Navigator>
);

// University Stack
const UniversityStack = () => (
    <Stack.Navigator screenOptions={commonStackOptions}>
        <Stack.Screen name="UniversityList" component={UniversityCardsScreen} options={{ title: 'Universities' }} />
        <Stack.Screen name="SearchPrograms" component={SearchProgramsScreen} options={{ title: 'Search Programs' }} />
        <Stack.Screen name="UniversityDetail" component={UniversityDetailScreen} options={{ title: 'University Details' }} />
    </Stack.Navigator>
);

// More Stack
const MoreStack = () => (
    <Stack.Navigator screenOptions={commonStackOptions}>
        <Stack.Screen name="MoreMenu" component={MoreScreen} options={{ headerShown: false }} />
        <Stack.Screen name="Payments" component={PaymentsScreen} options={{ headerShown: false }} />
        <Stack.Screen name="Tasks" component={TasksScreen} options={{ title: 'My Tasks' }} />
        <Stack.Screen name="VisaProcessing" component={VisaProcessingScreen} options={{ title: 'Visa Processing' }} />
        <Stack.Screen name="CommonProfile" component={CommonProfileScreen} options={{ title: 'Edit Profile' }} />

        {/* Chat Screens */}
        <Stack.Screen name="ChatList" component={ChatListScreen} options={{ headerShown: false }} />
        <Stack.Screen name="ChatBox" component={ChatBoxScreen} options={{ headerShown: false }} />

        {/* Admission Screens */}
        <Stack.Screen name="AdmissionWizard" component={AdmissionWizardScreen} options={{ headerShown: false }} />
    </Stack.Navigator>
);

const StudentNavigator = () => {
    return (
        <Tab.Navigator
            screenOptions={({ route }) => ({
                ...getTabScreenOptions(),
                tabBarIcon: ({ focused, color, size }) => {
                    let iconName;

                    switch (route.name) {
                        case 'Dashboard':
                            iconName = focused ? 'home' : 'home-outline';
                            break;
                        case 'Profile':
                            iconName = focused ? 'person' : 'person-outline';
                            break;
                        case 'Applications':
                            iconName = focused ? 'document-text' : 'document-text-outline';
                            break;
                        case 'Universities':
                            iconName = focused ? 'school' : 'school-outline';
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
            <Tab.Screen name="Dashboard" component={DashboardVisaScreen} />
            <Tab.Screen name="Profile" component={ProfileStack} />
            <Tab.Screen name="Applications" component={MyApplicationsScreen} />
            <Tab.Screen name="Universities" component={UniversityStack} />
            <Tab.Screen
                name="More"
                component={MoreStack}
                options={{ unmountOnBlur: true }}
                listeners={({ navigation }) => ({
                    tabPress: (e) => {
                        e.preventDefault();
                        navigation.navigate('More', { screen: 'MoreMenu' });
                    },
                })}
            />
        </Tab.Navigator>
    );
};

export default StudentNavigator;
