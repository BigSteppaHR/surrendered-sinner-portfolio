import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, ResponsiveContainer, PieChart, Pie, Cell, Legend, LineChart, Line, AreaChart, Area } from 'recharts';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Calendar, Download, ArrowUpRight, ArrowDown, Users, DollarSign, Clock, TrendingUp } from "lucide-react";
import { Button } from "@/components/ui/button";
import { DatePickerWithRange } from '@/components/ui/date-range-picker';
import { supabase } from "@/integrations/supabase/client";
import { Skeleton } from "@/components/ui/skeleton";
import { useToast } from "@/hooks/use-toast";

const AdminAnalytics = () => {
  const [date, setDate] = useState({
    from: new Date(new Date().setDate(new Date().getDate() - 30)),
    to: new Date(),
  });
  const [revenueData, setRevenueData] = useState<any[]>([]);
  const [userSignupData, setUserSignupData] = useState<any[]>([]);
  const [sessionData, setSessionData] = useState<any[]>([]);
  const [planDistribution, setPlanDistribution] = useState<any[]>([]);
  const [activityData, setActivityData] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();
  
  const [stats, setStats] = useState({
    totalMembers: '0',
    activeSubscriptions: '0',
    monthlyRevenue: '$0',
    sessionCompletion: '0%',
    memberChange: '+0%',
    subscriptionChange: '+0%',
    revenueChange: '+0%',
    sessionCompletionChange: '+0%'
  });

  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);
      try {
        const { data: revenueResult, error: revenueError } = await supabase
          .from('revenue_data')
          .select('*')
          .order('id');
          
        if (revenueError) throw revenueError;
        setRevenueData(revenueResult || []);

        const { data: profilesData, error: profilesError } = await supabase
          .from('profiles')
          .select('created_at')
          .order('created_at');
          
        if (profilesError) throw profilesError;
        
        const signupsByMonth: {[key: string]: number} = {};
        const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
        
        profilesData?.forEach(profile => {
          const date = new Date(profile.created_at);
          const monthKey = months[date.getMonth()];
          signupsByMonth[monthKey] = (signupsByMonth[monthKey] || 0) + 1;
        });
        
        const signupData = Object.entries(signupsByMonth).map(([name, value]) => ({ name, value }));
        setUserSignupData(signupData);
        
        const { data: sessionsData, error: sessionsError } = await supabase
          .from('user_sessions')
          .select('session_time');
          
        if (sessionsError) throw sessionsError;
        
        const sessionsByDay: {[key: string]: number} = {};
        const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
        
        sessionsData?.forEach(session => {
          const date = new Date(session.session_time);
          const dayKey = days[date.getDay()];
          sessionsByDay[dayKey] = (sessionsByDay[dayKey] || 0) + 1;
        });
        
        days.forEach(day => {
          if (!sessionsByDay[day]) sessionsByDay[day] = 0;
        });
        
        const sortedSessionData = days.map(day => ({
          name: day,
          value: sessionsByDay[day] || 0
        }));
        
        setSessionData(sortedSessionData);
        
        const { data: subscriptionsData, error: subscriptionsError } = await supabase
          .from('user_subscriptions')
          .select(`
            package_id,
            subscription_packages(name)
          `)
          .eq('is_active', true);
          
        if (subscriptionsError) throw subscriptionsError;
        
        const planCounts: {[key: string]: number} = {};
        subscriptionsData?.forEach(subscription => {
          let planName = 'Unknown Plan';
          
          if (subscription.subscription_packages) {
            const packageData = subscription.subscription_packages;
            
            if (Array.isArray(packageData) && packageData.length > 0) {
              planName = String(packageData[0].name || 'Unknown Plan');
            } 
            else if (typeof packageData === 'object' && packageData !== null && 'name' in packageData) {
              planName = String(packageData.name || 'Unknown Plan');
            }
          }
          
          planCounts[planName] = (planCounts[planName] || 0) + 1;
        });
        
        const planColors: {[key: string]: string} = {
          'Basic Plan': '#ea384c',
          'Pro Plan': '#8884d8',
          'Elite Plan': '#82ca9d',
          'Custom Plan': '#ffc658',
          'Unknown Plan': '#d0d0d0'
        };
        
        const planDistributionData = Object.entries(planCounts).map(([name, value]) => ({
          name,
          value,
          color: planColors[name as keyof typeof planColors] || `#${Math.floor(Math.random()*16777215).toString(16)}`
        }));
        
        setPlanDistribution(planDistributionData);
        
        const { data: recentActivity, error: activityError } = await supabase
          .from('support_tickets')
          .select('id, subject, created_at, status')
          .order('created_at', { ascending: false })
          .limit(3);
          
        if (activityError) throw activityError;
        
        const { data: recentPayments, error: paymentsError } = await supabase
          .from('payments')
          .select('id, amount, created_at, status')
          .order('created_at', { ascending: false })
          .limit(2);
          
        if (paymentsError) throw paymentsError;
        
        const activityItems = [
          ...(recentActivity?.map(ticket => ({
            id: ticket.id,
            event: "Support ticket",
            description: `${ticket.subject} (${ticket.status})`,
            time: formatTimeAgo(new Date(ticket.created_at))
          })) || []),
          ...(recentPayments?.map(payment => ({
            id: payment.id,
            event: "Payment received",
            description: `$${payment.amount} (${payment.status})`,
            time: formatTimeAgo(new Date(payment.created_at))
          })) || [])
        ].sort((a, b) => timeAgoToSeconds(a.time) - timeAgoToSeconds(b.time));
        
        setActivityData(activityItems);
        
        const totalMembers = profilesData?.length || 0;
        const activeSubscriptions = subscriptionsData?.length || 0;
        const monthlyRevenue = recentPayments?.reduce((total, payment) => total + (payment.amount || 0), 0) || 0;
        
        setStats({
          totalMembers: totalMembers.toString(),
          activeSubscriptions: activeSubscriptions.toString(),
          monthlyRevenue: `$${monthlyRevenue}`,
          sessionCompletion: '92%',
          memberChange: '+12%',
          subscriptionChange: '+5%',
          revenueChange: '+8%',
          sessionCompletionChange: '-3%'
        });
      } catch (error) {
        console.error('Error fetching analytics data:', error);
        toast({
          title: 'Error fetching analytics data',
          description: 'There was a problem loading the analytics data. Please try again.',
          variant: 'destructive',
        });
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchData();
    
    const channel = supabase
      .channel('analytics-changes')
      .on('postgres_changes', 
        { event: '*', schema: 'public', table: 'payments' }, 
        () => fetchData()
      )
      .on('postgres_changes', 
        { event: '*', schema: 'public', table: 'user_sessions' }, 
        () => fetchData()
      )
      .on('postgres_changes', 
        { event: '*', schema: 'public', table: 'profiles' }, 
        () => fetchData()
      )
      .on('postgres_changes', 
        { event: '*', schema: 'public', table: 'user_subscriptions' }, 
        () => fetchData()
      )
      .on('postgres_changes', 
        { event: '*', schema: 'public', table: 'support_tickets' }, 
        () => fetchData()
      )
      .on('postgres_changes', 
        { event: '*', schema: 'public', table: 'analytics_dashboards' }, 
        () => fetchData()
      )
      .on('postgres_changes', 
        { event: '*', schema: 'public', table: 'admin_tasks' }, 
        () => fetchData()
      )
      .subscribe();
      
    return () => {
      supabase.removeChannel(channel);
    };
  }, [toast]);
  
  const formatTimeAgo = (date: Date) => {
    const seconds = Math.floor((new Date().getTime() - date.getTime()) / 1000);
    
    if (seconds < 60) return `${seconds} seconds ago`;
    if (seconds < 3600) return `${Math.floor(seconds / 60)} minutes ago`;
    if (seconds < 86400) return `${Math.floor(seconds / 3600)} hours ago`;
    if (seconds < 172800) return `Yesterday`;
    if (seconds < 604800) return `${Math.floor(seconds / 86400)} days ago`;
    
    return new Date(date).toLocaleDateString();
  };
  
  const timeAgoToSeconds = (timeAgo: string) => {
    if (timeAgo.includes('seconds')) return parseInt(timeAgo.split(' ')[0]);
    if (timeAgo.includes('minutes')) return parseInt(timeAgo.split(' ')[0]) * 60;
    if (timeAgo.includes('hours')) return parseInt(timeAgo.split(' ')[0]) * 3600;
    if (timeAgo.includes('Yesterday')) return 86400;
    if (timeAgo.includes('days')) return parseInt(timeAgo.split(' ')[0]) * 86400;
    return 604800; // default to a week
  };
  
  const handleExportData = () => {
    const csvData = revenueData.map(item => `${item.name},${item.value}`).join('\n');
    const blob = new Blob([`Month,Revenue\n${csvData}`], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'revenue-data.csv';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    
    toast({
      title: 'Data exported',
      description: 'The analytics data has been exported as a CSV file.',
    });
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Analytics Dashboard</h1>
          <p className="text-gray-400 mt-1">View insights about your fitness business</p>
        </div>
        
        <div className="flex items-center gap-4">
          <DatePickerWithRange date={date} setDate={setDate} />
          
          <Button variant="outline" className="gap-2" onClick={handleExportData}>
            <Download className="h-4 w-4" />
            Export
          </Button>
        </div>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {isLoading ? (
          <>
            {[1, 2, 3, 4].map(i => (
              <Card key={i} className="bg-[#0f0f0f] border-[#1a1a1a]">
                <CardContent className="p-6">
                  <Skeleton className="h-6 w-24 mb-2 bg-gray-700" />
                  <Skeleton className="h-8 w-16 mb-4 bg-gray-700" />
                  <Skeleton className="h-4 w-32 bg-gray-700" />
                </CardContent>
              </Card>
            ))}
          </>
        ) : (
          <>
            <StatCard 
              title="Total Members" 
              value={stats.totalMembers} 
              change={stats.memberChange} 
              changeType={stats.memberChange.startsWith('+') ? 'positive' : 'negative'} 
              icon={<Users className="h-5 w-5" />} 
            />
            <StatCard 
              title="Active Subscriptions" 
              value={stats.activeSubscriptions} 
              change={stats.subscriptionChange} 
              changeType={stats.subscriptionChange.startsWith('+') ? 'positive' : 'negative'} 
              icon={<TrendingUp className="h-5 w-5" />} 
            />
            <StatCard 
              title="Monthly Revenue" 
              value={stats.monthlyRevenue} 
              change={stats.revenueChange} 
              changeType={stats.revenueChange.startsWith('+') ? 'positive' : 'negative'} 
              icon={<DollarSign className="h-5 w-5" />} 
            />
            <StatCard 
              title="Session Completion" 
              value={stats.sessionCompletion} 
              change={stats.sessionCompletionChange} 
              changeType={stats.sessionCompletionChange.startsWith('+') ? 'positive' : 'negative'} 
              icon={<Clock className="h-5 w-5" />} 
            />
          </>
        )}
      </div>
      
      <Tabs defaultValue="revenue" className="w-full">
        <TabsList className="bg-[#1a1a1a] border-b border-[#333]">
          <TabsTrigger value="revenue">Revenue</TabsTrigger>
          <TabsTrigger value="users">User Growth</TabsTrigger>
          <TabsTrigger value="sessions">Sessions</TabsTrigger>
          <TabsTrigger value="plans">Plan Distribution</TabsTrigger>
        </TabsList>
        
        <TabsContent value="revenue" className="pt-4">
          <Card className="bg-[#0f0f0f] border-[#1a1a1a]">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <DollarSign className="h-5 w-5 text-[#ea384c]" /> 
                Revenue Over Time
              </CardTitle>
              <CardDescription>Monthly revenue data</CardDescription>
            </CardHeader>
            <CardContent className="h-[400px]">
              {isLoading ? (
                <div className="w-full h-full flex items-center justify-center">
                  <Skeleton className="w-full h-[90%] bg-gray-700/20" />
                </div>
              ) : (
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={revenueData}>
                    <defs>
                      <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#ea384c" stopOpacity={0.8}/>
                        <stop offset="95%" stopColor="#ea384c" stopOpacity={0}/>
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="#333" />
                    <XAxis dataKey="name" stroke="#666" />
                    <YAxis stroke="#666" />
                    <RechartsTooltip 
                      contentStyle={{ backgroundColor: '#1a1a1a', borderColor: '#333', borderRadius: '0.375rem' }}
                      formatter={(value) => [`$${value}`, 'Revenue']}
                    />
                    <Area 
                      type="monotone" 
                      dataKey="value" 
                      stroke="#ea384c" 
                      fill="url(#colorRevenue)" 
                      activeDot={{ r: 8 }}
                    />
                  </AreaChart>
                </ResponsiveContainer>
              )}
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="users" className="pt-4">
          <Card className="bg-[#0f0f0f] border-[#1a1a1a]">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Users className="h-5 w-5 text-[#ea384c]" /> 
                New User Signups
              </CardTitle>
              <CardDescription>Monthly user registration data</CardDescription>
            </CardHeader>
            <CardContent className="h-[400px]">
              {isLoading ? (
                <div className="w-full h-full flex items-center justify-center">
                  <Skeleton className="w-full h-[90%] bg-gray-700/20" />
                </div>
              ) : (
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={userSignupData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#333" />
                    <XAxis dataKey="name" stroke="#666" />
                    <YAxis stroke="#666" />
                    <RechartsTooltip 
                      contentStyle={{ backgroundColor: '#1a1a1a', borderColor: '#333', borderRadius: '0.375rem' }}
                      formatter={(value) => [value, 'New Users']}
                    />
                    <Bar dataKey="value" fill="#ea384c" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              )}
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="sessions" className="pt-4">
          <Card className="bg-[#0f0f0f] border-[#1a1a1a]">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Calendar className="h-5 w-5 text-[#ea384c]" /> 
                Session Distribution
              </CardTitle>
              <CardDescription>Weekly session distribution</CardDescription>
            </CardHeader>
            <CardContent className="h-[400px]">
              {isLoading ? (
                <div className="w-full h-full flex items-center justify-center">
                  <Skeleton className="w-full h-[90%] bg-gray-700/20" />
                </div>
              ) : (
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={sessionData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#333" />
                    <XAxis dataKey="name" stroke="#666" />
                    <YAxis stroke="#666" />
                    <RechartsTooltip 
                      contentStyle={{ backgroundColor: '#1a1a1a', borderColor: '#333', borderRadius: '0.375rem' }}
                      formatter={(value) => [value, 'Sessions']}
                    />
                    <Line 
                      type="monotone" 
                      dataKey="value" 
                      stroke="#ea384c" 
                      strokeWidth={2}
                      dot={{ r: 4, fill: '#ea384c' }}
                      activeDot={{ r: 8 }}
                    />
                  </LineChart>
                </ResponsiveContainer>
              )}
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="plans" className="pt-4">
          <Card className="bg-[#0f0f0f] border-[#1a1a1a]">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <TrendingUp className="h-5 w-5 text-[#ea384c]" /> 
                Subscription Distribution
              </CardTitle>
              <CardDescription>Active subscriptions by plan</CardDescription>
            </CardHeader>
            <CardContent className="h-[400px]">
              {isLoading ? (
                <div className="w-full h-full flex items-center justify-center">
                  <Skeleton className="w-full h-[90%] bg-gray-700/20" />
                </div>
              ) : planDistribution.length === 0 ? (
                <div className="w-full h-full flex items-center justify-center text-gray-400">
                  No subscription data available
                </div>
              ) : (
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={planDistribution}
                      cx="50%"
                      cy="50%"
                      innerRadius={60}
                      outerRadius={120}
                      fill="#8884d8"
                      paddingAngle={5}
                      dataKey="value"
                      label={({name, percent}) => `${name}: ${(percent * 100).toFixed(0)}%`}
                    >
                      {planDistribution.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <RechartsTooltip 
                      contentStyle={{ backgroundColor: '#1a1a1a', borderColor: '#333', borderRadius: '0.375rem' }}
                      formatter={(value, name) => [value, name]}
                    />
                    <Legend />
                  </PieChart>
                </ResponsiveContainer>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
      
      <Card className="bg-[#0f0f0f] border-[#1a1a1a]">
        <CardHeader>
          <CardTitle className="text-xl">Recent Activity</CardTitle>
          <CardDescription>Latest actions on the platform</CardDescription>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="space-y-4">
              {[1, 2, 3].map(i => (
                <div key={i} className="flex justify-between border-b border-[#1a1a1a] pb-4">
                  <div className="space-y-2">
                    <Skeleton className="h-4 w-24 bg-gray-700" />
                    <Skeleton className="h-3 w-48 bg-gray-700" />
                  </div>
                  <Skeleton className="h-3 w-16 bg-gray-700" />
                </div>
              ))}
            </div>
          ) : activityData.length === 0 ? (
            <div className="text-center py-6 text-gray-400">
              No recent activity to display
            </div>
          ) : (
            <div className="space-y-4">
              {activityData.map((activity) => (
                <ActivityItem 
                  key={activity.id}
                  event={activity.event} 
                  description={activity.description}
                  time={activity.time}
                />
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

interface StatCardProps {
  title: string;
  value: string;
  change: string;
  changeType: 'positive' | 'negative';
  icon: React.ReactNode;
}

const StatCard = ({ title, value, change, changeType, icon }: StatCardProps) => {
  return (
    <Card className="bg-[#0f0f0f] border-[#1a1a1a] hover:border-[#333] transition-all">
      <CardContent className="p-6">
        <div className="flex justify-between items-start">
          <div>
            <p className="text-sm font-medium text-gray-400">{title}</p>
            <h3 className="text-2xl font-bold mt-1">{value}</h3>
          </div>
          <div className="p-2 bg-[#ea384c]/10 text-[#ea384c] rounded-lg">
            {icon}
          </div>
        </div>
        <div className={`flex items-center mt-4 text-sm ${
          changeType === 'positive' ? 'text-green-500' : 'text-red-500'
        }`}>
          {changeType === 'positive' ? (
            <ArrowUpRight className="h-4 w-4 mr-1" />
          ) : (
            <ArrowDown className="h-4 w-4 mr-1" />
          )}
          <span>{change} from last month</span>
        </div>
      </CardContent>
    </Card>
  );
};

interface ActivityItemProps {
  event: string;
  description: string;
  time: string;
}

const ActivityItem = ({ event, description, time }: ActivityItemProps) => {
  return (
    <div className="flex items-start pb-4 border-b border-[#1a1a1a] last:border-0 last:pb-0">
      <div className="flex-1">
        <h4 className="font-medium text-white">{event}</h4>
        <p className="text-sm text-gray-400">{description}</p>
      </div>
      <div className="text-xs text-gray-500">{time}</div>
    </div>
  );
};

export default AdminAnalytics;
