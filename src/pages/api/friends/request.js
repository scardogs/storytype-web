import { withAuth } from "../../../lib/withAuth";
import { assertSameOrigin } from "../../../lib/security";
import User from "../../../models/User";
import FriendRequest from "../../../models/FriendRequest";

async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ success: false, message: "Method not allowed" });
  }

  if (!assertSameOrigin(req)) {
    return res.status(403).json({ success: false, message: "Invalid request origin" });
  }

  const recipientId = String(req.body?.recipientId || "").trim();

  if (!recipientId) {
    return res.status(400).json({
      success: false,
      message: "recipientId is required",
    });
  }

  if (recipientId === String(req.user.id)) {
    return res.status(400).json({
      success: false,
      message: "You cannot add yourself",
    });
  }

  const recipient = await User.findById(recipientId).select("_id username").lean();

  if (!recipient) {
    return res.status(404).json({
      success: false,
      message: "User not found",
    });
  }

  const existing = await FriendRequest.findOne({
    $or: [
      { senderId: req.user.id, recipientId },
      { senderId: recipientId, recipientId: req.user.id },
    ],
  }).lean();

  if (existing) {
    const existingStatus =
      existing.status === "accepted"
        ? "friends"
        : String(existing.senderId) === String(req.user.id)
        ? "outgoing_pending"
        : "incoming_pending";

    return res.status(200).json({
      success: true,
      alreadyExists: true,
      status: existingStatus,
      message:
        existingStatus === "friends"
          ? "You are already friends"
          : existingStatus === "incoming_pending"
          ? `${recipient.username} has already sent you a friend request`
          : "Friend request already sent",
    });
  }

  await FriendRequest.create({
    senderId: req.user.id,
    recipientId,
    status: "pending",
  });

  return res.status(201).json({
    success: true,
    status: "outgoing_pending",
    message: `Friend request sent to ${recipient.username}`,
  });
}

export default withAuth(handler);
