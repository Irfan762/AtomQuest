import { useState } from "react";
import { Brain, Sparkles, AlertCircle, CheckCircle2, Wand2, Lightbulb } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import api from "../lib/api";
import { Button } from "./ui/button";
import { Badge } from "./ui/badge";

const AISmartAssistant = ({ title, description, onApply }) => {
  const [loading, setLoading] = useState(false);
  const [analysis, setAnalysis] = useState(null);

  const analyze = async () => {
    if (!title) return;
    setLoading(true);
    try {
      const { data } = await api.post("/ai/analyze", { title, description });
      setAnalysis(data);
    } catch (err) {
      console.error("AI Analysis failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="p-2 bg-primary/10 rounded-lg text-primary">
            <Brain className="w-5 h-5" />
          </div>
          <h3 className="font-bold text-sm">AI SMART Assistant</h3>
        </div>
        <Button 
          variant="outline" 
          size="sm" 
          onClick={analyze} 
          disabled={loading || !title}
          className="gap-2 border-primary/20 hover:bg-primary/5"
        >
          {loading ? "Analyzing..." : "Analyze Goal"}
          <Sparkles className="w-3.5 h-3.5" />
        </Button>
      </div>

      <AnimatePresence>
        {analysis && (
          <motion.div 
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="space-y-4 overflow-hidden"
          >
            <div className="p-4 rounded-xl glass border-primary/20 space-y-4">
              <div className="flex items-center justify-between">
                <div className="space-y-1">
                  <div className="text-[10px] uppercase font-bold text-muted-foreground tracking-widest">SMART Score</div>
                  <div className="text-2xl font-bold tracking-tighter">{analysis.score}%</div>
                </div>
                <Badge variant={analysis.clarity === "High" ? "default" : "secondary"}>
                  {analysis.clarity} Clarity
                </Badge>
              </div>

              <div className="w-full h-1.5 bg-secondary rounded-full overflow-hidden">
                <motion.div 
                  initial={{ width: 0 }}
                  animate={{ width: `${analysis.score}%` }}
                  className="h-full bg-primary"
                />
              </div>

              <div className="space-y-2">
                <div className="text-[10px] uppercase font-bold text-muted-foreground tracking-widest flex items-center gap-1">
                  <AlertCircle className="w-3 h-3" /> Improvements
                </div>
                <ul className="space-y-1">
                  {analysis.suggestions.map((s, idx) => (
                    <li key={idx} className="text-xs text-muted-foreground flex items-start gap-2">
                      <span className="mt-1 w-1 h-1 rounded-full bg-primary shrink-0" />
                      {s}
                    </li>
                  ))}
                </ul>
              </div>

              <div className="pt-2 space-y-3">
                 <div className="p-3 bg-primary/5 rounded-lg border border-primary/10">
                    <div className="text-[10px] uppercase font-bold text-primary mb-1">AI Suggestion</div>
                    <p className="text-sm font-medium leading-relaxed">{analysis.improvedTitle}</p>
                 </div>
                 <Button 
                   className="w-full gap-2" 
                   size="sm"
                   onClick={() => onApply(analysis.improvedTitle, analysis.improvedDescription)}
                 >
                   <Wand2 className="w-4 h-4" /> Apply AI Optimization
                 </Button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {!analysis && !loading && (
        <div className="p-8 text-center glass border-dashed border-white/10 rounded-xl">
           <Lightbulb className="w-8 h-8 text-muted-foreground mx-auto mb-2 opacity-50" />
           <p className="text-xs text-muted-foreground italic">Type your goal and click Analyze to get AI-powered SMART suggestions.</p>
        </div>
      )}
    </div>
  );
};

export default AISmartAssistant;
