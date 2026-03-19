import mongoose from "mongoose";
import bcrypt from "bcryptjs";

const AdminSchema = new mongoose.Schema(
  {
    username: {
      type: String,
      required: [true, "Please provide a username"],
      unique: true,
      trim: true,
      minlength: [3, "Username must be at least 3 characters"],
      maxlength: [20, "Username cannot exceed 20 characters"],
    },
    email: {
      type: String,
      required: [true, "Please provide an email"],
      unique: true,
      lowercase: true,
      trim: true,
      match: [
        /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/,
        "Please provide a valid email",
      ],
    },
    password: {
      type: String,
      required: [true, "Please provide a password"],
      minlength: [8, "Password must be at least 8 characters"],
      select: false,
    },
    role: {
      type: String,
      enum: ["super_admin", "admin", "moderator", "content_manager"],
      default: "admin",
      required: true,
    },
    permissions: {
      userManagement: { type: Boolean, default: false },
      tournamentManagement: { type: Boolean, default: false },
      trainingManagement: { type: Boolean, default: false },
      analyticsAccess: { type: Boolean, default: false },
      contentManagement: { type: Boolean, default: false },
      systemSettings: { type: Boolean, default: false },
    },
    isActive: {
      type: Boolean,
      default: true,
    },
    lastLogin: {
      type: Date,
    },
    profilePicture: {
      type: String,
      default:
        "https://res.cloudinary.com/demo/image/upload/v1/default-admin.png",
    },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Admin",
    },
  },
  {
    timestamps: true,
  }
);

// Hash password before saving
AdminSchema.pre("save", async function (next) {
  if (!this.isModified("password")) {
    next();
  }
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
});

// Method to compare password
AdminSchema.methods.comparePassword = async function (enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};

// Method to check if admin has specific permission
AdminSchema.methods.hasPermission = function (permission) {
  if (this.role === "super_admin") return true;
  return this.permissions[permission] === true;
};

// Method to get all permissions for this admin
AdminSchema.methods.getAllPermissions = function () {
  if (this.role === "super_admin") {
    return [
      "userManagement",
      "tournamentManagement",
      "trainingManagement",
      "analyticsAccess",
      "contentManagement",
      "systemSettings",
    ];
  }

  return Object.keys(this.permissions).filter(
    (permission) => this.permissions[permission] === true
  );
};

export default mongoose.models.Admin || mongoose.model("Admin", AdminSchema);
