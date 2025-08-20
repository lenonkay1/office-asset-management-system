import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { 
  BarChart3, 
  Download, 
  Calendar, 
  Package, 
  TrendingUp, 
  FileText,
  PieChart,
  Activity
} from "lucide-react";
import { authService } from "@/lib/auth";

interface ReportData {
  title: string;
  description: string;
  type: "asset_utilization" | "maintenance_summary" | "transfer_history" | "department_breakdown" | "cost_analysis";
  icon: React.ReactNode;
  available: boolean;
}

const reportTypes: ReportData[] = [
  {
    title: "Asset Utilization Report",
    description: "Overview of asset usage across departments and locations",
    type: "asset_utilization",
    icon: <Package className="h-6 w-6" />,
    available: true
  },
  {
    title: "Maintenance Summary",
    description: "Detailed maintenance activities, costs, and schedules",
    type: "maintenance_summary",
    icon: <Activity className="h-6 w-6" />,
    available: true
  },
  {
    title: "Transfer History",
    description: "Complete log of asset transfers and movements",
    type: "transfer_history",
    icon: <BarChart3 className="h-6 w-6" />,
    available: true
  },
  {
    title: "Department Breakdown",
    description: "Asset distribution and value analysis by department",
    type: "department_breakdown",
    icon: <PieChart className="h-6 w-6" />,
    available: true
  },
  {
    title: "Cost Analysis",
    description: "Purchase costs, depreciation, and maintenance expenses",
    type: "cost_analysis",
    icon: <TrendingUp className="h-6 w-6" />,
    available: true
  }
];

const dateRanges = [
  { value: "7d", label: "Last 7 days" },
  { value: "30d", label: "Last 30 days" },
  { value: "90d", label: "Last 3 months" },
  { value: "1y", label: "Last year" },
  { value: "all", label: "All time" }
];

const formats = [
  { value: "pdf", label: "PDF" },
  { value: "excel", label: "Excel" },
  { value: "csv", label: "CSV" }
];

export default function Reports() {
  const [selectedReportType, setSelectedReportType] = useState<string>("");
  const [selectedDateRange, setSelectedDateRange] = useState<string>("30d");
  const [selectedFormat, setSelectedFormat] = useState<string>("pdf");
  const [isGenerating, setIsGenerating] = useState(false);
  
  const user = authService.getUser();

  const { data: dashboardStats } = useQuery({
    queryKey: ["/api/dashboard/stats"],
  });

  const { data: categories } = useQuery({
    queryKey: ["/api/dashboard/categories"],
  });

  const { data: recentActivity } = useQuery({
    queryKey: ["/api/dashboard/recent-activity", { limit: 20 }],
  });

  const canAccessReports = () => {
    return user && ["admin", "asset_manager", "department_head"].includes(user.role);
  };

  const handleGenerateReport = async () => {
    if (!selectedReportType) {
      return;
    }

    setIsGenerating(true);
    
    try {
      // In a real implementation, this would call the backend API
      // For now, we'll simulate the report generation
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // Create a mock report download
      const reportName = `${selectedReportType}_${selectedDateRange}_${new Date().toISOString().split('T')[0]}.${selectedFormat}`;
      
      // In a real implementation, you would download the actual file
      const link = document.createElement('a');
      link.href = '#'; // This would be the actual file URL
      link.download = reportName;
      // link.click(); // Uncomment when you have actual file generation
      
      alert(`Report "${reportName}" would be downloaded in a real implementation.`);
      
    } catch (error) {
      console.error("Report generation failed:", error);
    } finally {
      setIsGenerating(false);
    }
  };

  const getReportSummary = () => {
    if (!dashboardStats || !categories) return null;

    return {
      totalAssets: dashboardStats.totalAssets,
      activeAssets: dashboardStats.activeAssets,
      maintenanceAssets: dashboardStats.maintenanceAssets,
      retiredAssets: dashboardStats.retiredAssets,
      categories: categories.length,
      recentActivities: recentActivity?.length || 0
    };
  };

  const summary = getReportSummary();

  if (!canAccessReports()) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <Card className="w-full max-w-md">
          <CardContent className="pt-6 text-center">
            <FileText className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">Access Restricted</h3>
            <p className="text-gray-600">
              You don't have permission to access reports. Contact your administrator for access.
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div>
      {/* Header */}
      <div className="mb-8">
        <div className="flex justify-between items-center">
          <div>
            <h2 className="text-2xl font-semibold text-gray-900">Reports & Analytics</h2>
            <p className="text-gray-600 mt-1">Generate comprehensive reports on asset management activities</p>
          </div>
        </div>
      </div>

      {/* Quick Stats */}
      {summary && (
        <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-6 gap-4 mb-8">
          <Card>
            <CardContent className="p-4 text-center">
              <p className="text-2xl font-bold text-jsc-blue">{summary.totalAssets}</p>
              <p className="text-sm text-gray-600">Total Assets</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4 text-center">
              <p className="text-2xl font-bold text-green-600">{summary.activeAssets}</p>
              <p className="text-sm text-gray-600">Active</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4 text-center">
              <p className="text-2xl font-bold text-orange-600">{summary.maintenanceAssets}</p>
              <p className="text-sm text-gray-600">Maintenance</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4 text-center">
              <p className="text-2xl font-bold text-gray-600">{summary.retiredAssets}</p>
              <p className="text-sm text-gray-600">Retired</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4 text-center">
              <p className="text-2xl font-bold text-purple-600">{summary.categories}</p>
              <p className="text-sm text-gray-600">Categories</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4 text-center">
              <p className="text-2xl font-bold text-blue-600">{summary.recentActivities}</p>
              <p className="text-sm text-gray-600">Recent Activities</p>
            </CardContent>
          </Card>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Report Generation */}
        <div className="lg:col-span-2">
          <Card>
            <CardHeader>
              <CardTitle>Generate Report</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Report Type Selection */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-3">
                  Select Report Type
                </label>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {reportTypes.map((report) => (
                    <div
                      key={report.type}
                      className={`relative p-4 border rounded-lg cursor-pointer transition-colors ${
                        selectedReportType === report.type
                          ? "border-jsc-blue bg-blue-50"
                          : "border-gray-200 hover:border-gray-300"
                      } ${!report.available ? "opacity-50 cursor-not-allowed" : ""}`}
                      onClick={() => report.available && setSelectedReportType(report.type)}
                    >
                      <div className="flex items-start space-x-3">
                        <div className={`p-2 rounded-lg ${
                          selectedReportType === report.type ? "bg-jsc-blue text-white" : "bg-gray-100 text-gray-600"
                        }`}>
                          {report.icon}
                        </div>
                        <div className="flex-1">
                          <h3 className="font-medium text-gray-900">{report.title}</h3>
                          <p className="text-sm text-gray-600 mt-1">{report.description}</p>
                          {!report.available && (
                            <Badge variant="secondary" className="mt-2">Coming Soon</Badge>
                          )}
                        </div>
                      </div>
                      {selectedReportType === report.type && (
                        <div className="absolute top-2 right-2">
                          <div className="w-2 h-2 bg-jsc-blue rounded-full"></div>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>

              {/* Date Range and Format */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Date Range
                  </label>
                  <Select value={selectedDateRange} onValueChange={setSelectedDateRange}>
                    <SelectTrigger>
                      <Calendar className="mr-2 h-4 w-4" />
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {dateRanges.map((range) => (
                        <SelectItem key={range.value} value={range.value}>
                          {range.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Format
                  </label>
                  <Select value={selectedFormat} onValueChange={setSelectedFormat}>
                    <SelectTrigger>
                      <FileText className="mr-2 h-4 w-4" />
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {formats.map((format) => (
                        <SelectItem key={format.value} value={format.value}>
                          {format.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {/* Generate Button */}
              <div className="pt-4 border-t border-gray-200">
                <Button
                  onClick={handleGenerateReport}
                  disabled={!selectedReportType || isGenerating}
                  className="w-full bg-jsc-blue hover:bg-blue-700"
                >
                  {isGenerating ? (
                    <>
                      <div className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-white border-b-transparent"></div>
                      Generating Report...
                    </>
                  ) : (
                    <>
                      <Download className="mr-2 h-4 w-4" />
                      Generate Report
                    </>
                  )}
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Quick Reports */}
        <div>
          <Card>
            <CardHeader>
              <CardTitle>Quick Reports</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <Button
                variant="outline"
                className="w-full justify-start"
                onClick={() => {
                  setSelectedReportType("asset_utilization");
                  setSelectedDateRange("30d");
                  handleGenerateReport();
                }}
              >
                <Package className="mr-2 h-4 w-4" />
                Monthly Asset Summary
              </Button>

              <Button
                variant="outline"
                className="w-full justify-start"
                onClick={() => {
                  setSelectedReportType("maintenance_summary");
                  setSelectedDateRange("90d");
                  handleGenerateReport();
                }}
              >
                <Activity className="mr-2 h-4 w-4" />
                Quarterly Maintenance
              </Button>

              <Button
                variant="outline"
                className="w-full justify-start"
                onClick={() => {
                  setSelectedReportType("transfer_history");
                  setSelectedDateRange("30d");
                  handleGenerateReport();
                }}
              >
                <BarChart3 className="mr-2 h-4 w-4" />
                Recent Transfers
              </Button>

              <Button
                variant="outline"
                className="w-full justify-start"
                onClick={() => {
                  setSelectedReportType("department_breakdown");
                  setSelectedDateRange("all");
                  handleGenerateReport();
                }}
              >
                <PieChart className="mr-2 h-4 w-4" />
                Department Overview
              </Button>
            </CardContent>
          </Card>

          {/* Recent Report Activity */}
          <Card className="mt-6">
            <CardHeader>
              <CardTitle>Recent Reports</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {[
                  {
                    name: "Asset Utilization Report",
                    date: "2024-01-15",
                    format: "PDF",
                    size: "2.4 MB"
                  },
                  {
                    name: "Maintenance Summary",
                    date: "2024-01-12",
                    format: "Excel",
                    size: "1.8 MB"
                  },
                  {
                    name: "Department Breakdown",
                    date: "2024-01-10",
                    format: "CSV",
                    size: "856 KB"
                  }
                ].map((report, index) => (
                  <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <div>
                      <p className="text-sm font-medium text-gray-900">{report.name}</p>
                      <p className="text-xs text-gray-600">{report.date} • {report.format} • {report.size}</p>
                    </div>
                    <Button variant="ghost" size="sm">
                      <Download className="h-4 w-4" />
                    </Button>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
