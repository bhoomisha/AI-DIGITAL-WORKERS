import React, { useState, useRef, useEffect } from 'react';
import { useApp } from '../context/AppContext';

const R = {
  'find job':   { en:'Go to Find Jobs to see AI-ranked jobs near you!', hi:'नौकरी खोजने के लिए Find Jobs पेज पर जाएं!' },
  'apply':      { en:'Tap Apply Now on any job card. Your AI match score is shown.', hi:'किसी भी जॉब पर Apply Now दबाएं।' },
  'payment':    { en:'Payment unlocks only after client approves your work.', hi:'पेमेंट तभी मिलेगा जब क्लाइंट काम approve करे।' },
  'attendance': { en:'Mark attendance daily with AI face verification on the Attendance page.', hi:'हर दिन Attendance पेज पर फेस वेरिफाई करें।' },
  'rating':     { en:'Ratings appear only after completing a job. New workers show No rating yet.', hi:'रेटिंग काम पूरा होने के बाद ही मिलती है।' },
  'match':      { en:'AI Match Score: Skills 35% + Experience 25% + Rating 20% + Distance 10% + Availability 10%.', hi:'AI मैच स्कोर: Skills 35%, Experience 25%, Rating 20%, Distance 10%।' },
  'face':       { en:'Face verification compares your live selfie with your profile photo using AI.', hi:'Face verification आपकी profile से selfie match करता है।' },
  'otp':        { en:'Enter phone number, get OTP on screen and in browser console (F12).', hi:'फोन नंबर डालें, OTP स्क्रीन और console में दिखेगा।' },
  'submit':     { en:'Submit work completion with a photo and description. AI verifies automatically.', hi:'काम की फोटो और description के साथ submit करें। AI verify करेगा।' },
  'hello':      { en:'Hello! I am your AI Assistant. Ask in English or Hindi!', hi:'नमस्ते! मैं आपका AI असिस्टेंट हूं!' },
  'hi':         { en:'Hi! How can I help you today?', hi:'नमस्ते! आज मैं कैसे मदद करूं?' },
  'help':       { en:'I help with: find job, apply, attendance, payment, face verification, ratings, match score.', hi:'मदद: नौकरी, अटेंडेंस, पेमेंट, रेटिंग, face verification।' },
  'status':     { en:'Check application status on My Applications page.', hi:'My Applications पेज पर status देखें।' },
  'काम ढूंढो': { en:'Go to Find Jobs page!', hi:'Find Jobs पेज पर जाएं और AI ranked नौकरियां देखें!' },
  'नौकरी':     { en:'Go to Find Jobs to find work.', hi:'नौकरी के लिए Find Jobs पर जाएं।' },
  'अटेंडेंस':  { en:'Go to Attendance page.', hi:'Attendance पेज पर जाकर फेस वेरिफाई करें।' },
  'पेमेंट':    { en:'Payment after work approval.', hi:'काम approve होने के बाद पेमेंट मिलेगा।' },
  'मदद':       { en:'I speak Hindi and English both!', hi:'मैं Hindi और English दोनों में मदद करता हूं!' },
  'demo':       { en:'Open the Demo Dashboard at /demo to see both Worker and Client simultaneously!', hi:'Demo Dashboard /demo पर खोलें - Worker और Client दोनों एक साथ देखें!' },
  'default':    { en:"Try: 'find job', 'payment', 'attendance', 'help', or 'demo'", hi:"Try करें: 'नौकरी', 'अटेंडेंस', 'पेमेंट', 'मदद'" },
};

function getReply(text, lang) {
  const t = text.toLowerCase();
  for (const [k, v] of Object.entries(R)) { if (t.includes(k.toLowerCase())) return lang==='hi' ? v.hi : v.en; }
  return lang==='hi' ? R.default.hi : R.default.en;
}
function detectLang(text) { return /[\u0900-\u097F]/.test(text) ? 'hi' : 'en'; }

export default function VoiceAssistant() {
  const { user, notifications } = useApp();
  const [open, setOpen]       = useState(false);
  const [listening, setListening] = useState(false);
  const [messages, setMsgs]   = useState([{ from:'bot', text:'Hello! / नमस्ते! 🤖\nAsk in English or Hindi.\n"Find job" / "काम ढूंढो"' }]);
  const [input, setInput]     = useState('');
  const [lang, setLang]       = useState('en');
  const [supported]           = useState(() => 'webkitSpeechRecognition' in window || 'SpeechRecognition' in window);
  const recogRef   = useRef(null);
  const chatEndRef = useRef(null);
  const unread     = notifications?.filter(n => !n.is_read && n.userId === user?.id).length || 0;

  useEffect(() => { chatEndRef.current?.scrollIntoView({ behavior:'smooth' }); }, [messages]);

  function speak(text, language) {
    if (!('speechSynthesis' in window)) return;
    window.speechSynthesis.cancel();
    const u = new SpeechSynthesisUtterance(text);
    u.lang  = language==='hi' ? 'hi-IN' : 'en-IN';
    u.rate  = 0.9;
    if (language==='hi') { const v = window.speechSynthesis.getVoices().find(v=>v.lang==='hi-IN'); if (v) u.voice=v; }
    window.speechSynthesis.speak(u);
  }

  function handleInput(text) {
    if (!text.trim()) return;
    const dl = detectLang(text); setLang(dl);
    setMsgs(prev => [...prev, { from:'user', text }]);
    setTimeout(() => {
      const reply = getReply(text, dl);
      setMsgs(prev => [...prev, { from:'bot', text:reply }]);
      speak(reply, dl);
    }, 350);
    setInput('');
  }

  function startListen() {
    if (!supported) return;
    const SR = window.SpeechRecognition || window.webkitSpeechRecognition;
    const r  = new SR();
    r.lang='hi-IN'; r.interimResults=false;
    r.onstart=()=>setListening(true);
    r.onend=()=>setListening(false);
    r.onresult=(e)=>handleInput(e.results[0][0].transcript);
    r.onerror=()=>setListening(false);
    recogRef.current=r; r.start();
  }
  function stopListen() { recogRef.current?.stop(); setListening(false); }

  const sugg = lang==='hi' ? ['काम ढूंढो','अटेंडेंस','पेमेंट','मदद'] : ['Find Job','Attendance','Payment','Demo'];

  return (
    <>
      <button className={`voice-fab ${listening?'listening':''}`} onClick={() => setOpen(o=>!o)} title="AI Voice Assistant" style={{ display:open?'none':'flex' }}>
        🎤
        {unread>0&&<span className="notif-dot">{unread}</span>}
      </button>

      {open && (
        <div style={{ position:'fixed', bottom:20, right:20, width:320, height:510, background:'#fff', borderRadius:20, boxShadow:'0 12px 48px rgba(0,0,0,.18)', border:'1px solid var(--border)', display:'flex', flexDirection:'column', zIndex:998, animation:'fadeIn .3s ease', overflow:'hidden' }}>
          {/* Header */}
          <div style={{ background:'linear-gradient(135deg,var(--primary),var(--accent))', padding:'12px 16px', flexShrink:0 }}>
            <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center' }}>
              <div>
                <div style={{ fontWeight:800, fontSize:15, color:'#fff' }}>🤖 AI Assistant</div>
                <div style={{ fontSize:11, color:'rgba(255,255,255,.85)' }}>{listening?'🔴 Listening...':'English + हिंदी'}</div>
              </div>
              <div style={{ display:'flex', gap:8 }}>
                <button onClick={() => setLang(l=>l==='en'?'hi':'en')} style={{ padding:'3px 10px', background:'rgba(255,255,255,.25)', color:'#fff', border:'none', borderRadius:99, fontSize:11, fontWeight:700, cursor:'pointer' }}>{lang==='en'?'हि':'EN'}</button>
                <button onClick={() => setOpen(false)} style={{ background:'none', border:'none', color:'#fff', cursor:'pointer', fontSize:18 }}>✕</button>
              </div>
            </div>
          </div>

          {/* Messages */}
          <div style={{ flex:1, overflowY:'auto', padding:12, display:'flex', flexDirection:'column', gap:8 }}>
            {messages.map((m,i) => (
              <div key={i} style={{ display:'flex', justifyContent:m.from==='user'?'flex-end':'flex-start' }}>
                <div className={`bubble ${m.from}`} style={{ whiteSpace:'pre-wrap' }}>{m.text}</div>
              </div>
            ))}
            <div ref={chatEndRef} />
          </div>

          {/* Suggestions */}
          <div style={{ padding:'6px 10px', display:'flex', gap:6, flexWrap:'wrap', borderTop:'1px solid var(--border)', background:'#fdf6ee' }}>
            {sugg.map(s => <button key={s} onClick={() => handleInput(s)} style={{ padding:'4px 10px', borderRadius:99, fontSize:11, border:'1px solid var(--border)', background:'#fff', cursor:'pointer', fontWeight:600, color:'var(--text-muted)' }}>{s}</button>)}
          </div>

          {/* Input */}
          <div style={{ padding:10, borderTop:'1px solid var(--border)', display:'flex', gap:8 }}>
            <input style={{ flex:1, padding:'9px 12px', border:'1.5px solid var(--border)', borderRadius:99, fontSize:13, outline:'none', background:'#fdf6ee' }}
              placeholder={lang==='hi'?'हिंदी या English में पूछें...':'Ask in English or Hindi...'}
              value={input} onChange={e=>setInput(e.target.value)} onKeyDown={e=>e.key==='Enter'&&handleInput(input)} />
            <button onClick={listening?stopListen:startListen} style={{ width:38, height:38, borderRadius:'50%', border:'none', background:listening?'var(--danger)':'var(--primary)', color:'#fff', cursor:'pointer', fontSize:16, flexShrink:0, display:'flex', alignItems:'center', justifyContent:'center' }}>
              {listening?'⏹':'🎤'}
            </button>
          </div>
          {!supported&&<div style={{ padding:'3px 12px 8px', fontSize:11, color:'var(--text-muted)', textAlign:'center' }}>Voice not supported. Use text input.</div>}
        </div>
      )}
    </>
  );
}
