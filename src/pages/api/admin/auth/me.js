import { withAdminAuth } from "../../../../lib/adminAuth";

const handler = async (req, res) => {
  try {
    // Convert Mongoose document to plain object for JSON response
    const adminData = req.admin.toObject();

    res.status(200).json({
      success: true,
      admin: adminData,
    });
  } catch (error) {
    console.error("Get admin profile error:", error);
    res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};

export default withAdminAuth(handler);
