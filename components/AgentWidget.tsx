"use client";
import { useState, useRef, useEffect } from "react";

interface Message {
  role: "user" | "assistant";
  content: string;
  id: string;
}

const WELCOME = "Hi! I'm the FoundHer Grants AI Revenue Agent. I can help you find the right plan, answer questions, or walk you through what we do. What brings you here today?";

function CTAButton({ text, href }: { text: string; href: string }) {
  return (
    <a href={href} style={{display:"inline-flex",alignItems:"center",gap:6,background:"#EC4899",color:"#100208",padding:"8px 16px",borderRadius:6,fontSize:13,fontWeight:700,textDecoration:"none",marginTop:8}} onClick={()=>{const btn=document.querySelector("[data-agent-toggle]") as HTMLButtonElement;if(btn)btn.click();}}>
      {text} →
    </a>
  );
}

function MessageBubble({ msg }: { msg: Message }) {
  const isAgent = msg.role === "assistant";
  // Parse [CTA:/path] markers
  const parts = msg.content.split(/(\[CTA:[^\]]+\])/g);

  return (
    <div style={{display:"flex",flexDirection:"column",alignItems:isAgent?"flex-start":"flex-end",marginBottom:12}}>
      <div style={{
        maxWidth:"85%",
        background:isAgent?"#10020822":"#FFFFFF18",
        border:isAgent?`1px solid ${"#EC4899"}25`:"1px solid #FFFFFF20",
        borderRadius:isAgent?"4px 12px 12px 12px":"12px 4px 12px 12px",
        padding:"10px 14px",
        fontSize:14,
        color:"#F0F4FF",
        lineHeight:1.6,
      }}>
        {parts.map((part, i) => {
          const ctaMatch = part.match(/\[CTA:([^\]]+)\]/);
          if (ctaMatch) {
            const href = ctaMatch[1];
            return <CTAButton key={i} text="Get Started →" href={href} />;
          }
          return <span key={i}>{part}</span>;
        })}
      </div>
    </div>
  );
}

export default function AgentWidget() {
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([
    { role: "assistant", content: WELCOME, id: "welcome" }
  ]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [unread, setUnread] = useState(0);
  const bottomRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (open) {
      setUnread(0);
      setTimeout(() => inputRef.current?.focus(), 100);
    }
  }, [open]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const send = async () => {
    const text = input.trim();
    if (!text || loading) return;
    setInput("");

    const userMsg: Message = { role: "user", content: text, id: Date.now().toString() };
    setMessages(prev => [...prev, userMsg]);
    setLoading(true);

    try {
      const res = await fetch("/api/agent/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          messages: [...messages, userMsg].map(m => ({ role: m.role, content: m.content })),
        }),
      });
      const data = await res.json();
      if (data.reply) {
        setMessages(prev => [...prev, { role: "assistant", content: data.reply, id: Date.now().toString() }]);
        if (!open) setUnread(n => n + 1);
      }
    } catch {
      setMessages(prev => [...prev, { role: "assistant", content: "Sorry, I hit a snag. Try again or email support@huit.ai", id: Date.now().toString() }]);
    }
    setLoading(false);
  };

  return (
    <>
      {/* Chat Panel */}
      {open && (
        <div style={{
          position:"fixed", bottom:88, right:24, width:360, maxHeight:"70vh",
          background:"#100208", border:`1px solid ${"#EC4899"}30`,
          borderRadius:16, boxShadow:"0 24px 80px rgba(0,0,0,0.6)",
          display:"flex", flexDirection:"column", zIndex:9998,
          fontFamily:"system-ui,sans-serif",
        }}>
          {/* Header */}
          <div style={{
            display:"flex", alignItems:"center", gap:10, padding:"16px 20px",
            borderBottom:`1px solid ${"#EC4899"}20`,
            background:`${"#EC4899"}12`, borderRadius:"16px 16px 0 0",
          }}>
            <div style={{width:8,height:8,borderRadius:"50%",background:"#EC4899",boxShadow:`0 0 8px ${"#EC4899"}`}} />
            <div>
              <div style={{fontSize:14,fontWeight:700,color:"#F0F4FF"}}>FoundHer Grants AI Agent</div>
              <div style={{fontSize:12,color:"#8FA3C0"}}> Online · Typically replies instantly</div>
            </div>
            <button onClick={()=>setOpen(false)} style={{marginLeft:"auto",background:"none",border:"none",color:"#8FA3C0",fontSize:20,cursor:"pointer",lineHeight:1}}>×</button>
          </div>

          {/* Messages */}
          <div style={{flex:1,overflowY:"auto",padding:"16px 16px 8px",scrollbarWidth:"thin"}}>
            {messages.map(msg => <MessageBubble key={msg.id} msg={msg} />)}
            {loading && (
              <div style={{display:"flex",alignItems:"center",gap:6,padding:"8px 14px",fontSize:13,color:"#8FA3C0"}}>
                <div style={{display:"flex",gap:4}}>
                  {[0,1,2].map(i => (
                    <div key={i} style={{width:6,height:6,borderRadius:"50%",background:"#EC4899",opacity:0.6,animation:`pulse 1.2s ease-in-out ${i*0.2}s infinite`}} />
                  ))}
                </div>
                Thinking...
              </div>
            )}
            <div ref={bottomRef} />
          </div>

          {/* Input */}
          <div style={{padding:"12px 16px 16px",borderTop:`1px solid ${"#EC4899"}20`}}>
            <div style={{display:"flex",gap:8,alignItems:"center"}}>
              <input
                ref={inputRef}
                value={input}
                onChange={e=>setInput(e.target.value)}
                onKeyDown={e=>e.key==="Enter"&&!e.shiftKey&&send()}
                placeholder="Ask anything..."
                style={{
                  flex:1,background:"#FFFFFF10",border:`1px solid ${"#EC4899"}25`,
                  borderRadius:8,padding:"10px 14px",fontSize:14,color:"#F0F4FF",
                  outline:"none",fontFamily:"inherit",
                }}
              />
              <button
                onClick={send}
                disabled={loading||!input.trim()}
                style={{
                  background:"#EC4899",color:"#100208",border:"none",borderRadius:8,
                  width:40,height:40,fontSize:18,cursor:loading||!input.trim()?"not-allowed":"pointer",
                  opacity:loading||!input.trim()?0.5:1,flexShrink:0,
                }}
              >→</button>
            </div>
            <div style={{fontSize:11,color:"#8FA3C0",textAlign:"center",marginTop:8}}>Powered by Huit.AI · <a href="/pricing" style={{color:"#EC4899",textDecoration:"none"}}>View Plans</a></div>
          </div>
        </div>
      )}

      {/* Toggle Button */}
      <button
        data-agent-toggle
        onClick={()=>setOpen(o=>!o)}
        style={{
          position:"fixed", bottom:24, right:24,
          width:56, height:56, borderRadius:"50%",
          background:"#EC4899", border:"none",
          boxShadow:`0 8px 32px ${"#EC4899"}60`,
          cursor:"pointer", zIndex:9999,
          display:"flex", alignItems:"center", justifyContent:"center",
          fontSize:24, transition:"transform 0.2s",
        }}
        title="Chat with FoundHer Grants AI Agent"
      >
        {open ? "×" : "💬"}
        {!open && unread > 0 && (
          <div style={{
            position:"absolute",top:-4,right:-4,
            width:18,height:18,borderRadius:"50%",
            background:"#EF4444",color:"white",
            fontSize:11,fontWeight:700,
            display:"flex",alignItems:"center",justifyContent:"center",
          }}>{unread}</div>
        )}
      </button>

      <style>{`
        @keyframes pulse {
          0%, 100% { opacity: 0.3; transform: scale(0.8); }
          50% { opacity: 1; transform: scale(1); }
        }
      `}</style>
    </>
  );
}
