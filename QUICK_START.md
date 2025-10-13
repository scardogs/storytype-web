# 🚀 Quick Start Guide

Get your authentication system up and running in 5 minutes!

## Step 1: Set Up MongoDB

### Option A: Use MongoDB Atlas (Recommended for quick start)

1. Go to https://www.mongodb.com/cloud/atlas
2. Click "Try Free" and create an account
3. Create a free M0 cluster
4. Click "Connect" → "Connect your application"
5. Copy the connection string (looks like `mongodb+srv://...`)

### Option B: Use Local MongoDB

```bash
# Install MongoDB from https://www.mongodb.com/try/download/community
# Or use Docker:
docker run -d -p 27017:27017 --name mongodb mongo:latest
```

## Step 2: Set Up Cloudinary

1. Go to https://cloudinary.com
2. Sign up for a free account
3. Go to Dashboard (https://cloudinary.com/console)
4. Copy these three values:
   - Cloud Name
   - API Key
   - API Secret

## Step 3: Create Environment File

Create a file named `.env.local` in the project root (next to `package.json`):

```env
# Replace with your MongoDB connection string
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/storytype?retryWrites=true&w=majority

# Use any random string for development
JWT_SECRET=my-super-secret-key-12345

# Replace with your Cloudinary credentials
CLOUDINARY_CLOUD_NAME=your-cloud-name-here
CLOUDINARY_API_KEY=123456789012345
CLOUDINARY_API_SECRET=your-secret-here

NODE_ENV=development
```

**Important:** Replace the placeholder values with your actual credentials!

## Step 4: Run the Application

```bash
npm run dev
```

## Step 5: Test It Out!

1. Open http://localhost:3000/profile in your browser
2. Click the "Register" tab
3. Fill in the form:
   - Username: `testuser`
   - Email: `test@example.com`
   - Verify Email: `test@example.com`
   - Password: `password123`
   - Verify Password: `password123`
4. Click "Sign Up"
5. You should be logged in automatically!
6. Try uploading a profile picture
7. Try logging out and logging back in

## 🎉 That's it!

Your authentication system is now running. Here's what you can do:

### Try These Features:
- ✅ Register a new account
- ✅ Login and logout
- ✅ Edit your username
- ✅ Upload a profile picture
- ✅ View your stats (currently at 0, will update when you play games)

### Check the User Interface:
- 👤 Look at the top-right navbar - you should see your avatar
- 📊 Click on your avatar to see the dropdown menu
- 🏠 Navigate to different pages - your session persists

### For Development:
- 📖 Read `AUTHENTICATION.md` for API documentation
- 🔧 Check `SETUP.md` for detailed setup instructions
- 📝 See `IMPLEMENTATION_SUMMARY.md` for what was added

## Troubleshooting

### "Connection failed" or "Server error"

**Check MongoDB connection:**
```bash
# In your browser console or terminal, you should see:
# MongoDB connected successfully
```

**If using MongoDB Atlas:**
- Make sure you whitelisted your IP (0.0.0.0/0 for development)
- Verify database user password is correct
- Check connection string format

**If using local MongoDB:**
- Make sure MongoDB service is running
- Try: `mongodb://localhost:27017/storytype`

### "Failed to upload image"

**Check Cloudinary credentials:**
- Cloud Name should not have spaces
- API Key should be all numbers
- API Secret should be alphanumeric

**Verify in Cloudinary dashboard:**
- Go to https://cloudinary.com/console
- Copy the exact values shown

### "Registration failed" / "Login failed"

**Clear browser data:**
```javascript
// Open browser console and run:
document.cookie.split(";").forEach(function(c) { 
  document.cookie = c.replace(/^ +/, "").replace(/=.*/, "=;expires=" + new Date().toUTCString() + ";path=/"); 
});
location.reload();
```

**Check the browser console** (F12) for error messages

**Restart the dev server:**
```bash
# Press Ctrl+C to stop
npm run dev
```

## Environment Variables Template

Copy this template to create your `.env.local`:

```env
# ========================================
# MongoDB Configuration
# ========================================
# Local MongoDB:
MONGODB_URI=mongodb://localhost:27017/storytype

# OR MongoDB Atlas (cloud):
# MONGODB_URI=mongodb+srv://USERNAME:PASSWORD@CLUSTER.mongodb.net/storytype?retryWrites=true&w=majority

# ========================================
# JWT Secret (change this!)
# ========================================
JWT_SECRET=change-this-to-a-random-string-in-production

# ========================================
# Cloudinary (get from cloudinary.com/console)
# ========================================
CLOUDINARY_CLOUD_NAME=your-cloud-name
CLOUDINARY_API_KEY=your-api-key
CLOUDINARY_API_SECRET=your-api-secret

# ========================================
# Environment
# ========================================
NODE_ENV=development
```

## Still Having Issues?

1. **Check all dependencies are installed:**
   ```bash
   npm install
   ```

2. **Verify your `.env.local` file exists** in the project root
   - It should be next to `package.json`
   - Make sure it's named exactly `.env.local` (not `.env.local.txt`)

3. **Restart your dev server** after changing environment variables

4. **Check the terminal** where you ran `npm run dev` for error messages

5. **Check browser console** (F12 → Console tab) for frontend errors

## Next Steps

Once everything is working:

1. **Secure your JWT secret** - use a strong random string
2. **Read the documentation** in `AUTHENTICATION.md`
3. **Integrate with your typing game** - use the `/api/game/save-score` endpoint
4. **Customize the profile** - add more fields or statistics
5. **Deploy to production** - see README.md for deployment guide

---

**Happy coding! 🎮⌨️**

If you need more detailed information, check out:
- `SETUP.md` - Detailed setup instructions
- `AUTHENTICATION.md` - API documentation and code examples
- `IMPLEMENTATION_SUMMARY.md` - Complete feature list

