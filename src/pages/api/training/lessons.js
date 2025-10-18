import connectDB from "../../../lib/mongodb";
import TrainingLesson from "../../../models/TrainingLesson";
import TrainingProgress from "../../../models/TrainingProgress";
import { getUserFromRequest } from "../../../lib/auth";

export default async function handler(req, res) {
  if (req.method === "GET") {
    return getTrainingLessons(req, res);
  } else if (req.method === "POST") {
    return createTrainingLesson(req, res);
  } else {
    return res
      .status(405)
      .json({ success: false, message: "Method not allowed" });
  }
}

async function getTrainingLessons(req, res) {
  try {
    await connectDB();

    const { moduleId, lessonType, difficulty } = req.query;
    const user = await getUserFromRequest(req);

    // Build filter object
    const filter = { isActive: true };
    if (moduleId) filter.moduleId = moduleId;
    if (lessonType) filter.lessonType = lessonType;
    if (difficulty) filter.difficulty = difficulty;

    const lessons = await TrainingLesson.find(filter)
      .populate("moduleId", "title category difficulty")
      .sort({ moduleId: 1, order: 1 });

    // If user is authenticated, get their progress for each lesson
    if (user) {
      const progress = await TrainingProgress.find({
        userId: user,
        lessonId: { $in: lessons.map((l) => l._id) },
      });

      const progressMap = {};
      progress.forEach((p) => {
        progressMap[p.lessonId] = p;
      });

      // Add progress information to lessons
      lessons.forEach((lesson) => {
        const lessonProgress = progressMap[lesson._id];
        lesson.userProgress = lessonProgress
          ? {
              status: lessonProgress.status,
              bestScore: lessonProgress.bestScore,
              lastScore: lessonProgress.lastScore,
              attempts: lessonProgress.attempts,
              completedAt: lessonProgress.completedAt,
            }
          : {
              status: "not_started",
              bestScore: { wpm: 0, accuracy: 0 },
              lastScore: { wpm: 0, accuracy: 0 },
              attempts: 0,
              completedAt: null,
            };
      });
    }

    res.status(200).json({
      success: true,
      lessons,
    });
  } catch (error) {
    console.error("Error fetching training lessons:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch training lessons",
    });
  }
}

async function createTrainingLesson(req, res) {
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
      moduleId,
      lessonType,
      content,
      order,
      difficulty,
      skills,
      prerequisites,
    } = req.body;

    // Validate required fields
    if (
      !title ||
      !description ||
      !moduleId ||
      !lessonType ||
      !content ||
      !order ||
      !difficulty
    ) {
      return res.status(400).json({
        success: false,
        message: "Missing required fields",
      });
    }

    const lesson = new TrainingLesson({
      title,
      description,
      moduleId,
      lessonType,
      content,
      order,
      difficulty,
      skills: skills || [],
      prerequisites: prerequisites || [],
    });

    await lesson.save();

    res.status(201).json({
      success: true,
      lesson,
    });
  } catch (error) {
    console.error("Error creating training lesson:", error);
    res.status(500).json({
      success: false,
      message: "Failed to create training lesson",
    });
  }
}
