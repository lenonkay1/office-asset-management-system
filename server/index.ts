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

import dotenv from "dotenv";
import express, { type Request, Response, NextFunction } from "express";
import path from "path";
import cors from "cors";

import { registerRoutes } from "./routes";
import { seedDatabase } from "./seed";
import { verifyToken } from "./middleware/verifyToken";
import { db } from "./db";
import * as schema from "../shared/schema";
import { assets } from "../shared/schema";
import * as storage from "./storage";
dotenv.config();

const app = express();
app.use(express.json());
app.use(cors());

// ----------------- API ROUTES -----------------

// Dashboard stats
app.get("/api/dashboard/stats", async (req, res) => {
  try {
    const stats = await storage.getDashboardStats();
    res.json(stats);
  } catch (error) {
    console.error("Stats error:", error);
    res.status(500).json({ error: "Failed to load stats" });
  }
});

// Categories
app.get("/api/dashboard/categories", async (req, res) => {
  try {
    const categories = await storage.getAssetCategories();
    res.json(categories);
  } catch (error) {
    console.error("Categories error:", error);
    res.status(500).json({ error: "Failed to load categories" });
  }
});

// Recent activity
app.get("/api/dashboard/recent-activity", async (req, res) => {
  try {
    const activity = await storage.getRecentActivity(10);
    res.json(activity);
  } catch (error) {
    console.error("Recent activity error:", error);
    res.status(500).json({ error: "Failed to load recent activity" });
  }
});

// Overdue maintenances
app.get("/api/dashboard/overdue-maintenances", async (req, res) => {
  try {
    const overdue = await storage.getOverdueMaintenances();
    res.json(overdue);
  } catch (error) {
    console.error("Overdue maintenances error:", error);
    res.status(500).json({ error: "Failed to load overdue maintenances" });
  }
});

// Get assets
app.get("/api/assets", verifyToken, async (req, res) => {
  try {
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 10;
    const offset = (page - 1) * limit;

    const filters: any = {};
    if (req.query.search) filters.search = (req.query.search as string).toLowerCase();
    if (req.query.status) filters.status = req.query.status as string;
    if (req.query.category) filters.category = req.query.category as string;

    const assetsResult = await storage.getAssets(limit, offset, filters);

    if (!assetsResult) {
      return res.status(404).json({ message: "Assets not found" });
    }

    return res.json({
      assets: assetsResult.assets,
      pagination: {
        total: assetsResult.total,
        page,
        limit,
        total_pages: Math.ceil(assetsResult.total / limit)
      }
    });
  } catch (error) {
    console.error("Get assets error:", error);
    res.status(500).json({ message: "Internal server error" });
  }
});

// Add asset
app.post("/api/assets", verifyToken, async (req, res) => {
  try {
    const formattedAsset = formatAssetToDb(req.body);
    const result = await db.insert(assets).values(formattedAsset).returning();
    res.status(201).json({
      message: "Asset added successfully",
      asset: result[0],
    });
  } catch (error: any) {
    console.error("Insert error:", error.message);
    res.status(400).json({
      message: "Insert failed",
      error:
        process.env.NODE_ENV === "development"
          ? error.message
          : "Bad request",
    });
  }
});

// ----------------- STATIC FILES (Production only) -----------------
if (process.env.NODE_ENV === "production") {
  app.use(express.static(path.join(__dirname, "../client/dist")));

  // SPA fallback
  app.get("*", (req, res) => {
    res.sendFile(path.join(__dirname, "../client/dist/index.html"));
  });
}

// ----------------- ERROR HANDLING -----------------
app.use((err: any, req: Request, res: Response, next: NextFunction) => {
  const status = err.status || 500;
  const message = err.message || "Internal Server Error";

  if (status >= 500) {
    console.error(`[${new Date().toISOString()}]`, err);
  }

  res.status(status).json({
    status,
    message,
    ...(process.env.NODE_ENV === "development" && { stack: err.stack }),
  });
});

// ----------------- START SERVER -----------------
(async () => {
  try {
    await seedDatabase();
    console.log("✅ Database seeding completed");
  } catch (error) {
    console.error("❌ Failed to seed database:", error);
    process.exit(1);
  }

  registerRoutes(app);

  const port = parseInt(process.env.PORT || "5000");
  const host = process.env.HOST || "127.0.0.1";

  app.listen(port, host, () => {
    console.log(
      `🚀 Server running on http://${host}:${port} in ${process.env.NODE_ENV} mode`
    );
  });
})();

// ----------------- HELPERS -----------------
function formatAssetToDb(apiAsset: any) {
  return {
    asset_id: apiAsset.asset_id || generateAssetId(),
    asset_name: apiAsset.asset_name,
    description: apiAsset.description,
    category: apiAsset.category,
    serial_number: apiAsset.serial_number,
    model: apiAsset.model,
    manufacturer: apiAsset.manufacturer,
    purchase_date: apiAsset.purchase_date
      ? new Date(apiAsset.purchase_date)
      : null,
    purchase_cost: apiAsset.purchase_cost,
    warranty_expiry: apiAsset.warranty_expiry
      ? new Date(apiAsset.warranty_expiry)
      : null,
    current_location: apiAsset.current_location,
    assigned_department: apiAsset.assigned_department,
    assigned_user_id: apiAsset.assigned_user_id,
    status: apiAsset.status || "active",
    condition: apiAsset.condition || "good",
    notes: apiAsset.notes,
  };
}

function generateAssetId() {
  return `JSC-${Date.now().toString().slice(-6)}`;
}


