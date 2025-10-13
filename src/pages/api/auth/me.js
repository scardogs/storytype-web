import connectDB from '../../../lib/mongodb';
import User from '../../../models/User';
import { getUserFromRequest } from '../../../lib/auth';

export default async function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

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

    return res.status(200).json({
      success: true,
      user: {
        id: user._id,
        username: user.username,
        email: user.email,
        profilePicture: user.profilePicture,
        stats: user.stats,
      },
    });
  } catch (error) {
    console.error('Get user error:', error);
    return res.status(500).json({ message: 'Server error. Please try again.' });
  }
}

