import { withAdminAuth, requirePermission } from "../../../../lib/adminAuth";
import connectDB from "../../../../lib/mongodb";
import Admin from "../../../../models/Admin";

const handler = async (req, res) => {
  if (req.method === "GET") {
    return getAdmins(req, res);
  } else if (req.method === "POST") {
    return createAdmin(req, res);
  } else {
    return res.status(405).json({
      success: false,
      message: "Method not allowed",
    });
  }
};

const getAdmins = withAdminAuth(
  requirePermission("systemSettings")(async (req, res) => {
    try {
      await connectDB();

      const admins = await Admin.find()
        .select("-password")
        .sort({ createdAt: -1 });

      // Convert Mongoose documents to plain objects
      const adminsData = admins.map((admin) => admin.toObject());

      res.status(200).json({
        success: true,
        admins: adminsData,
      });
    } catch (error) {
      console.error("Get admins error:", error);
      res.status(500).json({
        success: false,
        message: "Failed to fetch administrators",
      });
    }
  })
);

const createAdmin = withAdminAuth(
  requirePermission("systemSettings")(async (req, res) => {
    try {
      await connectDB();

      const { username, email, password, role, permissions } = req.body;

      if (!username || !email || !password) {
        return res.status(400).json({
          success: false,
          message: "Username, email, and password are required",
        });
      }

      // Check if admin already exists
      const existingAdmin = await Admin.findOne({
        $or: [{ email }, { username }],
      });

      if (existingAdmin) {
        return res.status(400).json({
          success: false,
          message: "Admin with this email or username already exists",
        });
      }

      // Create new admin
      const adminData = {
        username,
        email,
        password,
        role: role || "admin",
        permissions: permissions || {
          userManagement: false,
          tournamentManagement: false,
          trainingManagement: false,
          analyticsAccess: false,
          contentManagement: false,
          systemSettings: false,
        },
        createdBy: req.admin._id,
      };

      const admin = new Admin(adminData);
      await admin.save();

      // Return admin without password
      const adminResponse = await Admin.findById(admin._id).select("-password");

      res.status(201).json({
        success: true,
        message: "Administrator created successfully",
        admin: adminResponse.toObject(),
      });
    } catch (error) {
      console.error("Create admin error:", error);
      res.status(500).json({
        success: false,
        message: "Failed to create administrator",
      });
    }
  })
);

export default handler;
