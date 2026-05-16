import { useState, useEffect } from "react";
import api from "../lib/api";
import { Button } from "../components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "../components/ui/card";
import { Badge } from "../components/ui/badge";
import { Input } from "../components/ui/input";
import { 
  CheckCircle2, XCircle, User, Briefcase, Clock, 
  MessageSquare, ChevronDown, ChevronUp, ExternalLink 
} from "lucide-react";
import { toast } from "sonner";
import { format } from "date-fns";

const Approvals = () => {
  const [goals, setGoals] = useState([]);
  const [users, setUsers] = useState({});
  const [loading, setLoading] = useState(true);
  const [comments, setComments] = useState({});
  const [expanded, setExpanded] = useState({});

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [goalsRes, usersRes] = await Promise.all([
        api.get("/goals"),
        api.get("/users")
      ]);
      
      const pending = goalsRes.data.filter(g => g.approval_status === "submitted");
      setGoals(pending);
      
      const userMap = {};
      usersRes.data.forEach(u => userMap[u.id] = u);
      setUsers(userMap);
    } catch (err) {
      toast.error("Failed to fetch pending approvals");
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = async (id) => {
    try {
      await api.put(`/goals/approve/${id}`, { comments: comments[id] || "" });
      toast.success("Goal approved");
      fetchData();
    } catch (err) {
      toast.error("Failed to approve goal");
    }
  };

  const handleReject = async (id) => {
    if (!comments[id]) {
      toast.error("Please provide a reason for rejection in the comments");
      return;
    }
    try {
      await api.put(`/goals/reject/${id}`, { comments: comments[id] || "" });
      toast.success("Goal rejected");
      fetchData();
    } catch (err) {
      toast.error("Failed to reject goal");
    }
  };

  const toggleExpand = (id) => {
    setExpanded(prev => ({ ...prev, [id]: !prev[id] }));
  };

  return (
    <div className="space-y-8 max-w-5xl mx-auto">
      <div>
        <h1 className="text-3xl font-heading font-bold tracking-tighter">Approvals</h1>
        <p className="text-muted-foreground">Review and approve goal submissions from your team.</p>
      </div>

      {loading ? (
        <div className="text-center py-12">Loading submissions...</div>
      ) : goals.length === 0 ? (
        <Card className="bg-secondary/20 border-dashed py-12 text-center">
          <div className="p-4 bg-secondary rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4 text-muted-foreground">
            <CheckCircle2 className="w-8 h-8" />
          </div>
          <h3 className="text-lg font-medium">All caught up!</h3>
          <p className="text-muted-foreground text-sm">No pending goal submissions to review.</p>
        </Card>
      ) : (
        <div className="space-y-4">
          {goals.map((goal) => (
            <Card key={goal.id} className="glass overflow-hidden">
              <div 
                className="p-6 flex items-center justify-between cursor-pointer hover:bg-secondary/10 transition-colors"
                onClick={() => toggleExpand(goal.id)}
              >
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 rounded-full bg-primary/10 text-primary flex items-center justify-center font-bold">
                    {users[goal.employee_id]?.name?.[0]}
                  </div>
                  <div>
                    <div className="text-sm font-bold">{users[goal.employee_id]?.name}</div>
                    <div className="text-xs text-muted-foreground flex items-center gap-1">
                      <Briefcase className="w-3 h-3" /> {users[goal.employee_id]?.department}
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-6">
                  <div className="text-right hidden md:block">
                    <div className="text-sm font-medium">{goal.title}</div>
                    <div className="text-xs text-muted-foreground">{goal.thrust_area} • {goal.weightage}%</div>
                  </div>
                  {expanded[goal.id] ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                </div>
              </div>

              {expanded[goal.id] && (
                <CardContent className="border-t bg-secondary/5 p-6 space-y-6 fade-in">
                   <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                     <div className="space-y-4">
                       <div>
                         <label className="text-[10px] uppercase font-bold text-muted-foreground tracking-wider">Goal Description</label>
                         <p className="text-sm mt-1">{goal.description || "No description provided."}</p>
                       </div>
                       <div className="grid grid-cols-2 gap-4">
                         <div>
                           <label className="text-[10px] uppercase font-bold text-muted-foreground tracking-wider">Target</label>
                           <div className="text-sm font-mono font-bold mt-1">{goal.target} {goal.uom_type === "percentage" ? "%" : ""}</div>
                         </div>
                         <div>
                           <label className="text-[10px] uppercase font-bold text-muted-foreground tracking-wider">Deadline</label>
                           <div className="text-sm font-mono font-bold mt-1">{format(new Date(goal.deadline), "MMM dd, yyyy")}</div>
                         </div>
                       </div>
                     </div>

                     <div className="space-y-4">
                       <div className="space-y-2">
                         <label className="text-[10px] uppercase font-bold text-muted-foreground tracking-wider flex items-center gap-1.5">
                           <MessageSquare className="w-3 h-3" /> Review Comments
                         </label>
                         <textarea 
                           className="flex min-h-[80px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                           placeholder="Add feedback for the employee..."
                           value={comments[goal.id] || ""}
                           onChange={(e) => setComments({...comments, [goal.id]: e.target.value})}
                         />
                       </div>
                       <div className="flex gap-2 justify-end">
                         <Button variant="outline" className="gap-2 text-destructive border-destructive/20 hover:bg-destructive/10" onClick={() => handleReject(goal.id)}>
                           <XCircle className="w-4 h-4" /> Reject
                         </Button>
                         <Button className="gap-2" onClick={() => handleApprove(goal.id)}>
                           <CheckCircle2 className="w-4 h-4" /> Approve
                         </Button>
                       </div>
                     </div>
                   </div>
                </CardContent>
              )}
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};

export default Approvals;
