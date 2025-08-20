import { db } from "./db";
import { users, assets, asset_transfers, maintenance_schedules, asset_audit_logs } from "@shared/schema";
import bcrypt from "bcrypt";
import { eq } from "drizzle-orm";

export async function seedDatabase() {
  try {
    // Check if admin user already exists
    const existingAdmin = await db.select().from(users).where(eq(users.username, "admin"));
    
    if (existingAdmin.length === 0) {
      // Create default admin user
      const hashedPassword = await bcrypt.hash("admin123", 10);
      
              await db.insert(users).values({
          username: "admin",
          password: hashedPassword,
          email: "admin@jsc.go.ke",
          full_name: "System Administrator",
          role: "admin",
          department: "IT Department",
          is_active: true
        });
      
      console.log("✓ Default admin user created:");
      console.log("  Username: admin");
      console.log("  Password: admin123");
      console.log("  Email: admin@jsc.go.ke");
    }

    // Create sample asset manager user
    const existingManager = await db.select().from(users).where(eq(users.username, "assetmanager"));
    
    if (existingManager.length === 0) {
      const hashedPassword = await bcrypt.hash("manager123", 10);
      
      await db.insert(users).values({
        username: "assetmanager",
        password: hashedPassword,
        email: "assets@jsc.go.ke",
        full_name: "Asset Manager",
        role: "asset_manager",
        department: "Administration",
        is_active: true
      });
      
      console.log("✓ Default asset manager user created:");
      console.log("  Username: assetmanager");
      console.log("  Password: manager123");
      console.log("  Email: assets@jsc.go.ke");
    }

    // Create sample staff user
    const existingStaff = await db.select().from(users).where(eq(users.username, "staff"));
    
    if (existingStaff.length === 0) {
      const hashedPassword = await bcrypt.hash("staff123", 10);
      
      await db.insert(users).values({
        username: "staff",
        password: hashedPassword,
        email: "staff@jsc.go.ke",
        full_name: "Staff Member",
        role: "staff",
        department: "Legal Department",
        is_active: true
      });
      
      console.log("✓ Default staff user created:");
      console.log("  Username: staff");
      console.log("  Password: staff123");
      console.log("  Email: staff@jsc.go.ke");
    }

    // Check if sample assets exist
    const existingAssets = await db.select().from(assets).limit(1);
    
    if (existingAssets.length === 0) {
      // Create sample assets
      const sampleAssets = [
        {
          asset_id: "JSC-001",
          asset_name: "Dell Latitude Laptop",
          description: "High-performance laptop for legal staff",
          category: "computers",
          serial_number: "DL123456789",
          model: "Latitude 5520",
          manufacturer: "Dell",
          purchase_date: new Date("2023-01-15"),
          purchase_cost: 120000,
          warranty_expiry: new Date("2026-01-15"),
          current_location: "IT Department",
          assigned_department: "Legal Department",
          assigned_user_id: 3, // staff user
          status: "active",
          condition: "good",
          notes: "Primary workstation for legal research"
        },
        {
          asset_id: "JSC-002",
          asset_name: "HP LaserJet Printer",
          description: "Network printer for document printing",
          category: "printers",
          serial_number: "HP987654321",
          model: "LaserJet Pro M404n",
          manufacturer: "HP",
          purchase_date: new Date("2023-03-20"),
          purchase_cost: 45000,
          warranty_expiry: new Date("2025-03-20"),
          current_location: "Print Room",
          assigned_department: "Administration",
          assigned_user_id: 2, // asset manager
          status: "active",
          condition: "good",
          notes: "Main office printer"
        },
        {
          asset_id: "JSC-003",
          asset_name: "Office Desk Set",
          description: "Ergonomic desk and chair set",
          category: "furniture",
          serial_number: "FUR001",
          model: "Executive Series",
          manufacturer: "OfficeMax",
          purchase_date: new Date("2023-02-10"),
          purchase_cost: 35000,
          warranty_expiry: new Date("2028-02-10"),
          current_location: "Legal Department",
          assigned_department: "Legal Department",
          assigned_user_id: 3, // staff user
          status: "active",
          condition: "good",
          notes: "Ergonomic workstation setup"
        },
        {
          asset_id: "JSC-004",
          asset_name: "Legal Reference Library",
          description: "Complete legal reference materials",
          category: "legal_materials",
          serial_number: "LEG001",
          model: "Complete Set",
          manufacturer: "Legal Publishers Ltd",
          purchase_date: new Date("2023-01-05"),
          purchase_cost: 250000,
          warranty_expiry: new Date("2030-01-05"),
          current_location: "Library",
          assigned_department: "Legal Department",
          assigned_user_id: null,
          status: "active",
          condition: "excellent",
          notes: "Complete legal reference collection"
        },
        {
          asset_id: "JSC-005",
          asset_name: "Network Switch",
          description: "24-port network switch for office connectivity",
          category: "other",
          serial_number: "NET001",
          model: "Cisco Catalyst 2960",
          manufacturer: "Cisco",
          purchase_date: new Date("2023-04-15"),
          purchase_cost: 75000,
          warranty_expiry: new Date("2026-04-15"),
          current_location: "Server Room",
          assigned_department: "IT Department",
          assigned_user_id: 1, // admin
          status: "maintenance",
          condition: "fair",
          notes: "Requires firmware update"
        }
      ];

      await db.insert(assets).values(sampleAssets);
      console.log("✓ Sample assets created");
    }

    // Check if sample transfers exist
    const existingTransfers = await db.select().from(asset_transfers).limit(1);
    
    if (existingTransfers.length === 0) {
      // Create sample transfer
      await db.insert(asset_transfers).values({
        asset_id: 1, // JSC-001
        from_user_id: 3, // staff
        to_user_id: 2, // asset manager
        from_department: "Legal Department",
        to_department: "Administration",
        from_location: "Legal Department",
        to_location: "Administration Office",
        reason: "Temporary reassignment for administrative tasks",
        status: "pending",
        requested_by_id: 3, // staff
        approved_by_id: null
      });
      console.log("✓ Sample transfer request created");
    }

    // Check if sample maintenance schedules exist
    const existingMaintenance = await db.select().from(maintenance_schedules).limit(1);
    
    if (existingMaintenance.length === 0) {
      // Create sample maintenance schedule
      await db.insert(maintenance_schedules).values({
        asset_id: 5, // JSC-005 (network switch)
        title: "Firmware Update",
        description: "Update network switch firmware to latest version",
        scheduled_date: new Date("2024-02-15"),
        status: "scheduled",
        performed_by: "IT Technician",
        cost: 5000,
        notes: "Routine firmware update for security patches",
        created_by_id: 1 // admin
      });
      console.log("✓ Sample maintenance schedule created");
    }

    // Check if sample audit logs exist
    const existingLogs = await db.select().from(asset_audit_logs).limit(1);
    
    if (existingLogs.length === 0) {
      // Create sample audit logs
      const sampleLogs = [
        {
          asset_id: 1,
          action: "ASSET_CREATED",
          old_values: null,
          new_values: JSON.stringify({ asset_name: "Dell Latitude Laptop", status: "active" }),
          performed_by_id: 1, // admin
          ip_address: "192.168.1.100",
          user_agent: "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36"
        },
        {
          asset_id: 2,
          action: "ASSET_CREATED",
          old_values: null,
          new_values: JSON.stringify({ asset_name: "HP LaserJet Printer", status: "active" }),
          performed_by_id: 1, // admin
          ip_address: "192.168.1.100",
          user_agent: "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36"
        },
        {
          asset_id: 1,
          action: "TRANSFER_REQUESTED",
          old_values: JSON.stringify({ assigned_department: "Legal Department" }),
          new_values: JSON.stringify({ assigned_department: "Administration" }),
          performed_by_id: 3, // staff
          ip_address: "192.168.1.101",
          user_agent: "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36"
        }
      ];

      await db.insert(asset_audit_logs).values(sampleLogs);
      console.log("✓ Sample audit logs created");
    }

    console.log("✓ Database seeding completed successfully!");
    
  } catch (error) {
    console.error("Database seeding failed:", error);
    throw error;
  }
}