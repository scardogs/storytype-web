import connectDB from "../../../../lib/mongodb";
import { withAuth } from "../../../../lib/withAuth";
import { assertSameOrigin } from "../../../../lib/security";
import { getOrCreateConversation, trimDirectMessages } from "../../../../lib/directChat";
import DirectMessage from "../../../../models/DirectMessage";
import User from "../../../../models/User";

const MESSAGE_COOLDOWN_MS = 3 * 1000;
const MAX_MESSAGE_LENGTH = 50;

function normalizeMessage(message) {
  return {
    id: String(message._id),
    content: message.content,
    createdAt: message.createdAt,
    sender: {
      id: String(message.senderId?._id || message.senderId || ""),
      username: message.senderId?.username || "Unknown user",
      profilePicture: message.senderId?.profilePicture || "",
    },
  };
}

async function updatePresence(userId) {
  await User.collection.updateOne(
    { _id: User.db.base.Types.ObjectId.createFromHexString(String(userId)) },
    {
      $set: { lastActiveAt: new Date() },
    }
  );
}

async function enforceDirectMessageCooldown(conversationId, userId) {
  const lastMessage = await DirectMessage.findOne({
    conversationId,
    senderId: userId,
  })
    .sort({ createdAt: -1 })
    .select("createdAt")
    .lean();

  if (!lastMessage?.createdAt) {
    return null;
  }

  const remainingMs =
    MESSAGE_COOLDOWN_MS - (Date.now() - new Date(lastMessage.createdAt).getTime());

  if (remainingMs > 0) {
    return Math.ceil(remainingMs / 1000);
  }

  return null;
}

async function getThread(req, res) {
  const targetUserId = String(req.query.userId || "");

  if (!targetUserId) {
    return res.status(400).json({ success: false, message: "userId is required" });
  }

  if (targetUserId === String(req.user.id)) {
    return res.status(400).json({ success: false, message: "Cannot DM yourself" });
  }

  const targetUser = await User.findById(targetUserId)
    .select("username profilePicture lastActiveAt")
    .lean();

  if (!targetUser) {
    return res.status(404).json({ success: false, message: "User not found" });
  }

  const conversation = await getOrCreateConversation(req.user.id, targetUserId);
  const messages = await DirectMessage.find({ conversationId: conversation._id })
    .sort({ createdAt: -1 })
    .limit(100)
    .populate("senderId", "username profilePicture")
    .lean();

  return res.status(200).json({
    success: true,
    conversation: {
      id: String(conversation._id),
      targetUser: {
        id: String(targetUser._id),
        username: targetUser.username,
        profilePicture: targetUser.profilePicture || "",
        lastActiveAt: targetUser.lastActiveAt || null,
      },
    },
    messages: messages.reverse().map(normalizeMessage),
  });
}

async function sendDirectMessage(req, res) {
  if (!assertSameOrigin(req)) {
    return res.status(403).json({ success: false, message: "Invalid request origin" });
  }

  const targetUserId = String(req.body?.targetUserId || "");
  const content = String(req.body?.content || "").trim();

  if (!targetUserId || !content) {
    return res.status(400).json({
      success: false,
      message: "targetUserId and content are required",
    });
  }

  if (content.length > MAX_MESSAGE_LENGTH) {
    return res.status(400).json({
      success: false,
      message: `Message must be ${MAX_MESSAGE_LENGTH} characters or less`,
    });
  }

  if (targetUserId === String(req.user.id)) {
    return res.status(400).json({ success: false, message: "Cannot DM yourself" });
  }

  const targetUser = await User.findById(targetUserId).select("_id");
  if (!targetUser) {
    return res.status(404).json({ success: false, message: "User not found" });
  }

  const conversation = await getOrCreateConversation(req.user.id, targetUserId);
  const waitSeconds = await enforceDirectMessageCooldown(conversation._id, req.user.id);

  if (waitSeconds) {
    return res.status(429).json({
      success: false,
      message: `Please wait ${waitSeconds} more second${
        waitSeconds === 1 ? "" : "s"
      } before sending another message`,
    });
  }

  await updatePresence(req.user.id);

  const message = await DirectMessage.create({
    conversationId: conversation._id,
    senderId: req.user.id,
    recipientId: targetUserId,
    content,
  });

  conversation.lastMessageAt = new Date();
  await conversation.save();
  await trimDirectMessages(conversation._id);

  const populatedMessage = await DirectMessage.findById(message._id)
    .populate("senderId", "username profilePicture")
    .lean();

  return res.status(201).json({
    success: true,
    message: normalizeMessage(populatedMessage),
  });
}

export default withAuth(async (req, res) => {
  try {
    await connectDB();

    if (req.method === "GET") {
      return getThread(req, res);
    }

    if (req.method === "POST") {
      return sendDirectMessage(req, res);
    }

    return res.status(405).json({ success: false, message: "Method not allowed" });
  } catch (error) {
    console.error("Direct chat error:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to process direct message request",
    });
  }
});
