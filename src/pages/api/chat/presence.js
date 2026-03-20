import connectDB from "../../../lib/mongodb";
import { withAuth } from "../../../lib/withAuth";
import { assertSameOrigin } from "../../../lib/security";
import User from "../../../models/User";

export default withAuth(async (req, res) => {
  if (req.method !== "POST") {
    return res.status(405).json({ success: false, message: "Method not allowed" });
  }

  if (!assertSameOrigin(req)) {
    return res.status(403).json({ success: false, message: "Invalid request origin" });
  }

  try {
    await connectDB();

    await User.collection.updateOne(
      { _id: User.db.base.Types.ObjectId.createFromHexString(String(req.user.id)) },
      {
        $set: { lastActiveAt: new Date() },
      }
    );

    return res.status(200).json({ success: true });
  } catch (error) {
    console.error("Presence heartbeat error:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to update presence",
    });
  }
});
