import { Link, useLocation } from "wouter";
import { cn } from "@/lib/utils";
import { authService } from "@/lib/auth";
import { 
  BarChart3, 
  Package, 
  Plus, 
  ArrowLeftRight, 
  Wrench, 
  FileText, 
  Users, 
  Settings,
  Search,
  Badge
} from "lucide-react";
import { Input } from "@/components/ui/input";

const navigationItems = [
  {
    name: "Dashboard",
    href: "/dashboard",
    icon: BarChart3,
    roles: ["admin", "asset_manager", "department_head", "staff"]
  },
  {
    name: "Assets",
    href: "/assets",
    icon: Package,
    roles: ["admin", "asset_manager", "department_head", "staff"]
  },
  {
    name: "Add Asset",
    href: "/add-asset",
    icon: Plus,
    roles: ["admin", "asset_manager"]
  },
  {
    name: "Transfers",
    href: "/transfers",
    icon: ArrowLeftRight,
    roles: ["admin", "asset_manager", "department_head", "staff"]
  },
  {
    name: "Maintenance",
    href: "/maintenance",
    icon: Wrench,
    roles: ["admin", "asset_manager", "department_head"],
    badge: 3
  },
  {
    name: "Reports",
    href: "/reports",
    icon: FileText,
    roles: ["admin", "asset_manager", "department_head"]
  }
];

const adminItems = [
  {
    name: "User Management",
    href: "/users",
    icon: Users,
    roles: ["admin"]
  },
  {
    name: "Settings",
    href: "/settings",
    icon: Settings,
    roles: ["admin", "asset_manager"]
  }
];

export default function Sidebar() {
  const [location] = useLocation();
  const user = authService.getUser();

  const hasAccess = (requiredRoles: string[]) => {
    return user && requiredRoles.includes(user.role);
  };

  return (
    <aside className="w-64 bg-white shadow-sm min-h-screen border-r border-gray-200">
      <nav className="p-4 space-y-2">
        {/* Search */}
        <div className="mb-6">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500 h-4 w-4" />
            <Input
              type="text"
              placeholder="Search assets..."
              className="pl-10 text-sm"
            />
          </div>
        </div>

        {/* Main Navigation */}
        <div className="space-y-1">
          {navigationItems.map((item) => {
            if (!hasAccess(item.roles)) return null;
            
            const isActive = location === item.href || (item.href === "/dashboard" && location === "/");
            
            return (
              <Link key={item.name} href={item.href}>
                <div
                  className={cn(
                    "flex items-center justify-between px-3 py-2 text-sm font-medium rounded-lg transition-colors cursor-pointer",
                    isActive
                      ? "bg-jsc-blue text-white"
                      : "text-gray-700 hover:bg-gray-100"
                  )}
                >
                  <div className="flex items-center space-x-3">
                    <item.icon className="h-5 w-5" />
                    <span>{item.name}</span>
                  </div>
                  {item.badge && (
                    <span className={cn(
                      "text-xs px-2 py-1 rounded-full",
                      isActive
                        ? "bg-white text-jsc-blue"
                        : "bg-red-100 text-red-600"
                    )}>
                      {item.badge}
                    </span>
                  )}
                </div>
              </Link>
            );
          })}
        </div>

        {/* Admin Section */}
        {adminItems.some(item => hasAccess(item.roles)) && (
          <div className="pt-4 mt-4 border-t border-gray-200">
            <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">
              Administration
            </p>
            <div className="space-y-1">
              {adminItems.map((item) => {
                if (!hasAccess(item.roles)) return null;
                
                const isActive = location === item.href;
                
                return (
                  <Link key={item.name} href={item.href}>
                    <div
                      className={cn(
                        "flex items-center space-x-3 px-3 py-2 text-sm font-medium rounded-lg transition-colors cursor-pointer",
                        isActive
                          ? "bg-jsc-blue text-white"
                          : "text-gray-700 hover:bg-gray-100"
                      )}
                    >
                      <item.icon className="h-5 w-5" />
                      <span>{item.name}</span>
                    </div>
                  </Link>
                );
              })}
            </div>
          </div>
        )}
      </nav>
    </aside>
  );
}
