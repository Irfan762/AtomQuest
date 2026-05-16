import { useState, useEffect } from "react";
import api, { API_BASE } from "../lib/api";
import { Button } from "../components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "../components/ui/card";
import { Badge } from "../components/ui/badge";
import { Input } from "../components/ui/input";
import { 
  Plus, Target, Clock, Lock, ShieldCheck, AlertTriangle, 
  Trash2, Pencil, Send, Download, ChevronRight, Search, Filter
} from "lucide-react";
import { toast } from "sonner";
import { format } from "date-fns";
import AISmartAssistant from "../components/AISmartAssistant";
import { useAuth } from "../context/AuthContext";

const Goals = () => {
  const [goals, setGoals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [search, setSearch] = useState("");
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    thrust_area: "",
    uom_type: "numeric",
    target: "",
    weightage: "",
    deadline: "",
    progress_direction: "max"
  });

  useEffect(() => {
    fetchGoals();
  }, []);

  const fetchGoals = async () => {
    try {
      const { data } = await api.get("/goals");
      setGoals(data);
    } catch (err) {
      toast.error("Failed to fetch goals");
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await api.post("/goals", formData);
      toast.success("Goal created successfully");
      setShowModal(false);
      fetchGoals();
      setFormData({
        title: "", description: "", thrust_area: "", uom_type: "numeric",
        target: "", weightage: "", deadline: "", progress_direction: "max"
      });
    } catch (err) {
      toast.error(err.response?.data?.detail || "Failed to create goal");
    }
  };
  
  const handleAIApply = (newTitle, newDesc) => {
    setFormData(prev => ({ ...prev, title: newTitle, description: newDesc }));
    toast.success("AI optimization applied!");
  };

  const submitForApproval = async (id) => {
    try {
      await api.post(`/goals/${id}/submit`);
      toast.success("Goal submitted for approval");
      fetchGoals();
    } catch (err) {
      toast.error(err.response?.data?.detail || "Failed to submit goal");
    }
  };

  const deleteGoal = async (id) => {
    if (!window.confirm("Are you sure you want to delete this goal?")) return;
    try {
      await api.delete(`/goals/${id}`);
      toast.success("Goal deleted");
      fetchGoals();
    } catch (err) {
      toast.error(err.response?.data?.detail || "Failed to delete goal");
    }
  };

  const unlockGoal = async (id) => {
    if (!window.confirm("Admin: Unlock this goal? It will move back to draft status.")) return;
    try {
      await api.post(`/admin/unlock/${id}`);
      toast.success("Goal unlocked");
      fetchGoals();
    } catch (err) {
      toast.error(err.response?.data?.detail || "Failed to unlock goal");
    }
  };

  const totalWeight = goals.reduce((s, g) => s + (g.approval_status !== "rejected" ? g.weightage : 0), 0);

  const filteredGoals = goals.filter(g => 
    g.title.toLowerCase().includes(search.toLowerCase()) || 
    g.thrust_area.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-8 max-w-7xl mx-auto">
      <div className="flex items-end justify-between flex-wrap gap-4">
        <div>
          <h1 className="text-3xl font-heading font-bold tracking-tighter">My Goals</h1>
          <p className="text-muted-foreground">Manage your performance objectives and OKRs.</p>
        </div>
        <div className="flex items-center gap-3">
           <div className="flex items-center gap-2 px-3 py-2 bg-secondary/50 rounded-lg">
             <span className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Total Weight:</span>
             <span className={`text-sm font-bold font-mono ${totalWeight === 100 ? "text-emerald-500" : "text-amber-500"}`}>
               {totalWeight}%
             </span>
           </div>
           <div className="flex gap-2">
             <a href={`${API_BASE}/export/goals.csv`} target="_blank" rel="noreferrer">
                <Button variant="outline" size="sm" className="gap-2"><Download className="w-4 h-4" /> CSV</Button>
             </a>
             <Button size="sm" className="gap-2" onClick={() => setShowModal(true)}>
               <Plus className="w-4 h-4" /> New Goal
             </Button>
           </div>
        </div>
      </div>

      <div className="flex items-center gap-4 bg-card p-4 rounded-xl border shadow-sm">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input 
            placeholder="Search by title or thrust area..." 
            className="pl-10 glass border-primary/20 focus:border-primary/50 focus:ring-1 focus:ring-primary/20" 
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        <Button variant="outline" size="icon"><Filter className="w-4 h-4" /></Button>
      </div>

      {loading ? (
        <div className="text-center py-12">Loading goals...</div>
      ) : filteredGoals.length === 0 ? (
        <div className="text-center py-20 bg-secondary/10 rounded-2xl border-2 border-dashed border-border/50">
          <div className="p-4 bg-secondary rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4 text-muted-foreground">
            <Target className="w-8 h-8" />
          </div>
          <h3 className="text-lg font-medium">No goals found</h3>
          <p className="text-muted-foreground text-sm max-w-xs mx-auto mt-1">Start by creating your first performance goal to track your progress.</p>
          <Button className="mt-6" onClick={() => setShowModal(true)}>Create First Goal</Button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredGoals.map((goal) => (
            <Card key={goal.id} className="glass group hover:border-primary/50 transition-all duration-300">
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between">
                  <div className="space-y-1">
                    <Badge variant="outline" className="text-[10px] uppercase font-bold tracking-wider mb-2">
                      {goal.thrust_area}
                    </Badge>
                    <CardTitle className="text-lg group-hover:text-primary transition-colors line-clamp-1">{goal.title}</CardTitle>
                  </div>
                  {goal.locked ? (
                    <Lock className="w-4 h-4 text-muted-foreground" />
                  ) : (
                    <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                      {useAuth().user?.role === "admin" && (
                        <Button variant="ghost" size="icon" className="h-8 w-8 text-amber-500" onClick={() => unlockGoal(goal.id)}>
                          <Lock className="w-3 h-3" />
                        </Button>
                      )}
                      <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => toast.info("Edit feature coming soon")}>
                        <Pencil className="w-3 h-3" />
                      </Button>
                      <Button variant="ghost" size="icon" className="h-8 w-8 text-destructive" onClick={() => deleteGoal(goal.id)}>
                        <Trash2 className="w-3 h-3" />
                      </Button>
                    </div>
                  )}
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                   <div className="flex justify-between text-xs mb-1">
                     <span className="text-muted-foreground font-medium">Progress</span>
                     <span className="font-bold">{goal.progress}%</span>
                   </div>
                   <div className="w-full h-2 bg-secondary rounded-full overflow-hidden">
                     <div 
                      className="h-full bg-primary transition-all duration-500" 
                      style={{ width: `${goal.progress}%` }} 
                     />
                   </div>
                </div>

                <div className="grid grid-cols-2 gap-4 py-3 border-y border-border/50">
                  <div>
                    <div className="text-[10px] text-muted-foreground uppercase font-bold tracking-wider">Weightage</div>
                    <div className="text-sm font-bold font-mono">{goal.weightage}%</div>
                  </div>
                  <div>
                    <div className="text-[10px] text-muted-foreground uppercase font-bold tracking-wider">Target</div>
                    <div className="text-sm font-bold font-mono">{goal.target}</div>
                  </div>
                </div>

                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                    <Clock className="w-3.5 h-3.5" />
                    {format(new Date(goal.deadline), "MMM dd, yyyy")}
                  </div>
                  <Badge 
                    variant={
                      goal.approval_status === "approved" ? "default" : 
                      goal.approval_status === "submitted" ? "secondary" : 
                      goal.approval_status === "rejected" ? "destructive" : "outline"
                    }
                    className="text-[10px] capitalize"
                  >
                    {goal.approval_status}
                  </Badge>
                </div>

                {goal.approval_status === "draft" && (
                   <Button className="w-full mt-4 gap-2" size="sm" onClick={() => submitForApproval(goal.id)}>
                     <Send className="w-3.5 h-3.5" /> Submit for Approval
                   </Button>
                )}
                
                {goal.approval_status === "approved" && (
                  <div className="flex items-center gap-2 mt-4 text-[10px] text-emerald-500 font-medium bg-emerald-500/10 p-2 rounded-lg">
                    <ShieldCheck className="w-3.5 h-3.5" />
                    Goal approved and locked for tracking
                  </div>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Goal Creation Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm transition-all duration-300">
           <Card className="w-full max-w-2xl shadow-2xl fade-in overflow-y-auto max-h-[90vh]">
             <CardHeader>
               <CardTitle>Create New Goal</CardTitle>
               <CardDescription>Define a new performance objective for this year.</CardDescription>
             </CardHeader>
             <CardContent>
               <div className="grid grid-cols-1 lg:grid-cols-5 gap-8">
                 <form onSubmit={handleSubmit} className="lg:col-span-3 space-y-6">
                   <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                     <div className="space-y-2 md:col-span-2">
                       <label className="text-sm font-medium">Goal Title</label>
                       <Input 
                        placeholder="e.g. Increase sales conversion by 15%" 
                        value={formData.title}
                        onChange={(e) => setFormData({...formData, title: e.target.value})}
                        required
                       />
                     </div>
                     <div className="space-y-2 md:col-span-2">
                       <label className="text-sm font-medium">Description</label>
                       <textarea 
                        className="flex min-h-[80px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                        placeholder="Detail the actions and expectations..."
                        value={formData.description}
                        onChange={(e) => setFormData({...formData, description: e.target.value})}
                       />
                     </div>
                     <div className="space-y-2">
                       <label className="text-sm font-medium">Thrust Area</label>
                       <Input 
                        placeholder="e.g. Business Growth" 
                        value={formData.thrust_area}
                        onChange={(e) => setFormData({...formData, thrust_area: e.target.value})}
                        required
                       />
                     </div>
                     <div className="space-y-2">
                       <label className="text-sm font-medium">Unit of Measure (UoM)</label>
                       <select 
                          className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                          value={formData.uom_type}
                          onChange={(e) => setFormData({...formData, uom_type: e.target.value})}
                        >
                          <option value="numeric">Numeric</option>
                          <option value="percentage">Percentage</option>
                          <option value="timeline">Timeline</option>
                          <option value="zero">Zero-based</option>
                        </select>
                     </div>
                     <div className="space-y-2">
                       <label className="text-sm font-medium">Target Value</label>
                       <Input 
                        type="number" 
                        placeholder="0" 
                        value={formData.target}
                        onChange={(e) => setFormData({...formData, target: e.target.value})}
                        required
                       />
                     </div>
                     <div className="space-y-2">
                       <label className="text-sm font-medium">Weightage (%)</label>
                       <Input 
                        type="number" 
                        placeholder="10-100" 
                        min="10"
                        max="100"
                        value={formData.weightage}
                        onChange={(e) => setFormData({...formData, weightage: e.target.value})}
                        required
                       />
                     </div>
                     <div className="space-y-2">
                       <label className="text-sm font-medium">Deadline</label>
                       <Input 
                        type="date" 
                        value={formData.deadline}
                        onChange={(e) => setFormData({...formData, deadline: e.target.value})}
                        required
                       />
                     </div>
                     <div className="space-y-2">
                       <label className="text-sm font-medium">Progress Direction</label>
                       <select 
                          className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                          value={formData.progress_direction}
                          onChange={(e) => setFormData({...formData, progress_direction: e.target.value})}
                        >
                          <option value="max">Maximize (Target is floor)</option>
                          <option value="min">Minimize (Target is ceiling)</option>
                        </select>
                     </div>
                   </div>
                   <div className="flex gap-3 pt-4 justify-end">
                      <Button type="button" variant="ghost" onClick={() => setShowModal(false)}>Cancel</Button>
                      <Button type="submit">Create Goal</Button>
                   </div>
                 </form>

                 <div className="lg:col-span-2 border-l border-white/10 pl-8">
                    <AISmartAssistant 
                      title={formData.title} 
                      description={formData.description} 
                      onApply={handleAIApply} 
                    />
                 </div>
               </div>
             </CardContent>
           </Card>
        </div>
      )}
    </div>
  );
};

export default Goals;
