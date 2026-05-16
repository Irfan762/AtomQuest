import { useState, useRef, useEffect } from "react";
import { MessageSquare, Send, X, Bot, ChevronDown, Minus } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import api from "../lib/api";
import { useNavigate } from "react-router-dom";

const AIChatBot = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);
  const [message, setMessage] = useState("");
  const [chat, setChat] = useState([
    { role: "bot", content: "Hello! I'm GoalGrid AI. Ask me about your team's performance, pending tasks, or strategic risks." }
  ]);
  const [loading, setLoading] = useState(false);
  const chatRef = useRef(null);
  const navigate = useNavigate();

  useEffect(() => {
    if (chatRef.current) {
      chatRef.current.scrollTop = chatRef.current.scrollHeight;
    }
  }, [chat]);

  const handleSend = async (e) => {
    e.preventDefault();
    if (!message.trim()) return;

    const userMsg = message;
    setMessage("");
    setChat(prev => [...prev, { role: "user", content: userMsg }]);
    setLoading(true);

    try {
      const { data } = await api.post("/ai/chat", { message: userMsg });
      setChat(prev => [...prev, { role: "bot", content: data.response }]);
      if (data.action) {
        setChat(prev => [...prev, { role: "bot", content: "I can take you there now.", link: data.action }]);
      }
    } catch (err) {
      setChat(prev => [...prev, { role: "bot", content: "Sorry, I encountered an error. Please try again." }]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed bottom-6 right-6 z-[100] flex flex-col items-end">
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            className={`glass border-primary/20 shadow-2xl rounded-2xl flex flex-col transition-all duration-300 ${isMinimized ? "w-64 h-14" : "w-80 h-[450px]"}`}
          >
            <div className="p-4 border-b border-white/10 bg-primary/10 rounded-t-2xl flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="p-1.5 bg-primary rounded-lg">
                  <Bot className="w-4 h-4 text-white" />
                </div>
                <span className="font-bold text-sm tracking-tight">GoalGrid AI</span>
              </div>
              <div className="flex items-center gap-1">
                <button onClick={() => setIsMinimized(!isMinimized)} className="p-1 hover:bg-white/10 rounded">
                  <Minus className="w-4 h-4" />
                </button>
                <button onClick={() => setIsOpen(false)} className="p-1 hover:bg-white/10 rounded">
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>

            {!isMinimized && (
              <>
                <div 
                  ref={chatRef}
                  className="flex-1 overflow-y-auto p-4 space-y-4 scrollbar-hide"
                >
                  {chat.map((msg, idx) => (
                    <div 
                      key={idx} 
                      className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}
                    >
                      <div className={`max-w-[85%] p-3 rounded-2xl text-xs leading-relaxed ${
                        msg.role === "user" 
                        ? "bg-primary text-primary-foreground rounded-tr-none" 
                        : "bg-secondary text-foreground rounded-tl-none"
                      }`}>
                        {msg.content}
                        {msg.link && (
                          <button 
                            onClick={() => navigate(msg.link)}
                            className="mt-2 block w-full bg-white/10 hover:bg-white/20 py-1.5 rounded-lg font-bold border border-white/10"
                          >
                            Go to Page
                          </button>
                        )}
                      </div>
                    </div>
                  ))}
                  {loading && (
                    <div className="flex justify-start">
                      <div className="bg-secondary p-3 rounded-2xl rounded-tl-none flex gap-1">
                        <span className="w-1.5 h-1.5 bg-primary rounded-full animate-bounce" />
                        <span className="w-1.5 h-1.5 bg-primary rounded-full animate-bounce [animation-delay:0.2s]" />
                        <span className="w-1.5 h-1.5 bg-primary rounded-full animate-bounce [animation-delay:0.4s]" />
                      </div>
                    </div>
                  )}
                </div>

                <form onSubmit={handleSend} className="p-4 border-t border-white/10 flex gap-2">
                  <input 
                    type="text" 
                    placeholder="Type a message..." 
                    className="flex-1 bg-secondary/50 border-none rounded-xl px-4 py-2 text-xs focus:ring-1 focus:ring-primary outline-none"
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                  />
                  <button 
                    type="submit"
                    className="p-2 bg-primary text-white rounded-xl hover:opacity-90 transition-opacity"
                  >
                    <Send className="w-4 h-4" />
                  </button>
                </form>
              </>
            )}
          </motion.div>
        )}
      </AnimatePresence>

      <motion.button
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        onClick={() => {
          setIsOpen(!isOpen);
          setIsMinimized(false);
        }}
        className={`mt-4 p-4 rounded-full shadow-2xl transition-colors ${isOpen ? "bg-secondary text-primary" : "bg-primary text-white"}`}
      >
        {isOpen ? <ChevronDown className="w-6 h-6" /> : <MessageSquare className="w-6 h-6" />}
      </motion.button>
    </div>
  );
};

export default AIChatBot;
