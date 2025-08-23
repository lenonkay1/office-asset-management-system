// import dotenv from "dotenv";
// import express, { type Request, Response, NextFunction } from "express";
// import { registerRoutes } from "./routes";
// import { setupVite, serveStatic, log } from "./vite";
// import { seedDatabase } from "./seed";
// import { verifyToken } from "./middleware/verifyToken";
// import { db } from "./db";
// import { assets } from "@shared/schema";

// dotenv.config();

// const app = express();
// app.use(express.json());

// // 🔁 Helper to convert camelCase to snake_case
// function formatAssetToDb(asset: any) {
//   return {
//     asset_name: asset.assetName,
//     asset_type: asset.assetType,
//     serial_number: asset.serialNumber,
//     model: asset.model,
//     brand: asset.brand,
//     condition: asset.condition,
//     assigned_department: asset.assignedDepartment,
//     // Add more mappings here if needed
//   };
// }

// // ✅ Updated asset insert route (local Postgres)
// app.post("/api/assets", verifyToken, async (req, res) => {
//   const asset = req.body;
//   const formattedAsset = formatAssetToDb(asset);
//   try {
//     await db.insert(assets).values(formattedAsset);
//     res.status(201).json({ message: "Asset added successfully" });
//   } catch (error: any) {
//     console.error("Insert error:", error.message || error);
//     res.status(400).json({ message: "Insert failed", error: error.message || error });
//   }
// });

// app.use(express.json());
// app.use(express.urlencoded({ extended: false }));

// app.use((req, res, next) => {
//   const start = Date.now();
//   const path = req.path;
//   let capturedJsonResponse: Record<string, any> | undefined = undefined;

//   const originalResJson = res.json;
//   res.json = function (bodyJson, ...args) {
//     capturedJsonResponse = bodyJson;
//     return originalResJson.apply(res, [bodyJson, ...args]);
//   };

//   res.on("finish", () => {
//     const duration = Date.now() - start;
//     if (path.startsWith("/api")) {
//       let logLine = `${req.method} ${path} ${res.statusCode} in ${duration}ms`;
//       if (capturedJsonResponse) {
//         logLine += ` :: ${JSON.stringify(capturedJsonResponse)}`;
//       }

//       if (logLine.length > 80) {
//         logLine = logLine.slice(0, 79) + "…";
//       }

//       log(logLine);
//     }
//   });

//   next();
// });

// (async () => {
//   try {
//     await seedDatabase();
//   } catch (error) {
//     console.error("Failed to seed database:", error);
//   }

//   const server = registerRoutes(app);

//   app.use((err: any, _req: Request, res: Response, _next: NextFunction) => {
//     const status = err.status || err.statusCode || 500;
//     const message = err.message || "Internal Server Error";

//     res.status(status).json({ message });
//     throw err;
//   });

//   if (app.get("env") === "development") {
//     await setupVite(app, server);
//   } else {
//     serveStatic(app);
//   }

//   const port = 5e3;
//   app.listen(port, '127.0.0.1', () => {
//     console.log(`Server is running on http://127.0.0.1:${port}`);
//   });
// })();
// server/index.ts - Fixed version

import express, { Express } from "express";
import cors from "cors";
import dotenv from "dotenv";
import jwt from "jsonwebtoken";
import bcrypt from "bcrypt";
import { verifyToken } from "./middleware/auth";
import assetsRouter from "./routes/assets";
import usersRouter from "./routes/users";
import dashboardRouter from "./routes/dashboard";
import maintenanceRouter from "./routes/maintenance";
import transfersRouter from "./routes/transfers";
import * as storage from "./storage";

dotenv.config();
const app = express();
app.use(cors());
app.use(express.json());

// === Register routers ===
app.use("/api/assets", assetsRouter);
app.use("/api/users", usersRouter);
app.use("/api/dashboard", dashboardRouter);
app.use("/api/maintenance", maintenanceRouter);
app.use("/api/transfers", transfersRouter);

// === Extend Request type ===
declare global {
  namespace Express {
    interface Request {
      user?: {
        user_id: number;
        username: string;
        role: string;
      };
    }
  }
}

// === Auth routes (login + me) ===
app.post("/api/auth/login", async (req, res) => {
  try {
    const { username, password } = req.body;
    if (!username || !password) return res.status(400).json({ message: "Username and password required" });

    const user = await storage.getUserByUsername(username);
    if (!user) return res.status(401).json({ message: "Invalid credentials" });
    if (!user.is_active) return res.status(401).json({ message: "Account deactivated" });

    const isValid = await bcrypt.compare(password, user.password);
    if (!isValid) return res.status(401).json({ message: "Invalid credentials" });

    const token = jwt.sign(
      { user_id: user.id, username: user.username, role: user.role },
      process.env.JWT_SECRET || "secret_key",
      { expiresIn: "24h" }
    );

    res.json({ token, user });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Login failed" });
  }
});

app.get("/api/auth/me", verifyToken, async (req, res) => {
  try {
    const user = await storage.getUser(req.user!.user_id);
    if (!user) return res.status(404).json({ message: "User not found" });
    res.json({ user });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Failed to fetch user" });
  }
});

// === Start server ===
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`✅ Server running on http://localhost:${PORT}`));
