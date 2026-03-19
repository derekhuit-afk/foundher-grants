"use client";
import { useState } from "react";

const AGENTS = [
  {
    id: "inbound",
    emoji: "🤖",
    name: "AI Inbound Agent",
    role: "Qualifies every lead instantly",
    desc: "Responds to every inbound inquiry in seconds. Asks the right questions, scores intent, and routes qualified buyers to your team — 24/7.",
    stats: [["< 30 sec", "Response time"], ["3x", "More qualified leads"], ["24/7", "Coverage"]],
    capabilities: ["Instant lead response", "Intent scoring", "Qualification questions", "CRM auto-update", "Demo booking", "Objection handling"],
  },
  {
    id: "outbound",
    emoji: "📡",
    name: "AI SDR Agent",
    role: "Builds your outbound pipeline",
    desc: "Identifies high-intent prospects, researches buying signals, and runs personalized multi-channel outreach at scale — so your team focuses on closing.",
    stats: [["10x", "Outreach scale"], ["87%", "Personalization accuracy"], ["2-3x", "Pipeline growth"]],
    capabilities: ["Prospect identification", "Buying signal detection", "Personalized email sequences", "LinkedIn outreach", "Follow-up automation", "Pipeline reporting"],
  },
  {
    id: "revops",
    emoji: "📊",
    name: "AI RevOps Agent",
    role: "Revenue intelligence, 24/7",
    desc: "Connects to your data, tracks the metrics that matter, and surfaces insights and alerts the moment something shifts — so you always know what to act on.",
    stats: [["Real-time", "Insights"], ["100%", "Data coverage"], ["21 hrs/wk", "Time saved"]],
    capabilities: ["KPI monitoring", "Anomaly detection", "Revenue forecasting", "Competitive tracking", "Board-ready reports", "Slack/email alerts"],
  },
];

const USE_CASES = [
  { emoji: "🎯", title: "Outbound Pipeline", desc: "Build predictable outbound pipeline with AI-driven prospecting and personalized multi-channel outreach." },
  { emoji: "⚡", title: "Inbound Qualification", desc: "Respond instantly to every inbound lead. Score intent and route only qualified buyers to your team." },
  { emoji: "📅", title: "Demo Booking", desc: "Reduce no-shows with automated confirmations, reminders, and smart rescheduling." },
  { emoji: "🔄", title: "Account Expansion", desc: "Identify cross-sell and upsell opportunities and engage customers when they are ready to act." },
  { emoji: "📧", title: "Closed Lost Revival", desc: "Re-engage past opportunities with signal-based personalization — turning lost deals back into pipeline." },
  { emoji: "📈", title: "Revenue Intelligence", desc: "Get instant business insights and alerts on key changes — keeping you ahead of every shift." },
];

export default function AgentPage() {
  const [active, setActive] = useState("inbound");
  const agent = AGENTS.find(a => a.id === active) || AGENTS[0];

  return (
    <div style={{background:"#100208",color:"#F0F4FF",fontFamily:"system-ui,sans-serif",minHeight:"100vh"}}>

      {/* Hero */}
      <section style={{maxWidth:900,margin:"0 auto",padding:"100px 24px 72px",textAlign:"center"}}>
        <div style={{display:"inline-flex",alignItems:"center",gap:8,background:"#EC489918",border:"1px solid #EC489935",borderRadius:40,padding:"6px 20px",fontSize:12,fontWeight:700,color:"#EC4899",letterSpacing:"0.12em",textTransform:"uppercase",marginBottom:28}}>
          <span style={{width:6,height:6,borderRadius:"50%",background:"#EC4899",animation:"pulse 2s infinite"}} />
          AI Revenue Workforce — FoundHer Grants
        </div>
        <h1 style={{fontSize:"clamp(36px,6vw,72px)",fontWeight:900,letterSpacing:"-0.03em",lineHeight:1.05,marginBottom:24}}>
          Your AI Revenue Team,<br />Working 24/7
        </h1>
        <p style={{fontSize:"clamp(16px,2vw,20px)",color:"#8FA3C0",lineHeight:1.7,maxWidth:600,margin:"0 auto 40px"}}>
          Three specialized AI agents that build pipeline, qualify leads, and deliver revenue intelligence — while your team focuses on closing.
        </p>
        <div style={{display:"flex",gap:14,justifyContent:"center",flexWrap:"wrap"}}>
          <a href="/pricing" style={{background:"#EC4899",color:"#100208",border:"none",borderRadius:8,padding:"16px 36px",fontSize:16,fontWeight:800,textDecoration:"none",display:"inline-block"}}>Start Free Trial →</a>
          <button onClick={()=>{const w=document.querySelector("[data-agent-toggle]") as HTMLButtonElement;if(w)w.click();}} style={{background:"transparent",color:"#F0F4FF",border:"1px solid rgba(255,255,255,0.15)",borderRadius:8,padding:"16px 36px",fontSize:16,fontWeight:600,cursor:"pointer"}}>Talk to the Agent</button>
        </div>
      </section>

      {/* Stats */}
      <section style={{borderTop:"1px solid rgba(255,255,255,0.08)",borderBottom:"1px solid rgba(255,255,255,0.08)",padding:"40px 24px",background:"#0A162820"}}>
        <div style={{maxWidth:900,margin:"0 auto",display:"grid",gridTemplateColumns:"repeat(auto-fit,minmax(180px,1fr))",gap:40,textAlign:"center"}}>
          {[["3x","More qualified meetings"],["21 hrs","Saved per week on manual work"],["72%","Decrease in response times"],["24/7","Always-on coverage"]].map(([val,label]) => (
            <div key={val}>
              <div style={{fontSize:44,fontWeight:900,color:"#EC4899",lineHeight:1}}> {val}</div>
              <div style={{fontSize:13,color:"#8FA3C0",marginTop:8,lineHeight:1.4}}> {label}</div>
            </div>
          ))}
        </div>
      </section>

      {/* Agent Selector */}
      <section style={{maxWidth:1100,margin:"0 auto",padding:"88px 24px"}}>
        <div style={{textAlign:"center",marginBottom:56}}>
          <h2 style={{fontSize:"clamp(26px,4vw,48px)",fontWeight:900,letterSpacing:"-0.02em",marginBottom:16}}>Three agents. One revenue machine.</h2>
          <p style={{fontSize:17,color:"#8FA3C0"}}>Each agent specializes in a different part of your revenue motion.</p>
        </div>

        {/* Tab selector */}
        <div style={{display:"flex",gap:12,justifyContent:"center",marginBottom:40,flexWrap:"wrap"}}>
          {AGENTS.map(a => (
            <button key={a.id} onClick={()=>setActive(a.id)} style={{
              background:active===a.id?"#EC4899":"transparent",
              color:active===a.id?"#100208":"#8FA3C0",
              border:active===a.id?"none":"1px solid rgba(255,255,255,0.12)",
              borderRadius:8,padding:"10px 24px",fontSize:14,fontWeight:700,cursor:"pointer",transition:"all 0.2s",
            }}>{a.emoji} {a.name}</button>
          ))}
        </div>

        {/* Agent detail */}
        <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:40,alignItems:"start"}}>
          <div>
            <div style={{fontSize:48,marginBottom:16}}> {agent.emoji}</div>
            <h3 style={{fontSize:32,fontWeight:900,color:"#F0F4FF",marginBottom:8}}> {agent.name}</h3>
            <div style={{fontSize:16,color:"#EC4899",fontWeight:700,marginBottom:20}}> {agent.role}</div>
            <p style={{fontSize:16,color:"#8FA3C0",lineHeight:1.8,marginBottom:32}}> {agent.desc}</p>
            <div style={{display:"grid",gridTemplateColumns:"1fr 1fr 1fr",gap:20,marginBottom:32}}>
              {agent.stats.map(([val, label]) => (
                <div key={val} style={{textAlign:"center",background:"#EC489910",border:"1px solid #EC489920",borderRadius:12,padding:20}}>
                  <div style={{fontSize:28,fontWeight:900,color:"#EC4899",lineHeight:1}}> {val}</div>
                  <div style={{fontSize:12,color:"#8FA3C0",marginTop:6,lineHeight:1.4}}> {label}</div>
                </div>
              ))}
            </div>
            <a href="/pricing" style={{background:"#EC4899",color:"#100208",padding:"14px 32px",borderRadius:8,fontWeight:700,textDecoration:"none",display:"inline-block"}}>Get Started →</a>
          </div>
          <div style={{background:"#0A1628",border:"1px solid rgba(255,255,255,0.08)",borderRadius:16,padding:32}}>
            <div style={{fontSize:14,fontWeight:700,color:"#EC4899",letterSpacing:"0.1em",textTransform:"uppercase",marginBottom:24}}>Capabilities</div>
            {agent.capabilities.map(cap => (
              <div key={cap} style={{display:"flex",gap:12,alignItems:"center",marginBottom:16,fontSize:15,color:"#F0F4FF"}}>
                <span style={{color:"#EC4899",fontSize:18}}>✓</span> {cap}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Use Cases */}
      <section style={{background:"#0A162820",borderTop:"1px solid rgba(255,255,255,0.08)",borderBottom:"1px solid rgba(255,255,255,0.08)",padding:"80px 24px"}}>
        <div style={{maxWidth:1100,margin:"0 auto"}}>
          <div style={{textAlign:"center",marginBottom:56}}>
            <h2 style={{fontSize:"clamp(24px,3.5vw,44px)",fontWeight:900}}>Built for your entire GTM</h2>
          </div>
          <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fit,minmax(280px,1fr))",gap:24}}>
            {USE_CASES.map(uc => (
              <div key={uc.title} style={{background:"#100208",border:"1px solid rgba(255,255,255,0.08)",borderRadius:12,padding:28}}>
                <div style={{fontSize:36,marginBottom:12}}> {uc.emoji}</div>
                <div style={{fontSize:18,fontWeight:700,color:"#F0F4FF",marginBottom:10}}> {uc.title}</div>
                <div style={{fontSize:14,color:"#8FA3C0",lineHeight:1.7}}> {uc.desc}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section style={{maxWidth:700,margin:"0 auto",padding:"88px 24px",textAlign:"center"}}>
        <h2 style={{fontSize:"clamp(28px,4vw,52px)",fontWeight:900,marginBottom:20}}>Start growing with AI Revenue Agents</h2>
        <p style={{fontSize:17,color:"#8FA3C0",marginBottom:40,lineHeight:1.6}}>Three AI agents working around the clock to build pipeline, qualify leads, and keep you ahead of every shift. Pricing starts at $49–$299/mo.</p>
        <div style={{display:"flex",gap:14,justifyContent:"center",flexWrap:"wrap"}}>
          <a href="/pricing" style={{background:"#EC4899",color:"#100208",padding:"18px 48px",borderRadius:8,fontWeight:800,textDecoration:"none",display:"inline-block",fontSize:17}}>Start Free Trial →</a>
          <button onClick={()=>{const w=document.querySelector("[data-agent-toggle]") as HTMLButtonElement;if(w)w.click();}} style={{background:"transparent",color:"#F0F4FF",border:"1px solid rgba(255,255,255,0.15)",borderRadius:8,padding:"18px 36px",fontSize:16,fontWeight:600,cursor:"pointer"}}>Talk to the Agent</button>
        </div>
      </section>

      <style>{`
        @keyframes pulse { 0%,100%{opacity:0.4;transform:scale(0.9)} 50%{opacity:1;transform:scale(1.1)} }
      `}</style>
    </div>
  );
}
