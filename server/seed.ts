// server/seed.ts
import { db } from "./db";
import {
  insertUserSchema,
  insertAssetSchema,
} from "./shared/schema";

export async function seedDatabase() {
  try {
    // --- Seed Users ---
    const users = [
      {
        username: "admin",
        password: "admin123", // Ideally hashed
        email: "admin@example.com",
        full_name: "System Administrator",
        department: "IT",
        role: "admin",
      },
      {
        username: "manager",
        password: "manager123",
        email: "manager@example.com",
        full_name: "Asset Manager",
        department: "IT",
        role: "asset_manager",
      },
      {
        username: "john",
        password: "john123",
        email: "john@example.com",
        full_name: "John Doe",
        department: "Finance",
        role: "staff",
      },
    ];

    for (const user of users) {
      await db.insert(insertUserSchema).values(user);
    }

    console.log("Users seeded successfully.");

    // --- Seed Assets ---
    const assets = [
      {
        asset_id: "A001",
        asset_name: "Dell Laptop",
        description: "Dell Latitude 7420",
        category: "computers",
        serial_number: "DL7420SN001",
        model: "Latitude 7420",
        manufacturer: "Dell",
        purchase_date: new Date("2023-01-15"),
        purchase_cost: 1200.0,
        warranty_expiry: new Date("2025-01-15"),
        current_location: "Main Office",
        assigned_department: "IT",
        status: "active",
        condition: "good",
        notes: "Newly purchased",
      },
      {
        asset_id: "A002",
        asset_name: "HP Printer",
        description: "HP LaserJet Pro",
        category: "printers",
        serial_number: "HP12345",
        model: "LaserJet Pro M404dn",
        manufacturer: "HP",
        purchase_date: new Date("2022-08-10"),
        purchase_cost: 350.0,
        warranty_expiry: new Date("2024-08-10"),
        current_location: "Main Office",
        assigned_department: "Finance",
        status: "active",
        condition: "good",
        notes: "Works fine",
      },
    ];

    for (const asset of assets) {
      await db.insert(insertAssetSchema).values(asset);
    }

    console.log("Assets seeded successfully.");
  } catch (err) {
    console.error("Error seeding database:", err);
  }
}

// Run seeding
seedDatabase().then(() => {
  console.log("Seeding completed.");
  process.exit(0);
});
