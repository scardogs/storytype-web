import connectDB from "../../../lib/mongodb";
import TrainingProgress from "../../../models/TrainingProgress";
import TrainingLesson from "../../../models/TrainingLesson";
import UserSkill from "../../../models/UserSkill";
import { getUserFromRequest } from "../../../lib/auth";

export default async function handler(req, res) {
  if (req.method === "GET") {
    return getTrainingProgress(req, res);
  } else if (req.method === "POST") {
    return updateTrainingProgress(req, res);
  } else if (req.method === "PUT") {
    return updateUserSkill(req, res);
  } else {
    return res
      .status(405)
      .json({ success: false, message: "Method not allowed" });
  }
}

async function getTrainingProgress(req, res) {
  try {
    await connectDB();

    const userId = await getUserFromRequest(req);
    if (!userId) {
      return res
        .status(401)
        .json({ success: false, message: "Authentication required" });
    }

    const { moduleId, lessonId } = req.query;

    let filter = { userId };
    if (moduleId) filter.moduleId = moduleId;
    if (lessonId) filter.lessonId = lessonId;

    const progress = await TrainingProgress.find(filter)
      .populate("moduleId", "title category")
      .populate("lessonId", "title lessonType difficulty")
      .sort({ updatedAt: -1 });

    const lessonFilter = { isActive: true };
    if (moduleId) lessonFilter.moduleId = moduleId;
    if (lessonId) lessonFilter._id = lessonId;

    const totalLessonsAvailable = await TrainingLesson.countDocuments(
      lessonFilter
    );

    const completedLessonIds = [
      ...new Set(
        progress
          .filter((p) => p.status === "completed" || p.status === "mastered")
          .map((p) => p.lessonId?._id?.toString() || p.lessonId?.toString())
          .filter(Boolean)
      ),
    ];

    const masteredLessonIds = [
      ...new Set(
        progress
          .filter((p) => p.status === "mastered")
          .map((p) => p.lessonId?._id?.toString() || p.lessonId?.toString())
          .filter(Boolean)
      ),
    ];

    // Get user skills
    const userSkills = await UserSkill.find({ userId });

    const completedLessonIdSet = new Set(completedLessonIds);
    const weakestSkill = [...userSkills]
      .sort((a, b) => a.score - b.score)
      .find((skill) => skill.score < 80);

    const lessonQuery = { isActive: true };
    if (moduleId) lessonQuery.moduleId = moduleId;

    const allLessons = await TrainingLesson.find(lessonQuery)
      .populate("moduleId", "title category color")
      .sort({ order: 1 });

    const candidateLessons =
      weakestSkill && weakestSkill.skillName
        ? allLessons.filter(
            (lesson) =>
              lesson.skills?.some(
                (skillName) =>
                  skillName.toLowerCase() === weakestSkill.skillName.toLowerCase()
              ) &&
              !completedLessonIdSet.has(lesson._id.toString())
          )
        : [];

    const fallbackLesson = allLessons.find(
      (lesson) => !completedLessonIdSet.has(lesson._id.toString())
    );

    const recommendedLesson = candidateLessons[0] || fallbackLesson || null;

    res.status(200).json({
      success: true,
      progress,
      userSkills,
      stats: {
        totalLessonsAvailable,
        completedLessons: completedLessonIds.length,
        masteredLessons: masteredLessonIds.length,
      },
      recommendation: recommendedLesson
        ? {
            lessonId: recommendedLesson._id,
            lessonTitle: recommendedLesson.title,
            lessonType: recommendedLesson.lessonType,
            lessonDescription: recommendedLesson.description,
            moduleId: recommendedLesson.moduleId?._id || recommendedLesson.moduleId,
            moduleTitle: recommendedLesson.moduleId?.title || "Training Module",
            moduleCategory: recommendedLesson.moduleId?.category || "training",
            moduleColor: recommendedLesson.moduleId?.color || "teal",
            targetWPM: recommendedLesson.content?.expectedWPM || 0,
            targetAccuracy: recommendedLesson.content?.targetAccuracy || 0,
            reason: weakestSkill
              ? `Your ${weakestSkill.skillName} skill is currently the weakest.`
              : "This is your next incomplete lesson.",
          }
        : null,
    });
  } catch (error) {
    console.error("Error fetching training progress:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch training progress",
    });
  }
}

async function updateTrainingProgress(req, res) {
  try {
    await connectDB();

    const userId = await getUserFromRequest(req);
    if (!userId) {
      return res
        .status(401)
        .json({ success: false, message: "Authentication required" });
    }

    const {
      moduleId,
      lessonId,
      wpm,
      accuracy,
      timeCompleted,
      errors,
      wordsTyped,
      timeSpent,
    } = req.body;

    // Validate required fields
    if (!moduleId || !lessonId || wpm === undefined || accuracy === undefined) {
      return res.status(400).json({
        success: false,
        message: "Missing required fields",
      });
    }

    // Get or create progress record
    let progress = await TrainingProgress.findOne({
      userId,
      moduleId,
      lessonId,
    });

    if (!progress) {
      progress = new TrainingProgress({
        userId,
        moduleId,
        lessonId,
      });
    }

    // Update progress
    progress.attempts += 1;
    progress.lastScore = {
      wpm,
      accuracy,
      timeCompleted,
      errors: errors || 0,
      wordsTyped: wordsTyped || 0,
    };

    // Update best score if current score is better
    if (
      wpm > progress.bestScore.wpm ||
      (wpm === progress.bestScore.wpm && accuracy > progress.bestScore.accuracy)
    ) {
      progress.bestScore = {
        wpm,
        accuracy,
        timeCompleted,
      };
    }

    // Update status based on performance
    const lesson = await TrainingLesson.findById(lessonId);
    if (lesson) {
      if (
        accuracy >= lesson.content.targetAccuracy &&
        wpm >= lesson.content.expectedWPM
      ) {
        progress.status = "mastered";
        progress.completedAt = new Date();
      } else if (accuracy >= lesson.content.targetAccuracy * 0.8) {
        progress.status = "completed";
        progress.completedAt = new Date();
      } else {
        progress.status = "in_progress";
      }
    }

    if (timeSpent) {
      progress.timeSpent += timeSpent;
    }

    await progress.save();

    // Update user skills based on lesson skills
    if (lesson && lesson.skills) {
      for (const skillName of lesson.skills) {
        await updateUserSkillForLesson(userId, skillName, wpm, accuracy);
      }
    }

    res.status(200).json({
      success: true,
      progress,
    });
  } catch (error) {
    console.error("Error updating training progress:", error);
    res.status(500).json({
      success: false,
      message: "Failed to update training progress",
    });
  }
}

async function updateUserSkill(req, res) {
  try {
    await connectDB();

    const userId = await getUserFromRequest(req);
    if (!userId) {
      return res
        .status(401)
        .json({ success: false, message: "Authentication required" });
    }

    const { skillName, skillCategory, score, averageWPM, averageAccuracy } =
      req.body;

    if (!skillName || !skillCategory) {
      return res.status(400).json({
        success: false,
        message: "Missing required fields",
      });
    }

    let userSkill = await UserSkill.findOne({
      userId,
      skillName,
    });

    if (!userSkill) {
      userSkill = new UserSkill({
        userId,
        skillName,
        skillCategory,
      });
    }

    // Update skill data
    if (score !== undefined) userSkill.score = score;
    if (averageWPM !== undefined) userSkill.averageWPM = averageWPM;
    if (averageAccuracy !== undefined)
      userSkill.averageAccuracy = averageAccuracy;

    userSkill.lastPracticed = new Date();

    await userSkill.save();

    res.status(200).json({
      success: true,
      userSkill,
    });
  } catch (error) {
    console.error("Error updating user skill:", error);
    res.status(500).json({
      success: false,
      message: "Failed to update user skill",
    });
  }
}

async function updateUserSkillForLesson(userId, skillName, wpm, accuracy) {
  try {
    let userSkill = await UserSkill.findOne({
      userId,
      skillName,
    });

    if (!userSkill) {
      userSkill = new UserSkill({
        userId,
        skillName,
        skillCategory: "typing", // default category
      });
    }

    // Update skill metrics
    userSkill.sessionsCompleted += 1;
    userSkill.averageWPM = (userSkill.averageWPM + wpm) / 2;
    userSkill.averageAccuracy = (userSkill.averageAccuracy + accuracy) / 2;
    userSkill.score = Math.min(100, Math.round((accuracy + wpm / 2) / 2));
    userSkill.lastPracticed = new Date();

    await userSkill.save();
  } catch (error) {
    console.error("Error updating user skill for lesson:", error);
  }
}
