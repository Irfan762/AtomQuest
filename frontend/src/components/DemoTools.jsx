import { useState } from "react";
import { 
  Settings, 
  UserCircle, 
  RefreshCcw, 
  ShieldCheck, 
  User, 
  Sparkles, 
  ArrowRight, 
  X, 
  Play, 
  CheckCircle 
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useAuth } from "../context/AuthContext";
import { Button } from "./ui/button";

const DemoTools = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [tourStep, setTourStep] = useState(null);
  const { logout } = useAuth();

  const switchRole = async (email) => {
    await logout();
    window.location.href = "/login?demo_email=" + encodeURIComponent(email);
  };

  const TOUR_STEPS = [
    {
      title: "1. Goal Cascade Tree",
      desc: "Visualize company strategic OKRs down to employee sub-goals in an animated parent-child tree.",
      path: "/alignment-tree"
    },
    {
      title: "2. Wellbeing Pulse Tracker",
      desc: "Instant emotional pulse checks mapped into global stress scores, warning managers of employee burnout risks.",
      path: "/wellbeing"
    },
    {
      title: "3. AI Conflict Detector",
      desc: "Automatic operational scans finding policy/resource contradictions between goals in real time.",
      path: "/conflicts"
    },
    {
      title: "4. Gantt Timeline Chart",
      desc: "Visual horizontal durations showing exact deadline projections and capacity workload warning clusters.",
      path: "/timeline"
    },
    {
      title: "5. What-If Simulator",
      desc: "Managers balance weightages and slide parameters to calculate simulated department deliverables.",
      path: "/scenarios"
    }
  ];

  const startTour = () => {
    setTourStep(0);
    setIsOpen(false);
    window.location.href = TOUR_STEPS[0].path;
  };

  const nextTourStep = () => {
    if (tourStep < TOUR_STEPS.length - 1) {
      const nextIndex = tourStep + 1;
      setTourStep(nextIndex);
      window.location.href = TOUR_STEPS[nextIndex].path;
    } else {
      setTourStep(null);
      window.location.href = "/";
    }
  };

  const exitTour = () => {
    setTourStep(null);
    window.location.href = "/";
  };

  return (
    <>
      {/* Floating Demo Sidebar Selector */}
      <div className="fixed bottom-6 left-6 z-[100]">
        <AnimatePresence>
          {isOpen && (
            <motion.div
              initial={{ opacity: 0, x: -20, scale: 0.9 }}
              animate={{ opacity: 1, x: 0, scale: 1 }}
              exit={{ opacity: 0, x: -20, scale: 0.9 }}
              className="mb-4 glass border-primary/20 p-5 rounded-2xl shadow-2xl w-60 space-y-4 bg-card/95"
            >
              <div className="flex items-center justify-between border-b pb-2">
                <div className="flex items-center gap-2">
                  <ShieldCheck className="w-4 h-4 text-indigo-500" />
                  <span className="text-[10px] uppercase font-extrabold tracking-widest text-foreground">Hackathon Demo Panel</span>
                </div>
                <button onClick={() => setIsOpen(false)} className="text-muted-foreground hover:text-foreground">
                  <X className="w-3.5 h-3.5" />
                </button>
              </div>
              
              {/* Role Switcher */}
              <div className="space-y-2">
                <p className="text-[9px] uppercase font-bold text-muted-foreground tracking-wider">Perspectives Switches:</p>
                <Button 
                  variant="outline" 
                  size="sm" 
                  className="w-full justify-start gap-2 text-[11px] h-8 cursor-pointer"
                  onClick={() => switchRole("admin@company.com")}
                >
                  <Settings className="w-3.5 h-3.5 text-indigo-500" /> Admin CE0 View
                </Button>
                <Button 
                  variant="outline" 
                  size="sm" 
                  className="w-full justify-start gap-2 text-[11px] h-8 cursor-pointer"
                  onClick={() => switchRole("manager@company.com")}
                >
                  <UserCircle className="w-3.5 h-3.5 text-blue-500" /> Manager Sarah View
                </Button>
                <Button 
                  variant="outline" 
                  size="sm" 
                  className="w-full justify-start gap-2 text-[11px] h-8 cursor-pointer"
                  onClick={() => switchRole("alice@company.com")}
                >
                  <User className="w-3.5 h-3.5 text-emerald-500" /> Employee Alice View
                </Button>
              </div>
              
              {/* Feature Tour Launch */}
              <div className="pt-3 border-t border-border/60">
                <button
                  onClick={startTour}
                  className="w-full flex items-center justify-center gap-1.5 py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-[11px] rounded-xl transition-all shadow-md shadow-indigo-600/10 cursor-pointer"
                >
                  <Play className="w-3.5 h-3.5" />
                  Start Feature Tour
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={() => setIsOpen(!isOpen)}
          className={`p-3.5 rounded-full shadow-2xl transition-colors cursor-pointer ${isOpen ? "bg-indigo-600 text-white" : "bg-card text-indigo-500 border border-border"}`}
        >
          <RefreshCcw className={`w-5 h-5 ${isOpen ? "rotate-180" : ""} transition-transform duration-500`} />
        </motion.button>
      </div>

      {/* Floating Interactive Tour Walkthrough Steps */}
      <AnimatePresence>
        {tourStep !== null && (
          <div className="fixed bottom-6 right-6 z-[1000] w-80">
            <motion.div
              initial={{ opacity: 0, y: 20, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 20, scale: 0.95 }}
              className="bg-card border border-indigo-500/40 p-5 rounded-2xl shadow-2xl space-y-4 bg-card/95 backdrop-blur-md"
            >
              <div className="flex items-center justify-between">
                <span className="text-[9px] uppercase font-extrabold tracking-widest text-indigo-500 flex items-center gap-1">
                  <Sparkles className="w-3 h-3 animate-spin" />
                  GoalGrid Differentiator Tour
                </span>
                <span className="text-[10px] font-mono text-muted-foreground font-bold">
                  {tourStep + 1} / {TOUR_STEPS.length}
                </span>
              </div>

              <div className="space-y-1">
                <h4 className="font-bold text-xs text-foreground leading-snug">{TOUR_STEPS[tourStep].title}</h4>
                <p className="text-[11px] text-muted-foreground leading-normal">{TOUR_STEPS[tourStep].desc}</p>
              </div>

              <div className="flex items-center justify-between pt-2 border-t border-border/60">
                <button 
                  onClick={exitTour}
                  className="text-[10px] text-muted-foreground hover:text-foreground font-semibold"
                >
                  Exit Tour
                </button>
                <button
                  onClick={nextTourStep}
                  className="flex items-center gap-1 py-1.5 px-3 bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-[10px] rounded-lg transition-all"
                >
                  {tourStep < TOUR_STEPS.length - 1 ? (
                    <>
                      Next Feature
                      <ArrowRight className="w-3 h-3" />
                    </>
                  ) : (
                    <>
                      Finish Walkthrough
                      <CheckCircle className="w-3 h-3 text-emerald-300" />
                    </>
                  )}
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </>
  );
};

export default DemoTools;
