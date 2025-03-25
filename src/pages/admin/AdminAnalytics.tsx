
import React from 'react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell
} from 'recharts';
import AdminSidebar from '@/components/admin/AdminSidebar';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { AlertCircle, Users, TrendingUp, Map, Download } from 'lucide-react';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';

// Sample data
const monthlyUserData = [
  { name: 'Jan', value: 24 },
  { name: 'Feb', value: 35 },
  { name: 'Mar', value: 52 },
  { name: 'Apr', value: 78 },
  { name: 'May', value: 95 },
  { name: 'Jun', value: 130 },
  { name: 'Jul', value: 158 },
  { name: 'Aug', value: 170 },
  { name: 'Sep', value: 201 },
  { name: 'Oct', value: 230 },
  { name: 'Nov', value: 252 },
  { name: 'Dec', value: 265 },
];

const trainingTypeData = [
  { name: 'Strength', value: 40 },
  { name: 'Cardio', value: 25 },
  { name: 'HIIT', value: 20 },
  { name: 'Flexibility', value: 15 },
];

const COLORS = ['#ea384c', '#ff7500', '#ffbb28', '#00C49F'];

const locationData = [
  { state: 'CA', value: 35 },
  { state: 'TX', value: 30 },
  { state: 'NY', value: 25 },
  { state: 'FL', value: 20 },
  { state: 'IL', value: 15 },
  { state: 'PA', value: 10 },
  { state: 'OH', value: 8 },
  { state: 'GA', value: 7 },
];

const AdminAnalytics = () => {
  return (
    <div className="min-h-screen bg-black text-white flex">
      <AdminSidebar />
      <main className="flex-1 overflow-auto">
        <div className="p-6">
          <div className="flex justify-between items-center mb-6">
            <div>
              <h1 className="text-3xl font-bold">Analytics</h1>
              <p className="text-gray-400">Performance metrics and insights</p>
            </div>
            <div className="flex gap-2">
              <Button variant="outline" className="border-[#333333]">
                <Download className="h-4 w-4 mr-2" />
                Export Reports
              </Button>
            </div>
          </div>
          
          <Alert className="mb-6 bg-amber-950 border-amber-900">
            <AlertCircle className="h-4 w-4 text-amber-500" />
            <AlertTitle className="text-amber-300">Analytics Data Notice</AlertTitle>
            <AlertDescription className="text-amber-200">
              This is sample data for the United States market only. Real-time analytics will be integrated soon.
            </AlertDescription>
          </Alert>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
            <Card className="bg-[#111111] border-[#333333]">
              <CardContent className="p-6">
                <div className="flex justify-between items-start">
                  <div>
                    <p className="text-sm font-medium text-gray-400">Total Users</p>
                    <h3 className="text-2xl font-bold mt-1">265</h3>
                    <div className="flex items-center mt-2 text-sm text-green-500">
                      <TrendingUp className="h-4 w-4 mr-1" />
                      <span>25.4% increase</span>
                    </div>
                  </div>
                  <div className="p-2 bg-[#ea384c]/10 text-[#ea384c] rounded-lg">
                    <Users className="h-5 w-5" />
                  </div>
                </div>
              </CardContent>
            </Card>
            
            <Card className="bg-[#111111] border-[#333333]">
              <CardContent className="p-6">
                <div className="flex justify-between items-start">
                  <div>
                    <p className="text-sm font-medium text-gray-400">Active Subscriptions</p>
                    <h3 className="text-2xl font-bold mt-1">187</h3>
                    <div className="flex items-center mt-2 text-sm text-green-500">
                      <TrendingUp className="h-4 w-4 mr-1" />
                      <span>12.8% increase</span>
                    </div>
                  </div>
                  <div className="p-2 bg-[#ea384c]/10 text-[#ea384c] rounded-lg">
                    <Users className="h-5 w-5" />
                  </div>
                </div>
              </CardContent>
            </Card>
            
            <Card className="bg-[#111111] border-[#333333]">
              <CardContent className="p-6">
                <div className="flex justify-between items-start">
                  <div>
                    <p className="text-sm font-medium text-gray-400">Monthly Revenue</p>
                    <h3 className="text-2xl font-bold mt-1">$28,450</h3>
                    <div className="flex items-center mt-2 text-sm text-green-500">
                      <TrendingUp className="h-4 w-4 mr-1" />
                      <span>18.2% increase</span>
                    </div>
                  </div>
                  <div className="p-2 bg-[#ea384c]/10 text-[#ea384c] rounded-lg">
                    <TrendingUp className="h-5 w-5" />
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
          
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
            <Card className="bg-[#111111] border-[#333333]">
              <CardHeader>
                <CardTitle className="flex items-center text-xl">
                  <Users className="h-5 w-5 mr-2 text-[#ea384c]" />
                  User Growth
                </CardTitle>
                <CardDescription>Monthly user registration trends</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-80">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={monthlyUserData}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#333333" />
                      <XAxis dataKey="name" stroke="#888888" />
                      <YAxis stroke="#888888" />
                      <Tooltip contentStyle={{ backgroundColor: '#1A1A1A', borderColor: '#333333' }} />
                      <Legend />
                      <Line type="monotone" dataKey="value" stroke="#ea384c" strokeWidth={2} name="Users" />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>
            
            <Card className="bg-[#111111] border-[#333333]">
              <CardHeader>
                <CardTitle className="flex items-center text-xl">
                  <Map className="h-5 w-5 mr-2 text-[#ea384c]" />
                  User Demographics
                </CardTitle>
                <CardDescription>User distribution by training preference and location</CardDescription>
              </CardHeader>
              <CardContent>
                <Tabs defaultValue="training">
                  <TabsList className="bg-[#222] mb-4">
                    <TabsTrigger value="training">Training Type</TabsTrigger>
                    <TabsTrigger value="location">Location</TabsTrigger>
                  </TabsList>
                  
                  <TabsContent value="training" className="h-64">
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie
                          data={trainingTypeData}
                          cx="50%"
                          cy="50%"
                          labelLine={false}
                          outerRadius={80}
                          fill="#8884d8"
                          dataKey="value"
                          label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                        >
                          {trainingTypeData.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                          ))}
                        </Pie>
                        <Tooltip contentStyle={{ backgroundColor: '#1A1A1A', borderColor: '#333333' }} />
                      </PieChart>
                    </ResponsiveContainer>
                  </TabsContent>
                  
                  <TabsContent value="location" className="h-64">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={locationData}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#333333" />
                        <XAxis dataKey="state" stroke="#888888" />
                        <YAxis stroke="#888888" />
                        <Tooltip contentStyle={{ backgroundColor: '#1A1A1A', borderColor: '#333333' }} />
                        <Bar dataKey="value" fill="#ea384c" name="Users" />
                      </BarChart>
                    </ResponsiveContainer>
                  </TabsContent>
                </Tabs>
              </CardContent>
            </Card>
          </div>
        </div>
      </main>
    </div>
  );
};

export default AdminAnalytics;
