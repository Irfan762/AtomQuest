import { Link, useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import NotificationCenter from "./NotificationCenter";
import { 
  LayoutDashboard, 
  Target, 
  CheckCircle2, 
  CalendarCheck, 
  BarChart3, 
  ScrollText, 
  Users as UsersIcon, 
  Share2, 
  LogOut, 
  Sparkle,
  Bell
} from "lucide-react";
import { cn } from "./ui/button";

const Sidebar = ({ onMobileClose }) => {
  const { user, logout } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await logout();
    navigate("/login");
  };

  const navItems = [
    { to: "/", label: "Dashboard", icon: LayoutDashboard, roles: ["employee", "manager", "admin"] },
    { to: "/goals", label: "My Goals", icon: Target, roles: ["employee", "manager", "admin"] },
    { to: "/alignment-tree", label: "Goal Cascade Tree", icon: Share2, roles: ["employee", "manager", "admin"] },
    { to: "/timeline", label: "Gantt Timeline", icon: CalendarCheck, roles: ["employee", "manager", "admin"] },
    { to: "/conflicts", label: "AI Conflict Center", icon: ScrollText, roles: ["employee", "manager", "admin"] },
    { to: "/scenarios", label: "Scenario Simulator", icon: Sparkle, roles: ["manager", "admin"] },
    { to: "/wellbeing", label: "Wellbeing Pulse", icon: Sparkle, roles: ["manager", "admin"] },
    { to: "/approvals", label: "Approvals", icon: CheckCircle2, roles: ["manager", "admin"] },
    { to: "/team", label: "Team Performance", icon: UsersIcon, roles: ["manager", "admin"] },
    { to: "/executive", label: "Executive Insights", icon: BarChart3, roles: ["admin"] },
    { to: "/checkins", label: "Check-ins", icon: CalendarCheck, roles: ["employee", "manager", "admin"] },
    { to: "/notifications", label: "Notifications", icon: Bell, roles: ["employee", "manager", "admin"] },
    { to: "/analytics", label: "Analytics", icon: BarChart3, roles: ["employee", "manager", "admin"] },
    { to: "/shared-goal", label: "Shared Goal", icon: Share2, roles: ["manager", "admin"] },
    { to: "/audit-logs", label: "Audit Logs", icon: ScrollText, roles: ["admin"] },
    { to: "/users", label: "Users", icon: UsersIcon, roles: ["admin"] },
  ];

  const filteredItems = navItems.filter(item => item.roles.includes(user?.role));

  return (
    <aside className="w-full lg:w-64 h-full border-r bg-card flex flex-col">
      <div className="p-6 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center shadow-lg shadow-blue-500/20">
            <Sparkle className="text-white w-5 h-5" />
          </div>
          <span className="font-heading font-bold text-xl tracking-tighter">GoalGrid</span>
        </div>
        <NotificationCenter />
      </div>

      <nav className="flex-1 px-4 py-4 space-y-1 overflow-y-auto">
        {filteredItems.map((item) => (
          <Link
            key={item.to}
            to={item.to}
            onClick={() => onMobileClose?.()}
            className={cn(
              "flex items-center gap-3 px-3 py-2 rounded-md text-sm font-medium transition-colors",
              location.pathname === item.to 
                ? "bg-blue-600 text-white shadow-md shadow-blue-500/10" 
                : "text-muted-foreground hover:bg-secondary hover:text-foreground"
            )}
          >
            <item.icon className="w-4 h-4" />
            {item.label}
          </Link>
        ))}
      </nav>

      <div className="p-4 border-t space-y-4">
        <div className="px-3 py-2">
          <div className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">Account</div>
          <div className="flex items-center gap-3 mb-4">
            <div className="w-8 h-8 rounded-full bg-accent flex items-center justify-center font-bold text-xs">
              {user?.name?.[0]}
            </div>
            <div className="overflow-hidden">
              <div className="text-sm font-medium truncate">{user?.name}</div>
              <div className="text-xs text-muted-foreground truncate capitalize">{user?.role}</div>
            </div>
          </div>
          <button
            onClick={handleLogout}
            className="w-full flex items-center gap-3 px-3 py-2 rounded-md text-sm font-medium text-destructive hover:bg-destructive/10 transition-colors"
          >
            <LogOut className="w-4 h-4" />
            Logout
          </button>
        </div>
      </div>
    </aside>
  );
};

export default Sidebar;
