import { useState, useEffect } from "react";
import api from "../lib/api";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "../components/ui/card";
import { Badge } from "../components/ui/badge";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { 
  Users, ChevronRight, Target, Clock, MessageSquare, 
  Search, ArrowLeft, Send, CheckCircle2, Sparkles, AlertCircle
} from "lucide-react";
import { toast } from "sonner";
import { format } from "date-fns";

const TeamPerformance = () => {
  const [team, setTeam] = useState([]);
  const [selectedUser, setSelectedUser] = useState(null);
  const [userGoals, setUserGoals] = useState([]);
  const [selectedGoal, setSelectedGoal] = useState(null);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [commentText, setCommentText] = useState("");
  const [commentingQuarter, setCommentingQuarter] = useState(null);
  const [aiReview, setAiReview] = useState(null);
  const [loadingReview, setLoadingReview] = useState(false);

  useEffect(() => {
    fetchTeam();
  }, []);

  const handleGenerateReview = async () => {
    if (!selectedUser) return;
    setLoadingReview(true);
    try {
      const { data } = await api.get(`/ai/review/${selectedUser.employee_id}`);
      setAiReview(data);
      toast.success("AI Performance Review generated!");
    } catch (err) {
      toast.error("Failed to generate AI review");
    } finally {
      setLoadingReview(false);
    }
  };

  const fetchTeam = async () => {
    try {
      const { data } = await api.get("/analytics/dashboard");
      setTeam(data.team_performance || []);
    } catch (err) {
      toast.error("Failed to fetch team data");
    } finally {
      setLoading(false);
    }
  };

  const fetchUserGoals = async (user_id) => {
    try {
      const { data } = await api.get(`/goals?employee_id=${user_id}`);
      setUserGoals(data);
    } catch (err) {
      toast.error("Failed to fetch user goals");
    }
  };

  const handleUserClick = (member) => {
    setSelectedUser(member);
    fetchUserGoals(member.employee_id);
    setSelectedGoal(null);
    setAiReview(null);
  };

  const handleGoalClick = (goal) => {
    setSelectedGoal(goal);
    setCommentingQuarter(null);
    setCommentText("");
  };

  const handleAddComment = async (quarter) => {
    if (!commentText.trim()) return;
    try {
      await api.post(`/checkins/${selectedGoal.id}/comment`, {
        quarter,
        comment: commentText
      });
      toast.success("Comment added successfully");
      setCommentingQuarter(null);
      setCommentText("");
      // Refresh goal data
      const { data } = await api.get(`/goals?employee_id=${selectedUser.employee_id}`);
      setUserGoals(data);
      const updatedGoal = data.find(g => g.id === selectedGoal.id);
      setSelectedGoal(updatedGoal);
    } catch (err) {
      toast.error(err.response?.data?.detail || "Failed to add comment");
    }
  };

  const filteredTeam = team.filter(m => 
    m.name.toLowerCase().includes(search.toLowerCase()) || 
    m.department.toLowerCase().includes(search.toLowerCase())
  );

  if (loading) return <div className="h-full flex items-center justify-center">Loading team performance...</div>;

  return (
    <div className="space-y-8 max-w-7xl mx-auto">
      <div className="flex items-center gap-4">
        {selectedUser && (
          <Button variant="ghost" size="icon" onClick={() => setSelectedUser(null)}>
            <ArrowLeft className="w-5 h-5" />
          </Button>
        )}
        <div>
          <h1 className="text-3xl font-heading font-bold tracking-tighter">
            {selectedUser ? `${selectedUser.name}'s Goals` : "Team Performance"}
          </h1>
          <p className="text-muted-foreground">
            {selectedUser ? `Review and feedback on objectives for ${selectedUser.name}.` : "Monitor team progress and provide quarterly feedback."}
          </p>
        </div>
      </div>

      {!selectedUser ? (
        <>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input 
              placeholder="Filter team members by name or department..." 
              className="pl-10 glass border-primary/20 focus:border-primary/50 focus:ring-1 focus:ring-primary/20" 
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredTeam.map((member) => (
              <Card 
                key={member.employee_id} 
                className="glass hover:border-primary/50 cursor-pointer transition-all group"
                onClick={() => handleUserClick(member)}
              >
                <CardContent className="p-6">
                  <div className="flex items-center gap-4 mb-4">
                    <div className="w-12 h-12 rounded-full bg-primary/10 text-primary flex items-center justify-center font-bold text-lg">
                      {member.name[0]}
                    </div>
                    <div className="flex-1 overflow-hidden">
                      <div className="font-bold truncate">{member.name}</div>
                      <div className="text-xs text-muted-foreground truncate">{member.department}</div>
                    </div>
                    <ChevronRight className="w-5 h-5 text-muted-foreground group-hover:translate-x-1 transition-transform" />
                  </div>
                  <div className="space-y-4">
                    <div className="flex justify-between items-end">
                      <div className="text-xs text-muted-foreground uppercase font-bold tracking-widest">Avg. Progress</div>
                      <div className="text-xl font-bold">{member.avg_progress}%</div>
                    </div>
                    <div className="w-full h-1.5 bg-secondary rounded-full overflow-hidden">
                      <div 
                        className="h-full bg-primary transition-all duration-1000" 
                        style={{ width: `${member.avg_progress}%` }} 
                      />
                    </div>
                    <div className="flex items-center gap-2 text-xs text-muted-foreground">
                      <Target className="w-3.5 h-3.5" /> {member.goal_count} goals assigned
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-3">
             <Card className="glass border-primary/20 bg-gradient-to-br from-primary/5 to-transparent">
               <CardContent className="p-6">
                 <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-4">
                   <div>
                     <h2 className="text-xl font-bold flex items-center gap-2 text-primary">
                       <Sparkles className="w-5 h-5" /> AI Performance Review
                     </h2>
                     <p className="text-sm text-muted-foreground mt-1">Generate a comprehensive summary of {selectedUser.name}'s quarterly performance.</p>
                   </div>
                   <Button onClick={handleGenerateReview} disabled={loadingReview} className="gap-2 shrink-0">
                     <Sparkles className="w-4 h-4" /> {loadingReview ? "Analyzing Data..." : "Generate AI Review"}
                   </Button>
                 </div>
                 
                 {aiReview && (
                   <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="pt-4 border-t border-primary/10">
                     <p className="text-sm leading-relaxed font-medium mb-6">{aiReview.summary}</p>
                     <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                       <div className="bg-emerald-500/10 border border-emerald-500/20 rounded-xl p-4">
                         <h4 className="text-[10px] uppercase font-bold text-emerald-500 tracking-widest mb-2 flex items-center gap-1.5"><CheckCircle2 className="w-3.5 h-3.5" /> Strengths</h4>
                         <ul className="space-y-1">
                           {aiReview.strengths.map((s, i) => (
                             <li key={i} className="text-xs font-medium flex items-center gap-2"><span className="w-1 h-1 rounded-full bg-emerald-500" />{s}</li>
                           ))}
                         </ul>
                       </div>
                       <div className="bg-rose-500/10 border border-rose-500/20 rounded-xl p-4">
                         <h4 className="text-[10px] uppercase font-bold text-rose-500 tracking-widest mb-2 flex items-center gap-1.5"><AlertCircle className="w-3.5 h-3.5" /> Areas for Improvement</h4>
                         <ul className="space-y-1">
                           {aiReview.weaknesses.map((w, i) => (
                             <li key={i} className="text-xs font-medium flex items-center gap-2"><span className="w-1 h-1 rounded-full bg-rose-500" />{w}</li>
                           ))}
                         </ul>
                       </div>
                     </div>
                   </motion.div>
                 )}
               </CardContent>
             </Card>
          </div>

          <div className="space-y-4">
            <h3 className="text-sm font-bold uppercase tracking-wider text-muted-foreground">Employee Goals</h3>
            <div className="space-y-2">
              {userGoals.map((goal) => (
                <div 
                  key={goal.id}
                  onClick={() => handleGoalClick(goal)}
                  className={`p-4 rounded-xl border transition-all cursor-pointer hover:shadow-md ${
                    selectedGoal?.id === goal.id ? "bg-primary text-primary-foreground border-primary" : "bg-card hover:bg-secondary/50"
                  }`}
                >
                  <div className="text-xs font-bold uppercase tracking-widest opacity-70 mb-1">{goal.thrust_area}</div>
                  <div className="text-sm font-bold truncate">{goal.title}</div>
                  <div className="mt-3 flex items-center justify-between">
                     <div className="text-[10px] font-mono opacity-80">Progress: {goal.progress}%</div>
                     <Badge variant="outline" className="text-[9px] bg-white/10 border-white/20">{goal.status}</Badge>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="lg:col-span-2 space-y-6">
            {selectedGoal ? (
              <div className="space-y-6 fade-in">
                <Card className="glass">
                  <CardHeader>
                    <div className="flex items-center gap-2 mb-2">
                      <Badge variant="outline">{selectedGoal.uom_type}</Badge>
                      <Badge variant="secondary">Target: {selectedGoal.target}</Badge>
                      <Badge variant={selectedGoal.approval_status === "approved" ? "default" : "secondary"}>
                        {selectedGoal.approval_status}
                      </Badge>
                    </div>
                    <CardTitle>{selectedGoal.title}</CardTitle>
                    <CardDescription>{selectedGoal.description}</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-2 gap-4 py-4 border-t">
                      <div>
                        <div className="text-[10px] text-muted-foreground uppercase font-bold tracking-wider">Weightage</div>
                        <div className="text-sm font-bold">{selectedGoal.weightage}%</div>
                      </div>
                      <div>
                        <div className="text-[10px] text-muted-foreground uppercase font-bold tracking-wider">Deadline</div>
                        <div className="text-sm font-bold">{format(new Date(selectedGoal.deadline), "MMM dd, yyyy")}</div>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <h3 className="text-sm font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-2">
                  <Clock className="w-4 h-4" /> Quarterly Progress & Feedback
                </h3>

                <div className="space-y-4">
                  {["Q1", "Q2", "Q3", "Q4"].map(q => {
                    const update = (selectedGoal.quarterly_updates || []).find(u => u.quarter === q);
                    return (
                      <Card key={q} className={`glass ${!update ? "opacity-60" : ""}`}>
                        <CardContent className="p-4">
                          <div className="flex items-start justify-between mb-4">
                            <div>
                              <div className="flex items-center gap-2">
                                <span className="font-bold">{q} Status</span>
                                {update && <Badge variant="secondary" className="text-[10px]">{update.status}</Badge>}
                              </div>
                              {!update && <span className="text-xs text-muted-foreground italic">No update submitted yet</span>}
                            </div>
                            {update && (
                              <div className="text-right">
                                <div className="text-sm font-mono font-bold">{update.achieved} / {update.planned}</div>
                                <div className="text-[10px] text-muted-foreground uppercase tracking-widest">Achieved / Planned</div>
                              </div>
                            )}
                          </div>

                          {update && (
                            <div className="space-y-4">
                              <div className="bg-secondary/20 p-3 rounded-lg">
                                <div className="text-[10px] uppercase font-bold text-muted-foreground mb-1">Employee Comments</div>
                                <p className="text-sm">{update.comments || "No comments."}</p>
                              </div>

                              <div className="space-y-2">
                                <div className="text-[10px] uppercase font-bold text-primary mb-1 flex items-center gap-1">
                                  <MessageSquare className="w-3 h-3" /> Manager Feedback
                                </div>
                                {commentingQuarter === q ? (
                                  <div className="space-y-2">
                                    <textarea 
                                      className="flex min-h-[80px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                                      placeholder="Provide constructive feedback or guidance..."
                                      value={commentText}
                                      onChange={(e) => setCommentText(e.target.value)}
                                      autoFocus
                                    />
                                    <div className="flex justify-end gap-2">
                                      <Button variant="ghost" size="sm" onClick={() => setCommentingQuarter(null)}>Cancel</Button>
                                      <Button size="sm" className="gap-2" onClick={() => handleAddComment(q)}>
                                        <Send className="w-3 h-3" /> Save Feedback
                                      </Button>
                                    </div>
                                  </div>
                                ) : (
                                  <div 
                                    className="p-3 border border-dashed rounded-lg hover:bg-primary/5 cursor-pointer transition-colors"
                                    onClick={() => {
                                      setCommentingQuarter(q);
                                      setCommentText(update.manager_comments || "");
                                    }}
                                  >
                                    {update.manager_comments ? (
                                      <p className="text-sm italic">"{update.manager_comments}"</p>
                                    ) : (
                                      <p className="text-xs text-muted-foreground flex items-center gap-2">
                                        Click to add feedback for this quarter...
                                      </p>
                                    )}
                                  </div>
                                )}
                              </div>
                            </div>
                          )}
                        </CardContent>
                      </Card>
                    );
                  })}
                </div>
              </div>
            ) : (
              <div className="h-full flex flex-col items-center justify-center text-center p-12 bg-secondary/10 rounded-2xl border-2 border-dashed">
                 <Target className="w-12 h-12 text-muted-foreground mb-4" />
                 <h3 className="font-bold">Select a goal to review</h3>
                 <p className="text-sm text-muted-foreground">Pick one of {selectedUser.name}'s objectives from the list on the left.</p>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default TeamPerformance;
