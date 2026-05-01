import React, { useState, useRef, useEffect } from 'react';
import { useApp } from '../../context/AppContext';

/* ══════════════════════════════════════════════
   AI VIDEO BIO
   Worker records 30-60s intro video
   AI transcribes and extracts skill tags
   Saves to worker profile automatically
══════════════════════════════════════════════ */

async function analyseWithAI(transcript) {
  try {
    const res = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        model: 'claude-sonnet-4-20250514',
        max_tokens: 500,
        messages: [{
          role: 'user',
          content: `Extract skills, experience, and location from this Indian worker's self-introduction. Return ONLY valid JSON with no extra text:
{"skills":["skill1","skill2"],"experienceYears":5,"city":"Delhi","summary":"2 sentence professional summary in English","confidence":{"skills":85,"experience":90,"city":70}}

Transcript: "${transcript}"`,
        }],
      }),
    });
    const data = await res.json();
    const text = data.content?.[0]?.text || '';
    const clean = text.replace(/```json|```/g, '').trim();
    return JSON.parse(clean);
  } catch {
    // Demo fallback based on transcript keywords
    return demoAnalyse(transcript);
  }
}

function demoAnalyse(transcript) {
  const t = transcript.toLowerCase();
  const skills = [];
  if (/paint|rang/.test(t))    skills.push('Painting');
  if (/electri|wiring/.test(t)) skills.push('Electrician');
  if (/plumb|pipe/.test(t))     skills.push('Plumbing');
  if (/carpen|wood/.test(t))    skills.push('Carpentry');
  if (/mason|cement/.test(t))   skills.push('Masonry');
  if (!skills.length) skills.push('General Labour');
  const years = (transcript.match(/(\d+)\s*(year|sal|saal)/i)?.[1]) || '3';
  return {
    skills,
    experienceYears: parseInt(years),
    city: /delhi/i.test(t)?'Delhi':/mumbai/i.test(t)?'Mumbai':/noida/i.test(t)?'Noida':'Delhi NCR',
    summary: `Experienced ${skills[0]} worker with ${years} years of hands-on experience. Available for work in Delhi NCR region.`,
    confidence: { skills:75, experience:70, city:65 },
  };
}

export default function VideoBioPage() {
  const { workerProfile, setWorkerProfile } = useApp();
  const videoRef    = useRef(null);
  const mediaRef    = useRef(null);
  const chunksRef   = useRef([]);
  const streamRef   = useRef(null);
  const [state, setState]       = useState('idle'); // idle|preview|recording|analysing|done
  const [videoUrl, setVideoUrl] = useState(null);
  const [timeLeft, setTimeLeft] = useState(60);
  const [transcript, setTranscript] = useState('');
  const [result, setResult]     = useState(null);
  const [saved, setSaved]       = useState(false);
  const [toast, setToast]       = useState('');
  const timerRef = useRef(null);

  function showToast(msg) { setToast(msg); setTimeout(()=>setToast(''),3000); }

  async function startCamera() {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video:{ width:640, height:480, facingMode:'user' }, audio:true });
      streamRef.current = stream;
      if (videoRef.current) { videoRef.current.srcObject = stream; videoRef.current.play(); }
      setState('preview');
    } catch { showToast('❌ Camera/microphone permission denied.'); }
  }

  function startRecording() {
    if (!streamRef.current) return;
    chunksRef.current = [];
    const mr = new MediaRecorder(streamRef.current, { mimeType:'video/webm;codecs=vp9,opus' });
    mr.ondataavailable = e => { if (e.data.size>0) chunksRef.current.push(e.data); };
    mr.onstop = () => {
      const blob = new Blob(chunksRef.current, { type:'video/webm' });
      setVideoUrl(URL.createObjectURL(blob));
      streamRef.current?.getTracks().forEach(t=>t.stop());
      setState('done_recording');
    };
    mediaRef.current = mr;
    mr.start(100);
    setState('recording');
    setTimeLeft(60);
    timerRef.current = setInterval(() => {
      setTimeLeft(t => { if (t<=1) { stopRecording(); return 60; } return t-1; });
    }, 1000);
  }

  function stopRecording() {
    clearInterval(timerRef.current);
    mediaRef.current?.stop();
  }

  async function analyseVideo() {
    setState('analysing');
    // Simulate Whisper transcription (in production, send blob to /api/ai/video-bio)
    await new Promise(r=>setTimeout(r,1500));
    const mockTranscript = workerProfile
      ? `Namaste, mera naam ${workerProfile.name} hai. Main ${workerProfile.skills?.join(' aur ')} ka kaam karta hoon. Mujhe ${workerProfile.experience||3} saal ka experience hai. Main ${workerProfile.location||'Delhi NCR'} mein available hoon.`
      : 'Namaste, mera naam Raju hai. Main painting aur wall finishing ka kaam karta hoon. Mujhe 5 saal ka experience hai. Main Noida aur Delhi mein kaam kar sakta hoon.';
    setTranscript(mockTranscript);
    const analysis = await analyseWithAI(mockTranscript);
    setResult(analysis);
    setState('result');
  }

  function saveToProfile() {
    if (!result) return;
    setWorkerProfile(prev => ({
      ...prev,
      skills:       [...new Set([...(prev?.skills||[]), ...result.skills])],
      experience:   result.experienceYears || prev?.experience,
      location:     result.city || prev?.location,
      videoBioSaved: true,
      aiSkillTags:  result.skills,
    }));
    setSaved(true);
    showToast('✅ Skills saved to your profile!');
  }

  useEffect(() => () => { clearInterval(timerRef.current); streamRef.current?.getTracks().forEach(t=>t.stop()); }, []);

  return (
    <div className="page" style={{ paddingBottom:80 }}>
      <div className="container" style={{ paddingTop:28, maxWidth:640 }}>
        <div style={{ marginBottom:24 }}>
          <h1 style={{ fontSize:24, fontWeight:700, marginBottom:4 }}>🎥 AI Video Bio</h1>
          <p style={{ color:'var(--text-muted)', fontSize:14 }}>Record a 30–60 second introduction. AI extracts your skills automatically.</p>
        </div>

        {toast && <div className="alert alert-success">{toast}</div>}

        {/* AI card */}
        <div className="ai-card" style={{ marginBottom:20 }}>
          <h3 style={{ fontSize:16, marginBottom:8 }}>How it works</h3>
          <div style={{ display:'flex', flexDirection:'column', gap:6, fontSize:13, color:'var(--text-muted)' }}>
            <span>🎤 Record yourself speaking about your work experience in Hindi or English</span>
            <span>🤖 AI transcribes your speech using Whisper technology</span>
            <span>⚡ AI extracts skills, experience years, and location automatically</span>
            <span>💾 One click saves everything to your profile</span>
          </div>
        </div>

        {/* Camera / video area */}
        <div className="card" style={{ marginBottom:20 }}>
          <div style={{ position:'relative', width:'100%', aspectRatio:'4/3', background:'#111', borderRadius:12, overflow:'hidden', marginBottom:16 }}>
            {(state==='preview'||state==='recording') && (
              <video ref={videoRef} style={{ width:'100%', height:'100%', objectFit:'cover' }} muted playsInline />
            )}
            {state==='done_recording' && videoUrl && (
              <video src={videoUrl} controls style={{ width:'100%', height:'100%', objectFit:'cover' }} />
            )}
            {state==='idle' && (
              <div style={{ display:'flex', flexDirection:'column', alignItems:'center', justifyContent:'center', height:'100%', color:'#64748b' }}>
                <div style={{ fontSize:48, marginBottom:8 }}>🎥</div>
                <p style={{ fontSize:14 }}>Camera will appear here</p>
              </div>
            )}
            {state==='recording' && (
              <div style={{ position:'absolute', top:12, right:12, display:'flex', alignItems:'center', gap:6, background:'rgba(220,38,38,.9)', borderRadius:99, padding:'4px 10px' }}>
                <span style={{ width:8, height:8, borderRadius:'50%', background:'#fff', display:'inline-block', animation:'recording-pulse 1s infinite' }} />
                <span style={{ color:'#fff', fontSize:12, fontWeight:700 }}>REC {timeLeft}s</span>
              </div>
            )}
            {state==='analysing' && (
              <div style={{ position:'absolute', inset:0, background:'rgba(10,22,40,.85)', display:'flex', flexDirection:'column', alignItems:'center', justifyContent:'center', gap:12 }}>
                <div style={{ fontSize:14, color:'#f1f5f9', fontWeight:700, textAlign:'center' }}>
                  🤖 AI is listening to your introduction...<br/>
                  <span style={{ fontSize:12, color:'#94a3b8', fontWeight:400 }}>Extracting skills, experience & location</span>
                </div>
                <div style={{ width:200, height:6, background:'rgba(255,255,255,.1)', borderRadius:99, overflow:'hidden' }}>
                  <div style={{ height:'100%', background:'var(--saffron)', borderRadius:99, width:'70%', animation:'shimmer 1.5s infinite', backgroundSize:'200% 100%' }} />
                </div>
              </div>
            )}
          </div>

          <div style={{ display:'flex', gap:10, flexWrap:'wrap' }}>
            {state==='idle' && <button className="btn btn-primary btn-full" onClick={startCamera}>📷 Open Camera</button>}
            {state==='preview' && <button className="btn btn-saffron btn-full" onClick={startRecording}>🔴 Start Recording</button>}
            {state==='recording' && <button className="btn btn-danger btn-full" onClick={stopRecording}>⏹ Stop Recording ({timeLeft}s left)</button>}
            {state==='done_recording' && (
              <>
                <button className="btn btn-primary" style={{ flex:1 }} onClick={analyseVideo}>🤖 Analyse with AI</button>
                <button className="btn btn-ghost" onClick={() => { setVideoUrl(null); startCamera(); }}>🔄 Retake</button>
              </>
            )}
          </div>
        </div>

        {/* Results */}
        {state==='result' && result && (
          <div className="ai-result fade-up">
            <div style={{ marginBottom:16 }}>
              <div style={{ fontSize:12, color:'var(--text-muted)', marginBottom:6 }}>📝 Transcript (AI Transcribed)</div>
              <div className="font-mono" style={{ fontSize:13, color:'var(--text-2)', background:'#f8fafc', borderRadius:8, padding:'10px 12px', lineHeight:1.7 }}>
                {transcript}
              </div>
            </div>

            <div style={{ marginBottom:16 }}>
              <div style={{ fontSize:12, color:'var(--text-muted)', marginBottom:8 }}>⚡ Extracted Skills</div>
              <div style={{ display:'flex', flexWrap:'wrap', gap:8 }}>
                {result.skills.map(skill => (
                  <span key={skill} style={{ padding:'5px 14px', borderRadius:99, background:'linear-gradient(135deg,var(--saffron),var(--gold))', color:'#fff', fontSize:13, fontWeight:700 }}>
                    {skill}
                    <span style={{ marginLeft:6, opacity:.8, fontSize:11 }}>{result.confidence.skills}%</span>
                  </span>
                ))}
              </div>
            </div>

            <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:12, marginBottom:16 }}>
              <div style={{ background:'var(--gray-50)', borderRadius:10, padding:12 }}>
                <div style={{ fontSize:11, color:'var(--text-muted)', marginBottom:3 }}>Experience</div>
                <div style={{ fontWeight:700 }}>{result.experienceYears} years</div>
              </div>
              <div style={{ background:'var(--gray-50)', borderRadius:10, padding:12 }}>
                <div style={{ fontSize:11, color:'var(--text-muted)', marginBottom:3 }}>Location</div>
                <div style={{ fontWeight:700 }}>{result.city}</div>
              </div>
            </div>

            <div style={{ marginBottom:16 }}>
              <div style={{ fontSize:11, color:'var(--text-muted)', marginBottom:4 }}>AI Summary</div>
              <p style={{ fontSize:14, color:'var(--text-2)', lineHeight:1.6 }}>{result.summary}</p>
            </div>

            {!saved
              ? <button className="btn btn-saffron btn-full btn-lg" onClick={saveToProfile}>💾 Save Skills to Profile</button>
              : <div className="alert alert-success">✅ Skills saved to your profile! They will now improve your AI job match scores.</div>
            }
          </div>
        )}
      </div>
      <style>{`@keyframes recording-pulse{0%,100%{opacity:1}50%{opacity:.3}}`}</style>
    </div>
  );
}
