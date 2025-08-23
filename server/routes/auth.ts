import { Router, Request, Response } from "express";

const router = Router();

// Fake in-memory users (replace with DB later)
let users: any[] = [
  {
    id: 1,
    username: "admin",
    password: "admin123", // ⚠️ In real apps hash this!
    email: "admin@example.com",
    full_name: "System Admin",
    role: "admin",
    department: "IT",
  },
];

// === Login ===
router.post("/login", (req: Request, res: Response) => {
  const { username, password } = req.body;

  const user = users.find(
    (u) => u.username === username && u.password === password
  );

  if (!user) {
    return res.status(401).json({ message: "Invalid username or password" });
  }

  // Normally generate JWT, here just fake it
  const token = "fake-jwt-token";

  res.json({ token, user });
});

// === Register ===
router.post("/register", (req: Request, res: Response) => {
  const { username, password, email, full_name, role, department } = req.body;

  if (users.some((u) => u.username === username)) {
    return res.status(400).json({ message: "User already exists" });
  }

  const newUser = {
    id: users.length + 1,
    username,
    password,
    email,
    full_name,
    role: role || "user",
    department: department || "General",
  };

  users.push(newUser);
  res.json({ user: newUser });
});

// === Get Current User ===
router.get("/me", (req: Request, res: Response) => {
  // Normally decode JWT, here just return the first user
  const user = users[0];
  res.json({ user });
});

export default router;
