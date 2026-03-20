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
    // Clear the admin token cookie
    res.setHeader(
      "Set-Cookie",
      `adminToken=; HttpOnly; Path=/; Max-Age=0; SameSite=Strict; ${
        process.env.NODE_ENV === "production" ? "Secure" : ""
      }`
    );

    res.status(200).json({
      success: true,
      message: "Logout successful",
    });
  } catch (error) {
    console.error("Admin logout error:", error);
    res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
}
