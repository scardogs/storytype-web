import connectDB from "../../../lib/mongodb";
import { getUserFromRequest } from "../../../lib/auth";
import { assertSameOrigin } from "../../../lib/security";
import Suggestion from "../../../models/Suggestion";
import User from "../../../models/User";

async function handler(req, res) {
  if (req.method === "GET") {
    const suggestions = await Suggestion.find({})
      .sort({ createdAt: -1 })
      .limit(50)
      .lean();

    return res.status(200).json({
      success: true,
      suggestions: suggestions.map((suggestion) => ({
        id: String(suggestion._id),
        title: suggestion.title,
        description: suggestion.description,
        category: suggestion.category,
        status: suggestion.status,
        authorName: suggestion.authorName,
        createdAt: suggestion.createdAt,
      })),
    });
  }

  if (req.method === "POST") {
    if (!assertSameOrigin(req)) {
      return res.status(403).json({
        success: false,
        message: "Invalid request origin",
      });
    }

    const userId = await getUserFromRequest(req);

    if (!userId) {
      return res.status(401).json({
        success: false,
        message: "Please log in to submit a suggestion",
      });
    }

    const title = String(req.body?.title || "").trim();
    const description = String(req.body?.description || "").trim();
    const category = String(req.body?.category || "feature").trim();

    if (!title || !description) {
      return res.status(400).json({
        success: false,
        message: "Title and description are required",
      });
    }

    const user = await User.findById(userId).select("username").lean();

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    const suggestion = await Suggestion.create({
      title,
      description,
      category,
      authorId: userId,
      authorName: user.username,
    });

    return res.status(201).json({
      success: true,
      suggestion: {
        id: String(suggestion._id),
        title: suggestion.title,
        description: suggestion.description,
        category: suggestion.category,
        status: suggestion.status,
        authorName: suggestion.authorName,
        createdAt: suggestion.createdAt,
      },
    });
  }

  return res.status(405).json({
    success: false,
    message: "Method not allowed",
  });
}

export default async function suggestionsHandler(req, res) {
  try {
    await connectDB();
    return handler(req, res);
  } catch (error) {
    console.error("Suggestions API error:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to process suggestion request",
    });
  }
}
