import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "../components/ui/card";
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, 
  PieChart, Pie, Cell, AreaChart, Area, Legend
} from "recharts";
import { 
  TrendingUp, Users, Briefcase, Award, Zap, 
  Target, CheckCircle2, ShieldAlert, Globe, Activity
} from "lucide-react";
import { motion } from "framer-motion";
import api from "../lib/api";
import { Badge } from "../components/ui/badge";
import { Button } from "../components/ui/button";

const ExecutiveDashboard = () => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchAnalytics();
  }, []);

  const fetchAnalytics = async () => {
    try {
      const { data } = await api.get("/analytics/dashboard");
      setData(data);
    } catch (err) {
      console.error("Failed to fetch executive analytics");
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <div className="h-full flex items-center justify-center">Initializing Executive Insights...</div>;

  const COLORS = ["#10b981", "#3b82f6", "#f59e0b", "#ef4444", "#8b5cf6"];

  return (
    <div className="space-y-8 max-w-7xl mx-auto">
      <div className="flex items-center justify-between">
        <motion.div 
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
        >
          <h1 className="text-4xl font-heading font-bold tracking-tighter gradient-text">Executive Command Center</h1>
          <p className="text-muted-foreground mt-1">Real-time organizational performance & risk intelligence.</p>
        </motion.div>
        <div className="flex items-center gap-2 px-4 py-2 bg-primary/10 rounded-full border border-primary/20">
          <Activity className="w-4 h-4 text-primary animate-pulse" />
          <span className="text-xs font-bold text-primary uppercase tracking-widest">Live System Feed</span>
        </div>
      </div>

      {/* Risk Alert Banner */}
      {data?.risk_analysis?.some(r => r.indicator === "Red") && (
        <motion.div 
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="p-4 bg-rose-500/10 border border-rose-500/20 rounded-2xl flex items-center gap-4 text-rose-500"
        >
          <ShieldAlert className="w-6 h-6 shrink-0" />
          <div className="flex-1">
            <h4 className="font-bold text-sm">Organizational Risk Detected</h4>
            <p className="text-xs opacity-80">Multiple critical objectives are currently showing a high probability of failure. Review the Risk Analysis below.</p>
          </div>
          <Badge variant="destructive" className="animate-bounce">Urgent Review</Badge>
        </motion.div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {[
          { label: "Org Velocity", value: `${data?.summary.completion_rate}%`, icon: Zap, color: "text-blue-500", bg: "bg-blue-500/10" },
          { label: "Active Objectives", value: data?.summary.total_goals, icon: Target, color: "text-primary", bg: "bg-primary/10" },
          { label: "Strategic Alignment", value: "High", icon: Globe, color: "text-emerald-500", bg: "bg-emerald-500/10" },
          { label: "Team Health", value: "92%", icon: Users, color: "text-amber-500", bg: "bg-amber-500/10" },
        ].map((item, idx) => (
          <motion.div
            key={item.label}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: idx * 0.1 }}
          >
            <Card className="glass hover-lift border-white/5">
              <CardContent className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <div className={`p-2 rounded-xl ${item.bg} ${item.color}`}>
                    <item.icon className="w-5 h-5" />
                  </div>
                </div>
                <div className="text-3xl font-bold tracking-tighter">{item.value}</div>
                <div className="text-xs font-bold uppercase tracking-widest text-muted-foreground mt-1">{item.label}</div>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Department Heatmap */}
        <Card className="glass lg:col-span-2">
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <Activity className="w-5 h-5 text-primary" /> Performance Heatmap
            </CardTitle>
            <CardDescription>Visualizing intensity of departmental goal completion.</CardDescription>
          </CardHeader>
          <CardContent className="h-[400px]">
             <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={data?.department_analytics}>
                  <defs>
                    <linearGradient id="colorAvg" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3}/>
                      <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#ffffff10" />
                  <XAxis dataKey="department" axisLine={false} tickLine={false} tick={{fill: '#94a3b8', fontSize: 12}} />
                  <YAxis axisLine={false} tickLine={false} tick={{fill: '#94a3b8', fontSize: 12}} />
                  <Tooltip contentStyle={{backgroundColor: '#0f172a', border: 'none', borderRadius: '12px', color: '#fff'}} />
                  <Area type="monotone" dataKey="avg_progress" stroke="#3b82f6" fillOpacity={1} fill="url(#colorAvg)" />
                </AreaChart>
             </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Risk Map */}
        <Card className="glass">
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <ShieldAlert className="w-5 h-5 text-rose-500" /> Goal Risk Index
            </CardTitle>
            <CardDescription>Predictive analysis of failing objectives.</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {data?.risk_analysis?.sort((a, b) => b.score - a.score).slice(0, 5).map((risk) => (
                <div key={risk.id} className="space-y-2">
                  <div className="flex justify-between text-xs font-medium">
                    <span className="truncate max-w-[180px]">{risk.title}</span>
                    <span className={risk.indicator === "Red" ? "text-rose-500 font-bold" : "text-amber-500 font-bold"}>
                      {risk.score}% Risk
                    </span>
                  </div>
                  <div className="w-full h-1.5 bg-secondary rounded-full overflow-hidden">
                    <div 
                      className={`h-full ${risk.indicator === "Red" ? "bg-rose-500" : "bg-amber-500"}`} 
                      style={{ width: `${risk.score}%` }} 
                    />
                  </div>
                </div>
              ))}
            </div>
            <Button variant="outline" className="w-full mt-6 text-xs" onClick={() => window.location.href='/analytics'}>
              View Comprehensive Risk Report
            </Button>
          </CardContent>
        </Card>
      </div>

      {/* Leaderboard Section */}
      <Card className="glass overflow-hidden">
         <CardHeader className="bg-primary/5">
            <CardTitle className="text-lg flex items-center gap-2">
              <Award className="w-5 h-5 text-amber-500" /> Quarterly Champions
            </CardTitle>
            <CardDescription>Top performing individuals driving organizational growth.</CardDescription>
         </CardHeader>
         <CardContent className="p-0">
            <table className="w-full text-left">
              <thead className="text-[10px] uppercase font-bold text-muted-foreground bg-secondary/30">
                <tr>
                  <th className="px-6 py-4">Employee</th>
                  <th className="px-6 py-4">Department</th>
                  <th className="px-6 py-4">Progress Intensity</th>
                  <th className="px-6 py-4 text-right">Badge</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {data?.team_performance.sort((a, b) => b.avg_progress - a.avg_progress).slice(0, 5).map((member, idx) => (
                  <tr key={member.name} className="hover:bg-white/5 transition-colors">
                    <td className="px-6 py-4 flex items-center gap-3">
                       <div className="w-8 h-8 rounded-full bg-accent flex items-center justify-center text-xs font-bold">
                         {member.name[0]}
                       </div>
                       <span className="text-sm font-semibold">{member.name}</span>
                    </td>
                    <td className="px-6 py-4 text-xs text-muted-foreground">{member.department}</td>
                    <td className="px-6 py-4">
                       <div className="flex items-center gap-2">
                         <div className="w-24 h-1.5 bg-secondary rounded-full overflow-hidden">
                           <div className="h-full bg-emerald-500" style={{width: `${member.avg_progress}%`}} />
                         </div>
                         <span className="text-[10px] font-bold">{member.avg_progress}%</span>
                       </div>
                    </td>
                    <td className="px-6 py-4 text-right">
                       <Badge variant="outline" className="text-[9px] border-emerald-500/30 text-emerald-500 bg-emerald-500/5">
                         {idx === 0 ? "Goal Master" : idx === 1 ? "Consistency Champion" : "KPI Crusher"}
                       </Badge>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
         </CardContent>
      </Card>
    </div>
  );
};

export default ExecutiveDashboard;
