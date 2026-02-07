# Kaffiy Mobile UI - Database Setup Guide

## 📋 Overview

This guide explains how to connect the Kaffiy Mobile UI to the Supabase database that we've already set up.

## 🚀 Quick Setup

### 1. Environment Variables

Copy the environment file and fill in your Supabase credentials:

```bash
cp .env.example .env
```

Edit `.env` file with your Supabase project details:

```env
# Supabase Configuration
VITE_SUPABASE_URL=https://your-project-id.supabase.co
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key

# App Configuration
VITE_APP_NAME=Kaffiy
VITE_APP_VERSION=1.0.0
```

### 2. Install Dependencies

```bash
npm install @supabase/supabase-js
```

### 3. Database Connection

The mobile app is already configured with:

- **Supabase Client**: `src/lib/supabase.ts`
- **Database Types**: `src/types/database.ts`
- **Auth Context**: `src/contexts/AuthContext.tsx`

## 🔧 Available Features

### ✅ Authentication
- **Sign In**: User login with email/password
- **Sign Up**: New user registration
- **Sign Out**: User logout
- **Password Reset**: Forgot password functionality
- **Profile Management**: Update user profile

### ✅ Business Logic
- **User Profile**: Get and update user information
- **Companies**: Browse coffee shop companies
- **Campaigns**: View active campaigns and promotions
- **QR Scanning**: Scan QR codes and earn points
- **Loyalty Program**: Track points and loyalty levels
- **Notifications**: Real-time notifications
- **Subscriptions**: Subscribe to favorite companies

### ✅ Real-time Features
- **Live Notifications**: Real-time notification updates
- **Loyalty Updates**: Live point updates
- **Campaign Updates**: Live campaign changes

## 📱 Usage Examples

### Authentication

```typescript
import { useAuth } from './contexts/AuthContext';

function LoginScreen() {
  const { signIn, isLoading, error } = useAuth();

  const handleLogin = async (email: string, password: string) => {
    try {
      await signIn(email, password);
      // Navigate to home screen
    } catch (error) {
      // Handle error
    }
  };

  return (
    // Your login UI
  );
}
```

### Business Logic

```typescript
import { MobileBusinessLogic } from './lib/supabase';

// Get companies
const companies = await MobileBusinessLogic.getCompanies();

// Scan QR code
const result = await MobileBusinessLogic.scanQRCode('QR-CODE-123', 'user-id');

// Get user loyalty
const loyalty = await MobileBusinessLogic.getUserLoyalty('user-id', 'company-id');
```

### Real-time Updates

```typescript
import { RealtimeManager } from './lib/supabase';

// Subscribe to notifications
const subscription = RealtimeManager.subscribeToNotifications(
  'user-id',
  (payload) => {
    console.log('New notification:', payload);
  }
);

// Cleanup
RealtimeManager.unsubscribe(subscription);
```

## 🏗️ App Structure

```
src/
├── lib/
│   └── supabase.ts          # Database client and business logic
├── types/
│   └── database.ts           # TypeScript types for database
├── contexts/
│   └── AuthContext.tsx        # Authentication state management
├── components/
│   └── (your UI components)
├── pages/
│   └── (your app screens)
└── hooks/
    └── (custom hooks)
```

## 🔐 Security Features

### Row Level Security (RLS)
- **User Data**: Users can only access their own data
- **Company Data**: Proper company isolation
- **Campaign Data**: Secure campaign access

### Authentication
- **JWT Tokens**: Secure session management
- **Auto Refresh**: Automatic token refresh
- **Session Persistence**: Persistent login state

## 📊 Database Tables Used

### Core Tables
- `user_tb` - User profiles and authentication
- `company_tb` - Coffee shop companies
- `shop_tb` - Physical store locations
- `campaign_tb` - Marketing campaigns
- `qr_tb` - QR code tracking
- `royalty_tb` - Loyalty program data
- `user_notice_tb` - User notifications
- `user_subscribe_tb` - User subscriptions

### Supporting Tables
- `country_tb`, `city_tb`, `district_tb` - Geographic data
- `profile_picture_tb` - User avatars
- `payment_tb` - Payment tracking
- `feedback_*` - Feedback systems

## 🚀 Getting Started

### 1. Set up Supabase
1. Go to [Supabase Dashboard](https://supabase.com/dashboard)
2. Create a new project
3. Run the SQL from `Kaffiy-Database/COPY-PASTE-SQL.sql`
4. Get your project URL and anon key

### 2. Configure Mobile App
1. Copy `.env.example` to `.env`
2. Fill in your Supabase credentials
3. Install dependencies: `npm install`

### 3. Run the App
```bash
npm run dev
```

### 4. Test Features
- **Authentication**: Try signing up and logging in
- **QR Scanning**: Test QR code functionality
- **Loyalty**: Check point tracking
- **Notifications**: Verify real-time updates

## 🛠️ Development Tips

### Error Handling
All database operations include comprehensive error handling:

```typescript
try {
  const result = await MobileBusinessLogic.someOperation();
  // Handle success
} catch (error) {
  console.error('Operation failed:', error);
  // Handle error
}
```

### Loading States
Use the built-in loading states from AuthContext:

```typescript
const { isLoading } = useAuth();

if (isLoading) {
  return <LoadingSpinner />;
}
```

### Real-time Updates
Subscribe to real-time updates for live features:

```typescript
useEffect(() => {
  const subscription = RealtimeManager.subscribeToNotifications(
    user.id,
    handleNotification
  );

  return () => RealtimeManager.unsubscribe(subscription);
}, [user.id]);
```

## 🔍 Debugging

### Common Issues

1. **Environment Variables Not Found**
   - Ensure `.env` file exists
   - Check variable names match exactly

2. **Database Connection Failed**
   - Verify Supabase URL and anon key
   - Check network connectivity

3. **Authentication Errors**
   - Verify email confirmation
   - Check user status in database

4. **Real-time Not Working**
   - Ensure RLS policies are set correctly
   - Check subscription filters

### Debug Mode

Enable debug mode in `.env`:

```env
VITE_ENABLE_DEBUG_MODE=true
```

## 📱 Mobile-Specific Features

### Camera Integration
```typescript
// QR code scanning
const result = await MobileBusinessLogic.scanQRCode(qrData, userId);
```

### Push Notifications
```typescript
// Real-time notifications
RealtimeManager.subscribeToNotifications(userId, handleNotification);
```

### Offline Support
The app includes basic offline support with:
- Local storage for user session
- Queue for offline actions
- Sync when connection restored

## 🎯 Next Steps

1. **UI Components**: Build your mobile UI components
2. **Navigation**: Set up mobile navigation
3. **QR Scanner**: Integrate QR code scanning
4. **Push Notifications**: Set up mobile push notifications
5. **Testing**: Test all features thoroughly

## 📞 Support

For issues with:
- **Database**: Check the database schema
- **Authentication**: Verify Supabase settings
- **Mobile Features**: Check mobile-specific configurations

---

**Ready to build your Kaffiy mobile app! 🚀**
