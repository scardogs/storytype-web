import connectDB from "../../../lib/mongodb";
import { withAuth } from "../../../lib/withAuth";
import { assertSameOrigin } from "../../../lib/security";
import ChatMessage from "../../../models/ChatMessage";
import User from "../../../models/User";

const MAX_CHAT_MESSAGES = 100;
const ONLINE_WINDOW_MS = 2 * 60 * 1000;

async function trimChatHistory() {
  const count = await ChatMessage.countDocuments();

  if (count <= MAX_CHAT_MESSAGES) {
    return;
  }

  const overflow = count - MAX_CHAT_MESSAGES;
  const oldestMessages = await ChatMessage.find({})
    .sort({ createdAt: 1 })
    .limit(overflow)
    .select("_id")
    .lean();

  if (oldestMessages.length > 0) {
    await ChatMessage.deleteMany({
      _id: { $in: oldestMessages.map((message) => message._id) },
    });
  }
}

async function updatePresence(userId) {
  await User.collection.updateOne(
    { _id: User.db.base.Types.ObjectId.createFromHexString(String(userId)) },
    {
      $set: { lastActiveAt: new Date() },
    }
  );
}

async function getOnlineUsers() {
  const threshold = new Date(Date.now() - ONLINE_WINDOW_MS);
  const users = await User.collection
    .find(
      {
        lastActiveAt: { $gte: threshold },
      },
      {
        projection: {
          username: 1,
          profilePicture: 1,
          lastActiveAt: 1,
        },
      }
    )
    .sort({ lastActiveAt: -1, username: 1 })
    .limit(20)
    .toArray();

  return users.map((user) => ({
    id: String(user._id),
    username: user.username,
    profilePicture: user.profilePicture || "",
    lastActiveAt: user.lastActiveAt,
  }));
}

async function getMessages() {
  const messages = await ChatMessage.find({})
    .sort({ createdAt: -1 })
    .limit(MAX_CHAT_MESSAGES)
    .populate("senderId", "username profilePicture")
    .lean();

  return messages.reverse().map((message) => ({
    id: String(message._id),
    content: message.content,
    createdAt: message.createdAt,
    sender: {
      id: String(message.senderId?._id || ""),
      username: message.senderId?.username || "Unknown user",
      profilePicture: message.senderId?.profilePicture || "",
    },
  }));
}

async function handler(req, res) {
  if (req.method === "GET") {
    await updatePresence(req.user.id);

    const [messages, onlineUsers] = await Promise.all([
      getMessages(),
      getOnlineUsers(),
    ]);

    return res.status(200).json({
      success: true,
      messages,
      onlineUsers,
      limits: {
        maxMessages: MAX_CHAT_MESSAGES,
      },
    });
  }

  if (req.method === "POST") {
    if (!assertSameOrigin(req)) {
      return res
        .status(403)
        .json({ success: false, message: "Invalid request origin" });
    }

    const content = String(req.body?.content || "").trim();

    if (!content) {
      return res.status(400).json({
        success: false,
        message: "Message cannot be empty",
      });
    }

    if (content.length > 300) {
      return res.status(400).json({
        success: false,
        message: "Message is too long",
      });
    }

    await updatePresence(req.user.id);

    const message = await ChatMessage.create({
      senderId: req.user.id,
      content,
    });

    await trimChatHistory();

    const populatedMessage = await ChatMessage.findById(message._id)
      .populate("senderId", "username profilePicture")
      .lean();

    return res.status(201).json({
      success: true,
      message: {
        id: String(populatedMessage._id),
        content: populatedMessage.content,
        createdAt: populatedMessage.createdAt,
        sender: {
          id: String(populatedMessage.senderId?._id || ""),
          username: populatedMessage.senderId?.username || req.user.username,
          profilePicture: populatedMessage.senderId?.profilePicture || "",
        },
      },
    });
  }

  return res.status(405).json({
    success: false,
    message: "Method not allowed",
  });
}

export default withAuth(async (req, res) => {
  try {
    await connectDB();
    return handler(req, res);
  } catch (error) {
    console.error("Chat API error:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to process chat request",
    });
  }
});
