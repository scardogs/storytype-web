import { withAdminAuth, requirePermission } from "../../../../lib/adminAuth";
import connectDB from "../../../../lib/mongodb";
import TrainingLesson from "../../../../models/TrainingLesson";
import TrainingModule from "../../../../models/TrainingModule";

const handler = async (req, res) => {
  if (req.method === "GET") {
    return getLessons(req, res);
  } else if (req.method === "POST") {
    return createLesson(req, res);
  } else {
    return res.status(405).json({
      success: false,
      message: "Method not allowed",
    });
  }
};

const getLessons = withAdminAuth(
  requirePermission("trainingManagement")(async (req, res) => {
    try {
      await connectDB();

      const {
        page = 1,
        limit = 50,
        search = "",
        lessonType = "",
        difficulty = "",
        moduleId = "",
        sortBy = "order",
        sortOrder = "asc",
      } = req.query;

      const skip = (parseInt(page) - 1) * parseInt(limit);
      const searchRegex = new RegExp(search, "i");

      // Build query
      const query = {};

      if (search) {
        query.$or = [{ title: searchRegex }, { description: searchRegex }];
      }

      if (lessonType) {
        query.lessonType = lessonType;
      }

      if (difficulty) {
        query.difficulty = difficulty;
      }

      if (moduleId) {
        query.moduleId = moduleId;
      }

      // Build sort object
      const sort = {};
      sort[sortBy] = sortOrder === "desc" ? -1 : 1;

      // Get lessons with pagination
      const lessons = await TrainingLesson.find(query)
        .sort(sort)
        .skip(skip)
        .limit(parseInt(limit))
        .populate("moduleId", "title category");

      // Get total count for pagination
      const totalLessons = await TrainingLesson.countDocuments(query);

      // Get lesson statistics
      const stats = {
        totalLessons,
        activeLessons: await TrainingLesson.countDocuments({ isActive: true }),
        lessonsByType: await TrainingLesson.aggregate([
          { $group: { _id: "$lessonType", count: { $sum: 1 } } },
        ]),
        lessonsByDifficulty: await TrainingLesson.aggregate([
          { $group: { _id: "$difficulty", count: { $sum: 1 } } },
        ]),
      };

      res.status(200).json({
        success: true,
        lessons,
        pagination: {
          page: parseInt(page),
          limit: parseInt(limit),
          total: totalLessons,
          pages: Math.ceil(totalLessons / parseInt(limit)),
        },
        stats,
      });
    } catch (error) {
      console.error("Get lessons error:", error);
      res.status(500).json({
        success: false,
        message: "Failed to fetch training lessons",
      });
    }
  })
);

const createLesson = withAdminAuth(
  requirePermission("trainingManagement")(async (req, res) => {
    try {
      await connectDB();

      const lessonData = req.body;

      const lesson = new TrainingLesson(lessonData);
      await lesson.save();

      // Populate the created lesson
      await lesson.populate("moduleId", "title category");

      res.status(201).json({
        success: true,
        message: "Training lesson created successfully",
        lesson,
      });
    } catch (error) {
      console.error("Create lesson error:", error);
      res.status(500).json({
        success: false,
        message: "Failed to create training lesson",
      });
    }
  })
);

export default handler;
