# Authentication System - Quick Reference

## Overview

This application now has a complete authentication system with:
- User registration and login
- JWT-based authentication
- Profile management
- Cloudinary image uploads for profile pictures
- MongoDB for data persistence

## File Structure

```
src/
├── components/
│   ├── login-register.js      # Login/Register UI component
│   ├── user-profile.js         # User profile page with edit capabilities
│   ├── profile-page.js         # Wrapper that shows login or profile
│   └── navbar.js               # Updated with user menu
├── context/
│   └── AuthContext.js          # Authentication context and hooks
├── lib/
│   ├── mongodb.js              # MongoDB connection
│   ├── auth.js                 # JWT helper functions
│   ├── cloudinary.js           # Cloudinary upload/delete functions
│   └── withAuth.js             # HOC for protecting routes
├── models/
│   └── User.js                 # User model schema
└── pages/
    ├── api/
    │   ├── auth/
    │   │   ├── register.js     # POST - Register new user
    │   │   ├── login.js        # POST - Login user
    │   │   ├── logout.js       # POST - Logout user
    │   │   └── me.js           # GET - Get current user
    │   └── user/
    │       └── update-profile.js # PUT - Update profile
    └── _app.js                 # Wrapped with AuthProvider
```

## Using Authentication in Components

### Get Current User
```javascript
import { useAuth } from '../context/AuthContext';

function MyComponent() {
  const { user, loading } = useAuth();
  
  if (loading) return <div>Loading...</div>;
  if (!user) return <div>Please login</div>;
  
  return <div>Hello {user.username}!</div>;
}
```

### Register a User
```javascript
const { register } = useAuth();

const handleRegister = async () => {
  const result = await register(username, email, password, confirmPassword);
  if (result.success) {
    // User registered and logged in
    console.log(result.user);
  } else {
    // Show error
    console.error(result.error);
  }
};
```

### Login a User
```javascript
const { login } = useAuth();

const handleLogin = async () => {
  const result = await login(email, password);
  if (result.success) {
    // User logged in
    console.log(result.user);
  } else {
    // Show error
    console.error(result.error);
  }
};
```

### Logout
```javascript
const { logout } = useAuth();

const handleLogout = () => {
  logout(); // Clears session and redirects to home
};
```

### Update Profile
```javascript
const { updateProfile } = useAuth();

const handleUpdate = async () => {
  const formData = new FormData();
  formData.append('username', newUsername);
  formData.append('profilePicture', imageFile); // optional
  
  const result = await updateProfile(formData);
  if (result.success) {
    // Profile updated
    console.log(result.user);
  } else {
    // Show error
    console.error(result.error);
  }
};
```

## Protecting API Routes

Use the `withAuth` HOC to protect API routes:

```javascript
// pages/api/protected-route.js
import { withAuth } from '../../lib/withAuth';

async function handler(req, res) {
  // req.user is automatically available
  const { user } = req;
  
  return res.status(200).json({
    message: `Hello ${user.username}!`,
    user
  });
}

export default withAuth(handler);
```

## Protecting Pages (Client-Side)

Use the `withAuthPage` HOC to protect pages:

```javascript
// pages/protected-page.js
import { withAuthPage } from '../lib/withAuth';

function ProtectedPage() {
  return <div>This page requires authentication</div>;
}

export default withAuthPage(ProtectedPage);
```

## User Object Structure

```javascript
{
  id: "507f1f77bcf86cd799439011",
  username: "johndoe",
  email: "john@example.com",
  profilePicture: "https://res.cloudinary.com/...",
  stats: {
    totalGamesPlayed: 0,
    bestWPM: 0,
    averageWPM: 0,
    bestAccuracy: 0,
    totalWordsTyped: 0
  }
}
```

## Environment Variables Required

Create a `.env.local` file with:

```env
MONGODB_URI=mongodb://localhost:27017/storytype
JWT_SECRET=your-secret-key-here
CLOUDINARY_CLOUD_NAME=your-cloud-name
CLOUDINARY_API_KEY=your-api-key
CLOUDINARY_API_SECRET=your-api-secret
NODE_ENV=development
```

## Features

### ✅ Registration
- Username validation (3-20 characters)
- Email validation with regex
- Password strength (min 6 characters)
- Email and password confirmation
- Duplicate prevention

### ✅ Login
- Email and password authentication
- Remember me option (UI only)
- Secure JWT token storage (HTTP-only cookies)

### ✅ Profile Management
- View profile information
- Update username
- Upload/change profile picture
- View typing statistics
- Logout functionality

### ✅ Security
- Password hashing with bcrypt
- JWT authentication
- HTTP-only cookies
- CSRF protection (via sameSite cookies)
- Input validation
- MongoDB injection prevention

## Next Steps to Implement

1. **Password Reset**: Add forgot password functionality
2. **Email Verification**: Verify email addresses
3. **OAuth**: Google/GitHub login integration
4. **Two-Factor Auth**: Add 2FA support
5. **Session Management**: View active sessions
6. **Account Deletion**: Allow users to delete accounts
7. **Profile Privacy**: Public/private profile settings

## Testing the System

1. Start your MongoDB server
2. Configure Cloudinary credentials in `.env.local`
3. Run `npm run dev`
4. Navigate to `/profile`
5. Register a new account
6. Upload a profile picture
7. Edit your username
8. Logout and login again

All authentication state is preserved across page refreshes!

