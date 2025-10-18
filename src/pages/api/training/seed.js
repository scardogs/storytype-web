import connectDB from "../../../lib/mongodb";
import TrainingModule from "../../../models/TrainingModule";
import TrainingLesson from "../../../models/TrainingLesson";

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res
      .status(405)
      .json({ success: false, message: "Method not allowed" });
  }

  try {
    await connectDB();

    // Clear existing data
    await TrainingModule.deleteMany({});
    await TrainingLesson.deleteMany({});

    // Create training modules
    const modules = [
      {
        title: "Beginner Typing Course",
        description:
          "Learn the fundamentals of touch typing with proper finger placement and basic techniques.",
        category: "beginner",
        difficulty: "easy",
        estimatedDuration: 30,
        tags: ["finger-placement", "home-row", "basic-typing"],
        icon: "🎯",
        color: "green",
      },
      {
        title: "Speed Building Techniques",
        description:
          "Advanced techniques to increase your typing speed while maintaining accuracy.",
        category: "advanced",
        difficulty: "medium",
        estimatedDuration: 45,
        tags: ["speed", "accuracy", "technique"],
        icon: "⚡",
        color: "orange",
      },
      {
        title: "Numbers & Symbols Mastery",
        description:
          "Master typing numbers, special characters, and programming symbols.",
        category: "specialized",
        difficulty: "hard",
        estimatedDuration: 25,
        tags: ["numbers", "symbols", "programming"],
        icon: "🔢",
        color: "purple",
      },
      {
        title: "Daily Practice Routine",
        description:
          "Structured daily lessons to maintain and improve your typing skills.",
        category: "daily",
        difficulty: "easy",
        estimatedDuration: 15,
        tags: ["daily", "maintenance", "consistency"],
        icon: "📅",
        color: "blue",
      },
    ];

    const createdModules = [];
    for (const moduleData of modules) {
      const trainingModule = new TrainingModule(moduleData);
      await trainingModule.save();
      createdModules.push(trainingModule);
    }

    // Create lessons for each module
    const lessons = [
      // Beginner Course Lessons
      {
        title: "Introduction to Touch Typing",
        description: "Learn the basics of touch typing and proper posture.",
        moduleId: createdModules[0]._id,
        lessonType: "theory",
        content: {
          instruction:
            "Welcome to touch typing! Learn the fundamentals of proper typing technique.",
          expectedWPM: 20,
          timeLimit: 120,
          targetAccuracy: 90,
          specialRules: {
            allowBackspace: true,
            highlightErrors: true,
          },
          hints: [
            "Keep your fingers on the home row keys",
            "Use proper posture while typing",
            "Don't look at the keyboard",
          ],
          tips: [
            "Practice regularly for best results",
            "Focus on accuracy over speed initially",
          ],
        },
        order: 1,
        difficulty: "easy",
        skills: ["posture", "home-row", "finger-placement"],
      },
      {
        title: "Home Row Practice",
        description: "Master the home row keys: ASDF and JKL;",
        moduleId: createdModules[0]._id,
        lessonType: "practice",
        content: {
          instruction:
            "Practice typing the home row keys without looking at the keyboard.",
          practiceText:
            "asdf jkl; asdf jkl; asdf jkl; asdf jkl; asdf jkl; asdf jkl; asdf jkl; asdf jkl;",
          expectedWPM: 25,
          timeLimit: 90,
          targetAccuracy: 95,
          specialRules: {
            allowBackspace: true,
            highlightErrors: true,
          },
          hints: [
            "Keep your fingers curved and relaxed",
            "Use the correct finger for each key",
            "Practice slowly at first",
          ],
        },
        order: 2,
        difficulty: "easy",
        skills: ["home-row", "finger-placement", "accuracy"],
      },
      {
        title: "Basic Word Practice",
        description:
          "Practice typing common words using home row and adjacent keys.",
        moduleId: createdModules[0]._id,
        lessonType: "drill",
        content: {
          instruction:
            "Type the following words focusing on accuracy and proper technique.",
          practiceText:
            "the quick brown fox jumps over the lazy dog the quick brown fox jumps over the lazy dog",
          expectedWPM: 30,
          timeLimit: 120,
          targetAccuracy: 92,
          specialRules: {
            allowBackspace: true,
            highlightErrors: true,
          },
          hints: [
            "Use proper finger placement",
            "Maintain steady rhythm",
            "Focus on accuracy first",
          ],
        },
        order: 3,
        difficulty: "easy",
        skills: ["word-typing", "rhythm", "accuracy"],
      },

      // Speed Building Lessons
      {
        title: "Speed Drills",
        description: "Practice typing common words and phrases to build speed.",
        moduleId: createdModules[1]._id,
        lessonType: "drill",
        content: {
          instruction:
            "Type as fast as you can while maintaining accuracy. Focus on smooth, fluid movements.",
          practiceText:
            "the quick brown fox jumps over the lazy dog and runs through the forest quickly",
          expectedWPM: 50,
          timeLimit: 60,
          targetAccuracy: 95,
          specialRules: {
            allowBackspace: true,
            highlightErrors: true,
          },
          hints: [
            "Keep your wrists straight",
            "Use minimal finger movement",
            "Maintain consistent rhythm",
          ],
        },
        order: 1,
        difficulty: "medium",
        skills: ["speed", "rhythm", "efficiency"],
      },
      {
        title: "Accuracy Under Pressure",
        description:
          "Practice maintaining accuracy while typing at higher speeds.",
        moduleId: createdModules[1]._id,
        lessonType: "practice",
        content: {
          instruction:
            "Type the following text as accurately as possible. Speed will come with practice.",
          practiceText:
            "programming is the art of telling a computer what to do through code",
          expectedWPM: 45,
          timeLimit: 90,
          targetAccuracy: 98,
          specialRules: {
            allowBackspace: false,
            highlightErrors: true,
          },
          hints: [
            "Focus on accuracy over speed",
            "Use proper finger positioning",
            "Don't rush - steady wins the race",
          ],
        },
        order: 2,
        difficulty: "medium",
        skills: ["accuracy", "pressure-handling", "consistency"],
      },

      // Numbers & Symbols Lessons
      {
        title: "Number Row Mastery",
        description: "Learn to type numbers without looking at the keyboard.",
        moduleId: createdModules[2]._id,
        lessonType: "drill",
        content: {
          instruction:
            "Practice typing numbers using the top row of your keyboard.",
          practiceText:
            "1234567890 0987654321 1234567890 0987654321 1234567890",
          expectedWPM: 35,
          timeLimit: 75,
          targetAccuracy: 90,
          specialRules: {
            allowBackspace: true,
            numbersOnly: true,
            highlightErrors: true,
          },
          hints: [
            "Use your index fingers for 4 and 7",
            "Use your middle fingers for 3 and 8",
            "Practice the number row regularly",
          ],
        },
        order: 1,
        difficulty: "hard",
        skills: ["numbers", "top-row", "finger-stretch"],
      },
      {
        title: "Symbol Typing Challenge",
        description:
          "Master typing special characters and symbols commonly used in programming.",
        moduleId: createdModules[2]._id,
        lessonType: "drill",
        content: {
          instruction:
            "Practice typing symbols and special characters used in programming.",
          practiceText:
            "!@#$%^&*()_+{}|:<>?[]\\;',./ !@#$%^&*()_+{}|:<>?[]\\;',./",
          expectedWPM: 25,
          timeLimit: 90,
          targetAccuracy: 85,
          specialRules: {
            allowBackspace: true,
            specialCharacters: true,
            highlightErrors: true,
          },
          hints: [
            "Use shift key combinations",
            "Practice symbol locations",
            "Focus on accuracy first",
          ],
        },
        order: 2,
        difficulty: "hard",
        skills: ["symbols", "shift-key", "programming"],
      },

      // Daily Practice Lessons
      {
        title: "Daily Warm-up",
        description: "Start your day with a quick typing warm-up exercise.",
        moduleId: createdModules[3]._id,
        lessonType: "practice",
        content: {
          instruction:
            "Complete this quick warm-up to get your fingers moving and ready for the day.",
          practiceText:
            "the quick brown fox jumps over the lazy dog and starts a new day",
          expectedWPM: 40,
          timeLimit: 60,
          targetAccuracy: 95,
          specialRules: {
            allowBackspace: true,
            highlightErrors: true,
          },
          hints: [
            "Focus on smooth movements",
            "Warm up your fingers gradually",
            "Set a good pace for the day",
          ],
        },
        order: 1,
        difficulty: "easy",
        skills: ["warm-up", "daily-practice", "consistency"],
      },
      {
        title: "Speed Check",
        description: "Test your current typing speed and accuracy.",
        moduleId: createdModules[3]._id,
        lessonType: "assessment",
        content: {
          instruction:
            "Type the following text to assess your current speed and accuracy levels.",
          practiceText:
            "typing is a valuable skill that improves with consistent practice and dedication",
          expectedWPM: 35,
          timeLimit: 90,
          targetAccuracy: 92,
          specialRules: {
            allowBackspace: true,
            highlightErrors: true,
          },
          hints: [
            "Type at your natural pace",
            "Focus on accuracy",
            "Don't worry about speed initially",
          ],
        },
        order: 2,
        difficulty: "easy",
        skills: ["assessment", "speed-test", "accuracy-check"],
      },
    ];

    const createdLessons = [];
    for (const lessonData of lessons) {
      const lesson = new TrainingLesson(lessonData);
      await lesson.save();
      createdLessons.push(lesson);
    }

    // Update modules with lesson counts
    for (const trainingModule of createdModules) {
      const lessonCount = createdLessons.filter(
        (lesson) => lesson.moduleId.toString() === trainingModule._id.toString()
      ).length;
      trainingModule.totalLessons = lessonCount;
      await trainingModule.save();
    }

    res.status(200).json({
      success: true,
      message: "Training data seeded successfully",
      modulesCreated: createdModules.length,
      lessonsCreated: createdLessons.length,
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
