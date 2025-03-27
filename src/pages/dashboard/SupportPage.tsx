
import React from 'react';
import DashboardLayout from './DashboardLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import DashboardSupportTickets from '@/components/dashboard/DashboardSupportTickets';
import LiveChat from '@/components/dashboard/LiveChat';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

const SupportPage = () => {
  return (
    <DashboardLayout>
      <div className="container mx-auto px-4 py-6">
        <div className="mb-6">
          <h1 className="text-2xl font-bold">Support</h1>
          <p className="text-muted-foreground">Get help with your account or training plans</p>
        </div>
        
        <Tabs defaultValue="tickets">
          <TabsList className="mb-4">
            <TabsTrigger value="tickets">Support Tickets</TabsTrigger>
            <TabsTrigger value="chat">Live Chat</TabsTrigger>
            <TabsTrigger value="faq">FAQ</TabsTrigger>
          </TabsList>
          
          <TabsContent value="tickets">
            <DashboardSupportTickets />
          </TabsContent>
          
          <TabsContent value="chat">
            <Card>
              <CardHeader>
                <CardTitle>Live Chat Support</CardTitle>
                <CardDescription>Connect with our support team in real-time</CardDescription>
              </CardHeader>
              <CardContent>
                <LiveChat />
              </CardContent>
            </Card>
          </TabsContent>
          
          <TabsContent value="faq">
            <Card>
              <CardHeader>
                <CardTitle>Frequently Asked Questions</CardTitle>
                <CardDescription>Find answers to common questions</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <h3 className="font-medium">How do I cancel my subscription?</h3>
                  <p className="text-muted-foreground">You can cancel your subscription from the Payment section of your dashboard. Navigate to Dashboard → Payment → Subscription Details.</p>
                </div>
                <div className="space-y-2">
                  <h3 className="font-medium">Can I change my workout plan?</h3>
                  <p className="text-muted-foreground">Yes, you can modify your workout plan in the Training Plans section. If you need a completely new plan, please contact your trainer.</p>
                </div>
                <div className="space-y-2">
                  <h3 className="font-medium">How do I track my progress?</h3>
                  <p className="text-muted-foreground">Use the Progress section in your dashboard to track weight, measurements, and performance metrics.</p>
                </div>
                <div className="space-y-2">
                  <h3 className="font-medium">How can I reschedule a session?</h3>
                  <p className="text-muted-foreground">You can reschedule a session from the Schedule section. Please provide at least 24 hours notice for any changes.</p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </DashboardLayout>
  );
};

export default SupportPage;
