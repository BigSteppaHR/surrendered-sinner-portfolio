
import { useState } from "react";
import { useAuth } from "@/hooks/useAuth";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import DashboardNav from "@/components/dashboard/DashboardNav";
import SupportTickets from "@/components/dashboard/SupportTickets";
import LiveChat from "@/components/dashboard/LiveChat";
import { MessageSquare, HelpCircle, FileText, Phone } from "lucide-react";

const Support = () => {
  const { profile } = useAuth();
  
  return (
    <div className="min-h-screen flex flex-col md:flex-row bg-black text-white">
      <DashboardNav />
      
      <div className="flex-1 overflow-auto md:ml-64">
        <div className="p-6 max-w-7xl mx-auto">
          <div className="mb-8">
            <h1 className="text-3xl font-bold">Support Center</h1>
            <p className="text-gray-400 mt-1">Get help with your training and account</p>
          </div>
          
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            <div className="lg:col-span-8 space-y-6">
              <Tabs defaultValue="live-chat" className="w-full">
                <TabsList className="grid grid-cols-2 mb-4">
                  <TabsTrigger value="live-chat" className="flex items-center gap-2">
                    <MessageSquare className="h-4 w-4" /> Live Chat
                  </TabsTrigger>
                  <TabsTrigger value="support-ticket" className="flex items-center gap-2">
                    <FileText className="h-4 w-4" /> Support Ticket
                  </TabsTrigger>
                </TabsList>
                
                <TabsContent value="live-chat" className="space-y-4">
                  <LiveChat />
                </TabsContent>
                
                <TabsContent value="support-ticket" className="space-y-4">
                  <SupportTickets />
                </TabsContent>
              </Tabs>
            </div>
            
            <div className="lg:col-span-4 space-y-6">
              <Card className="bg-[#111111] border-[#333333]">
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <HelpCircle className="h-5 w-5 text-[#ea384c] mr-2" />
                    Quick Help
                  </CardTitle>
                  <CardDescription>Frequently asked questions</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="bg-[#1A1A1A] border border-[#333333] p-4 rounded-lg">
                    <h3 className="font-medium mb-2">How do I reschedule a session?</h3>
                    <p className="text-sm text-gray-400">
                      You can reschedule a session up to 24 hours before your appointment time by visiting the Schedule page.
                    </p>
                  </div>
                  
                  <div className="bg-[#1A1A1A] border border-[#333333] p-4 rounded-lg">
                    <h3 className="font-medium mb-2">What's your cancellation policy?</h3>
                    <p className="text-sm text-gray-400">
                      Sessions can be cancelled up to 24 hours in advance. Late cancellations may incur a fee.
                    </p>
                  </div>
                  
                  <div className="bg-[#1A1A1A] border border-[#333333] p-4 rounded-lg">
                    <h3 className="font-medium mb-2">How do I update my billing information?</h3>
                    <p className="text-sm text-gray-400">
                      You can update your billing information in Settings under the Payment Methods section.
                    </p>
                  </div>
                </CardContent>
              </Card>
              
              <Card className="bg-[#111111] border-[#333333]">
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <Phone className="h-5 w-5 text-[#ea384c] mr-2" />
                    Contact Information
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <p className="text-sm text-gray-400">
                      <span className="font-medium text-white block">Phone:</span>
                      (555) 123-4567
                    </p>
                    <p className="text-sm text-gray-400">
                      <span className="font-medium text-white block">Email:</span>
                      support@surrenderedsinner.com
                    </p>
                    <p className="text-sm text-gray-400">
                      <span className="font-medium text-white block">Hours:</span>
                      Monday - Friday: 9AM - 5PM EST
                    </p>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Support;
