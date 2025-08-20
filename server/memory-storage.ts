// import bcrypt from "bcrypt";
// import { 
//   type User, 
//   type InsertUser, 
//   type Asset, 
//   type InsertAsset,
//   type AssetTransfer,
//   type AssetTransfer,
//   type MaintenanceSchedule,
//   type MaintenanceSchedule,
//   type AssetAuditLog,
//   type AssetAuditLog
// } from "@shared/schema";
// import { IStorage } from "./storage";

// export class MemoryStorage implements IStorage {
//   private users: User[] = [];
//   private assets: Asset[] = [];
//   private transfers: AssetTransfer[] = [];
//   private maintenances: MaintenanceSchedule[] = [];
//   private auditLogs: AssetAuditLog[] = [];
//   private nextId = 1;

//   constructor() {
//     // Create default users
//     this.initializeDefaultUsers();
//   }

//   private async initializeDefaultUsers() {
//     const defaultUsers = [
//       {
//         username: "admin",
//         email: "admin@jsc.go.ke",
//         fullName: "System Administrator",
//         role: "admin" as const,
//         department: "IT",
//         password: await bcrypt.hash("admin123", 10),
//         isActive: true
//       },
//       {
//         username: "assetmanager",
//         email: "assets@jsc.go.ke", 
//         fullName: "Asset Manager",
//         role: "asset_manager" as const,
//         department: "Operations",
//         password: await bcrypt.hash("manager123", 10),
//         isActive: true
//       },
//       {
//         username: "staff",
//         email: "staff@jsc.go.ke",
//         fullName: "Staff User", 
//         role: "staff" as const,
//         department: "Legal",
//         password: await bcrypt.hash("staff123", 10),
//         isActive: true
//       }
//     ];

//     for (const userData of defaultUsers) {
//       const user: User = {
//         id: this.nextId++,
//         ...userData,
//         created_at: new Date(),
//         updated_at: new Date()
//       };
//       this.users.push(user);
//     }
//   }

//   // User methods
//   async getUser(id: number): Promise<User | undefined> {
//     return this.users.find(u => u.id === id);
//   }

//   async getUserByUsername(username: string): Promise<User | undefined> {
//     return this.users.find(u => u.username === username);
//   }

//   async getUserByEmail(email: string): Promise<User | undefined> {
//     return this.users.find(u => u.email === email);
//   }

//   async createUser(insertUser: InsertUser): Promise<User> {
//     const user: User = {
//       id: this.nextId++,
//       ...insertUser,
//       created_at: new Date(),
//       updated_at: new Date()
//     };
//     this.users.push(user);
//     return user;
//   }

//   async updateUser(id: number, userUpdate: Partial<InsertUser>): Promise<User | undefined> {
//     const index = this.users.findIndex(u => u.id === id);
//     if (index === -1) return undefined;
    
//     this.users[index] = { ...this.users[index], ...userUpdate, updated_at: new Date() };
//     return this.users[index];
//   }

//   // Asset methods
//   async getAsset(id: number): Promise<Asset | undefined> {
//     return this.assets.find(a => a.id === id);
//   }

//   async getAssetByAssetId(assetId: string): Promise<Asset | undefined> {
//     return this.assets.find(a => a.asset_id === assetId);
//   }

//   async getAssets(limit = 50, offset = 0, filters: any = {}): Promise<{ assets: Asset[], total: number }> {
//     let filteredAssets = this.assets;
    
//     if (filters.status) {
//       filteredAssets = filteredAssets.filter(a => a.status === filters.status);
//     }
//     if (filters.category) {
//       filteredAssets = filteredAssets.filter(a => a.category === filters.category);
//     }
//     if (filters.search) {
//       const search = filters.search.toLowerCase();
//       filteredAssets = filteredAssets.filter(a => 
//         a.name.toLowerCase().includes(search) ||
//         a.asset_id.toLowerCase().includes(search) ||
//         a.description?.toLowerCase().includes(search)
//       );
//     }

//     const total = filteredAssets.length;
//     const assets = filteredAssets.slice(offset, offset + limit);
//     return { assets, total };
//   }

//   async createAsset(insertAsset: InsertAsset): Promise<Asset> {
//     const asset: Asset = {
//       id: this.nextId++,
//       assetId: `JSC-${String(this.nextId - 1).padStart(4, '0')}`,
//       ...insertAsset,
//       created_at: new Date(),
//       updated_at: new Date()
//     };
//     this.assets.push(asset);
//     return asset;
//   }

//   async updateAsset(id: number, assetUpdate: Partial<InsertAsset>): Promise<Asset | undefined> {
//     const index = this.assets.findIndex(a => a.id === id);
//     if (index === -1) return undefined;
    
//     this.assets[index] = { ...this.assets[index], ...assetUpdate, updated_at: new Date() };
//     return this.assets[index];
//   }

//   async deleteAsset(id: number): Promise<boolean> {
//     const index = this.assets.findIndex(a => a.id === id);
//     if (index === -1) return false;
    
//     this.assets.splice(index, 1);
//     return true;
//   }

//   async searchAssets(query: string): Promise<Asset[]> {
//     const search = query.toLowerCase();
//     return this.assets.filter(a => 
//       a.name.toLowerCase().includes(search) ||
//       a.asset_id.toLowerCase().includes(search) ||
//       a.description?.toLowerCase().includes(search)
//     ).slice(0, 10);
//   }

//   // Transfer methods
//   async getTransfer(id: number): Promise<AssetTransfer | undefined> {
//     return this.transfers.find(t => t.id === id);
//   }

//   async getTransfers(limit = 50, offset = 0): Promise<{ transfers: AssetTransfer[], total: number }> {
//     const total = this.transfers.length;
//     const transfers = this.transfers.slice(offset, offset + limit);
//     return { transfers, total };
//   }

//   async createTransfer(insertTransfer: InsertAssetTransfer): Promise<AssetTransfer> {
//     const transfer: AssetTransfer = {
//       id: this.nextId++,
//       ...insertTransfer,
//       created_at: new Date(),
//       updated_at: new Date()
//     };
//     this.transfers.push(transfer);
//     return transfer;
//   }

//   async updateTransfer(id: number, transferUpdate: Partial<InsertAssetTransfer>): Promise<AssetTransfer | undefined> {
//     const index = this.transfers.findIndex(t => t.id === id);
//     if (index === -1) return undefined;
    
//     this.transfers[index] = { ...this.transfers[index], ...transferUpdate, updated_at: new Date() };
//     return this.transfers[index];
//   }

//   // Maintenance methods
//   async getMaintenance(id: number): Promise<MaintenanceSchedule | undefined> {
//     return this.maintenances.find(m => m.id === id);
//   }

//   async getMaintenances(limit = 50, offset = 0): Promise<{ maintenances: MaintenanceSchedule[], total: number }> {
//     const total = this.maintenances.length;
//     const maintenances = this.maintenances.slice(offset, offset + limit);
//     return { maintenances, total };
//   }

//   async getOverdueMaintenances(): Promise<MaintenanceSchedule[]> {
//     const now = new Date();
//     return this.maintenances.filter(m => 
//       m.scheduled_date < now && m.status === 'scheduled'
//     );
//   }

//   async createMaintenance(insertMaintenance: InsertMaintenanceSchedule): Promise<MaintenanceSchedule> {
//     const maintenance: MaintenanceSchedule = {
//       id: this.nextId++,
//       ...insertMaintenance,
//       created_at: new Date(),
//       updated_at: new Date()
//     };
//     this.maintenances.push(maintenance);
//     return maintenance;
//   }

//   async updateMaintenance(id: number, maintenanceUpdate: Partial<InsertMaintenanceSchedule>): Promise<MaintenanceSchedule | undefined> {
//     const index = this.maintenances.findIndex(m => m.id === id);
//     if (index === -1) return undefined;
    
//     this.maintenances[index] = { ...this.maintenances[index], ...maintenanceUpdate, updated_at: new Date() };
//     return this.maintenances[index];
//   }

//   // Audit log methods
//   async createAuditLog(insertLog: InsertAssetAuditLog): Promise<AssetAuditLog> {
//     const log: AssetAuditLog = {
//       id: this.nextId++,
//       ...insertLog,
//       created_at: new Date()
//     };
//     this.auditLogs.push(log);
//     return log;
//   }

//   async getAuditLogs(assetId?: number, limit = 50, offset = 0): Promise<{ logs: AssetAuditLog[], total: number }> {
//     let filteredLogs = this.auditLogs;
//     if (assetId) {
//       filteredLogs = filteredLogs.filter(l => l.asset_id === assetId);
//     }

//     const total = filteredLogs.length;
//     const logs = filteredLogs.slice(offset, offset + limit);
//     return { logs, total };
//   }

//   // Dashboard methods
//   async getDashboardStats(): Promise<{
//     totalAssets: number;
//     activeAssets: number;
//     maintenanceAssets: number;
//     retiredAssets: number;
//     pendingTransfers: number;
//     overdueMaintenances: number;
//   }> {
//     const totalAssets = this.assets.length;
//     const activeAssets = this.assets.filter(a => a.status === 'active').length;
//     const maintenanceAssets = this.assets.filter(a => a.status === 'maintenance').length;
//     const retiredAssets = this.assets.filter(a => a.status === 'retired').length;
//     const pendingTransfers = this.transfers.filter(t => t.status === 'pending').length;
//     const overdueMaintenances = await this.getOverdueMaintenances().then(m => m.length);

//     return {
//       totalAssets,
//       activeAssets,
//       maintenanceAssets,
//       retiredAssets,
//       pendingTransfers,
//       overdueMaintenances
//     };
//   }

//   async getAssetsByCategory(): Promise<{ category: string; count: number }[]> {
//     const categories = ['computers', 'printers', 'furniture', 'legal_materials', 'other'];
//     return categories.map(category => ({
//       category,
//       count: this.assets.filter(a => a.category === category).length
//     }));
//   }

//   async getRecentActivity(limit = 10): Promise<any[]> {
//     return this.auditLogs
//       .sort((a, b) => b.created_at.getTime() - a.created_at.getTime())
//       .slice(0, limit)
//       .map(log => ({
//         id: log.id,
//         action: log.action,
//         timestamp: log.created_at.toISOString(),
//         assetName: this.assets.find(a => a.id === log.asset_id)?.name || 'Unknown Asset',
//         assetId: this.assets.find(a => a.id === log.asset_id)?.asset_id || 'N/A',
//         userName: this.users.find(u => u.id === log.userId)?.full_name || 'Unknown User'
//       }));
//   }
// }



import bcrypt from "bcrypt";
import { 
  type User, 
  type InsertUser, 
  type Asset, 
  type InsertAsset,
  type AssetTransfer,
  type MaintenanceSchedule,
  type AssetAuditLog,
  // type AssetAuditLog
} from "@shared/schema";
import { IStorage } from "./storage";

export class MemoryStorage implements IStorage {
  private users: User[] = [];
  private assets: Asset[] = [];
  private transfers: AssetTransfer[] = [];
  private maintenances: MaintenanceSchedule[] = [];
  private audit_logs: AssetAuditLog[] = []; // Changed from auditLogs
  private next_id = 1; // Changed from nextId

  constructor() {
    this.initializeDefaultUsers();
  }

  private async initializeDefaultUsers() {
    const defaultUsers = [
      {
        username: "admin",
        email: "admin@jsc.go.ke",
        full_name: "System Administrator", // Changed from fullName
        role: "admin" as const,
        department: "IT",
        password: await bcrypt.hash("admin123", 10),
        is_active: true // Changed from isActive
      },
      {
        username: "assetmanager",
        email: "assets@jsc.go.ke", 
        full_name: "Asset Manager", // Changed from fullName
        role: "asset_manager" as const,
        department: "Operations",
        password: await bcrypt.hash("manager123", 10),
        is_active: true // Changed from isActive
      },
      {
        username: "staff",
        email: "staff@jsc.go.ke",
        full_name: "Staff User", // Changed from fullName
        role: "staff" as const,
        department: "Legal",
        password: await bcrypt.hash("staff123", 10),
        is_active: true // Changed from isActive
      }
    ];

    for (const userData of defaultUsers) {
      const user: User = {
        id: this.next_id++,
        ...userData,
        created_at: new Date(),
        updated_at: new Date()
      };
      this.users.push(user);
    }
  }

  // User methods
  async getUser(id: number): Promise<User | undefined> {
    return this.users.find(u => u.id === id);
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    return this.users.find(u => u.username === username);
  }

  async getUserByEmail(email: string): Promise<User | undefined> {
    return this.users.find(u => u.email === email);
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const user: User = {
      id: this.next_id++,
      ...insertUser,
      created_at: new Date(),
      updated_at: new Date()
    };
    this.users.push(user);
    return user;
  }

  // Asset methods - Updated field names
  async getAsset(id: number): Promise<Asset | undefined> {
    return this.assets.find(a => a.id === id);
  }

  async getAssetByAssetId(asset_id: string): Promise<Asset | undefined> { // Changed from assetId
    return this.assets.find(a => a.asset_id === asset_id);
  }

  async getAssets(limit = 50, offset = 0, filters: any = {}): Promise<{ assets: Asset[]; total: number }> {
    let filteredAssets = this.assets;
    
    if (filters.status) {
      filteredAssets = filteredAssets.filter(a => a.status === filters.status);
    }
    if (filters.category) {
      filteredAssets = filteredAssets.filter(a => a.category === filters.category);
    }
    if (filters.search) {
      const search = filters.search.toLowerCase();
      filteredAssets = filteredAssets.filter(a => 
        a.asset_name.toLowerCase().includes(search) || // Changed from name
        a.asset_id.toLowerCase().includes(search) ||
        a.description?.toLowerCase().includes(search)
      );
    }

    return {
      assets: filteredAssets.slice(offset, offset + limit),
      total: filteredAssets.length
    };
  }

  async createAsset(insertAsset: InsertAsset): Promise<Asset> {
    const asset: Asset = {
      id: this.next_id++,
      asset_id: `JSC-${String(this.next_id - 1).padStart(4, '0')}`, // Changed from assetId
      ...insertAsset,
      created_at: new Date(),
      updated_at: new Date(),
      asset_name: "",
      description: null,
      category: "computers",
      serial_number: null,
      model: null,
      manufacturer: null,
      purchase_date: null,
      purchase_cost: null,
      warranty_expiry: null,
      current_location: "",
      assigned_department: "",
      assigned_user_id: null,
      status: "active",
      condition: "",
      notes: null
    };
    this.assets.push(asset);
    return asset;
  }

  // Transfer methods - Updated field names
  async createTransfer(insertTransfer: AssetTransfer): Promise<AssetTransfer> {
    const transfer: AssetTransfer = {
      id: this.next_id++,
      ...insertTransfer,
      created_at: new Date(),
      updated_at: new Date()
    };
    this.transfers.push(transfer);
    return transfer;
  }

  // Maintenance methods - Updated field names
  async getOverdueMaintenances(): Promise<MaintenanceSchedule[]> {
    const now = new Date();
    return this.maintenances.filter(m => 
      m.scheduled_date < now && m.status === 'scheduled' // Changed from scheduledDate
    );
  }

  // Audit log methods - Updated field names
  async createAuditLog(insertLog: AssetAuditLog): Promise<AssetAuditLog> {
    const log: AssetAuditLog = {
      id: this.next_id++,
      ...insertLog,
      timestamp: new Date() // Changed from created_at
    };
    this.audit_logs.push(log); // Changed from auditLogs
    return log;
  }

  async getAuditLogs(asset_id?: number, limit = 50, offset = 0): Promise<{ logs: AssetAuditLog[]; total: number }> { // Changed from assetId
    let filteredLogs = this.audit_logs; // Changed from auditLogs
    if (asset_id) {
      filteredLogs = filteredLogs.filter(l => l.asset_id === asset_id);
    }

    return {
      logs: filteredLogs.slice(offset, offset + limit),
      total: filteredLogs.length
    };
  }

  // Dashboard methods - Updated field names
  async getDashboardStats(): Promise<{
    total_assets: number; // Changed from totalAssets
    active_assets: number; // Changed from activeAssets
    maintenance_assets: number; // Changed from maintenanceAssets
    retired_assets: number; // Changed from retiredAssets
    pending_transfers: number; // Changed from pendingTransfers
    overdue_maintenances: number; // Changed from overdueMaintenances
  }> {
    return {
      total_assets: this.assets.length,
      active_assets: this.assets.filter(a => a.status === 'active').length,
      maintenance_assets: this.assets.filter(a => a.status === 'maintenance').length,
      retired_assets: this.assets.filter(a => a.status === 'retired').length,
      pending_transfers: this.transfers.filter(t => t.status === 'pending').length,
      overdue_maintenances: (await this.getOverdueMaintenances()).length
    };
  }

  async getAssetsByCategory(): Promise<{ category: string; count: number }[]> {
    const categories = ['computers', 'printers', 'furniture', 'legal_materials', 'other'];
    return categories.map(category => ({
      category,
      count: this.assets.filter(a => a.category === category).length
    }));
  }

  async getRecentActivity(limit = 10): Promise<Array<{
    id: number;
    action: string;
    timestamp: string;
    asset_name: string; // Changed from assetName
    asset_id: string; // Changed from assetId
    user_name: string; // Changed from userName
  }>> {
    return this.audit_logs // Changed from auditLogs
      .sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime()) // Changed from created_at
      .slice(0, limit)
      .map(log => ({
        id: log.id,
        action: log.action,
        timestamp: log.timestamp.toISOString(), // Changed from created_at
        asset_name: this.assets.find(a => a.id === log.asset_id)?.asset_name || 'Unknown Asset', // Changed from name
        asset_id: this.assets.find(a => a.id === log.asset_id)?.asset_id || 'N/A',
        user_name: this.users.find(u => u.id === log.performed_by_id)?.full_name || 'Unknown User' // Changed from userId
      }));
  }
}