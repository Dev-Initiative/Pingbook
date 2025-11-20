import { Response } from "express";
import bcrypt from "bcryptjs";
import crypto from "crypto";
import jwt from "jsonwebtoken";
import sgMail from "@sendgrid/mail";
import { User } from "../model/User.js";
import { AuthRequest } from "../middleware/authMiddleware.js";

// LOGIN CONTROLLER
export async function loginUser(req: AuthRequest, res: Response) {
  try {
    const { email, password } = req.body;

    if (!email || !password)
      return res.status(400).json({
        success: false,
        message: "Email and password are required",
      });

    const user = await User.findOne({ email });
    if (!user)
      return res
        .status(400)
        .json({ success: false, message: "Invalid user credentials" });

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch)
      return res
        .status(400)
        .json({ success: false, message: "Invalid user credentials" });

    if (!user.emailVerified)
      return res.status(403).json({
        success: false,
        message: "Please verify your email before logging in",
      });

    // Generate JWT token
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
      },
    });
  } catch (error) {
    console.error("Login error:", error);
    return res
      .status(500)
      .json({ success: false, message: "Server error during login" });
  }
}

const sendVerificationEmail = async (email: string, token: string) => {
  if (!process.env.SENGRID_API_KEY || !process.env.VERIFICATION_EMAIL_FROM) {
    console.error("SendGrid API key or sender email not configured");
    return false;
  }

  try {
    const verificationURL = `${process.env.FORNTEND_URL}/verify-email?token=${token}`;

    const msg = {
      to: email,
      from: {
        email: process.env.SENDGRID_EMAIIL_FROM,
        name: "Pingbook Support", // change to app name later
      },
      subject: "Verify Email - Pingbook",
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #19183B;">Welcome to AcademicHive!</h2>
          <p>Thank you for signing up. Please verify your email address by clicking the button below:</p>
          <a href="${verificationURL}" style="display: inline-block; background-color: #19183B; color: white; padding: 12px 24px; text-decoration: none; border-radius: 5px; margin: 20px 0;">Verify Email</a>
          <p>Or copy and paste this link into your browser:</p>
          <p style="word-break: break-all; color: #666;">${verificationURL}</p>
          <p style="color: #999; font-size: 12px; margin-top: 30px;">This link will expire in 24 hours.</p>
        </div>
            `,
    };
    await sgMail.send(msg);

    return true;
  } catch (error) {
    console.error("Error sending verification email:", error);
    return false;
  }
};

// REGISTER CONTROLLER
export async function registerUser(req: AuthRequest, res: Response) {
  try {
    const { username, email, password, phone } = req.body;

    if (!username || !email || !password)
      return res
        .status(400)
        .json({ success: false, message: "All fields are required" });

    const existingUser = await User.findOne({ email });
    if (existingUser)
      return res
        .status(400)
        .json({ success: false, message: "User already exists" });

    const hashedPassword = await bcrypt.hash(password, 10);

    // Generate email verification token
    const verificationToken = crypto.randomBytes(32).toString("hex");

    // Create user
    const newUser = new User({
      username,
      email,
      phone,
      password: hashedPassword,
      emailVerified: false,
      avatar: "",
      verificationToken,
      verificationTokenExpires: Date.now() + 3600 * 1000, // 1 hour
    });

    const savedUser = await newUser.save();

    // Try email sending
    const sent = await sendVerificationEmail(email, verificationToken);

    if (sent) {
      return res.status(201).json({
        success: true,
        message:
          "Registration successful! Please verify your email to activate your account.",
        requireVerification: true,
        emailSent: true,
      });
    } else {
      console.error("Email sending failed");

      // Delete user after failed verification
      await User.deleteOne({ _id: savedUser._id });

      return res.status(500).json({
        success: false,
        message: "User created, but failed to send verification email.",
        requireVerification: true,
        emailSent: false,
      });
    }
  } catch (error) {
    console.error("Registration error:", error);
    return res.status(500).json({
      success: false,
      message: "Server error during registration",
    });
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
      return res.status(400).json({
        success: false,
        message: "Invalid or expired verification token",
      });
    }

    user.emailVerified = true;
    user.verificationToken = undefined;
    user.verificationTokenExpires = undefined;
    await user.save();

    return res.status(200).json({
      success: true,
      message: "Email verified successfully",
    });
  } catch (error) {
    console.error("Verify email error:", error);
    return res.status(500).json({
      success: false,
      message: "Server error during email verification",
    });
  }
}

// RESET PASSWORD CONTROLLER
export async function resetPassword(req: AuthRequest, res: Response) {
  try {
    const { currentPassword, newPassword } = req.body;
    const userId = req.user?.id;

    if (!userId) {
      return res.status(401).json({
        success: false,
        message: "Unauthorized",
      });
    }

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    const isMatch = await bcrypt.compare(currentPassword, user.password);
    if (!isMatch) {
      return res.status(400).json({
        success: false,
        message: "Current password is incorrect",
      });
    }

    const hashedPassword = await bcrypt.hash(newPassword, 10);
    user.password = hashedPassword;
    await user.save();

    return res.status(200).json({
      success: true,
      message: "Password reset successfully",
    });
  } catch (error) {
    console.error("Reset password error:", error);
    return res.status(500).json({
      success: false,
      message: "Server error during password reset",
    });
  }
}
