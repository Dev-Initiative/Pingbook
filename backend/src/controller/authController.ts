import dotenv from "dotenv";
dotenv.config();
import { Response } from "express";
import bcrypt from "bcryptjs";
import crypto from "crypto";
import jwt from "jsonwebtoken";
import sgMail from "@sendgrid/mail";
import { User } from "../model/User.js";
import { AuthRequest } from "../middleware/authMiddleware.js";

// GOOGLE LOGIN CONTROLLER
export async function googleLogin(req: AuthRequest, res: Response) {
  try {
    const googleUser = req.user as any;
    if (!googleUser) {
      console.error("Google authentication failed: req.user is undefined.");
      return res.status(400).json({
        success: false,
        message: "Google authentication failed",
      });
    }

    // User is already created/authenticated by passport
    const user = googleUser;

    const token = jwt.sign(
      { id: user._id.toString(), email: user.email },
      process.env.JWT_SECRET!,
      { expiresIn: "7d" }
    );

    return res.status(200).json({
      success: true,
      message: "Login successful",
      token,
      user: {
        id: user._id,
        email: user.email,
        username: user.username,
        avatar: user.avatar,
      },
    });
  } catch (error: any) {
    console.error("Google login error:", error);
    return res.status(500).json({
      success: false,
      message: "Server error during Google login",
      error: error.message,
    });
  }
}

// STANDARD LOGIN CONTROLLER
export async function loginUser(req: AuthRequest, res: Response) {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ email });
    if (!user || !user.password) {
      return res
        .status(400)
        .json({ success: false, message: "Invalid user credentials" });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res
        .status(400)
        .json({ success: false, message: "Invalid user credentials" });
    }

    if (!user.emailVerified) {
      return res
        .status(403)
        .json({
          success: false,
          message: "Please verify your email before logging in",
        });
    }

    const token = jwt.sign(
      { id: user._id.toString(), email: user.email },
      process.env.JWT_SECRET!,
      { expiresIn: "7d" }
    );

    return res.status(200).json({
      success: true,
      message: "Login successful",
      token,
      user: { id: user._id, email: user.email, username: user.username },
    });
  } catch (error) {
    console.error("Login error:", error);
    return res
      .status(500)
      .json({ success: false, message: "Server error during login" });
  }
}

const sendVerificationEmail = async (email: string, token: string) => {
  if (!process.env.SENDGRID_API_KEY || !process.env.SENDGRID_EMAIL_FROM) {
    console.error("SendGrid API key or sender email not configured");
    return;
  }
  sgMail.setApiKey(process.env.SENDGRID_API_KEY);
  const verificationURL = `${process.env.FRONTEND_URL}/verify-email?token=${token}`;
  const msg = {
    to: email,
    from: { email: process.env.SENDGRID_EMAIL_FROM, name: "Pingbook Support" },
    subject: "Verify Your Email - Pingbook",
    html: `<p>Please verify your email by clicking this link: <a href="${verificationURL}">${verificationURL}</a></p>`,
  };
  try {
    await sgMail.send(msg);
  } catch (error) {
    console.error("Error sending verification email:", error);
  }
};

// STANDARD REGISTER CONTROLLER
export async function registerUser(req: AuthRequest, res: Response) {
  try {
    const { username, email, password, phone } = req.body;

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res
        .status(400)
        .json({ success: false, message: "User already exists" });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const verificationToken = crypto.randomBytes(32).toString("hex");

    const newUser = new User({
      username,
      email,
      phone,
      password: hashedPassword,
      emailVerified: false,
      verificationToken,
      verificationTokenExpires: Date.now() + 3600000, // 1 hour
    });

    const savedUser = await newUser.save();
    await sendVerificationEmail(savedUser.email, verificationToken);

    return res.status(201).json({
      success: true,
      message:
        "Registration successful! Please check your email to verify your account.",
      user: {
        id: savedUser._id,
        username: savedUser.username,
        email: savedUser.email,
      },
    });
  } catch (error) {
    console.error("Registration error:", error);
    return res
      .status(500)
      .json({ success: false, message: "Server error during registration" });
  }
}

// VERIFY EMAIL CONTROLLER
export async function verifyEmail(req: AuthRequest, res: Response) {
  try {
    const { token } = req.body;
    const user = await User.findOne({
      verificationToken: token,
      verificationTokenExpires: { $gt: Date.now() },
    });

    if (!user) {
      return res
        .status(400)
        .json({
          success: false,
          message: "Invalid or expired verification token",
        });
    }

    user.emailVerified = true;
    user.verificationToken = undefined;
    user.verificationTokenExpires = undefined;
    await user.save();

    return res
      .status(200)
      .json({ success: true, message: "Email verified successfully" });
  } catch (error) {
    console.error("Verify email error:", error);
    return res
      .status(500)
      .json({
        success: false,
        message: "Server error during email verification",
      });
  }
}

// SET PASSWORD CONTROLLER (for Google users setting a password for the first time)
export async function setPassword(req: AuthRequest, res: Response) {
  try {
    const { newPassword } = req.body;
    const userId = req.user?.id;

    if (!userId) {
      return res.status(401).json({ success: false, message: "Unauthorized" });
    }

    const user = await User.findById(userId);
    if (!user) {
      return res
        .status(404)
        .json({ success: false, message: "User not found" });
    }

    if (user.password) {
      return res
        .status(400)
        .json({
          success: false,
          message:
            "Password already set. Use the 'Reset Password' feature to change it.",
        });
    }

    user.password = await bcrypt.hash(newPassword, 10);
    await user.save();

    return res
      .status(200)
      .json({ success: true, message: "Password has been set successfully." });
  } catch (error) {
    console.error("Set password error:", error);
    return res
      .status(500)
      .json({
        success: false,
        message: "Server error during password setting",
      });
  }
}

// RESET PASSWORD CONTROLLER (for standard users)
export async function resetPassword(req: AuthRequest, res: Response) {
  try {
    const { currentPassword, newPassword } = req.body;
    const userId = req.user?.id;

    if (!userId) {
      return res.status(401).json({ success: false, message: "Unauthorized" });
    }

    const user = await User.findById(userId);
    if (!user) {
      return res
        .status(404)
        .json({ success: false, message: "User not found" });
    }

    // Guide Google users to the correct flow
    if (!user.password) {
      return res
        .status(400)
        .json({
          success: false,
          message:
            "This account is authenticated via Google. Please use the 'Set Password' feature to create a password.",
        });
    }

    const isMatch = await bcrypt.compare(currentPassword, user.password);
    if (!isMatch) {
      return res
        .status(400)
        .json({ success: false, message: "Current password is incorrect" });
    }

    user.password = await bcrypt.hash(newPassword, 10);
    await user.save();

    return res
      .status(200)
      .json({ success: true, message: "Password reset successfully" });
  } catch (error) {
    console.error("Reset password error:", error);
    return res
      .status(500)
      .json({ success: false, message: "Server error during password reset" });
  }
}
