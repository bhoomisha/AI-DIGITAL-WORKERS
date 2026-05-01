import React, { useState, useRef } from 'react';
import { useApp } from '../../context/AppContext';

/* ══════════════════════════════════════════════
   VOICE TO RESUME (Hindi Support)
   Worker speaks in Hindi → AI generates structured profile
   Uses Web Speech API for recording
   Claude API for profile extraction
══════════════════════════════════════════════ */

const LANGS = [
  { code:'hi-IN', label:'हिंदी', flag:'🇮🇳' },
  { code:'en-IN', label:'English', flag:'🇬🇧' },
  { code:'hi-IN', label:'Hinglish', flag:'🌐' },
];

async function buildProfile(transcript) {
  try {
    const res = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        model: 'claude-sonnet-4-20250514',
        max_tokens: 600,
        messages: [{
          role: 'user',
          content: `You are helping create a professional worker profile for an Indian daily wage worker.
The worker has spoken the following in Hindi/English/Hinglish:
"${transcript}"

Extract and return ONLY valid JSON (no extra text, no markdown):
{"name":"","skills":[""],"experienceYears":0,"city":"","dailyWageINR":700,"languages":["Hindi"],"about":"2-3 sentence professional bio in simple English","workTypes":["Painting"]}

If any field is not mentioned, make a reasonable inference. Always return valid JSON.`,
        }],
      }),
    });
    const data = await res.json();
    const text = (data.content?.[0]?.text||'').replace(/```json|```/g,'').trim();
    return JSON.parse(text);
  } catch {
    return extractFromTranscript(transcript);
  }
}

function extractFromTranscript(t) {
  const skills = [];
  if (/paint|rang/.test(t.toLowerCase()))    skills.push('Painting');
  if (/electri/.test(t.toLowerCase()))        skills.push('Electrician');
  if (/plumb/.test(t.toLowerCase()))          skills.push('Plumbing');
  if (/mason|cement/.test(t.toLowerCase()))   skills.push('Masonry');
  if (/carpen|wood/.test(t.toLowerCase()))    skills.push('Carpentry');
  if (!skills.length) skills.push('General Labour');
  const years = t.match(/(\d+)\s*(sal|saal|year)/i)?.[1] || '5';
  const wage  = t.match(/(\d{3,4})\s*(rupee|rupe|₹)/i)?.[1] || '700';
  const name  = t.match(/naam\s+([\w\s]+)/i)?.[1]?.split(' ')[0] || 'Worker';
  return {
    name, skills,
    experienceYears: parseInt(years),
    city: /delhi/i.test(t)?'Delhi':/noida/i.test(t)?'Noida':'Delhi NCR',
    dailyWageINR: parseInt(wage),
    languages: ['Hindi', 'English'],
    about: `Experienced ${skills[0]} worker with ${years} years of hands-on expertise. Available for immediate work in Delhi NCR.`,
    workTypes: skills,
  };
}

export default function VoiceResumePage() {
  const { workerProfile, setWorkerProfile } = useApp();
  const [langIdx, setLangIdx] = useState(0);
  const [recording, setRecording] = useState(false);
  const [transcript, setTranscript] = useState('');
  const [building, setBuilding] = useState(false);
  const [profile, setProfile]   = useState(null);
  const [applied, setApplied]   = useState(false);
  const [toast, setToast]       = useState('');
  const [seconds, setSeconds]   = useState(0);
  const recogRef = useRef(null);
  const timerRef = useRef(null);

  function showToast(m) { setToast(m); setTimeout(()=>setToast(''),3500); }

  function startRecording() {
    const SR = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SR) { showToast('❌ Speech recognition not supported. Use Chrome browser.'); return; }
    const r  = new SR();
    r.lang           = LANGS[langIdx].code;
    r.continuous     = true;
    r.interimResults = true;
    r.onresult = e => {
      let final = '';
      for (let i=0; i<e.results.length; i++) { if (e.results[i].isFinal) final += e.results[i][0].transcript+' '; }
      setTranscript(final);
    };
    r.onerror = () => { setRecording(false); clearInterval(timerRef.current); };
    r.onend   = () => {};
    recogRef.current = r;
    r.start();
    setRecording(true);
    setSeconds(0);
    timerRef.current = setInterval(() => setSeconds(s=>s+1), 1000);
  }

  function stopRecording() {
    recogRef.current?.stop();
    clearInterval(timerRef.current);
    setRecording(false);
  }

  async function generate() {
    if (!transcript.trim()) { showToast('Please record something first'); return; }
    setBuilding(true);
    const p = await buildProfile(transcript);
    setProfile(p);
    setBuilding(false);
  }

  function applyToProfile() {
    setWorkerProfile(prev => ({
      ...prev,
      name:       profile.name !== 'Worker' ? profile.name : prev?.name,
      skills:     [...new Set([...(prev?.skills||[]), ...profile.skills])],
      experience: profile.experienceYears,
      location:   profile.city,
      dailyRate:  profile.dailyWageINR,
      bio:        profile.about,
      voiceResumeDone: true,
    }));
    setApplied(true);
    showToast('✅ Profile updated from voice resume!');
  }

  return (
    <div className="page" style={{ paddingBottom:80 }}>
      <div className="container" style={{ paddingTop:28, maxWidth:600 }}>
        <h1 style={{ fontSize:24, fontWeight:700, marginBottom:4 }}>🎤 Voice to Resume</h1>
        <p style={{ color:'var(--text-muted)', fontSize:14, marginBottom:24 }}>बोलिये — AI आपका profile बनाएगा। Speak in Hindi, English, or Hinglish.</p>

        {toast && <div className="alert alert-success">{toast}</div>}

        {/* Language selector */}
        <div className="ai-card" style={{ marginBottom:20 }}>
          <div style={{ fontSize:13, fontWeight:600, color:'var(--text-2)', marginBottom:10 }}>भाषा चुनें / Select Language</div>
          <div style={{ display:'flex', gap:8 }}>
            {LANGS.map((l,i) => (
              <button key={i} onClick={() => setLangIdx(i)} style={{ flex:1, padding:'10px', border:`2px solid ${langIdx===i?'var(--saffron)':'var(--border)'}`, borderRadius:10, background:langIdx===i?'var(--saffron-light)':'#fff', cursor:'pointer', fontWeight:600, fontSize:13, color:langIdx===i?'var(--saffron)':'var(--text-muted)' }}>
                {l.flag} {l.label}
              </button>
            ))}
          </div>
        </div>

        {/* Mic button */}
        <div className="card" style={{ textAlign:'center', marginBottom:20, padding:32 }}>
          {/* Big mic button */}
          <div style={{ position:'relative', display:'inline-block', marginBottom:20 }}>
            <button onClick={recording?stopRecording:startRecording}
              style={{ width:96, height:96, borderRadius:'50%', border:'none', background:recording?'var(--danger)':'linear-gradient(135deg,var(--saffron),var(--gold))', color:'#fff', fontSize:36, cursor:'pointer', display:'flex', alignItems:'center', justifyContent:'center', boxShadow:recording?'0 0 0 0 rgba(220,38,38,.4)':'var(--shadow-lg)', animation:recording?'recording-pulse 1s infinite':'none', transition:'all .2s' }}>
              {recording ? '⏹' : '🎤'}
            </button>
          </div>

          {/* Waveform animation while recording */}
          {recording && (
            <div className="waveform" style={{ justifyContent:'center', marginBottom:12 }}>
              {Array.from({length:8}).map((_,i) => <div key={i} className="waveform-bar" style={{ animationDelay:`${i*.1}s` }} />)}
            </div>
          )}

          <div style={{ fontSize:14, color:recording?'var(--danger)':'var(--text-muted)', fontWeight:600, marginBottom:8 }}>
            {recording ? `🔴 Recording... ${seconds}s` : 'Tap microphone to start speaking'}
          </div>

          {!recording && (
            <p style={{ fontSize:12, color:'var(--text-faint)', maxWidth:340, margin:'0 auto' }}>
              Say: "Mera naam [Name] hai. Main [skill] ka kaam karta hoon. Mujhe [X] saal ka experience hai. Main [city] mein hoon."
            </p>
          )}
        </div>

        {/* Transcript */}
        {transcript && (
          <div className="card" style={{ marginBottom:20 }}>
            <div style={{ fontSize:12, color:'var(--text-muted)', marginBottom:8 }}>📝 Transcript</div>
            <div className="font-mono" style={{ fontSize:13, lineHeight:1.7, color:'var(--text-2)', minHeight:60 }}>
              {transcript || <span style={{ color:'var(--text-faint)', fontStyle:'italic' }}>Speaking...</span>}
            </div>
            {!recording && transcript && (
              <button className="btn btn-saffron btn-full" style={{ marginTop:14 }} onClick={generate} disabled={building}>
                {building ? '🤖 Generating profile...' : '✨ Generate Profile with AI'}
              </button>
            )}
          </div>
        )}

        {/* Building animation */}
        {building && (
          <div className="card" style={{ textAlign:'center', padding:32, marginBottom:20 }}>
            <div style={{ fontSize:48, marginBottom:12 }}>🤖</div>
            <div style={{ fontWeight:700, fontSize:16, marginBottom:8 }}>Generating your profile...</div>
            <div className="progress-wrap"><div className="progress-fill" style={{ width:'75%', background:'var(--saffron)' }} /></div>
            <p style={{ fontSize:12, color:'var(--text-muted)', marginTop:8 }}>AI is analysing your speech in {LANGS[langIdx].label}...</p>
          </div>
        )}

        {/* Generated profile card */}
        {profile && !building && (
          <div className="ai-result fade-up">
            <div style={{ fontSize:13, fontWeight:700, color:'var(--saffron)', marginBottom:14 }}>⚡ AI Generated Profile</div>

            <div style={{ display:'flex', gap:14, alignItems:'flex-start', marginBottom:16 }}>
              <div style={{ width:64, height:64, borderRadius:'50%', background:`linear-gradient(135deg,var(--saffron),var(--gold))`, display:'flex', alignItems:'center', justifyContent:'center', color:'#fff', fontWeight:800, fontSize:22, flexShrink:0 }}>
                {profile.name?.[0]||'W'}
              </div>
              <div>
                <div style={{ fontWeight:700, fontSize:18 }}>{profile.name || 'Worker'}</div>
                <div style={{ fontSize:14, color:'var(--text-muted)' }}>{profile.workTypes?.join(' & ')}</div>
                <div style={{ fontSize:13, color:'var(--text-muted)' }}>📍 {profile.city}</div>
              </div>
            </div>

            <div style={{ display:'flex', flexWrap:'wrap', gap:6, marginBottom:12 }}>
              {profile.skills.map(s => <span key={s} style={{ padding:'4px 12px', background:'linear-gradient(135deg,var(--saffron),var(--gold))', color:'#fff', borderRadius:99, fontSize:12, fontWeight:700 }}>{s}</span>)}
            </div>

            <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:10, marginBottom:12 }}>
              {[
                { l:'Experience', v:`${profile.experienceYears} years` },
                { l:'Daily Wage',  v:`₹${profile.dailyWageINR}` },
                { l:'Languages',  v:profile.languages?.join(', ') },
                { l:'Location',   v:profile.city },
              ].map(d => (
                <div key={d.l} style={{ background:'rgba(255,255,255,.7)', borderRadius:8, padding:'8px 12px' }}>
                  <div style={{ fontSize:11, color:'var(--text-muted)' }}>{d.l}</div>
                  <div style={{ fontWeight:600, fontSize:13 }}>{d.v}</div>
                </div>
              ))}
            </div>

            <p style={{ fontSize:14, color:'var(--text-2)', lineHeight:1.6, marginBottom:16 }}>{profile.about}</p>

            {applied
              ? <div className="alert alert-success">✅ Profile updated! Your AI match score will improve with these details.</div>
              : <button className="btn btn-saffron btn-full btn-lg" onClick={applyToProfile}>Apply this to my Profile →</button>
            }
          </div>
        )}
      </div>
      <style>{`@keyframes recording-pulse{0%{box-shadow:0 0 0 0 rgba(220,38,38,.4)}70%{box-shadow:0 0 0 14px rgba(220,38,38,0)}100%{box-shadow:0 0 0 0 rgba(220,38,38,0)}}`}</style>
    </div>
  );
}
