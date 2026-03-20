import connectDB from "../../../lib/mongodb";
import { ensureTrainingSeedData } from "../../../lib/seedTrainingData";

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res
      .status(405)
      .json({ success: false, message: "Method not allowed" });
  }

  try {
    await connectDB();
    const result = await ensureTrainingSeedData({ forceReset: true });

    res.status(200).json({
      success: true,
      message: "Training data seeded successfully",
      modulesCreated: result.modulesCreated,
      lessonsCreated: result.lessonsCreated,
    });
  } catch (error) {
    console.error("Error seeding training data:", error);
    res.status(500).json({
      success: false,
      message: "Failed to seed training data",
      error: error.message,
    });
  }
}
