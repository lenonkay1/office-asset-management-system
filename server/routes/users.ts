import { Router } from "express";
import { verifyToken } from "../middleware/auth";
import * as storage from "../storage";
import bcrypt from "bcrypt";

const router = Router();

// Get all users
router.get("/", verifyToken, async (_req, res) => {
  try {
    const users = await storage.getAllUsers();
    // Map is_active -> status string for the frontend
    const mapped = users.map((u: any) => ({
      ...u,
      status: u.is_active ? "active" : "inactive",
    }));
    res.json(mapped);
  } catch (err) {
    console.error("Error fetching users:", err);
    res.status(500).json({ error: "Failed to fetch users" });
  }
});

// Get single user
router.get("/:id", verifyToken, async (req, res) => {
  const userId = parseInt(req.params.id);
  try {
    const user = await storage.getUser(userId);
    if (!user) return res.status(404).json({ error: "User not found" });
    res.json(user);
  } catch (err) {
    console.error("Error fetching user:", err);
    res.status(500).json({ error: "Failed to fetch user" });
  }
});

// Create new user (admin only)
router.post("/", verifyToken, async (req, res) => {
  try {
    const currentUser = await storage.getUser(req.user!.user_id);
    if (!currentUser || currentUser.role !== "admin") {
      return res.status(403).json({ error: "Only admins can create users" });
    }

    const { username, password, email, full_name, role, department } = req.body;

    if (!username || !password || !email || !full_name || !role || !department) {
      return res.status(400).json({ error: "All fields are required" });
    }

    const existingUser = await storage.getUserByUsername(username);
    if (existingUser) {
      return res.status(400).json({ error: "Username already exists" });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const newUser = await storage.createUser({
      username,
      password: hashedPassword,
      email,
      full_name,
      role,
      department,
      is_active: true,
    });

    res.status(201).json(newUser);
  } catch (err) {
    console.error("Error creating user:", err);
    res.status(500).json({ error: "Failed to create user" });
  }
});

// Update user
router.put("/:id", verifyToken, async (req, res) => {
  const userId = parseInt(req.params.id);
  try {
    const updated = await storage.updateUser(userId, req.body);
    if (!updated) return res.status(404).json({ error: "User not found" });
    res.json(updated);
  } catch (err) {
    console.error("Error updating user:", err);
    res.status(500).json({ error: "Failed to update user" });
  }
});

// Delete user
router.delete("/:id", verifyToken, async (req, res) => {
  const userId = parseInt(req.params.id);
  try {
    const deleted = await storage.deleteUser(userId);
    if (!deleted) return res.status(404).json({ error: "User not found" });
    res.json({ message: "User deleted" });
  } catch (err) {
    console.error("Error deleting user:", err);
    res.status(500).json({ error: "Failed to delete user" });
  }
});

export default router;
