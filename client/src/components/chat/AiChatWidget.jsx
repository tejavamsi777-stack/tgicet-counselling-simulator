import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { MessageSquare, Bot, Send, X, Sparkles, User, RefreshCw } from "lucide-react";
import { api } from "../../lib/api";

const QUICK_CHIPS = [
  { label: "🎯 Predict Colleges", query: "Predict colleges for my rank" },
  { label: "📑 Document Checklist", query: "What documents are needed for HLC verification?" },
  { label: "💰 Fee Reimbursement", query: "Who is eligible for ePASS fee reimbursement?" },
  { label: "💡 Web Options Strategy", query: "How do web options and sliding work?" },
  { label: "📅 Counselling Schedule", query: "When does counselling phase 1 start?" },
];

export default function AiChatWidget() {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([
    {
      id: "welcome",
      sender: "ai",
      text: "👋 **Welcome to Vuela AI Counselor!**\n\nI am your instant AI admission assistant for AP & TG Entrance Exams (**EAPCET, ICET, ECET, POLYCET, PGECET**).\n\nHow can I help you today?",
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    }
  ]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    if (isOpen) {
      scrollToBottom();
    }
  }, [messages, isOpen]);

  const handleSend = async (textToSend = null) => {
    const query = textToSend || input;
    if (!query || !query.trim() || loading) return;

    const userMsg = {
      id: Date.now(),
      sender: "user",
      text: query,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };

    setMessages((prev) => [...prev, userMsg]);
    if (!textToSend) setInput("");
    setLoading(true);

    try {
      const path = typeof window !== "undefined" ? window.location.pathname : "";
      const examSlug = path.includes("icet") ? "tg-icet" : path.includes("ecet") ? "tg-ecet" : path.includes("polycet") ? "tg-polycet" : path.includes("pgecet") ? "tg-pgecet" : path.includes("ap-eapcet") ? "ap-eapcet" : "tg-eapcet";
      
      const response = await api.post("/ai/chat", {
        message: query,
        examSlug
      });

      const aiMsg = {
        id: Date.now() + 1,
        sender: "ai",
        text: response.reply || "Sorry, I couldn't process that query. Please try again.",
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      };
      setMessages((prev) => [...prev, aiMsg]);
    } catch (err) {
      setMessages((prev) => [
        ...prev,
        {
          id: Date.now() + 1,
          sender: "ai",
          text: "⚠️ Failed to connect to AI Counselor service. Please check your internet connection.",
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        }
      ]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      {/* Floating Action Button Docked Bottom-Right */}
      <div className="fixed bottom-5 right-5 z-[80] sm:bottom-6 sm:right-6">
        <motion.button
          whileHover={{ scale: 1.06 }}
          whileTap={{ scale: 0.94 }}
          onClick={() => setIsOpen(!isOpen)}
          className="group relative flex h-12 w-12 items-center justify-center rounded-full border border-purple-400/40 bg-gradient-to-r from-purple-600 via-indigo-600 to-cyan-600 text-white shadow-[0_8px_32px_rgba(124,58,237,0.45)] cursor-pointer"
          title="Open Vuela AI Admission Assistant"
          aria-label="Open Vuela AI Admission Assistant"
        >
          {isOpen ? <X size={20} /> : <Bot size={22} className="animate-pulse" />}
          
          {!isOpen && (
            <span className="absolute -top-1 -right-1 flex h-3.5 w-3.5 items-center justify-center rounded-full bg-cyan-400">
              <span className="h-2 w-2 rounded-full bg-black animate-ping" />
            </span>
          )}
        </motion.button>
      </div>

      {/* Floating AI Chat Window Modal */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            transition={{ duration: 0.25, ease: [0.16, 1, 0.3, 1] }}
            className="fixed bottom-20 right-4 z-[9999] w-[calc(100vw-32px)] max-w-sm sm:max-w-md h-[540px] rounded-3xl border border-white/20 bg-[#100821]/95 text-white shadow-[0_25px_60px_rgba(0,0,0,0.9),inset_0_1px_0_rgba(255,255,255,0.2)] backdrop-blur-3xl flex flex-col overflow-hidden"
          >
            {/* Chat Header */}
            <div className="flex items-center justify-between border-b border-white/10 px-5 py-4 bg-gradient-to-r from-purple-950/60 to-black/60">
              <div className="flex items-center gap-3">
                <div className="flex h-9 w-9 items-center justify-center rounded-2xl bg-purple-600/30 border border-purple-400/40 text-purple-300 shadow-inner">
                  <Bot size={20} />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-white tracking-tight flex items-center gap-1.5">
                    <span>Vuela AI Counselor</span>
                    <span className="rounded-full bg-emerald-500/20 border border-emerald-500/30 px-1.5 py-0.2 text-[9px] font-mono text-emerald-300">ONLINE</span>
                  </h3>
                  <p className="text-[11px] text-white/50">AP &amp; TG Admission Assistant</p>
                </div>
              </div>
              <button
                onClick={() => setIsOpen(false)}
                className="flex h-8 w-8 items-center justify-center rounded-full bg-white/5 text-white/70 hover:bg-white/15 hover:text-white transition-colors cursor-pointer"
              >
                <X size={16} />
              </button>
            </div>

            {/* Messages Scroll Area */}
            <div className="flex-1 overflow-y-auto p-4 space-y-3.5 text-xs custom-scrollbar">
              {messages.map((msg) => (
                <div
                  key={msg.id}
                  className={`flex gap-2.5 ${msg.sender === "user" ? "justify-end" : "justify-start"}`}
                >
                  {msg.sender === "ai" && (
                    <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-xl bg-purple-500/20 border border-purple-500/30 text-purple-300 mt-0.5">
                      <Sparkles size={14} />
                    </div>
                  )}

                  <div
                    className={`max-w-[85%] rounded-2xl px-4 py-3 text-xs leading-relaxed ${
                      msg.sender === "user"
                        ? "bg-gradient-to-r from-purple-600 to-indigo-600 text-white shadow-md rounded-br-none font-medium"
                        : "bg-white/[0.06] border border-white/10 text-gray-200 rounded-bl-none shadow-sm whitespace-pre-wrap"
                    }`}
                  >
                    {msg.text}
                    <div className={`mt-1 text-[9px] opacity-40 text-right font-mono`}>
                      {msg.timestamp}
                    </div>
                  </div>

                  {msg.sender === "user" && (
                    <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-xl bg-indigo-500/20 border border-indigo-500/30 text-indigo-300 mt-0.5">
                      <User size={14} />
                    </div>
                  )}
                </div>
              ))}

              {loading && (
                <div className="flex gap-2.5 justify-start">
                  <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-xl bg-purple-500/20 border border-purple-500/30 text-purple-300">
                    <Sparkles size={14} className="animate-spin" />
                  </div>
                  <div className="rounded-2xl border border-white/10 bg-white/[0.06] px-4 py-3 text-xs text-purple-300 flex items-center gap-2">
                    <RefreshCw size={12} className="animate-spin" />
                    <span>Analyzing admission database...</span>
                  </div>
                </div>
              )}
              <div ref={messagesEndRef} />
            </div>

            {/* Quick Suggestion Chips */}
            <div className="border-t border-white/10 px-3 py-2 bg-black/40 overflow-x-auto whitespace-nowrap custom-scrollbar flex gap-1.5">
              {QUICK_CHIPS.map((chip) => (
                <button
                  key={chip.label}
                  onClick={() => handleSend(chip.query)}
                  className="rounded-full border border-purple-500/30 bg-purple-500/10 px-2.5 py-1 text-[10px] font-semibold text-purple-300 hover:bg-purple-500/25 transition cursor-pointer shrink-0"
                >
                  {chip.label}
                </button>
              ))}
            </div>

            {/* Input Form Bar */}
            <form
              onSubmit={(e) => {
                e.preventDefault();
                handleSend();
              }}
              className="border-t border-white/10 p-3 bg-black/60 flex items-center gap-2"
            >
              <input
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="Ask AI Counselor anything..."
                className="w-full bg-white/5 border border-white/10 rounded-2xl px-3.5 py-2.5 text-xs text-white placeholder-white/30 focus:border-purple-400 focus:outline-none"
              />
              <button
                type="submit"
                disabled={loading || !input.trim()}
                className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-gradient-to-r from-purple-600 to-indigo-600 text-white disabled:opacity-40 disabled:cursor-not-allowed hover:brightness-110 transition cursor-pointer"
              >
                <Send size={15} />
              </button>
            </form>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
