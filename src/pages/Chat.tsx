import { useState } from "react";
import { useNavigate } from "react-router";
import { motion, AnimatePresence } from "framer-motion";
import { Search, Send, ChevronLeft } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import AppLayout from "@/components/layout/AppLayout";

// Demo chat partners since we need user data
const demoPartners = [
  { id: 2, name: "Fatima Zahra", avatar: "FZ", lastMessage: "Is the camera still available?", time: "2m ago", unread: 2 },
  { id: 3, name: "Ahmed Khan", avatar: "AK", lastMessage: "Thanks for the notes!", time: "1h ago", unread: 0 },
  { id: 4, name: "Zara Malik", avatar: "ZM", lastMessage: "Can we meet at the library?", time: "3h ago", unread: 1 },
];

const demoMessages: Record<number, Array<{ id: number; senderId: number; content: string; time: string }>> = {
  2: [
    { id: 1, senderId: 2, content: "Hey! I saw your DSLR listing", time: "10:30 AM" },
    { id: 2, senderId: 1, content: "Hi! Yes, it's available for rent", time: "10:32 AM" },
    { id: 3, senderId: 2, content: "Great! I need it for 3 days for my media project", time: "10:33 AM" },
    { id: 4, senderId: 1, content: "That works. It's Rs. 1500/day with a security deposit", time: "10:35 AM" },
    { id: 5, senderId: 2, content: "Is the camera still available?", time: "10:40 AM" },
  ],
  3: [
    { id: 1, senderId: 3, content: "Hey, are you selling Calculus notes?", time: "Yesterday" },
    { id: 2, senderId: 1, content: "Yes! Complete set for Rs. 300", time: "Yesterday" },
    { id: 3, senderId: 3, content: "Perfect, I'll take them", time: "Yesterday" },
    { id: 4, senderId: 1, content: "Meet at Student Center at 3?", time: "Yesterday" },
    { id: 5, senderId: 3, content: "Thanks for the notes!", time: "1h ago" },
  ],
  4: [
    { id: 1, senderId: 4, content: "Hi! I'm interested in your Arduino kit", time: "Yesterday" },
    { id: 2, senderId: 1, content: "Hello! It's available for Rs. 800/week", time: "Yesterday" },
    { id: 3, senderId: 4, content: "Can we meet at the library?", time: "3h ago" },
  ],
};

export default function Chat() {
  const navigate = useNavigate();
  const [selectedPartner, setSelectedPartner] = useState<number | null>(null);
  const [newMessage, setNewMessage] = useState("");
  const [messages, setMessages] = useState(demoMessages);

  const partner = demoPartners.find((p) => p.id === selectedPartner);

  const handleSend = () => {
    if (!newMessage.trim() || !selectedPartner) return;

    const updated = {
      ...messages,
      [selectedPartner]: [
        ...(messages[selectedPartner] || []),
        {
          id: Date.now(),
          senderId: 1,
          content: newMessage,
          time: "Just now",
        },
      ],
    };
    setMessages(updated);
    setNewMessage("");
  };

  return (
    <AppLayout>
      {!selectedPartner ? (
        // Conversations List
        <div className="px-4 pt-4 pb-4">
          <div className="flex items-center gap-3 mb-4">
            <button
              onClick={() => navigate("/dashboard")}
              className="p-2 bg-[#1A1F2E] rounded-xl border border-white/5"
            >
              <ChevronLeft size={20} className="text-gray-400" />
            </button>
            <h1 className="text-xl font-bold">Messages</h1>
          </div>

          <div className="relative mb-4">
            <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" />
            <Input
              placeholder="Search conversations..."
              className="pl-10 bg-[#1A1F2E] border-white/10 text-white placeholder:text-gray-600 h-11"
            />
          </div>

          <div className="space-y-2">
            {demoPartners.map((partner, i) => (
              <motion.button
                key={partner.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: i * 0.08 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => setSelectedPartner(partner.id)}
                className="w-full flex items-center gap-3 bg-[#1A1F2E] rounded-xl p-3 border border-white/5 text-left"
              >
                <div className="w-12 h-12 rounded-full bg-gradient-to-br from-[#6366F1] to-[#10B981] flex items-center justify-center flex-shrink-0">
                  <span className="text-white font-bold text-sm">{partner.avatar}</span>
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between">
                    <h3 className="text-sm font-medium">{partner.name}</h3>
                    <span className="text-[10px] text-gray-500">{partner.time}</span>
                  </div>
                  <p className="text-xs text-gray-400 truncate">{partner.lastMessage}</p>
                </div>
                {partner.unread > 0 && (
                  <span className="w-5 h-5 bg-[#6366F1] rounded-full flex items-center justify-center text-[10px] font-medium flex-shrink-0">
                    {partner.unread}
                  </span>
                )}
              </motion.button>
            ))}
          </div>
        </div>
      ) : (
        // Chat Screen
        <div className="flex flex-col h-[calc(100vh-80px)]">
          {/* Chat Header */}
          <div className="flex items-center gap-3 px-4 py-3 bg-[#1A1F2E] border-b border-white/5">
            <button onClick={() => setSelectedPartner(null)}>
              <ChevronLeft size={20} className="text-gray-400" />
            </button>
            <div className="w-9 h-9 rounded-full bg-gradient-to-br from-[#6366F1] to-[#10B981] flex items-center justify-center">
              <span className="text-white font-bold text-xs">{partner?.avatar}</span>
            </div>
            <div>
              <h3 className="text-sm font-medium">{partner?.name}</h3>
              <p className="text-[10px] text-[#10B981]">Online</p>
            </div>
          </div>

          {/* Messages */}
          <div className="flex-1 overflow-y-auto px-4 py-4 space-y-3">
            <AnimatePresence>
              {messages[selectedPartner]?.map((msg, i) => {
                const isMe = msg.senderId === 1;
                return (
                  <motion.div
                    key={msg.id}
                    initial={{ opacity: 0, y: 10, scale: 0.95 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    transition={{ delay: i * 0.02 }}
                    className={`flex ${isMe ? "justify-end" : "justify-start"}`}
                  >
                    <div
                      className={`max-w-[75%] px-3.5 py-2.5 rounded-2xl ${
                        isMe
                          ? "bg-[#6366F1] text-white rounded-br-md"
                          : "bg-[#1A1F2E] text-gray-300 border border-white/5 rounded-bl-md"
                      }`}
                    >
                      <p className="text-sm">{msg.content}</p>
                      <p className={`text-[10px] mt-1 ${isMe ? "text-white/60" : "text-gray-500"}`}>
                        {msg.time}
                      </p>
                    </div>
                  </motion.div>
                );
              })}
            </AnimatePresence>
          </div>

          {/* Input */}
          <div className="px-4 py-3 bg-[#1A1F2E] border-t border-white/5">
            <div className="flex items-center gap-2">
              <Input
                placeholder="Type a message..."
                value={newMessage}
                onChange={(e) => setNewMessage(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleSend()}
                className="bg-[#252B3D] border-white/10 text-white placeholder:text-gray-600 h-11"
              />
              <Button
                onClick={handleSend}
                className="w-11 h-11 p-0 bg-[#6366F1] hover:bg-[#5558E0] rounded-xl"
              >
                <Send size={18} />
              </Button>
            </div>
          </div>
        </div>
      )}
    </AppLayout>
  );
}
