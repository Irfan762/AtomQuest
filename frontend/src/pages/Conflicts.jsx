import { useState, useEffect } from "react";
import api from "../lib/api";
import { useAuth } from "../context/AuthContext";
import { toast } from "sonner";
import { 
  ShieldAlert, 
  HelpCircle, 
  CheckCircle, 
  Activity, 
  RefreshCw, 
  Building2, 
  AlertTriangle,
  FolderLock
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

const Conflicts = () => {
  const { user } = useAuth();
  const [conflicts, setConflicts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [scanning, setScanning] = useState(false);

  useEffect(() => {
    fetchConflicts();
  }, []);

  const fetchConflicts = async () => {
    try {
      const res = await api.get("/goals/conflicts");
      setConflicts(res.data);
    } catch (err) {
      toast.error("Failed to load organizational conflicts");
    } finally {
      setLoading(false);
    }
  };

  const handleScan = async () => {
    if (user?.role !== "admin") {
      toast.error("Only Admins can initiate a system-wide AI conflict scan");
      return;
    }
    setScanning(true);
    try {
      const res = await api.post("/goals/detect-conflicts");
      toast.success(`Scan complete! Detected ${res.data.count} conflict matrix points.`);
      fetchConflicts();
    } catch (err) {
      toast.error("AI Conflict detector scan failed");
    } finally {
      setScanning(false);
    }
  };

  const handleResolve = async (id) => {
    if (user?.role !== "admin") {
      toast.error("Only Admins can resolve goal conflicts");
      return;
    }
    try {
      await api.put(`/goals/conflicts/${id}/resolve`);
      toast.success("Conflict successfully resolved and archived!");
      fetchConflicts();
    } catch (err) {
      toast.error("Failed to resolve conflict");
    }
  };

  if (loading) {
    return (
      <div className="h-[80vh] flex items-center justify-center">
        <div className="text-center space-y-4">
          <div className="w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto"></div>
          <p className="text-muted-foreground font-mono text-sm">ENABLING AI SCANNER CHANNELS...</p>
        </div>
      </div>
    );
  }

  const activeConflicts = conflicts.filter(c => !c.resolved);
  const resolvedConflicts = conflicts.filter(c => c.resolved);

  const getSeverityStyles = (severity) => {
    switch (severity) {
      case "high": return "bg-rose-500/10 text-rose-500 border-rose-500/30";
      case "medium": return "bg-amber-500/10 text-amber-500 border-amber-500/30";
      default: return "bg-blue-500/10 text-blue-500 border-blue-500/30";
    }
  };

  return (
    <div className="space-y-8 max-w-7xl mx-auto">
      {/* Page Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 bg-card border border-border p-6 rounded-2xl shadow-xl">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <div className="p-2 bg-amber-500/10 text-amber-500 rounded-lg">
              <ShieldAlert className="w-6 h-6" />
            </div>
            <h1 className="text-2xl font-bold tracking-tight">AI Goal Conflict Resolution Center</h1>
          </div>
          <p className="text-muted-foreground text-sm">
            AI-driven detector highlighting structural resource clashes, headcount budgeting matches, or operational roadblocks between departments.
          </p>
        </div>

        {/* Scan Button (Admin only) */}
        {user?.role === "admin" && (
          <button
            onClick={handleScan}
            disabled={scanning}
            className="flex items-center gap-2 px-5 py-2.5 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white text-sm font-semibold rounded-xl transition-all shadow-lg shadow-blue-500/15"
          >
            <RefreshCw className={`w-4 h-4 ${scanning ? 'animate-spin' : ''}`} />
            {scanning ? "Scanning Organization Goals..." : "Run AI Conflict Detector Scan"}
          </button>
        )}
      </div>

      {/* Main Conflict Cards Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-6">
          <h2 className="text-lg font-bold tracking-tight flex items-center gap-2 border-b pb-3">
            <Activity className="w-5 h-5 text-muted-foreground" />
            Active Conflict Matrix ({activeConflicts.length})
          </h2>

          {activeConflicts.length === 0 ? (
            <div className="bg-card border p-16 rounded-2xl text-center space-y-4 shadow-sm">
              <CheckCircle className="w-12 h-12 text-emerald-500 mx-auto" />
              <h3 className="font-bold text-base">Perfect Strategic Cohesiveness!</h3>
              <p className="text-xs text-muted-foreground max-w-sm mx-auto">
                No goals currently conflict with each other. Your organizational objectives are fully aligned and synergized.
              </p>
            </div>
          ) : (
            <div className="space-y-6">
              <AnimatePresence>
                {activeConflicts.map(c => (
                  <motion.div
                    initial={{ opacity: 0, y: 15 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.95 }}
                    key={c.id}
                    className="bg-card border p-6 rounded-2xl shadow-md space-y-5"
                  >
                    {/* Top Row: Severity & Type */}
                    <div className="flex items-start justify-between gap-4">
                      <div className="space-y-1">
                        <span className={`text-[10px] uppercase font-extrabold tracking-wider border px-2.5 py-0.5 rounded-full ${getSeverityStyles(c.severity)}`}>
                          {c.severity} Severity Conflict
                        </span>
                        <h3 className="font-bold text-sm text-foreground mt-2">{c.conflict_type}</h3>
                      </div>
                      
                      {user?.role === "admin" && (
                        <button
                          onClick={() => handleResolve(c.id)}
                          className="px-3.5 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-lg transition-all shadow shadow-emerald-600/10"
                        >
                          Mark Resolved
                        </button>
                      )}
                    </div>

                    {/* Conflict Explanation Box */}
                    <p className="text-xs text-muted-foreground leading-relaxed bg-secondary/40 border border-border/20 p-4 rounded-xl">
                      <strong>AI Analysis:</strong> {c.explanation}
                    </p>

                    {/* Visual Comparison Elements */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 border-t pt-4">
                      {/* Goal 1 card */}
                      <div className="border p-4 rounded-xl bg-card shadow-inner flex flex-col justify-between min-h-[110px]">
                        <div>
                          <div className="flex items-center gap-1.5">
                            <Building2 className="w-3.5 h-3.5 text-blue-500" />
                            <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">Strategic Objective A</span>
                          </div>
                          <h4 className="font-semibold text-xs mt-2 text-foreground leading-snug">{c.goal1_title}</h4>
                        </div>
                        <span className="text-[9px] text-muted-foreground mt-3 block font-mono">ID: {c.goal1_id.substring(0, 8)}...</span>
                      </div>

                      {/* Goal 2 card */}
                      <div className="border p-4 rounded-xl bg-card shadow-inner flex flex-col justify-between min-h-[110px]">
                        <div>
                          <div className="flex items-center gap-1.5">
                            <Building2 className="w-3.5 h-3.5 text-indigo-500" />
                            <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">Strategic Objective B</span>
                          </div>
                          <h4 className="font-semibold text-xs mt-2 text-foreground leading-snug">{c.goal2_title}</h4>
                        </div>
                        <span className="text-[9px] text-muted-foreground mt-3 block font-mono">ID: {c.goal2_id.substring(0, 8)}...</span>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </AnimatePresence>
            </div>
          )}
        </div>

        {/* Resolved Conflicts Sidebar Ledger */}
        <div className="bg-card border p-6 rounded-2xl shadow-md space-y-6 h-fit">
          <h2 className="text-base font-bold tracking-tight flex items-center gap-2 border-b pb-3">
            <FolderLock className="w-5 h-5 text-muted-foreground" />
            Resolution Audit Ledger
          </h2>

          {resolvedConflicts.length === 0 ? (
            <div className="text-center py-12 text-muted-foreground text-xs italic">
              No historical conflict resolutions logged yet.
            </div>
          ) : (
            <div className="space-y-4 max-h-[480px] overflow-y-auto pr-1">
              {resolvedConflicts.map(rc => (
                <div key={rc.id} className="border p-4 rounded-xl bg-secondary/20 relative space-y-2 opacity-80">
                  <div className="flex justify-between items-center">
                    <p className="font-bold text-xs text-foreground truncate max-w-[150px]">{rc.conflict_type}</p>
                    <span className="bg-emerald-500/10 text-emerald-500 text-[9px] font-extrabold uppercase px-2 py-0.5 rounded border border-emerald-500/20">
                      Resolved
                    </span>
                  </div>
                  <p className="text-[10px] text-muted-foreground line-clamp-2">{rc.explanation}</p>
                  <p className="text-[9px] text-muted-foreground font-mono mt-1 border-t pt-1">
                    <strong>Resolver:</strong> {rc.resolved_by || "System Admin"}
                  </p>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Conflicts;
