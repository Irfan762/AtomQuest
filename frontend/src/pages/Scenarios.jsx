import { useState, useEffect } from "react";
import api from "../lib/api";
import { useAuth } from "../context/AuthContext";
import { toast } from "sonner";
import { 
  Sliders, 
  HelpCircle, 
  Save, 
  Trash2, 
  RotateCcw, 
  LineChart, 
  ShieldAlert, 
  Workflow,
  Sparkles,
  Info
} from "lucide-react";
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  ReferenceLine
} from "recharts";
import { motion, AnimatePresence } from "framer-motion";

const Scenarios = () => {
  const { user } = useAuth();
  const [data, setData] = useState({ goals: [], users: {} });
  const [scenarios, setScenarios] = useState([]);
  const [loading, setLoading] = useState(true);

  // Simulation States
  const [simGoals, setSimGoals] = useState([]);
  const [scenarioName, setScenarioName] = useState("");
  const [scenarioDesc, setScenarioDesc] = useState("");
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    fetchBaseData();
  }, []);

  const fetchBaseData = async () => {
    try {
      const res = await api.get("/goals/alignment-tree");
      setData(res.data);
      setSimGoals(res.data.goals.map(g => ({
        ...g,
        simProgress: g.progress,
        simWeight: g.weightage
      })));
      fetchSavedScenarios();
    } catch (err) {
      toast.error("Failed to load scenario base data");
    } finally {
      setLoading(false);
    }
  };

  const fetchSavedScenarios = async () => {
    try {
      const res = await api.get("/goals/scenarios");
      setScenarios(res.data);
    } catch (err) {
      // Manager/Admin endpoints
    }
  };

  // Live Slider changes
  const handleProgressSlider = (goalId, value) => {
    setSimGoals(prev => prev.map(g => {
      if (g.id === goalId) {
        return { ...g, simProgress: Number(value) };
      }
      return g;
    }));
  };

  const handleWeightSlider = (goalId, value) => {
    setSimGoals(prev => prev.map(g => {
      if (g.id === goalId) {
        return { ...g, simWeight: Number(value) };
      }
      return g;
    }));
  };

  const resetSimulation = () => {
    setSimGoals(data.goals.map(g => ({
      ...g,
      simProgress: g.progress,
      simWeight: g.weightage
    })));
    toast.success("Simulation parameters reset to live database levels");
  };

  const getSimulatedStats = () => {
    if (simGoals.length === 0) return { overallScore: 0, deptAverages: {}, empSimScore: {} };

    // Group goals by employee
    const empGoals = {};
    simGoals.forEach(g => {
      if (!empGoals[g.employee_id]) empGoals[g.employee_id] = [];
      empGoals[g.employee_id].push(g);
    });

    // Calculate simulated score for each employee
    const empSimScore = {};
    Object.entries(empGoals).forEach(([eid, plist]) => {
      const totalWeight = plist.reduce((s, p) => s + p.simWeight, 0);
      const weightedScore = plist.reduce((s, p) => s + (p.simProgress * (p.simWeight / 100)), 0);
      empSimScore[eid] = {
        score: totalWeight > 0 ? Math.round((weightedScore * 100) / totalWeight) : 0,
        weightExceeded: totalWeight > 100,
        totalWeight
      };
    });

    // Department grouping
    const deptTotals = {};
    simGoals.forEach(g => {
      const dept = data.users[g.employee_id]?.department || "Core Operations";
      if (!deptTotals[dept]) deptTotals[dept] = { sum: 0, count: 0 };
      deptTotals[dept].sum += g.simProgress;
      deptTotals[dept].count += 1;
    });

    const deptAverages = {};
    Object.entries(deptTotals).forEach(([d, totals]) => {
      deptAverages[d] = Math.round(totals.sum / totals.count);
    });

    // Overall Organization Score
    const totalGoalsCount = simGoals.length;
    const overallScore = totalGoalsCount 
      ? Math.round(simGoals.reduce((s, g) => s + g.simProgress, 0) / totalGoalsCount)
      : 0;

    return {
      overallScore,
      deptAverages,
      empSimScore
    };
  };

  const simStats = getSimulatedStats();

  const handleSaveScenario = async () => {
    if (!scenarioName.trim()) {
      toast.error("Please enter a Scenario snapshot name");
      return;
    }
    setSaving(true);
    try {
      const sliders = simGoals.map(g => ({
        goal_id: g.id,
        progress: g.simProgress,
        weightage: g.simWeight
      }));

      await api.post("/goals/scenarios", {
        name: scenarioName,
        description: scenarioDesc,
        sliders,
        dept_impact: Object.values(simStats.deptAverages)[0] || 0,
        org_impact: simStats.overallScore
      });

      toast.success("Scenario snapshot saved successfully!");
      setScenarioName("");
      setScenarioDesc("");
      fetchSavedScenarios();
    } catch (err) {
      toast.error("Failed to save scenario configuration");
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteScenario = async (id) => {
    try {
      await api.delete(`/goals/scenarios/${id}`);
      toast.success("Scenario deleted");
      fetchSavedScenarios();
    } catch (err) {
      toast.error("Failed to delete scenario");
    }
  };

  const loadScenarioSnapshot = (sc) => {
    const sliderMap = Object.fromEntries(sc.sliders.map(s => [s.goal_id, s]));
    setSimGoals(prev => prev.map(g => {
      const match = sliderMap[g.id];
      if (match) {
        return {
          ...g,
          simProgress: match.progress,
          simWeight: match.weightage
        };
      }
      return g;
    }));
    toast.success(`Loaded simulation snapshot: "${sc.name}"`);
  };

  // Recharts Chart Data
  const chartData = Object.entries(simStats.deptAverages).map(([dept, avg]) => ({
    name: dept,
    Simulated_Score: avg,
    Target: 80
  }));

  // Identify high capacity rebalance weight warnings
  const weightageWarnings = Object.entries(simStats.empSimScore).filter(([_, info]) => info.totalWeight !== 100);

  return (
    <div className="space-y-8 max-w-7xl mx-auto">
      {/* Page Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-card border border-border p-6 rounded-2xl shadow-xl">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <div className="p-2 bg-indigo-600/10 text-indigo-500 rounded-lg">
              <Sliders className="w-6 h-6" />
            </div>
            <h1 className="text-2xl font-bold tracking-tight">Strategic What-If Scenario Simulator</h1>
          </div>
          <p className="text-muted-foreground text-sm">
            Model performance outputs, adjust goal weightages in real-time, and simulate departmental capacity drop-offs.
          </p>
        </div>

        {/* Action Controls */}
        <div className="flex items-center gap-3">
          <button
            onClick={resetSimulation}
            className="flex items-center gap-1.5 px-4 py-2 bg-secondary text-foreground text-xs font-bold rounded-xl hover:bg-secondary/80 border transition-all"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            Reset sliders
          </button>
        </div>
      </div>

      {/* Live Graph & Simulator Results Summary */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Sliders Control Panel */}
        <div className="bg-card border p-6 rounded-2xl shadow-md lg:col-span-2 space-y-6">
          <h2 className="text-base font-bold tracking-tight flex items-center gap-2 border-b pb-3">
            <Workflow className="w-5 h-5 text-blue-500" />
            Active Parameter Sliders
          </h2>

          <div className="space-y-6 max-h-[550px] overflow-y-auto pr-2">
            {simGoals.map(g => (
              <div key={g.id} className="border p-4 rounded-xl space-y-4 bg-secondary/10">
                <div className="flex justify-between items-start">
                  <div>
                    <h4 className="font-bold text-xs text-foreground leading-snug">{g.title}</h4>
                    <span className="text-[10px] text-muted-foreground">Owner: {data.users[g.employee_id]?.name || "Team Member"}</span>
                  </div>
                  <span className="text-[9px] uppercase font-extrabold tracking-wider bg-card px-2 py-0.5 rounded border border-border">
                    {data.users[g.employee_id]?.department || "Engineering"}
                  </span>
                </div>

                {/* Progress Achievement Slider */}
                <div className="space-y-2">
                  <div className="flex justify-between items-center text-[10px] font-medium text-muted-foreground">
                    <span>Simulated Goal Achievement Rate:</span>
                    <span className="font-bold text-blue-500">{g.simProgress}%</span>
                  </div>
                  <input
                    type="range"
                    min="0"
                    max="100"
                    value={g.simProgress}
                    onChange={(e) => handleProgressSlider(g.id, e.target.value)}
                    className="w-full h-1.5 bg-secondary rounded-lg appearance-none cursor-pointer accent-blue-600 outline-none"
                  />
                </div>

                {/* Weightage Slider */}
                <div className="space-y-2">
                  <div className="flex justify-between items-center text-[10px] font-medium text-muted-foreground">
                    <span>Simulated Weightage allocation:</span>
                    <span className="font-bold text-indigo-500">{g.simWeight}%</span>
                  </div>
                  <input
                    type="range"
                    min="10"
                    max="100"
                    value={g.simWeight}
                    onChange={(e) => handleWeightSlider(g.id, e.target.value)}
                    className="w-full h-1.5 bg-secondary rounded-lg appearance-none cursor-pointer accent-indigo-600 outline-none"
                  />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Real-time Recalculation Results */}
        <div className="space-y-6">
          {/* Simulated Metrics Card */}
          <div className="bg-card border p-6 rounded-2xl shadow-md space-y-6">
            <h2 className="text-base font-bold tracking-tight flex items-center gap-2 border-b pb-3">
              <LineChart className="w-5 h-5 text-blue-500" />
              Live Impact Computations
            </h2>

            {/* Recalculated Score Dial */}
            <div className="flex items-center justify-between p-4 bg-secondary/50 border rounded-xl">
              <div>
                <span className="text-3xl font-extrabold text-blue-500">{simStats.overallScore}%</span>
                <p className="text-[9px] uppercase font-bold text-muted-foreground mt-1">Simulated Org Index</p>
              </div>
              <div className="h-10 w-[1px] bg-border" />
              <div>
                <span className="text-lg font-bold text-foreground">
                  {Math.round(simStats.overallScore - (data.goals.reduce((s,g)=>s+g.progress,0)/data.goals.length || 0))}%
                </span>
                <p className="text-[9px] uppercase font-bold text-muted-foreground mt-1">Delta Variance</p>
              </div>
            </div>

            {/* Live Chart */}
            <div className="h-44 w-full">
              {chartData.length > 0 ? (
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={chartData}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} opacity={0.15} />
                    <XAxis dataKey="name" stroke="#888888" fontSize={9} tickLine={false} />
                    <YAxis stroke="#888888" fontSize={9} tickLine={false} />
                    <Tooltip />
                    <Bar dataKey="Simulated_Score" fill="#3b82f6" radius={[4, 4, 0, 0]} />
                    <ReferenceLine y={80} stroke="#ef4444" strokeDasharray="3 3" />
                  </BarChart>
                </ResponsiveContainer>
              ) : (
                <div className="h-full flex items-center justify-center text-xs text-muted-foreground italic">No chart data compiled.</div>
              )}
            </div>
          </div>

          {/* Weightage Rebalancing Alerts */}
          {weightageWarnings.length > 0 && (
            <div className="bg-amber-500/10 border border-amber-500/30 p-5 rounded-2xl shadow-sm space-y-2">
              <div className="flex items-center gap-2 text-amber-500">
                <ShieldAlert className="w-5 h-5" />
                <h3 className="font-bold text-xs uppercase tracking-tight">Weightage Balance Alert</h3>
              </div>
              <p className="text-[10px] text-muted-foreground">
                The following team members have simulated weightage allocations that **deviate from 100%**, making them deployment-invalid:
              </p>
              <div className="space-y-1.5">
                {weightageWarnings.map(([eid, info]) => (
                  <div key={eid} className="text-[10px] bg-card border p-2.5 rounded-lg flex justify-between">
                    <span className="font-semibold">{data.users[eid]?.name}</span>
                    <span className="font-bold text-amber-500">{info.totalWeight}% / 100%</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Save Snapshot Card */}
          <div className="bg-card border p-6 rounded-2xl shadow-md space-y-4">
            <h3 className="text-sm font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-1.5 border-b pb-3">
              <Sparkles className="w-4 h-4 text-blue-500" />
              Save Scenario Snapshot
            </h3>

            <div className="space-y-3">
              <input
                type="text"
                placeholder="Scenario Name (e.g. Q4 Best Case)"
                value={scenarioName}
                onChange={(e) => setScenarioName(e.target.value)}
                className="w-full bg-secondary border border-border text-xs rounded-xl px-3 py-2 outline-none focus:ring-1 focus:ring-blue-500"
              />
              <textarea
                placeholder="Scenario Description / Rationale"
                value={scenarioDesc}
                onChange={(e) => setScenarioDesc(e.target.value)}
                rows={2}
                className="w-full bg-secondary border border-border text-xs rounded-xl px-3 py-2 outline-none focus:ring-1 focus:ring-blue-500 resize-none"
              />
              <button
                onClick={handleSaveScenario}
                disabled={saving}
                className="w-full flex items-center justify-center gap-1.5 py-2 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs rounded-xl transition-all shadow-md shadow-blue-600/10"
              >
                <Save className="w-4 h-4" />
                {saving ? "Saving Snapshot..." : "Save Simulator Snapshot"}
              </button>
            </div>
          </div>

          {/* Snapshot History Ledger */}
          <div className="bg-card border p-6 rounded-2xl shadow-md space-y-4">
            <h3 className="text-sm font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-1.5 border-b pb-3">
              <Info className="w-4 h-4 text-indigo-500" />
              Saved Snapshot Ledger ({scenarios.length})
            </h3>

            {scenarios.length === 0 ? (
              <div className="text-center py-6 text-muted-foreground text-xs italic">No pre-saved scenarios logged.</div>
            ) : (
              <div className="space-y-3 max-h-48 overflow-y-auto pr-1">
                {scenarios.map(sc => (
                  <div key={sc.id} className="border p-3 rounded-lg bg-secondary/20 flex items-center justify-between gap-2 text-xs">
                    <div 
                      onClick={() => loadScenarioSnapshot(sc)}
                      className="cursor-pointer flex-1 overflow-hidden"
                    >
                      <p className="font-bold text-foreground truncate">{sc.name}</p>
                      <p className="text-[9px] text-muted-foreground truncate">{sc.description || "Interactive simulated outcome"}</p>
                      <span className="text-[8px] bg-blue-500/15 text-blue-500 font-extrabold uppercase px-1.5 py-0.5 rounded border border-blue-500/20 mt-1 inline-block">
                        Org Impact: {sc.org_impact}%
                      </span>
                    </div>
                    <button 
                      onClick={() => handleDeleteScenario(sc.id)}
                      className="p-1 hover:bg-rose-500/10 text-rose-500 rounded transition-colors"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
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

export default Scenarios;
