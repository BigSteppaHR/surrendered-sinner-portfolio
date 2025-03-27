
import React, { useState, useEffect } from 'react';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import AdminLayout from '@/components/admin/AdminLayout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { AlertCircle, CheckCircle, MoreHorizontal, Search, UserPlus, Users } from 'lucide-react';

const AdminUsers = () => {
  const { toast } = useToast();
  const [users, setUsers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [filter, setFilter] = useState('all');
  
  useEffect(() => {
    fetchUsers();
  }, []);
  
  const fetchUsers = async () => {
    try {
      setLoading(true);
      
      // Fetch users and their profiles
      const { data: usersData, error: usersError } = await supabase
        .from('profiles')
        .select(`
          *,
          auth_user:user_id (
            email,
            last_sign_in_at,
            created_at,
            updated_at
          )
        `)
        .order('created_at', { ascending: false });
      
      if (usersError) throw usersError;
      
      setUsers(usersData || []);
    } catch (error: any) {
      console.error('Error fetching users:', error);
      toast({
        title: 'Error fetching users',
        description: error.message || 'Failed to load users data',
        variant: 'destructive'
      });
    } finally {
      setLoading(false);
    }
  };
  
  const toggleAdminStatus = async (userId: string, isCurrentlyAdmin: boolean) => {
    try {
      const { error } = await supabase
        .from('profiles')
        .update({ is_admin: !isCurrentlyAdmin })
        .eq('user_id', userId);
      
      if (error) throw error;
      
      // Update local state
      setUsers(users.map(user => 
        user.user_id === userId ? { ...user, is_admin: !isCurrentlyAdmin } : user
      ));
      
      toast({
        title: 'User updated',
        description: `Admin status ${!isCurrentlyAdmin ? 'granted to' : 'revoked from'} user`,
      });
    } catch (error: any) {
      console.error('Error updating user:', error);
      toast({
        title: 'Error updating user',
        description: error.message || 'Failed to update user',
        variant: 'destructive'
      });
    }
  };
  
  // Filter and search users
  const filteredUsers = users.filter(user => {
    // Apply filter
    if (filter === 'admin' && !user.is_admin) return false;
    if (filter === 'active' && user.status !== 'active') return false;
    if (filter === 'inactive' && user.status === 'active') return false;
    
    // Apply search
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      return (
        (user.full_name && user.full_name.toLowerCase().includes(query)) ||
        (user.auth_user?.email && user.auth_user.email.toLowerCase().includes(query))
      );
    }
    
    return true;
  });
  
  return (
    <AdminLayout>
      <div className="container mx-auto p-6">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-bold">User Management</h1>
            <p className="text-muted-foreground">View and manage user accounts</p>
          </div>
          <Button className="bg-[#ea384c] hover:bg-red-700">
            <UserPlus className="h-4 w-4 mr-2" />
            Add User
          </Button>
        </div>
        
        <div className="grid gap-6">
          <Card>
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>Users</CardTitle>
                  <CardDescription>
                    Total {users.length} users, {users.filter(u => u.is_admin).length} admins
                  </CardDescription>
                </div>
                <div className="flex items-center space-x-2">
                  <div className="relative">
                    <Search className="h-4 w-4 absolute left-2.5 top-2.5 text-gray-500" />
                    <Input
                      placeholder="Search users..."
                      className="pl-8 w-[250px]"
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                    />
                  </div>
                  
                  <Tabs defaultValue="all" value={filter} onValueChange={setFilter}>
                    <TabsList>
                      <TabsTrigger value="all">All</TabsTrigger>
                      <TabsTrigger value="admin">Admins</TabsTrigger>
                      <TabsTrigger value="active">Active</TabsTrigger>
                      <TabsTrigger value="inactive">Inactive</TabsTrigger>
                    </TabsList>
                  </Tabs>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              {loading ? (
                <div className="flex justify-center py-8">
                  <div className="h-8 w-8 animate-spin rounded-full border-4 border-solid border-[#ea384c] border-r-transparent"></div>
                </div>
              ) : filteredUsers.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  <Users className="h-12 w-12 mx-auto mb-3 opacity-50" />
                  <h3 className="text-lg font-medium">No users found</h3>
                  <p>Try adjusting your search or filter criteria</p>
                </div>
              ) : (
                <ScrollArea className="h-[500px]">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b">
                        <th className="text-left py-3 px-4 font-medium text-xs uppercase tracking-wider">User</th>
                        <th className="text-left py-3 px-4 font-medium text-xs uppercase tracking-wider">Status</th>
                        <th className="text-left py-3 px-4 font-medium text-xs uppercase tracking-wider">Role</th>
                        <th className="text-left py-3 px-4 font-medium text-xs uppercase tracking-wider">Last Login</th>
                        <th className="text-right py-3 px-4 font-medium text-xs uppercase tracking-wider">Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {filteredUsers.map((user) => (
                        <tr key={user.id} className="border-b hover:bg-muted/30">
                          <td className="py-3 px-4">
                            <div className="flex items-center space-x-3">
                              <Avatar>
                                <AvatarImage src={user.avatar_url} />
                                <AvatarFallback>{user.full_name?.split(' ').map((n: string) => n[0]).join('') || 'U'}</AvatarFallback>
                              </Avatar>
                              <div>
                                <div className="font-medium">{user.full_name || 'Unnamed User'}</div>
                                <div className="text-sm text-muted-foreground">{user.auth_user?.email}</div>
                              </div>
                            </div>
                          </td>
                          <td className="py-3 px-4">
                            {user.status === 'active' ? (
                              <Badge className="bg-green-500/20 text-green-500 hover:bg-green-500/30">Active</Badge>
                            ) : (
                              <Badge variant="outline">Inactive</Badge>
                            )}
                          </td>
                          <td className="py-3 px-4">
                            {user.is_admin ? (
                              <Badge className="bg-purple-500/20 text-purple-500 hover:bg-purple-500/30">Admin</Badge>
                            ) : (
                              <Badge variant="outline">User</Badge>
                            )}
                          </td>
                          <td className="py-3 px-4 text-sm text-muted-foreground">
                            {user.auth_user?.last_sign_in_at 
                              ? new Date(user.auth_user.last_sign_in_at).toLocaleString() 
                              : 'Never'}
                          </td>
                          <td className="py-3 px-4 text-right">
                            <DropdownMenu>
                              <DropdownMenuTrigger asChild>
                                <Button variant="ghost" size="icon">
                                  <MoreHorizontal className="h-4 w-4" />
                                </Button>
                              </DropdownMenuTrigger>
                              <DropdownMenuContent align="end">
                                <DropdownMenuLabel>Actions</DropdownMenuLabel>
                                <DropdownMenuSeparator />
                                <DropdownMenuItem>View Details</DropdownMenuItem>
                                <DropdownMenuItem>Edit Profile</DropdownMenuItem>
                                <DropdownMenuItem 
                                  onClick={() => toggleAdminStatus(user.user_id, user.is_admin)}
                                >
                                  {user.is_admin ? 'Remove Admin Role' : 'Make Admin'}
                                </DropdownMenuItem>
                                <DropdownMenuSeparator />
                                <DropdownMenuItem className="text-red-500">Delete Account</DropdownMenuItem>
                              </DropdownMenuContent>
                            </DropdownMenu>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </ScrollArea>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </AdminLayout>
  );
};

export default AdminUsers;
