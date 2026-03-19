import { withAdminAuth, requirePermission } from "../../../../../lib/adminAuth";
import connectDB from "../../../../../lib/mongodb";
import Admin from "../../../../../models/Admin";

export default async function handler(req, res) {
  if (req.method === "GET") {
    return getAdmin(req, res);
  } else if (req.method === "PUT") {
    return updateAdmin(req, res);
  } else if (req.method === "DELETE") {
    return deleteAdmin(req, res);
  } else {
    return res.status(405).json({
      success: false,
      message: "Method not allowed",
    });
  }
}

const getAdmin = withAdminAuth(
  requirePermission("systemSettings")(async (req, res) => {
    try {
      await connectDB();

      const { id } = req.query;

      const admin = await Admin.findById(id).select("-password");

      if (!admin) {
        return res.status(404).json({
          success: false,
          message: "Administrator not found",
        });
      }

      res.status(200).json({
        success: true,
        admin: admin.toObject(),
      });
    } catch (error) {
      console.error("Get admin error:", error);
      res.status(500).json({
        success: false,
        message: "Failed to fetch administrator details",
      });
    }
  })
);

const updateAdmin = withAdminAuth(
  requirePermission("systemSettings")(async (req, res) => {
    try {
      await connectDB();

      const { id } = req.query;
      const updateData = req.body;

       // Password change flow (self only)
       if (updateData?.newPassword) {
         if (req.admin._id.toString() !== id.toString()) {
           return res.status(403).json({
             success: false,
             message: "You can only change your own password",
           });
         }

         const { currentPassword, newPassword } = updateData;

         if (!currentPassword || !newPassword) {
           return res.status(400).json({
             success: false,
             message: "Current password and new password are required",
           });
         }

         if (newPassword.length < 8) {
           return res.status(400).json({
             success: false,
             message: "New password must be at least 8 characters",
           });
         }

         const adminWithPassword = await Admin.findById(id).select("+password");

         if (!adminWithPassword) {
           return res.status(404).json({
             success: false,
             message: "Administrator not found",
           });
         }

         const isCurrentPasswordValid = await adminWithPassword.comparePassword(
           currentPassword
         );

         if (!isCurrentPasswordValid) {
           return res.status(400).json({
             success: false,
             message: "Current password is incorrect",
           });
         }

         adminWithPassword.password = newPassword;
         await adminWithPassword.save();

         const updatedAdmin = await Admin.findById(id).select("-password");

         return res.status(200).json({
           success: true,
           message: "Password updated successfully",
           admin: updatedAdmin.toObject(),
         });
       }

      // Remove sensitive fields that shouldn't be updated directly
      delete updateData._id;
      delete updateData.createdAt;
      delete updateData.createdBy;

      // If updating password, it will be hashed by the pre-save middleware
      const admin = await Admin.findByIdAndUpdate(
        id,
        { $set: updateData },
        { new: true, runValidators: true }
      ).select("-password");

      if (!admin) {
        return res.status(404).json({
          success: false,
          message: "Administrator not found",
        });
      }

      res.status(200).json({
        success: true,
        message: "Administrator updated successfully",
        admin: admin.toObject(),
      });
    } catch (error) {
      console.error("Update admin error:", error);
      res.status(500).json({
        success: false,
        message: "Failed to update administrator",
      });
    }
  })
);

const deleteAdmin = withAdminAuth(
  requirePermission("systemSettings")(async (req, res) => {
    try {
      await connectDB();

      const { id } = req.query;

      const admin = await Admin.findById(id);
      if (!admin) {
        return res.status(404).json({
          success: false,
          message: "Administrator not found",
        });
      }

      // Prevent deleting super admin
      if (admin.role === "super_admin") {
        return res.status(400).json({
          success: false,
          message: "Cannot delete super administrator",
        });
      }

      // Prevent self-deletion
      if (admin._id.toString() === req.admin._id.toString()) {
        return res.status(400).json({
          success: false,
          message: "Cannot delete your own account",
        });
      }

      await Admin.findByIdAndDelete(id);

      res.status(200).json({
        success: true,
        message: "Administrator deleted successfully",
      });
    } catch (error) {
      console.error("Delete admin error:", error);
      res.status(500).json({
        success: false,
        message: "Failed to delete administrator",
      });
    }
  })
);
