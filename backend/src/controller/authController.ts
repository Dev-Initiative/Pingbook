import { Request, Response } from "express";
import bcrypt from "bcryptjs";
import crypto from "crypto";
import { User } from "../model/User.js";

// LOGIN CONTROLLER
export async function loginUser(req: Request, res: Response) {
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

    return res.status(200).json({
      success: true,
      message: "Login successful",
      user: {
        id: user._id,
        email: user.email,
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
        emial: process.env.SENDGRID_EMAIIL_FROM,
        name: "Pingbook Support", // change to app name later
      },
      subject: "Verify your email for Pingbook",
      html: `
                <p>Thank you for registering with Pingbook!</p>
                <p>Please verify your email by clicking the link below:</p>
                <a href="${verificationURL}">Verify Email</a>
                <p>This link will expire in 1 hour.</p>
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
export async function registerUser(req: Request, res: Response) {
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

      // Optional: Decide if you want to delete user or allow login without verification
      // await User.deleteOne({ _id: savedUser._id });

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
