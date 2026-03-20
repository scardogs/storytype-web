import DirectConversation from "../models/DirectConversation";
import DirectMessage from "../models/DirectMessage";

export const MAX_DIRECT_MESSAGES = 100;

export function getPairKey(userIdA, userIdB) {
  return [String(userIdA), String(userIdB)].sort().join(":");
}

export async function getOrCreateConversation(userIdA, userIdB) {
  const pairKey = getPairKey(userIdA, userIdB);
  let conversation = await DirectConversation.findOne({ pairKey });

  if (!conversation) {
    const [participantA, participantB] = [String(userIdA), String(userIdB)].sort();
    conversation = await DirectConversation.create({
      participantA,
      participantB,
      pairKey,
      lastMessageAt: new Date(),
    });
  }

  return conversation;
}

export async function trimDirectMessages(conversationId) {
  const count = await DirectMessage.countDocuments({ conversationId });

  if (count <= MAX_DIRECT_MESSAGES) {
    return;
  }

  const overflow = count - MAX_DIRECT_MESSAGES;
  const oldestMessages = await DirectMessage.find({ conversationId })
    .sort({ createdAt: 1 })
    .limit(overflow)
    .select("_id")
    .lean();

  if (oldestMessages.length > 0) {
    await DirectMessage.deleteMany({
      _id: { $in: oldestMessages.map((message) => message._id) },
    });
  }
}
