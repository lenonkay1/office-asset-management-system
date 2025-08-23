import { useEffect, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";

export default function Settings() {
  const queryClient = useQueryClient();
  const { toast } = useToast();
  // Load settings
  const { data: settings } = useQuery<Record<string, string>>({
    queryKey: ["/api/settings"],
  });

  // Local state for forms
  const [orgName, setOrgName] = useState("");
  const [assetPrefix, setAssetPrefix] = useState("");
  const [fiscalYearStart, setFiscalYearStart] = useState("");

  const [emailNotifications, setEmailNotifications] = useState(true);
  const [maintenanceReminders, setMaintenanceReminders] = useState(true);
  const [transferApprovals, setTransferApprovals] = useState(true);
  const [assetAlerts, setAssetAlerts] = useState(true);

  const [twoFactor, setTwoFactor] = useState(false);
  const [sessionTimeout, setSessionTimeout] = useState(true);
  const [sessionDuration, setSessionDuration] = useState("60");

  const [backupsEnabled, setBackupsEnabled] = useState(true);
  const [retentionYears, setRetentionYears] = useState("7");
  const [backupTime, setBackupTime] = useState("02:00");

  useEffect(() => {
    if (!settings) return;
    setOrgName(settings.org_name ?? "Judicial Service Commission");
    setAssetPrefix(settings.asset_prefix ?? "JSC");
    setFiscalYearStart(settings.fiscal_year_start ?? "2024-07-01");

    setEmailNotifications((settings.notifications_email ?? "true") === "true");
    setMaintenanceReminders((settings.maintenance_reminders ?? "true") === "true");
    setTransferApprovals((settings.transfer_approvals ?? "true") === "true");
    setAssetAlerts((settings.asset_alerts ?? "true") === "true");

    setTwoFactor((settings.two_factor_enabled ?? "false") === "true");
    setSessionTimeout((settings.session_timeout_enabled ?? "true") === "true");
    setSessionDuration(settings.session_duration ?? "60");

    setBackupsEnabled((settings.backups_enabled ?? "true") === "true");
    setRetentionYears(settings.retention_years ?? "7");
    setBackupTime(settings.backup_time ?? "02:00");
  }, [settings]);

  const saveSystemMutation = useMutation({
    mutationFn: async () => {
      const res = await fetch("/api/settings", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("jsc_auth_token")}`,
        },
        body: JSON.stringify({
          org_name: orgName,
          asset_prefix: assetPrefix,
          fiscal_year_start: fiscalYearStart,
        }),
      });
      if (!res.ok) throw new Error("Failed to save system settings");
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/settings"] });
      toast({ title: "Saved", description: "System settings updated." });
    },
    onError: (error: Error) => {
      toast({ title: "Error", description: error.message || "Failed to save system settings", variant: "destructive" });
    }
  });

  const saveNotificationsMutation = useMutation({
    mutationFn: async () => {
      const res = await fetch("/api/settings", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("jsc_auth_token")}`,
        },
        body: JSON.stringify({
          notifications_email: String(emailNotifications),
          maintenance_reminders: String(maintenanceReminders),
          transfer_approvals: String(transferApprovals),
          asset_alerts: String(assetAlerts),
        }),
      });
      if (!res.ok) throw new Error("Failed to save notifications");
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/settings"] });
      toast({ title: "Saved", description: "Notification settings updated." });
    },
    onError: (error: Error) => {
      toast({ title: "Error", description: error.message || "Failed to save notifications", variant: "destructive" });
    }
  });

  const saveSecurityMutation = useMutation({
    mutationFn: async () => {
      const res = await fetch("/api/settings", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("jsc_auth_token")}`,
        },
        body: JSON.stringify({
          two_factor_enabled: String(twoFactor),
          session_timeout_enabled: String(sessionTimeout),
          session_duration: sessionDuration,
        }),
      });
      if (!res.ok) throw new Error("Failed to save security settings");
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/settings"] });
      toast({ title: "Saved", description: "Security settings updated." });
    },
    onError: (error: Error) => {
      toast({ title: "Error", description: error.message || "Failed to save security settings", variant: "destructive" });
    }
  });

  const saveDataMutation = useMutation({
    mutationFn: async () => {
      const res = await fetch("/api/settings", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("jsc_auth_token")}`,
        },
        body: JSON.stringify({
          backups_enabled: String(backupsEnabled),
          retention_years: retentionYears,
          backup_time: backupTime,
        }),
      });
      if (!res.ok) throw new Error("Failed to save data settings");
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/settings"] });
      toast({ title: "Saved", description: "Data settings updated." });
    },
    onError: (error: Error) => {
      toast({ title: "Error", description: error.message || "Failed to save data settings", variant: "destructive" });
    }
  });

  const handleSaveSystem = () => {
    if (!orgName.trim()) {
      toast({ title: "Validation error", description: "Organization name is required", variant: "destructive" });
      return;
    }
    if (!assetPrefix.trim()) {
      toast({ title: "Validation error", description: "Asset prefix is required", variant: "destructive" });
      return;
    }
    if (!fiscalYearStart) {
      toast({ title: "Validation error", description: "Fiscal year start date is required", variant: "destructive" });
      return;
    }
    saveSystemMutation.mutate();
  };

  const handleSaveNotifications = () => {
    saveNotificationsMutation.mutate();
  };

  const handleSaveSecurity = () => {
    if (!/^\d+$/.test(sessionDuration) || parseInt(sessionDuration, 10) <= 0) {
      toast({ title: "Validation error", description: "Session duration must be a positive number", variant: "destructive" });
      return;
    }
    saveSecurityMutation.mutate();
  };

  const handleSaveData = () => {
    if (!/^\d+$/.test(retentionYears) || parseInt(retentionYears, 10) <= 0) {
      toast({ title: "Validation error", description: "Retention years must be a positive number", variant: "destructive" });
      return;
    }
    if (!backupTime) {
      toast({ title: "Validation error", description: "Backup time is required", variant: "destructive" });
      return;
    }
    saveDataMutation.mutate();
  };

  return (
    <div className="p-4 space-y-8">
      <div>
        <h1 className="text-xl font-semibold">Settings</h1>
        <p className="text-sm text-gray-600">Manage system preferences and configurations</p>
      </div>

      <section className="space-y-3">
        <h2 className="text-lg font-medium">System Settings</h2>
        <div>
          <label htmlFor="org-name" className="block">Organization Name</label>
          <input id="org-name" className="border rounded p-2 w-full" value={orgName} onChange={(e) => setOrgName(e.target.value)} />
        </div>
        <div>
          <label htmlFor="asset-prefix" className="block">Asset ID Prefix</label>
          <input id="asset-prefix" className="border rounded p-2 w-full" value={assetPrefix} onChange={(e) => setAssetPrefix(e.target.value)} />
        </div>
        <div>
          <label htmlFor="fiscal-year" className="block">Fiscal Year Start</label>
          <input id="fiscal-year" type="date" className="border rounded p-2" value={fiscalYearStart} onChange={(e) => setFiscalYearStart(e.target.value)} />
        </div>
        <button type="button" onClick={handleSaveSystem} disabled={saveSystemMutation.isPending} className="border rounded px-3 py-2">
          Save
        </button>
      </section>

      <hr />

      <section className="space-y-3">
        <h2 className="text-lg font-medium">Notifications</h2>
        <label className="flex items-center gap-2">
          <input type="checkbox" checked={emailNotifications} onChange={(e) => setEmailNotifications(e.target.checked)} />
          Email Notifications
        </label>
        <label className="flex items-center gap-2">
          <input type="checkbox" checked={maintenanceReminders} onChange={(e) => setMaintenanceReminders(e.target.checked)} />
          Maintenance Reminders
        </label>
        <label className="flex items-center gap-2">
          <input type="checkbox" checked={transferApprovals} onChange={(e) => setTransferApprovals(e.target.checked)} />
          Transfer Approvals
        </label>
        <label className="flex items-center gap-2">
          <input type="checkbox" checked={assetAlerts} onChange={(e) => setAssetAlerts(e.target.checked)} />
          Asset Alerts
        </label>
        <button type="button" onClick={handleSaveNotifications} disabled={saveNotificationsMutation.isPending} className="border rounded px-3 py-2">
          Save
        </button>
      </section>

      <hr />

      <section className="space-y-3">
        <h2 className="text-lg font-medium">Security</h2>
        <label className="flex items-center gap-2">
          <input type="checkbox" checked={twoFactor} onChange={(e) => setTwoFactor(e.target.checked)} />
          Two-Factor Authentication
        </label>
        <label className="flex items-center gap-2">
          <input type="checkbox" checked={sessionTimeout} onChange={(e) => setSessionTimeout(e.target.checked)} />
          Session Timeout
        </label>
        <div>
          <label htmlFor="session-duration" className="block">Session Duration (minutes)</label>
          <input id="session-duration" type="number" className="border rounded p-2 w-24" value={sessionDuration} onChange={(e) => setSessionDuration(e.target.value)} />
        </div>
        <button type="button" onClick={handleSaveSecurity} disabled={saveSecurityMutation.isPending} className="border rounded px-3 py-2">
          Save
        </button>
      </section>

      <hr />

      <section className="space-y-3">
        <h2 className="text-lg font-medium">Data Management</h2>
        <label className="flex items-center gap-2">
          <input type="checkbox" checked={backupsEnabled} onChange={(e) => setBackupsEnabled(e.target.checked)} />
          Automatic Backups
        </label>
        <div>
          <label htmlFor="retention" className="block">Data Retention (years)</label>
          <input id="retention" type="number" className="border rounded p-2 w-24" value={retentionYears} onChange={(e) => setRetentionYears(e.target.value)} />
        </div>
        <div>
          <label htmlFor="backup-time" className="block">Backup Time</label>
          <input id="backup-time" type="time" className="border rounded p-2" value={backupTime} onChange={(e) => setBackupTime(e.target.value)} />
        </div>
        <button type="button" onClick={handleSaveData} disabled={saveDataMutation.isPending} className="border rounded px-3 py-2">
          Save
        </button>
      </section>
    </div>
  );
}
