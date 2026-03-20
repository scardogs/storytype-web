import TrainingLesson from "../models/TrainingLesson";
import TrainingModule from "../models/TrainingModule";
import { getDefaultTrainingData } from "./defaultTrainingData";

export async function ensureTrainingSeedData({ forceReset = false } = {}) {
  const existingModuleCount = await TrainingModule.countDocuments();

  if (!forceReset && existingModuleCount > 0) {
    return {
      modulesCreated: existingModuleCount,
      lessonsCreated: await TrainingLesson.countDocuments(),
      seeded: false,
    };
  }

  if (forceReset) {
    await TrainingLesson.deleteMany({});
    await TrainingModule.deleteMany({});
  }

  const data = getDefaultTrainingData();
  const createdModules = new Map();

  for (const moduleData of data.modules) {
    const { slug, ...moduleFields } = moduleData;
    const trainingModule = await TrainingModule.create(moduleFields);
    createdModules.set(slug, trainingModule);
  }

  const createdLessons = [];

  for (const lessonData of data.lessons) {
    const trainingModule = createdModules.get(lessonData.moduleSlug);
    if (!trainingModule) {
      throw new Error(`Missing training module for slug: ${lessonData.moduleSlug}`);
    }

    const { moduleSlug, ...lessonFields } = lessonData;
    const lesson = await TrainingLesson.create({
      ...lessonFields,
      moduleId: trainingModule._id,
    });

    createdLessons.push(lesson);
  }

  for (const trainingModule of createdModules.values()) {
    const moduleLessons = createdLessons
      .filter((lesson) => lesson.moduleId.toString() === trainingModule._id.toString())
      .sort((a, b) => a.order - b.order)
      .map((lesson) => ({
        lessonId: lesson._id,
        order: lesson.order,
      }));

    trainingModule.lessons = moduleLessons;
    trainingModule.totalLessons = moduleLessons.length;
    await trainingModule.save();
  }

  return {
    modulesCreated: createdModules.size,
    lessonsCreated: createdLessons.length,
    seeded: true,
  };
}
