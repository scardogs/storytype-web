import { withAdminAuth, requirePermission } from "../../../lib/adminAuth";
import connectDB from "../../../lib/mongodb";
import Notification from "../../../models/Notification";
import { createBroadcastNotification } from "../../../lib/notifications";

const handler = async (req, res) => {
  if (req.method === "GET") {
    return getNotifications(req, res);
  }

  if (req.method === "POST") {
    return createNotification(req, res);
  }

  if (req.method === "PUT") {
    return updateNotification(req, res);
  }

  if (req.method === "DELETE") {
    return deleteNotification(req, res);
  }

  return res.status(405).json({
    success: false,
    message: "Method not allowed",
  });
};

const getNotifications = withAdminAuth(
  requirePermission("trainingManagement")(async (req, res) => {
    try {
      await connectDB();

      const notifications = await Notification.find({ audience: "all" })
        .sort({ createdAt: -1 })
        .limit(20)
        .lean();

      return res.status(200).json({
        success: true,
        notifications,
      });
    } catch (error) {
      console.error("Admin notifications fetch error:", error);
      return res.status(500).json({
        success: false,
        message: "Failed to fetch notifications",
      });
    }
  })
);

const createNotification = withAdminAuth(
  requirePermission("trainingManagement")(async (req, res) => {
    try {
      await connectDB();

      const {
        title,
        message,
        actionUrl = "",
        type = "training",
      } = req.body || {};

      if (!title?.trim() || !message?.trim()) {
        return res.status(400).json({
          success: false,
          message: "Title and message are required",
        });
      }

      const notification = await createBroadcastNotification({
        title: title.trim(),
        message: message.trim(),
        type,
        actionUrl: actionUrl.trim(),
        entityType: "announcement",
        entityId: "",
        admin: req.admin,
      });

      return res.status(201).json({
        success: true,
        message: "Announcement published successfully",
        notification,
      });
    } catch (error) {
      console.error("Admin notification create error:", error);
      return res.status(500).json({
        success: false,
        message: "Failed to publish announcement",
      });
    }
  })
);

const updateNotification = withAdminAuth(
  requirePermission("trainingManagement")(async (req, res) => {
    try {
      await connectDB();

      const {
        notificationId,
        title,
        message,
        actionUrl = "",
        type = "training",
      } = req.body || {};

      if (!notificationId) {
        return res.status(400).json({
          success: false,
          message: "notificationId is required",
        });
      }

      if (!title?.trim() || !message?.trim()) {
        return res.status(400).json({
          success: false,
          message: "Title and message are required",
        });
      }

      const notification = await Notification.findOneAndUpdate(
        { _id: notificationId, audience: "all" },
        {
          $set: {
            title: title.trim(),
            message: message.trim(),
            actionUrl: actionUrl.trim(),
            type,
            entityType: "announcement",
            updatedAt: new Date(),
            createdByAdmin: {
              adminId: req.admin._id,
              username: req.admin.username || "",
            },
          },
        },
        { new: true }
      );

      if (!notification) {
        return res.status(404).json({
          success: false,
          message: "Announcement not found",
        });
      }

      return res.status(200).json({
        success: true,
        message: "Announcement updated successfully",
        notification,
      });
    } catch (error) {
      console.error("Admin notification update error:", error);
      return res.status(500).json({
        success: false,
        message: "Failed to update announcement",
      });
    }
  })
);

const deleteNotification = withAdminAuth(
  requirePermission("trainingManagement")(async (req, res) => {
    try {
      await connectDB();

      const { notificationId } = req.body || {};

      if (!notificationId) {
        return res.status(400).json({
          success: false,
          message: "notificationId is required",
        });
      }

      const notification = await Notification.findOneAndDelete({
        _id: notificationId,
        audience: "all",
      });

      if (!notification) {
        return res.status(404).json({
          success: false,
          message: "Announcement not found",
        });
      }

      return res.status(200).json({
        success: true,
        message: "Announcement deleted successfully",
      });
    } catch (error) {
      console.error("Admin notification delete error:", error);
      return res.status(500).json({
        success: false,
        message: "Failed to delete announcement",
      });
    }
  })
);

export default handler;
