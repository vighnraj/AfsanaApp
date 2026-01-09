# Mobile App - React Native Expo

## Overview
React Native mobile application converted from the web frontend, supporting 6 user roles: Admin, Student, Counselor, Processor, Staff, and Master Admin.

## Quick Start

```bash
# Install dependencies
npm install

# Start Expo
npx expo start
```

## Project Structure

```
mobile-app/
├── App.js                 # Entry point
├── package.json           # Dependencies
├── app.json               # Expo config
├── babel.config.js        # Babel config
└── src/
    ├── api/               # API modules (8 files)
    │   ├── index.js       # Axios instance with interceptors
    │   ├── authApi.js     # Authentication endpoints
    │   ├── dashboardApi.js
    │   ├── leadApi.js
    │   ├── studentApi.js
    │   ├── visaApi.js
    │   ├── chatApi.js
    │   └── userApi.js
    ├── context/           # State management (3 files)
    │   ├── AuthContext.jsx
    │   ├── LeadContext.jsx
    │   └── ThemeContext.jsx
    ├── utils/             # Utilities (5 files)
    │   ├── storage.js
    │   ├── validation.js
    │   ├── formatting.js
    │   ├── constants.js
    │   └── permissions.js
    ├── components/common/ # Reusable components (7 files)
    │   ├── Button.jsx
    │   ├── Input.jsx
    │   ├── Card.jsx
    │   ├── Loading.jsx
    │   ├── Modal.jsx
    │   ├── Toast.jsx
    │   └── index.js
    ├── navigation/        # Navigators (7 files)
    │   ├── RootNavigator.jsx
    │   ├── AuthNavigator.jsx
    │   ├── AdminNavigator.jsx
    │   ├── StudentNavigator.jsx
    │   ├── CounselorNavigator.jsx
    │   ├── ProcessorNavigator.jsx
    │   ├── StaffNavigator.jsx
    │   └── MasterAdminNavigator.jsx
    └── screens/           # 45+ screens
        ├── auth/          # Login, Signup, ForgotPassword, ResetPassword
        ├── admin/         # Dashboard, Inquiry, Lead, StudentList, etc.
        ├── student/       # DashboardVisa, Profile, Applications, etc.
        ├── counselor/
        ├── processor/
        ├── staff/
        ├── masteradmin/
        └── common/        # Profile, Chat

## Tech Stack

- **Framework**: Expo React Native
- **Language**: JavaScript only
- **Navigation**: React Navigation (Stack + Tabs)
- **State**: React Context API
- **HTTP**: Axios with interceptors
- **Storage**: Expo SecureStore (JWT)
- **Icons**: Expo Vector Icons (Ionicons)

## User Roles

| Role | Dashboard | Key Features |
|------|-----------|--------------|
| Admin | KPI cards, charts | Manage leads, students, counselors, staff |
| Student | 12-step visa journey | Applications, universities, tasks |
| Counselor | Lead/student stats | My leads, students, tasks |
| Processor | Assigned students | Visa processing stages |
| Staff | Permission-based | Inquiries, leads (per permissions) |
| Master Admin | System overview | Admin CRUD operations |

## API Base URL

```
https://afsana-backend-production-0897.up.railway.app/api/
```

## Authentication

- JWT stored in Expo SecureStore
- 10-minute idle timeout
- Automatic logout on 401 responses
- Role-based navigation switching
