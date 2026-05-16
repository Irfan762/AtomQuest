import { useState, useEffect } from "react";
import api from "../lib/api";
import { Button } from "../components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "../components/ui/card";
import { Badge } from "../components/ui/badge";
import { Input } from "../components/ui/input";
import { UserPlus, UserX, User, Mail, Briefcase, Shield, Search, Trash2 } from "lucide-react";
import { toast } from "sonner";

const Users = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      const { data } = await api.get("/users");
      setUsers(data);
    } catch (err) {
      toast.error("Failed to fetch users");
    } finally {
      setLoading(false);
    }
  };

  const deleteUser = async (id) => {
    if (!window.confirm("Are you sure you want to delete this user?")) return;
    try {
      await api.delete(`/users/${id}`);
      toast.success("User removed");
      fetchUsers();
    } catch (err) {
      toast.error("Failed to delete user");
    }
  };

  const filteredUsers = users.filter(u => 
    u.name.toLowerCase().includes(search.toLowerCase()) || 
    u.email.toLowerCase().includes(search.toLowerCase()) ||
    (u.department || "").toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-8 max-w-6xl mx-auto">
      <div className="flex items-end justify-between">
        <div>
          <h1 className="text-3xl font-heading font-bold tracking-tighter">User Management</h1>
          <p className="text-muted-foreground">Manage organization members and their access levels.</p>
        </div>
        <Button size="sm" className="gap-2" onClick={() => toast.info("Add user feature coming soon")}>
          <UserPlus className="w-4 h-4" /> Add User
        </Button>
      </div>

      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
        <Input 
          placeholder="Search users by name, email or department..." 
          className="pl-10 glass border-primary/20 focus:border-primary/50 focus:ring-1 focus:ring-primary/20" 
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {loading ? (
          <div className="col-span-full text-center py-12">Loading users...</div>
        ) : filteredUsers.map((u) => (
          <Card key={u.id} className="glass group hover:border-primary/50 transition-all duration-300">
            <CardHeader className="pb-3 flex flex-row items-start justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-secondary flex items-center justify-center text-secondary-foreground font-bold shrink-0">
                  {u.name[0]}
                </div>
                <div>
                  <CardTitle className="text-base">{u.name}</CardTitle>
                  <Badge variant="secondary" className="text-[10px] uppercase font-bold tracking-widest mt-1">
                    {u.role}
                  </Badge>
                </div>
              </div>
              <Button 
                variant="ghost" 
                size="icon" 
                className="h-8 w-8 text-destructive opacity-0 group-hover:opacity-100 transition-opacity"
                onClick={() => deleteUser(u.id)}
              >
                <Trash2 className="w-4 h-4" />
              </Button>
            </CardHeader>
            <CardContent className="space-y-3 pt-0">
               <div className="space-y-2">
                  <div className="flex items-center gap-2 text-xs text-muted-foreground">
                    <Mail className="w-3.5 h-3.5" /> {u.email}
                  </div>
                  <div className="flex items-center gap-2 text-xs text-muted-foreground">
                    <Briefcase className="w-3.5 h-3.5" /> {u.department || "No Department"}
                  </div>
                  <div className="flex items-center gap-2 text-xs text-muted-foreground">
                    <Shield className="w-3.5 h-3.5" /> Reporting to: {u.manager_id ? "Manager" : "None"}
                  </div>
               </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
};

export default Users;
