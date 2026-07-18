import React, { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Bot, RefreshCw, Sparkles, SendHorizontal, MessageSquareDot, Sparkle } from "lucide-react";
import { useRouterState } from "@tanstack/react-router";
import { apiClient } from "@/lib/apiClient";
import { useAuth } from "@/hooks/useAuth";
import { useSessionMode } from "@/hooks/useSessionMode";
import { cn } from "@/lib/utils";

interface Message {
  id: string;
  sender: "user" | "bot";
  content: string;
  timestamp: Date;
}

const QUICK_PROMPTS = [
  "Track my orders",
  "What categories are available?",
  "show me the all suppliers"
];

export function Chatbot() {
  const { isAuthenticated } = useAuth();
  const sessionMode = useSessionMode();
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  const [isOpen, setIsOpen] = useState(false);
  const [showTooltip, setShowTooltip] = useState(true);
  const [messages, setMessages] = useState<Message[]>([
    {
      id: "welcome",
      sender: "bot",
      content: "Namaste! I am your VyaparSetu AI Assistant. How can I help you search products or manage orders today?",
      timestamp: new Date()
    }
  ]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  // Hide the floating tooltip helper after 8 seconds
  useEffect(() => {
    const timer = setTimeout(() => {
      setShowTooltip(false);
    }, 8000);
    return () => clearTimeout(timer);
  }, []);

  // Auto-scroll on new messages or loading state change
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, isLoading, isOpen]);

  // Visibility: show the buyer assistant for ANY signed-in user, hidden only
  // inside the seller/admin workspaces (by route) or in seller session mode.
  // The ONLY signal that makes it appear is `isAuthenticated` (instant via the
  // auth context) — no dependency on the account-flags query. Account-flag
  // checks were removed on purpose: dual-role accounts (e.g. the operator's
  // buyer+seller+admin account) were being hidden by `isAdmin`/`isPureSeller`
  // conditions even while browsing as a buyer.
  const inSellerArea =
    sessionMode === "seller" ||
    pathname.startsWith("/seller") ||
    pathname.startsWith("/supplier") ||
    pathname.startsWith("/admin");

  const shouldShow = isAuthenticated && !inSellerArea;

  if (!shouldShow) return null;

  const handleSend = async (text: string) => {
    if (!text.trim() || isLoading) return;

    const userMsg: Message = {
      id: Math.random().toString(36).substring(7),
      sender: "user",
      content: text,
      timestamp: new Date()
    };

    setMessages((prev) => [...prev, userMsg]);
    setInput("");
    setIsLoading(true);
    setShowTooltip(false); // Dismiss tooltip permanently once active

    try {
      const response = await apiClient("/chat", {
        method: "POST",
        body: JSON.stringify({ message: text })
      });
      const data = await response.json();
      
      const botMsg: Message = {
        id: Math.random().toString(36).substring(7),
        sender: "bot",
        content: data.final_response || "I could not retrieve a response. Please try again.",
        timestamp: new Date()
      };
      setMessages((prev) => [...prev, botMsg]);
    } catch (error) {
      const errorMsg: Message = {
        id: Math.random().toString(36).substring(7),
        sender: "bot",
        content: "Sorry, I had trouble reaching the assistant. Please check your network and try again.",
        timestamp: new Date()
      };
      setMessages((prev) => [...prev, errorMsg]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleClear = () => {
    setMessages([
      {
        id: "welcome",
        sender: "bot",
        content: "Namaste! I am your VyaparSetu AI Assistant. How can I help you search products or manage orders today?",
        timestamp: new Date()
      }
    ]);
  };

  // Basic markdown-like content parser
  const renderMessageContent = (content: string) => {
    const lines = content.split("\n");
    return lines.map((line, idx) => {
      const trimmed = line.trim();
      if (!trimmed) return <div key={idx} className="h-2" />;

      // Bold parser **bold**
      const boldRegex = /\*\*(.*?)\*\*/g;
      const matches = [...line.matchAll(boldRegex)];
      
      let elementContent: React.ReactNode = line;
      if (matches.length > 0) {
        elementContent = line.split(/\*\*.*?\*\*/).reduce((acc: any[], part, i) => {
          if (i === 0) return [part];
          const boldText = matches[i - 1]?.[1] || "";
          return [...acc, <strong key={i} className="font-semibold text-foreground">{boldText}</strong>, part];
        }, []);
      }

      // Check if it's a bullet point
      if (trimmed.startsWith("•") || trimmed.startsWith("-")) {
        const cleanText = trimmed.replace(/^[•-]\s*/, "");
        const bulletContent = typeof elementContent === "string" 
          ? cleanText 
          : line.replace(/^[•-]\s*/, "").split(/\*\*.*?\*\*/).reduce((acc: any[], part, i) => {
              if (i === 0) return [part];
              const boldText = matches[i - 1]?.[1] || "";
              return [...acc, <strong key={i} className="font-semibold text-foreground">{boldText}</strong>, part];
            }, []);

        return (
          <div key={idx} className="relative pl-4 mb-1 text-sm leading-relaxed text-foreground">
            <span className="absolute left-1 text-brand/80">•</span>
            {bulletContent}
          </div>
        );
      }

      return (
        <p key={idx} className="mb-1 text-sm leading-relaxed text-foreground whitespace-pre-wrap">
          {elementContent}
        </p>
      );
    });
  };

  return (
    <div className="fixed bottom-6 right-6 z-50 flex flex-col items-end">
      {/* Helper Tooltip Badge */}
      <AnimatePresence>
        {showTooltip && !isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 10, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
            className="mb-3 mr-1 flex items-center gap-2 rounded-2xl bg-card border border-border/80 px-4 py-2.5 shadow-xl"
          >
            <div className="flex h-5 w-5 items-center justify-center rounded-full bg-brand-soft text-brand">
              <Sparkle className="h-3 w-3 fill-brand text-brand" />
            </div>
            <span className="font-sans text-xs font-semibold text-foreground">Chat with VyaparSetu AI</span>
            <button
              type="button"
              onClick={() => setShowTooltip(false)}
              className="ml-1 text-muted-foreground hover:text-foreground cursor-pointer"
            >
              <X className="h-3 w-3" />
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Chat Window */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 25, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.95 }}
            transition={{ duration: 0.22, ease: "easeOut" }}
            className="mb-4 flex h-[520px] w-[390px] max-w-[calc(100vw-2rem)] flex-col rounded-[24px] border border-border bg-card shadow-[0_20px_50px_rgba(15,95,74,0.15)] overflow-hidden"
          >
            {/* Header */}
            <div className="flex items-center justify-between bg-gradient-to-tr from-[#0F5F4A] via-[#108548] to-[#14B8A6] p-4.5 text-white">
              <div className="flex items-center gap-3">
                <div className="relative flex h-10 w-10 items-center justify-center rounded-2xl bg-white/10 backdrop-blur-md border border-white/20">
                  <Bot className="h-5.5 w-5.5 text-white" />
                  <span className="absolute bottom-0 right-0 h-2.5 w-2.5 rounded-full border-2 border-brand bg-success animate-pulse" />
                </div>
                <div>
                  <h3 className="font-display font-bold leading-tight text-sm tracking-wide">VyaparSetu AI</h3>
                  <span className="text-[10px] text-white/80 font-medium">Sourcing Assistant • Online</span>
                </div>
              </div>
              <div className="flex items-center gap-1.5">
                <button
                  type="button"
                  onClick={handleClear}
                  className="rounded-full p-2 hover:bg-white/10 transition-colors cursor-pointer text-white/80 hover:text-white"
                  title="Clear chat history"
                >
                  <RefreshCw className="h-4 w-4" />
                </button>
                <button
                  type="button"
                  onClick={() => setIsOpen(false)}
                  className="rounded-full p-2 hover:bg-white/10 transition-colors cursor-pointer text-white/80 hover:text-white"
                  title="Close assistant"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>
            </div>

            {/* Chat Body */}
            <div 
              ref={scrollRef}
              className="flex-1 overflow-y-auto bg-surface/30 p-4 space-y-4"
            >
              {messages.map((msg) => (
                <div key={msg.id} className="space-y-1">
                  <div
                    className={cn(
                      "flex flex-col max-w-[85%] rounded-[18px] p-3.5 shadow-[0_1px_2px_rgba(0,0,0,0.02)] text-sm transition-all duration-200",
                      msg.sender === "user"
                        ? "ml-auto bg-gradient-to-tr from-[#0F5F4A] to-[#108548] text-white rounded-tr-none"
                        : "bg-[#F4F9F6] border border-[#E2ECE7] text-foreground rounded-tl-none"
                    )}
                  >
                    <div className="break-words font-sans">
                      {msg.sender === "bot" 
                        ? renderMessageContent(msg.content)
                        : <p className="leading-relaxed whitespace-pre-wrap text-white">{msg.content}</p>
                      }
                    </div>
                  </div>
                  <span 
                    className={cn(
                      "text-[9px] font-medium px-1",
                      msg.sender === "user" ? "text-right block text-muted-foreground" : "text-left block text-muted-foreground"
                    )}
                  >
                    {msg.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </span>
                </div>
              ))}

              {/* Typing/Loading Indicator */}
              {isLoading && (
                <div className="flex max-w-[80%] items-center gap-2 rounded-[18px] bg-[#F4F9F6] border border-[#E2ECE7] p-3.5 shadow-sm rounded-tl-none">
                  <span className="flex gap-1.5">
                    <span className="h-2 w-2 animate-bounce rounded-full bg-brand" style={{ animationDelay: '0ms' }} />
                    <span className="h-2 w-2 animate-bounce rounded-full bg-brand" style={{ animationDelay: '150ms' }} />
                    <span className="h-2 w-2 animate-bounce rounded-full bg-brand" style={{ animationDelay: '300ms' }} />
                  </span>
                  <span className="text-xs font-semibold text-muted-foreground">AI Sourcing Agent is typing...</span>
                </div>
              )}
            </div>

            {/* Prompt Chips */}
            {messages.length === 1 && !isLoading && (
              <div className="bg-surface/30 px-4 pb-3 pt-0 flex flex-col gap-2">
                <span className="text-[10px] uppercase font-bold tracking-wider text-muted-foreground">Suggested Topics</span>
                <div className="flex flex-wrap gap-2">
                  {QUICK_PROMPTS.map((prompt, idx) => (
                    <button
                      key={idx}
                      type="button"
                      onClick={() => handleSend(prompt)}
                      className="flex items-center gap-1.5 rounded-full border border-[#DCFCE7] bg-[#F0FDF4] hover:bg-[#DCFCE7] px-3 py-1.5 text-left text-xs font-semibold text-brand hover:border-brand/35 transition-all duration-200 cursor-pointer shadow-sm"
                    >
                      <Sparkles className="h-3 w-3 shrink-0 text-brand" />
                      <span>{prompt}</span>
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Input Area */}
            <div className="border-t border-border bg-card p-3.5">
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  handleSend(input);
                }}
                className="flex items-center gap-2 rounded-full border border-border bg-surface/50 p-1 pl-4.5 shadow-inner focus-within:border-brand/60 focus-within:ring-1 focus-within:ring-brand/10 transition-all"
              >
                <input
                  type="text"
                  placeholder="Ask VyaparSetu AI..."
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  disabled={isLoading}
                  className="flex-1 bg-transparent py-1.5 text-sm text-foreground placeholder-muted-foreground outline-none border-0 ring-0 focus:ring-0 focus:outline-none disabled:opacity-50"
                />
                <button
                  type="submit"
                  disabled={!input.trim() || isLoading}
                  className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-brand text-white shadow-brand hover:opacity-90 disabled:opacity-40 transition-all duration-200 cursor-pointer"
                >
                  <SendHorizontal className="h-4 w-4" />
                </button>
              </form>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Floating Action Button (FAB) */}
      <div className="relative group">
        {/* Pulsing ring animation */}
        {!isOpen && (
          <span className="absolute -inset-1 rounded-full bg-brand/30 animate-ping opacity-60 pointer-events-none" />
        )}
        <motion.button
          type="button"
          whileHover={{ scale: 1.06 }}
          whileTap={{ scale: 0.94 }}
          onClick={() => setIsOpen(!isOpen)}
          className="flex h-14 w-14 items-center justify-center rounded-full bg-gradient-to-tr from-[#0F5F4A] via-[#108548] to-[#14B8A6] text-white shadow-brand transition-all duration-250 cursor-pointer"
          aria-label="Toggle AI assistant"
        >
          {isOpen ? (
            <X className="h-6 w-6 transition-transform duration-200 rotate-0 hover:rotate-90" />
          ) : (
            <MessageSquareDot className="h-6.5 w-6.5 animate-pulse" />
          )}
        </motion.button>
      </div>
    </div>
  );
}

