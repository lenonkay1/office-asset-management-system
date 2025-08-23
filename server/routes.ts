// import express, { Express, Request, Response } from "express";
// import cors from "cors";
// import { createServer, type Server } from "http";
// import bcrypt from "bcrypt";
// import jwt from "jsonwebtoken"; // ✅ Changed from require() to import
// import { storage } from "./storage";
// import { verifyToken as authenticateToken } from "./middleware/verifyToken";

// export function registerRoutes(app: Express): Server {
//   app.use(cors());
//   app.use(express.json());

//   // Auth routes
//   app.post("/api/auth/login", async (req: Request, res: Response) => {
//     try {
//       const { username, password } = req.body;
//       if (!username || !password) {
//         return res
//           .status(400)
//           .json({ message: "Username and password are required" });
//       }

//       const user = await storage.getUserByUsername(username);
//       if (!user || !user.isActive) {
//         return res.status(401).json({ message: "Invalid credentials" });
//       }

//       const JWT_SECRET =
//         process.env.JWT_SECRET || "jsc_asset_management_secret_key";

//       const isValidPassword = await bcrypt.compare(password, user.password);
//       if (!isValidPassword) {
//         return res.status(401).json({ message: "Invalid credentials" });
//       }

//       const token = jwt.sign(
//         { userId: user.id, username: user.username, role: user.role },
//         JWT_SECRET,
//         { expiresIn: "24h" }
//       );

//       res.json({
//         token,
//         user: {
//           id: user.id,
//           username: user.username,
//           email: user.email,
//           fullName: user.fullName,
//           role: user.role,
//           department: user.department,
//         },
//       });
//     } catch (error) {
//       console.error("Login error:", error);
//       res.status(500).json({ message: "Internal server error" });
//     }
//   });

//   // Dashboard routes
//   app.get(
//     "/api/dashboard/stats",
//     authenticateToken,
//     async (req: Request, res: Response) => {
//       try {
//         const stats = await storage.getDashboardStats();
//         res.json(stats);
//       } catch (error) {
//         console.error("Stats error:", error);
//         res.status(500).json({ message: "Internal server error" });
//       }
//     }
//   );

//   app.get(
//     "/api/dashboard/overdue-maintenances",
//     authenticateToken,
//     async (req: Request, res: Response) => {
//       try {
//         const overdue = await storage.getOverdueMaintenances();
//         res.json(overdue);
//       } catch (error) {
//         console.error("Overdue error:", error);
//         res.status(500).json({ message: "Internal server error" });
//       }
//     }
//   );

//   app.get(
//     "/api/dashboard/recent-activity",
//     authenticateToken,
//     async (req: Request, res: Response) => {
//       try {
//         const activity = await storage.getRecentActivity(10);
//         res.json(activity);
//       } catch (error) {
//         console.error("Recent activity error:", error);
//         res.status(500).json({ message: "Internal server error" });
//       }
//     }
//   );

//   // Assets route
//   app.get(
//     "/api/assets",
//     authenticateToken,
//     async (req: Request, res: Response) => {
//       try {
//         const page = parseInt(req.query.page as string) || 1;
//         const limit = parseInt(req.query.limit as string) || 10;
//         const offset = (page - 1) * limit;

//         const filters: any = {};
//         if (req.query.search) filters.search = (req.query.search as string).toLowerCase();
//         if (req.query.status) filters.status = req.query.status as string;
//         if (req.query.category) filters.category = req.query.category as string;

//         const assets = await storage.getAssets(limit, offset, filters);

//         if (!assets) {
//           return res.status(404).json({ message: "Assets not found" });
//         }

//         res.json({ assets });
//       } catch (error) {
//         console.error("Get assets error:", error);
//         res.status(500).json({ message: "Internal server error" });
//       }
//     }
//   );

//   const httpServer = createServer(app);
//   return httpServer;
// }

// // Extend Express Request type
// declare global {
//   namespace Express {
//     interface Request {
//       user?: any;
//     }
//   }
// }

// export default registerRoutes;

// export { storage };

import express, { Express, Request, Response } from "express";
import cors from "cors";
import { createServer, type Server } from "http";
import bcrypt from "bcrypt";
import * as storage from "./storage";
import { verifyToken as authenticateToken } from "./middleware/verifyToken";
import jwt from "jsonwebtoken";
import dashboardRouter from "./routes/dashboard";

export function registerRoutes(app: Express): Server {
  app.use(cors());
  app.use(express.json());
  app.use("/api/assets", assetsRouter);   // if you already have this
  app.use("/api/users", usersRouter);     // if you already have this

  // new dashboard route
  app.use("/api/dashboard", dashboardRouter);

  // Auth routes
  app.post("/api/auth/login", async (req: Request, res: Response) => {
    try {
      const { username, password } = req.body;
      console.log("Login attempt for username:", username);

      if (!username || !password) {
        return res.status(400).json({ message: "Username and password are required" });
      }

      let user;
      try {
        user = await storage.getUserByUsername(username);
        console.log("User fetched:", user);
      } catch (dbError) {
        console.error("Error fetching user from DB:", dbError);
        return res.status(500).json({ message: "Error fetching user" });
      }

      if (!user) {
        console.log("User not found");
        return res.status(401).json({ message: "Invalid credentials" });
      }

      if (!user.is_active) { // Changed from isActive
        console.log("User inactive");
        return res.status(401).json({ message: "Invalid credentials" });
      }

      if (!user.password) {
        console.error("User has no password hash");
        return res.status(500).json({ message: "User password missing" });
      }

      let isValidPassword = false;
      try {
        isValidPassword = await bcrypt.compare(password, user.password);
        console.log("Password valid:", isValidPassword);
      } catch (bcryptError) {
        console.error("bcrypt error:", bcryptError);
        return res.status(500).json({ message: "Error verifying password" });
      }

      if (!isValidPassword) {
        return res.status(401).json({ message: "Invalid credentials" });
      }

      let token;
      const JWT_SECRET = process.env.JWT_SECRET || "jsc_asset_management_secret_key";
      try {
        token = jwt.sign(
          { 
            user_id: user.id, // Changed from userId
            username: user.username, 
            role: user.role 
          },
          JWT_SECRET,
          { expiresIn: "24h" }
        );
        console.log("JWT token created");
      } catch (jwtError) {
        console.error("JWT sign error:", jwtError);
        return res.status(500).json({ message: "Error generating token" });
      }

      res.json({
        token,
        user: {
          id: user.id,
          username: user.username,
          email: user.email,
          full_name: user.full_name, // Changed from fullName
          role: user.role,
          department: user.department,
        },
      });
    } catch (error) {
      console.error("Login error:", error);
      res.status(500).json({ message: "Internal server error" });
    }
  });

  // Assets route - Updated to match schema
  // Assets route - safer + logs
  app.get("/api/assets", authenticateToken, async (req: Request, res: Response) => {
    try {
      const page = parseInt(req.query.page as string) || 1;
      const limit = parseInt(req.query.limit as string) || 10;
      const offset = (page - 1) * limit;

      const filters: any = {};
      if (req.query.search) filters.search = (req.query.search as string).toLowerCase();
      if (req.query.status) filters.status = req.query.status as string;
      if (req.query.category) filters.category = req.query.category as string;

      const assetsResult = await storage.getAssets(limit, offset, filters);

      console.log("Fetched assetsResult:", assetsResult); // 👈 debug log

      if (!assetsResult) {
        return res.json({ assets: [], pagination: { total: 0, page, limit, total_pages: 0 } });
      }

      let transformedAssets: any[] = [];

      if (Array.isArray(assetsResult)) {
        transformedAssets = assetsResult;
      } else if (assetsResult.assets && Array.isArray(assetsResult.assets)) {
        transformedAssets = assetsResult.assets;
      } else {
        console.warn("Unexpected assetsResult shape:", assetsResult);
        transformedAssets = [];
      }

      return res.json({
        assets: transformedAssets,
        pagination: {
          total: assetsResult.total || transformedAssets.length,
          page,
          limit,
          total_pages: Math.ceil((assetsResult.total || transformedAssets.length) / limit)
        }
      });
    } catch (error) {
      console.error("Get assets error:", error);
      res.status(500).json({ message: "Internal server error" });
    }
  });

  // Asset creation route - Updated to match schema
  app.post("/api/assets", authenticateToken, async (req: Request, res: Response) => {
    try {
      const { 
        asset_id,
        asset_name,
        description,
        category,
        serial_number,
        model,
        manufacturer,
        purchase_date,
        purchase_cost,
        warranty_expiry,
        current_location,
        assigned_department,
        assigned_user_id,
        status,
        condition,
        notes
      } = req.body;

      const newAsset = await storage.createAsset({
        asset_id: asset_id || `JSC-${Date.now().toString().slice(-6)}`,
        asset_name,
        description,
        category,
        serial_number,
        model,
        manufacturer,
        purchase_date: purchase_date ? new Date(purchase_date) : null,
        purchase_cost,
        warranty_expiry: warranty_expiry ? new Date(warranty_expiry) : null,
        current_location,
        assigned_department,
        assigned_user_id,
        status: status || 'active',
        condition: condition || 'good',
        notes
      });

      res.status(201).json(newAsset);
    } catch (error) {
      console.error("Create asset error:", error);
      res.status(500).json({ message: "Internal server error" });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}

// Extend Express Request type with snake_case
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

export default registerRoutes;
export { storage };