
import { useState } from "react";
import { useAuth } from "@/hooks/useAuth";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/hooks/use-toast";
import { MessageSquare, Phone, Loader2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";

const SupportTickets = () => {
  const { profile } = useAuth();
  const { toast } = useToast();
  const [inquirySubject, setInquirySubject] = useState("");
  const [inquiryMessage, setInquiryMessage] = useState("");
  const [callSubject, setCallSubject] = useState("");
  const [callMessage, setCallMessage] = useState("");
  const [preferredTime, setPreferredTime] = useState("morning");
  const [isSubmittingInquiry, setIsSubmittingInquiry] = useState(false);
  const [isSubmittingCall, setIsSubmittingCall] = useState(false);

  const handleInquirySubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!profile?.id) return;
    
    if (!inquirySubject.trim() || !inquiryMessage.trim()) {
      toast({
        title: "Missing information",
        description: "Please provide both a subject and message",
        variant: "destructive",
      });
      return;
    }
    
    setIsSubmittingInquiry(true);
    
    try {
      const { error } = await supabase
        .from('support_tickets')
        .insert({
          user_id: profile.id,
          subject: inquirySubject,
          message: inquiryMessage,
          type: 'inquiry',
          status: 'open',
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        });
        
      if (error) {
        throw error;
      }
      
      // Clear form
      setInquirySubject("");
      setInquiryMessage("");
      
      toast({
        title: "Inquiry submitted",
        description: "We'll respond to your inquiry as soon as possible",
      });
    } catch (error: any) {
      toast({
        title: "Error submitting inquiry",
        description: error.message || "Failed to submit your inquiry",
        variant: "destructive",
      });
    } finally {
      setIsSubmittingInquiry(false);
    }
  };

  const handleCallRequestSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!profile?.id) return;
    
    if (!callSubject.trim()) {
      toast({
        title: "Missing information",
        description: "Please provide a subject for your call request",
        variant: "destructive",
      });
      return;
    }
    
    setIsSubmittingCall(true);
    
    try {
      const formattedMessage = `${callMessage}\n\nPreferred time: ${preferredTime}`;
      
      const { error } = await supabase
        .from('support_tickets')
        .insert({
          user_id: profile.id,
          subject: callSubject,
          message: formattedMessage,
          type: 'call_request',
          status: 'open',
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        });
        
      if (error) {
        throw error;
      }
      
      // Clear form
      setCallSubject("");
      setCallMessage("");
      setPreferredTime("morning");
      
      toast({
        title: "Call request submitted",
        description: "We'll contact you soon to schedule your call",
      });
    } catch (error: any) {
      toast({
        title: "Error submitting request",
        description: error.message || "Failed to submit your call request",
        variant: "destructive",
      });
    } finally {
      setIsSubmittingCall(false);
    }
  };

  return (
    <Card className="bg-gray-900 border-gray-800">
      <CardHeader>
        <CardTitle>Support</CardTitle>
        <CardDescription className="text-gray-400">
          Submit an inquiry or request a call from our team
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="inquiry" className="w-full">
          <TabsList className="mb-4 w-full">
            <TabsTrigger value="inquiry" className="flex-1">
              <MessageSquare className="w-4 h-4 mr-2" /> Submit Inquiry
            </TabsTrigger>
            <TabsTrigger value="call" className="flex-1">
              <Phone className="w-4 h-4 mr-2" /> Request Call
            </TabsTrigger>
          </TabsList>
          
          <TabsContent value="inquiry">
            <form onSubmit={handleInquirySubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="inquiry-subject">Subject</Label>
                <Input
                  id="inquiry-subject"
                  value={inquirySubject}
                  onChange={(e) => setInquirySubject(e.target.value)}
                  placeholder="Brief description of your inquiry"
                  className="bg-gray-800 border-gray-700"
                  disabled={isSubmittingInquiry}
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="inquiry-message">Message</Label>
                <Textarea
                  id="inquiry-message"
                  value={inquiryMessage}
                  onChange={(e) => setInquiryMessage(e.target.value)}
                  placeholder="Please provide details about your inquiry"
                  className="bg-gray-800 border-gray-700 min-h-24"
                  disabled={isSubmittingInquiry}
                />
              </div>
              
              <Button 
                type="submit" 
                className="w-full"
                disabled={isSubmittingInquiry}
              >
                {isSubmittingInquiry ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Submitting...
                  </>
                ) : (
                  "Submit Inquiry"
                )}
              </Button>
            </form>
          </TabsContent>
          
          <TabsContent value="call">
            <form onSubmit={handleCallRequestSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="call-subject">Subject</Label>
                <Input
                  id="call-subject"
                  value={callSubject}
                  onChange={(e) => setCallSubject(e.target.value)}
                  placeholder="What would you like to discuss on the call?"
                  className="bg-gray-800 border-gray-700"
                  disabled={isSubmittingCall}
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="preferred-time">Preferred Time</Label>
                <RadioGroup 
                  value={preferredTime} 
                  onValueChange={setPreferredTime}
                  className="flex flex-col space-y-1"
                  disabled={isSubmittingCall}
                >
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="morning" id="morning" />
                    <Label htmlFor="morning" className="font-normal">Morning (9AM - 12PM)</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="afternoon" id="afternoon" />
                    <Label htmlFor="afternoon" className="font-normal">Afternoon (12PM - 5PM)</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="evening" id="evening" />
                    <Label htmlFor="evening" className="font-normal">Evening (5PM - 8PM)</Label>
                  </div>
                </RadioGroup>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="call-message">Additional Information</Label>
                <Textarea
                  id="call-message"
                  value={callMessage}
                  onChange={(e) => setCallMessage(e.target.value)}
                  placeholder="Any specific questions or topics you'd like to discuss?"
                  className="bg-gray-800 border-gray-700"
                  disabled={isSubmittingCall}
                />
              </div>
              
              <Button 
                type="submit" 
                className="w-full"
                disabled={isSubmittingCall}
              >
                {isSubmittingCall ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Submitting...
                  </>
                ) : (
                  "Request Call"
                )}
              </Button>
            </form>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
};

export default SupportTickets;
