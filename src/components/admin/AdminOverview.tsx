
import { useEffect, useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { 
  Users, 
  ArrowUpRight, 
  DollarSign, 
  Calendar, 
  MessageSquare,
  ArrowDown,
  Clock,
  CheckCircle2,
  XCircle,
  TrendingUp,
  Bell
} from "lucide-react";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, AreaChart, Area } from 'recharts';
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { format, subDays } from "date-fns";

// Sample data - in a real application, this would come from an API
const revenueData = [
  { name: 'Mon', value: 2500 },
  { name: 'Tue', value: 3200 },
  { name: 'Wed', value: 2800 },
  { name: 'Thu', value: 4100 },
  { name: 'Fri', value: 3800 },
  { name: 'Sat', value: 5100 },
  { name: 'Sun', value: 4200 },
];

const signupData = [
  { name: 'Mon', value: 6 },
  { name: 'Tue', value: 8 },
  { name: 'Wed', value: 5 },
  { name: 'Thu', value: 9 },
  { name: 'Fri', value: 7 },
  { name: 'Sat', value: 12 },
  { name: 'Sun', value: 8 },
];

const planDistribution = [
  { name: 'Basic Plan', value: 35, color: '#ea384c' },
  { name: 'Pro Plan', value: 45, color: '#8884d8' },
  { name: 'Elite Plan', value: 20, color: '#82ca9d' },
];

// Generate random timestamps for the last 30 days
const generateRecentActivity = () => {
  const activities = [
    { type: 'subscription', user: 'John Smith', plan: 'Elite Plan', amount: 249.99 },
    { type: 'payment', user: 'Sarah Johnson', plan: 'Pro Plan', amount: 99.99 },
    { type: 'session', user: 'Michael Brown', plan: 'Basic Plan' },
    { type: 'payment', user: 'Emily Davis', plan: 'Pro Plan', amount: 99.99 },
    { type: 'subscription', user: 'Robert Wilson', plan: 'Basic Plan', amount: 29.99 },
    { type: 'support', user: 'Jessica Thompson', plan: 'Elite Plan' },
    { type: 'subscription', user: 'David Miller', plan: 'Pro Plan', amount: 99.99 },
    { type: 'session', user: 'Amanda Anderson', plan: 'Elite Plan' },
    { type: 'payment', user: 'Daniel Johnson', plan: 'Basic Plan', amount: 29.99 },
    { type: 'support', user: 'Sophia Rodriguez', plan: 'Pro Plan' },
  ];

  return activities.map((activity, index) => {
    const daysAgo = index === 0 ? 0 : Math.floor(Math.random() * 3) + index;
    const hoursAgo = index === 0 ? Math.floor(Math.random() * 3) : 0;
    const date = index === 0 
      ? subDays(new Date(), 0).setHours(new Date().getHours() - hoursAgo) 
      : subDays(new Date(), daysAgo);

    const timestamp = new Date(date).getTime();
    
    return {
      id: `activity-${index + 1}`,
      type: activity.type,
      user: activity.user,
      plan: activity.plan,
      amount: activity.amount,
      timestamp,
    };
  }).sort((a, b) => b.timestamp - a.timestamp);
};

const formatTimeAgo = (timestamp: number) => {
  const now = new Date().getTime();
  const diffInSeconds = Math.floor((now - timestamp) / 1000);
  
  if (diffInSeconds < 60) {
    return `${diffInSeconds} seconds ago`;
  } else if (diffInSeconds < 3600) {
    return `${Math.floor(diffInSeconds / 60)} minutes ago`;
  } else if (diffInSeconds < 86400) {
    return `${Math.floor(diffInSeconds / 3600)} hours ago`;
  } else {
    return `${Math.floor(diffInSeconds / 86400)} days ago`;
  }
};

const AdminOverview = () => {
  const [recentActivity, setRecentActivity] = useState<any[]>([]);
  const [statistics, setStatistics] = useState([
    { id: 'total-users', title: 'Total Users', value: 587, change: '+12%', positive: true, icon: <Users className="h-5 w-5" /> },
    { id: 'monthly-revenue', title: 'Monthly Revenue', value: '$32,580', change: '+8%', positive: true, icon: <DollarSign className="h-5 w-5" /> },
    { id: 'session-completion', title: 'Session Completion', value: '92%', change: '-3%', positive: false, icon: <CheckCircle2 className="h-5 w-5" /> },
    { id: 'active-subscriptions', title: 'Active Subscriptions', value: '427', change: '+5%', positive: true, icon: <TrendingUp className="h-5 w-5" /> },
  ]);
  
  // Generate activity data on component mount
  useEffect(() => {
    setRecentActivity(generateRecentActivity());
  }, []);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Dashboard Overview</h1>
          <p className="text-gray-400 mt-1">Quick insights into your fitness business</p>
        </div>
        <Badge variant="outline" className="bg-[#ea384c]/20 text-[#ea384c] border-[#ea384c]/40 py-1 px-3">
          Admin Portal
        </Badge>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {statistics.map((stat) => (
          <StatCard 
            key={stat.id}
            title={stat.title} 
            value={stat.value} 
            change={stat.change} 
            positive={stat.positive}
            icon={stat.icon}
          />
        ))}
      </div>

      <div className="grid gap-6 grid-cols-1 lg:grid-cols-7">
        <Card className="bg-[#0f0f0f] border-[#1a1a1a] lg:col-span-4">
          <CardHeader>
            <CardTitle className="flex items-center text-xl">
              <DollarSign className="h-5 w-5 mr-2 text-[#ea384c]" />
              Revenue Overview
            </CardTitle>
            <CardDescription>
              Last 7 days of revenue data
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-80">
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
                  <Tooltip 
                    contentStyle={{ backgroundColor: '#1a1a1a', borderColor: '#333', borderRadius: '0.375rem' }}
                    formatter={(value) => [`$${value}`, 'Revenue']}
                  />
                  <Area 
                    type="monotone" 
                    dataKey="value" 
                    stroke="#ea384c" 
                    fillOpacity={1} 
                    fill="url(#colorRevenue)" 
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
        
        <Card className="bg-[#0f0f0f] border-[#1a1a1a] lg:col-span-3">
          <CardHeader>
            <CardTitle className="flex items-center text-xl">
              <Users className="h-5 w-5 mr-2 text-[#ea384c]" />
              New Sign Ups
            </CardTitle>
            <CardDescription>
              Last 7 days of user registrations
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={signupData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#333" />
                  <XAxis dataKey="name" stroke="#666" />
                  <YAxis stroke="#666" />
                  <Tooltip 
                    contentStyle={{ backgroundColor: '#1a1a1a', borderColor: '#333', borderRadius: '0.375rem' }}
                    formatter={(value) => [value, 'New Users']}
                  />
                  <Bar dataKey="value" fill="#ea384c" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-7 gap-6">
        <Card className="bg-[#0f0f0f] border-[#1a1a1a] lg:col-span-3">
          <CardHeader>
            <CardTitle className="flex items-center text-xl">
              <TrendingUp className="h-5 w-5 mr-2 text-[#ea384c]" />
              Subscription Distribution
            </CardTitle>
            <CardDescription>
              Active subscriptions by plan
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-72">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={planDistribution}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={100}
                    fill="#8884d8"
                    paddingAngle={5}
                    dataKey="value"
                    label={({name, percent}) => `${name}: ${(percent * 100).toFixed(0)}%`}
                  >
                    {planDistribution.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip 
                    contentStyle={{ backgroundColor: '#1a1a1a', borderColor: '#333', borderRadius: '0.375rem' }}
                  />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
        
        <Card className="bg-[#0f0f0f] border-[#1a1a1a] lg:col-span-4">
          <CardHeader>
            <CardTitle className="flex items-center text-xl">
              <Bell className="h-5 w-5 mr-2 text-[#ea384c]" />
              Recent Activity
            </CardTitle>
            <CardDescription>
              Latest actions on the platform
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4 max-h-[320px] overflow-y-auto pr-2">
              {recentActivity.map((activity) => {
                let icon, title, description;
                
                switch (activity.type) {
                  case 'subscription':
                    icon = <TrendingUp className="h-8 w-8 p-1.5 rounded-full bg-green-500/10 text-green-500" />;
                    title = `New subscription`;
                    description = `${activity.user} subscribed to ${activity.plan} ($${activity.amount})`;
                    break;
                  case 'payment':
                    icon = <DollarSign className="h-8 w-8 p-1.5 rounded-full bg-blue-500/10 text-blue-500" />;
                    title = `Payment received`;
                    description = `$${activity.amount} payment from ${activity.user}`;
                    break;
                  case 'session':
                    icon = <Calendar className="h-8 w-8 p-1.5 rounded-full bg-purple-500/10 text-purple-500" />;
                    title = `Session scheduled`;
                    description = `${activity.user} scheduled a training session`;
                    break;
                  case 'support':
                    icon = <MessageSquare className="h-8 w-8 p-1.5 rounded-full bg-yellow-500/10 text-yellow-500" />;
                    title = `Support request`;
                    description = `New support request from ${activity.user}`;
                    break;
                  default:
                    icon = <Bell className="h-8 w-8 p-1.5 rounded-full bg-gray-500/10 text-gray-500" />;
                    title = `Activity`;
                    description = `${activity.user} performed an action`;
                }
                
                return (
                  <div key={activity.id} className="flex items-start gap-4 pb-4 border-b border-[#1a1a1a] last:border-0 last:pb-0">
                    {icon}
                    <div className="flex-1">
                      <h4 className="text-sm font-medium">{title}</h4>
                      <p className="text-sm text-gray-400">{description}</p>
                      <p className="text-xs text-gray-500 mt-1">{formatTimeAgo(activity.timestamp)}</p>
                    </div>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>
      </div>
      
      <Tabs defaultValue="upcoming">
        <TabsList className="bg-[#1a1a1a] border-b border-[#333]">
          <TabsTrigger value="upcoming">Upcoming Sessions</TabsTrigger>
          <TabsTrigger value="pending">Pending Payments</TabsTrigger>
          <TabsTrigger value="support">Support Tickets</TabsTrigger>
        </TabsList>
        <TabsContent value="upcoming" className="pt-4">
          <UpcomingSessions />
        </TabsContent>
        <TabsContent value="pending" className="pt-4">
          <PendingPayments />
        </TabsContent>
        <TabsContent value="support" className="pt-4">
          <SupportTickets />
        </TabsContent>
      </Tabs>
    </div>
  );
};

interface StatCardProps {
  title: string;
  value: string;
  change: string;
  positive: boolean;
  icon: React.ReactNode;
}

const StatCard = ({ title, value, change, positive, icon }: StatCardProps) => {
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
        <div className={`flex items-center mt-4 text-sm ${positive ? 'text-green-500' : 'text-red-500'}`}>
          {positive ? (
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

// Placeholder for Upcoming Sessions tab content
const UpcomingSessions = () => {
  return (
    <Card className="bg-[#0f0f0f] border-[#1a1a1a]">
      <CardContent className="p-6">
        <div className="space-y-4">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="flex items-start gap-4 pb-4 border-b border-[#1a1a1a] last:border-0 last:pb-0">
              <div className="bg-[#1a1a1a] text-center p-2 rounded-md min-w-16">
                <div className="text-sm font-bold text-[#ea384c]">{format(addDays(new Date(), i + 1), 'MMM')}</div>
                <div className="text-2xl font-bold">{format(addDays(new Date(), i + 1), 'dd')}</div>
              </div>
              <div className="flex-1">
                <div className="flex justify-between items-start">
                  <div>
                    <h4 className="font-medium">Training Session with John Smith</h4>
                    <p className="text-sm text-gray-400">
                      {format(addDays(new Date(), i + 1), 'EEEE, MMMM do')} - {i % 2 === 0 ? '10:00 AM' : '2:00 PM'} (60 min)
                    </p>
                  </div>
                  <Badge variant="outline" className="bg-blue-500/10 text-blue-500 border-blue-500/30">
                    {i === 0 ? 'Elite Plan' : i === 1 ? 'Pro Plan' : 'Basic Plan'}
                  </Badge>
                </div>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};

// Helper function for date formatting
function addDays(date: Date, days: number) {
  const result = new Date(date);
  result.setDate(result.getDate() + days);
  return result;
}

// Placeholder for Pending Payments tab content
const PendingPayments = () => {
  return (
    <Card className="bg-[#0f0f0f] border-[#1a1a1a]">
      <CardContent className="p-6">
        <div className="space-y-4">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="flex items-start gap-4 pb-4 border-b border-[#1a1a1a] last:border-0 last:pb-0">
              <div className="p-2 rounded-full bg-yellow-500/10">
                <Clock className="h-6 w-6 text-yellow-500" />
              </div>
              <div className="flex-1">
                <div className="flex justify-between items-start">
                  <div>
                    <h4 className="font-medium">
                      {i === 0 ? 'Sarah Johnson' : i === 1 ? 'Michael Brown' : 'Emily Davis'}
                    </h4>
                    <p className="text-sm text-gray-400">
                      Invoice #INV-{1000 + i} - Due {format(addDays(new Date(), i + 2), 'MMM dd, yyyy')}
                    </p>
                  </div>
                  <p className="font-bold">
                    ${i === 0 ? '99.99' : i === 1 ? '249.99' : '29.99'}
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};

// Placeholder for Support Tickets tab content
const SupportTickets = () => {
  return (
    <Card className="bg-[#0f0f0f] border-[#1a1a1a]">
      <CardContent className="p-6">
        <div className="space-y-4">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="flex items-start gap-4 pb-4 border-b border-[#1a1a1a] last:border-0 last:pb-0">
              <div className={`p-2 rounded-full ${
                i === 0 
                  ? 'bg-red-500/10' 
                  : i === 1 
                    ? 'bg-yellow-500/10' 
                    : 'bg-green-500/10'
              }`}>
                {i === 0 
                  ? <XCircle className="h-6 w-6 text-red-500" /> 
                  : i === 1 
                    ? <Clock className="h-6 w-6 text-yellow-500" /> 
                    : <CheckCircle2 className="h-6 w-6 text-green-500" />
                }
              </div>
              <div className="flex-1">
                <div className="flex justify-between items-start">
                  <div>
                    <h4 className="font-medium">
                      {i === 0 
                        ? 'Account login issue' 
                        : i === 1 
                          ? 'Change subscription plan' 
                          : 'Request for refund'
                      }
                    </h4>
                    <p className="text-sm text-gray-400">
                      From {i === 0 
                        ? 'Robert Wilson' 
                        : i === 1 
                          ? 'Jessica Thompson' 
                          : 'David Miller'
                      } - {format(subDays(new Date(), i), 'MMM dd, yyyy')}
                    </p>
                  </div>
                  <Badge variant={
                    i === 0 
                      ? 'destructive' 
                      : i === 1 
                        ? 'outline' 
                        : 'default'
                  }>
                    {i === 0 ? 'High' : i === 1 ? 'Medium' : 'Low'}
                  </Badge>
                </div>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};

export default AdminOverview;
