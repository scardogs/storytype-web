import connectDB from '../../../lib/mongodb';
import User from '../../../models/User';
import { createToken, setTokenCookie } from '../../../lib/auth';
import { checkRateLimit, getClientIp } from '../../../lib/rateLimit';
import { assertSameOrigin } from '../../../lib/security';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  if (!assertSameOrigin(req)) {
    return res.status(403).json({ message: 'Invalid request origin' });
  }

  try {
    await connectDB();

    const { email, password } = req.body;
    const normalizedEmail =
      typeof email === 'string' ? email.trim().toLowerCase() : '';
    const ip = getClientIp(req);
    const rateLimit = checkRateLimit(`auth-login:${ip}`, 10, 15 * 60 * 1000);

    if (!rateLimit.allowed) {
      res.setHeader('Retry-After', Math.ceil(rateLimit.retryAfterMs / 1000));
      return res
        .status(429)
        .json({ message: 'Too many login attempts. Try again later.' });
    }

    // Validation
    if (!normalizedEmail || !password) {
      return res.status(400).json({ message: 'Please provide email and password' });
    }

    // Find user with password field
    const user = await User.findOne({ email: normalizedEmail }).select('+password');

    if (!user) {
      return res.status(401).json({ message: 'Invalid email or password' });
    }

    if (user.emailVerified === false) {
      return res.status(403).json({
        message: 'Please verify your email before logging in.',
      });
    }

    // Check password
    const isPasswordCorrect = await user.comparePassword(password);

    if (!isPasswordCorrect) {
      return res.status(401).json({ message: 'Invalid email or password' });
    }

    // Create token and set cookie
    await User.collection.updateOne(
      { _id: user._id },
      {
        $set: { lastActiveAt: new Date() },
      }
    );
    const token = createToken(user._id);
    setTokenCookie(res, token);

    // Return user data (without password)
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
    console.error('Login error:', error);
    return res.status(500).json({ message: 'Server error. Please try again.' });
  }
}

