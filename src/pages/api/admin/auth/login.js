import connectDB from "../../../../lib/mongodb";
import Admin from "../../../../models/Admin";
import { generateAdminToken } from "../../../../lib/adminAuth";
import { checkRateLimit, getClientIp } from "../../../../lib/rateLimit";
import { assertSameOrigin } from "../../../../lib/security";

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({
      success: false,
      message: "Method not allowed",
    });
  }

  if (!assertSameOrigin(req)) {
    return res.status(403).json({
      success: false,
      message: "Invalid request origin",
    });
  }

  try {
    await connectDB();

    const { email, password } = req.body;
    const normalizedEmail =
      typeof email === "string" ? email.trim().toLowerCase() : "";
    const ip = getClientIp(req);
    const rateLimit = checkRateLimit(`admin-login:${ip}`, 8, 15 * 60 * 1000);

    if (!rateLimit.allowed) {
      res.setHeader("Retry-After", Math.ceil(rateLimit.retryAfterMs / 1000));
      return res.status(429).json({
        success: false,
        message: "Too many admin login attempts. Try again later.",
      });
    }

    if (!normalizedEmail || !password) {
      return res.status(400).json({
        success: false,
        message: "Email and password are required",
      });
    }

    // Find admin by email
    const admin = await Admin.findOne({ email: normalizedEmail }).select(
      "+password"
    );

    if (!admin) {
      return res.status(401).json({
        success: false,
        message: "Invalid credentials",
      });
    }

    if (!admin.isActive) {
      return res.status(401).json({
        success: false,
        message: "Account is deactivated",
      });
    }

    // Check password
    const isPasswordValid = await admin.comparePassword(password);

    if (!isPasswordValid) {
      return res.status(401).json({
        success: false,
        message: "Invalid credentials",
      });
    }

    // Update last login
    admin.lastLogin = new Date();
    await admin.save();

    // Generate token
    const token = generateAdminToken(admin._id);

    // Set HTTP-only cookie
    res.setHeader(
      "Set-Cookie",
      `adminToken=${token}; HttpOnly; Path=/; Max-Age=86400; SameSite=Strict; ${
        process.env.NODE_ENV === "production" ? "Secure" : ""
      }`
    );

    // Return admin data (without password)
    const adminData = await Admin.findById(admin._id).select("-password");

    res.status(200).json({
      success: true,
      message: "Login successful",
      admin: adminData.toObject(),
    });
  } catch (error) {
    console.error("Admin login error:", error);
    res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
}
