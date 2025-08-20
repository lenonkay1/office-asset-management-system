import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "./components/ui/toaster";
import { TooltipProvider } from "./components/ui/tooltip";
import { authService } from "./lib/auth";
import Layout from "./components/layout";

import Dashboard from "./pages/dashboard";
import Assets from "./pages/assets";
import AddAsset from "./pages/add-asset";
import Transfers from "./pages/transfers";
import Maintenance from "./pages/maintenance";
import Reports from "./pages/reports";
import Settings from "./pages/settings";
import Users from "./pages/users";
import Login from "./pages/login";
import NotFound from "./pages/not-found";

// ✅ Custom ProtectedRoute
function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const isAuthenticated = authService.isAuthenticated();
  console.log("ProtectedRoute: isAuthenticated =", isAuthenticated);
  
  if (!isAuthenticated) {
    console.log("ProtectedRoute: Redirecting to login");
    // wouter doesn't have Redirect, so we use window.location
    window.location.href = "/login";
    return null;
  }
  return <Layout>{children}</Layout>;
}

function Router() {
  return (
    <Switch>
      <Route path="/login" component={Login} />

      <Route path="/">
        <ProtectedRoute>
          <Dashboard />
        </ProtectedRoute>
      </Route>

      <Route path="/dashboard">
        <ProtectedRoute>
          <Dashboard />
        </ProtectedRoute>
      </Route>

      <Route path="/assets">
        <ProtectedRoute>
          <Assets />
        </ProtectedRoute>
      </Route>

      <Route path="/add-asset">
        <ProtectedRoute>
          <AddAsset />
        </ProtectedRoute>
      </Route>

      <Route path="/transfers">
        <ProtectedRoute>
          <Transfers />
        </ProtectedRoute>
      </Route>

      <Route path="/maintenance">
        <ProtectedRoute>
          <Maintenance />
        </ProtectedRoute>
      </Route>

      <Route path="/reports">
        <ProtectedRoute>
          <Reports />
        </ProtectedRoute>
      </Route>

      <Route path="/settings">
        <ProtectedRoute>
          <Settings />
        </ProtectedRoute>
      </Route>

      <Route path="/users">
        <ProtectedRoute>
          <Users />
        </ProtectedRoute>
      </Route>

      {/* 404 fallback */}
      <Route>
        <NotFound />
      </Route>
    </Switch>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Router />
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
