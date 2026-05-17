import { useState, useEffect } from "react";
import api from "../lib/api";
import { useAuth } from "../context/AuthContext";
import { toast } from "sonner";
import { 
  Target, 
  AlertTriangle, 
  ChevronRight, 
  ChevronDown, 
  Activity, 
  Network, 
  Building2, 
  User2, 
  CheckCircle2, 
  Clock, 
  AlertCircle 
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

const AlignmentTree = () => {
  const { user } = useAuth();
  const [data, setData] = useState({ goals: [], users: {}, alignmentScore: 100 });
  const [loading, setLoading] = useState(true);
  const [expandedNodes, setExpandedNodes] = useState({});
  const [selectedGoal, setSelectedGoal] = useState(null);

  useEffect(() => {
    fetchTreeData();
  }, []);

  const fetchTreeData = async () => {
    try {
      const res = await api.get("/goals/alignment-tree");
      setData(res.data);
      // Expand all root nodes by default
      const roots = {};
      res.data.goals.forEach(g => {
        if (!g.parentGoalId) {
          roots[g.id] = true;
        }
      });
      setExpandedNodes(roots);
    } catch (err) {
      toast.error("Failed to load alignment cascade tree");
    } finally {
      setLoading(false);
    }
  };

  const toggleExpand = (nodeId) => {
    setExpandedNodes(prev => ({
      ...prev,
      [nodeId]: !prev[nodeId]
    }));
  };

  if (loading) {
    return (
      <div className="h-[80vh] flex items-center justify-center">
        <div className="text-center space-y-4">
          <div className="w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto"></div>
          <p className="text-muted-foreground font-mono text-sm">LOADING CASCADING MATRIX...</p>
        </div>
      </div>
    );
  }

  const { goals, users, alignmentScore } = data;

  // Separate goals into levels
  const companyGoals = goals.filter(g => {
    const owner = users[g.employee_id];
    return !g.parentGoalId && (owner?.role === "admin" || g.thrust_area === "Strategic Growth");
  });

  const getChildren = (parentId) => {
    return goals.filter(g => g.parentGoalId === parentId);
  };

  const getStatusColor = (status) => {
    switch (status) {
      case "Completed": return "text-emerald-500 border-emerald-500/30 bg-emerald-500/10";
      case "On Track": return "text-blue-500 border-blue-500/30 bg-blue-500/10";
      case "At Risk": return "text-amber-500 border-amber-500/30 bg-amber-500/10";
      default: return "text-rose-500 border-rose-500/30 bg-rose-500/10";
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case "Completed": return <CheckCircle2 className="w-4 h-4 text-emerald-500" />;
      case "On Track": return <Activity className="w-4 h-4 text-blue-500" />;
      case "At Risk": return <AlertTriangle className="w-4 h-4 text-amber-500" />;
      default: return <Clock className="w-4 h-4 text-rose-500" />;
    }
  };

  // Find orphaned goals (owned by employees but parentGoalId is missing or invalid)
  const employeeGoals = goals.filter(g => users[g.employee_id]?.role === "employee");
  const orphanedGoals = employeeGoals.filter(g => !g.parentGoalId);

  return (
    <div className="space-y-8 max-w-7xl mx-auto">
      {/* Page Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-card border border-border p-6 rounded-2xl shadow-xl">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <div className="p-2 bg-blue-600/10 text-blue-500 rounded-lg">
              <Network className="w-6 h-6" />
            </div>
            <h1 className="text-2xl font-bold tracking-tight">Goal Alignment Cascade Tree</h1>
          </div>
          <p className="text-muted-foreground text-sm">
            Visualize how individual employee goals cascade and support departmental and executive business strategies.
          </p>
        </div>

        {/* Alignment Scorecard */}
        <div className="flex items-center gap-4 bg-secondary/50 border p-4 rounded-xl">
          <div className="text-center">
            <span className="text-3xl font-extrabold text-blue-500">{alignmentScore}%</span>
            <div className="text-[10px] uppercase font-bold text-muted-foreground tracking-wider mt-1">Strategy Alignment Score</div>
          </div>
          <div className="h-10 w-[1px] bg-border" />
          <div className="text-xs text-muted-foreground space-y-1">
            <p><strong>{employeeGoals.length - orphanedGoals.length}</strong> aligned goals</p>
            <p><strong>{orphanedGoals.length}</strong> orphaned KPIs ⚠️</p>
          </div>
        </div>
      </div>

      {/* Main Cascade Tree Area */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-6 bg-card border p-6 rounded-2xl shadow-md min-h-[500px] overflow-x-auto relative">
          <div className="absolute top-4 right-4 flex items-center gap-4 text-xs font-medium text-muted-foreground bg-secondary px-3 py-1 rounded-full">
            <div className="flex items-center gap-1"><span className="w-2.5 h-2.5 rounded-full bg-emerald-500 inline-block"/> Completed</div>
            <div className="flex items-center gap-1"><span className="w-2.5 h-2.5 rounded-full bg-blue-500 inline-block"/> On Track</div>
            <div className="flex items-center gap-1"><span className="w-2.5 h-2.5 rounded-full bg-amber-500 inline-block"/> At Risk</div>
          </div>

          <h2 className="text-lg font-bold tracking-tight mb-4 flex items-center gap-2">
            <Building2 className="w-5 h-5 text-muted-foreground" />
            Corporate Cascade Roadmap
          </h2>

          {companyGoals.length === 0 ? (
            <div className="text-center py-16">
              <Target className="w-12 h-12 text-muted-foreground/30 mx-auto mb-4" />
              <p className="text-muted-foreground font-mono text-xs">NO COMPANY GOALS CONFIGURED</p>
              <p className="text-xs text-muted-foreground mt-1">Create an approved company-level strategic goal as an Admin to start cascading.</p>
            </div>
          ) : (
            <div className="space-y-8 pl-4 border-l border-border mt-4">
              {companyGoals.map(comp => (
                <div key={comp.id} className="space-y-4 relative">
                  {/* Company Node (Level 1) */}
                  <div className="flex items-start gap-3">
                    <button 
                      onClick={() => toggleExpand(comp.id)}
                      className="p-1 hover:bg-secondary rounded mt-1 transition-colors"
                    >
                      {expandedNodes[comp.id] ? <ChevronDown className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
                    </button>
                    <div 
                      onClick={() => setSelectedGoal(comp)}
                      className={`flex-1 border p-4 rounded-xl cursor-pointer hover:shadow-lg transition-all duration-300 ${getStatusColor(comp.status)} ${selectedGoal?.id === comp.id ? 'ring-2 ring-blue-500' : ''}`}
                    >
                      <div className="flex items-center justify-between">
                        <span className="text-[10px] font-bold uppercase tracking-wider bg-blue-500 text-white px-2 py-0.5 rounded">
                          Company Strategic Goal
                        </span>
                        <span className="flex items-center gap-1 text-xs">
                          {getStatusIcon(comp.status)} {comp.status}
                        </span>
                      </div>
                      <h3 className="font-bold text-sm mt-2">{comp.title}</h3>
                      <div className="flex items-center justify-between text-xs mt-3 opacity-80">
                        <span>Owner: {users[comp.employee_id]?.name || "Executive Team"}</span>
                        <span>Weight: {comp.weightage}%</span>
                      </div>
                    </div>
                  </div>

                  {/* Department Node (Level 2) */}
                  <AnimatePresence>
                    {expandedNodes[comp.id] && (
                      <motion.div 
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: "auto" }}
                        exit={{ opacity: 0, height: 0 }}
                        className="pl-8 space-y-4 border-l-2 border-dashed border-border/50 ml-7"
                      >
                        {getChildren(comp.id).length === 0 ? (
                          <p className="text-xs text-muted-foreground font-mono pl-4 italic">No departmental cascading objectives linked yet.</p>
                        ) : (
                          getChildren(comp.id).map(dept => (
                            <div key={dept.id} className="space-y-4">
                              <div className="flex items-start gap-3">
                                <button 
                                  onClick={() => toggleExpand(dept.id)}
                                  className="p-1 hover:bg-secondary rounded mt-1 transition-colors"
                                >
                                  {expandedNodes[dept.id] ? <ChevronDown className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
                                </button>
                                <div 
                                  onClick={() => setSelectedGoal(dept)}
                                  className={`flex-1 border p-4 rounded-xl cursor-pointer hover:shadow-lg transition-all duration-300 ${getStatusColor(dept.status)} ${selectedGoal?.id === dept.id ? 'ring-2 ring-blue-500' : ''}`}
                                >
                                  <div className="flex items-center justify-between">
                                    <span className="text-[10px] font-bold uppercase tracking-wider bg-indigo-500 text-white px-2 py-0.5 rounded">
                                      {users[dept.employee_id]?.department || "Core"} Department
                                    </span>
                                    <span className="flex items-center gap-1 text-xs">
                                      {getStatusIcon(dept.status)} {dept.status}
                                    </span>
                                  </div>
                                  <h4 className="font-bold text-sm mt-2">{dept.title}</h4>
                                  <div className="flex items-center justify-between text-xs mt-3 opacity-80">
                                    <span>Manager: {users[dept.employee_id]?.name}</span>
                                    <span>Weight: {dept.weightage}%</span>
                                  </div>
                                </div>
                              </div>

                              {/* Employee Node (Level 3) */}
                              <AnimatePresence>
                                {expandedNodes[dept.id] && (
                                  <motion.div 
                                    initial={{ opacity: 0, height: 0 }}
                                    animate={{ opacity: 1, height: "auto" }}
                                    exit={{ opacity: 0, height: 0 }}
                                    className="pl-8 space-y-3 border-l-2 border-dotted border-border ml-7"
                                  >
                                    {getChildren(dept.id).length === 0 ? (
                                      <p className="text-xs text-muted-foreground font-mono pl-4 italic">No employee-level deliverables linked yet.</p>
                                    ) : (
                                      getChildren(dept.id).map(emp => (
                                        <div 
                                          key={emp.id}
                                          onClick={() => setSelectedGoal(emp)}
                                          className={`border p-4 rounded-xl cursor-pointer hover:shadow-lg transition-all duration-300 ${getStatusColor(emp.status)} ${selectedGoal?.id === emp.id ? 'ring-2 ring-blue-500' : ''}`}
                                        >
                                          <div className="flex items-center justify-between">
                                            <span className="text-[10px] font-bold uppercase tracking-wider bg-slate-500 text-white px-2 py-0.5 rounded">
                                              Employee Objective
                                            </span>
                                            <span className="flex items-center gap-1 text-xs">
                                              {getStatusIcon(emp.status)} {emp.status}
                                            </span>
                                          </div>
                                          <h5 className="font-bold text-sm mt-2">{emp.title}</h5>
                                          <div className="flex items-center justify-between text-xs mt-3 opacity-80">
                                            <span>Employee: {users[emp.employee_id]?.name}</span>
                                            <span>Weight: {emp.weightage}%</span>
                                          </div>
                                        </div>
                                      ))
                                    )}
                                  </motion.div>
                                )}
                              </AnimatePresence>
                            </div>
                          ))
                        )}
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Sidebar Panel for Selected Node Details & Orphan Warnings */}
        <div className="space-y-6">
          {/* Orphans Alert Panel */}
          {orphanedGoals.length > 0 && (
            <div className="bg-amber-500/10 border border-amber-500/30 p-5 rounded-2xl shadow-sm space-y-3">
              <div className="flex items-center gap-2 text-amber-500">
                <AlertTriangle className="w-5 h-5" />
                <h3 className="font-bold text-sm uppercase tracking-tight">Strategy Alignment Alert</h3>
              </div>
              <p className="text-xs text-muted-foreground">
                The following active employee goals are currently **orphaned** and do not align with any executive or departmental strategy.
              </p>
              <div className="max-h-48 overflow-y-auto space-y-2 pr-1">
                {orphanedGoals.map(og => (
                  <div key={og.id} className="bg-card border p-3 rounded-lg text-xs flex justify-between items-center">
                    <div>
                      <p className="font-bold text-foreground truncate max-w-[150px]">{og.title}</p>
                      <span className="text-[10px] text-muted-foreground">Owner: {users[og.employee_id]?.name}</span>
                    </div>
                    <span className="text-[10px] text-amber-500 font-bold bg-amber-500/10 px-2 py-0.5 rounded flex items-center gap-1">
                      <AlertCircle className="w-3 h-3" /> Orphaned
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Goal Details Viewer Card */}
          <div className="bg-card border p-6 rounded-2xl shadow-md space-y-6">
            <h2 className="text-lg font-bold tracking-tight flex items-center gap-2 border-b pb-3">
              <User2 className="w-5 h-5 text-blue-500" />
              Node Detail Panel
            </h2>

            {selectedGoal ? (
              <div className="space-y-4">
                <div>
                  <span className="text-[10px] uppercase font-bold text-muted-foreground tracking-widest block">Goal Name</span>
                  <h4 className="font-bold text-base text-foreground mt-1">{selectedGoal.title}</h4>
                </div>

                <div>
                  <span className="text-[10px] uppercase font-bold text-muted-foreground tracking-widest block">Description</span>
                  <p className="text-xs text-muted-foreground mt-1 leading-relaxed">{selectedGoal.description || "No description provided."}</p>
                </div>

                <div className="grid grid-cols-2 gap-4 border-t pt-4">
                  <div>
                    <span className="text-[10px] uppercase font-bold text-muted-foreground tracking-widest">Thrust Area</span>
                    <p className="text-xs font-bold text-foreground mt-1">{selectedGoal.thrust_area}</p>
                  </div>
                  <div>
                    <span className="text-[10px] uppercase font-bold text-muted-foreground tracking-widest">UOM Type</span>
                    <p className="text-xs font-bold text-foreground mt-1 capitalize">{selectedGoal.uom_type}</p>
                  </div>
                  <div>
                    <span className="text-[10px] uppercase font-bold text-muted-foreground tracking-widest">Progress</span>
                    <p className="text-xs font-bold text-blue-500 mt-1">{selectedGoal.progress}%</p>
                  </div>
                  <div>
                    <span className="text-[10px] uppercase font-bold text-muted-foreground tracking-widest">Target Metric</span>
                    <p className="text-xs font-bold text-foreground mt-1">{selectedGoal.target}</p>
                  </div>
                </div>

                <div className="border-t pt-4 space-y-2">
                  <span className="text-[10px] uppercase font-bold text-muted-foreground tracking-widest block">Cascade Connection</span>
                  {selectedGoal.parentGoalId ? (
                    <div className="bg-secondary/50 border p-3 rounded-lg flex items-center justify-between text-xs">
                      <div>
                        <p className="font-semibold truncate max-w-[180px]">
                          {goals.find(g => g.id === selectedGoal.parentGoalId)?.title || "Parent KPI"}
                        </p>
                        <span className="text-[10px] text-muted-foreground">Connected Objective</span>
                      </div>
                      <Network className="w-4 h-4 text-indigo-500" />
                    </div>
                  ) : (
                    <p className="text-xs text-muted-foreground italic">Root goal: Directly maps to macro executive strategy.</p>
                  )}
                </div>
              </div>
            ) : (
              <div className="text-center py-16 text-muted-foreground">
                <Target className="w-10 h-10 mx-auto text-muted-foreground/30 mb-3" />
                <p className="text-xs">Click on any goal in the cascade roadmap to examine its full audit attributes and hierarchy connections.</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default AlignmentTree;
