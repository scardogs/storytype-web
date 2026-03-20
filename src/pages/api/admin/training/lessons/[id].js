import { withAdminAuth, requirePermission } from "../../../../../lib/adminAuth";
import connectDB from "../../../../../lib/mongodb";
import TrainingLesson from "../../../../../models/TrainingLesson";
import TrainingModule from "../../../../../models/TrainingModule";
import { createBroadcastNotification } from "../../../../../lib/notifications";

export default async function handler(req, res) {
  if (req.method === "GET") {
    return getLesson(req, res);
  } else if (req.method === "PUT") {
    return updateLesson(req, res);
  } else if (req.method === "DELETE") {
    return deleteLesson(req, res);
  } else {
    return res.status(405).json({
      success: false,
      message: "Method not allowed",
    });
  }
}

const getLesson = withAdminAuth(
  requirePermission("trainingManagement")(async (req, res) => {
    try {
      await connectDB();

      const { id } = req.query;

      const lesson = await TrainingLesson.findById(id).populate(
        "moduleId",
        "title category difficulty"
      );

      if (!lesson) {
        return res.status(404).json({
          success: false,
          message: "Training lesson not found",
        });
      }

      res.status(200).json({
        success: true,
        lesson,
      });
    } catch (error) {
      console.error("Get lesson error:", error);
      res.status(500).json({
        success: false,
        message: "Failed to fetch lesson details",
      });
    }
  })
);

const updateLesson = withAdminAuth(
  requirePermission("trainingManagement")(async (req, res) => {
    try {
      await connectDB();

      const { id } = req.query;
      const updateData = req.body;
      const previousLesson = await TrainingLesson.findById(id).lean();

      // Remove fields that shouldn't be updated directly
      delete updateData._id;
      delete updateData.createdAt;

      const lesson = await TrainingLesson.findByIdAndUpdate(
        id,
        { $set: updateData },
        { new: true, runValidators: true }
      ).populate("moduleId", "title category");

      if (!lesson) {
        return res.status(404).json({
          success: false,
          message: "Training lesson not found",
        });
      }

      if (
        previousLesson &&
        String(previousLesson.moduleId) !== String(lesson.moduleId?._id || lesson.moduleId)
      ) {
        await TrainingModule.findByIdAndUpdate(previousLesson.moduleId, {
          $pull: {
            lessons: {
              lessonId: lesson._id,
            },
          },
          $inc: { totalLessons: -1 },
        });

        await TrainingModule.findByIdAndUpdate(lesson.moduleId?._id || lesson.moduleId, {
          $push: {
            lessons: {
              lessonId: lesson._id,
              order: lesson.order,
            },
          },
          $inc: { totalLessons: 1 },
        });
      } else {
        await TrainingModule.findOneAndUpdate(
          { "lessons.lessonId": lesson._id },
          {
            $set: {
              "lessons.$.order": lesson.order,
            },
          }
        );
      }

      await createBroadcastNotification({
        title: "Training lesson updated",
        message: `${lesson.title} has been updated.`,
        type: "training",
        actionUrl: lesson.moduleId?._id
          ? `/training/modules/${lesson.moduleId._id}`
          : "/training",
        entityType: "training-lesson",
        entityId: lesson._id,
        admin: req.admin,
      });

      res.status(200).json({
        success: true,
        message: "Training lesson updated successfully",
        lesson,
      });
    } catch (error) {
      console.error("Update lesson error:", error);
      res.status(500).json({
        success: false,
        message: "Failed to update training lesson",
      });
    }
  })
);

const deleteLesson = withAdminAuth(
  requirePermission("trainingManagement")(async (req, res) => {
    try {
      await connectDB();

      const { id } = req.query;

      const lesson = await TrainingLesson.findById(id);
      if (!lesson) {
        return res.status(404).json({
          success: false,
          message: "Training lesson not found",
        });
      }

      await TrainingLesson.findByIdAndDelete(id);
      await TrainingModule.findByIdAndUpdate(lesson.moduleId, {
        $pull: {
          lessons: {
            lessonId: lesson._id,
          },
        },
        $inc: { totalLessons: -1 },
      });

      await createBroadcastNotification({
        title: "Training lesson removed",
        message: `${lesson.title} was removed from training.`,
        type: "training",
        actionUrl: "/training",
        entityType: "training-lesson",
        entityId: lesson._id,
        admin: req.admin,
      });

      res.status(200).json({
        success: true,
        message: "Training lesson deleted successfully",
      });
    } catch (error) {
      console.error("Delete lesson error:", error);
      res.status(500).json({
        success: false,
        message: "Failed to delete training lesson",
      });
    }
  })
);
