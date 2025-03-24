
import { useEffect, useState } from "react";
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
import { supabase } from "@/integrations/supabase/client";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";

// Define types for our data
type StatType = {
  id: string;
  stat_name: string;
  stat_value: number;
  stat_change: number;
  time_period: string;
  is_positive: boolean;
  icon: string;
};

type TrafficDataType = {
  id: string;
  date: string;
  visits: number;
};

type RevenueDataType = {
  id: string;
  month: string;
  revenue: number;
};

const AdminOverview = () => {
  const [statistics, setStatistics] = useState<StatType[]>([]);
  const [visitData, setVisitData] = useState<TrafficDataType[]>([]);
  const [revenueData, setRevenueData] = useState<RevenueDataType[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        // Fetch statistics
        const { data: statsData, error: statsError } = await supabase
          .from('admin_statistics')
          .select('*');
        
        if (statsError) throw statsError;
        
        // Fetch site traffic
        const { data: trafficData, error: trafficError } = await supabase
          .from('site_traffic')
          .select('*')
          .order('created_at', { ascending: true });
        
        if (trafficError) throw trafficError;
        
        // Fetch revenue data
        const { data: revData, error: revError } = await supabase
          .from('revenue_data')
          .select('*')
          .order('created_at', { ascending: true });
        
        if (revError) throw revError;
        
        setStatistics(statsData);
        setVisitData(trafficData);
        setRevenueData(revData);
      } catch (error) {
        console.error("Error fetching dashboard data:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const getIconComponent = (iconName: string) => {
    switch (iconName) {
      case 'Users':
        return <Users className="h-5 w-5" />;
      case 'DollarSign':
        return <DollarSign className="h-5 w-5" />;
      case 'MessageSquare':
        return <MessageSquare className="h-5 w-5" />;
      case 'Calendar':
        return <Calendar className="h-5 w-5" />;
      default:
        return <Users className="h-5 w-5" />;
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">Dashboard Overview</h1>
        <Badge variant="outline" className="bg-[#9b87f5]/10 text-[#9b87f5] border-[#9b87f5]/20">
          Admin Portal
        </Badge>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {loading ? (
          Array(4).fill(0).map((_, i) => (
            <Card key={i} className="bg-[#252A38] border-[#353A48]">
              <CardContent className="p-6">
                <Skeleton className="h-4 w-[100px] bg-[#353A48] mb-2" />
                <Skeleton className="h-8 w-[80px] bg-[#353A48] mb-4" />
                <Skeleton className="h-4 w-[120px] bg-[#353A48]" />
              </CardContent>
            </Card>
          ))
        ) : (
          statistics.map((stat) => (
            <StatCard 
              key={stat.id}
              title={stat.stat_name} 
              value={stat.stat_name === 'Monthly Revenue' ? `$${stat.stat_value.toLocaleString()}` : stat.stat_value.toLocaleString()} 
              change={`${stat.is_positive ? '+' : ''}${stat.stat_change}%`} 
              icon={getIconComponent(stat.icon)} 
              positive={stat.is_positive}
            />
          ))
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="bg-[#252A38] border-[#353A48]">
          <CardHeader>
            <CardTitle>Site Traffic</CardTitle>
            <CardDescription className="text-gray-400">Website visits over time</CardDescription>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="h-80 flex items-center justify-center">
                <div className="animate-spin h-8 w-8 border-4 border-[#9b87f5] border-t-transparent rounded-full"></div>
              </div>
            ) : (
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
            )}
          </CardContent>
        </Card>

        <Card className="bg-[#252A38] border-[#353A48]">
          <CardHeader>
            <CardTitle>Revenue Overview</CardTitle>
            <CardDescription className="text-gray-400">Monthly revenue statistics</CardDescription>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="h-80 flex items-center justify-center">
                <div className="animate-spin h-8 w-8 border-4 border-[#9b87f5] border-t-transparent rounded-full"></div>
              </div>
            ) : (
              <ChartContainer config={{ revenue: { theme: { light: "#7E69AB", dark: "#7E69AB" } } }} className="h-80">
                <BarChart data={revenueData}>
                  <XAxis dataKey="month" stroke="#666" />
                  <YAxis stroke="#666" />
                  <CartesianGrid strokeDasharray="3 3" stroke="#333" />
                  <ChartTooltip content={<ChartTooltipContent />} />
                  <Bar dataKey="revenue" fill="#7E69AB" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ChartContainer>
            )}
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
    <Card className="bg-[#252A38] border-[#353A48] hover:shadow-lg hover:shadow-[#9b87f5]/5 transition-all">
      <CardContent className="p-6">
        <div className="flex justify-between items-start">
          <div>
            <p className="text-sm font-medium text-gray-400">{title}</p>
            <h3 className="text-2xl font-bold mt-1">{value}</h3>
          </div>
          <div className="p-2 bg-[#9b87f5]/10 text-[#9b87f5] rounded-lg">
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
