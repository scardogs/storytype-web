import { getUserFromRequest } from './auth';
import connectDB from './mongodb';
import User from '../models/User';

/**
 * Higher-order function to protect API routes
 * Usage: export default withAuth(handler)
 */
export function withAuth(handler) {
  return async (req, res) => {
    try {
      await connectDB();

      const userId = await getUserFromRequest(req);

      if (!userId) {
        return res.status(401).json({ message: 'Not authenticated' });
      }

      const user = await User.findById(userId);

      if (!user) {
        return res.status(404).json({ message: 'User not found' });
      }

      // Attach user to request object
      req.user = {
        id: user._id,
        username: user.username,
        email: user.email,
        profilePicture: user.profilePicture,
        stats: user.stats,
      };

      return handler(req, res);
    } catch (error) {
      console.error('Auth middleware error:', error);
      return res.status(500).json({ message: 'Server error' });
    }
  };
}

/**
 * Client-side HOC to protect pages
 * Usage: export default withAuthPage(Component)
 */
export function withAuthPage(Component) {
  return function ProtectedPage(props) {
    const { useAuth } = require('../context/AuthContext');
    const { useRouter } = require('next/router');
    const { useEffect } = require('react');
    
    const { user, loading } = useAuth();
    const router = useRouter();

    useEffect(() => {
      if (!loading && !user) {
        router.push('/profile');
      }
    }, [user, loading, router]);

    if (loading) {
      return (
        <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
          Loading...
        </div>
      );
    }

    if (!user) {
      return null;
    }

    return <Component {...props} />;
  };
}

