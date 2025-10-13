This is a [Next.js](https://nextjs.org) project bootstrapped with [`create-next-app`](https://nextjs.org/docs/pages/api-reference/create-next-app).

# StoryType - Typing Practice Web Application

A modern typing practice application with user authentication, profile management, and real-time statistics tracking.

## Features

- 🎮 Interactive typing practice with stories
- 👤 User authentication (register/login)
- 📊 Profile management with statistics
- 🖼️ Profile picture upload with Cloudinary
- 🏆 Leaderboards and performance tracking
- 🎨 Beautiful dark mode UI with Chakra UI

## Quick Start

### Prerequisites

- Node.js 18 or higher
- MongoDB (local or MongoDB Atlas)
- Cloudinary account (for profile pictures)

### Installation

1. Clone the repository
2. Install dependencies:
```bash
npm install
```

3. Set up environment variables (see SETUP.md for detailed instructions)
4. Create a `.env.local` file in the root directory:
```env
MONGODB_URI=mongodb://localhost:27017/storytype
JWT_SECRET=your-secret-key-here
CLOUDINARY_CLOUD_NAME=your-cloud-name
CLOUDINARY_API_KEY=your-api-key
CLOUDINARY_API_SECRET=your-api-secret
```

5. Run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

## Documentation

- **[QUICK_START.md](QUICK_START.md)** - Get started in 5 minutes
- **[SETUP.md](SETUP.md)** - Complete setup guide for MongoDB and Cloudinary
- **[AUTHENTICATION.md](AUTHENTICATION.md)** - Authentication system documentation and usage examples
- **[GAME_STATS_INTEGRATION.md](GAME_STATS_INTEGRATION.md)** - How game statistics are automatically saved
- **[ANALYTICS_GUIDE.md](ANALYTICS_GUIDE.md)** - Analytics system with graphs and insights
- **[TYPING_SYSTEM_COMPLETE.md](TYPING_SYSTEM_COMPLETE.md)** - Complete typing system overview
- **[IMPLEMENTATION_SUMMARY.md](IMPLEMENTATION_SUMMARY.md)** - Complete feature list and implementation details

## Project Structure

```
src/
├── components/          # React components
│   ├── login-register.js
│   ├── user-profile.js
│   ├── navbar.js
│   └── ...
├── context/            # React context providers
│   └── AuthContext.js
├── lib/               # Utility libraries
│   ├── mongodb.js
│   ├── auth.js
│   ├── cloudinary.js
│   └── withAuth.js
├── models/            # MongoDB models
│   └── User.js
├── pages/             # Next.js pages
│   ├── api/          # API routes
│   └── ...
└── styles/           # CSS styles
```

## API Routes

- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - Login user
- `POST /api/auth/logout` - Logout user
- `GET /api/auth/me` - Get current user
- `PUT /api/user/update-profile` - Update profile
- `POST /api/game/save-score` - Save game statistics (example)

## Tech Stack

- **Frontend**: Next.js 15, React 19, Chakra UI
- **Backend**: Next.js API Routes, MongoDB, Mongoose
- **Authentication**: JWT, bcrypt
- **File Storage**: Cloudinary
- **Charts**: Chart.js, React-Chartjs-2

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn-pages-router) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deployment

### Environment Variables for Production

Make sure to set all environment variables in your deployment platform:

```env
MONGODB_URI=your-mongodb-atlas-uri
JWT_SECRET=strong-random-secret-key
CLOUDINARY_CLOUD_NAME=your-cloud-name
CLOUDINARY_API_KEY=your-api-key
CLOUDINARY_API_SECRET=your-api-secret
NODE_ENV=production
```

### Vercel Deployment

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme).

1. Push your code to GitHub
2. Import the project in Vercel
3. Add environment variables in Vercel dashboard
4. Deploy!

Check out the [Next.js deployment documentation](https://nextjs.org/docs/pages/building-your-application/deploying) for more details.

## Contributing

Feel free to submit issues and pull requests!

## License

MIT
