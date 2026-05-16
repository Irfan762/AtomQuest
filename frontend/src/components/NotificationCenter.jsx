import { useState, useEffect } from "react";
import { Bell, CheckCircle2, AlertTriangle, Info, X } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import api from "../lib/api";

const NotificationCenter = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);

  useEffect(() => {
    fetchNotifications();
    const interval = setInterval(fetchNotifications, 30000); // Poll every 30s
    return () => clearInterval(interval);
  }, []);

  const fetchNotifications = async () => {
    try {
      const { data } = await api.get("/notifications");
      setNotifications(data);
      setUnreadCount(data.filter(n => n.status === "unread").length);
    } catch (err) {
      console.error("Failed to fetch notifications");
    }
  };

  const markAsRead = async (id) => {
    try {
      await api.put(`/notifications/${id}/read`);
      setNotifications(notifications.map(n => n.id === id ? { ...n, status: "read" } : n));
      setUnreadCount(Math.max(0, unreadCount - 1));
    } catch (err) {
      console.error("Failed to mark notification as read");
    }
  };

  return (
    <div className="relative">
      <button 
        onClick={() => setIsOpen(!isOpen)}
        className="relative p-2 rounded-full hover:bg-secondary transition-colors"
      >
        <Bell className="w-5 h-5 text-muted-foreground" />
        {unreadCount > 0 && (
          <span className="absolute top-1.5 right-1.5 w-4 h-4 bg-rose-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center">
            {unreadCount}
          </span>
        )}
      </button>

      <AnimatePresence>
        {isOpen && (
          <>
            <div 
              className="fixed inset-0 z-40" 
              onClick={() => setIsOpen(false)} 
            />
            <motion.div 
              initial={{ opacity: 0, y: 10, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 10, scale: 0.95 }}
              className="absolute right-0 mt-2 w-80 max-h-[480px] overflow-y-auto glass z-50 rounded-2xl shadow-2xl border-primary/20"
            >
              <div className="p-4 border-b border-white/10 flex items-center justify-between bg-primary/5">
                <h3 className="font-bold text-sm">Notifications</h3>
                <span className="text-[10px] text-muted-foreground uppercase tracking-widest">{unreadCount} New</span>
              </div>

              <div className="divide-y divide-white/5">
                {notifications.length === 0 ? (
                  <div className="p-8 text-center text-muted-foreground italic text-xs">
                    No notifications yet.
                  </div>
                ) : (
                  notifications.map((n) => (
                    <div 
                      key={n.id} 
                      className={`p-4 hover:bg-white/5 transition-colors cursor-pointer flex gap-3 ${n.status === "unread" ? "bg-primary/5" : ""}`}
                      onClick={() => markAsRead(n.id)}
                    >
                      <div className={`mt-0.5 p-1.5 rounded-lg shrink-0 ${
                        n.type.includes("approved") ? "bg-emerald-500/10 text-emerald-500" :
                        n.type.includes("rejected") ? "bg-rose-500/10 text-rose-500" :
                        "bg-blue-500/10 text-blue-500"
                      }`}>
                        {n.type.includes("approved") ? <CheckCircle2 className="w-3 h-3" /> :
                         n.type.includes("rejected") ? <Info className="w-3 h-3" /> :
                         <Bell className="w-3 h-3" />}
                      </div>
                      <div className="flex-1 space-y-1">
                        <p className="text-xs font-bold leading-tight">{n.subject}</p>
                        <p className="text-[10px] text-muted-foreground line-clamp-2">{n.body}</p>
                        <p className="text-[9px] text-muted-foreground opacity-60">Just now</p>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
};

export default NotificationCenter;
