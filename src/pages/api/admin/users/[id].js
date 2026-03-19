import { withAdminAuth, requirePermission } from "../../../../lib/adminAuth";
import connectDB from "../../../../lib/mongodb";
import User from "../../../../models/User";
import TypingRecord from "../../../../models/TypingRecord";
import Tournament from "../../../../models/Tournament";

export default async function handler(req, res) {
  if (req.method === "GET") {
    return getUser(req, res);
  } else if (req.method === "PUT") {
    return updateUser(req, res);
  } else if (req.method === "DELETE") {
    return deleteUser(req, res);
  } else {
    return res.status(405).json({
      success: false,
      message: "Method not allowed",
    });
  }
}

const getUser = withAdminAuth(
  requirePermission("userManagement")(async (req, res) => {
    try {
      await connectDB();

      const { id } = req.query;

      const user = await User.findById(id).select("-password");
      if (!user) {
        return res.status(404).json({
          success: false,
          message: "User not found",
        });
      }

      // Get user's typing records for detailed stats
      const typingRecords = await TypingRecord.find({ userId: id })
        .sort({ timestamp: -1 })
        .limit(10);

      // Get user's tournament participation
      const tournamentParticipation = await Tournament.find({
        "participants.userId": id,
      }).select("name status participants");

      res.status(200).json({
        success: true,
        user,
        typingRecords,
        tournamentParticipation,
      });
    } catch (error) {
      console.error("Get user error:", error);
      res.status(500).json({
        success: false,
        message: "Failed to fetch user details",
      });
    }
  })
);

const updateUser = withAdminAuth(
  requirePermission("userManagement")(async (req, res) => {
    try {
      await connectDB();

      const { id } = req.query;
      const updateData = req.body;

      // Remove sensitive fields that shouldn't be updated
      delete updateData.password;
      delete updateData._id;
      delete updateData.createdAt;
      delete updateData.updatedAt;

      const user = await User.findByIdAndUpdate(
        id,
        { $set: updateData },
        { new: true, runValidators: true }
      ).select("-password");

      if (!user) {
        return res.status(404).json({
          success: false,
          message: "User not found",
        });
      }

      res.status(200).json({
        success: true,
        message: "User updated successfully",
        user,
      });
    } catch (error) {
      console.error("Update user error:", error);
      res.status(500).json({
        success: false,
        message: "Failed to update user",
      });
    }
  })
);

const deleteUser = withAdminAuth(
  requirePermission("userManagement")(async (req, res) => {
    try {
      await connectDB();

      const { id } = req.query;

      // Check if user exists
      const user = await User.findById(id);
      if (!user) {
        return res.status(404).json({
          success: false,
          message: "User not found",
        });
      }

      // Delete user's typing records
      await TypingRecord.deleteMany({ userId: id });

      // Remove user from tournaments
      await Tournament.updateMany(
        { "participants.userId": id },
        { $pull: { participants: { userId: id } } }
      );

      // Delete the user
      await User.findByIdAndDelete(id);

      res.status(200).json({
        success: true,
        message: "User deleted successfully",
      });
    } catch (error) {
      console.error("Delete user error:", error);
      res.status(500).json({
        success: false,
        message: "Failed to delete user",
      });
    }
  })
);
