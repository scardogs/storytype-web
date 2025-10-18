import connectDB from "../../../lib/mongodb";
import TrainingModule from "../../../models/TrainingModule";
import TrainingProgress from "../../../models/TrainingProgress";
import { getUserFromRequest } from "../../../lib/auth";

export default async function handler(req, res) {
  if (req.method === "GET") {
    return getTrainingModules(req, res);
  } else if (req.method === "POST") {
    return createTrainingModule(req, res);
  } else {
    return res
      .status(405)
      .json({ success: false, message: "Method not allowed" });
  }
}

async function getTrainingModules(req, res) {
  try {
    await connectDB();

    const { category, difficulty, userId } = req.query;
    const user = await getUserFromRequest(req);

    // Build filter object
    const filter = { isActive: true };
    if (category) filter.category = category;
    if (difficulty) filter.difficulty = difficulty;

    const modules = await TrainingModule.find(filter)
      .populate("lessons.lessonId", "title description lessonType order")
      .sort({ category: 1, difficulty: 1, createdAt: 1 });

    // If user is authenticated, get their progress for each module
    if (user) {
      const progress = await TrainingProgress.find({
        userId: user,
        moduleId: { $in: modules.map((m) => m._id) },
      });

      const progressMap = {};
      progress.forEach((p) => {
        if (!progressMap[p.moduleId]) {
          progressMap[p.moduleId] = [];
        }
        progressMap[p.moduleId].push(p);
      });

      // Add progress information to modules
      modules.forEach((module) => {
        const moduleProgress = progressMap[module._id] || [];
        const completedLessons = moduleProgress.filter(
          (p) => p.status === "completed"
        ).length;
        const totalLessons = module.lessons.length;

        module.progress = {
          completedLessons,
          totalLessons,
          completionRate:
            totalLessons > 0
              ? Math.round((completedLessons / totalLessons) * 100)
              : 0,
          isUnlocked: checkModuleUnlockStatus(
            module,
            progressMap[module._id] || []
          ),
        };
      });
    }

    res.status(200).json({
      success: true,
      modules,
    });
  } catch (error) {
    console.error("Error fetching training modules:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch training modules",
    });
  }
}

async function createTrainingModule(req, res) {
  try {
    await connectDB();

    const userId = await getUserFromRequest(req);
    if (!userId) {
      return res
        .status(401)
        .json({ success: false, message: "Authentication required" });
    }

    const {
      title,
      description,
      category,
      difficulty,
      estimatedDuration,
      tags,
      icon,
      color,
    } = req.body;

    // Validate required fields
    if (
      !title ||
      !description ||
      !category ||
      !difficulty ||
      !estimatedDuration
    ) {
      return res.status(400).json({
        success: false,
        message: "Missing required fields",
      });
    }

    const trainingModule = new TrainingModule({
      title,
      description,
      category,
      difficulty,
      estimatedDuration,
      tags: tags || [],
      icon: icon || "🎯",
      color: color || "blue",
    });

    await trainingModule.save();

    res.status(201).json({
      success: true,
      module: trainingModule,
    });
  } catch (error) {
    console.error("Error creating training module:", error);
    res.status(500).json({
      success: false,
      message: "Failed to create training module",
    });
  }
}

function checkModuleUnlockStatus(module, userProgress) {
  // If no prerequisites, module is unlocked
  if (!module.prerequisites || module.prerequisites.length === 0) {
    return true;
  }

  // Check if user has completed prerequisite modules with required scores
  // This is a simplified check - in a real implementation, you'd check actual progress
  return true; // For now, all modules are unlocked
}
