// controller/userController.ts
import { Response } from "express";
import { UserRequest } from "../middleware/userMiddleware.js";
import { User, IUser } from "../model/User.js";
import bcrypt from "bcryptjs";

// GET /api/users/profile
export const getProfile = async (req: UserRequest, res: Response) => {
  try {
    const user = req.currentUser;
    return res.status(200).json({ success: true, user });
  } catch (error) {
    console.error("Get profile error:", error);
    return res.status(500).json({
      success: false,
      message: "Server error while fetching profile",
    });
  }
};

// PUT /api/users/profile
export const updateProfile = async (req: UserRequest, res: Response) => {
  try {
    const user = req.currentUser;
    if (!user) return res.status(404).json({ success: false, message: "User not found" });

    const { username, email, phone, avatar, settings } = req.body;

    if (username) user.username = username;
    if (email) user.email = email;
    if (phone) user.phone = phone;
    if (avatar) user.avatar = avatar;
    if (settings) {
      user.settings = {
        ...user.settings,
        ...settings,
      };
    }

    await user.save();
    return res.status(200).json({ success: true, message: "Profile updated", user });
  } catch (error) {
    console.error("Update profile error:", error);
    return res.status(500).json({
      success: false,
      message: "Server error while updating profile",
    });
  }
};

// DELETE /api/users/profile
export const deleteProfile = async (req: UserRequest, res: Response) => {
  try {
    const user = req.currentUser;
    if (!user) return res.status(404).json({ success: false, message: "User not found" });

    await User.findByIdAndDelete(user._id);
    return res.status(200).json({ success: true, message: "User account deleted" });
  } catch (error) {
    console.error("Delete profile error:", error);
    return res.status(500).json({
      success: false,
      message: "Server error while deleting profile",
    });
  }
};

// GET /api/users/:id
export const getUserById = async (req: UserRequest, res: Response) => {
  try {
    const user = await User.findById(req.params.id).select("-password");
    if (!user) return res.status(404).json({ success: false, message: "User not found" });
    return res.status(200).json({ success: true, user });
  } catch (error) {
    console.error("Get user by ID error:", error);
    return res.status(500).json({ success: false, message: "Server error" });
  }
};

// PUT /api/users/:id
export const updateUserById = async (req: UserRequest, res: Response) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) return res.status(404).json({ success: false, message: "User not found" });

    const { username, email, phone, avatar, settings, password } = req.body;

    if (username) user.username = username;
    if (email) user.email = email;
    if (phone) user.phone = phone;
    if (avatar) user.avatar = avatar;
    if (settings) user.settings = { ...user.settings, ...settings };
    if (password) user.password = await bcrypt.hash(password, 10);

    await user.save();
    return res.status(200).json({ success: true, message: "User updated", user });
  } catch (error) {
    console.error("Update user error:", error);
    return res.status(500).json({ success: false, message: "Server error" });
  }
};

// DELETE /api/users/:id
export const deleteUserById = async (req: UserRequest, res: Response) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) return res.status(404).json({ success: false, message: "User not found" });

    await User.findByIdAndDelete(req.params.id);
    return res.status(200).json({ success: true, message: "User deleted" });
  } catch (error) {
    console.error("Delete user error:", error);
    return res.status(500).json({ success: false, message: "Server error" });
  }
};

// GET /api/users/
// Optional: admin route to get all users
export const getAllUsers = async (_req: UserRequest, res: Response) => {
  try {
    const users = await User.find().select("-password");
    return res.status(200).json({ success: true, users });
  } catch (error) {
    console.error("Get all users error:", error);
    return res.status(500).json({ success: false, message: "Server error" });
  }
};
