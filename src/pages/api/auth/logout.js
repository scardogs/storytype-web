import { removeTokenCookie } from '../../../lib/auth';
import { assertSameOrigin } from '../../../lib/security';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  if (!assertSameOrigin(req)) {
    return res.status(403).json({ message: 'Invalid request origin' });
  }

  try {
    removeTokenCookie(res);
    return res.status(200).json({ success: true, message: 'Logged out successfully' });
  } catch (error) {
    console.error('Logout error:', error);
    return res.status(500).json({ message: 'Server error. Please try again.' });
  }
}

