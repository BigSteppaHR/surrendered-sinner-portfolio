
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { 
  Users, 
  ArrowUpRight, 
  DollarSign, 
  Calendar, 
  MessageSquare,
  ArrowDown
} from "lucide-react";
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart";
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar } from "recharts";

const visitData = [
  { date: "Jan", visits: 400 },
  { date: "Feb", visits: 300 },
  { date: "Mar", visits: 600 },
  { date: "Apr", visits: 800 },
  { date: "May", visits: 1100 },
  { date: "Jun", visits: 900 },
  { date: "Jul", visits: 1300 },
];

const revenueData = [
  { month: "Jan", revenue: 1200 },
  { month: "Feb", revenue: 900 },
  { month: "Mar", revenue: 1800 },
  { month: "Apr", revenue: 2400 },
  { month: "May", revenue: 3300 },
  { month: "Jun", revenue: 2700 },
  { month: "Jul", revenue: 3900 },
];

const AdminOverview = () => {
  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold">Dashboard Overview</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard 
          title="Total Users" 
          value="1,284" 
          change="+14%" 
          icon={<Users className="h-5 w-5" />} 
          positive={true}
        />
        <StatCard 
          title="Monthly Revenue" 
          value="$12,593" 
          change="+23%" 
          icon={<DollarSign className="h-5 w-5" />} 
          positive={true}
        />
        <StatCard 
          title="Opened Tickets" 
          value="24" 
          change="-5%" 
          icon={<MessageSquare className="h-5 w-5" />} 
          positive={false}
        />
        <StatCard 
          title="Active Subscriptions" 
          value="846" 
          change="+7%" 
          icon={<Calendar className="h-5 w-5" />} 
          positive={true}
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="bg-[#252A38] border-[#353A48]">
          <CardHeader>
            <CardTitle>Site Traffic</CardTitle>
            <CardDescription className="text-gray-400">Website visits over time</CardDescription>
          </CardHeader>
          <CardContent>
            <ChartContainer config={{ visits: { theme: { light: "#9b87f5", dark: "#9b87f5" } } }} className="h-80">
              <AreaChart data={visitData}>
                <defs>
                  <linearGradient id="colorVisits" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#9b87f5" stopOpacity={0.8}/>
                    <stop offset="95%" stopColor="#9b87f5" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <XAxis dataKey="date" stroke="#666" />
                <YAxis stroke="#666" />
                <CartesianGrid strokeDasharray="3 3" stroke="#333" />
                <ChartTooltip content={<ChartTooltipContent />} />
                <Area type="monotone" dataKey="visits" stroke="#9b87f5" fillOpacity={1} fill="url(#colorVisits)" />
              </AreaChart>
            </ChartContainer>
          </CardContent>
        </Card>

        <Card className="bg-[#252A38] border-[#353A48]">
          <CardHeader>
            <CardTitle>Revenue Overview</CardTitle>
            <CardDescription className="text-gray-400">Monthly revenue statistics</CardDescription>
          </CardHeader>
          <CardContent>
            <ChartContainer config={{ revenue: { theme: { light: "#7E69AB", dark: "#7E69AB" } } }} className="h-80">
              <BarChart data={revenueData}>
                <XAxis dataKey="month" stroke="#666" />
                <YAxis stroke="#666" />
                <CartesianGrid strokeDasharray="3 3" stroke="#333" />
                <ChartTooltip content={<ChartTooltipContent />} />
                <Bar dataKey="revenue" fill="#7E69AB" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ChartContainer>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

interface StatCardProps {
  title: string;
  value: string;
  change: string;
  icon: React.ReactNode;
  positive: boolean;
}

const StatCard = ({ title, value, change, icon, positive }: StatCardProps) => {
  return (
    <Card className="bg-[#252A38] border-[#353A48]">
      <CardContent className="p-6">
        <div className="flex justify-between items-start">
          <div>
            <p className="text-sm font-medium text-gray-400">{title}</p>
            <h3 className="text-2xl font-bold mt-1">{value}</h3>
          </div>
          <div className="p-2 bg-[#1A1F2C] rounded-lg">
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

export default AdminOverview;
