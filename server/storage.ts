// server/storage.ts
import { db } from "./db";
import { users, assets, asset_transfers, maintenance_schedules, asset_audit_logs } from "@shared/schema";
import { eq, ilike, and, sql } from "drizzle-orm";

// ===== USERS =====
export async function getUserByUsername(username: string) {
  const result = await db
    .select()
    .from(users)
    .where(eq(users.username, username))
    .limit(1);
  return result[0] || null;
}

// ===== ASSETS =====
export async function getAssets(limit: number, offset: number, filters: any) {
  const conditions = [];

  if (filters.search) {
    // Matches asset name OR description
    conditions.push(ilike(assets.name, `%${filters.search}%`));
  }
  if (filters.status) {
    conditions.push(eq(assets.status, filters.status));
  }
  if (filters.category) {
    conditions.push(eq(assets.category, filters.category));
  }

  const whereClause = conditions.length ? and(...conditions) : undefined;

  const result = await db
    .select()
    .from(assets)
    .where(whereClause)
    .limit(limit)
    .offset(offset);

  // total count for pagination
  const totalCount = await db
    .select({ count: sql<number>`COUNT(*)` })
    .from(assets)
    .where(whereClause);

  return {
    assets: result,
    total: Number(totalCount[0]?.count || 0),
  };
}
export async function getOverdueMaintenances() {
  const today = new Date();
  const result = await db
    .select({
      id: maintenance_schedules.id,
      title: maintenance_schedules.title,
      asset_id: assets.asset_id,
      scheduled_date: maintenance_schedules.scheduled_date,
    })
    .from(maintenance_schedules)
    .leftJoin(assets, eq(maintenance_schedules.asset_id, assets.id))
    .where(
      and(
        eq(maintenance_schedules.status, "scheduled"),
        sql`${maintenance_schedules.scheduled_date} < ${today}`
      )
    );
  
  return result.map(maintenance => ({
    ...maintenance,
    asset_id: maintenance.asset_id || 'Unknown',
  }));
}

export async function getRecentActivity(limit: number = 10) {
  const result = await db
    .select({
      id: asset_audit_logs.id,
      action: asset_audit_logs.action,
      timestamp: asset_audit_logs.timestamp,
      asset_id: assets.asset_id,
      asset_name: assets.asset_name,
      user_name: users.full_name,
      serial_number: assets.serial_number,
      current_location: assets.current_location,
    })
    .from(asset_audit_logs)
    .leftJoin(assets, eq(asset_audit_logs.asset_id, assets.id))
    .leftJoin(users, eq(asset_audit_logs.performed_by_id, users.id))
    .orderBy(sql`${asset_audit_logs.timestamp} DESC`)
    .limit(limit);
  
  return result.map(log => ({
    ...log,
    asset_id: log.asset_id || 'Unknown',
    asset_name: log.asset_name || 'Unknown Asset',
    user_name: log.user_name || 'Unknown User',
  }));
}

export async function getDashboardStats() {
  // Get total assets
  const totalAssetsResult = await db
    .select({ count: sql<number>`COUNT(*)` })
    .from(assets);
  const totalAssets = Number(totalAssetsResult[0]?.count || 0);

  // Get active assets
  const activeAssetsResult = await db
    .select({ count: sql<number>`COUNT(*)` })
    .from(assets)
    .where(eq(assets.status, "active"));
  const activeAssets = Number(activeAssetsResult[0]?.count || 0);

  // Get maintenance assets
  const maintenanceAssetsResult = await db
    .select({ count: sql<number>`COUNT(*)` })
    .from(assets)
    .where(eq(assets.status, "maintenance"));
  const maintenanceAssets = Number(maintenanceAssetsResult[0]?.count || 0);

  // Get retired assets
  const retiredAssetsResult = await db
    .select({ count: sql<number>`COUNT(*)` })
    .from(assets)
    .where(eq(assets.status, "retired"));
  const retiredAssets = Number(retiredAssetsResult[0]?.count || 0);

  // Get pending transfers
  const pendingTransfersResult = await db
    .select({ count: sql<number>`COUNT(*)` })
    .from(asset_transfers)
    .where(eq(asset_transfers.status, "pending"));
  const pendingTransfers = Number(pendingTransfersResult[0]?.count || 0);

  // Get overdue maintenances
  const today = new Date();
  const overdueMaintenancesResult = await db
    .select({ count: sql<number>`COUNT(*)` })
    .from(maintenance_schedules)
    .where(
      and(
        eq(maintenance_schedules.status, "scheduled"),
        sql`${maintenance_schedules.scheduled_date} < ${today}`
      )
    );
  const overdueMaintenances = Number(overdueMaintenancesResult[0]?.count || 0);

  return {
    total_assets: totalAssets,
    active_assets: activeAssets,
    maintenance_assets: maintenanceAssets,
    retired_assets: retiredAssets,
    pending_transfers: pendingTransfers,
    overdue_maintenances: overdueMaintenances,
  };
}

export async function createAsset(assetData: {
  asset_id: string;
  asset_name: string;
  description?: string;
  category: string;
  serial_number?: string;
  model?: string;
  manufacturer?: string;
  purchase_date?: Date | null;
  purchase_cost?: number;
  warranty_expiry?: Date | null;
  current_location: string;
  assigned_department: string;
  assigned_user_id?: number;
  status?: string;
  condition?: string;
  notes?: string;
}) {
  const result = await db
    .insert(assets)
    .values({
      asset_id: assetData.asset_id,
      asset_name: assetData.asset_name,
      description: assetData.description,
      category: assetData.category as any,
      serial_number: assetData.serial_number,
      model: assetData.model,
      manufacturer: assetData.manufacturer,
      purchase_date: assetData.purchase_date,
      purchase_cost: assetData.purchase_cost,
      warranty_expiry: assetData.warranty_expiry,
      current_location: assetData.current_location,
      assigned_department: assetData.assigned_department,
      assigned_user_id: assetData.assigned_user_id,
      status: (assetData.status as any) || "active",
      condition: assetData.condition || "good",
      notes: assetData.notes,
    })
    .returning();
  
  return result[0];
}

export async function getAssetCategories() {
  const result = await db
    .select({
      category: assets.category,
      count: sql<number>`COUNT(*)`,
    })
    .from(assets)
    .groupBy(assets.category);
  
  return result.map(row => ({
    category: row.category,
    count: Number(row.count),
  }));
}

