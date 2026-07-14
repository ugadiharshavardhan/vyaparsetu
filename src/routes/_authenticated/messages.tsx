import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { Send, Image as ImageIcon, Package, Info, Search, Paperclip } from "lucide-react";
import { PageHeader } from "@/components/common/PageHeader";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useSessionMode } from "@/hooks/useSessionMode";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/_authenticated/messages")({
  head: () => ({ meta: [{ title: "Messages — VyaparSetu" }] }),
  component: MessagesPage,
});

const mockConversations = [
  {
    id: "c1",
    name: "ITC Foods Limited",
    avatar: "https://images.unsplash.com/photo-1556228578-8d89ce4a0378?w=100&q=80",
    lastMessage: "Your order VS-1044 is packed.",
    time: "10:42 AM",
    unread: 2,
    productRef: "Aashirvaad Shudh Chakki Atta 10kg",
  },
  {
    id: "c2",
    name: "HUL Wholesale",
    avatar: "https://images.unsplash.com/photo-1606914501449-5a96b6ce24ca?w=100&q=80",
    lastMessage: "Can we get a better quote for 500 units?",
    time: "Yesterday",
    unread: 0,
    orderRef: "RFQ-1020",
  },
  {
    id: "c3",
    name: "Nestlé India",
    avatar: "https://images.unsplash.com/photo-1542838132-92c53300491e?w=100&q=80",
    lastMessage: "Thanks for confirming the delivery.",
    time: "Mon",
    unread: 0,
  }
];

const mockChat = [
  { id: "m1", senderId: "me", text: "Hi, I wanted to inquire about the expiry date for the current batch of Aashirvaad Atta.", time: "10:30 AM" },
  { id: "m2", senderId: "c1", text: "Hello! The current batch expires in Nov 2027.", time: "10:35 AM" },
  { id: "m3", senderId: "me", text: "Great, I'll place an order for 12 bags.", time: "10:38 AM" },
  { id: "m4", senderId: "c1", text: "Your order VS-1044 is packed.", time: "10:42 AM" },
];

function MessagesPage() {
  const mode = useSessionMode();
  const [activeChat, setActiveChat] = useState(mockConversations[0]);
  const [msg, setMsg] = useState("");

  return (
    <div className="container-page flex h-[calc(100vh-80px)] flex-col py-6">
      <PageHeader title="Messages" description="Negotiate with suppliers and track your inquiries." />
      
      <div className="flex flex-1 overflow-hidden rounded-2xl border border-border bg-card shadow-soft mt-4">
        
        {/* Sidebar */}
        <div className="w-80 flex-shrink-0 border-r border-border bg-muted/20 flex flex-col">
          <div className="p-4 border-b border-border">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input placeholder="Search messages..." className="pl-9 bg-background" />
            </div>
          </div>
          <div className="flex-1 overflow-y-auto">
            {mockConversations.map((c) => (
              <button
                key={c.id}
                onClick={() => setActiveChat(c)}
                className={cn(
                  "w-full flex items-start gap-3 p-4 text-left transition-colors hover:bg-secondary",
                  activeChat.id === c.id ? "bg-secondary" : ""
                )}
              >
                <div className="relative shrink-0">
                  <img src={c.avatar} alt="" className="h-10 w-10 rounded-full object-cover border border-border" />
                  {c.unread > 0 && (
                    <span className="absolute -top-1 -right-1 flex h-4 w-4 items-center justify-center rounded-full bg-brand text-[9px] font-bold text-white">
                      {c.unread}
                    </span>
                  )}
                </div>
                <div className="flex-1 overflow-hidden">
                  <div className="flex items-center justify-between">
                    <span className="font-semibold text-sm truncate">{c.name}</span>
                    <span className="text-[10px] text-muted-foreground shrink-0">{c.time}</span>
                  </div>
                  <p className="text-xs text-muted-foreground line-clamp-1 mt-0.5">{c.lastMessage}</p>
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* Chat Window */}
        <div className="flex-1 flex flex-col bg-background">
          <div className="flex items-center justify-between border-b border-border p-4 bg-muted/10">
            <div className="flex items-center gap-3">
              <img src={activeChat.avatar} alt="" className="h-10 w-10 rounded-full object-cover border border-border" />
              <div>
                <h3 className="font-bold text-sm">{activeChat.name}</h3>
                <p className="text-xs text-muted-foreground flex items-center gap-1">
                  <span className="h-1.5 w-1.5 rounded-full bg-success"></span> Online
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Button variant="outline" size="sm"><Info className="h-4 w-4 mr-1.5" /> Details</Button>
            </div>
          </div>

          <div className="flex-1 overflow-y-auto p-4 space-y-4">
            
            {(activeChat.productRef || activeChat.orderRef) && (
              <div className="mx-auto w-fit rounded-lg bg-secondary px-4 py-2 text-xs text-muted-foreground flex items-center gap-2">
                <Package className="h-3.5 w-3.5" />
                Inquiry regarding: <span className="font-semibold text-foreground">{activeChat.productRef || activeChat.orderRef}</span>
              </div>
            )}

            {mockChat.map((m) => {
              const isMe = m.senderId === "me";
              return (
                <div key={m.id} className={cn("flex w-full", isMe ? "justify-end" : "justify-start")}>
                  <div className={cn(
                    "max-w-[70%] rounded-2xl px-4 py-2.5 text-sm",
                    isMe ? "bg-brand text-white rounded-br-none" : "bg-muted text-foreground rounded-bl-none"
                  )}>
                    <p>{m.text}</p>
                    <span className={cn("text-[10px] block mt-1", isMe ? "text-white/70 text-right" : "text-muted-foreground text-left")}>
                      {m.time}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>

          <div className="p-4 border-t border-border bg-muted/10">
            <div className="flex items-center gap-2">
              <Button variant="ghost" size="icon" className="shrink-0 text-muted-foreground"><Paperclip className="h-5 w-5" /></Button>
              <Button variant="ghost" size="icon" className="shrink-0 text-muted-foreground"><ImageIcon className="h-5 w-5" /></Button>
              <Input
                value={msg}
                onChange={(e) => setMsg(e.target.value)}
                placeholder="Type your message..."
                className="flex-1 bg-background"
                onKeyDown={(e) => {
                  if (e.key === "Enter" && msg) {
                    setMsg("");
                  }
                }}
              />
              <Button onClick={() => setMsg("")} disabled={!msg} className="shrink-0 shadow-brand"><Send className="h-4 w-4 mr-2" /> Send</Button>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}
