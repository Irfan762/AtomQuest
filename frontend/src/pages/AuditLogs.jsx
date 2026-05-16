import { useState, useEffect } from "react";
import api from "../lib/api";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "../components/ui/card";
import { Badge } from "../components/ui/badge";
import { Input } from "../components/ui/input";
import { Search, ScrollText, User, Shield, Clock, ChevronRight } from "lucide-react";
import { format } from "date-fns";

const AuditLogs = () => {
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");

  useEffect(() => {
    fetchLogs();
  }, []);

  const fetchLogs = async () => {
    try {
      const { data } = await api.get("/admin/audit");
      setLogs(data);
    } catch (err) {
      console.error("Failed to fetch audit logs");
    } finally {
      setLoading(false);
    }
  };

  const filteredLogs = logs.filter(l => 
    l.user_name.toLowerCase().includes(search.toLowerCase()) || 
    l.action.toLowerCase().includes(search.toLowerCase()) ||
    l.target_type.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-8 max-w-6xl mx-auto">
      <div className="flex items-end justify-between">
        <div>
          <h1 className="text-3xl font-heading font-bold tracking-tighter">Audit Trail</h1>
          <p className="text-muted-foreground">Immutable record of all system activities and mutations.</p>
        </div>
        <Badge variant="outline" className="gap-2 px-3 py-1">
          <Shield className="w-3 h-3" /> System Secured
        </Badge>
      </div>

      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
        <Input 
          placeholder="Filter by user, action or target..." 
          className="pl-10 glass border-primary/20 focus:border-primary/50 focus:ring-1 focus:ring-primary/20" 
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>

      <Card className="glass overflow-hidden">
        <CardContent className="p-0">
          {loading ? (
            <div className="p-12 text-center text-muted-foreground">Loading audit trail...</div>
          ) : filteredLogs.length === 0 ? (
            <div className="p-12 text-center text-muted-foreground italic">No logs found.</div>
          ) : (
            <div className="divide-y divide-border/50">
              {filteredLogs.map((log, idx) => (
                <div key={idx} className="p-4 hover:bg-secondary/20 transition-colors flex items-start gap-4">
                  <div className={`mt-1 p-2 rounded-lg shrink-0 ${
                    log.action.includes('delete') ? 'bg-rose-500/10 text-rose-500' :
                    log.action.includes('approve') ? 'bg-emerald-500/10 text-emerald-500' :
                    log.action.includes('unlock') ? 'bg-amber-500/10 text-amber-500' :
                    'bg-blue-500/10 text-blue-500'
                  }`}>
                    <ScrollText className="w-4 h-4" />
                  </div>
                  
                  <div className="flex-1 space-y-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="text-sm font-bold">{log.user_name}</span>
                      <Badge variant="secondary" className="text-[9px] font-mono uppercase px-1.5 py-0">
                        {log.action.replace(/_/g, ' ')}
                      </Badge>
                      <ChevronRight className="w-3 h-3 text-muted-foreground" />
                      <span className="text-xs font-medium text-muted-foreground capitalize">{log.target_type}: {log.target_id.slice(0, 8)}...</span>
                    </div>
                    
                    <div className="text-xs text-muted-foreground">
                       {log.action === 'update_goal' ? (
                         <span>Modified goal parameters: <span className="font-mono text-foreground">{Object.keys(log.new_value || {}).join(', ')}</span></span>
                       ) : log.action === 'submit_checkin' ? (
                         <span>Submitted {log.new_value?.quarter} check-in with status <span className="font-bold text-foreground">{log.new_value?.status}</span></span>
                       ) : (
                         <span>System action recorded for security auditing.</span>
                       )}
                    </div>

                    <div className="flex items-center gap-1 text-[10px] text-muted-foreground pt-1">
                      <Clock className="w-3 h-3" /> {format(new Date(log.timestamp), "MMM dd, HH:mm:ss")}
                    </div>
                  </div>

                  <div className="hidden md:block text-right">
                    <div className="text-[10px] text-muted-foreground font-mono">{log.user_email}</div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default AuditLogs;
