import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider, useAuth } from "./context/AuthContext";
import Login from "./pages/Login";
import Register from "./pages/Register";
import Dashboard from "./pages/Dashboard";
import Goals from "./pages/Goals";
import Approvals from "./pages/Approvals";
import Checkins from "./pages/Checkins";
import Analytics from "./pages/Analytics";
import AuditLogs from "./pages/AuditLogs";
import Users from "./pages/Users";
import Notifications from "./pages/Notifications";
import SharedGoal from "./pages/SharedGoal";
import TeamPerformance from "./pages/TeamPerformance";
import ExecutiveDashboard from "./pages/ExecutiveDashboard";
import Sidebar from "./components/Sidebar";
import AIChatBot from "./components/AIChatBot";
import DemoTools from "./components/DemoTools";
import { Toaster } from "sonner";

const ProtectedRoute = ({ children, roles }) => {
  const { user, loading } = useAuth();

  if (loading) return <div className="h-screen w-screen flex items-center justify-center">Loading...</div>;
  if (!user) return <Navigate to="/login" />;
  if (roles && !roles.includes(user.role)) return <Navigate to="/" />;

  return (
    <div className="flex h-screen bg-background">
      <Sidebar />
      <main className="flex-1 overflow-y-auto p-8 fade-in">
        {children}
      </main>
    </div>
  );
};

function App() {
  return (
    <AuthProvider>
      <Router>
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          
          <Route path="/" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
          <Route path="/goals" element={<ProtectedRoute><Goals /></ProtectedRoute>} />
          <Route path="/approvals" element={<ProtectedRoute roles={["manager", "admin"]}><Approvals /></ProtectedRoute>} />
          <Route path="/checkins" element={<ProtectedRoute><Checkins /></ProtectedRoute>} />
          <Route path="/analytics" element={<ProtectedRoute><Analytics /></ProtectedRoute>} />
          <Route path="/notifications" element={<ProtectedRoute><Notifications /></ProtectedRoute>} />
          <Route path="/shared-goal" element={<ProtectedRoute roles={["manager", "admin"]}><SharedGoal /></ProtectedRoute>} />
          <Route path="/team" element={<ProtectedRoute roles={["manager", "admin"]}><TeamPerformance /></ProtectedRoute>} />
          <Route path="/executive" element={<ProtectedRoute roles={["admin"]}><ExecutiveDashboard /></ProtectedRoute>} />
          <Route path="/audit-logs" element={<ProtectedRoute roles={["admin"]}><AuditLogs /></ProtectedRoute>} />
          <Route path="/users" element={<ProtectedRoute roles={["admin"]}><Users /></ProtectedRoute>} />
          
          <Route path="*" element={<Navigate to="/" />} />
        </Routes>
        <AIChatBot />
        <DemoTools />
      </Router>
      <Toaster position="top-center" />
    </AuthProvider>
  );
}

export default App;
