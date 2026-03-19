import { withAdminAuth, requirePermission } from "../../../../lib/adminAuth";
import connectDB from "../../../../lib/mongodb";

// Mock settings storage - in production, you'd use a database or config file
let systemSettings = {
  general: {
    siteName: "StoryType",
    siteDescription: "A modern typing practice application",
    maintenanceMode: false,
    registrationEnabled: true,
    maxUsers: 10000,
    defaultLanguage: "en",
    timezone: "UTC",
  },
  game: {
    defaultTestDuration: 60,
    minTestDuration: 10,
    maxTestDuration: 600,
    allowCustomDuration: true,
    enableBackspace: true,
    enableNumbers: true,
    enableSymbols: true,
    enableCaseSensitive: false,
    defaultDifficulty: "medium",
    enableMultiplayer: true,
    maxMultiplayerUsers: 50,
  },
  security: {
    requireEmailVerification: false,
    requireStrongPasswords: true,
    enableTwoFactor: false,
    sessionTimeout: 24,
    maxLoginAttempts: 5,
    lockoutDuration: 30,
    enableAuditLog: true,
    enableIPWhitelist: false,
    allowedIPs: [],
  },
};

const handler = async (req, res) => {
  if (req.method === "GET") {
    return getSettings(req, res);
  } else if (req.method === "PUT") {
    return updateSettings(req, res);
  } else {
    return res.status(405).json({
      success: false,
      message: "Method not allowed",
    });
  }
};

const getSettings = withAdminAuth(
  requirePermission("systemSettings")(async (req, res) => {
    try {
      res.status(200).json({
        success: true,
        settings: systemSettings,
      });
    } catch (error) {
      console.error("Get settings error:", error);
      res.status(500).json({
        success: false,
        message: "Failed to fetch settings",
      });
    }
  })
);

const updateSettings = withAdminAuth(
  requirePermission("systemSettings")(async (req, res) => {
    try {
      const { section, data } = req.body;

      if (!section || !data) {
        return res.status(400).json({
          success: false,
          message: "Section and data are required",
        });
      }

      // Validate section
      if (!["general", "game", "security"].includes(section)) {
        return res.status(400).json({
          success: false,
          message: "Invalid section",
        });
      }

      // Update the specific section
      systemSettings[section] = {
        ...systemSettings[section],
        ...data,
      };

      // In production, you would save this to a database or config file
      console.log(`Settings updated for section: ${section}`, data);

      res.status(200).json({
        success: true,
        message: "Settings updated successfully",
        settings: systemSettings,
      });
    } catch (error) {
      console.error("Update settings error:", error);
      res.status(500).json({
        success: false,
        message: "Failed to update settings",
      });
    }
  })
);

export default handler;
