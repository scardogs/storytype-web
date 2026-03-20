import connectDB from '../../../lib/mongodb';
import User from '../../../models/User';
import jwt from 'jsonwebtoken';
import { checkRateLimit, getClientIp } from '../../../lib/rateLimit';
import { assertSameOrigin, getRequiredSecret } from '../../../lib/security';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  if (!assertSameOrigin(req)) {
    return res.status(403).json({ message: 'Invalid request origin' });
  }

  try {
    await connectDB();

    const { username, email, password, confirmPassword } = req.body;
    const normalizedUsername = typeof username === 'string' ? username.trim() : '';
    const normalizedEmail =
      typeof email === 'string' ? email.trim().toLowerCase() : '';
    const ip = getClientIp(req);
    const rateLimit = checkRateLimit(`auth-register:${ip}`, 5, 60 * 60 * 1000);

    if (!rateLimit.allowed) {
      res.setHeader('Retry-After', Math.ceil(rateLimit.retryAfterMs / 1000));
      return res
        .status(429)
        .json({ message: 'Too many registration attempts. Try again later.' });
    }

    // Validation
    if (!normalizedUsername || !normalizedEmail || !password || !confirmPassword) {
      return res.status(400).json({ message: 'Please provide all fields' });
    }

    if (password !== confirmPassword) {
      return res.status(400).json({ message: 'Passwords do not match' });
    }

    if (password.length < 6) {
      return res.status(400).json({ message: 'Password must be at least 6 characters' });
    }

    // Check if user already exists
    const existingUser = await User.findOne({
      $or: [{ email: normalizedEmail }, { username: normalizedUsername }],
    });

    if (existingUser) {
      if (existingUser.email === normalizedEmail) {
        return res.status(400).json({ message: 'Email already registered' });
      }
      if (existingUser.username === normalizedUsername) {
        return res.status(400).json({ message: 'Username already taken' });
      }
    }

    // Create user
    const user = await User.create({
      username: normalizedUsername,
      email: normalizedEmail,
      password,
      emailVerified: false,
    });

    const emailVerificationToken = jwt.sign(
      {
        userId: user._id.toString(),
        email: user.email,
      },
      getRequiredSecret('JWT_SECRET'),
      { expiresIn: '7d' }
    );

    // Build verification URL
    const forwardedProto = req.headers['x-forwarded-proto'];
    const protocol = forwardedProto || (process.env.NODE_ENV === 'production' ? 'https' : 'http');
    const host = req.headers.host;
    const appBaseUrl = process.env.NEXT_PUBLIC_APP_URL || `${protocol}://${host}`;
    const verificationUrl = `${appBaseUrl}/api/auth/verify-email?token=${encodeURIComponent(emailVerificationToken)}`;

    // Send verification email via Resend API
    const resendResponse = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${process.env.RESEND_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        from:
          process.env.RESEND_FROM_EMAIL ||
          'Storytype <noreply@storytype.ijscrl.xyz>',
        to: [email],
        subject: 'Verify your StoryType account',
        html: `
          <div style="margin:0;padding:0;background:#0b1220;font-family:'Segoe UI',Arial,sans-serif;color:#e5e7eb;">
            <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="background:#0b1220;padding:32px 12px;">
              <tr>
                <td align="center">
                  <table role="presentation" width="600" cellspacing="0" cellpadding="0" style="max-width:600px;width:100%;background:#111827;border:1px solid #1f2937;border-radius:20px;overflow:hidden;box-shadow:0 20px 40px rgba(0,0,0,0.35);">
                    <tr>
                      <td style="padding:28px 28px 18px 28px;background:linear-gradient(135deg,#0f172a 0%,#111827 55%,#1e293b 100%);border-bottom:1px solid #1f2937;">
                        <div style="font-size:13px;letter-spacing:0.14em;text-transform:uppercase;color:#94a3b8;font-weight:700;">StoryType</div>
                        <div style="margin-top:8px;font-size:28px;line-height:1.2;font-weight:800;letter-spacing:-0.02em;background:linear-gradient(90deg,#2dd4bf 0%,#60a5fa 100%);-webkit-background-clip:text;background-clip:text;color:transparent;">
                          Welcome, ${normalizedUsername}
                        </div>
                        <div style="margin-top:10px;color:#9ca3af;font-size:15px;line-height:1.7;">
                          Your account is almost ready. Verify your email to unlock your personalized typing analytics, training paths, and leaderboards.
                        </div>
                      </td>
                    </tr>

                    <tr>
                      <td style="padding:26px 28px 8px 28px;">
                        <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="border-collapse:separate;border-spacing:0;background:#0f172a;border:1px solid #1f2937;border-radius:14px;">
                          <tr>
                            <td style="padding:18px 20px;color:#cbd5e1;font-size:14px;line-height:1.7;">
                              Click the button below to confirm your email address.
                            </td>
                          </tr>
                          <tr>
                            <td align="center" style="padding:8px 20px 22px 20px;">
                              <a href="${verificationUrl}" style="display:inline-block;padding:12px 22px;background:linear-gradient(90deg,#14b8a6 0%,#3b82f6 100%);color:#ffffff;text-decoration:none;border-radius:999px;font-size:14px;font-weight:700;letter-spacing:0.02em;box-shadow:0 10px 24px rgba(20,184,166,0.3);">
                                Verify Email Address
                              </a>
                            </td>
                          </tr>
                        </table>
                      </td>
                    </tr>

                    <tr>
                      <td style="padding:12px 28px 26px 28px;color:#94a3b8;font-size:13px;line-height:1.7;">
                        If the button doesn’t work, copy and paste this secure link into your browser:<br/>
                        <a href="${verificationUrl}" style="color:#67e8f9;word-break:break-all;text-decoration:none;">${verificationUrl}</a>
                        <div style="margin-top:12px;color:#64748b;">This verification link expires in 7 days.</div>
                      </td>
                    </tr>

                    <tr>
                      <td style="padding:16px 28px 22px 28px;border-top:1px solid #1f2937;color:#64748b;font-size:12px;line-height:1.6;background:#0f172a;">
                        If you didn’t create this account, you can safely ignore this email.
                      </td>
                    </tr>
                  </table>
                </td>
              </tr>
            </table>
          </div>
        `,
      }),
    });

    if (!resendResponse.ok) {
      const resendErrorText = await resendResponse.text();
      console.error('Resend email error:', resendErrorText);

      let resendMessage =
        'Registration successful, but verification email could not be delivered right now. Please use the provided verification link.';

      try {
        const parsedError = JSON.parse(resendErrorText);
        if (
          resendResponse.status === 403 &&
          parsedError?.name === 'validation_error'
        ) {
          resendMessage =
            'Registration successful. Resend test mode only allows sending to your own email address. Verify your Resend domain to send to other recipients, or use the provided verification link for now.';
        }
      } catch {
        // Keep default message if provider response is not JSON
      }

      return res.status(201).json({
        success: true,
        message: resendMessage,
        verificationUrl,
      });
    }

    // Return success message (user must verify before login)
    return res.status(201).json({
      success: true,
      message: 'Registration successful. Please check your email for the verification link.',
    });
  } catch (error) {
    console.error('Register error:', error);
    return res.status(500).json({ message: 'Server error. Please try again.' });
  }
}

