import {
  Dialog,
  DialogTrigger,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectTrigger,
  SelectContent,
  SelectItem,
  SelectValue,
} from "@/components/ui/select";
import { Pencil } from "lucide-react";
import { useState } from "react";
import { useQueryClient } from "@tanstack/react-query";

// Props type
type EditUserDialogProps = {
  user: {
    id: number;
    full_name: string;
    email: string;
    username?: string;
    department?: string;
    role?: string;
    status?: string;
  };
};

export function EditUserDialog({ user }: EditUserDialogProps) {
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState({ ...user });
  const [loading, setLoading] = useState(false);
  const queryClient = useQueryClient();

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async () => {
    setLoading(true);
    try {
      const response = await fetch(`/api/users/${user.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          full_name: form.full_name,
          email: form.email,
          username: form.username,
          department: form.department,
          role: form.role,
          status: form.status
        })
      });

      if (!response.ok) {
        throw new Error(await response.text());
      }

      queryClient.invalidateQueries({ queryKey: ["users"] });
      setOpen(false);
    } catch (error) {
      alert("Update failed: " + (error instanceof Error ? error.message : 'Unknown error'));
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button size="sm" variant="outline">
          <Pencil className="h-4 w-4" />
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Edit User</DialogTitle>
        </DialogHeader>
        <div className="space-y-4 py-2">
          <div>
            <Label>Full Name</Label>
            <Input
              name="full_name"
              value={form.full_name}
              onChange={handleChange}
            />
          </div>
          <div>
            <Label>Email</Label>
            <Input
              name="email"
              value={form.email}
              onChange={handleChange}
            />
          </div>
          <div>
            <Label>Username</Label>
            <Input
              name="username"
              value={form.username}
              onChange={handleChange}
            />
          </div>
          <div>
            <Label>Department</Label>
            <Input
              name="department"
              value={form.department}
              onChange={handleChange}
            />
          </div>
          <div>
            <Label>Role</Label>
            <Select
              value={form.role ?? "staff"}
              onValueChange={(value) =>
                setForm((prev) => ({ ...prev, role: value }))
              }
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="admin">Admin</SelectItem>
                <SelectItem value="asset_manager">Asset Manager</SelectItem>
                <SelectItem value="department_head">Department Head</SelectItem>
                <SelectItem value="staff">Staff</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div>
            <Label>Status</Label>
            <Select
              value={form.status ?? "active"}
              onValueChange={(value) =>
                setForm((prev) => ({ ...prev, status: value }))
              }
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="active">Active</SelectItem>
                <SelectItem value="inactive">Inactive</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
        <DialogFooter>
          <Button onClick={handleSubmit} disabled={loading}>
            {loading ? "Saving..." : "Update"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

export default EditUserDialog;