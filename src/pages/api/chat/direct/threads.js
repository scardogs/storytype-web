import connectDB from "../../../../lib/mongodb";
import { withAuth } from "../../../../lib/withAuth";
import DirectConversation from "../../../../models/DirectConversation";
import DirectMessage from "../../../../models/DirectMessage";
import User from "../../../../models/User";

export default withAuth(async (req, res) => {
  if (req.method !== "GET") {
    return res.status(405).json({ success: false, message: "Method not allowed" });
  }

  try {
    await connectDB();

    const userId = String(req.user.id);
    const conversations = await DirectConversation.find({
      $or: [{ participantA: userId }, { participantB: userId }],
    })
      .sort({ lastMessageAt: -1 })
      .limit(20)
      .lean();

    const targetUserIds = conversations.map((conversation) =>
      String(conversation.participantA) === userId
        ? String(conversation.participantB)
        : String(conversation.participantA)
    );

    const [users, lastMessages] = await Promise.all([
      User.find({ _id: { $in: targetUserIds } })
        .select("username profilePicture lastActiveAt")
        .lean(),
      Promise.all(
        conversations.map((conversation) =>
          DirectMessage.findOne({ conversationId: conversation._id })
            .sort({ createdAt: -1 })
            .select("content createdAt")
            .lean()
        )
      ),
    ]);

    const userMap = new Map(users.map((user) => [String(user._id), user]));

    return res.status(200).json({
      success: true,
      threads: conversations.map((conversation, index) => {
        const targetUserId =
          String(conversation.participantA) === userId
            ? String(conversation.participantB)
            : String(conversation.participantA);
        const targetUser = userMap.get(targetUserId);
        const lastMessage = lastMessages[index];

        return {
          id: String(conversation._id),
          targetUser: {
            id: targetUserId,
            username: targetUser?.username || "Unknown user",
            profilePicture: targetUser?.profilePicture || "",
            lastActiveAt: targetUser?.lastActiveAt || null,
          },
          lastMessage: lastMessage
            ? {
                content: lastMessage.content,
                createdAt: lastMessage.createdAt,
              }
            : null,
        };
      }),
    });
  } catch (error) {
    console.error("Direct threads error:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to fetch direct message threads",
    });
  }
});
