import connectDB from "../../../lib/mongodb";
import Notification from "../../../models/Notification";
import { getUserFromRequest } from "../../../lib/auth";

export default async function handler(req, res) {
  if (req.method === "GET") {
    return getNotifications(req, res);
  }

  if (req.method === "PATCH") {
    return markNotifications(req, res);
  }

  return res.status(405).json({
    success: false,
    message: "Method not allowed",
  });
}

async function getNotifications(req, res) {
  try {
    await connectDB();

    const userId = await getUserFromRequest(req);
    const query = userId
      ? {
          $or: [{ audience: "all" }, { audience: "user", userId }],
        }
      : { audience: "all" };

    const notifications = await Notification.find(query)
      .sort({ createdAt: -1 })
      .limit(20)
      .lean();

    const normalizedNotifications = notifications.map((notification) => {
      const read = userId
        ? (notification.readBy || []).some(
            (readerId) => String(readerId) === String(userId)
          )
        : true;

      return {
        _id: String(notification._id),
        title: notification.title,
        message: notification.message,
        type: notification.type,
        actionUrl: notification.actionUrl || "",
        entityType: notification.entityType || "",
        entityId: notification.entityId || "",
        createdAt: notification.createdAt,
        read,
      };
    });

    const unreadCount = userId
      ? normalizedNotifications.filter((notification) => !notification.read)
          .length
      : 0;

    return res.status(200).json({
      success: true,
      notifications: normalizedNotifications,
      unreadCount,
      authenticated: Boolean(userId),
    });
  } catch (error) {
    console.error("Get notifications error:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to fetch notifications",
    });
  }
}

async function markNotifications(req, res) {
  try {
    await connectDB();

    const userId = await getUserFromRequest(req);

    if (!userId) {
      return res.status(401).json({
        success: false,
        message: "Not authenticated",
      });
    }

    const { notificationId, markAll = false } = req.body || {};
    const baseQuery = {
      $or: [{ audience: "all" }, { audience: "user", userId }],
    };

    if (markAll) {
      await Notification.updateMany(baseQuery, {
        $addToSet: { readBy: userId },
      });
    } else if (notificationId) {
      await Notification.updateOne(
        { ...baseQuery, _id: notificationId },
        {
          $addToSet: { readBy: userId },
        }
      );
    } else {
      return res.status(400).json({
        success: false,
        message: "notificationId or markAll is required",
      });
    }

    return res.status(200).json({
      success: true,
    });
  } catch (error) {
    console.error("Mark notifications error:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to update notifications",
    });
  }
}
