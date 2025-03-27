
import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, Legend } from 'recharts';

const data = [
  { name: 'Jan', value: 45 },
  { name: 'Feb', value: 52 },
  { name: 'Mar', value: 48 },
  { name: 'Apr', value: 61 },
  { name: 'May', value: 55 },
  { name: 'Jun', value: 67 },
  { name: 'Jul', value: 70 },
];

const pieData = [
  { name: 'Basic Plan', value: 35, color: '#ea384c' },
  { name: 'Pro Plan', value: 45, color: '#3b82f6' },
  { name: 'Elite Plan', value: 20, color: '#10b981' },
];

const AdminAnalytics = () => {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Analytics</h1>
        <p className="text-gray-400">View insights about your fitness business</p>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <StatCard title="Total Users" value="256" change="+12%" />
        <StatCard title="Active Subscriptions" value="187" change="+5%" />
        <StatCard title="Monthly Revenue" value="$15,280" change="+8%" />
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card className="bg-gray-900 border-gray-800">
          <CardHeader>
            <CardTitle>New Sign Ups</CardTitle>
            <CardDescription>Monthly user registrations</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  data={data}
                  margin={{
                    top: 20,
                    right: 30,
                    left: 20,
                    bottom: 5,
                  }}
                >
                  <CartesianGrid strokeDasharray="3 3" stroke="#333" />
                  <XAxis dataKey="name" stroke="#999" />
                  <YAxis stroke="#999" />
                  <Tooltip 
                    contentStyle={{ backgroundColor: '#1a1a1a', borderColor: '#333' }}
                    labelStyle={{ color: '#fff' }}
                  />
                  <Bar dataKey="value" fill="#ea384c" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
        
        <Card className="bg-gray-900 border-gray-800">
          <CardHeader>
            <CardTitle>Subscription Distribution</CardTitle>
            <CardDescription>Active subscriptions by plan</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={pieData}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="value"
                    label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                  >
                    {pieData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Legend />
                  <Tooltip 
                    contentStyle={{ backgroundColor: '#1a1a1a', borderColor: '#333' }}
                    labelStyle={{ color: '#fff' }}
                  />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      </div>
      
      <Card className="bg-gray-900 border-gray-800">
        <CardHeader>
          <CardTitle>Recent Activity</CardTitle>
          <CardDescription>Latest actions on the platform</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <ActivityItem 
              event="New subscription" 
              description="John Doe subscribed to Elite Plan"
              time="2 hours ago"
            />
            <ActivityItem 
              event="Payment received" 
              description="$249.99 payment from Sarah Johnson"
              time="5 hours ago"
            />
            <ActivityItem 
              event="Session scheduled" 
              description="Michael Brown scheduled a session for tomorrow"
              time="Yesterday"
            />
            <ActivityItem 
              event="Plan canceled" 
              description="Emily Davis canceled Pro Plan subscription"
              time="2 days ago"
            />
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

const StatCard = ({ title, value, change }: { title: string, value: string, change: string }) => {
  const isPositive = change.startsWith('+');
  
  return (
    <Card className="bg-gray-900 border-gray-800">
      <CardHeader className="pb-2">
        <CardTitle className="text-sm font-medium text-gray-400">{title}</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="flex justify-between items-end">
          <div className="text-2xl font-bold">{value}</div>
          <div className={`text-sm font-medium ${isPositive ? 'text-green-500' : 'text-red-500'}`}>
            {change}
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

const ActivityItem = ({ event, description, time }: { event: string, description: string, time: string }) => {
  return (
    <div className="flex items-start pb-4 border-b border-gray-800">
      <div className="flex-1">
        <h4 className="font-medium">{event}</h4>
        <p className="text-sm text-gray-400">{description}</p>
      </div>
      <div className="text-xs text-gray-500">{time}</div>
    </div>
  );
};

export default AdminAnalytics;
