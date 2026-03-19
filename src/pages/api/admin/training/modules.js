import { withAdminAuth, requirePermission } from "../../../../lib/adminAuth";
import connectDB from "../../../../lib/mongodb";
import TrainingModule from "../../../../models/TrainingModule";
import TrainingLesson from "../../../../models/TrainingLesson";

const handler = async (req, res) => {
  if (req.method === "GET") {
    return getModules(req, res);
  } else if (req.method === "POST") {
    return createModule(req, res);
  } else {
    return res.status(405).json({
      success: false,
      message: "Method not allowed",
    });
  }
};

const getModules = withAdminAuth(
  requirePermission("trainingManagement")(async (req, res) => {
    try {
      await connectDB();

      const {
        page = 1,
        limit = 50,
        search = "",
        category = "",
        difficulty = "",
        sortBy = "createdAt",
        sortOrder = "desc",
      } = req.query;

      const skip = (parseInt(page) - 1) * parseInt(limit);
      const searchRegex = new RegExp(search, "i");

      // Build query
      const query = {};

      if (search) {
        query.$or = [{ title: searchRegex }, { description: searchRegex }];
      }

      if (category) {
        query.category = category;
      }

      if (difficulty) {
        query.difficulty = difficulty;
      }

      // Build sort object
      const sort = {};
      sort[sortBy] = sortOrder === "desc" ? -1 : 1;

      // Get modules with pagination
      const modules = await TrainingModule.find(query)
        .sort(sort)
        .skip(skip)
        .limit(parseInt(limit))
        .populate("lessons.lessonId", "title order");

      // Get total count for pagination
      const totalModules = await TrainingModule.countDocuments(query);

      // Get module statistics
      const stats = {
        totalModules,
        activeModules: await TrainingModule.countDocuments({ isActive: true }),
        totalLessons: await TrainingLesson.countDocuments({ isActive: true }),
      };

      res.status(200).json({
        success: true,
        modules,
        pagination: {
          page: parseInt(page),
          limit: parseInt(limit),
          total: totalModules,
          pages: Math.ceil(totalModules / parseInt(limit)),
        },
        stats,
      });
    } catch (error) {
      console.error("Get modules error:", error);
      res.status(500).json({
        success: false,
        message: "Failed to fetch training modules",
      });
    }
  })
);

const createModule = withAdminAuth(
  requirePermission("trainingManagement")(async (req, res) => {
    try {
      await connectDB();

      const moduleData = req.body;

      const trainingModule = new TrainingModule(moduleData);
      await trainingModule.save();

      res.status(201).json({
        success: true,
        message: "Training module created successfully",
        module: trainingModule,
      });
    } catch (error) {
      console.error("Create module error:", error);
      res.status(500).json({
        success: false,
        message: "Failed to create training module",
      });
    }
  })
);

export default handler;
