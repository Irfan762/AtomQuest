import { useState } from "react";
import { Settings, UserCircle, RefreshCcw, ShieldCheck, User } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useAuth } from "../context/AuthContext";
import { Button } from "./ui/button";

const DemoTools = () => {
  const [isOpen, setIsOpen] = useState(false);
  const { logout, login } = useAuth();

  const switchRole = async (email) => {
    await logout();
    window.location.href = "/login?demo_email=" + encodeURIComponent(email);
  };

  return (
    <div className="fixed bottom-6 left-6 z-[100]">
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, x: -20, scale: 0.9 }}
            animate={{ opacity: 1, x: 0, scale: 1 }}
            exit={{ opacity: 0, x: -20, scale: 0.9 }}
            className="mb-4 glass border-primary/20 p-4 rounded-2xl shadow-2xl w-56 space-y-4"
          >
            <div className="flex items-center gap-2 mb-2">
              <ShieldCheck className="w-4 h-4 text-primary" />
              <span className="text-[10px] uppercase font-bold tracking-widest">Demo Role Switcher</span>
            </div>
            
            <div className="space-y-2">
              <Button 
                variant="outline" 
                size="sm" 
                className="w-full justify-start gap-2 text-xs"
                onClick={() => switchRole("admin@company.com")}
              >
                <Settings className="w-3.5 h-3.5" /> Admin View
              </Button>
              <Button 
                variant="outline" 
                size="sm" 
                className="w-full justify-start gap-2 text-xs"
                onClick={() => switchRole("manager@company.com")}
              >
                <UserCircle className="w-3.5 h-3.5" /> Manager View
              </Button>
              <Button 
                variant="outline" 
                size="sm" 
                className="w-full justify-start gap-2 text-xs"
                onClick={() => switchRole("alice@company.com")}
              >
                <User className="w-3.5 h-3.5" /> Employee View
              </Button>
            </div>
            
            <div className="pt-2 border-t border-white/10">
              <p className="text-[9px] text-muted-foreground leading-tight italic">
                Use this to quickly showcase different role perspectives to the judges.
              </p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <motion.button
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        onClick={() => setIsOpen(!isOpen)}
        className={`p-3 rounded-full shadow-2xl transition-colors ${isOpen ? "bg-primary text-white" : "bg-secondary text-primary"}`}
      >
        <RefreshCcw className={`w-5 h-5 ${isOpen ? "rotate-180" : ""} transition-transform duration-500`} />
      </motion.button>
    </div>
  );
};

export default DemoTools;
