import jwt from "jsonwebtoken";
import Admin from "../models/Admin";
import { getRequiredSecret } from "./security";

export const generateAdminToken = (adminId) => {
  return jwt.sign({ adminId }, getRequiredSecret("JWT_SECRET"), {
    expiresIn: "24h",
  });
};

export const verifyAdminToken = (token) => {
  try {
    const decoded = jwt.verify(token, getRequiredSecret("JWT_SECRET"));
    return decoded;
  } catch (error) {
    return null;
  }
};

export const getAdminFromToken = async (token) => {
  try {
    const decoded = verifyAdminToken(token);
    if (!decoded || !decoded.adminId) {
      return null;
    }

    const admin = await Admin.findById(decoded.adminId).select("-password");

    if (!admin || !admin.isActive) {
      return null;
    }

    return admin;
  } catch (error) {
    console.error("Error getting admin from token:", error);
    return null;
  }
};

export const withAdminAuth = (handler) => {
  return async (req, res) => {
    try {
      const token = req.cookies.adminToken;

      if (!token) {
        return res.status(401).json({
          success: false,
          message: "Access denied. No token provided.",
        });
      }

      const admin = await getAdminFromToken(token);

      if (!admin) {
        return res.status(401).json({
          success: false,
          message: "Access denied. Invalid token.",
        });
      }

      req.admin = admin;
      return handler(req, res);
    } catch (error) {
      console.error("Admin auth middleware error:", error);
      return res.status(500).json({
        success: false,
        message: "Internal server error",
      });
    }
  };
};

export const requirePermission = (permission) => {
  return (handler) => {
    return async (req, res) => {
      try {
        if (!req.admin) {
          return res.status(401).json({
            success: false,
            message: "Access denied. Admin authentication required.",
          });
        }

        if (!req.admin.hasPermission(permission)) {
          return res.status(403).json({
            success: false,
            message: `Access denied. Permission '${permission}' required.`,
          });
        }

        return handler(req, res);
      } catch (error) {
        console.error("Permission check error:", error);
        return res.status(500).json({
          success: false,
          message: "Internal server error",
        });
      }
    };
  };
};
