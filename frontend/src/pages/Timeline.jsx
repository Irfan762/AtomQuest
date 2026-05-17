import { useState, useEffect } from "react";
import api from "../lib/api";
import { useAuth } from "../context/AuthContext";
import { toast } from "sonner";
import { 
  Calendar, 
  Filter, 
  Clock, 
  User, 
  Layers, 
  HelpCircle, 
  FileDown, 
  AlertCircle,
  Briefcase
} from "lucide-react";
import { motion } from "framer-motion";

const Timeline = () => {
  const { user } = useAuth();
  const [goals, setGoals] = useState([]);
  const [employees, setEmployees] = useState([]);
  const [loading, setLoading] = useState(true);

  // Filters
  const [department, setDepartment] = useState("");
  const [employeeId, setEmployeeId] = useState("");
  const [status, setStatus] = useState("");
  const [quarter, setQuarter] = useState("");

  const MONTHS = [
    "Jan", "Feb", "Mar", "Apr", "May", "Jun", 
    "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"
  ];

  useEffect(() => {
    fetchEmployees();
    fetchTimelineData();
  }, [department, employeeId, status, quarter]);

  const fetchEmployees = async () => {
    try {
      const res = await api.get("/users");
      setEmployees(res.data);
    } catch (err) {
      // Admin only might fail silently for employee role
    }
  };

  const fetchTimelineData = async () => {
    setLoading(true);
    try {
      const q = new URLSearchParams();
      if (department) q.append("department", department);
      if (employeeId) q.append("employee_id", employeeId);
      if (status) q.append("status", status);
      if (quarter) q.append("quarter", quarter);

      const res = await api.get(`/goals/timeline?${q.toString()}`);
      setGoals(res.data);
    } catch (err) {
      toast.error("Failed to load Gantt timeline metrics");
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (gStatus) => {
    switch (gStatus) {
      case "Completed": return "bg-emerald-500 hover:bg-emerald-600 shadow-emerald-500/10";
      case "On Track": return "bg-blue-500 hover:bg-blue-600 shadow-blue-500/10";
      case "At Risk": return "bg-amber-500 hover:bg-amber-600 shadow-amber-500/10";
      default: return "bg-slate-400 hover:bg-slate-500 shadow-slate-400/10";
    }
  };

  // Calculate Gantt placement: left position and width in percentage
  const calculateGanttPosition = (sDate, eDate) => {
    const start = new Date(sDate);
    const end = new Date(eDate);
    
    // Normalize to current year months (0 to 11)
    let startMonth = start.getMonth();
    let endMonth = end.getMonth();
    
    // In case dates cross years
    if (start.getFullYear() < 2026) startMonth = 0;
    if (end.getFullYear() > 2026) endMonth = 11;
    
    if (startMonth > 11) startMonth = 11;
    if (endMonth > 11) endMonth = 11;
    if (endMonth < startMonth) endMonth = startMonth;

    const left = (startMonth / 12) * 100;
    const width = ((endMonth - startMonth + 1) / 12) * 100;

    return { left: `${left}%`, width: `${width}%` };
  };

  // Find deadline clustering (multiple goals due in same quarter or week)
  const getDeadlineClustering = () => {
    const counts = {};
    goals.forEach(g => {
      const m = new Date(g.deadline).getMonth();
      counts[m] = (counts[m] || 0) + 1;
    });
    return counts;
  };

  const clusters = getDeadlineClustering();
  const hasClusteringAlert = Object.values(clusters).some(c => c >= 3);

  return (
    <div className="space-y-8 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-card border border-border p-6 rounded-2xl shadow-xl">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <div className="p-2 bg-indigo-600/10 text-indigo-500 rounded-lg">
              <Calendar className="w-6 h-6" />
            </div>
            <h1 className="text-2xl font-bold tracking-tight">Goal Timeline Gantt View</h1>
          </div>
          <p className="text-muted-foreground text-sm">
            Operational timeline plotting project deadlines, duration tracking, and workload clusters.
          </p>
        </div>

        {/* Workload Cluster Info */}
        {hasClusteringAlert && (
          <div className="flex items-center gap-3 bg-amber-500/10 border border-amber-500/30 p-4 rounded-xl text-amber-500 max-w-sm">
            <AlertCircle className="w-5 h-5 flex-shrink-0 animate-bounce" />
            <div className="text-xs">
              <p className="font-bold uppercase tracking-wider">Workload Alert Triggered</p>
              <p className="text-muted-foreground mt-0.5">Multiple goals are due in the same monthly cluster. Review capacity.</p>
            </div>
          </div>
        )}
      </div>

      {/* Filter Controls Bar */}
      <div className="bg-card border p-5 rounded-2xl shadow-sm flex flex-wrap gap-4 items-center">
        <div className="flex items-center gap-2 text-xs font-bold uppercase text-muted-foreground mr-2">
          <Filter className="w-4 h-4 text-blue-500" />
          Filter Timeline:
        </div>

        <select
          value={department}
          onChange={(e) => setDepartment(e.target.value)}
          className="bg-secondary/50 border border-border/60 text-xs rounded-xl px-3 py-2 outline-none focus:ring-1 focus:ring-blue-500 cursor-pointer"
        >
          <option value="">All Departments</option>
          <option value="Engineering">Engineering</option>
          <option value="Sales">Sales</option>
          <option value="HR">HR</option>
          <option value="Marketing">Marketing</option>
        </select>

        {employees.length > 0 && (
          <select
            value={employeeId}
            onChange={(e) => setEmployeeId(e.target.value)}
            className="bg-secondary/50 border border-border/60 text-xs rounded-xl px-3 py-2 outline-none focus:ring-1 focus:ring-blue-500 cursor-pointer"
          >
            <option value="">All Owners</option>
            {employees.map(emp => (
              <option key={emp.id} value={emp.id}>{emp.name}</option>
            ))}
          </select>
        )}

        <select
          value={status}
          onChange={(e) => setStatus(e.target.value)}
          className="bg-secondary/50 border border-border/60 text-xs rounded-xl px-3 py-2 outline-none focus:ring-1 focus:ring-blue-500 cursor-pointer"
        >
          <option value="">All Statuses</option>
          <option value="Not Started">Not Started</option>
          <option value="On Track">On Track</option>
          <option value="At Risk">At Risk</option>
          <option value="Completed">Completed</option>
        </select>

        <select
          value={quarter}
          onChange={(e) => setQuarter(e.target.value)}
          className="bg-secondary/50 border border-border/60 text-xs rounded-xl px-3 py-2 outline-none focus:ring-1 focus:ring-blue-500 cursor-pointer"
        >
          <option value="">All Quarters</option>
          <option value="Q1">Quarter 1 (Q1)</option>
          <option value="Q2">Quarter 2 (Q2)</option>
          <option value="Q3">Quarter 3 (Q3)</option>
          <option value="Q4">Quarter 4 (Q4)</option>
        </select>

        <button 
          onClick={() => {
            setDepartment("");
            setEmployeeId("");
            setStatus("");
            setQuarter("");
          }}
          className="text-xs text-muted-foreground hover:text-foreground font-semibold ml-auto transition-colors"
        >
          Clear Filters
        </button>
      </div>

      {/* Timeline Gantt Component */}
      <div className="bg-card border rounded-2xl shadow-md overflow-hidden">
        {/* Monthly Grid Header */}
        <div className="grid grid-cols-12 border-b bg-secondary/30 text-center py-3.5 text-xs font-bold text-muted-foreground">
          {MONTHS.map(m => (
            <div key={m} className="border-r last:border-none border-border/40 uppercase tracking-widest font-mono">
              {m}
            </div>
          ))}
        </div>

        {loading ? (
          <div className="py-24 text-center">
            <div className="w-10 h-10 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin mx-auto mb-3"></div>
            <p className="text-xs text-muted-foreground font-mono">PLOTTING HORIZONTAL TIMELINE...</p>
          </div>
        ) : goals.length === 0 ? (
          <div className="py-24 text-center">
            <Briefcase className="w-12 h-12 text-muted-foreground/30 mx-auto mb-3" />
            <p className="text-xs text-muted-foreground font-mono uppercase">NO TIMELINES PLOTTED</p>
            <p className="text-xs text-muted-foreground mt-1">Try resetting your filters or creating a goal with varied dates.</p>
          </div>
        ) : (
          <div className="divide-y relative min-h-[350px]">
            {/* Background vertical gridlines */}
            <div className="absolute inset-0 grid grid-cols-12 pointer-events-none opacity-[0.03] z-0">
              {MONTHS.map((_, i) => (
                <div key={i} className="border-r last:border-none border-black dark:border-white h-full" />
              ))}
            </div>

            {/* Gantt Row Per Goal */}
            {goals.map(g => {
              const pos = calculateGanttPosition(g.startDate || g.created_at, g.deadline);
              return (
                <div key={g.id} className="p-4 flex flex-col md:flex-row md:items-center gap-4 relative z-10 hover:bg-secondary/15 transition-colors">
                  {/* Goal Info Side (3/12 wide approx in visual styling) */}
                  <div className="w-full md:w-64 flex-shrink-0 space-y-1">
                    <h3 className="font-bold text-xs text-foreground truncate max-w-[220px]">{g.title}</h3>
                    <div className="flex items-center gap-2 text-[10px] text-muted-foreground font-medium">
                      <span className="capitalize">{g.thrust_area}</span>
                      <span>•</span>
                      <span>Weight: {g.weightage}%</span>
                    </div>
                  </div>

                  {/* Horizontal Bar Area (fills rest of row) */}
                  <div className="flex-1 h-8 bg-secondary/20 rounded-lg relative overflow-visible flex items-center">
                    <motion.div
                      initial={{ opacity: 0, scaleX: 0 }}
                      animate={{ opacity: 1, scaleX: 1 }}
                      transition={{ duration: 0.4 }}
                      style={{ left: pos.left, width: pos.width }}
                      className={`absolute h-6 rounded-md cursor-pointer text-white flex items-center justify-between px-3 text-[10px] font-bold shadow transition-all duration-300 origin-left ${getStatusColor(g.status)}`}
                    >
                      <span className="truncate max-w-[120px]">{g.status}</span>
                      <span>{g.progress}%</span>

                      {/* Tooltip Overlay */}
                      <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 w-64 bg-card border border-border shadow-2xl p-4 rounded-xl text-foreground font-normal hidden group-hover:block z-50 pointer-events-none text-xs leading-relaxed space-y-2 opacity-0 hover:opacity-100 transition-opacity">
                        <p className="font-bold text-xs">{g.title}</p>
                        <p className="text-[10px] text-muted-foreground">{g.description}</p>
                        <div className="grid grid-cols-2 gap-2 text-[10px] border-t pt-2 mt-2">
                          <p><strong>Start:</strong> {new Date(g.startDate).toLocaleDateString()}</p>
                          <p><strong>End:</strong> {new Date(g.deadline).toLocaleDateString()}</p>
                        </div>
                      </div>
                    </motion.div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Timeline Legend Summary */}
      <div className="bg-card border p-6 rounded-2xl shadow-sm grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
        <div>
          <span className="text-xl font-extrabold text-emerald-500">
            {goals.filter(g => g.status === 'Completed').length}
          </span>
          <p className="text-[10px] uppercase font-bold text-muted-foreground tracking-wider mt-1">Completed Objectives</p>
        </div>
        <div>
          <span className="text-xl font-extrabold text-blue-500">
            {goals.filter(g => g.status === 'On Track').length}
          </span>
          <p className="text-[10px] uppercase font-bold text-muted-foreground tracking-wider mt-1">On Track</p>
        </div>
        <div>
          <span className="text-xl font-extrabold text-amber-500">
            {goals.filter(g => g.status === 'At Risk').length}
          </span>
          <p className="text-[10px] uppercase font-bold text-muted-foreground tracking-wider mt-1">At Risk objectives</p>
        </div>
        <div>
          <span className="text-xl font-extrabold text-slate-500">
            {goals.length}
          </span>
          <p className="text-[10px] uppercase font-bold text-muted-foreground tracking-wider mt-1">Total Goals Displayed</p>
        </div>
      </div>
    </div>
  );
};

export default Timeline;
