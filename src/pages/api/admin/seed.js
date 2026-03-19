import connectDB from "../../../lib/mongodb";
import Admin from "../../../models/Admin";

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({
      success: false,
      message: "Method not allowed",
    });
  }

  try {
    await connectDB();

    // Check if any admins exist
    const existingAdmin = await Admin.findOne();
    if (existingAdmin) {
      return res.status(400).json({
        success: false,
        message: "Administrators already exist in the database",
      });
    }

    // Create super admin
    const superAdmin = new Admin({
      username: "admin",
      email: "admin@storytype.com",
      password: "admin123", // This will be hashed by the pre-save middleware
      role: "super_admin",
      permissions: {
        userManagement: true,
        tournamentManagement: true,
        trainingManagement: true,
        analyticsAccess: true,
        contentManagement: true,
        systemSettings: true,
      },
      isActive: true,
    });

    await superAdmin.save();

    res.status(201).json({
      success: true,
      message: "Super administrator created successfully",
      admin: {
        username: superAdmin.username,
        email: superAdmin.email,
        role: superAdmin.role,
      },
    });
  } catch (error) {
    console.error("Seed error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to create super administrator",
    });
  }
}
