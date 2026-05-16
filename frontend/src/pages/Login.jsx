import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { Button } from "../components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "../components/ui/card";
import { Input } from "../components/ui/input";
import { Sparkle } from "lucide-react";
import { toast } from "sonner";

const Login = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const demoEmail = params.get("demo_email");
    if (demoEmail) {
      setEmail(demoEmail);
      setPassword("Password@123");
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

  const handleDemoClick = (demoEmail, demoPassword) => {
    setEmail(demoEmail);
    setPassword(demoPassword);
    toast.info(`Auto-filled ${demoEmail} credentials`);
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

              <div className="w-full bg-secondary/30 p-4 rounded-xl border border-border/50 text-[10px] font-mono text-muted-foreground space-y-2">
                <div className="font-bold uppercase tracking-widest text-muted-foreground/70 mb-1">Demo Accounts</div>
                <div className="grid grid-cols-1 gap-y-1.5">
                  <div 
                    className="flex justify-between hover:text-blue-600 cursor-pointer p-1 rounded hover:bg-blue-50 transition-colors"
                    onClick={() => handleDemoClick("admin@company.com", "admin123")}
                  >
                    <span>admin@company.com</span>
                    <span className="text-right opacity-50">Admin Role</span>
                  </div>
                  <div 
                    className="flex justify-between hover:text-blue-600 cursor-pointer p-1 rounded hover:bg-blue-50 transition-colors"
                    onClick={() => handleDemoClick("manager@company.com", "manager123")}
                  >
                    <span>manager@company.com</span>
                    <span className="text-right opacity-50">Manager Role</span>
                  </div>
                  <div 
                    className="flex justify-between hover:text-blue-600 cursor-pointer p-1 rounded hover:bg-blue-50 transition-colors"
                    onClick={() => handleDemoClick("alice@company.com", "alice123")}
                  >
                    <span>alice@company.com</span>
                    <span className="text-right opacity-50">Employee Role</span>
                  </div>
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
