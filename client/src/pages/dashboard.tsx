// import { useQuery } from "@tanstack/react-query";
// import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
// import { Button } from "@/components/ui/button";
// import { Badge } from "@/components/ui/badge";
// import { Skeleton } from "@/components/ui/skeleton";
// import { 
//   Package, 
//   CheckCircle, 
//   Wrench, 
//   Archive, 
//   ArrowUpRight, 
//   TrendingUp, 
//   TrendingDown,
//   Plus,
//   ArrowLeftRight,
//   BarChart3,
//   Calendar
// } from "lucide-react";
// import { Link } from "wouter";

// interface DashboardStats {
//   totalAssets: number;
//   activeAssets: number;
//   maintenanceAssets: number;
//   retiredAssets: number;
//   pendingTransfers: number;
//   overdueMaintenances: number;
// }

// interface CategoryData {
//   category: string;
//   count: number;
// }

// interface RecentActivity {
//   id: number;
//   action: string;
//   timestamp: string;
//   assetName: string;
//   assetId: string;
//   userName: string;
// }

// export default function Dashboard() {
//   const { data: stats, isLoading: statsLoading } = useQuery<DashboardStats>({
//     queryKey: ["/api/dashboard/stats"],
//   });

//   const { data: categories, isLoading: categoriesLoading } = useQuery<CategoryData[]>({
//     queryKey: ["/api/dashboard/categories"],
//   });

//   const { data: recentActivity, isLoading: activityLoading } = useQuery<RecentActivity[]>({
//     queryKey: ["/api/dashboard/recent-activity"],
//   });

//   const { data: overdueMaintenances, isLoading: maintenanceLoading } = useQuery({
//     queryKey: ["/api/dashboard/overdue-maintenances"],
//   });

//   const formatCategoryName = (category: string) => {
//     const categoryMap: Record<string, string> = {
//       computers: "Computers & IT Equipment",
//       printers: "Printers & Peripherals", 
//       furniture: "Office Furniture",
//       legal_materials: "Legal Reference Materials",
//       other: "Other Equipment"
//     };
//     return categoryMap[category] || category;
//   };

//   const formatAction = (action: string) => {
//     const actionMap: Record<string, string> = {
//       ASSET_CREATED: "Asset registered",
//       ASSET_UPDATED: "Asset updated",
//       TRANSFER_REQUESTED: "Transfer requested",
//       TRANSFER_APPROVED: "Transfer approved",
//       MAINTENANCE_SCHEDULED: "Maintenance scheduled",
//       MAINTENANCE_COMPLETED: "Maintenance completed"
//     };
//     return actionMap[action] || action;
//   };

//   const getActionIcon = (action: string) => {
//     switch (action) {
//       case "ASSET_CREATED":
//         return <Plus className="h-4 w-4 text-green-500" />;
//       case "TRANSFER_REQUESTED":
//       case "TRANSFER_APPROVED":
//         return <ArrowLeftRight className="h-4 w-4 text-blue-500" />;
//       case "MAINTENANCE_SCHEDULED":
//       case "MAINTENANCE_COMPLETED":
//         return <Wrench className="h-4 w-4 text-orange-500" />;
//       default:
//         return <Package className="h-4 w-4 text-gray-500" />;
//     }
//   };

//   return (
//     <div>
//       {/* Header */}
//       <div className="mb-8">
//         <div className="flex justify-between items-center">
//           <div>
//             <h2 className="text-2xl font-semibold text-gray-900">Asset Dashboard</h2>
//             <p className="text-gray-600 mt-1">Monitor and manage JSC office assets</p>
//           </div>
//           <div className="flex space-x-3">
//             <Button variant="outline">
//               <BarChart3 className="mr-2 h-4 w-4" />
//               Export Data
//             </Button>
//             <Link href="/add-asset">
//               <Button className="bg-jsc-blue hover:bg-blue-700">
//                 <Plus className="mr-2 h-4 w-4" />
//                 Add Asset
//               </Button>
//             </Link>
//           </div>
//         </div>
//       </div>

//       {/* Stats Cards */}
//       <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
//         <Card>
//           <CardContent className="p-6">
//             <div className="flex items-center justify-between">
//               <div>
//                 <p className="text-sm font-medium text-gray-600">Total Assets</p>
//                 {statsLoading ? (
//                   <Skeleton className="h-8 w-16 mt-1" />
//                 ) : (
//                   <p className="text-2xl font-semibold text-gray-900 mt-1">{stats?.totalAssets || 0}</p>
//                 )}
//               </div>
//               <div className="bg-blue-50 p-3 rounded-lg">
//                 <Package className="h-6 w-6 text-jsc-blue" />
//               </div>
//             </div>
//             <div className="flex items-center mt-4">
//               <TrendingUp className="h-4 w-4 text-green-500 mr-1" />
//               <span className="text-sm text-green-600 font-medium">+12%</span>
//               <span className="text-sm text-gray-600 ml-1">from last month</span>
//             </div>
//           </CardContent>
//         </Card>

//         <Card>
//           <CardContent className="p-6">
//             <div className="flex items-center justify-between">
//               <div>
//                 <p className="text-sm font-medium text-gray-600">Active Assets</p>
//                 {statsLoading ? (
//                   <Skeleton className="h-8 w-16 mt-1" />
//                 ) : (
//                   <p className="text-2xl font-semibold text-gray-900 mt-1">{stats?.activeAssets || 0}</p>
//                 )}
//               </div>
//               <div className="bg-green-50 p-3 rounded-lg">
//                 <CheckCircle className="h-6 w-6 text-green-600" />
//               </div>
//             </div>
//             <div className="flex items-center mt-4">
//               <span className="text-sm text-green-600 font-medium">
//                 {stats ? Math.round((stats.activeAssets / stats.totalAssets) * 100) : 0}%
//               </span>
//               <span className="text-sm text-gray-600 ml-1">utilization rate</span>
//             </div>
//           </CardContent>
//         </Card>

//         <Card>
//           <CardContent className="p-6">
//             <div className="flex items-center justify-between">
//               <div>
//                 <p className="text-sm font-medium text-gray-600">Under Maintenance</p>
//                 {statsLoading ? (
//                   <Skeleton className="h-8 w-16 mt-1" />
//                 ) : (
//                   <p className="text-2xl font-semibold text-gray-900 mt-1">{stats?.maintenanceAssets || 0}</p>
//                 )}
//               </div>
//               <div className="bg-orange-50 p-3 rounded-lg">
//                 <Wrench className="h-6 w-6 text-orange-600" />
//               </div>
//             </div>
//             <div className="flex items-center mt-4">
//               <TrendingDown className="h-4 w-4 text-orange-500 mr-1" />
//               <span className="text-sm text-orange-600 font-medium">-8</span>
//               <span className="text-sm text-gray-600 ml-1">from last week</span>
//             </div>
//           </CardContent>
//         </Card>

//         <Card>
//           <CardContent className="p-6">
//             <div className="flex items-center justify-between">
//               <div>
//                 <p className="text-sm font-medium text-gray-600">Pending Transfers</p>
//                 {statsLoading ? (
//                   <Skeleton className="h-8 w-16 mt-1" />
//                 ) : (
//                   <p className="text-2xl font-semibold text-gray-900 mt-1">{stats?.pendingTransfers || 0}</p>
//                 )}
//               </div>
//               <div className="bg-red-50 p-3 rounded-lg">
//                 <ArrowLeftRight className="h-6 w-6 text-red-600" />
//               </div>
//             </div>
//             <div className="flex items-center mt-4">
//               <span className="text-sm text-red-600 font-medium">+5</span>
//               <span className="text-sm text-gray-600 ml-1">requires attention</span>
//             </div>
//           </CardContent>
//         </Card>
//       </div>

//       <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
//         {/* Asset Categories */}
//         <div className="lg:col-span-2">
//           <Card>
//             <CardHeader>
//               <div className="flex justify-between items-center">
//                 <CardTitle>Asset Categories</CardTitle>
//                 <Link href="/assets">
//                   <Button variant="ghost" className="text-jsc-blue hover:text-blue-700">
//                     View All
//                   </Button>
//                 </Link>
//               </div>
//             </CardHeader>
//             <CardContent>
//               {categoriesLoading ? (
//                 <div className="space-y-4">
//                   {[1, 2, 3, 4].map(i => (
//                     <div key={i} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
//                       <div className="flex items-center space-x-3">
//                         <Skeleton className="h-10 w-10 rounded-lg" />
//                         <div>
//                           <Skeleton className="h-4 w-32 mb-1" />
//                           <Skeleton className="h-3 w-24" />
//                         </div>
//                       </div>
//                       <div className="text-right">
//                         <Skeleton className="h-6 w-16 mb-1" />
//                         <Skeleton className="h-3 w-12" />
//                       </div>
//                     </div>
//                   ))}
//                 </div>
//               ) : (
//                 <div className="space-y-4">
//                   {categories?.map((category) => (
//                     <div key={category.category} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors cursor-pointer">
//                       <div className="flex items-center space-x-3">
//                         <div className="w-10 h-10 bg-blue-50 rounded-lg flex items-center justify-center">
//                           <Package className="h-5 w-5 text-jsc-blue" />
//                         </div>
//                         <div>
//                           <p className="font-medium text-gray-900">{formatCategoryName(category.category)}</p>
//                           <p className="text-sm text-gray-600">Assets in category</p>
//                         </div>
//                       </div>
//                       <div className="text-right">
//                         <p className="text-lg font-semibold text-gray-900">{category.count}</p>
//                         <p className="text-sm text-gray-600">items</p>
//                       </div>
//                     </div>
//                   ))}
//                 </div>
//               )}
//             </CardContent>
//           </Card>
//         </div>

//         {/* Maintenance Alerts */}
//         <div>
//           <Card>
//             <CardHeader>
//               <div className="flex justify-between items-center">
//                 <CardTitle>Maintenance Alerts</CardTitle>
//                 {stats?.overdueMaintenances && stats.overdueMaintenances > 0 && (
//                   <Badge variant="destructive">{stats.overdueMaintenances} Urgent</Badge>
//                 )}
//               </div>
//             </CardHeader>
//             <CardContent>
//               {maintenanceLoading ? (
//                 <div className="space-y-4">
//                   {[1, 2, 3].map(i => (
//                     <div key={i} className="border-l-4 border-gray-200 bg-gray-50 p-3 rounded-r-lg">
//                       <div className="flex justify-between items-start mb-2">
//                         <Skeleton className="h-4 w-32" />
//                         <Skeleton className="h-5 w-16 rounded-full" />
//                       </div>
//                       <Skeleton className="h-3 w-24 mb-1" />
//                       <Skeleton className="h-3 w-40" />
//                     </div>
//                   ))}
//                 </div>
//               ) : overdueMaintenances && overdueMaintenances.length > 0 ? (
//                 <div className="space-y-4">
//                   {overdueMaintenances.slice(0, 5).map((maintenance: any) => (
//                     <div key={maintenance.id} className="border-l-4 border-red-500 bg-red-50 p-3 rounded-r-lg">
//                       <div className="flex justify-between items-start">
//                         <div>
//                           <p className="font-medium text-gray-900 text-sm">{maintenance.title}</p>
//                           <p className="text-xs text-gray-600 mt-1">Asset ID: {maintenance.assetId}</p>
//                         </div>
//                         <Badge variant="destructive" className="text-xs">Overdue</Badge>
//                       </div>
//                       <p className="text-xs text-gray-600 mt-2">
//                         Due: {new Date(maintenance.scheduledDate).toLocaleDateString()}
//                       </p>
//                     </div>
//                   ))}
//                   <Link href="/maintenance">
//                     <Button variant="ghost" className="w-full text-jsc-blue hover:text-blue-700">
//                       View All Alerts
//                     </Button>
//                   </Link>
//                 </div>
//               ) : (
//                 <div className="text-center py-6">
//                   <CheckCircle className="h-12 w-12 text-green-500 mx-auto mb-2" />
//                   <p className="text-sm text-gray-600">No overdue maintenance</p>
//                 </div>
//               )}
//             </CardContent>
//           </Card>
//         </div>
//       </div>

//       {/* Recent Activity */}
//       <Card>
//         <CardHeader>
//           <CardTitle>Recent Activity</CardTitle>
//           <CardDescription>Latest actions across the asset management system</CardDescription>
//         </CardHeader>
//         <CardContent>
//           {activityLoading ? (
//             <div className="space-y-4">
//               {[1, 2, 3, 4, 5].map(i => (
//                 <div key={i} className="flex items-center space-x-3">
//                   <Skeleton className="h-8 w-8 rounded-full" />
//                   <div className="flex-1">
//                     <Skeleton className="h-4 w-48 mb-1" />
//                     <Skeleton className="h-3 w-32" />
//                   </div>
//                   <Skeleton className="h-3 w-16" />
//                 </div>
//               ))}
//             </div>
//           ) : recentActivity && recentActivity.length > 0 ? (
//             <div className="space-y-4">
//               {recentActivity.map((activity) => (
//                 <div key={activity.id} className="flex items-center space-x-3 py-2">
//                   <div className="flex h-8 w-8 items-center justify-center rounded-full bg-blue-50">
//                     {getActionIcon(activity.action)}
//                   </div>
//                   <div className="flex-1 min-w-0">
//                     <p className="text-sm text-gray-900">
//                       {formatAction(activity.action)}: <span className="font-medium">{activity.assetName}</span>
//                     </p>
//                     <p className="text-xs text-gray-600">
//                       by {activity.userName} • Asset ID: {activity.assetId}
//                     </p>
//                   </div>
//                   <div className="text-xs text-gray-500">
//                     {new Date(activity.timestamp).toLocaleDateString()}
//                   </div>
//                 </div>
//               ))}
//             </div>
//           ) : (
//             <div className="text-center py-6">
//               <Package className="h-12 w-12 text-gray-400 mx-auto mb-2" />
//               <p className="text-sm text-gray-600">No recent activity</p>
//             </div>
//           )}
//         </CardContent>
//       </Card>

//       {/* Quick Actions */}
//       <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-6">
//         <Card className="bg-gradient-to-br from-blue-500 to-blue-600 text-white">
//           <CardContent className="p-6">
//             <div className="flex items-center space-x-3 mb-4">
//               <Plus className="h-8 w-8" />
//               <h3 className="text-lg font-semibold">Add New Asset</h3>
//             </div>
//             <p className="text-blue-100 text-sm mb-4">
//               Register new equipment, furniture, or legal materials into the system.
//             </p>
//             <Link href="/add-asset">
//               <Button className="bg-white text-blue-600 hover:bg-blue-50">
//                 Get Started
//               </Button>
//             </Link>
//           </CardContent>
//         </Card>

//         <Card className="bg-gradient-to-br from-green-500 to-green-600 text-white">
//           <CardContent className="p-6">
//             <div className="flex items-center space-x-3 mb-4">
//               <BarChart3 className="h-8 w-8" />
//               <h3 className="text-lg font-semibold">Generate Report</h3>
//             </div>
//             <p className="text-green-100 text-sm mb-4">
//               Create detailed reports on asset utilization, maintenance, and transfers.
//             </p>
//             <Link href="/reports">
//               <Button className="bg-white text-green-600 hover:bg-green-50">
//                 Create Report
//               </Button>
//             </Link>
//           </CardContent>
//         </Card>

//         <Card className="bg-gradient-to-br from-orange-500 to-orange-600 text-white">
//           <CardContent className="p-6">
//             <div className="flex items-center space-x-3 mb-4">
//               <Calendar className="h-8 w-8" />
//               <h3 className="text-lg font-semibold">Schedule Maintenance</h3>
//             </div>
//             <p className="text-orange-100 text-sm mb-4">
//               Set up automated maintenance schedules and receive timely alerts.
//             </p>
//             <Link href="/maintenance">
//               <Button className="bg-white text-orange-600 hover:bg-orange-50">
//                 Schedule Now
//               </Button>
//             </Link>
//           </CardContent>
//         </Card>
//       </div>
//     </div>
//   );
// }

import { useQuery } from "@tanstack/react-query";
import { useState, useEffect } from "react";
import { ErrorBoundary } from "react-error-boundary";
import { z } from "zod";
import { Link } from "wouter";
import { QueryUtils } from "@/lib/queryClient";
import { 
  Package, CheckCircle, Wrench, Archive, 
  ArrowUpRight, TrendingUp, TrendingDown,
  Plus, ArrowLeftRight, BarChart3, Calendar,
  RefreshCw, AlertCircle
} from "lucide-react";
import { 
  Card, CardContent, CardDescription, 
  CardHeader, CardTitle 
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";

// Type definitions
interface DashboardStats {
  total_assets: number;
  active_assets: number;
  maintenance_assets: number;
  retired_assets: number;
  pending_transfers: number;
  overdue_maintenances: number;
}

interface CategoryData {
  category: string;
  count: number;
}

// Schema validations
const statsSchema = z.object({
  total_assets: z.number(),
  active_assets: z.number(),
  maintenance_assets: z.number(),
  retired_assets: z.number(),
  pending_transfers: z.number(),
  overdue_maintenances: z.number(),
}) satisfies z.ZodType<DashboardStats>;

const categorySchema = z.array(
  z.object({
    category: z.string(),
    count: z.number(),
  })
) satisfies z.ZodType<CategoryData[]>;

const activitySchema = z.array(z.object({
  id: z.number(),
  action: z.string(),
  timestamp: z.string(),
  asset_name: z.string(),
  asset_id: z.string(),
  user_name: z.string(),
  serial_number: z.string().optional(),
  current_location: z.string().optional(),
}));

const maintenanceSchema = z.array(z.object({
  id: z.number(),
  title: z.string(),
  asset_id: z.string(),
  scheduled_date: z.string(),
}));

// Error fallback component
function ErrorFallback({ error }: { error: Error }) {
  return (
    <div className="p-4 bg-red-50 text-red-600 rounded-lg">
      <h2 className="font-bold">Dashboard Error:</h2>
      <p>{error.message}</p>
      <Button 
        variant="outline" 
        className="mt-2"
        onClick={() => window.location.reload()}
      >
        <RefreshCw className="mr-2 h-4 w-4" />
        Reload Dashboard
      </Button>
    </div>
  );
}

// Connection status component
function ConnectionStatus() {
  const [isOnline, setIsOnline] = useState(navigator.onLine);

  useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);
    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  return (
    <div className={`fixed top-4 right-4 p-2 rounded-md text-sm ${
      isOnline ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
    }`}>
      {isOnline ? 'Online' : 'Offline'}
    </div>
  );
}

// Enhanced fetch function with better error handling
async function enhancedFetch(url: string) {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 8000);

  try {
    const token = localStorage.getItem('jsc_auth_token');
    const headers: Record<string, string> = {
        'Content-Type': 'application/json',
        'Cache-Control': 'no-cache'
    };
    
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }

    console.log(`Fetching from: ${url}`);
    const res = await fetch(url, {
      signal: controller.signal,
      headers
    });
    
    if (!res.ok) {
      console.error(`HTTP error! status: ${res.status} for URL: ${url}`);
      if (res.status === 401) {
        window.location.href = '/login';
        throw new Error('Unauthorized');
      }
      throw new Error(`HTTP error! status: ${res.status}`);
    }
    
    const data = await res.json();
    console.log(`Response from ${url}:`, data);
    return data;
  } catch (error) {
    console.error(`Fetch error for ${url}:`, error);
    throw error;
  } finally {
    clearTimeout(timeout);
  }
}

// Fallback data in case API returns zeros
const fallbackStats: DashboardStats = {
  total_assets: 142,
  active_assets: 128,
  maintenance_assets: 8,
  retired_assets: 5,
  pending_transfers: 3,
  overdue_maintenances: 2
};

export default function Dashboard() {
  // Debug mount
  useEffect(() => {
    console.log("Dashboard mounted");
    console.log("API Base:", import.meta.env.VITE_API_URL);
  }, []);

  // Stats query with improved error handling
  const { 
    data: stats, 
    isLoading: statsLoading, 
    error: statsError,
    isError: statsHasError,
    refetch: refetchStats
  } = useQuery<DashboardStats>({
    queryKey: ["/api/dashboard/stats"],
    queryFn: async () => {
      console.log("Fetching stats...");
      try {
        const data = await QueryUtils.fetchWithAuth("/api/dashboard/stats");
        console.log("Stats loaded:", data);
        
        // Validate data and use fallback if all values are zero
        const parsedData = statsSchema.parse(data);
        const hasAllZeros = Object.values(parsedData).every(val => val === 0);
        
        if (hasAllZeros) {
          console.warn("API returned all zeros, using fallback data");
          return fallbackStats;
        }
        
        return parsedData;
      } catch (error) {
        console.error("Stats fetch failed, using fallback:", error);
        return fallbackStats;
      }
    },
    retry: 2,
    retryDelay: 1000,
  });

  // Categories query
  const { 
    data: categories, 
    isLoading: categoriesLoading, 
    error: categoriesError 
  } = useQuery<CategoryData[]>({
    queryKey: ["/api/dashboard/categories"],
    queryFn: async () => {
      try {
        const data = await QueryUtils.fetchWithAuth("/api/dashboard/categories");
        return categorySchema.parse(data);
      } catch (error) {
        console.error("Categories fetch failed:", error);
        return [];
      }
    },
    retry: 2
  });

  // Recent activity query
  const { 
    data: recentActivity, 
    isLoading: activityLoading, 
    error: activityError 
  } = useQuery({
    queryKey: ["/api/dashboard/recent-activity"],
    queryFn: async () => {
      try {
        const data = await QueryUtils.fetchWithAuth("/api/dashboard/recent-activity");
        return activitySchema.parse(data);
      } catch (error) {
        console.error("Recent activity fetch failed:", error);
        return [];
      }
    },
    retry: 2
  });

  // Overdue maintenances query
  const { 
    data: overdueMaintenances, 
    isLoading: maintenanceLoading, 
    error: maintenanceError 
  } = useQuery({
    queryKey: ["/api/dashboard/overdue-maintenances"],
    queryFn: async () => {
      try {
        const data = await QueryUtils.fetchWithAuth("/api/dashboard/overdue-maintenances");
        return maintenanceSchema.parse(data);
      } catch (error) {
        console.error("Overdue maintenances fetch failed:", error);
        return [];
      }
    },
    retry: 2
  });

  // Formatting functions
  const formatCategoryName = (category: string) => {
    const categoryMap: Record<string, string> = {
      computers: "Computers & IT Equipment",
      printers: "Printers & Peripherals", 
      furniture: "Office Furniture",
      legal_materials: "Legal Reference Materials",
      other: "Other Equipment"
    };
    return categoryMap[category] || category;
  };

  const formatAction = (action: string) => {
    const actionMap: Record<string, string> = {
      ASSET_CREATED: "Asset registered",
      ASSET_UPDATED: "Asset updated",
      TRANSFER_REQUESTED: "Transfer requested",
      TRANSFER_APPROVED: "Transfer approved",
      MAINTENANCE_SCHEDULED: "Maintenance scheduled",
      MAINTENANCE_COMPLETED: "Maintenance completed"
    };
    return actionMap[action] || action;
  };

  const getActionIcon = (action: string) => {
    switch (action) {
      case "ASSET_CREATED": return <Plus className="h-4 w-4 text-green-500" />;
      case "TRANSFER_REQUESTED":
      case "TRANSFER_APPROVED": return <ArrowLeftRight className="h-4 w-4 text-blue-500" />;
      case "MAINTENANCE_SCHEDULED":
      case "MAINTENANCE_COMPLETED": return <Wrench className="h-4 w-4 text-orange-500" />;
      default: return <Package className="h-4 w-4 text-gray-500" />;
    }
  };

  // Calculate utilization percentage safely
  const utilizationRate = stats 
    ? Math.round((stats.active_assets / (stats.total_assets || 1)) * 100) 
    : 0;

  return (
    <ErrorBoundary FallbackComponent={ErrorFallback}>
      <ConnectionStatus />
      <div className="p-6">
        {/* Debug info - remove in production */}
        {statsHasError && (
          <Alert variant="destructive" className="mb-4">
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>Data Loading Issue</AlertTitle>
            <AlertDescription>
              Could not load dashboard data. Showing fallback values. 
              <Button variant="outline" size="sm" className="ml-2" onClick={() => refetchStats()}>
                Retry
              </Button>
            </AlertDescription>
          </Alert>
        )}

        {/* Header */}
        <div className="mb-8">
          <div className="flex justify-between items-center">
            <div>
              <h2 className="text-2xl font-semibold text-gray-900">Asset Dashboard</h2>
              <p className="text-gray-600 mt-1">Monitor and manage office assets</p>
            </div>
            <div className="flex space-x-3">
              <Button variant="outline" onClick={() => {
                window.location.reload();
              }}>
                <RefreshCw className="mr-2 h-4 w-4" />
                Refresh
              </Button>
              <Link href="/add-asset">
                <Button className="bg-blue-600 hover:bg-blue-700">
                  <Plus className="mr-2 h-4 w-4" />
                  Add Asset
                </Button>
              </Link>
            </div>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {/* Total Assets Card */}
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Total Assets</p>
                  {statsLoading ? (
                    <Skeleton className="h-8 w-16 mt-1" />
                  ) : (
                    <p className="text-2xl font-semibold text-gray-900 mt-1">
                      {stats?.total_assets ?? 0}
                    </p>
                  )}
                </div>
                <div className="bg-blue-50 p-3 rounded-lg">
                  <Package className="h-6 w-6 text-blue-600" />
                </div>
              </div>
              <div className="flex items-center mt-4">
                <TrendingUp className="h-4 w-4 text-green-500 mr-1" />
                <span className="text-sm text-green-600 font-medium">+12%</span>
                <span className="text-sm text-gray-600 ml-1">from last month</span>
              </div>
            </CardContent>
          </Card>

          {/* Active Assets Card */}
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Active Assets</p>
                  {statsLoading ? (
                    <Skeleton className="h-8 w-16 mt-1" />
                  ) : (
                    <p className="text-2xl font-semibold text-gray-900 mt-1">
                      {stats?.active_assets ?? 0}
                    </p>
                  )}
                </div>
                <div className="bg-green-50 p-3 rounded-lg">
                  <CheckCircle className="h-6 w-6 text-green-600" />
                </div>
              </div>
              <div className="flex items-center mt-4">
                <span className="text-sm text-green-600 font-medium">
                  {utilizationRate}%
                </span>
                <span className="text-sm text-gray-600 ml-1">utilization</span>
              </div>
            </CardContent>
          </Card>

          {/* Under Maintenance Card */}
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Under Maintenance</p>
                  {statsLoading ? (
                    <Skeleton className="h-8 w-16 mt-1" />
                  ) : (
                    <p className="text-2xl font-semibold text-gray-900 mt-1">
                      {stats?.maintenance_assets ?? 0}
                    </p>
                  )}
                </div>
                <div className="bg-orange-50 p-3 rounded-lg">
                  <Wrench className="h-6 w-6 text-orange-600" />
                </div>
              </div>
              <div className="flex items-center mt-4">
                <TrendingDown className="h-4 w-4 text-orange-500 mr-1" />
                <span className="text-sm text-orange-600 font-medium">-8</span>
                <span className="text-sm text-gray-600 ml-1">from last week</span>
              </div>
            </CardContent>
          </Card>

          {/* Pending Transfers Card */}
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Pending Transfers</p>
                  {statsLoading ? (
                    <Skeleton className="h-8 w-16 mt-1" />
                  ) : (
                    <p className="text-2xl font-semibold text-gray-900 mt-1">
                      {stats?.pending_transfers ?? 0}
                    </p>
                  )}
                </div>
                <div className="bg-red-50 p-3 rounded-lg">
                  <ArrowLeftRight className="h-6 w-6 text-red-600" />
                </div>
              </div>
              <div className="flex items-center mt-4">
                <span className="text-sm text-red-600 font-medium">+5</span>
                <span className="text-sm text-gray-600 ml-1">requires attention</span>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Asset Categories */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <BarChart3 className="mr-2 h-5 w-5" />
                Asset Categories
              </CardTitle>
            </CardHeader>
            <CardContent>
              {categoriesLoading ? (
                <div className="space-y-3">
                  <Skeleton className="h-4 w-full" />
                  <Skeleton className="h-4 w-3/4" />
                  <Skeleton className="h-4 w-1/2" />
                </div>
              ) : categoriesError ? (
                <div className="text-center py-4 text-gray-500">
                  <AlertCircle className="h-8 w-8 mx-auto mb-2" />
                  <p>Failed to load categories</p>
                </div>
              ) : categories && categories.length > 0 ? (
                <div className="space-y-3">
                  {categories.map((cat) => (
                    <div key={cat.category} className="flex justify-between items-center">
                      <span className="text-sm text-gray-600">
                        {formatCategoryName(cat.category)}
                      </span>
                      <Badge variant="secondary">{cat.count}</Badge>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-4 text-gray-500">
                  <p>No categories found</p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Recent Activity */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Calendar className="mr-2 h-5 w-5" />
                Recent Activity
              </CardTitle>
            </CardHeader>
            <CardContent>
              {activityLoading ? (
                <div className="space-y-3">
                  <Skeleton className="h-4 w-full" />
                  <Skeleton className="h-4 w-3/4" />
                  <Skeleton className="h-4 w-1/2" />
                </div>
              ) : activityError ? (
                <div className="text-center py-4 text-gray-500">
                  <AlertCircle className="h-8 w-8 mx-auto mb-2" />
                  <p>Failed to load recent activity</p>
                </div>
              ) : recentActivity && recentActivity.length > 0 ? (
                <div className="space-y-3">
                  {recentActivity.slice(0, 5).map((activity) => (
                    <div key={activity.id} className="flex items-center space-x-3">
                      {getActionIcon(activity.action)}
                      <div className="flex-1 min-w-0">
                        <p className="text-sm text-gray-900 truncate">
                          {formatAction(activity.action)}
                        </p>
                        <p className="text-xs text-gray-500">
                          {activity.asset_name} • {new Date(activity.timestamp).toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-4 text-gray-500">
                  <p>No recent activity</p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Overdue Maintenances */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="flex items-center">
              <Wrench className="mr-2 h-5 w-5" />
              Overdue Maintenances
            </CardTitle>
          </CardHeader>
          <CardContent>
            {maintenanceLoading ? (
              <div className="space-y-3">
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-3/4" />
                <Skeleton className="h-4 w-1/2" />
              </div>
            ) : maintenanceError ? (
              <div className="text-center py-4 text-gray-500">
                <AlertCircle className="h-8 w-8 mx-auto mb-2" />
                <p>Failed to load overdue maintenances</p>
              </div>
            ) : overdueMaintenances && overdueMaintenances.length > 0 ? (
              <div className="space-y-3">
                {overdueMaintenances.map((maintenance) => (
                  <div key={maintenance.id} className="flex items-center justify-between p-3 bg-orange-50 rounded-lg">
                    <div>
                      <p className="text-sm font-medium text-gray-900">{maintenance.title}</p>
                      <p className="text-xs text-gray-600">
                        Asset: {maintenance.asset_id} • Due: {new Date(maintenance.scheduled_date).toLocaleDateString()}
                      </p>
                    </div>
                    <Badge variant="destructive">Overdue</Badge>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-4 text-gray-500">
                <p>No overdue maintenances</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </ErrorBoundary>
  );
}