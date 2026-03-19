import { withAdminAuth, requirePermission } from "../../../../../lib/adminAuth";
import connectDB from "../../../../../lib/mongodb";
import TrainingLesson from "../../../../../models/TrainingLesson";

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
