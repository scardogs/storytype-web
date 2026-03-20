export function getDefaultTrainingData() {
  return {
    modules: [
      {
        slug: "beginner-foundations",
        title: "Beginner Foundations",
        description:
          "Learn posture, home-row placement, and controlled word typing with guided lessons.",
        category: "beginner",
        difficulty: "easy",
        estimatedDuration: 25,
        tags: ["posture", "home-row", "accuracy"],
        icon: "target",
        color: "green",
      },
      {
        slug: "speed-and-accuracy",
        title: "Speed and Accuracy",
        description:
          "Build smoother rhythm and stronger control while keeping your accuracy high.",
        category: "advanced",
        difficulty: "medium",
        estimatedDuration: 30,
        tags: ["speed", "consistency", "rhythm"],
        icon: "bolt",
        color: "orange",
      },
      {
        slug: "numbers-and-symbols",
        title: "Numbers and Symbols",
        description:
          "Practice the number row and common symbols used in everyday typing and coding.",
        category: "specialized",
        difficulty: "hard",
        estimatedDuration: 20,
        tags: ["numbers", "symbols", "programming"],
        icon: "hash",
        color: "purple",
      },
    ],
    lessons: [
      {
        moduleSlug: "beginner-foundations",
        title: "Touch Typing Basics",
        description: "Understand posture, finger placement, and how to build muscle memory.",
        lessonType: "theory",
        order: 1,
        difficulty: "easy",
        skills: ["posture", "finger-placement", "home-row"],
        content: {
          instruction:
            "Sit upright, relax your shoulders, and keep your index fingers anchored on F and J. Build consistent movement before chasing speed.",
          expectedWPM: 20,
          timeLimit: 60,
          targetAccuracy: 90,
          specialRules: {
            allowBackspace: true,
            highlightErrors: true,
          },
          hints: [
            "Keep your wrists neutral instead of pressing them into the desk.",
            "Return to the home row after each keystroke.",
            "Watch the screen, not the keyboard.",
          ],
          tips: [
            "Accuracy first. Speed comes later.",
            "Short daily practice sessions work better than rare long ones.",
          ],
        },
      },
      {
        moduleSlug: "beginner-foundations",
        title: "Home Row Repetition",
        description: "Train the left and right hand home-row keys until they feel automatic.",
        lessonType: "practice",
        order: 2,
        difficulty: "easy",
        skills: ["home-row", "accuracy"],
        content: {
          instruction:
            "Type the pattern smoothly and keep each finger returning to its home key.",
          practiceText:
            "asdf jkl; asdf jkl; asdf jkl; fjdk sla; asdf jkl; asdf jkl; fjdk sla;",
          expectedWPM: 24,
          timeLimit: 75,
          targetAccuracy: 95,
          specialRules: {
            allowBackspace: true,
            highlightErrors: true,
          },
          hints: [
            "Keep your fingers relaxed.",
            "Use the same finger for the same key every time.",
          ],
        },
      },
      {
        moduleSlug: "beginner-foundations",
        title: "Common Word Control",
        description: "Practice short, common words while keeping a steady rhythm.",
        lessonType: "drill",
        order: 3,
        difficulty: "easy",
        skills: ["rhythm", "word-typing", "accuracy"],
        content: {
          instruction:
            "Type these common words at a steady pace. Avoid rushing between words.",
          practiceText:
            "the and for with from that this there where their first after before under over",
          expectedWPM: 28,
          timeLimit: 90,
          targetAccuracy: 93,
          specialRules: {
            allowBackspace: true,
            highlightErrors: true,
          },
          hints: [
            "Try to keep the same pace across the full lesson.",
            "Focus on clean spaces between words.",
          ],
        },
      },
      {
        moduleSlug: "speed-and-accuracy",
        title: "Smooth Speed Burst",
        description: "Push your speed without losing control of your typing rhythm.",
        lessonType: "practice",
        order: 1,
        difficulty: "medium",
        skills: ["speed", "rhythm", "consistency"],
        content: {
          instruction:
            "Type fluidly. Your hands should move lightly instead of forcing every key.",
          practiceText:
            "quick motion creates steady speed when each word flows into the next without tension or panic",
          expectedWPM: 42,
          timeLimit: 60,
          targetAccuracy: 94,
          specialRules: {
            allowBackspace: true,
            highlightErrors: true,
          },
          hints: [
            "Breathe and keep your shoulders relaxed.",
            "If accuracy drops, slow down slightly and recover.",
          ],
        },
      },
      {
        moduleSlug: "speed-and-accuracy",
        title: "Pressure Accuracy Check",
        description: "Stay precise while typing a denser sentence under time pressure.",
        lessonType: "assessment",
        order: 2,
        difficulty: "medium",
        skills: ["accuracy", "pressure-handling", "control"],
        content: {
          instruction:
            "You only get clean results if you stay deliberate. Prioritize precision over panic.",
          practiceText:
            "programming demands careful thinking because one small mistake can change the behavior of an entire system",
          expectedWPM: 38,
          timeLimit: 75,
          targetAccuracy: 97,
          specialRules: {
            allowBackspace: false,
            highlightErrors: true,
          },
          hints: [
            "Read a word ahead while typing the current one.",
            "Keep your eyes on the screen to catch upcoming punctuation.",
          ],
        },
      },
      {
        moduleSlug: "numbers-and-symbols",
        title: "Number and Symbol Drill",
        description: "Strengthen your reach across the number row and common symbols.",
        lessonType: "drill",
        order: 1,
        difficulty: "hard",
        skills: ["numbers", "symbols", "top-row"],
        content: {
          instruction:
            "Type each sequence carefully. The goal is controlled reach, not frantic speed.",
          practiceText:
            "12345 67890 24680 13579 !@#$% ^&*() []{} ()<> 12345 !@#$%",
          expectedWPM: 26,
          timeLimit: 80,
          targetAccuracy: 90,
          specialRules: {
            allowBackspace: true,
            specialCharacters: true,
            highlightErrors: true,
          },
          hints: [
            "Use the correct shift hand for symbols when possible.",
            "Do not collapse your fingers together while reaching upward.",
          ],
        },
      },
    ],
  };
}
