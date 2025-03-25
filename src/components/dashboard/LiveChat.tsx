
import { useState, useEffect, useRef } from "react";
import { useAuth } from "@/hooks/useAuth";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { Send, Loader2 } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

const LiveChat = () => {
  const { profile } = useAuth();
  const { toast } = useToast();
  const [message, setMessage] = useState("");
  const [chatHistory, setChatHistory] = useState([
    {
      id: "system-welcome",
      sender: "agent",
      message: "Hello! Welcome to Surrendered Sinner support. How can I help you today?",
      timestamp: new Date().toISOString(),
    },
  ]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const chatEndRef = useRef(null);
  
  const scrollToBottom = () => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };
  
  useEffect(() => {
    scrollToBottom();
  }, [chatHistory]);
  
  const handleSendMessage = async () => {
    if (!message.trim()) return;
    
    // Add user message to chat
    const userMessageId = `user-${Date.now()}`;
    setChatHistory(prev => [
      ...prev,
      {
        id: userMessageId,
        sender: "user",
        message: message.trim(),
        timestamp: new Date().toISOString(),
      }
    ]);
    
    setIsSubmitting(true);
    setMessage("");
    
    // Simulate agent response after a delay
    setTimeout(() => {
      setChatHistory(prev => [
        ...prev,
        {
          id: `agent-${Date.now()}`,
          sender: "agent",
          message: "Thanks for your message! One of our agents will respond shortly. In the meantime, is there anything else I can help you with?",
          timestamp: new Date().toISOString(),
        }
      ]);
      setIsSubmitting(false);
    }, 1500);
  };
  
  const formatTime = (timestamp) => {
    const date = new Date(timestamp);
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };
  
  return (
    <Card className="bg-[#111111] border-[#333333] overflow-hidden">
      <CardContent className="p-0">
        <div className="flex flex-col h-[600px]">
          <div className="flex items-center p-4 border-b border-[#333333] bg-[#0a0a0a]">
            <div className="w-10 h-10 bg-[#ea384c]/20 rounded-full flex items-center justify-center text-[#ea384c] font-bold mr-3">
              SS
            </div>
            <div>
              <p className="font-medium">Support Agent</p>
              <div className="flex items-center">
                <span className="h-2 w-2 rounded-full bg-green-500 mr-2"></span>
                <span className="text-xs text-gray-400">Online</span>
              </div>
            </div>
          </div>
          
          <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-[#0a0a0a]/50">
            {chatHistory.map((chat) => (
              <div
                key={chat.id}
                className={`flex ${
                  chat.sender === "user" ? "justify-end" : "justify-start"
                }`}
              >
                <div
                  className={`max-w-[80%] flex ${
                    chat.sender === "user" ? "flex-row-reverse" : "flex-row"
                  } items-start gap-2`}
                >
                  {chat.sender === "agent" && (
                    <Avatar className="h-8 w-8 mt-1">
                      <AvatarImage src="/support-agent.jpg" alt="Support Agent" />
                      <AvatarFallback className="bg-[#ea384c]/20 text-[#ea384c]">SS</AvatarFallback>
                    </Avatar>
                  )}
                  
                  <div>
                    <div
                      className={`p-3 rounded-lg ${
                        chat.sender === "user"
                          ? "bg-[#ea384c] text-white"
                          : "bg-[#1A1A1A] border border-[#333333] text-white"
                      }`}
                    >
                      <p className="text-sm">{chat.message}</p>
                    </div>
                    <div
                      className={`text-xs text-gray-500 mt-1 ${
                        chat.sender === "user" ? "text-right" : "text-left"
                      }`}
                    >
                      {formatTime(chat.timestamp)}
                    </div>
                  </div>
                  
                  {chat.sender === "user" && (
                    <Avatar className="h-8 w-8 mt-1">
                      <AvatarImage src={profile?.avatar_url} alt={profile?.full_name} />
                      <AvatarFallback className="bg-[#ea384c]/20 text-[#ea384c]">
                        {profile?.full_name?.charAt(0) || "U"}
                      </AvatarFallback>
                    </Avatar>
                  )}
                </div>
              </div>
            ))}
            <div ref={chatEndRef} />
          </div>
          
          <div className="p-4 border-t border-[#333333] bg-[#0a0a0a]">
            <form
              onSubmit={(e) => {
                e.preventDefault();
                handleSendMessage();
              }}
              className="flex items-end gap-2"
            >
              <Textarea
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                placeholder="Type your message here..."
                className="min-h-[80px] bg-[#1A1A1A] border-[#333333] resize-none"
                disabled={isSubmitting}
              />
              <Button
                type="submit"
                size="icon"
                className="h-10 w-10 rounded-full bg-[#ea384c] hover:bg-[#d32d3f]"
                disabled={!message.trim() || isSubmitting}
              >
                {isSubmitting ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <Send className="h-4 w-4" />
                )}
              </Button>
            </form>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default LiveChat;
