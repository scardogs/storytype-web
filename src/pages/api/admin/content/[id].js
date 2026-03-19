import { withAdminAuth, requirePermission } from "../../../../lib/adminAuth";
import connectDB from "../../../../lib/mongodb";
import Content from "../../../../models/Content";

export default async function handler(req, res) {
  if (req.method === "GET") {
    return getContent(req, res);
  } else if (req.method === "PUT") {
    return updateContent(req, res);
  } else if (req.method === "DELETE") {
    return deleteContent(req, res);
  } else {
    return res.status(405).json({
      success: false,
      message: "Method not allowed",
    });
  }
}

const getContent = withAdminAuth(
  requirePermission("contentManagement")(async (req, res) => {
    try {
      await connectDB();

      const { id } = req.query;

      const content = await Content.findById(id)
        .populate("createdBy", "username")
        .populate("lastModifiedBy", "username");

      if (!content) {
        return res.status(404).json({
          success: false,
          message: "Content not found",
        });
      }

      res.status(200).json({
        success: true,
        content,
      });
    } catch (error) {
      console.error("Get content error:", error);
      res.status(500).json({
        success: false,
        message: "Failed to fetch content details",
      });
    }
  })
);

const updateContent = withAdminAuth(
  requirePermission("contentManagement")(async (req, res) => {
    try {
      await connectDB();

      const { id } = req.query;
      const updateData = {
        ...req.body,
        lastModifiedBy: req.admin._id,
      };

      // Remove fields that shouldn't be updated directly
      delete updateData._id;
      delete updateData.createdAt;
      delete updateData.createdBy;

      const content = await Content.findByIdAndUpdate(
        id,
        { $set: updateData },
        { new: true, runValidators: true }
      )
        .populate("createdBy", "username")
        .populate("lastModifiedBy", "username");

      if (!content) {
        return res.status(404).json({
          success: false,
          message: "Content not found",
        });
      }

      res.status(200).json({
        success: true,
        message: "Content updated successfully",
        content,
      });
    } catch (error) {
      console.error("Update content error:", error);
      res.status(500).json({
        success: false,
        message: "Failed to update content",
      });
    }
  })
);

const deleteContent = withAdminAuth(
  requirePermission("contentManagement")(async (req, res) => {
    try {
      await connectDB();

      const { id } = req.query;

      const content = await Content.findById(id);
      if (!content) {
        return res.status(404).json({
          success: false,
          message: "Content not found",
        });
      }

      // Check if content has been used (has usage count > 0)
      if (content.usageCount > 0) {
        return res.status(400).json({
          success: false,
          message:
            "Cannot delete content that has been used. Consider deactivating it instead.",
        });
      }

      await Content.findByIdAndDelete(id);

      res.status(200).json({
        success: true,
        message: "Content deleted successfully",
      });
    } catch (error) {
      console.error("Delete content error:", error);
      res.status(500).json({
        success: false,
        message: "Failed to delete content",
      });
    }
  })
);
