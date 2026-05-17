import { useState, useEffect } from "react";
import { useAuth } from "../context/AuthContext";
import { Card, CardContent, CardHeader, CardTitle } from "../components/ui/card";
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, 
  PieChart, Pie, Cell, LineChart, Line, AreaChart, Area
} from "recharts";
import { 
  Target, CheckCircle2, AlertTriangle, Clock, TrendingUp, Users, Briefcase, 
  ChevronRight, ArrowUpRight, ArrowDownRight, Bell, CalendarCheck, Sparkle, Award, Zap, Flame
} from "lucide-react";
import api from "../lib/api";
import { Button } from "../components/ui/button";
import { Badge } from "../components/ui/badge";

const Dashboard = () => {
  const { user } = useAuth();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [conflicts, setConflicts] = useState([]);

  useEffect(() => {
    fetchDashboard();
  }, []);

  const fetchDashboard = async () => {
    try {
      const { data: dashData } = await api.get("/analytics/dashboard");
      setData(dashData);
      
      // Fetch active conflicts for warning banner
      if (user && ["admin", "manager"].includes(user.role)) {
        const confRes = await api.get("/goals/conflicts");
        setConflicts(confRes.data.filter(c => !c.resolved));
      }
    } catch (err) {
      console.error("Failed to fetch dashboard data");
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <div className="h-full flex items-center justify-center">Loading dashboard...</div>;
  if (!data) return <div className="h-full flex flex-col items-center justify-center text-muted-foreground p-8 text-center space-y-4">
    <AlertTriangle className="w-12 h-12 text-amber-500" />
    <div>
      <h2 className="text-xl font-bold text-foreground">Dashboard unavailable</h2>
      <p>Failed to load dashboard data. Please try again later.</p>
    </div>
    <Button onClick={fetchDashboard}>Retry</Button>
  </div>;

  const COLORS = ["#10b981", "#3b82f6", "#f59e0b", "#94a3b8"];

  return (
    <div className="space-y-8 max-w-7xl mx-auto">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <h1 className="text-3xl font-heading font-bold tracking-tighter">Dashboard</h1>
          <p className="text-muted-foreground">Welcome back, {user?.name}. Here's what's happening.</p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" className="gap-2">
            <Clock className="w-4 h-4" /> Q2 2026
          </Button>
          <Button size="sm" className="gap-2">
            <TrendingUp className="w-4 h-4" /> View Report
          </Button>
        </div>
      </div>

      {/* AI Goal Conflict Banner */}
      {user && ["admin", "manager"].includes(user.role) && conflicts.length > 0 && (
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 p-5 rounded-2xl border border-rose-500/20 bg-rose-500/5 text-rose-500 shadow-lg shadow-rose-500/5">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-rose-500 text-white rounded-xl">
              <AlertTriangle className="w-5 h-5 animate-pulse" />
            </div>
            <div>
              <h4 className="font-bold text-xs uppercase tracking-wider">AI Goal Conflict Alert</h4>
              <p className="text-[11px] text-muted-foreground mt-0.5">
                AI scanner has identified <strong>{conflicts.length} active strategic conflict(s)</strong> across current organizational goals. Action is required.
              </p>
            </div>
          </div>
          <Button
            size="sm"
            variant="destructive"
            className="font-bold text-xs"
            onClick={() => window.location.href = "/conflicts"}
          >
            Resolve Conflicts
          </Button>
        </div>
      )}

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="glass">
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-2">
              <div className="p-2 bg-primary/10 text-primary rounded-lg">
                <Target className="w-5 h-5" />
              </div>
              <Badge variant="secondary" className="text-[10px] uppercase font-bold tracking-wider">Total Goals</Badge>
            </div>
            <div className="text-3xl font-bold tracking-tighter">{data?.summary.total_goals}</div>
            <div className="text-xs text-muted-foreground mt-1 flex items-center gap-1">
              <ArrowUpRight className="w-3 h-3 text-emerald-500" />
              <span className="text-emerald-500 font-medium">+2</span> since last month
            </div>
          </CardContent>
        </Card>

        <Card className="glass">
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-2">
              <div className="p-2 bg-emerald-500/10 text-emerald-500 rounded-lg">
                <CheckCircle2 className="w-5 h-5" />
              </div>
              <Badge variant="secondary" className="text-[10px] uppercase font-bold tracking-wider">Completed</Badge>
            </div>
            <div className="text-3xl font-bold tracking-tighter">{data?.summary.completed}</div>
            <div className="text-xs text-muted-foreground mt-1 flex items-center gap-1">
              <span className="font-medium text-emerald-500">{data?.summary.completion_rate}%</span> success rate
            </div>
          </CardContent>
        </Card>

        <Card className="glass">
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-2">
              <div className="p-2 bg-amber-500/10 text-amber-500 rounded-lg">
                <AlertTriangle className="w-5 h-5" />
              </div>
              <Badge variant="secondary" className="text-[10px] uppercase font-bold tracking-wider">At Risk</Badge>
            </div>
            <div className="text-3xl font-bold tracking-tighter">{data?.summary.at_risk}</div>
            <div className="text-xs text-muted-foreground mt-1 flex items-center gap-1">
              <ArrowDownRight className="w-3 h-3 text-rose-500" />
              <span className="text-rose-500 font-medium">-1</span> from last week
            </div>
          </CardContent>
        </Card>

        <Card className="glass">
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-2">
              <div className="p-2 bg-blue-500/10 text-blue-500 rounded-lg">
                <Bell className="w-5 h-5" />
              </div>
              <Badge variant="secondary" className="text-[10px] uppercase font-bold tracking-wider">Pending</Badge>
            </div>
            <div className="text-3xl font-bold tracking-tighter">{data?.summary.pending_approval}</div>
            <div className="text-xs text-muted-foreground mt-1">
              Awaiting manager review
            </div>
          </CardContent>
        </Card>
      </div>
      
      {/* Gamification Row */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="glass border-orange-500/20 bg-gradient-to-br from-orange-500/5 to-transparent">
          <CardContent className="p-6">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-orange-500/20 text-orange-500 rounded-2xl animate-pulse">
                <Flame className="w-6 h-6" />
              </div>
              <div>
                <div className="text-2xl font-bold tracking-tighter italic">12 Day Streak</div>
                <div className="text-[10px] uppercase font-bold text-muted-foreground tracking-widest">Updating Goals Daily</div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="glass border-primary/20 bg-gradient-to-br from-primary/5 to-transparent md:col-span-2">
          <CardContent className="p-6 flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-primary/20 text-primary rounded-2xl">
                <Award className="w-6 h-6" />
              </div>
              <div>
                <div className="text-xl font-bold tracking-tighter">Achievement Progress</div>
                <div className="text-[10px] uppercase font-bold text-muted-foreground tracking-widest">Next Badge: Q2 Warrior</div>
              </div>
            </div>
            <div className="flex gap-2">
              <div className="w-10 h-10 rounded-full bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-500 grayscale opacity-40 hover:grayscale-0 hover:opacity-100 transition-all cursor-help" title="Goal Master - Complete 5 Goals">
                <Target className="w-5 h-5" />
              </div>
              <div className="w-10 h-10 rounded-full bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-500 grayscale opacity-40 hover:grayscale-0 hover:opacity-100 transition-all cursor-help" title="Streak Champion - 14 Day Streak">
                <Flame className="w-5 h-5" />
              </div>
              <div className="w-10 h-10 rounded-full bg-blue-500/10 border border-blue-500/20 flex items-center justify-center text-blue-500 grayscale opacity-40 hover:grayscale-0 hover:opacity-100 transition-all cursor-help" title="Data Hero - Weekly Updates">
                <CheckCircle2 className="w-5 h-5" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Progress Chart */}
        <Card className="lg:col-span-2 glass">
          <CardHeader>
            <CardTitle className="text-lg">Quarterly Performance Trends</CardTitle>
          </CardHeader>
          <CardContent className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={data?.quarterly_trends}>
                <defs>
                  <linearGradient id="colorPlanned" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
                  </linearGradient>
                  <linearGradient id="colorAchieved" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#10b981" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                <XAxis dataKey="quarter" axisLine={false} tickLine={false} tick={{fill: '#94a3b8', fontSize: 12}} />
                <YAxis axisLine={false} tickLine={false} tick={{fill: '#94a3b8', fontSize: 12}} />
                <Tooltip 
                  contentStyle={{borderRadius: '8px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)'}}
                />
                <Area type="monotone" dataKey="planned" stroke="#3b82f6" fillOpacity={1} fill="url(#colorPlanned)" strokeWidth={2} />
                <Area type="monotone" dataKey="achieved" stroke="#10b981" fillOpacity={1} fill="url(#colorAchieved)" strokeWidth={2} />
              </AreaChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Status Distribution */}
        <Card className="glass">
          <CardHeader>
            <CardTitle className="text-lg">Goal Status Distribution</CardTitle>
          </CardHeader>
          <CardContent className="h-[300px] flex flex-col items-center justify-center">
            <ResponsiveContainer width="100%" height={200}>
              <PieChart>
                <Pie
                  data={data?.status_distribution}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={80}
                  paddingAngle={5}
                  dataKey="value"
                >
                  {data?.status_distribution.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
            <div className="grid grid-cols-2 gap-4 mt-4 w-full px-4">
              {data?.status_distribution.map((item, index) => (
                <div key={item.name} className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full" style={{backgroundColor: COLORS[index % COLORS.length]}} />
                  <span className="text-xs text-muted-foreground whitespace-nowrap">{item.name} ({item.value})</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Team Performance */}
        {user?.role !== "employee" && (
          <Card className="glass">
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle className="text-lg">Team Performance</CardTitle>
              <Button variant="ghost" size="sm" className="text-primary text-xs">View All <ChevronRight className="w-3 h-3" /></Button>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {data?.team_performance.slice(0, 4).map((member) => (
                  <div key={member.name} className="flex items-center justify-between p-3 rounded-lg bg-secondary/20 hover:bg-secondary/40 transition-colors">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-primary/10 text-primary flex items-center justify-center font-bold text-xs uppercase">
                        {member.name[0]}
                      </div>
                      <div>
                        <div className="text-sm font-medium">{member.name}</div>
                        <div className="text-[10px] text-muted-foreground">{member.department}</div>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-sm font-bold">{member.avg_progress}%</div>
                      <div className="text-[10px] text-muted-foreground">{member.goal_count} goals</div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Recent Notifications */}
        <Card className="glass overflow-hidden">
          <CardHeader>
            <CardTitle className="text-lg">Recent Alerts</CardTitle>
          </CardHeader>
          <CardContent className="p-0">
             <div className="divide-y divide-border/50">
               <div className="p-4 flex gap-4 items-start hover:bg-secondary/20 transition-colors cursor-pointer">
                 <div className="w-8 h-8 rounded-full bg-blue-500/10 text-blue-500 flex items-center justify-center shrink-0">
                    <Target className="w-4 h-4" />
                 </div>
                 <div className="space-y-1">
                   <div className="text-sm font-medium">New Goal Shared</div>
                   <div className="text-xs text-muted-foreground">Manager has shared "Q2 Efficiency KPI" with you.</div>
                   <div className="text-[10px] text-muted-foreground mt-2">2 hours ago</div>
                 </div>
               </div>
               <div className="p-4 flex gap-4 items-start hover:bg-secondary/20 transition-colors cursor-pointer">
                 <div className="w-8 h-8 rounded-full bg-emerald-500/10 text-emerald-500 flex items-center justify-center shrink-0">
                    <CheckCircle2 className="w-4 h-4" />
                 </div>
                 <div className="space-y-1">
                   <div className="text-sm font-medium">Goal Approved</div>
                   <div className="text-xs text-muted-foreground">Your "Sales Target Q2" has been approved and locked.</div>
                   <div className="text-[10px] text-muted-foreground mt-2">Yesterday</div>
                 </div>
               </div>
               <div className="p-4 flex gap-4 items-start hover:bg-secondary/20 transition-colors cursor-pointer">
                 <div className="w-8 h-8 rounded-full bg-amber-500/10 text-amber-500 flex items-center justify-center shrink-0">
                    <CalendarCheck className="w-4 h-4" />
                 </div>
                 <div className="space-y-1">
                   <div className="text-sm font-medium">Check-in Due</div>
                   <div className="text-xs text-muted-foreground">Q1 final check-in is due for all active goals.</div>
                   <div className="text-[10px] text-muted-foreground mt-2">2 days ago</div>
                 </div>
               </div>
             </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Dashboard;
