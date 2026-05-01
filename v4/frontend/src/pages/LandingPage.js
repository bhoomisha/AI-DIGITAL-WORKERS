import React, { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';

const FEATURES = [
  { icon:'🎥', title:'AI Video Bio',        desc:'Record 60s intro. AI transcribes speech and extracts skill tags automatically.', path:'/worker/video-bio',   tag:'Workers' },
  { icon:'🎤', title:'Voice Resume (Hindi)', desc:'बोलिए — AI आपका professional profile बनाएगा. Hindi, English, Hinglish.', path:'/worker/voice-resume', tag:'Workers' },
  { icon:'📄', title:'Smart Contracts',      desc:'One-click bilingual Hindi + English work agreement. PDF download + WhatsApp.', path:'/client/contract',   tag:'Clients' },
  { icon:'🎯', title:'Interview Scoring',    desc:'Answer 3 questions on camera. AI scores confidence and clarity 0–100.', path:'/worker/interview',   tag:'Workers' },
  { icon:'🛡️', title:'Fraud Detection',      desc:'AI checks every profile for duplicate faces, mass-apply bots, fake signals.', path:'/worker/trust-score',tag:'Auto' },
  { icon:'🤖', title:'AI Chatbot',           desc:'Hindi + English assistant. Ask about jobs, wages, contracts — anytime.', path:null,                  tag:'All' },
];
const HOW = [
  { n:1, icon:'👤', title:'Create Profile',  desc:'OTP login, face photo, skills, video bio. AI builds your trust score.' },
  { n:2, icon:'🤖', title:'AI Matches You',  desc:'AI scores every job vs your skills, experience, rating and distance.' },
  { n:3, icon:'💳', title:'Work & Get Paid', desc:'Face attendance verification. Submit work. AI approves. Payment unlocks.' },
];
const WORKERS = [
  { name:'Raju Mistri',   skill:'Painter',     city:'Noida',     wage:800,  score:88, bg:'FF6B1A' },
  { name:'Suresh Kumar',  skill:'Electrician', city:'Delhi',     wage:1100, score:92, bg:'0A1628' },
  { name:'Manoj Sharma',  skill:'Plumber',     city:'Gurgaon',   wage:900,  score:76, bg:'F5A623' },
  { name:'Dinesh Yadav',  skill:'Carpenter',   city:'Faridabad', wage:950,  score:81, bg:'0D9488' },
  { name:'Ramesh Bhai',   skill:'Mason',       city:'Noida',     wage:750,  score:69, bg:'7c3aed' },
  { name:'Priya Devi',    skill:'Cleaner',     city:'Ghaziabad', wage:600,  score:85, bg:'be185d' },
];
const TESTIMONIALS = [
  { name:'Vikram Agarwal', role:'Property Developer, Delhi', text:"Found 3 reliable painters in one day. AI trust score helped me pick right. Contract generation saved 2 hours of paperwork.", stars:5 },
  { name:'Meera Krishnan', role:'Restaurant Owner, Bangalore', text:"Voice Resume is incredible — workers who can't type now have professional profiles. Game changer for blue-collar hiring.", stars:5 },
  { name:'Amit Dubey',     role:'Electrician, 8 years',      text:"Pehle kaam dhundhna bahut mushkil tha. Ab AI match score se direct relevant jobs milte hain. Clients trust karte hain.", stars:5 },
];

export default function LandingPage() {
  const nav = useNavigate();
  return (
    <div style={{ background:'#0A1628', minHeight:'100vh', overflowX:'hidden', fontFamily:"'DM Sans',system-ui,sans-serif" }}>

      {/* Nav */}
      <nav style={{ position:'fixed',top:0,left:0,right:0,zIndex:100,background:'rgba(10,22,40,.92)',backdropFilter:'blur(14px)',borderBottom:'1px solid rgba(255,255,255,.07)',height:60,display:'flex',alignItems:'center' }}>
        <div style={{ maxWidth:1120,margin:'0 auto',padding:'0 24px',width:'100%',display:'flex',justifyContent:'space-between',alignItems:'center' }}>
          <div style={{ display:'flex',alignItems:'center',gap:9 }}>
            <div style={{ width:32,height:32,borderRadius:8,background:'#FF6B1A',display:'flex',alignItems:'center',justifyContent:'center',fontSize:16 }}>⚒️</div>
            <span style={{ fontWeight:800,color:'#f1f5f9',fontSize:16,letterSpacing:'-0.02em' }}>AI Digital Workers</span>
          </div>
          <div style={{ display:'flex',gap:8 }}>
            <button onClick={() => nav('/demo')} style={{ padding:'7px 14px',borderRadius:8,background:'rgba(255,107,26,.1)',color:'#FF6B1A',border:'1px solid rgba(255,107,26,.3)',fontSize:12,fontWeight:600,cursor:'pointer' }}>🎬 Demo</button>
            <button onClick={() => nav('/login')} style={{ padding:'7px 14px',borderRadius:8,background:'rgba(255,255,255,.06)',color:'#e2e8f0',border:'1px solid rgba(255,255,255,.1)',fontSize:12,fontWeight:600,cursor:'pointer' }}>Login</button>
            <button onClick={() => nav('/login')} style={{ padding:'7px 16px',borderRadius:8,background:'#FF6B1A',color:'#fff',border:'none',fontSize:12,fontWeight:700,cursor:'pointer' }}>Get Started →</button>
          </div>
        </div>
      </nav>

      {/* Hero */}
      <section style={{ minHeight:'100vh',display:'flex',flexDirection:'column',alignItems:'center',justifyContent:'center',padding:'110px 24px 60px',textAlign:'center',position:'relative',overflow:'hidden' }}>
        <div style={{ position:'absolute',inset:0,background:'radial-gradient(ellipse 90% 65% at 50% -5%, rgba(255,107,26,.2),transparent 65%)',pointerEvents:'none' }} />

        <div style={{ display:'inline-flex',alignItems:'center',gap:6,padding:'5px 16px',borderRadius:99,background:'rgba(255,107,26,.1)',border:'1px solid rgba(255,107,26,.25)',color:'#FF6B1A',fontSize:12,fontWeight:600,marginBottom:26,letterSpacing:.03 }}>
          <span style={{ width:6,height:6,borderRadius:'50%',background:'#FF6B1A',display:'inline-block' }} />
          India's AI-Powered Labour Marketplace
        </div>

        <h1 style={{ fontFamily:"'Playfair Display',Georgia,serif",fontSize:'clamp(36px,5.5vw,70px)',fontWeight:800,color:'#fff',letterSpacing:'-0.04em',lineHeight:1.08,marginBottom:18,maxWidth:760 }}>
          Connecting Hands<br /><span style={{ color:'#FF6B1A' }}>That Build India</span>
        </h1>
        <p style={{ color:'#94a3b8',fontSize:'clamp(14px,2vw,18px)',maxWidth:540,lineHeight:1.75,marginBottom:44 }}>
          AI-powered matching, face verification, bilingual contracts, and instant payments — bridging skilled workers with clients who need them.
        </p>

        <div style={{ display:'flex',gap:14,flexWrap:'wrap',justifyContent:'center',marginBottom:60 }}>
          <button onClick={() => nav('/login?role=client')} style={{ padding:'14px 32px',borderRadius:12,background:'#FF6B1A',color:'#fff',border:'none',fontSize:15,fontWeight:700,cursor:'pointer',boxShadow:'0 0 32px rgba(255,107,26,.3)' }}>
            🏢 I'm a Client — Hire Workers
          </button>
          <button onClick={() => nav('/login?role=worker')} style={{ padding:'14px 32px',borderRadius:12,background:'rgba(255,255,255,.07)',color:'#f1f5f9',border:'1.5px solid rgba(255,255,255,.16)',fontSize:15,fontWeight:700,cursor:'pointer' }}>
            👷 I'm a Worker — Find Jobs
          </button>
        </div>

        {/* SVG Hero Illustration */}
        <div style={{ maxWidth:600,width:'100%',position:'relative' }}>
          <svg viewBox="0 0 600 210" xmlns="http://www.w3.org/2000/svg" style={{ width:'100%' }}>
            <defs>
              <linearGradient id="lgrad" x1="0%" y1="0%" x2="100%" y2="0%">
                <stop offset="0%" stopColor="#FF6B1A" stopOpacity=".8"/>
                <stop offset="50%" stopColor="#F5A623"/>
                <stop offset="100%" stopColor="#FF6B1A" stopOpacity=".8"/>
              </linearGradient>
            </defs>
            {/* Client */}
            <circle cx="110" cy="105" r="50" fill="rgba(30,58,95,.8)" stroke="rgba(255,107,26,.4)" strokeWidth="1.5"/>
            <text x="110" y="91" textAnchor="middle" fontSize="26">🏢</text>
            <text x="110" y="116" textAnchor="middle" fontSize="11" fill="#94a3b8" fontFamily="DM Sans,sans-serif">Client</text>
            <text x="110" y="130" textAnchor="middle" fontSize="9" fill="#64748b" fontFamily="DM Sans,sans-serif">Posts Jobs</text>
            {/* Worker */}
            <circle cx="490" cy="105" r="50" fill="rgba(30,58,95,.8)" stroke="rgba(245,166,35,.4)" strokeWidth="1.5"/>
            <text x="490" y="91" textAnchor="middle" fontSize="26">👷</text>
            <text x="490" y="116" textAnchor="middle" fontSize="11" fill="#94a3b8" fontFamily="DM Sans,sans-serif">Worker</text>
            <text x="490" y="130" textAnchor="middle" fontSize="9" fill="#64748b" fontFamily="DM Sans,sans-serif">Finds Work</text>
            {/* Line */}
            <line x1="162" y1="105" x2="438" y2="105" stroke="url(#lgrad)" strokeWidth="2" strokeDasharray="5 4" opacity=".5"/>
            {/* AI center */}
            <circle cx="300" cy="105" r="34" fill="#0A1628" stroke="#FF6B1A" strokeWidth="2"/>
            <text x="300" y="100" textAnchor="middle" fontSize="16">🤖</text>
            <text x="300" y="117" textAnchor="middle" fontSize="8" fill="#FF6B1A" fontFamily="DM Sans,sans-serif" fontWeight="700">AI ENGINE</text>
            {/* Orbiting dots */}
            <circle cx="300" cy="71" r="4" fill="#F5A623"><animateTransform attributeName="transform" type="rotate" from="0 300 105" to="360 300 105" dur="4s" repeatCount="indefinite"/></circle>
            <circle cx="334" cy="105" r="3" fill="#FF6B1A"><animateTransform attributeName="transform" type="rotate" from="90 300 105" to="450 300 105" dur="3s" repeatCount="indefinite"/></circle>
            <circle cx="300" cy="139" r="3" fill="#0D9488"><animateTransform attributeName="transform" type="rotate" from="180 300 105" to="540 300 105" dur="5s" repeatCount="indefinite"/></circle>
            {/* Labels */}
            <rect x="178" y="66" width="80" height="19" rx="9.5" fill="rgba(22,163,74,.2)" stroke="rgba(22,163,74,.4)" strokeWidth="1"/>
            <text x="218" y="79" textAnchor="middle" fontSize="8" fill="#86efac" fontFamily="DM Sans,sans-serif" fontWeight="600">AI Match: 92%</text>
            <rect x="340" y="66" width="80" height="19" rx="9.5" fill="rgba(255,107,26,.2)" stroke="rgba(255,107,26,.4)" strokeWidth="1"/>
            <text x="380" y="79" textAnchor="middle" fontSize="8" fill="#fdba74" fontFamily="DM Sans,sans-serif" fontWeight="600">🛡 Verified ✓</text>
            <rect x="178" y="134" width="80" height="19" rx="9.5" fill="rgba(99,102,241,.2)" stroke="rgba(99,102,241,.4)" strokeWidth="1"/>
            <text x="218" y="147" textAnchor="middle" fontSize="8" fill="#a5b4fc" fontFamily="DM Sans,sans-serif" fontWeight="600">📄 Contract</text>
            <rect x="340" y="134" width="80" height="19" rx="9.5" fill="rgba(13,148,136,.2)" stroke="rgba(13,148,136,.4)" strokeWidth="1"/>
            <text x="380" y="147" textAnchor="middle" fontSize="8" fill="#5eead4" fontFamily="DM Sans,sans-serif" fontWeight="600">💳 ₹ Paid</text>
          </svg>
        </div>
      </section>

      {/* How it works */}
      <section style={{ background:'#080f1e',padding:'72px 24px',borderTop:'1px solid rgba(255,255,255,.04)' }}>
        <div style={{ maxWidth:1120,margin:'0 auto' }}>
          <div style={{ textAlign:'center',marginBottom:48 }}>
            <div style={{ fontSize:11,color:'#FF6B1A',fontWeight:700,letterSpacing:.08,textTransform:'uppercase',marginBottom:10 }}>How It Works</div>
            <h2 style={{ fontFamily:"'Playfair Display',serif",fontSize:'clamp(26px,3.5vw,40px)',fontWeight:800,color:'#f1f5f9',letterSpacing:'-0.03em' }}>Signup to payment in 3 steps</h2>
          </div>
          <div style={{ display:'grid',gridTemplateColumns:'repeat(auto-fit,minmax(260px,1fr))',gap:20 }}>
            {HOW.map((h,i) => (
              <div key={h.n} style={{ background:'rgba(255,255,255,.03)',border:'1px solid rgba(255,255,255,.07)',borderRadius:14,padding:24 }}>
                <div style={{ width:46,height:46,borderRadius:11,background:'rgba(255,107,26,.1)',border:'1px solid rgba(255,107,26,.2)',display:'flex',alignItems:'center',justifyContent:'center',fontSize:20,marginBottom:14 }}>{h.icon}</div>
                <div style={{ display:'flex',alignItems:'center',gap:8,marginBottom:8 }}>
                  <span style={{ width:22,height:22,borderRadius:'50%',background:'#FF6B1A',color:'#fff',display:'flex',alignItems:'center',justifyContent:'center',fontWeight:800,fontSize:11 }}>{h.n}</span>
                  <span style={{ fontWeight:700,color:'#e2e8f0',fontSize:14 }}>{h.title}</span>
                </div>
                <p style={{ color:'#64748b',fontSize:13,lineHeight:1.65 }}>{h.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* AI Features */}
      <section style={{ padding:'72px 24px',background:'#0A1628' }}>
        <div style={{ maxWidth:1120,margin:'0 auto' }}>
          <div style={{ textAlign:'center',marginBottom:48 }}>
            <div style={{ fontSize:11,color:'#FF6B1A',fontWeight:700,letterSpacing:.08,textTransform:'uppercase',marginBottom:10 }}>AI Features</div>
            <h2 style={{ fontFamily:"'Playfair Display',serif",fontSize:'clamp(26px,3.5vw,40px)',fontWeight:800,color:'#f1f5f9',letterSpacing:'-0.03em' }}>Deep AI integration throughout</h2>
          </div>
          <div style={{ display:'grid',gridTemplateColumns:'repeat(auto-fit,minmax(290px,1fr))',gap:16 }}>
            {FEATURES.map(f => (
              <div key={f.title} onClick={() => f.path && nav(f.path)} style={{ background:'rgba(255,255,255,.03)',border:'1px solid rgba(255,255,255,.07)',borderLeft:'3px solid #FF6B1A',borderRadius:12,padding:20,cursor:f.path?'pointer':'default',transition:'all .2s' }}
                onMouseEnter={e=>f.path&&(e.currentTarget.style.background='rgba(255,107,26,.06)')}
                onMouseLeave={e=>f.path&&(e.currentTarget.style.background='rgba(255,255,255,.03)')}>
                <div style={{ display:'flex',justifyContent:'space-between',alignItems:'flex-start',marginBottom:10 }}>
                  <span style={{ fontSize:24 }}>{f.icon}</span>
                  <span style={{ padding:'2px 8px',borderRadius:99,background:'rgba(255,107,26,.12)',color:'#FF6B1A',fontSize:9,fontWeight:700 }}>{f.tag}</span>
                </div>
                <div style={{ fontWeight:700,color:'#e2e8f0',fontSize:14,marginBottom:5 }}>{f.title}</div>
                <p style={{ color:'#64748b',fontSize:12,lineHeight:1.6 }}>{f.desc}</p>
                {f.path && <div style={{ marginTop:8,fontSize:11,color:'#FF6B1A',fontWeight:600 }}>Try it →</div>}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Worker profiles horizontal scroll */}
      <section style={{ padding:'72px 0',background:'#080f1e',borderTop:'1px solid rgba(255,255,255,.04)' }}>
        <div style={{ maxWidth:1120,margin:'0 auto',paddingLeft:24,marginBottom:28 }}>
          <div style={{ fontSize:11,color:'#FF6B1A',fontWeight:700,letterSpacing:.08,textTransform:'uppercase',marginBottom:8 }}>Featured Workers</div>
          <h2 style={{ fontFamily:"'Playfair Display',serif",fontSize:'clamp(22px,3vw,34px)',fontWeight:800,color:'#f1f5f9' }}>Verified skilled workers</h2>
        </div>
        <div style={{ display:'flex',gap:14,overflowX:'auto',paddingLeft:24,paddingRight:24,paddingBottom:8 }}>
          {WORKERS.map(w => (
            <div key={w.name} style={{ flexShrink:0,width:190,background:'rgba(255,255,255,.04)',border:'1px solid rgba(255,255,255,.08)',borderRadius:12,padding:18,textAlign:'center',transition:'all .2s',cursor:'pointer' }}
              onMouseEnter={e=>{e.currentTarget.style.borderColor='rgba(255,107,26,.4)';e.currentTarget.style.transform='translateY(-4px)'}}
              onMouseLeave={e=>{e.currentTarget.style.borderColor='rgba(255,255,255,.08)';e.currentTarget.style.transform='translateY(0)'}}>
              <img src={`https://ui-avatars.com/api/?name=${encodeURIComponent(w.name)}&background=${w.bg}&color=fff&size=80`} alt={w.name} style={{ width:60,height:60,borderRadius:'50%',marginBottom:10,border:'2px solid rgba(255,107,26,.35)' }} />
              <div style={{ fontWeight:700,color:'#e2e8f0',fontSize:13 }}>{w.name}</div>
              <div style={{ color:'#FF6B1A',fontSize:11,fontWeight:600,margin:'2px 0' }}>{w.skill}</div>
              <div style={{ color:'#64748b',fontSize:11 }}>📍 {w.city}</div>
              <div style={{ color:'#F5A623',fontSize:12,fontWeight:700,margin:'6px 0' }}>₹{w.wage}/day</div>
              <span style={{ padding:'2px 8px',borderRadius:99,fontSize:9,fontWeight:700,background:w.score>85?'rgba(22,163,74,.2)':w.score>70?'rgba(245,166,35,.2)':'rgba(220,38,38,.2)',color:w.score>85?'#86efac':w.score>70?'#fde68a':'#fca5a5' }}>
                {w.score>85?'🟢 Verified':w.score>70?'🟡 Unverified':'🟡 New'}
              </span>
              <button onClick={() => nav('/login')} style={{ marginTop:10,width:'100%',padding:'6px',borderRadius:7,background:'#FF6B1A',color:'#fff',border:'none',fontSize:11,fontWeight:700,cursor:'pointer' }}>Hire Now</button>
            </div>
          ))}
        </div>
      </section>

      {/* Testimonials */}
      <section style={{ padding:'72px 24px',background:'#0A1628' }}>
        <div style={{ maxWidth:1120,margin:'0 auto' }}>
          <div style={{ textAlign:'center',marginBottom:44 }}>
            <h2 style={{ fontFamily:"'Playfair Display',serif",fontSize:'clamp(22px,3vw,34px)',fontWeight:800,color:'#f1f5f9' }}>Trusted across India</h2>
          </div>
          <div style={{ display:'grid',gridTemplateColumns:'repeat(auto-fit,minmax(260px,1fr))',gap:18 }}>
            {TESTIMONIALS.map(t => (
              <div key={t.name} style={{ background:'rgba(255,255,255,.03)',border:'1px solid rgba(255,255,255,.07)',borderRadius:12,padding:22 }}>
                <div style={{ color:'#F5A623',fontSize:14,marginBottom:10 }}>{'⭐'.repeat(t.stars)}</div>
                <p style={{ color:'#94a3b8',fontSize:13,lineHeight:1.7,fontStyle:'italic',marginBottom:14 }}>"{t.text}"</p>
                <div style={{ fontWeight:700,color:'#e2e8f0',fontSize:13 }}>{t.name}</div>
                <div style={{ color:'#64748b',fontSize:11 }}>{t.role}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section style={{ padding:'72px 24px',textAlign:'center',background:'linear-gradient(135deg,#0A1628,#1a2f50)',borderTop:'1px solid rgba(255,107,26,.12)' }}>
        <h2 style={{ fontFamily:"'Playfair Display',serif",fontSize:'clamp(26px,4vw,46px)',fontWeight:800,color:'#fff',marginBottom:14,letterSpacing:'-0.03em' }}>
          Ready to get started?
        </h2>
        <p style={{ color:'#94a3b8',fontSize:15,marginBottom:36,maxWidth:440,margin:'0 auto 36px' }}>Join thousands of workers and clients using AI Digital Workers across India.</p>
        <div style={{ display:'flex',gap:12,flexWrap:'wrap',justifyContent:'center' }}>
          <button onClick={() => nav('/login')} style={{ padding:'13px 32px',borderRadius:12,background:'#FF6B1A',color:'#fff',border:'none',fontSize:15,fontWeight:700,cursor:'pointer',boxShadow:'0 0 28px rgba(255,107,26,.25)' }}>Create Free Account →</button>
          <button onClick={() => nav('/demo')} style={{ padding:'13px 32px',borderRadius:12,background:'transparent',color:'#94a3b8',border:'1px solid rgba(255,255,255,.12)',fontSize:15,fontWeight:700,cursor:'pointer' }}>🎬 View Live Demo</button>
        </div>
      </section>

      {/* Footer */}
      <footer style={{ background:'#050c17',padding:'24px',textAlign:'center',borderTop:'1px solid rgba(255,255,255,.04)' }}>
        <div style={{ display:'flex',alignItems:'center',justifyContent:'center',gap:8,marginBottom:8 }}>
          <span style={{ width:24,height:24,borderRadius:6,background:'#FF6B1A',display:'inline-flex',alignItems:'center',justifyContent:'center',fontSize:12 }}>⚒️</span>
          <span style={{ fontWeight:700,color:'#475569',fontSize:13 }}>AI Digital Workers</span>
        </div>
        <p style={{ color:'#1e293b',fontSize:12 }}>Made with ❤️ in India · React + Node.js + Claude AI + face-api.js</p>
      </footer>
    </div>
  );
}
