import { Schema, model } from "mongoose";
import jwt from "jsonwebtoken";
import bcrypt from "bcrypt";

const UserSchema = new Schema(
  {
    userName: {
      type: String,
      required: [true, "Username is required"],
      unique: true,
      trim: true,
      lowercase: true,
      index: true,
      minlength: [3, "Username must be at least 3 characters long"],
      maxlength: [30, "Username cannot exceed 30 characters"],
      validate: {
        validator: (v) =>
          /^[a-zA-Z0-9!@#$%^&*()_+{}\[\]:;<>,.?/~\\-]+$/.test(v),
        message: (props) =>
          `${props.value} can only contain letters, numbers, and special characters.`,
      },
    },
    email: {
      type: String,
      unique: true,
      sparse: true,
      trim: true,
      lowercase: true,
      validate: {
        validator: (v) =>
          v
            ? /^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/.test(v)
            : true,
        message: (props) => `${props.value} is not a valid email!`,
      },
    },
    fullName: {
      type: String,
      required: [true, "Full name is required"],
      trim: true,
    },
    avatar: {
      type: String, // Cloudinary URL
      // required: [true, "Avatar is required"],
    },
    password: {
      type: String,
      required: [true, "Password is required"],
      minlength: [6, "Password must be at least 6 characters long"],
      validate: {
        validator: (v) => /(?=.*\d)(?=.*[a-z])(?=.*[A-Z])/.test(v),
        message:
          "Password must contain at least one number, one lowercase and one uppercase letter",
      },
    },
    authProvider: {
      type: String,
      enum: ["local", "google", "facebook"],
      default: "local", // supports future social login
    },
    facebookId: {
      type: String,
      unique: true,
      sparse: true,
    },
    facebookPages: [
      {
        pageId: String,
        pageName: String,
        accessToken: String,
      },
    ],
    isEmailVerified: {
      type: Boolean,
      default: false,
    },
    isTemporaryEmail: {
      type: Boolean,
      default: false,
    },
    refreshToken: {
      type: String,
    },
  },
  { timestamps: true }
);

// Hash password before saving
UserSchema.pre("save", async function (next) {
  if (!this.isModified("password")) return next();
  this.password = await bcrypt.hash(this.password, 10);
  next();
});

// Password check
UserSchema.methods.isPasswordCorrect = async function (password) {
  return await bcrypt.compare(password, this.password);
};

// JWT token generation
UserSchema.methods.generateAccessToken = function () {
  return jwt.sign(
    {
      _id: this._id,
      email: this.email,
      userName: this.userName,
      fullName: this.fullName,
    },
    process.env.ACCESS_TOKEN_SECRET,
    {
      expiresIn: process.env.ACCESS_TOKEN_EXPIRY,
    }
  );
};

UserSchema.methods.generateRefreshToken = function () {
  return jwt.sign(
    { _id: this._id },
    process.env.REFRESH_TOKEN_SECRET,
    {
      expiresIn: process.env.REFRESH_TOKEN_EXPIRY,
    }
  );
};

const User = model("User", UserSchema);
export default User;
