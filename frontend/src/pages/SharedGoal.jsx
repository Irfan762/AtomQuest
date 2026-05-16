import { useState, useEffect } from "react";
import api from "../lib/api";
import { Button } from "../components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "../components/ui/card";
import { Badge } from "../components/ui/badge";
import { Input } from "../components/ui/input";
import { Share2, Users, Target, CheckCircle2, AlertTriangle, Search, Filter, Send } from "lucide-react";
import { toast } from "sonner";

const SharedGoal = () => {
  const [employees, setEmployees] = useState([]);
  const [selectedIds, setSelectedIds] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    thrust_area: "",
    uom_type: "numeric",
    target: "",
    weightage: "10",
    deadline: "",
    progress_direction: "max"
  });

  useEffect(() => {
    fetchEmployees();
  }, []);

  const fetchEmployees = async () => {
    try {
      const { data } = await api.get("/users");
      // Filter for employees only (not managers/admins usually, though they can have goals too)
      setEmployees(data.filter(u => u.role === "employee"));
    } catch (err) {
      toast.error("Failed to fetch employees");
    } finally {
      setLoading(false);
    }
  };

  const toggleSelect = (id) => {
    setSelectedIds(prev => 
      prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]
    );
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (selectedIds.length === 0) {
      toast.error("Please select at least one employee");
      return;
    }
    setSubmitting(true);
    try {
      const { data } = await api.post("/goals/shared", {
        ...formData,
        employee_ids: selectedIds
      });
      
      const successCount = data.created_goal_ids.length;
      const skipCount = data.skipped.length;
      
      toast.success(`KPI pushed to ${successCount} employees.`);
      if (skipCount > 0) {
        toast.warning(`${skipCount} employees skipped due to weightage limits.`);
      }
      
      setSelectedIds([]);
      setFormData({
        title: "", description: "", thrust_area: "", uom_type: "numeric",
        target: "", weightage: "10", deadline: "", progress_direction: "max"
      });
    } catch (err) {
      toast.error(err.response?.data?.detail || "Failed to push shared KPI");
    } finally {
      setSubmitting(false);
    }
  };

  const filteredEmployees = employees.filter(e => 
    e.name.toLowerCase().includes(search.toLowerCase()) || 
    (e.department || "").toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-8 max-w-7xl mx-auto">
      <div>
        <h1 className="text-3xl font-heading font-bold tracking-tighter">Push Shared KPI</h1>
        <p className="text-muted-foreground">Broadcast a standardized goal to multiple team members simultaneously.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* KPI Definition Form */}
        <Card className="glass">
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <Target className="w-5 h-5 text-primary" /> Goal Definition
            </CardTitle>
            <CardDescription>All fields except weightage will be read-only for employees.</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">KPI Title</label>
                <Input 
                  placeholder="e.g. Annual Compliance Training" 
                  value={formData.title}
                  onChange={(e) => setFormData({...formData, title: e.target.value})}
                  required 
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium">Thrust Area</label>
                  <Input 
                    placeholder="e.g. Compliance" 
                    value={formData.thrust_area}
                    onChange={(e) => setFormData({...formData, thrust_area: e.target.value})}
                    required 
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">UoM Type</label>
                  <select 
                    className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                    value={formData.uom_type}
                    onChange={(e) => setFormData({...formData, uom_type: e.target.value})}
                  >
                    <option value="numeric">Numeric</option>
                    <option value="percentage">Percentage</option>
                    <option value="timeline">Timeline</option>
                    <option value="zero">Zero-based</option>
                  </select>
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">Target Value</label>
                  <Input 
                    type="number" 
                    placeholder="100" 
                    value={formData.target}
                    onChange={(e) => setFormData({...formData, target: e.target.value})}
                    required 
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">Default Weight (%)</label>
                  <Input 
                    type="number" 
                    value={formData.weightage}
                    onChange={(e) => setFormData({...formData, weightage: e.target.value})}
                    required 
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">Deadline</label>
                  <Input 
                    type="date" 
                    value={formData.deadline}
                    onChange={(e) => setFormData({...formData, deadline: e.target.value})}
                    required 
                  />
                </div>
                <div className="space-y-2">
                   <label className="text-sm font-medium">Direction</label>
                   <select 
                      className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                      value={formData.progress_direction}
                      onChange={(e) => setFormData({...formData, progress_direction: e.target.value})}
                    >
                      <option value="max">Maximize</option>
                      <option value="min">Minimize</option>
                    </select>
                </div>
              </div>
              <Button type="submit" className="w-full gap-2 mt-4" disabled={submitting || selectedIds.length === 0}>
                {submitting ? "Pushing..." : (
                  <>
                    <Send className="w-4 h-4" /> Push KPI to {selectedIds.length} Employees
                  </>
                )}
              </Button>
            </form>
          </CardContent>
        </Card>

        {/* Employee Selection */}
        <Card className="glass flex flex-col">
          <CardHeader>
             <CardTitle className="text-lg flex items-center justify-between">
               <div className="flex items-center gap-2">
                 <Users className="w-5 h-5 text-primary" /> Select Recipients
               </div>
               <Badge variant="secondary">{selectedIds.length} Selected</Badge>
             </CardTitle>
             <div className="relative mt-2">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input 
                  placeholder="Filter by name or department..." 
                  className="pl-10 h-9 bg-secondary/30" 
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                />
             </div>
          </CardHeader>
          <CardContent className="flex-1 overflow-y-auto max-h-[450px]">
             {loading ? (
               <div className="text-center py-12">Loading...</div>
             ) : (
               <div className="space-y-1">
                 {filteredEmployees.map((emp) => (
                   <div 
                    key={emp.id}
                    onClick={() => toggleSelect(emp.id)}
                    className={`flex items-center justify-between p-3 rounded-lg cursor-pointer transition-colors ${
                      selectedIds.includes(emp.id) ? "bg-primary/10 border-primary/20" : "hover:bg-secondary/50"
                    }`}
                   >
                     <div className="flex items-center gap-3">
                       <div className="w-8 h-8 rounded-full bg-accent flex items-center justify-center font-bold text-xs uppercase">
                         {emp.name[0]}
                       </div>
                       <div>
                         <div className="text-sm font-medium">{emp.name}</div>
                         <div className="text-[10px] text-muted-foreground">{emp.department || "No Department"}</div>
                       </div>
                     </div>
                     <div className={`w-5 h-5 rounded-md border flex items-center justify-center transition-colors ${
                       selectedIds.includes(emp.id) ? "bg-primary border-primary" : "border-border"
                     }`}>
                       {selectedIds.includes(emp.id) && <CheckCircle2 className="w-3.5 h-3.5 text-primary-foreground" />}
                     </div>
                   </div>
                 ))}
               </div>
             )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default SharedGoal;
