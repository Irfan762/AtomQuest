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

// 5 Unique Enterprise Features Pages
import AlignmentTree from "./pages/AlignmentTree";
import Timeline from "./pages/Timeline";
import Conflicts from "./pages/Conflicts";
import Scenarios from "./pages/Scenarios";
import Wellbeing from "./pages/Wellbeing";

import Sidebar from "./components/Sidebar";
import AIChatBot from "./components/AIChatBot";
import DemoTools from "./components/DemoTools";
import { Toaster } from "sonner";

import { useState } from "react";
import { Menu, X } from "lucide-react";

const ProtectedRoute = ({ children, roles }) => {
  const { user, loading } = useAuth();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  if (loading) return <div className="h-screen w-screen flex items-center justify-center font-mono text-sm uppercase tracking-widest animate-pulse">Initializing System...</div>;
  if (!user) return <Navigate to="/login" />;
  if (roles && !roles.includes(user.role)) return <Navigate to="/" />;

  return (
    <div className="flex h-screen bg-background overflow-hidden">
      {/* Desktop Sidebar */}
      <div className="hidden lg:flex h-full">
        <Sidebar />
      </div>

      {/* Mobile Sidebar Overlay */}
      {isMobileMenuOpen && (
        <div className="fixed inset-0 z-50 lg:hidden flex">
          <div className="fixed inset-0 bg-background/80 backdrop-blur-sm" onClick={() => setIsMobileMenuOpen(false)} />
          <div className="relative w-64 h-full shadow-2xl animate-in slide-in-from-left duration-300">
             <Sidebar onMobileClose={() => setIsMobileMenuOpen(false)} />
             <button 
               onClick={() => setIsMobileMenuOpen(false)}
               className="absolute top-4 -right-12 p-2 bg-primary text-primary-foreground rounded-full shadow-lg"
             >
               <X className="w-5 h-5" />
             </button>
          </div>
        </div>
      )}

      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {/* Mobile Header */}
        <header className="lg:hidden flex items-center justify-between p-4 border-b bg-card">
           <div className="flex items-center gap-2">
              <button 
                onClick={() => setIsMobileMenuOpen(true)}
                className="p-2 hover:bg-secondary rounded-lg transition-colors"
              >
                <Menu className="w-5 h-5 text-primary" />
              </button>
              <span className="font-heading font-bold tracking-tighter">GoalGrid</span>
           </div>
        </header>

        <main className="flex-1 overflow-y-auto p-4 md:p-8 fade-in">
          {children}
        </main>
      </div>
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

          {/* 5 Unique Enterprise Features Routes */}
          <Route path="/alignment-tree" element={<ProtectedRoute><AlignmentTree /></ProtectedRoute>} />
          <Route path="/timeline" element={<ProtectedRoute><Timeline /></ProtectedRoute>} />
          <Route path="/conflicts" element={<ProtectedRoute><Conflicts /></ProtectedRoute>} />
          <Route path="/scenarios" element={<ProtectedRoute roles={["manager", "admin"]}><Scenarios /></ProtectedRoute>} />
          <Route path="/wellbeing" element={<ProtectedRoute roles={["manager", "admin"]}><Wellbeing /></ProtectedRoute>} />
          
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
