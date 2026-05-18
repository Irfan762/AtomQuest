import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { Button } from "../components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "../components/ui/card";
import { Input } from "../components/ui/input";
import { Sparkle, Shield, Users, User, ArrowRight } from "lucide-react";
import { toast } from "sonner";

const Login = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const getDemoPassword = (emailStr) => {
    const emailLc = String(emailStr).toLowerCase();
    if (emailLc === "admin@company.com") return "Admin@123";
    if (emailLc === "manager@company.com") return "Manager@123";
    if (emailLc === "alice@company.com") return "Alice@123";
    if (emailLc === "bob@company.com") return "Bob@123";
    return "Password@123";
  };

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const demoEmail = params.get("demo_email");
    if (demoEmail) {
      setEmail(demoEmail);
      setPassword(getDemoPassword(demoEmail));
      const timer = setTimeout(() => {
        const form = document.querySelector("form");
        if (form) form.dispatchEvent(new Event("submit", { cancelable: true, bubbles: true }));
      }, 500);
      return () => clearTimeout(timer);
    }
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await login(email, password);
      toast.success("Login successful");
      navigate("/");
    } catch (err) {
      toast.error(err.response?.data?.detail || "Login failed");
    } finally {
      setLoading(false);
    }
  };

  const handleDemoClick = async (demoEmail, demoPassword) => {
    setEmail(demoEmail);
    setPassword(demoPassword);
    setLoading(true);
    try {
      await login(demoEmail, demoPassword);
      toast.success(`Welcome back! Logged in as ${demoEmail}`);
      navigate("/");
    } catch (err) {
      // If the first attempt failed, let's try the default password "Password@123" as a fallback
      const defaultPass = "Password@123";
      if (demoPassword !== defaultPass) {
        try {
          setPassword(defaultPass);
          await login(demoEmail, defaultPass);
          toast.success(`Welcome back! Logged in as ${demoEmail}`);
          navigate("/");
        } catch (fallbackErr) {
          toast.error(fallbackErr.response?.data?.detail || "Login failed");
        }
      } else {
        toast.error(err.response?.data?.detail || "Login failed");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen w-full flex flex-col md:flex-row bg-background">
      {/* Left Panel: Hero Section */}
      <div className="relative w-full md:w-1/2 lg:w-[60%] p-12 flex flex-col justify-between bg-grid">
        <div className="flex flex-col space-y-1">
          <div className="flex items-center gap-2">
            <div className="p-1.5 bg-blue-600 rounded flex items-center justify-center shadow-lg shadow-blue-500/20">
              <Sparkle className="text-white w-4 h-4" />
            </div>
            <span className="font-heading font-bold text-lg tracking-tighter text-blue-900">GoalGrid</span>
          </div>
          <span className="text-[10px] text-blue-600/70 uppercase font-bold tracking-widest pl-8">In-house Portal</span>
        </div>

        <div className="max-w-xl space-y-6">
          <div className="space-y-1 text-slate-900">
            <h1 className="text-5xl lg:text-6xl font-heading font-bold tracking-tight leading-[1.1]">
              Align teams.<br />
              Measure outcomes.<br />
              <span className="text-blue-500/50">Ship every quarter.</span>
            </h1>
          </div>
          <p className="text-slate-600 text-sm leading-relaxed max-w-sm">
            Set OKRs and KPIs, track quarterly progress with approvals, locked goals and a complete audit trail.
          </p>
        </div>

        <div className="text-[10px] text-muted-foreground font-mono">
          v1.0 • org-of-record
        </div>
      </div>

      {/* Right Panel: Login Form */}
      <div className="w-full md:w-1/2 lg:w-[40%] flex items-center justify-center p-8 bg-white dark:bg-black">
        <div className="w-full max-w-sm space-y-8">
          <Card className="border-none shadow-none bg-transparent">
            <CardHeader className="px-0 pt-0">
              <CardTitle className="text-3xl font-heading font-bold">Sign in</CardTitle>
              <CardDescription className="text-sm">Access your goals workspace</CardDescription>
            </CardHeader>
            <CardContent className="px-0 py-6">
              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Email</label>
                  <Input 
                    type="email" 
                    placeholder="admin@company.com" 
                    value={email} 
                    onChange={(e) => setEmail(e.target.value)} 
                    required 
                    className="bg-white border-muted h-10"
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Password</label>
                  <Input 
                    type="password" 
                    placeholder="••••••••" 
                    value={password} 
                    onChange={(e) => setPassword(e.target.value)} 
                    required 
                    className="bg-white border-muted h-10"
                  />
                </div>
                <Button type="submit" className="w-full bg-blue-600 hover:bg-blue-700 text-white h-10 rounded-lg shadow-lg shadow-blue-500/20" disabled={loading}>
                  {loading ? "Signing in..." : "Sign in"}
                </Button>
              </form>
            </CardContent>
            <CardFooter className="px-0 flex flex-col items-start space-y-8">
              <div className="text-xs text-muted-foreground">
                New here?{" "}
                <Link to="/register" className="text-blue-600 hover:underline font-bold">
                  Create account
                </Link>
              </div>

              <div className="w-full space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-bold uppercase tracking-widest text-slate-400">Quick Access Demo Accounts</span>
                  <span className="text-[9px] font-semibold text-blue-500/80 bg-blue-500/10 px-2 py-0.5 rounded-full">One-click login</span>
                </div>
                
                <div className="grid grid-cols-1 gap-2.5 w-full">
                  {/* Admin Account */}
                  <button 
                    type="button"
                    disabled={loading}
                    onClick={() => handleDemoClick("admin@company.com", "Admin@123")}
                    className="group relative flex items-center justify-between w-full p-3 rounded-xl border border-slate-100 bg-slate-50/50 hover:bg-blue-50/40 hover:border-blue-200 hover:shadow-md hover:shadow-blue-500/5 transition-all duration-300 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed text-left"
                  >
                    <div className="flex items-center gap-3">
                      <div className="p-2 bg-blue-100/80 text-blue-600 rounded-lg group-hover:bg-blue-200/80 transition-colors">
                        <Shield className="w-3.5 h-3.5" />
                      </div>
                      <div>
                        <div className="font-semibold text-xs text-slate-800 flex items-center gap-1.5">
                          Admin Console
                          <span className="text-[8px] font-bold px-1.5 py-0.5 bg-blue-100 text-blue-800 rounded-full">Admin</span>
                        </div>
                        <div className="text-[10px] text-slate-400 font-mono mt-0.5">admin@company.com</div>
                      </div>
                    </div>
                    <ArrowRight className="w-3.5 h-3.5 text-slate-300 group-hover:text-blue-600 group-hover:translate-x-1 transition-all" />
                  </button>

                  {/* Manager Account */}
                  <button 
                    type="button"
                    disabled={loading}
                    onClick={() => handleDemoClick("manager@company.com", "Manager@123")}
                    className="group relative flex items-center justify-between w-full p-3 rounded-xl border border-slate-100 bg-slate-50/50 hover:bg-emerald-50/40 hover:border-emerald-200 hover:shadow-md hover:shadow-emerald-500/5 transition-all duration-300 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed text-left"
                  >
                    <div className="flex items-center gap-3">
                      <div className="p-2 bg-emerald-100/80 text-emerald-600 rounded-lg group-hover:bg-emerald-200/80 transition-colors">
                        <Users className="w-3.5 h-3.5" />
                      </div>
                      <div>
                        <div className="font-semibold text-xs text-slate-800 flex items-center gap-1.5">
                          Manager Dashboard
                          <span className="text-[8px] font-bold px-1.5 py-0.5 bg-emerald-100 text-emerald-800 rounded-full">Manager</span>
                        </div>
                        <div className="text-[10px] text-slate-400 font-mono mt-0.5">manager@company.com</div>
                      </div>
                    </div>
                    <ArrowRight className="w-3.5 h-3.5 text-slate-300 group-hover:text-emerald-600 group-hover:translate-x-1 transition-all" />
                  </button>

                  {/* Employee Account */}
                  <button 
                    type="button"
                    disabled={loading}
                    onClick={() => handleDemoClick("alice@company.com", "Alice@123")}
                    className="group relative flex items-center justify-between w-full p-3 rounded-xl border border-slate-100 bg-slate-50/50 hover:bg-violet-50/40 hover:border-violet-200 hover:shadow-md hover:shadow-violet-500/5 transition-all duration-300 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed text-left"
                  >
                    <div className="flex items-center gap-3">
                      <div className="p-2 bg-violet-100/80 text-violet-600 rounded-lg group-hover:bg-violet-200/80 transition-colors">
                        <User className="w-3.5 h-3.5" />
                      </div>
                      <div>
                        <div className="font-semibold text-xs text-slate-800 flex items-center gap-1.5">
                          Employee Portal
                          <span className="text-[8px] font-bold px-1.5 py-0.5 bg-violet-100 text-violet-800 rounded-full">Employee</span>
                        </div>
                        <div className="text-[10px] text-slate-400 font-mono mt-0.5">alice@company.com</div>
                      </div>
                    </div>
                    <ArrowRight className="w-3.5 h-3.5 text-slate-300 group-hover:text-violet-600 group-hover:translate-x-1 transition-all" />
                  </button>
                </div>
              </div>
            </CardFooter>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default Login;
