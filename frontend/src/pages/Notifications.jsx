import { useState, useEffect } from "react";
import api from "../lib/api";
import { Card, CardContent, CardHeader, CardTitle } from "../components/ui/card";
import { Badge } from "../components/ui/badge";
import { Bell, Mail, Target, CheckCircle2, AlertTriangle, Calendar, Clock, Inbox } from "lucide-react";
import { format } from "date-fns";
import { toast } from "sonner";

const Notifications = () => {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchNotifications();
  }, []);

  const fetchNotifications = async () => {
    try {
      const { data } = await api.get("/notifications");
      setItems(data);
    } catch (err) {
      console.error("Failed to fetch notifications");
    } finally {
      setLoading(false);
    }
  };

  const markAsRead = async (id) => {
    try {
      await api.post(`/notifications/${id}/read`);
      setItems(items.map(item => item.id === id ? { ...item, read: true } : item));
    } catch (err) {
      toast.error("Failed to mark as read");
    }
  };

  const getIcon = (type) => {
    switch (type) {
      case "goal_submitted": return <Inbox className="w-4 h-4" />;
      case "goal_approved": return <CheckCircle2 className="w-4 h-4 text-emerald-500" />;
      case "goal_rejected": return <AlertTriangle className="w-4 h-4 text-destructive" />;
      case "quarterly_reminder": return <Calendar className="w-4 h-4 text-blue-500" />;
      default: return <Bell className="w-4 h-4" />;
    }
  };

  return (
    <div className="space-y-8 max-w-4xl mx-auto">
      <div className="flex items-end justify-between">
        <div>
          <h1 className="text-3xl font-heading font-bold tracking-tighter">Notifications</h1>
          <p className="text-muted-foreground">Stay updated with your performance activities.</p>
        </div>
        <Badge variant="secondary" className="px-3 py-1">
          {items.filter(i => !i.read).length} Unread
        </Badge>
      </div>

      <Card className="glass overflow-hidden">
        <CardContent className="p-0">
          {loading ? (
            <div className="p-12 text-center text-muted-foreground">Loading notifications...</div>
          ) : items.length === 0 ? (
            <div className="p-20 text-center text-muted-foreground">
               <div className="w-16 h-16 bg-secondary rounded-full flex items-center justify-center mx-auto mb-4">
                 <Bell className="w-8 h-8 opacity-20" />
               </div>
               <h3 className="text-lg font-medium">All caught up!</h3>
               <p className="text-sm italic mt-1">You don't have any notifications at the moment.</p>
            </div>
          ) : (
            <div className="divide-y divide-border/50">
              {items.map((item) => (
                <div 
                  key={item.id} 
                  className={`p-6 flex items-start gap-4 transition-colors cursor-pointer hover:bg-secondary/10 ${!item.read ? 'bg-primary/[0.02]' : ''}`}
                  onClick={() => !item.read && markAsRead(item.id)}
                >
                   <div className={`mt-1 p-2 rounded-full shrink-0 ${!item.read ? 'bg-primary/10 text-primary' : 'bg-secondary text-muted-foreground'}`}>
                      {getIcon(item.type)}
                   </div>
                   <div className="flex-1 space-y-1">
                      <div className="flex items-center justify-between">
                        <div className={`text-sm font-bold ${!item.read ? 'text-foreground' : 'text-muted-foreground'}`}>
                          {item.subject}
                        </div>
                        {!item.read && <div className="w-2 h-2 bg-primary rounded-full" />}
                      </div>
                      <p className="text-sm text-muted-foreground leading-relaxed">{item.body}</p>
                      <div className="flex items-center gap-1.5 text-[10px] text-muted-foreground pt-2">
                        <Clock className="w-3 h-3" /> {format(new Date(item.created_at), "MMM dd, HH:mm")}
                      </div>
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

export default Notifications;
