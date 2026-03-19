import { withAdminAuth, requirePermission } from "../../../../lib/adminAuth";
import connectDB from "../../../../lib/mongodb";
import Content from "../../../../models/Content";

const handler = async (req, res) => {
  if (req.method === "GET") {
    return getContents(req, res);
  } else if (req.method === "POST") {
    return createContent(req, res);
  } else {
    return res.status(405).json({
      success: false,
      message: "Method not allowed",
    });
  }
};

const getContents = withAdminAuth(
  requirePermission("contentManagement")(async (req, res) => {
    try {
      await connectDB();

      const {
        page = 1,
        limit = 50,
        search = "",
        type = "",
        genre = "",
        difficulty = "",
        sortBy = "createdAt",
        sortOrder = "desc",
      } = req.query;

      const skip = (parseInt(page) - 1) * parseInt(limit);
      const searchRegex = new RegExp(search, "i");

      // Build query
      const query = {};

      if (search) {
        query.$or = [
          { title: searchRegex },
          { description: searchRegex },
          { author: searchRegex },
          { content: searchRegex },
        ];
      }

      if (type) {
        query.type = type;
      }

      if (genre) {
        query.genre = genre;
      }

      if (difficulty) {
        query.difficulty = difficulty;
      }

      // Build sort object
      const sort = {};
      sort[sortBy] = sortOrder === "desc" ? -1 : 1;

      // Get contents with pagination
      const contents = await Content.find(query)
        .sort(sort)
        .skip(skip)
        .limit(parseInt(limit))
        .populate("createdBy", "username")
        .populate("lastModifiedBy", "username");

      // Get total count for pagination
      const totalContents = await Content.countDocuments(query);

      // Get content statistics
      const stats = {
        totalContents,
        activeContents: await Content.countDocuments({ isActive: true }),
        featuredContents: await Content.countDocuments({ isFeatured: true }),
        contentsByType: await Content.aggregate([
          { $group: { _id: "$type", count: { $sum: 1 } } },
        ]),
        contentsByGenre: await Content.aggregate([
          { $group: { _id: "$genre", count: { $sum: 1 } } },
        ]),
        contentsByDifficulty: await Content.aggregate([
          { $group: { _id: "$difficulty", count: { $sum: 1 } } },
        ]),
        totalWords: await Content.aggregate([
          { $group: { _id: null, total: { $sum: "$wordCount" } } },
        ]),
      };

      res.status(200).json({
        success: true,
        contents,
        pagination: {
          page: parseInt(page),
          limit: parseInt(limit),
          total: totalContents,
          pages: Math.ceil(totalContents / parseInt(limit)),
        },
        stats,
      });
    } catch (error) {
      console.error("Get contents error:", error);
      res.status(500).json({
        success: false,
        message: "Failed to fetch contents",
      });
    }
  })
);

const createContent = withAdminAuth(
  requirePermission("contentManagement")(async (req, res) => {
    try {
      await connectDB();

      const contentData = {
        ...req.body,
        createdBy: req.admin._id,
        lastModifiedBy: req.admin._id,
      };

      const content = new Content(contentData);
      await content.save();

      // Populate the created content
      await content.populate("createdBy", "username");

      res.status(201).json({
        success: true,
        message: "Content created successfully",
        content,
      });
    } catch (error) {
      console.error("Create content error:", error);
      res.status(500).json({
        success: false,
        message: "Failed to create content",
      });
    }
  })
);

export default handler;
