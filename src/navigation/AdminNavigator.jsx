// Admin Navigator - Bottom Tabs + Stack
import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createStackNavigator } from '@react-navigation/stack';
import { Ionicons } from '@expo/vector-icons';

// Screens
import DashboardScreen from '../screens/admin/DashboardScreen';
import InquiryScreen from '../screens/admin/InquiryScreen';
import LeadScreen from '../screens/admin/LeadScreen';
import StudentListScreen from '../screens/admin/StudentListScreen';
import MoreScreen from '../screens/admin/MoreScreen';
import AddCounselorScreen from '../screens/admin/AddCounselorScreen';
import AddStudentScreen from '../screens/admin/AddStudentScreen';
import AddStaffScreen from '../screens/admin/AddStaffScreen';
import TasksScreen from '../screens/admin/TasksScreen';
import PaymentsScreen from '../screens/admin/PaymentsScreen';
import VisaListScreen from '../screens/admin/VisaListScreen';
import VisaProcessingScreen from '../screens/student/VisaProcessingScreen';
import ProfileScreen from '../screens/common/ProfileScreen';
import AddLeadScreen from '../screens/common/AddLeadScreen';
import LeadDetailScreen from '../screens/common/LeadDetailScreen';
import StudentDetailScreen from '../screens/common/StudentDetailScreen';
import AddProcessorScreen from '../screens/admin/AddProcessorScreen';
import RolesManagementScreen from '../screens/admin/RolesManagementScreen';
import PermissionsScreen from '../screens/admin/PermissionsScreen';

// Chat Screens
import ChatListScreen from '../screens/chat/ChatListScreen';
import ChatBoxScreen from '../screens/chat/ChatBoxScreen';

// BATCH 3: Reporting & Analytics - REMOVED FOR BETA VERSION (only basic dashboard kept)

// BATCH 4: Application & Payment
import ApplicationTrackerScreen from '../screens/admin/ApplicationTrackerScreen';
import UniversitySubmissionsScreen from '../screens/admin/UniversitySubmissionsScreen';
import InvoiceDownloadScreen from '../screens/admin/InvoiceDownloadScreen';
import CreateInvoiceScreen from '../screens/admin/CreateInvoiceScreen';

// BATCH 5: Additional Features
import BranchManagementScreen from '../screens/admin/BranchManagementScreen';
import AddBranchScreen from '../screens/admin/AddBranchScreen';
import TaskRemindersScreen from '../screens/admin/TaskRemindersScreen';
import TodaysInquiriesScreen from '../screens/admin/TodaysInquiriesScreen';

// BATCH 6: Staff & University Management (NEW)
import UniversityManagementScreen from '../screens/admin/UniversityManagementScreen';
import CounselorManagementScreen from '../screens/admin/CounselorManagementScreen';
import ProcessorManagementScreen from '../screens/admin/ProcessorManagementScreen';
import StaffManagementScreen from '../screens/admin/StaffManagementScreen';
import VisaProcessManagementScreen from '../screens/admin/VisaProcessManagementScreen';

import { colors, fontSizes } from '../context/ThemeContext';

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
    cardStyle: { backgroundColor: colors.background },
};

// Lead Stack (Screens manage their own headers)
const LeadStack = () => (
    <Stack.Navigator screenOptions={{ headerShown: false, cardStyle: { backgroundColor: colors.background } }}>
        <Stack.Screen name="LeadList" component={LeadScreen} />
        <Stack.Screen name="InquiryList" component={InquiryScreen} />
        <Stack.Screen name="LeadDetail" component={LeadDetailScreen} />
        <Stack.Screen name="AddLead" component={AddLeadScreen} />
    </Stack.Navigator>
);

// Student Stack
const StudentStack = () => (
    <Stack.Navigator screenOptions={{ headerShown: false, cardStyle: { backgroundColor: colors.background } }}>
        <Stack.Screen name="StudentList" component={StudentListScreen} />
        <Stack.Screen name="StudentDetail" component={StudentDetailScreen} />
        <Stack.Screen name="AddStudent" component={AddStudentScreen} />
    </Stack.Navigator>
);

// More Stack
const MoreStack = () => (
    <Stack.Navigator screenOptions={commonStackOptions}>
        <Stack.Screen name="MoreMenu" component={MoreScreen} options={{ headerShown: false }} />
        <Stack.Screen name="AddCounselor" component={AddCounselorScreen} options={{ title: 'Add Counselor' }} />
        <Stack.Screen name="AddStaff" component={AddStaffScreen} options={{ title: 'Add Staff' }} />
        <Stack.Screen name="Tasks" component={TasksScreen} options={{ title: 'Task Management' }} />
        <Stack.Screen name="Payments" component={PaymentsScreen} options={{ title: 'Payments & Invoices' }} />
        <Stack.Screen name="VisaList" component={VisaListScreen} options={{ title: 'Visa Processing' }} />
        <Stack.Screen name="VisaProcessing" component={VisaProcessingScreen} options={{ title: 'Process Application' }} />
        <Stack.Screen name="AddProcessor" component={AddProcessorScreen} options={{ title: 'Add Processor' }} />
        <Stack.Screen name="RolesManagement" component={RolesManagementScreen} options={{ title: 'Roles & Permissions' }} />
        <Stack.Screen name="Permissions" component={PermissionsScreen} options={{ title: 'Configure Permissions' }} />
        <Stack.Screen name="Profile" component={ProfileScreen} options={{ title: 'My Profile' }} />

        {/* Chat Screens */}
        <Stack.Screen name="ChatList" component={ChatListScreen} options={{ headerShown: false }} />
        <Stack.Screen name="ChatBox" component={ChatBoxScreen} options={{ headerShown: false }} />

        {/* BATCH 3: Reporting & Analytics - REMOVED FOR BETA VERSION */}

        {/* BATCH 4: Application & Payment */}
        <Stack.Screen name="ApplicationTracker" component={ApplicationTrackerScreen} options={{ headerShown: false }} />
        <Stack.Screen name="UniversitySubmissions" component={UniversitySubmissionsScreen} options={{ headerShown: false }} />
        <Stack.Screen name="InvoiceDownload" component={InvoiceDownloadScreen} options={{ headerShown: false }} />
        <Stack.Screen name="CreateInvoice" component={CreateInvoiceScreen} options={{ headerShown: false }} />

        {/* BATCH 5: Additional Features */}
        <Stack.Screen name="BranchManagement" component={BranchManagementScreen} options={{ headerShown: false }} />
        <Stack.Screen name="AddBranch" component={AddBranchScreen} options={{ title: 'Add Branch' }} />
        <Stack.Screen name="TaskReminders" component={TaskRemindersScreen} options={{ headerShown: false }} />
        <Stack.Screen name="TodaysInquiries" component={TodaysInquiriesScreen} options={{ headerShown: false }} />

        {/* BATCH 6: Staff & University Management (NEW) */}
        <Stack.Screen name="UniversityManagement" component={UniversityManagementScreen} options={{ title: 'University Management' }} />
        <Stack.Screen name="CounselorManagement" component={CounselorManagementScreen} options={{ title: 'Counselor Management' }} />
        <Stack.Screen name="ProcessorManagement" component={ProcessorManagementScreen} options={{ title: 'Processor Management' }} />
        <Stack.Screen name="StaffManagement" component={StaffManagementScreen} options={{ title: 'Staff Management' }} />
        <Stack.Screen name="VisaProcessManagement" component={VisaProcessManagementScreen} options={{ title: 'Visa Process Management' }} />
    </Stack.Navigator>
);

const AdminNavigator = () => {
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
                        case 'Leads':
                            iconName = focused ? 'people' : 'people-outline';
                            break;
                        case 'Students':
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
            <Tab.Screen name="Dashboard" component={DashboardScreen} />
            <Tab.Screen name="Leads" component={LeadStack} />
            <Tab.Screen name="Students" component={StudentStack} />
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

export default AdminNavigator;
