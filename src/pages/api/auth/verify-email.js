import connectDB from '../../../lib/mongodb';
import User from '../../../models/User';
import jwt from 'jsonwebtoken';
import { checkRateLimit, getClientIp } from '../../../lib/rateLimit';
import { getRequiredSecret } from '../../../lib/security';

export default async function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  try {
    await connectDB();
    const ip = getClientIp(req);
    const rateLimit = checkRateLimit(`verify-email:${ip}`, 20, 15 * 60 * 1000);

    if (!rateLimit.allowed) {
      return res
        .status(429)
        .json({ message: 'Too many verification attempts. Try again later.' });
    }

    const { token } = req.query;
    const verificationToken = Array.isArray(token) ? token[0] : token;

    if (!verificationToken) {
      return res.status(400).json({ message: 'Invalid verification link' });
    }

    let decoded;

    try {
      decoded = jwt.verify(
        verificationToken.trim(),
        getRequiredSecret('JWT_SECRET')
      );
    } catch (error) {
      return res.status(400).json({ message: 'Verification link is invalid or expired' });
    }

    const user = await User.findOne({
      _id: decoded.userId,
      email: decoded.email,
    });

    if (!user) {
      return res.status(400).json({ message: 'Verification link is invalid or expired' });
    }

    await User.findByIdAndUpdate(user._id, {
      $set: { emailVerified: true },
      $unset: {
        emailVerificationToken: '',
        emailVerificationExpires: '',
      },
    });

    return res.redirect('/email-verified');
  } catch (error) {
    console.error('Verify email error:', error);
    return res.status(500).json({ message: 'Server error. Please try again.' });
  }
}
