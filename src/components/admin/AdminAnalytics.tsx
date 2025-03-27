
import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, Legend, LineChart, Line, AreaChart, Area } from 'recharts';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Calendar, Download, ArrowUpRight, ArrowDown, Users, DollarSign, Clock, TrendingUp } from "lucide-react";
import { Button } from "@/components/ui/button";
import { DatePickerWithRange } from '@/components/ui/date-range-picker';
import { format } from 'date-fns';

// Sample data - in real application, this would come from API
const revenueData = [
  { name: 'Jan', value: 4500 },
  { name: 'Feb', value: 5200 },
  { name: 'Mar', value: 4800 },
  { name: 'Apr', value: 6100 },
  { name: 'May', value: 5500 },
  { name: 'Jun', value: 6700 },
  { name: 'Jul', value: 7000 },
];

const userSignupData = [
  { name: 'Jan', value: 45 },
  { name: 'Feb', value: 52 },
  { name: 'Mar', value: 48 },
  { name: 'Apr', value: 61 },
  { name: 'May', value: 55 },
  { name: 'Jun', value: 67 },
  { name: 'Jul', value: 70 },
];

const sessionData = [
  { name: 'Mon', value: 24 },
  { name: 'Tue', value: 18 },
  { name: 'Wed', value: 30 },
  { name: 'Thu', value: 36 },
  { name: 'Fri', value: 42 },
  { name: 'Sat', value: 48 },
  { name: 'Sun', value: 30 },
];

const planDistribution = [
  { name: 'Basic Plan', value: 35, color: '#ea384c' },
  { name: 'Pro Plan', value: 45, color: '#8884d8' },
  { name: 'Elite Plan', value: 20, color: '#82ca9d' },
];

const activityData = [
  { id: 1, event: "New subscription", description: "John Smith subscribed to Elite Plan", time: "2 hours ago" },
  { id: 2, event: "Payment received", description: "$249.99 payment from Sarah Johnson", time: "5 hours ago" },
  { id: 3, event: "Session scheduled", description: "Michael Brown scheduled a session for tomorrow", time: "Yesterday" },
  { id: 4, event: "Plan canceled", description: "Emily Davis canceled Pro Plan subscription", time: "2 days ago" },
  { id: 5, event: "Support ticket", description: "New support ticket opened by Robert Wilson", time: "2 days ago" },
];

const AdminAnalytics = () => {
  const [date, setDate] = useState({
    from: new Date(new Date().setDate(new Date().getDate() - 30)),
    to: new Date(),
  });

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Analytics Dashboard</h1>
          <p className="text-gray-400 mt-1">View insights about your fitness business</p>
        </div>
        
        <div className="flex items-center gap-4">
          <DatePickerWithRange date={date} setDate={setDate} />
          
          <Button variant="outline" className="gap-2">
            <Download className="h-4 w-4" />
            Export
          </Button>
        </div>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard 
          title="Total Members" 
          value="586" 
          change="+12%" 
          changeType="positive" 
          icon={<Users className="h-5 w-5" />} 
        />
        <StatCard 
          title="Active Subscriptions" 
          value="427" 
          change="+5%" 
          changeType="positive" 
          icon={<TrendingUp className="h-5 w-5" />} 
        />
        <StatCard 
          title="Monthly Revenue" 
          value="$32,580" 
          change="+8%" 
          changeType="positive" 
          icon={<DollarSign className="h-5 w-5" />} 
        />
        <StatCard 
          title="Session Completion" 
          value="92%" 
          change="-3%" 
          changeType="negative" 
          icon={<Clock className="h-5 w-5" />} 
        />
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
                    fill="url(#colorRevenue)" 
                    activeDot={{ r: 8 }}
                  />
                </AreaChart>
              </ResponsiveContainer>
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
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={userSignupData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#333" />
                  <XAxis dataKey="name" stroke="#666" />
                  <YAxis stroke="#666" />
                  <Tooltip 
                    contentStyle={{ backgroundColor: '#1a1a1a', borderColor: '#333', borderRadius: '0.375rem' }}
                    formatter={(value) => [value, 'New Users']}
                  />
                  <Bar dataKey="value" fill="#ea384c" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
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
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={sessionData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#333" />
                  <XAxis dataKey="name" stroke="#666" />
                  <YAxis stroke="#666" />
                  <Tooltip 
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
                  <Tooltip 
                    contentStyle={{ backgroundColor: '#1a1a1a', borderColor: '#333', borderRadius: '0.375rem' }}
                    formatter={(value, name) => [value, name]}
                  />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
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
