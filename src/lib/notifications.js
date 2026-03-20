import Notification from "../models/Notification";

export async function createBroadcastNotification({
  title,
  message,
  type = "system",
  actionUrl = "",
  entityType = "",
  entityId = "",
  admin = null,
}) {
  if (!title || !message) {
    return null;
  }

  return Notification.create({
    title,
    message,
    type,
    audience: "all",
    actionUrl,
    entityType,
    entityId: entityId ? String(entityId) : "",
    createdByAdmin: admin
      ? {
          adminId: admin._id,
          username: admin.username || "",
        }
      : undefined,
  });
}
