import { withAdminAuth, requirePermission } from "../../../../../lib/adminAuth";
import connectDB from "../../../../../lib/mongodb";
import TrainingModule from "../../../../../models/TrainingModule";
import TrainingLesson from "../../../../../models/TrainingLesson";

export default async function handler(req, res) {
  if (req.method === "GET") {
    return getModule(req, res);
  } else if (req.method === "PUT") {
    return updateModule(req, res);
  } else if (req.method === "DELETE") {
    return deleteModule(req, res);
  } else {
    return res.status(405).json({
      success: false,
      message: "Method not allowed",
    });
  }
}

const getModule = withAdminAuth(
  requirePermission("trainingManagement")(async (req, res) => {
    try {
      await connectDB();

      const { id } = req.query;

      const trainingModule = await TrainingModule.findById(id).populate(
        "lessons.lessonId",
        "title order lessonType difficulty"
      );

      if (!trainingModule) {
        return res.status(404).json({
          success: false,
          message: "Training module not found",
        });
      }

      res.status(200).json({
        success: true,
        module: trainingModule,
      });
    } catch (error) {
      console.error("Get module error:", error);
      res.status(500).json({
        success: false,
        message: "Failed to fetch module details",
      });
    }
  })
);

const updateModule = withAdminAuth(
  requirePermission("trainingManagement")(async (req, res) => {
    try {
      await connectDB();

      const { id } = req.query;
      const updateData = req.body;

      // Remove fields that shouldn't be updated directly
      delete updateData._id;
      delete updateData.createdAt;

      const trainingModule = await TrainingModule.findByIdAndUpdate(
        id,
        { $set: updateData },
        { new: true, runValidators: true }
      );

      if (!trainingModule) {
        return res.status(404).json({
          success: false,
          message: "Training module not found",
        });
      }

      res.status(200).json({
        success: true,
        message: "Training module updated successfully",
        module: trainingModule,
      });
    } catch (error) {
      console.error("Update module error:", error);
      res.status(500).json({
        success: false,
        message: "Failed to update training module",
      });
    }
  })
);

const deleteModule = withAdminAuth(
  requirePermission("trainingManagement")(async (req, res) => {
    try {
      await connectDB();

      const { id } = req.query;

      const trainingModule = await TrainingModule.findById(id);
      if (!trainingModule) {
        return res.status(404).json({
          success: false,
          message: "Training module not found",
        });
      }

      // Check if module has lessons
      const lessonsInModule = await TrainingLesson.find({ moduleId: id });
      if (lessonsInModule.length > 0) {
        return res.status(400).json({
          success: false,
          message:
            "Cannot delete module with lessons. Please delete all lessons first.",
        });
      }

      await TrainingModule.findByIdAndDelete(id);

      res.status(200).json({
        success: true,
        message: "Training module deleted successfully",
      });
    } catch (error) {
      console.error("Delete module error:", error);
      res.status(500).json({
        success: false,
        message: "Failed to delete training module",
      });
    }
  })
);
