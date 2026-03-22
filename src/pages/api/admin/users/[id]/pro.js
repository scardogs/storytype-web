import { withAdminAuth, requirePermission } from "../../../../../lib/adminAuth";
import connectDB from "../../../../../lib/mongodb";
import User from "../../../../../models/User";
import { buildUserPayload } from "../../../../../lib/pro";

const handler = async (req, res) => {
  if (req.method !== "PATCH") {
    return res.status(405).json({
      success: false,
      message: "Method not allowed",
    });
  }

  try {
    await connectDB();

    const { id } = req.query;
    const { isPro } = req.body;

    if (typeof isPro !== "boolean") {
      return res.status(400).json({
        success: false,
        message: "isPro must be provided as a boolean.",
      });
    }

    const update = isPro
      ? {
          plan: "pro",
          proStatus: "active",
          proGrantedAt: new Date(),
          proSource: "admin",
        }
      : {
          plan: "free",
          proStatus: "inactive",
          proGrantedAt: null,
          proSource: "",
        };

    const user = await User.findByIdAndUpdate(id, { $set: update }, { new: true }).lean();

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    return res.status(200).json({
      success: true,
      message: isPro ? "User upgraded to StoryType Pro." : "StoryType Pro removed from user.",
      user: buildUserPayload(user),
    });
  } catch (error) {
    console.error("Update user pro status error:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to update StoryType Pro status",
    });
  }
};

export default withAdminAuth(requirePermission("userManagement")(handler));
