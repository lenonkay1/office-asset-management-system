// import { useState } from "react";
// import { useQuery } from "@tanstack/react-query";
// import { supabase } from "@/lib/supabaseClient";
// import { CreateUserDialog } from "@/components/CreateUserDialog";
// import {
//   Card,
//   CardContent,
//   CardDescription,
//   CardHeader,
//   CardTitle,
// } from "@/components/ui/card";
// import { Button } from "@/components/ui/button";
// import { Input } from "@/components/ui/input";
// import { Badge } from "@/components/ui/badge";
// import {
//   Table,
//   TableBody,
//   TableCell,
//   TableHead,
//   TableHeader,
//   TableRow,
// } from "@/components/ui/table";
// import {
//   Users as UsersIcon,
//   Plus,
//   Search,
//   Edit,
//   Trash2,
//   Shield,
//   UserCheck,
//   UserX,
// } from "lucide-react";

// // Define the user type
// type User = {
//   id: number;
//   full_name: string;
//   email: string;
//   username?: string;
//   role?: string;
//   department?: string;
//   status?: string;
//   last_login?: string;
// };

// // ✅ Fetch users from Supabase
// const fetchUsers = async (): Promise<User[]> => {
//   const { data, error } = await supabase
//     .from("users")
//     .select("id, full_name, email, username, role, department, status, last_login");

//   if (error) throw new Error(error.message);

//   return (
//     data?.map((user) => ({
//       ...user,
//       username: user.username ?? user.email?.split("@")[0],
//       role: user.role ?? "staff",
//       status: user.status ?? "active",
//       last_login: user.last_login ?? "N/A",
//     })) ?? []
//   );
// };

// export default function Users() {
//   const [searchQuery, setSearchQuery] = useState("");

//   const {
//     data: users = [],
//     isLoading,
//     isError,
//     error,
//   } = useQuery({ queryKey: ["users"], queryFn: fetchUsers });

//   const getRoleBadge = (role: string) => {
//     const roleMap = {
//       admin: { label: "Admin", className: "bg-red-100 text-red-700" },
//       asset_manager: { label: "Asset Manager", className: "bg-blue-100 text-blue-700" },
//       department_head: { label: "Dept. Head", className: "bg-purple-100 text-purple-700" },
//       staff: { label: "Staff", className: "bg-green-100 text-green-700" },
//     };
//     const config = roleMap[role as keyof typeof roleMap] || roleMap.staff;
//     return <Badge className={config.className}>{config.label}</Badge>;
//   };

//   const getStatusIcon = (status: string) =>
//     status === "active" ? (
//       <UserCheck className="h-4 w-4 text-green-500" />
//     ) : (
//       <UserX className="h-4 w-4 text-red-500" />
//     );

//   const filteredUsers = users.filter((user) =>
//     `${user.full_name} ${user.email} ${user.username ?? ""}`
//       .toLowerCase()
//       .includes(searchQuery.toLowerCase())
//   );

//   return (
//     <div className="space-y-6">
//       <div className="flex items-center justify-between">
//   <div className="flex items-center space-x-3">
//     <UsersIcon className="h-8 w-8 text-jsc-blue" />
//     <div>
//       <h1 className="text-3xl font-bold text-gray-900">User Management</h1>
//       <p className="text-gray-600">Manage system users and their permissions</p>
//     </div>
//   </div>
//   <CreateUserDialog />
//       </div>

//       <Card>
//         <CardHeader>
//           <CardTitle>Search Users</CardTitle>
//           <CardDescription>Find and manage user accounts</CardDescription>
//         </CardHeader>
//         <CardContent>
//           <div className="flex gap-4">
//             <div className="relative flex-1">
//               <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500 h-4 w-4" />
//               <Input
//                 placeholder="Search by name, email, or username..."
//                 value={searchQuery}
//                 onChange={(e) => setSearchQuery(e.target.value)}
//                 className="pl-10"
//               />
//             </div>
//             <Button variant="outline">
//               <Shield className="mr-2 h-4 w-4" />
//               Role Filter
//             </Button>
//           </div>
//         </CardContent>
//       </Card>

//       <Card>
//         <CardHeader>
//           <CardTitle>System Users</CardTitle>
//           <CardDescription>
//             {isLoading
//               ? "Loading users..."
//               : isError
//               ? "Failed to load users"
//               : `${filteredUsers.length} users found`}
//           </CardDescription>
//         </CardHeader>
//         <CardContent>
//           {error ? (
//             <div className="text-red-600">Error: {error.message}</div>
//           ) : (
//             <Table>
//               <TableHeader>
//                 <TableRow>
//                   <TableHead>User</TableHead>
//                   <TableHead>Role</TableHead>
//                   <TableHead>Department</TableHead>
//                   <TableHead>Status</TableHead>
//                   <TableHead>Last Login</TableHead>
//                   <TableHead className="text-right">Actions</TableHead>
//                 </TableRow>
//               </TableHeader>
//               <TableBody>
//                 {filteredUsers.map((user) => (
//                   <TableRow key={user.id}>
//                     <TableCell>
//                       <div className="space-y-1">
//                         <div className="font-medium">{user.full_name}</div>
//                         <div className="text-sm text-gray-500">{user.email}</div>
//                         <div className="text-xs text-gray-400">@{user.username}</div>
//                       </div>
//                     </TableCell>
//                     <TableCell>{getRoleBadge(user.role ?? "staff")}</TableCell>
//                     <TableCell>{user.department ?? "-"}</TableCell>
//                     <TableCell>
//                       <div className="flex items-center space-x-2">
//                         {getStatusIcon(user.status ?? "inactive")}
//                         <span className="capitalize">{user.status ?? "inactive"}</span>
//                       </div>
//                     </TableCell>
//                     <TableCell>
//                       <div className="text-sm">{user.last_login}</div>
//                     </TableCell>
//                     <TableCell className="text-right">
//                       <div className="flex justify-end space-x-2">
//                         <Button size="sm" variant="outline">
//                           <Edit className="h-4 w-4" />
//                         </Button>
//                         <Button size="sm" variant="destructive">
//                           <Trash2 className="h-4 w-4" />
//                         </Button>
//                       </div>
//                     </TableCell>
//                   </TableRow>
//                 ))}
//               </TableBody>
//             </Table>
//           )}
//         </CardContent>
//       </Card>
//     </div>
//   );
// }
import { useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Users as UsersIcon,
  Search,
  Shield,
  UserCheck,
  UserX,
} from "lucide-react";
import {CreateUserDialog} from "@/components/CreateUserDialog";
import EditUserDialog from "@/components/EditUserDialog";

type User = {
  id: number;
  full_name: string;
  email: string;
  username?: string;
  role?: string;
  department?: string;
  status?: string;
  last_login?: string;
};

const fetchUsers = async (): Promise<User[]> => {
  return authService.authFetch<User[]>("/api/users");
  if (!response.ok) {
    throw new Error('Failed to fetch users');
  }
  return await response.json();
};

export default function Users() {
  const [searchQuery, setSearchQuery] = useState("");
  const queryClient = useQueryClient();

  const { data: users = [], isLoading, isError, error } = useQuery<User[]>({
    queryKey: ["users"],
    queryFn: fetchUsers,
    retry: 2
  });

  const getRoleBadge = (role = "staff") => {
    const roleMap = {
      admin: { label: "Admin", className: "bg-red-100 text-red-700" },
      asset_manager: { label: "Asset Manager", className: "bg-blue-100 text-blue-700" },
      department_head: { label: "Dept. Head", className: "bg-purple-100 text-purple-700" },
      staff: { label: "Staff", className: "bg-green-100 text-green-700" },
    };
    const config = roleMap[role as keyof typeof roleMap] || roleMap.staff;
    return <Badge className={config.className}>{config.label}</Badge>;
  };

  const getStatusIcon = (status = "inactive") => 
    status === "active" ? (
      <UserCheck className="h-4 w-4 text-green-500" />
    ) : (
      <UserX className="h-4 w-4 text-red-500" />
    );

  const filteredUsers = users.filter(user =>
    `${user.full_name} ${user.email} ${user.username || ""}`
      .toLowerCase()
      .includes(searchQuery.toLowerCase())
  );

  const handleDeleteUser = async (userId: number) => {
    try {
      const response = await fetch(`/api/users/${userId}`, {
        method: 'DELETE',
      });
      
      if (!response.ok) {
        throw new Error('Failed to delete user');
      }
      
      queryClient.invalidateQueries({ queryKey: ["users"] });
    } catch (err) {
      console.error("Delete error:", err);
    }
  };

  if (isLoading) return <div className="p-4">Loading users...</div>;
  if (isError) return <div className="p-4 text-red-600">Error: {error instanceof Error ? error.message : 'Failed to load users'}</div>;

  return (
    <div className="space-y-6 p-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <UsersIcon className="h-8 w-8 text-blue-600" />
          <div>
            <h1 className="text-2xl font-bold">User Management</h1>
            <p className="text-gray-600">Manage system users and permissions</p>
          </div>
        </div>
        <CreateUserDialog />
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Search Users</CardTitle>
          <CardDescription>Find users by name, email, or username</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
              <Input
                placeholder="Search users..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
            <Button variant="outline">
              <Shield className="mr-2 h-4 w-4" />
              Filter Roles
            </Button>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>User List</CardTitle>
          <CardDescription>
            {filteredUsers.length} {filteredUsers.length === 1 ? 'user' : 'users'} found
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>User</TableHead>
                <TableHead>Role</TableHead>
                <TableHead>Department</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredUsers.map((user) => (
                <TableRow key={user.id}>
                  <TableCell>
                    <div className="font-medium">{user.full_name}</div>
                    <div className="text-sm text-gray-600">{user.email}</div>
                  </TableCell>
                  <TableCell>{getRoleBadge(user.role)}</TableCell>
                  <TableCell>{user.department || '-'}</TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      {getStatusIcon(user.status)}
                      <span className="capitalize">{user.status}</span>
                    </div>
                  </TableCell>
                  <TableCell className="flex gap-2">
                    <EditUserDialog user={user} />
                    <Button
                      variant="destructive"
                      size="sm"
                      onClick={() => handleDeleteUser(user.id)}
                    >
                      Delete
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}