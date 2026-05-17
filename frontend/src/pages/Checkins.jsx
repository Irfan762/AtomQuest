import { useState, useEffect } from "react";
import api from "../lib/api";
import { Button } from "../components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "../components/ui/card";
import { Badge } from "../components/ui/badge";
import { Input } from "../components/ui/input";
import { 
  Calendar, CheckCircle2, AlertTriangle, Clock, 
  MessageSquare, History, ArrowRight, Save
} from "lucide-react";
import { toast } from "sonner";

const Checkins = () => {
  const [goals, setGoals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedGoal, setSelectedGoal] = useState(null);
  const [formData, setFormData] = useState({
    quarter: "Q1",
    planned: "",
    achieved: "",
    status: "On Track",
    mood: "confident",
    comments: ""
  });

  useEffect(() => {
    fetchGoals();
  }, []);

  const fetchGoals = async () => {
    try {
      const { data } = await api.get("/goals");
      // Only check-in to approved goals
      const approved = data.filter(g => g.approval_status === "approved");
      setGoals(approved);
      if (approved.length > 0 && !selectedGoal) {
        setSelectedGoal(approved[0]);
      }
    } catch (err) {
      toast.error("Failed to fetch goals");
    } finally {
      setLoading(false);
    }
  };

  const handleGoalSelect = (goal) => {
    setSelectedGoal(goal);
    // Try to find if there's already an update for current quarter
    const existing = (goal.quarterly_updates || []).find(u => u.quarter === formData.quarter);
    if (existing) {
      setFormData({
        quarter: formData.quarter,
        planned: existing.planned,
        achieved: existing.achieved,
        status: existing.status,
        mood: existing.mood || "confident",
        comments: existing.comments
      });
    } else {
      setFormData({
        quarter: formData.quarter,
        planned: "",
        achieved: "",
        status: "On Track",
        mood: "confident",
        comments: ""
      });
    }
  };

  const handleQuarterChange = (q) => {
    setFormData({ ...formData, quarter: q });
    if (selectedGoal) {
      const existing = (selectedGoal.quarterly_updates || []).find(u => u.quarter === q);
      if (existing) {
        setFormData(prev => ({
          ...prev,
          planned: existing.planned,
          achieved: existing.achieved,
          status: existing.status,
          mood: existing.mood || "confident",
          comments: existing.comments
        }));
      } else {
        setFormData(prev => ({
          ...prev,
          planned: "",
          achieved: "",
          status: "On Track",
          mood: "confident",
          comments: ""
        }));
      }
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!selectedGoal) return;
    try {
      await api.post(`/checkins/${selectedGoal.id}`, formData);
      toast.success("Check-in submitted successfully");
      fetchGoals();
    } catch (err) {
      toast.error(err.response?.data?.detail || "Failed to submit check-in");
    }
  };

  return (
    <div className="space-y-8 max-w-7xl mx-auto">
      <div>
        <h1 className="text-3xl font-heading font-bold tracking-tighter">Quarterly Check-ins</h1>
        <p className="text-muted-foreground">Log your progress and updates for each quarter.</p>
      </div>

      {loading ? (
        <div className="text-center py-12">Loading check-ins...</div>
      ) : goals.length === 0 ? (
        <Card className="bg-secondary/20 border-dashed py-12 text-center">
          <div className="p-4 bg-secondary rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4 text-muted-foreground">
            <Clock className="w-8 h-8" />
          </div>
          <h3 className="text-lg font-medium">No approved goals</h3>
          <p className="text-muted-foreground text-sm">You can only perform check-ins for goals that have been approved by your manager.</p>
        </Card>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Goals Selection List */}
          <div className="space-y-4">
            <h3 className="text-sm font-bold uppercase tracking-wider text-muted-foreground">Select Goal</h3>
            <div className="space-y-2">
              {goals.map((goal) => (
                <div 
                  key={goal.id}
                  onClick={() => handleGoalSelect(goal)}
                  className={`p-4 rounded-xl border transition-all cursor-pointer hover:shadow-md ${
                    selectedGoal?.id === goal.id ? "bg-primary text-primary-foreground border-primary" : "bg-card hover:bg-secondary/50"
                  }`}
                >
                  <div className="text-xs font-bold uppercase tracking-widest opacity-70 mb-1">{goal.thrust_area}</div>
                  <div className="text-sm font-bold truncate">{goal.title}</div>
                  <div className="mt-3 flex items-center justify-between">
                     <div className="text-[10px] font-mono opacity-80">Progress: {goal.progress}%</div>
                     <ArrowRight className="w-3 h-3" />
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Check-in Form */}
          <div className="lg:col-span-2 space-y-6">
            {selectedGoal && (
              <div className="space-y-6 fade-in">
                <Card className="glass">
                  <CardHeader>
                    <div className="flex items-center gap-2 mb-2">
                      <Badge variant="outline">{selectedGoal.uom_type}</Badge>
                      <Badge variant="secondary">Target: {selectedGoal.target}</Badge>
                    </div>
                    <CardTitle>{selectedGoal.title}</CardTitle>
                    <CardDescription>{selectedGoal.description}</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <form onSubmit={handleSubmit} className="space-y-6">
                       <div className="flex gap-2">
                          {["Q1", "Q2", "Q3", "Q4"].map(q => (
                            <Button 
                              key={q} 
                              type="button"
                              variant={formData.quarter === q ? "default" : "outline"}
                              size="sm"
                              className="flex-1"
                              onClick={() => handleQuarterChange(q)}
                            >
                              {q}
                            </Button>
                          ))}
                       </div>

                       <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                          <div className="space-y-2">
                            <label className="text-sm font-medium">Planned for {formData.quarter}</label>
                            <Input 
                              type="number" 
                              placeholder="0" 
                              value={formData.planned}
                              onChange={(e) => setFormData({...formData, planned: e.target.value})}
                              required
                            />
                          </div>
                          <div className="space-y-2">
                            <label className="text-sm font-medium">Achieved in {formData.quarter}</label>
                            <Input 
                              type="number" 
                              placeholder="0" 
                              value={formData.achieved}
                              onChange={(e) => setFormData({...formData, achieved: e.target.value})}
                              required
                            />
                          </div>
                          <div className="space-y-2 md:col-span-2">
                            <label className="text-sm font-medium">Status</label>
                            <select 
                              className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                              value={formData.status}
                              onChange={(e) => setFormData({...formData, status: e.target.value})}
                            >
                              <option value="Not Started">Not Started</option>
                              <option value="On Track">On Track</option>
                              <option value="At Risk">At Risk</option>
                              <option value="Completed">Completed</option>
                            </select>
                          </div>

                          {/* Wellbeing Pulse Selector */}
                          <div className="space-y-2 md:col-span-2">
                            <label className="text-sm font-medium">Wellbeing Mood Indicator (Pulse)</label>
                            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                              {[
                                { value: "confident", emoji: "😊", label: "Confident" },
                                { value: "challenged", emoji: "😐", label: "Challenged" },
                                { value: "struggling", emoji: "😰", label: "Struggling" },
                                { value: "blocked", emoji: "🚨", label: "Blocked" }
                              ].map(item => (
                                <button
                                  key={item.value}
                                  type="button"
                                  onClick={() => setFormData({ ...formData, mood: item.value })}
                                  className={`flex flex-col items-center justify-center p-3 rounded-xl border transition-all hover:scale-105 cursor-pointer ${
                                    formData.mood === item.value 
                                      ? "bg-rose-500/10 border-rose-500 text-rose-500 font-bold scale-105" 
                                      : "bg-secondary/40 hover:bg-secondary border-border/50 text-muted-foreground"
                                  }`}
                                >
                                  <span className="text-2xl mb-1">{item.emoji}</span>
                                  <span className="text-[10px] tracking-tight">{item.label}</span>
                                </button>
                              ))}
                            </div>
                          </div>

                          <div className="space-y-2 md:col-span-2">
                            <label className="text-sm font-medium">Comments</label>
                            <textarea 
                              className="flex min-h-[80px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                              placeholder="Briefly describe the progress or roadblocks..."
                              value={formData.comments}
                              onChange={(e) => setFormData({...formData, comments: e.target.value})}
                            />
                          </div>
                       </div>
                       <Button type="submit" className="w-full gap-2">
                         <Save className="w-4 h-4" /> Save Check-in
                       </Button>
                    </form>
                  </CardContent>
                </Card>

                {/* History Section */}
                <Card className="glass">
                  <CardHeader>
                    <CardTitle className="text-lg flex items-center gap-2">
                      <History className="w-5 h-5 text-muted-foreground" /> Check-in History
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="p-0">
                    <div className="divide-y divide-border/50">
                      {selectedGoal.quarterly_updates && selectedGoal.quarterly_updates.length > 0 ? (
                        [...selectedGoal.quarterly_updates].sort((a, b) => b.quarter.localeCompare(a.quarter)).map((u) => (
                          <div key={u.quarter} className="p-4 flex items-start justify-between">
                             <div className="space-y-1">
                               <div className="flex items-center gap-2">
                                 <span className="font-bold">{u.quarter} Update</span>
                                 <Badge variant="outline" className="text-[10px]">{u.status}</Badge>
                                 {u.mood && (
                                   <Badge variant="secondary" className="text-[10px] flex items-center gap-1">
                                     {u.mood === 'confident' && '😊 Confident'}
                                     {u.mood === 'challenged' && '😐 Challenged'}
                                     {u.mood === 'struggling' && '😰 Struggling'}
                                     {u.mood === 'blocked' && '🚨 Blocked'}
                                   </Badge>
                                 )}
                               </div>
                               <p className="text-xs text-muted-foreground">{u.comments || "No comments."}</p>
                               {u.manager_comments && (
                                 <div className="mt-2 text-[10px] bg-primary/5 p-2 rounded border border-primary/10">
                                   <span className="font-bold text-primary uppercase mr-1">Manager:</span> {u.manager_comments}
                                 </div>
                               )}
                             </div>
                             <div className="text-right">
                               <div className="text-xs font-mono font-bold">{u.achieved} / {u.planned}</div>
                               <div className="text-[10px] text-muted-foreground uppercase tracking-widest">Achieved / Planned</div>
                             </div>
                          </div>
                        ))
                      ) : (
                        <div className="p-8 text-center text-sm text-muted-foreground italic">No history available for this goal.</div>
                      )}
                    </div>
                  </CardContent>
                </Card>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default Checkins;
