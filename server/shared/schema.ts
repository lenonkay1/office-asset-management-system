// import { pgTable, text, serial, integer, boolean, timestamp, decimal, pgEnum } from "drizzle-orm/pg-core";
// import { relations } from "drizzle-orm";
// import { createInsertSchema } from "drizzle-zod";
// import { z } from "zod";

// // Enums
// export const userRoleEnum = pgEnum("user_role", ["admin", "asset_manager", "department_head", "staff"]);
// export const assetStatusEnum = pgEnum("asset_status", ["active", "maintenance", "retired", "disposed"]);
// export const assetCategoryEnum = pgEnum("asset_category", ["computers", "printers", "furniture", "legal_materials", "other"]);
// export const transferStatusEnum = pgEnum("transfer_status", ["pending", "approved", "completed", "rejected"]);
// export const maintenanceStatusEnum = pgEnum("maintenance_status", ["scheduled", "in_progress", "completed", "cancelled"]);

// // Users table
// export const users = pgTable("users", {
//   id: serial("id").primaryKey(),
//   username: text("username").notNull().unique(),
//   password: text("password").notNull(),
//   email: text("email").notNull().unique(),
//   fullName: text("full_name").notNull(),
//   role: userRoleEnum("role").notNull().default("staff"),
//   department: text("department").notNull(),
//   isActive: boolean("is_active").notNull().default(true),
//   createdAt: timestamp("created_at").notNull().defaultNow(),
//   updatedAt: timestamp("updated_at").notNull().defaultNow(),
// });

// // Assets table
// export const assets = pgTable("assets", {
//   id: serial("id").primaryKey(),
//   assetId: text("asset_id").notNull().unique(),
//   name: text("asset_name").notNull(),
//   description: text("description"),
//   category: assetCategoryEnum("category").notNull(),
//   serialNumber: text("serial_number"),
//   model: text("model"),
//   manufacturer: text("manufacturer"),
//   purchaseDate: timestamp("purchase_date"),
//   purchaseCost: decimal("purchase_cost", { precision: 10, scale: 2 }),
//   warrantyExpiry: timestamp("warranty_expiry"),
//   currentLocation: text("current_location").notNull(),
//   assigned_department: text("assigned_department").notNull(),
//   assignedUserId: integer("assigned_user_id"),
//   status: assetStatusEnum("status").notNull().default("active"),
//   condition: text("condition").notNull().default("good"),
//   notes: text("notes"),
//   createdAt: timestamp("created_at").notNull().defaultNow(),
//   updatedAt: timestamp("updated_at").notNull().defaultNow(),
// });

// // Asset transfers table
// export const assetTransfers = pgTable("asset_transfers", {
//   id: serial("id").primaryKey(),
//   assetId: integer("asset_id").notNull(),
//   fromUserId: integer("from_user_id"),
//   toUserId: integer("to_user_id"),
//   fromDepartment: text("from_department").notNull(),
//   toDepartment: text("to_department").notNull(),
//   fromLocation: text("from_location").notNull(),
//   toLocation: text("to_location").notNull(),
//   reason: text("reason").notNull(),
//   status: transferStatusEnum("status").notNull().default("pending"),
//   requestedById: integer("requested_by_id").notNull(),
//   approvedById: integer("approved_by_id"),
//   completedAt: timestamp("completed_at"),
//   createdAt: timestamp("created_at").notNull().defaultNow(),
//   updatedAt: timestamp("updated_at").notNull().defaultNow(),
// });

// // Maintenance schedules table
// export const maintenanceSchedules = pgTable("maintenance_schedules", {
//   id: serial("id").primaryKey(),
//   assetId: integer("asset_id").notNull(),
//   title: text("title").notNull(),
//   description: text("description"),
//   scheduledDate: timestamp("scheduled_date").notNull(),
//   completedDate: timestamp("completed_date"),
//   status: maintenanceStatusEnum("status").notNull().default("scheduled"),
//   performedBy: text("performed_by"),
//   cost: decimal("cost", { precision: 10, scale: 2 }),
//   notes: text("notes"),
//   createdById: integer("created_by_id").notNull(),
//   createdAt: timestamp("created_at").notNull().defaultNow(),
//   updatedAt: timestamp("updated_at").notNull().defaultNow(),
// });

// // Asset audit logs table
// export const assetAuditLogs = pgTable("asset_audit_logs", {
//   id: serial("id").primaryKey(),
//   assetId: integer("asset_id").notNull(),
//   action: text("action").notNull(),
//   oldValues: text("old_values"),
//   newValues: text("new_values"),
//   performedById: integer("performed_by_id").notNull(),
//   timestamp: timestamp("timestamp").notNull().defaultNow(),
//   ipAddress: text("ip_address"),
//   userAgent: text("user_agent"),
// });

// // Relations
// export const usersRelations = relations(users, ({ many }) => ({
//   assignedAssets: many(assets, { relationName: "assignedUser" }),
//   requestedTransfers: many(assetTransfers, { relationName: "requestedBy" }),
//   approvedTransfers: many(assetTransfers, { relationName: "approvedBy" }),
//   createdMaintenances: many(maintenanceSchedules, { relationName: "createdBy" }),
//   auditLogs: many(assetAuditLogs, { relationName: "performedBy" }),
// }));

// export const assetsRelations = relations(assets, ({ one, many }) => ({
//   assignedUser: one(users, {
//     fields: [assets.assignedUserId],
//     references: [users.id],
//     relationName: "assignedUser",
//   }),
//   transfers: many(assetTransfers),
//   maintenanceSchedules: many(maintenanceSchedules),
//   auditLogs: many(assetAuditLogs),
// }));

// export const assetTransfersRelations = relations(assetTransfers, ({ one }) => ({
//   asset: one(assets, {
//     fields: [assetTransfers.assetId],
//     references: [assets.id],
//   }),
//   fromUser: one(users, {
//     fields: [assetTransfers.fromUserId],
//     references: [users.id],
//     relationName: "fromUser",
//   }),
//   toUser: one(users, {
//     fields: [assetTransfers.toUserId],
//     references: [users.id],
//     relationName: "toUser",
//   }),
//   requestedBy: one(users, {
//     fields: [assetTransfers.requestedById],
//     references: [users.id],
//     relationName: "requestedBy",
//   }),
//   approvedBy: one(users, {
//     fields: [assetTransfers.approvedById],
//     references: [users.id],
//     relationName: "approvedBy",
//   }),
// }));

// export const maintenanceSchedulesRelations = relations(maintenanceSchedules, ({ one }) => ({
//   asset: one(assets, {
//     fields: [maintenanceSchedules.assetId],
//     references: [assets.id],
//   }),
//   createdBy: one(users, {
//     fields: [maintenanceSchedules.createdById],
//     references: [users.id],
//     relationName: "createdBy",
//   }),
// }));

// export const assetAuditLogsRelations = relations(assetAuditLogs, ({ one }) => ({
//   asset: one(assets, {
//     fields: [assetAuditLogs.assetId],
//     references: [assets.id],
//   }),
//   performedBy: one(users, {
//     fields: [assetAuditLogs.performedById],
//     references: [users.id],
//     relationName: "performedBy",
//   }),
// }));

// // Insert schemas
// export const insertUserSchema = createInsertSchema(users).omit({
//   id: true,
//   createdAt: true,
//   updatedAt: true,
// });

// export const insertAssetSchema = createInsertSchema(assets).omit({
//   id: true,
//   createdAt: true,
//   updatedAt: true,
// });

// export const insertAssetTransferSchema = createInsertSchema(assetTransfers).omit({
//   id: true,
//   createdAt: true,
//   updatedAt: true,
// });

// export const insertMaintenanceScheduleSchema = createInsertSchema(maintenanceSchedules).omit({
//   id: true,
//   createdAt: true,
//   updatedAt: true,
// });

// export const insertAssetAuditLogSchema = createInsertSchema(assetAuditLogs).omit({
//   id: true,
//   timestamp: true,
// });

// // Types
// export type User = typeof users.$inferSelect;
// export type InsertUser = z.infer<typeof insertUserSchema>;
// export type Asset = typeof assets.$inferSelect;
// export type InsertAsset = z.infer<typeof insertAssetSchema>;
// export type AssetTransfer = typeof assetTransfers.$inferSelect;
// export type InsertAssetTransfer = z.infer<typeof insertAssetTransferSchema>;
// export type MaintenanceSchedule = typeof maintenanceSchedules.$inferSelect;
// export type InsertMaintenanceSchedule = z.infer<typeof insertMaintenanceScheduleSchema>;
// export type AssetAuditLog = typeof assetAuditLogs.$inferSelect;
// export type InsertAssetAuditLog = z.infer<typeof insertAssetAuditLogSchema>;


import { pgTable, text, serial, integer, boolean, timestamp, decimal, pgEnum, varchar, numeric } from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// Enums
export const userRoleEnum = pgEnum("user_role", ["admin", "asset_manager", "department_head", "staff"]);
export const assetStatusEnum = pgEnum("asset_status", ["active", "maintenance", "retired", "disposed"]);
export const assetCategoryEnum = pgEnum("asset_category", ["computers", "printers", "furniture", "legal_materials", "other"]);
export const transferStatusEnum = pgEnum("transfer_status", ["pending", "approved", "completed", "rejected"]);
export const maintenanceStatusEnum = pgEnum("maintenance_status", ["scheduled", "in_progress", "completed", "cancelled"]);

// Users table - Updated to snake_case
// export const users = pgTable("users", {
//   id: serial("id").primaryKey(),
//   username: text("username").notNull().unique(),
//   password: text("password").notNull(),
//   email: text("email").notNull().unique(),
//   full_name: text("full_name").notNull(), // Changed from fullName
//   role: userRoleEnum("role").notNull().default("staff"),
//   department: text("department").notNull(),
//   is_active: boolean("is_active").notNull().default(true), // Changed from isActive
//   created_at: timestamp("created_at").notNull().defaultNow(), // Changed from createdAt
//   updated_at: timestamp("updated_at").notNull().defaultNow(), // Changed from updatedAt
// });

  // server/shared/schema.ts
import { varchar,numeric,  } from "drizzle-orm/pg-core";

// server/shared/schema.ts

// ===== USERS TABLE =====
export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  username: varchar("username", { length: 50 }).notNull(),
  password: text("password").notNull(),
  email: varchar("email", { length: 100 }).notNull(),
  full_name: varchar("full_name", { length: 100 }).notNull(),
  department: varchar("department", { length: 100 }).notNull(),
  role: varchar("role", { length: 50 }).notNull(), // admin, asset_manager, department_head, staff
  is_active: boolean("is_active").default(true).notNull(),
  created_at: timestamp("created_at").defaultNow().notNull(),
  updated_at: timestamp("updated_at").defaultNow().notNull(),
});

// ===== ASSETS TABLE =====
export const assets = pgTable("assets", {
  id: serial("id").primaryKey(),
  asset_name: varchar("asset_name", { length: 100 }).notNull(),
  description: text("description"),
  category: varchar("category", { length: 50 }),
  serial_number: varchar("serial_number", { length: 50 }),
  model: varchar("model", { length: 50 }),
  manufacturer: varchar("manufacturer", { length: 50 }),
  purchase_date: timestamp("purchase_date"),
  purchase_cost: numeric("purchase_cost", { precision: 12, scale: 2 }),
  warranty_expiry: timestamp("warranty_expiry"),
  // Added fields used by the API layer
  current_location: varchar("current_location", { length: 100 }),
  assigned_department: varchar("assigned_department", { length: 100 }),
  status: varchar("status", { length: 20 }).default("active"),
  assigned_user_id: integer("assigned_user_id"), // <- rename here
  created_at: timestamp("created_at").defaultNow().notNull(),
  updated_at: timestamp("updated_at").defaultNow().notNull(),
});

// Settings table for key-value configuration
export const settings = pgTable("settings", {
  key: text("key").primaryKey(),
  value: text("value"),
  updated_at: timestamp("updated_at").defaultNow().notNull(),
});

// Asset transfers table - Updated to snake_case
export const asset_transfers = pgTable("asset_transfers", { // Changed from assetTransfers
  id: serial("id").primaryKey(),
  asset_id: integer("asset_id").notNull(), // Changed from assetId
  from_user_id: integer("from_user_id"), // Changed from fromUserId
  to_user_id: integer("to_user_id"), // Changed from toUserId
  from_department: text("from_department").notNull(), // Changed from fromDepartment
  to_department: text("to_department").notNull(), // Changed from toDepartment
  from_location: text("from_location").notNull(), // Changed from fromLocation
  to_location: text("to_location").notNull(), // Changed from toLocation
  reason: text("reason").notNull(),
  status: transferStatusEnum("status").notNull().default("pending"),
  requested_by_id: integer("requested_by_id").notNull(), // Changed from requestedById
  approved_by_id: integer("approved_by_id"), // Changed from approvedById
  completed_at: timestamp("completed_at"), // Changed from completedAt
  created_at: timestamp("created_at").notNull().defaultNow(), // Changed from createdAt
  updated_at: timestamp("updated_at").notNull().defaultNow(), // Changed from updatedAt
});

// Maintenance schedules table - Updated to snake_case
export const maintenance_schedules = pgTable("maintenance_schedules", { // Changed from maintenanceSchedules
  id: serial("id").primaryKey(),
  asset_id: integer("asset_id").notNull(), // Changed from assetId
  title: text("title").notNull(),
  description: text("description"),
  scheduled_date: timestamp("scheduled_date").notNull(), // Changed from scheduledDate
  completed_date: timestamp("completed_date"), // Changed from completedDate
  status: maintenanceStatusEnum("status").notNull().default("scheduled"),
  performed_by: text("performed_by"), // Changed from performedBy
  cost: decimal("cost", { precision: 10, scale: 2 }),
  notes: text("notes"),
  created_by_id: integer("created_by_id").notNull(), // Changed from createdById
  created_at: timestamp("created_at").notNull().defaultNow(), // Changed from createdAt
  updated_at: timestamp("updated_at").notNull().defaultNow(), // Changed from updatedAt
});

// Asset audit logs table - Updated to snake_case
export const asset_audit_logs = pgTable("asset_audit_logs", { // Changed from assetAuditLogs
  id: serial("id").primaryKey(),
  asset_id: integer("asset_id").notNull(), // Changed from assetId
  action: text("action").notNull(),
  old_values: text("old_values"), // Changed from oldValues
  new_values: text("new_values"), // Changed from newValues
  performed_by_id: integer("performed_by_id").notNull(), // Changed from performedById
  timestamp: timestamp("timestamp").notNull().defaultNow(),
  ip_address: text("ip_address"), // Changed from ipAddress
  user_agent: text("user_agent"), // Changed from userAgent
});

// Relations - Updated to use snake_case table names and fields
export const usersRelations = relations(users, ({ many }) => ({
  assigned_assets: many(assets, { relationName: "assigned_user" }), // Changed field and relation names
  requested_transfers: many(asset_transfers, { relationName: "requested_by" }),
  approved_transfers: many(asset_transfers, { relationName: "approved_by" }),
  created_maintenances: many(maintenance_schedules, { relationName: "created_by" }),
  audit_logs: many(asset_audit_logs, { relationName: "performed_by" }),
}));

export const assetsRelations = relations(assets, ({ one, many }) => ({
  assigned_user: one(users, { // Changed relation name
    fields: [assets.assigned_user_id],
    references: [users.id],
    relationName: "assigned_user",
  }),
  transfers: many(asset_transfers),
  maintenance_schedules: many(maintenance_schedules), // Changed from maintenanceSchedules
  audit_logs: many(asset_audit_logs), // Changed from auditLogs
}));

// ... [continue updating all relation definitions with snake_case]

export const assetTransfersRelations = relations(asset_transfers, ({ one }) => ({
  asset: one(assets, {
    fields: [asset_transfers.asset_id],
    references: [assets.id],
  }),
  fromUser: one(users, {
    fields: [asset_transfers.from_user_id],
    references: [users.id],
    relationName: "fromUser",
  }),
  toUser: one(users, {
    fields: [asset_transfers.to_user_id],
    references: [users.id],
    relationName: "toUser",
  }),
  requestedBy: one(users, {
    fields: [asset_transfers.requested_by_id],
    references: [users.id],
    relationName: "requestedBy",
  }),
  approvedBy: one(users, {
    fields: [asset_transfers.approved_by_id],
    references: [users.id],
    relationName: "approvedBy",
  }),
}));

export const maintenanceSchedulesRelations = relations(maintenance_schedules, ({ one }) => ({
  asset: one(assets, {
    fields: [maintenance_schedules.asset_id],
    references: [assets.id],
  }),
  createdBy: one(users, {
    fields: [maintenance_schedules.created_by_id],
    references: [users.id],
    relationName: "createdBy",
  }),
}));

export const assetAuditLogsRelations = relations(asset_audit_logs, ({ one }) => ({
  asset: one(assets, {
    fields: [asset_audit_logs.asset_id],
    references: [assets.id],
  }),
  performedBy: one(users, {
    fields: [asset_audit_logs.performed_by_id],
    references: [users.id],
    relationName: "performedBy",
  }),
}));


// Insert schemas - Updated to use snake_case fields
export const insertUserSchema = createInsertSchema(users, {
  // Add validation as needed
}).omit({
  id: true,
  created_at: true,
  updated_at: true,
});

// ... [update all other insert schemas similarly]


export const insertAssetSchema = createInsertSchema(assets).omit({
  id: true,
  created_at: true,
  updated_at: true,
});

export const insertAssetTransferSchema = createInsertSchema(asset_transfers).omit({
  id: true,
  created_at: true,
  updated_at: true,
});

export const insertMaintenanceScheduleSchema = createInsertSchema(maintenance_schedules).omit({
  id: true,
  created_at: true,
  updated_at: true,
});

export const insertAssetAuditLogSchema = createInsertSchema(asset_audit_logs).omit({
  id: true,
  timestamp: true,
});

// Types - These will automatically infer the correct field names
export type User = typeof users.$inferSelect;
export type InsertUser = z.infer<typeof insertUserSchema>;
export type Asset = typeof assets.$inferSelect;
export type InsertAsset = z.infer<typeof insertAssetSchema>;
export type AssetTransfer = typeof asset_transfers.$inferSelect; // Changed from assetTransfers
export type MaintenanceSchedule = typeof maintenance_schedules.$inferSelect; // Changed from maintenanceSchedules
export type AssetAuditLog = typeof asset_audit_logs.$inferSelect; // Changed from assetAuditLogs