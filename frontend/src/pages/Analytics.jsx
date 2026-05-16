import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "../components/ui/card";
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, 
  PieChart, Pie, Cell, LineChart, Line, AreaChart, Area, Legend
} from "recharts";
import { 
  TrendingUp, Users, Briefcase, Award, Zap, 
  ArrowUpRight, ArrowDownRight, Target, CheckCircle2 
} from "lucide-react";
import api from "../lib/api";

const Analytics = () => {
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
      console.error("Failed to fetch analytics");
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <div className="h-full flex items-center justify-center">Loading analytics...</div>;

  const COLORS = ["#10b981", "#3b82f6", "#f59e0b", "#ef4444", "#8b5cf6"];

  return (
    <div className="space-y-8 max-w-7xl mx-auto">
      <div>
        <h1 className="text-3xl font-heading font-bold tracking-tighter">Advanced Analytics</h1>
        <p className="text-muted-foreground">Deep dive into performance metrics and trends.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
         <Card className="glass overflow-hidden border-primary/20">
            <CardHeader className="bg-primary/5 pb-2">
              <CardTitle className="text-sm font-bold uppercase tracking-wider text-primary flex items-center gap-2">
                <Target className="w-4 h-4" /> Goal Velocity
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-4">
               <div className="text-4xl font-bold tracking-tighter">{data?.summary.completion_rate}%</div>
               <p className="text-xs text-muted-foreground mt-2">Overall completion rate across all active objectives.</p>
               <div className="mt-4 h-1 w-full bg-secondary rounded-full overflow-hidden">
                  <div className="h-full bg-primary" style={{width: `${data?.summary.completion_rate}%`}} />
               </div>
            </CardContent>
         </Card>

         <Card className="glass overflow-hidden border-emerald-500/20">
            <CardHeader className="bg-emerald-500/5 pb-2">
              <CardTitle className="text-sm font-bold uppercase tracking-wider text-emerald-500 flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4" /> Peak Performance
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-4">
               <div className="text-4xl font-bold tracking-tighter">{data?.summary.completed}</div>
               <p className="text-xs text-muted-foreground mt-2">Total number of goals successfully completed to date.</p>
               <div className="mt-4 flex items-center gap-1 text-emerald-500 text-xs font-bold">
                 <ArrowUpRight className="w-3 h-3" /> 12% improvement
               </div>
            </CardContent>
         </Card>

         <Card className="glass overflow-hidden border-blue-500/20">
            <CardHeader className="bg-blue-500/5 pb-2">
              <CardTitle className="text-sm font-bold uppercase tracking-wider text-blue-500 flex items-center gap-2">
                <Zap className="w-4 h-4" /> Execution Rate
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-4">
               <div className="text-4xl font-bold tracking-tighter">{data?.summary.on_track}</div>
               <p className="text-xs text-muted-foreground mt-2">Current objectives moving towards completion as planned.</p>
               <div className="mt-4 flex items-center gap-1 text-blue-500 text-xs font-bold">
                 <Award className="w-3 h-3" /> High Consistency
               </div>
            </CardContent>
         </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Performance by Department */}
        <Card className="glass">
          <CardHeader>
            <CardTitle>Departmental Performance</CardTitle>
            <CardDescription>Average goal progress across organization units.</CardDescription>
          </CardHeader>
          <CardContent className="h-[350px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={data?.department_analytics} layout="vertical" margin={{left: 40}}>
                <CartesianGrid strokeDasharray="3 3" horizontal={true} vertical={false} stroke="#e2e8f0" />
                <XAxis type="number" axisLine={false} tickLine={false} tick={{fill: '#94a3b8', fontSize: 11}} domain={[0, 100]} />
                <YAxis dataKey="department" type="category" axisLine={false} tickLine={false} tick={{fill: '#475569', fontSize: 12, fontWeight: 500}} />
                <Tooltip cursor={{fill: '#f1f5f9'}} contentStyle={{borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)'}} />
                <Bar dataKey="avg_progress" fill="#3b82f6" radius={[0, 4, 4, 0]} barSize={24} />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Quarterly Progress Matrix */}
        <Card className="glass">
          <CardHeader>
            <CardTitle>Planned vs Achieved</CardTitle>
            <CardDescription>Quarterly comparison of projected vs actual results.</CardDescription>
          </CardHeader>
          <CardContent className="h-[350px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={data?.quarterly_trends}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                <XAxis dataKey="quarter" axisLine={false} tickLine={false} tick={{fill: '#94a3b8', fontSize: 12}} />
                <YAxis axisLine={false} tickLine={false} tick={{fill: '#94a3b8', fontSize: 12}} />
                <Tooltip contentStyle={{borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)'}} />
                <Legend iconType="circle" />
                <Bar dataKey="planned" fill="#94a3b8" radius={[4, 4, 0, 0]} name="Targeted" />
                <Bar dataKey="achieved" fill="#10b981" radius={[4, 4, 0, 0]} name="Actual" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 gap-8">
        {/* Team Leaderboard */}
        <Card className="glass overflow-hidden">
          <CardHeader>
            <CardTitle>Performance Leaderboard</CardTitle>
            <CardDescription>Top performing team members and their objective scores.</CardDescription>
          </CardHeader>
          <CardContent className="p-0">
             <div className="overflow-x-auto">
               <table className="w-full text-left">
                  <thead className="bg-secondary/50 text-[10px] uppercase font-bold text-muted-foreground tracking-widest border-y">
                    <tr>
                      <th className="px-6 py-4">Employee</th>
                      <th className="px-6 py-4">Department</th>
                      <th className="px-6 py-4">Goal Count</th>
                      <th className="px-6 py-4">Avg. Progress</th>
                      <th className="px-6 py-4 text-right">Rank</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border/50">
                    {data?.team_performance.sort((a, b) => b.avg_progress - a.avg_progress).map((member, idx) => (
                      <tr key={member.name} className="hover:bg-secondary/20 transition-colors group">
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-3">
                            <div className="w-8 h-8 rounded-full bg-accent flex items-center justify-center font-bold text-xs uppercase text-accent-foreground">
                              {member.name[0]}
                            </div>
                            <span className="text-sm font-semibold">{member.name}</span>
                          </div>
                        </td>
                        <td className="px-6 py-4 text-sm text-muted-foreground">{member.department}</td>
                        <td className="px-6 py-4 text-sm font-mono">{member.goal_count} objectives</td>
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-2">
                             <div className="w-24 h-1.5 bg-secondary rounded-full overflow-hidden shrink-0">
                                <div 
                                  className={`h-full transition-all duration-1000 ${
                                    member.avg_progress > 80 ? "bg-emerald-500" : 
                                    member.avg_progress > 50 ? "bg-blue-500" : "bg-amber-500"
                                  }`} 
                                  style={{width: `${member.avg_progress}%`}} 
                                />
                             </div>
                             <span className="text-xs font-bold">{member.avg_progress}%</span>
                          </div>
                        </td>
                        <td className="px-6 py-4 text-right">
                           <Badge variant={idx < 3 ? "default" : "secondary"} className="font-mono">
                             #{idx + 1}
                           </Badge>
                        </td>
                      </tr>
                    ))}
                  </tbody>
               </table>
             </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Analytics;
