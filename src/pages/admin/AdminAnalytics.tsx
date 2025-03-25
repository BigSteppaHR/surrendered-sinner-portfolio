
import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { BarChart3, Users, MapPin, Activity, Calendar, Download } from "lucide-react";
import { AdminLayout } from "@/components/admin/AdminLayout";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  Legend,
} from "recharts";

const mockVisitorData = [
  { date: 'Jan', visitors: 220 },
  { date: 'Feb', visitors: 340 },
  { date: 'Mar', visitors: 280 },
  { date: 'Apr', visitors: 450 },
  { date: 'May', visitors: 570 },
  { date: 'Jun', visitors: 650 },
];

const mockLocationData = [
  { name: 'New York', value: 45 },
  { name: 'Los Angeles', value: 25 },
  { name: 'Chicago', value: 15 },
  { name: 'Miami', value: 10 },
  { name: 'Other', value: 5 },
];

const mockReferrerData = [
  { name: 'Direct', value: 40 },
  { name: 'Google', value: 30 },
  { name: 'Social Media', value: 15 },
  { name: 'Email', value: 10 },
  { name: 'Other', value: 5 },
];

const COLORS = ['#ea384c', '#b82c3b', '#85202c', '#52141c', '#1f080b'];

const AdminAnalytics = () => {
  return (
    <AdminLayout>
      <div className="p-6">
        <div className="flex justify-between items-center mb-6">
          <div>
            <h1 className="text-3xl font-bold">Analytics</h1>
            <p className="text-gray-400">Track user engagement and site performance</p>
          </div>
          <Button className="bg-[#ea384c] hover:bg-[#d32d3f]">
            <Download className="h-4 w-4 mr-2" />
            Export Report
          </Button>
        </div>
        
        <Tabs defaultValue="visitors" className="w-full">
          <TabsList className="grid w-full grid-cols-3 mb-8">
            <TabsTrigger value="visitors">
              <Users className="h-4 w-4 mr-2" />
              Visitors
            </TabsTrigger>
            <TabsTrigger value="location">
              <MapPin className="h-4 w-4 mr-2" />
              Locations
            </TabsTrigger>
            <TabsTrigger value="engagement">
              <Activity className="h-4 w-4 mr-2" />
              Engagement
            </TabsTrigger>
          </TabsList>
          
          <TabsContent value="visitors">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center text-xl">
                    <Users className="h-5 w-5 mr-2 text-[#ea384c]" />
                    Visitor Trends
                  </CardTitle>
                  <CardDescription>
                    Monthly visitor statistics
                  </CardDescription>
                </CardHeader>
                <CardContent className="h-[350px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart
                      data={mockVisitorData}
                      margin={{ top: 10, right: 30, left: 0, bottom: 0 }}
                    >
                      <defs>
                        <linearGradient id="colorVisitors" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#ea384c" stopOpacity={0.8}/>
                          <stop offset="95%" stopColor="#ea384c" stopOpacity={0}/>
                        </linearGradient>
                      </defs>
                      <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#333" />
                      <XAxis dataKey="date" stroke="#aaa" />
                      <YAxis stroke="#aaa" />
                      <Tooltip 
                        contentStyle={{ 
                          backgroundColor: '#111', 
                          borderColor: '#333',
                          color: '#fff'
                        }} 
                      />
                      <Area 
                        type="monotone" 
                        dataKey="visitors" 
                        stroke="#ea384c" 
                        fillOpacity={1} 
                        fill="url(#colorVisitors)" 
                      />
                    </AreaChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center text-xl">
                    <Calendar className="h-5 w-5 mr-2 text-[#ea384c]" />
                    Sessions by Day
                  </CardTitle>
                  <CardDescription>
                    Weekly breakdown of site visits
                  </CardDescription>
                </CardHeader>
                <CardContent className="h-[350px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart
                      data={[
                        { day: 'Mon', sessions: 120 },
                        { day: 'Tue', sessions: 140 },
                        { day: 'Wed', sessions: 180 },
                        { day: 'Thu', sessions: 220 },
                        { day: 'Fri', sessions: 260 },
                        { day: 'Sat', sessions: 180 },
                        { day: 'Sun', sessions: 120 },
                      ]}
                      margin={{ top: 20, right: 30, left: 0, bottom: 5 }}
                    >
                      <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#333" />
                      <XAxis dataKey="day" stroke="#aaa" />
                      <YAxis stroke="#aaa" />
                      <Tooltip 
                        contentStyle={{ 
                          backgroundColor: '#111', 
                          borderColor: '#333',
                          color: '#fff'
                        }}
                      />
                      <Bar dataKey="sessions" fill="#ea384c" radius={[4, 4, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
          
          <TabsContent value="location">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center text-xl">
                    <MapPin className="h-5 w-5 mr-2 text-[#ea384c]" />
                    Visitor Locations
                  </CardTitle>
                  <CardDescription>
                    Distribution of users by location
                  </CardDescription>
                </CardHeader>
                <CardContent className="h-[350px]">
                  <div className="text-center pt-10">
                    <p className="text-xl font-bold mb-2">United States Only</p>
                    <p className="text-gray-400">All training sessions are currently available only in the United States</p>
                  </div>
                  <ResponsiveContainer width="100%" height="70%">
                    <PieChart>
                      <Pie
                        data={mockLocationData}
                        cx="50%"
                        cy="50%"
                        labelLine={false}
                        outerRadius={80}
                        fill="#ea384c"
                        dataKey="value"
                        label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                      >
                        {mockLocationData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                        ))}
                      </Pie>
                      <Legend />
                      <Tooltip 
                        contentStyle={{ 
                          backgroundColor: '#111', 
                          borderColor: '#333',
                          color: '#fff'
                        }}
                      />
                    </PieChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center text-xl">
                    <BarChart3 className="h-5 w-5 mr-2 text-[#ea384c]" />
                    Traffic Sources
                  </CardTitle>
                  <CardDescription>
                    How users are finding your website
                  </CardDescription>
                </CardHeader>
                <CardContent className="h-[350px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={mockReferrerData}
                        cx="50%"
                        cy="50%"
                        labelLine={false}
                        outerRadius={80}
                        fill="#ea384c"
                        dataKey="value"
                        label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                      >
                        {mockReferrerData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                        ))}
                      </Pie>
                      <Legend />
                      <Tooltip 
                        contentStyle={{ 
                          backgroundColor: '#111', 
                          borderColor: '#333',
                          color: '#fff'
                        }}
                      />
                    </PieChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
          
          <TabsContent value="engagement">
            <Card className="mb-6">
              <CardHeader>
                <CardTitle className="flex items-center text-xl">
                  <Activity className="h-5 w-5 mr-2 text-[#ea384c]" />
                  Real-time Data Integration
                </CardTitle>
                <CardDescription>
                  Connect real-time analytics to monitor site performance
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-center py-10">
                  <h3 className="text-lg font-medium mb-2">Ready to set up real-time analytics</h3>
                  <p className="text-gray-400 mb-4 max-w-md mx-auto">
                    Connect to Google Analytics, Mixpanel, or other analytics tools to track real-time performance data.
                  </p>
                  <Button className="bg-[#ea384c] hover:bg-[#d32d3f]">
                    Configure Analytics
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </AdminLayout>
  );
};

export default AdminAnalytics;
