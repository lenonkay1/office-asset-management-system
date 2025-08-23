import { Router } from "express";
import * as storage from "../storage";

const router = Router();

function mapAssetForClient(row: any) {
  return {
    ...row,
    // Provide fields the frontend expects, with safe fallbacks
    asset_id: row.asset_id || `A${String(row.id).padStart(4, "0")}`,
    category: row.category || "other",
    current_location: row.current_location ?? "Unknown",
    assigned_department: row.assigned_department ?? "-",
    condition: row.condition ?? null,
    next_maintenance_date: row.next_maintenance_date ?? null,
    last_transfer_at: row.last_transfer_at ?? null,
  };
}

// Asset search (by id code, name, or serial)
router.get("/search", async (req, res) => {
  try {
    const q = ((req.query.q as string) || "").trim();
    const limit = parseInt((req.query.limit as string) || "20", 10);
    if (!q || q.length < 2) return res.json([]);
    const results = await (storage as any).searchAssets(q, limit);
    const mapped = results.map((row: any) => ({
      id: row.id,
      asset_id: `A${String(row.id).padStart(4, "0")}`,
      asset_name: row.asset_name,
      current_location: row.current_location ?? "Unknown",
      assigned_department: row.assigned_department ?? "-",
      status: row.status || "active",
      serial_number: row.serial_number || null,
      model: row.model || null,
    }));
    return res.json(mapped);
  } catch (err) {
    console.error("Asset search failed:", err);
    return res.status(500).json([]);
  }
});

// Get all assets
router.get("/", async (req, res) => {
  try {
    const limit = parseInt(req.query.limit as string) || 100;
    const offset = parseInt(req.query.offset as string) || 0;
    const filters = req.query.filters || {};

    const result = await storage.getAssets(limit, offset, filters);
    const page = Math.floor(offset / limit) + 1;
    const assets = (result.assets || []).map(mapAssetForClient);
    return res.json({
      assets,
      pagination: {
        total: result.total || assets.length,
        page,
        limit,
        total_pages: Math.ceil((result.total || assets.length) / limit),
      },
    });
  } catch (err) {
    console.error("Error fetching assets:", err);
    res.status(500).json({ error: "Failed to fetch assets" });
  }
});

// Add new asset
router.post("/", async (req, res) => {
  try {
    const newAsset = await storage.addAsset(req.body);
    res.json(mapAssetForClient(newAsset));
  } catch (err) {
    console.error("Error adding asset:", err);
    res.status(500).json({ error: "Failed to add asset" });
  }
});

// Update asset
router.put("/:id", async (req, res) => {
  const assetId = parseInt(req.params.id);
  try {
    const updated = await storage.updateAsset(assetId, req.body);
    if (!updated) return res.status(404).json({ error: "Asset not found" });
    res.json(mapAssetForClient(updated));
  } catch (err) {
    console.error("Error updating asset:", err);
    res.status(500).json({ error: "Failed to update asset" });
  }
});

// Delete asset
router.delete("/:id", async (req, res) => {
  const assetId = parseInt(req.params.id);
  try {
    const deleted = await storage.deleteAsset(assetId);
    if (!deleted) return res.status(404).json({ error: "Asset not found" });
    res.json({ message: "Asset deleted" });
  } catch (err) {
    console.error("Error deleting asset:", err);
    res.status(500).json({ error: "Failed to delete asset" });
  }
});

export default router;
