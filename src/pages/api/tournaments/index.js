import connectDB from "../../../lib/mongodb";
import Tournament from "../../../models/Tournament";
import { getUserFromRequest } from "../../../lib/auth";

export default async function handler(req, res) {
  if (req.method === "GET") {
    return getTournaments(req, res);
  } else if (req.method === "POST") {
    return createTournament(req, res);
  } else {
    return res
      .status(405)
      .json({ success: false, message: "Method not allowed" });
  }
}

async function getTournaments(req, res) {
  try {
    await connectDB();

    const { status, type, theme, limit = 10, page = 1 } = req.query;

    // Build filter object
    const filter = {};
    if (status) filter.status = status;
    if (type) filter.type = type;
    if (theme) filter.theme = theme;

    // Calculate pagination
    const skip = (parseInt(page) - 1) * parseInt(limit);

    const tournaments = await Tournament.find(filter)
      .populate("createdBy", "username profilePicture")
      .populate("participants.userId", "username profilePicture")
      .populate("winners.first", "username profilePicture")
      .populate("winners.second", "username profilePicture")
      .populate("winners.third", "username profilePicture")
      .sort({ startDate: 1 })
      .skip(skip)
      .limit(parseInt(limit));

    const total = await Tournament.countDocuments(filter);

    res.status(200).json({
      success: true,
      tournaments,
      pagination: {
        current: parseInt(page),
        total: Math.ceil(total / parseInt(limit)),
        count: tournaments.length,
        totalCount: total,
      },
    });
  } catch (error) {
    console.error("Error fetching tournaments:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch tournaments",
    });
  }
}

async function createTournament(req, res) {
  try {
    await connectDB();

    // Use the proper auth function to get user ID from request
    const userId = await getUserFromRequest(req);

    if (!userId) {
      return res
        .status(401)
        .json({ success: false, message: "Authentication required" });
    }

    const {
      name,
      description,
      type,
      theme,
      rules,
      prizes,
      startDate,
      endDate,
      registrationDeadline,
    } = req.body;

    // Validate required fields
    if (
      !name ||
      !description ||
      !type ||
      !theme ||
      !startDate ||
      !endDate ||
      !registrationDeadline
    ) {
      return res.status(400).json({
        success: false,
        message: "Missing required fields",
      });
    }

    // Validate dates
    const now = new Date();
    const start = new Date(startDate);
    const end = new Date(endDate);
    const deadline = new Date(registrationDeadline);

    if (start <= now) {
      return res.status(400).json({
        success: false,
        message: "Start date must be in the future",
      });
    }

    if (end <= start) {
      return res.status(400).json({
        success: false,
        message: "End date must be after start date",
      });
    }

    if (deadline >= start) {
      return res.status(400).json({
        success: false,
        message: "Registration deadline must be before start date",
      });
    }

    const tournament = new Tournament({
      name,
      description,
      type,
      theme,
      rules: {
        allowBackspace: rules?.allowBackspace ?? true,
        numbersOnly: rules?.numbersOnly ?? false,
        specialCharacters: rules?.specialCharacters ?? false,
        timeLimit: rules?.timeLimit ?? 60,
        maxParticipants: rules?.maxParticipants ?? 100,
      },
      prizes: prizes || {
        firstPlace: "Gold Trophy",
        secondPlace: "Silver Trophy",
        thirdPlace: "Bronze Trophy",
      },
      startDate: start,
      endDate: end,
      registrationDeadline: deadline,
      createdBy: userId,
    });

    await tournament.save();
    await tournament.populate("createdBy", "username profilePicture");

    res.status(201).json({
      success: true,
      tournament,
    });
  } catch (error) {
    console.error("Error creating tournament:", error);
    res.status(500).json({
      success: false,
      message: "Failed to create tournament",
    });
  }
}
