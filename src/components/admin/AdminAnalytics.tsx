
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ChartContainer } from "@/components/ui/chart";
import { 
  LineChart, 
  Line, 
  AreaChart, 
  Area, 
  BarChart, 
  Bar, 
  PieChart, 
  Pie, 
  Cell,
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  Legend, 
  ResponsiveContainer 
} from "recharts";

const trafficData = [
  { name: "Jan", Organic: 4000, Paid: 2400, Direct: 1800 },
  { name: "Feb", Organic: 3000, Paid: 1398, Direct: 2000 },
  { name: "Mar", Organic: 2000, Paid: 9800, Direct: 2200 },
  { name: "Apr", Organic: 2780, Paid: 3908, Direct: 2500 },
  { name: "May", Organic: 1890, Paid: 4800, Direct: 2300 },
  { name: "Jun", Organic: 2390, Paid: 3800, Direct: 2100 },
  { name: "Jul", Organic: 3490, Paid: 4300, Direct: 2400 },
];

const conversionData = [
  { name: "Jan", rate: 2.4 },
  { name: "Feb", rate: 2.8 },
  { name: "Mar", rate: 3.2 },
  { name: "Apr", rate: 3.9 },
  { name: "May", rate: 4.5 },
  { name: "Jun", rate: 4.2 },
  { name: "Jul", rate: 4.8 },
];

const planDistributionData = [
  { name: "Basic Plan", value: 400, color: "#9b87f5" },
  { name: "Pro Plan", value: 300, color: "#7E69AB" },
  { name: "Elite Plan", value: 150, color: "#D6BCFA" },
];

const revenueByPlanData = [
  { name: "Jan", Basic: 4000, Pro: 8400, Elite: 9000 },
  { name: "Feb", Basic: 3000, Pro: 7398, Elite: 10000 },
  { name: "Mar", Basic: 2000, Pro: 9800, Elite: 12000 },
  { name: "Apr", Basic: 2780, Pro: 10908, Elite: 13000 },
  { name: "May", Basic: 1890, Pro: 9800, Elite: 14000 },
  { name: "Jun", Basic: 2390, Pro: 9800, Elite: 15000 },
  { name: "Jul", Basic: 3490, Pro: 10300, Elite: 16500 },
];

const locationData = [
  { name: "United States", value: 520, color: "#9b87f5" },
  { name: "United Kingdom", value: 210, color: "#7E69AB" },
  { name: "Canada", value: 170, color: "#D6BCFA" },
  { name: "Australia", value: 140, color: "#E5DEFF" },
  { name: "Germany", value: 120, color: "#FEC6A1" },
  { name: "Other", value: 190, color: "#8E9196" },
];

const AdminAnalytics = () => {
  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold">Analytics</h1>

      <Tabs defaultValue="overview">
        <TabsList className="bg-gray-800">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="traffic">Traffic</TabsTrigger>
          <TabsTrigger value="revenue">Revenue</TabsTrigger>
          <TabsTrigger value="demographics">Demographics</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="mt-6 space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card className="bg-gray-900 border-gray-800">
              <CardHeader>
                <CardTitle>Website Traffic</CardTitle>
                <CardDescription className="text-gray-400">Traffic sources over time</CardDescription>
              </CardHeader>
              <CardContent>
                <ChartContainer 
                  config={{ 
                    Organic: { theme: { light: "#9b87f5", dark: "#9b87f5" } },
                    Paid: { theme: { light: "#7E69AB", dark: "#7E69AB" } },
                    Direct: { theme: { light: "#D6BCFA", dark: "#D6BCFA" } } 
                  }} 
                  className="h-80"
                >
                  <AreaChart data={trafficData}>
                    <defs>
                      <linearGradient id="colorOrganic" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#9b87f5" stopOpacity={0.8}/>
                        <stop offset="95%" stopColor="#9b87f5" stopOpacity={0}/>
                      </linearGradient>
                      <linearGradient id="colorPaid" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#7E69AB" stopOpacity={0.8}/>
                        <stop offset="95%" stopColor="#7E69AB" stopOpacity={0}/>
                      </linearGradient>
                      <linearGradient id="colorDirect" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#D6BCFA" stopOpacity={0.8}/>
                        <stop offset="95%" stopColor="#D6BCFA" stopOpacity={0}/>
                      </linearGradient>
                    </defs>
                    <XAxis dataKey="name" stroke="#666" />
                    <YAxis stroke="#666" />
                    <CartesianGrid strokeDasharray="3 3" stroke="#333" />
                    <Tooltip />
                    <Area type="monotone" dataKey="Organic" stroke="#9b87f5" fillOpacity={1} fill="url(#colorOrganic)" />
                    <Area type="monotone" dataKey="Paid" stroke="#7E69AB" fillOpacity={1} fill="url(#colorPaid)" />
                    <Area type="monotone" dataKey="Direct" stroke="#D6BCFA" fillOpacity={1} fill="url(#colorDirect)" />
                  </AreaChart>
                </ChartContainer>
              </CardContent>
            </Card>

            <Card className="bg-gray-900 border-gray-800">
              <CardHeader>
                <CardTitle>Conversion Rate</CardTitle>
                <CardDescription className="text-gray-400">Visitor to subscriber conversion</CardDescription>
              </CardHeader>
              <CardContent>
                <ChartContainer 
                  config={{ rate: { theme: { light: "#F97316", dark: "#F97316" } } }} 
                  className="h-80"
                >
                  <LineChart data={conversionData}>
                    <XAxis dataKey="name" stroke="#666" />
                    <YAxis stroke="#666" />
                    <CartesianGrid strokeDasharray="3 3" stroke="#333" />
                    <Tooltip />
                    <Line type="monotone" dataKey="rate" stroke="#F97316" strokeWidth={2} dot={{ r: 5 }} />
                  </LineChart>
                </ChartContainer>
              </CardContent>
            </Card>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Card className="bg-gray-900 border-gray-800">
              <CardHeader>
                <CardTitle>Subscription Plans</CardTitle>
                <CardDescription className="text-gray-400">Distribution of plans</CardDescription>
              </CardHeader>
              <CardContent>
                <ChartContainer className="h-64">
                  <PieChart>
                    <Pie
                      data={planDistributionData}
                      cx="50%"
                      cy="50%"
                      innerRadius={60}
                      outerRadius={80}
                      fill="#8884d8"
                      paddingAngle={5}
                      dataKey="value"
                      label={({name, percent}) => `${name} ${(percent * 100).toFixed(0)}%`}
                    >
                      {planDistributionData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ChartContainer>
              </CardContent>
            </Card>

            <Card className="bg-gray-900 border-gray-800 md:col-span-2">
              <CardHeader>
                <CardTitle>Customer Locations</CardTitle>
                <CardDescription className="text-gray-400">Geographic distribution</CardDescription>
              </CardHeader>
              <CardContent>
                <ChartContainer className="h-64">
                  <BarChart data={locationData} layout="vertical">
                    <XAxis type="number" stroke="#666" />
                    <YAxis dataKey="name" type="category" stroke="#666" />
                    <CartesianGrid strokeDasharray="3 3" stroke="#333" />
                    <Tooltip />
                    <Bar dataKey="value" radius={[0, 4, 4, 0]}>
                      {locationData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Bar>
                  </BarChart>
                </ChartContainer>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="traffic" className="mt-6 space-y-6">
          <Card className="bg-gray-900 border-gray-800">
            <CardHeader>
              <CardTitle>Detailed Traffic Analysis</CardTitle>
              <CardDescription className="text-gray-400">Traffic sources and patterns</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <h4 className="text-lg font-medium mb-4">Traffic by Source</h4>
                  <ChartContainer className="h-80">
                    <PieChart>
                      <Pie
                        data={[
                          { name: "Organic Search", value: 4000, color: "#9b87f5" },
                          { name: "Direct", value: 3000, color: "#7E69AB" },
                          { name: "Social Media", value: 2000, color: "#D6BCFA" },
                          { name: "Referral", value: 1500, color: "#E5DEFF" },
                          { name: "Email", value: 1000, color: "#FEC6A1" }
                        ]}
                        cx="50%"
                        cy="50%"
                        outerRadius={80}
                        fill="#8884d8"
                        dataKey="value"
                        label={({name, percent}) => `${name} ${(percent * 100).toFixed(0)}%`}
                      >
                        {planDistributionData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                      </Pie>
                      <Tooltip />
                    </PieChart>
                  </ChartContainer>
                </div>
                <div>
                  <h4 className="text-lg font-medium mb-4">Traffic Trends</h4>
                  <ChartContainer className="h-80">
                    <LineChart data={trafficData}>
                      <XAxis dataKey="name" stroke="#666" />
                      <YAxis stroke="#666" />
                      <CartesianGrid strokeDasharray="3 3" stroke="#333" />
                      <Tooltip />
                      <Legend />
                      <Line type="monotone" dataKey="Organic" stroke="#9b87f5" strokeWidth={2} />
                      <Line type="monotone" dataKey="Paid" stroke="#7E69AB" strokeWidth={2} />
                      <Line type="monotone" dataKey="Direct" stroke="#D6BCFA" strokeWidth={2} />
                    </LineChart>
                  </ChartContainer>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="revenue" className="mt-6 space-y-6">
          <Card className="bg-gray-900 border-gray-800">
            <CardHeader>
              <CardTitle>Revenue Analytics</CardTitle>
              <CardDescription className="text-gray-400">Revenue breakdown by source</CardDescription>
            </CardHeader>
            <CardContent>
              <ChartContainer 
                config={{ 
                  Basic: { theme: { light: "#9b87f5", dark: "#9b87f5" } },
                  Pro: { theme: { light: "#7E69AB", dark: "#7E69AB" } },
                  Elite: { theme: { light: "#D6BCFA", dark: "#D6BCFA" } } 
                }} 
                className="h-80"
              >
                <BarChart data={revenueByPlanData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#333" />
                  <XAxis dataKey="name" stroke="#666" />
                  <YAxis stroke="#666" />
                  <Tooltip />
                  <Legend />
                  <Bar dataKey="Basic" fill="#9b87f5" stackId="a" />
                  <Bar dataKey="Pro" fill="#7E69AB" stackId="a" />
                  <Bar dataKey="Elite" fill="#D6BCFA" stackId="a" />
                </BarChart>
              </ChartContainer>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-6">
                <Card className="bg-gray-800 border-gray-700">
                  <CardContent className="p-4">
                    <h4 className="text-sm font-medium text-gray-400">Basic Plan Revenue</h4>
                    <p className="text-2xl font-bold mt-1">$24,560</p>
                    <p className="text-xs text-green-500 mt-1">+12% from last month</p>
                  </CardContent>
                </Card>
                <Card className="bg-gray-800 border-gray-700">
                  <CardContent className="p-4">
                    <h4 className="text-sm font-medium text-gray-400">Pro Plan Revenue</h4>
                    <p className="text-2xl font-bold mt-1">$67,890</p>
                    <p className="text-xs text-green-500 mt-1">+23% from last month</p>
                  </CardContent>
                </Card>
                <Card className="bg-gray-800 border-gray-700">
                  <CardContent className="p-4">
                    <h4 className="text-sm font-medium text-gray-400">Elite Plan Revenue</h4>
                    <p className="text-2xl font-bold mt-1">$94,325</p>
                    <p className="text-xs text-green-500 mt-1">+18% from last month</p>
                  </CardContent>
                </Card>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="demographics" className="mt-6 space-y-6">
          <Card className="bg-gray-900 border-gray-800">
            <CardHeader>
              <CardTitle>User Demographics</CardTitle>
              <CardDescription className="text-gray-400">Customer age, gender and location</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <h4 className="text-lg font-medium mb-4">Age Distribution</h4>
                  <ChartContainer className="h-80">
                    <BarChart 
                      data={[
                        { age: "18-24", value: 150 },
                        { age: "25-34", value: 300 },
                        { age: "35-44", value: 280 },
                        { age: "45-54", value: 200 },
                        { age: "55-64", value: 120 },
                        { age: "65+", value: 50 }
                      ]}
                    >
                      <CartesianGrid strokeDasharray="3 3" stroke="#333" />
                      <XAxis dataKey="age" stroke="#666" />
                      <YAxis stroke="#666" />
                      <Tooltip />
                      <Bar dataKey="value" fill="#9b87f5" radius={[4, 4, 0, 0]} />
                    </BarChart>
                  </ChartContainer>
                </div>
                <div>
                  <h4 className="text-lg font-medium mb-4">Gender Distribution</h4>
                  <ChartContainer className="h-80">
                    <PieChart>
                      <Pie
                        data={[
                          { name: "Male", value: 650, color: "#9b87f5" },
                          { name: "Female", value: 450, color: "#D6BCFA" },
                          { name: "Other", value: 50, color: "#7E69AB" }
                        ]}
                        cx="50%"
                        cy="50%"
                        innerRadius={60}
                        outerRadius={80}
                        fill="#8884d8"
                        paddingAngle={5}
                        dataKey="value"
                        label={({name, percent}) => `${name} ${(percent * 100).toFixed(0)}%`}
                      >
                        {[
                          { name: "Male", value: 650, color: "#9b87f5" },
                          { name: "Female", value: 450, color: "#D6BCFA" },
                          { name: "Other", value: 50, color: "#7E69AB" }
                        ].map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                      </Pie>
                      <Tooltip />
                    </PieChart>
                  </ChartContainer>
                </div>
              </div>
              
              <div className="mt-6">
                <h4 className="text-lg font-medium mb-4">User Locations</h4>
                <ChartContainer className="h-80">
                  <BarChart data={locationData} layout="vertical">
                    <CartesianGrid strokeDasharray="3 3" stroke="#333" />
                    <XAxis type="number" stroke="#666" />
                    <YAxis dataKey="name" type="category" stroke="#666" />
                    <Tooltip />
                    <Bar dataKey="value" radius={[0, 4, 4, 0]}>
                      {locationData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Bar>
                  </BarChart>
                </ChartContainer>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default AdminAnalytics;
