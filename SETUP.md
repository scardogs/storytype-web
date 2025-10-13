# StoryType Authentication Setup Guide

This guide will help you set up the authentication system with MongoDB and Cloudinary.

## Prerequisites

- Node.js 18+ installed
- MongoDB (local or MongoDB Atlas account)
- Cloudinary account (free tier available)

## Step 1: Install Dependencies

Dependencies are already installed in the project:
- mongoose (MongoDB ODM)
- bcryptjs (password hashing)
- jsonwebtoken (JWT authentication)
- cloudinary (image hosting)
- formidable (file uploads)
- cookie (cookie parsing)

## Step 2: MongoDB Setup

### Option A: Local MongoDB
1. Install MongoDB locally from https://www.mongodb.com/try/download/community
2. Start MongoDB service
3. Use connection string: `mongodb://localhost:27017/storytype`

### Option B: MongoDB Atlas (Cloud)
1. Create account at https://www.mongodb.com/cloud/atlas
2. Create a new cluster (free tier available)
3. Create a database user
4. Whitelist your IP address (or use 0.0.0.0/0 for development)
5. Get your connection string (Connect > Connect your application)
6. Replace `<password>` with your database user password

## Step 3: Cloudinary Setup

1. Create account at https://cloudinary.com (free tier available)
2. Go to Dashboard: https://cloudinary.com/console
3. Copy the following credentials:
   - Cloud Name
   - API Key
   - API Secret

## Step 4: Environment Variables

Create a `.env.local` file in the root directory:

```env
# MongoDB Configuration
MONGODB_URI=mongodb://localhost:27017/storytype
# Or for MongoDB Atlas:
# MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/storytype?retryWrites=true&w=majority

# JWT Secret (Change this to a random string in production)
JWT_SECRET=your-super-secret-jwt-key-change-this-in-production

# Cloudinary Configuration
CLOUDINARY_CLOUD_NAME=your-cloud-name
CLOUDINARY_API_KEY=your-api-key
CLOUDINARY_API_SECRET=your-api-secret

# Node Environment
NODE_ENV=development
```

Replace the placeholder values with your actual credentials.

## Step 5: Run the Application

```bash
npm run dev
```

The application will be available at http://localhost:3000

## Features

### Authentication
- User registration with email and password
- User login with JWT tokens
- Secure password hashing with bcrypt
- HTTP-only cookies for token storage

### Profile Management
- View user profile with statistics
- Update username
- Upload and change profile picture (stored on Cloudinary)
- View typing statistics (games played, WPM, accuracy)

### API Endpoints

- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - Login user
- `POST /api/auth/logout` - Logout user
- `GET /api/auth/me` - Get current user
- `PUT /api/user/update-profile` - Update profile (username and/or picture)

## Security Notes

1. **JWT Secret**: Always use a strong, random secret in production
2. **HTTPS**: Use HTTPS in production for secure cookie transmission
3. **CORS**: Configure CORS properly for your frontend domain
4. **Rate Limiting**: Consider adding rate limiting to prevent abuse
5. **Validation**: All inputs are validated on both client and server

## Troubleshooting

### MongoDB Connection Issues
- Ensure MongoDB is running (local) or credentials are correct (Atlas)
- Check network/firewall settings
- Verify connection string format

### Cloudinary Upload Issues
- Verify API credentials are correct
- Check file size limits (5MB default in code)
- Ensure file type is an image

### Authentication Not Working
- Clear browser cookies
- Check JWT_SECRET is set
- Verify MongoDB connection is successful
- Check browser console for errors

## Next Steps

- Implement password reset functionality
- Add email verification
- Integrate OAuth providers (Google, GitHub)
- Add profile picture cropping
- Implement rate limiting

## Support

For issues or questions, please refer to the documentation:
- MongoDB: https://docs.mongodb.com
- Cloudinary: https://cloudinary.com/documentation
- Next.js: https://nextjs.org/docs

