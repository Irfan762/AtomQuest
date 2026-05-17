import { useState, useEffect } from "react";
import api from "../lib/api";
import { useAuth } from "../context/AuthContext";
import { toast } from "sonner";
import { 
  Heart, 
  Smile, 
  Meh, 
  Frown, 
  AlertOctagon, 
  AlertTriangle, 
  TrendingUp, 
  Users, 
  Building,
  BellRing
} from "lucide-react";
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell
} from "recharts";
import { motion } from "framer-motion";

const Wellbeing = () => {
  const { user } = useAuth();
  const [data, setData] = useState({ goals: [], users: {} });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const res = await api.get("/goals/alignment-tree");
      setData(res.data);
    } catch (err) {
      toast.error("Failed to load wellbeing intelligence");
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="h-[80vh] flex items-center justify-center">
        <div className="text-center space-y-4">
          <div className="w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto"></div>
          <p className="text-muted-foreground font-mono text-sm">LAUNCHING WELLBEING SENSORS...</p>
        </div>
      </div>
    );
  }

  const { goals, users } = data;
  const userList = Object.values(users);

  // Compute latest mood and stats for each employee
  const employeeMoodMap = {};
  goals.forEach(g => {
    const eid = g.employee_id;
    if (!users[eid] || users[eid].role !== "employee") return;
    
    g.quarterly_updates?.forEach(up => {
      if (up.mood) {
        const cur = employeeMoodMap[eid];
        if (!cur || new Date(up.updated_at) > new Date(cur.updated_at)) {
          employeeMoodMap[eid] = {
            mood: up.mood,
            quarter: up.quarter,
            updated_at: up.updated_at,
            goal_title: g.title,
            comments: up.comments
          };
        }
      }
    });
  });

  const getMoodEmoji = (mood) => {
    switch (mood) {
      case "confident": return "😊";
      case "challenged": return "😐";
      case "struggling": return "😰";
      case "blocked": return "🚨";
      default: return "⚪";
    }
  };

  const getMoodLabel = (mood) => {
    switch (mood) {
      case "confident": return "Confident & On Track";
      case "challenged": return "Challenged but Advancing";
      case "struggling": return "Struggling & Needs Support";
      case "blocked": return "Blocked & Needs Urgent Help";
      default: return "No Update";
    }
  };

  const getMoodColor = (mood) => {
    switch (mood) {
      case "confident": return "bg-emerald-500/10 text-emerald-500 border-emerald-500/30";
      case "challenged": return "bg-blue-500/10 text-blue-500 border-blue-500/30";
      case "struggling": return "bg-amber-500/10 text-amber-500 border-amber-500/30";
      case "blocked": return "bg-rose-500/10 text-rose-500 border-rose-500/30";
      default: return "bg-slate-500/10 text-slate-400 border-slate-500/20";
    }
  };

  // Group wellbeing stats by department
  const departmentStats = {};
  userList.forEach(u => {
    if (u.role !== "employee" || !u.department) return;
    const d = u.department;
    if (!departmentStats[d]) {
      departmentStats[d] = { total: 0, confident: 0, challenged: 0, struggling: 0, blocked: 0, unassigned: 0 };
    }
    
    const latest = employeeMoodMap[u.id];
    departmentStats[d].total += 1;
    if (!latest) {
      departmentStats[d].unassigned += 1;
    } else {
      departmentStats[d][latest.mood] += 1;
    }
  });

  // Calculate overall wellbeing score
  let totalTracked = 0;
  let healthyCount = 0;
  const moodDistribution = { confident: 0, challenged: 0, struggling: 0, blocked: 0 };

  Object.values(employeeMoodMap).forEach(e => {
    totalTracked += 1;
    moodDistribution[e.mood] += 1;
    if (e.mood === "confident" || e.mood === "challenged") healthyCount += 1;
  });

  const overallWellbeingScore = totalTracked 
    ? Math.round((healthyCount / totalTracked) * 100) 
    : 100;

  // Stressed alerts
  const wellbeingAlerts = [];
  Object.entries(employeeMoodMap).forEach(([eid, e]) => {
    if (e.mood === "struggling" || e.mood === "blocked") {
      wellbeingAlerts.push({
        employee_id: eid,
        name: users[eid]?.name || "Team Member",
        department: users[eid]?.department || "Core",
        ...e
      });
    }
  });

  // Pie chart data
  const pieData = [
    { name: "Confident", value: moodDistribution.confident, color: "#10b981" },
    { name: "Challenged", value: moodDistribution.challenged, color: "#3b82f6" },
    { name: "Struggling", value: moodDistribution.struggling, color: "#f59e0b" },
    { name: "Blocked", value: moodDistribution.blocked, color: "#ef4444" }
  ].filter(p => p.value > 0);

  // Bar chart data for departments
  const deptChartData = Object.entries(departmentStats).map(([dept, s]) => {
    const stressed = s.struggling + s.blocked;
    const pct = s.total ? Math.round((stressed / s.total) * 100) : 0;
    return {
      department: dept,
      Stressed: stressed,
      Healthy: s.confident + s.challenged,
      Unreported: s.unassigned,
      stressedPct: pct
    };
  });

  // Teams at risk (>30% stressed)
  const teamsAtRisk = deptChartData.filter(d => d.stressedPct >= 30);

  return (
    <div className="space-y-8 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-card border border-border p-6 rounded-2xl shadow-xl">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <div className="p-2 bg-rose-600/10 text-rose-500 rounded-lg">
              <Heart className="w-6 h-6 animate-pulse" />
            </div>
            <h1 className="text-2xl font-bold tracking-tight">Employee Wellbeing Pulse Dashboard</h1>
          </div>
          <p className="text-muted-foreground text-sm">
            Empathetic operational dashboard displaying organizational confidence index, mood heatmaps, and emotional alert streams.
          </p>
        </div>

        {/* Global Wellness Score */}
        <div className="flex items-center gap-4 bg-secondary/50 border p-4 rounded-xl">
          <div className="text-center">
            <span className="text-3xl font-extrabold text-rose-500">{overallWellbeingScore}%</span>
            <div className="text-[10px] uppercase font-bold text-muted-foreground tracking-wider mt-1">Global Wellness Index</div>
          </div>
          <div className="h-10 w-[1px] bg-border" />
          <div className="text-xs text-muted-foreground space-y-1">
            <p><strong>{totalTracked}</strong> active pulse logs</p>
            <p><strong>{wellbeingAlerts.length}</strong> urgent alerts 🚨</p>
          </div>
        </div>
      </div>

      {/* Overview Analytics Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {/* Wellbeing Pie Distribution */}
        <div className="bg-card border p-6 rounded-2xl shadow-md space-y-4">
          <h3 className="text-sm font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-2 border-b pb-3">
            <TrendingUp className="w-4 h-4 text-blue-500" />
            Mood Distribution
          </h3>
          {pieData.length === 0 ? (
            <div className="h-48 flex items-center justify-center text-xs text-muted-foreground italic">
              No wellbeing metrics submitted this quarter yet.
            </div>
          ) : (
            <div className="h-48 relative flex items-center justify-center">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={pieData}
                    cx="50%"
                    cy="50%"
                    innerRadius={55}
                    outerRadius={75}
                    paddingAngle={3}
                    dataKey="value"
                  >
                    {pieData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip formatter={(v) => [`${v} Members`, "Volume"]} />
                </PieChart>
              </ResponsiveContainer>
              <div className="absolute text-center">
                <span className="text-2xl font-extrabold text-foreground">{totalTracked}</span>
                <p className="text-[9px] uppercase font-semibold text-muted-foreground">Logged</p>
              </div>
            </div>
          )}
          <div className="grid grid-cols-2 gap-2 text-xs">
            <div className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded bg-emerald-500"/> Confident ({moodDistribution.confident})</div>
            <div className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded bg-blue-500"/> Challenged ({moodDistribution.challenged})</div>
            <div className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded bg-amber-500"/> Struggling ({moodDistribution.struggling})</div>
            <div className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded bg-rose-500"/> Blocked ({moodDistribution.blocked})</div>
          </div>
        </div>

        {/* Departmental Health Comparisons */}
        <div className="bg-card border p-6 rounded-2xl shadow-md space-y-4 md:col-span-2">
          <h3 className="text-sm font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-2 border-b pb-3">
            <Building className="w-4 h-4 text-blue-500" />
            Departmental Wellness Index Comparison
          </h3>
          <div className="h-56">
            {deptChartData.length === 0 ? (
              <div className="h-full flex items-center justify-center text-xs text-muted-foreground italic">
                No departmental data compiled.
              </div>
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={deptChartData}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} opacity={0.15} />
                  <XAxis dataKey="department" stroke="#888888" fontSize={10} tickLine={false} />
                  <YAxis stroke="#888888" fontSize={10} tickLine={false} />
                  <Tooltip />
                  <Bar dataKey="Healthy" fill="#3b82f6" stackId="a" radius={[0, 0, 0, 0]} />
                  <Bar dataKey="Stressed" fill="#ef4444" stackId="a" radius={[0, 0, 0, 0]} />
                  <Bar dataKey="Unreported" fill="#e2e8f0" stackId="a" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            )}
          </div>
        </div>
      </div>

      {/* Grid heatmaps & Action Center */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Wellbeing Pulse Grid Heatmap */}
        <div className="lg:col-span-2 bg-card border p-6 rounded-2xl shadow-md space-y-6">
          <h3 className="text-base font-bold tracking-tight flex items-center gap-2">
            <Users className="w-5 h-5 text-muted-foreground" />
            Employee Emotional State Grid (Latest)
          </h3>
          <p className="text-xs text-muted-foreground">
            A grid representation of your personnel workforce. Hover to reveal comments, click to trigger support.
          </p>

          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
            {userList
              .filter(u => u.role === "employee")
              .map(emp => {
                const state = employeeMoodMap[emp.id];
                return (
                  <motion.div
                    whileHover={{ scale: 1.02 }}
                    key={emp.id}
                    className={`border p-4 rounded-xl flex flex-col items-center justify-between text-center min-h-[140px] ${getMoodColor(state?.mood)}`}
                  >
                    <div className="w-10 h-10 rounded-full bg-card shadow-inner flex items-center justify-center text-xl">
                      {getMoodEmoji(state?.mood)}
                    </div>
                    <div className="mt-2">
                      <p className="font-bold text-xs text-foreground truncate max-w-[120px]">{emp.name}</p>
                      <p className="text-[10px] text-muted-foreground truncate capitalize">{emp.department || "Core Team"}</p>
                    </div>
                    <span className="text-[9px] uppercase font-extrabold tracking-wider bg-card/60 px-2 py-0.5 rounded mt-2 border border-border/10">
                      {state ? `${state.quarter}: ${state.mood}` : "Unreported"}
                    </span>
                  </motion.div>
                );
              })}
          </div>
        </div>

        {/* Wellbeing Alert Stream & Risk Center */}
        <div className="space-y-6">
          {/* Teams at Risk Warning Panel */}
          {teamsAtRisk.length > 0 && (
            <div className="bg-rose-500/10 border border-rose-500/30 p-5 rounded-2xl space-y-3 shadow-sm">
              <div className="flex items-center gap-2 text-rose-500">
                <AlertTriangle className="w-5 h-5 animate-bounce" />
                <h3 className="font-bold text-sm uppercase tracking-tight">Teams At Severe Risk</h3>
              </div>
              <p className="text-xs text-muted-foreground">
                The following departments exceed the **30% wellness stress threshold** and require direct leadership support.
              </p>
              <div className="space-y-2">
                {teamsAtRisk.map(tar => (
                  <div key={tar.department} className="bg-card border p-3 rounded-lg flex justify-between items-center text-xs">
                    <div>
                      <p className="font-bold">{tar.department} Team</p>
                      <span className="text-[10px] text-muted-foreground">{tar.Stressed} stressed out of {tar.Healthy + tar.Stressed} logged</span>
                    </div>
                    <span className="bg-rose-500 text-white font-extrabold text-[10px] px-2.5 py-0.5 rounded-full">
                      {tar.stressedPct}% Stress
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Action Center - Wellbeing Alert List */}
          <div className="bg-card border p-6 rounded-2xl shadow-md space-y-4">
            <h3 className="text-base font-bold tracking-tight flex items-center gap-2 border-b pb-3">
              <BellRing className="w-5 h-5 text-rose-500" />
              Emotional Alert Stream
            </h3>

            {wellbeingAlerts.length === 0 ? (
              <div className="text-center py-12 text-muted-foreground text-xs italic">
                No active employee distress flags. Your organization is healthy!
              </div>
            ) : (
              <div className="space-y-3 max-h-72 overflow-y-auto pr-1">
                {wellbeingAlerts.map(alert => (
                  <div 
                    key={alert.employee_id} 
                    className="border p-4 rounded-xl space-y-2 bg-secondary/30 relative"
                  >
                    <div className="flex items-center justify-between">
                      <p className="font-bold text-xs text-foreground">{alert.name}</p>
                      <span className={`text-[10px] font-extrabold px-2 py-0.5 rounded ${alert.mood === 'blocked' ? 'bg-rose-500 text-white' : 'bg-amber-500 text-black'}`}>
                        {alert.mood === 'blocked' ? '🔴 Blocked' : '😰 Struggling'}
                      </span>
                    </div>
                    <p className="text-[10px] text-muted-foreground">
                      <strong>Goal:</strong> "{alert.goal_title}"
                    </p>
                    <p className="text-[10px] text-muted-foreground italic leading-relaxed bg-card p-2 rounded border border-border/30">
                      "{alert.comments || "Logged distress check-in with no clarifying remarks."}"
                    </p>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Wellbeing;
