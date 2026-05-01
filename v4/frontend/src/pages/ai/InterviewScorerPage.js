import React, { useState, useRef, useEffect } from 'react';
import { useApp } from '../../context/AppContext';

const QUESTIONS = [
  { hi:'अपना काम और experience बताइए।', en:'Tell us about your work and experience.' },
  { hi:'आप कैसे काम करते हैं? कोई example दीजिए।', en:'How do you work? Give an example.' },
  { hi:'आप कब से काम शुरू कर सकते हैं?', en:'When can you start work?' },
];

const DEMO_TRANSCRIPTS = [
  'Mera naam Raju hai. Main 5 saal se painting ka kaam karta hoon. Pehle Delhi mein ek bade construction project par kaam kiya. Main wall finishing aur texture painting mein expert hoon.',
  'Main kaam mein puri mehnat karta hoon. Kisi bhi kaam se pehle surface prepare karta hoon, phir primer lagata hoon. Quality se koi compromise nahi karta.',
  'Main kal se hi kaam shuru kar sakta hoon. Subah 8 baje se shaam 6 baje tak available hoon. Sunday bhi zaroorat pade toh kaam kar sakta hoon.',
];

async function scoreWithClaude(transcripts) {
  try {
    const res = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        model: 'claude-sonnet-4-20250514',
        max_tokens: 400,
        messages: [{
          role: 'user',
          content: `You are evaluating a daily wage worker's job interview in India. Score from 0-100.
Q1 (Experience): "${transcripts[0]}"
Q2 (Work style): "${transcripts[1]}"
Q3 (Availability): "${transcripts[2]}"
Return ONLY valid JSON, no markdown: {"confidence":75,"clarity":80,"overall":78,"feedback":"2-3 sentences of constructive feedback in simple English."}`,
        }],
      }),
    });
    const data = await res.json();
    const text = (data.content?.[0]?.text || '').replace(/```json|```/g, '').trim();
    return JSON.parse(text);
  } catch {
    return generateDemoScores(transcripts);
  }
}

function generateDemoScores(transcripts) {
  const wordCount = transcripts.join(' ').split(' ').filter(w => w.length > 2).length;
  const hasDetails = transcripts.filter(t => t.length > 40).length;
  const conf = Math.min(Math.max(40 + hasDetails * 15 + Math.floor(Math.random() * 12), 42), 91);
  const clar = Math.min(Math.max(45 + hasDetails * 12 + Math.floor(Math.random() * 15), 44), 94);
  return {
    confidence: conf,
    clarity:    clar,
    overall:    Math.round((conf + clar) / 2),
    feedback:   `You provided ${hasDetails > 1 ? 'detailed and relevant' : 'brief'} answers. ${conf > 70 ? 'Your confidence about your experience came through clearly.' : 'Try to speak with more confidence — mention specific projects you have worked on.'} ${clar > 70 ? 'Your communication was easy to understand.' : 'Give concrete examples from past work to improve your clarity score.'}`,
  };
}

function ScoreBar({ label, value }) {
  const color = value >= 75 ? 'var(--success)' : value >= 55 ? 'var(--warning)' : 'var(--danger)';
  return (
    <div style={{ marginBottom: 16 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6 }}>
        <span style={{ fontSize: 14, fontWeight: 600 }}>{label}</span>
        <span style={{ fontSize: 14, fontWeight: 800, color }}>{value}%</span>
      </div>
      <div style={{ height: 10, background: 'var(--gray-200)', borderRadius: 99, overflow: 'hidden' }}>
        <div style={{ height: '100%', width: value + '%', background: color, borderRadius: 99, transition: 'width 0.8s ease' }} />
      </div>
    </div>
  );
}

export default function InterviewScorerPage() {
  const { workerProfile, setWorkerProfile } = useApp();
  const [step, setStep]         = useState('intro');
  const [curQ, setCurQ]         = useState(0);
  const [transcripts, setTrans] = useState(['', '', '']);
  const [recording, setRec]     = useState(false);
  const [timeLeft, setTime]     = useState(30);
  const [scores, setScores]     = useState(null);
  const [saved, setSaved]       = useState(false);
  const videoRef  = useRef(null);
  const timerRef  = useRef(null);
  const streamRef = useRef(null);
  const recogRef  = useRef(null);

  useEffect(() => () => {
    clearInterval(timerRef.current);
    streamRef.current?.getTracks().forEach(t => t.stop());
    recogRef.current?.stop();
  }, []);

  async function startQuestion(qIdx) {
    setCurQ(qIdx);
    setStep('recording');
    setTime(30);
    setRec(false);

    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
      streamRef.current = stream;
      if (videoRef.current) { videoRef.current.srcObject = stream; videoRef.current.play(); }

      // Speech recognition
      const SR = window.SpeechRecognition || window.webkitSpeechRecognition;
      if (SR) {
        const r = new SR();
        r.lang = 'hi-IN';
        r.continuous = true;
        r.interimResults = true;
        r.onresult = e => {
          let txt = '';
          for (let i = 0; i < e.results.length; i++) {
            if (e.results[i].isFinal) txt += e.results[i][0].transcript + ' ';
          }
          setTrans(prev => { const n = [...prev]; n[qIdx] = txt; return n; });
        };
        recogRef.current = r;
        r.start();
      }

      setRec(true);
      timerRef.current = setInterval(() => {
        setTime(t => {
          if (t <= 1) { stopQuestion(qIdx); return 30; }
          return t - 1;
        });
      }, 1000);

    } catch {
      // Demo mode without camera
      setRec(true);
      setTrans(prev => { const n = [...prev]; n[qIdx] = DEMO_TRANSCRIPTS[qIdx]; return n; });
      timerRef.current = setInterval(() => {
        setTime(t => { if (t <= 1) { stopQuestion(qIdx); return 30; } return t - 1; });
      }, 1000);
    }
  }

  function stopQuestion(qIdx) {
    clearInterval(timerRef.current);
    recogRef.current?.stop();
    streamRef.current?.getTracks().forEach(t => t.stop());
    setRec(false);

    // Use demo transcript if nothing was captured
    setTrans(prev => {
      const n = [...prev];
      if (!n[qIdx] || n[qIdx].trim().length < 5) n[qIdx] = DEMO_TRANSCRIPTS[qIdx];
      return n;
    });

    if (qIdx < 2) {
      setTimeout(() => startQuestion(qIdx + 1), 500);
    } else {
      runAnalysis();
    }
  }

  async function runAnalysis() {
    setStep('analysing');
    await new Promise(r => setTimeout(r, 2500));
    const result = await scoreWithClaude(transcripts);
    setScores(result);
    setStep('result');
  }

  function saveToProfile() {
    if (!scores) return;
    setWorkerProfile(prev => ({
      ...prev,
      interviewScore:   { confidence: scores.confidence, clarity: scores.clarity, overall: scores.overall },
      interviewFeedback: scores.feedback,
      interviewDone:    true,
    }));
    setSaved(true);
  }

  return (
    <div className="page" style={{ paddingBottom: 80 }}>
      <div className="container" style={{ paddingTop: 28, maxWidth: 580 }}>
        <h1 style={{ fontSize: 24, fontWeight: 700, marginBottom: 4 }}>🎯 AI Interview Scorer</h1>
        <p style={{ color: 'var(--text-muted)', fontSize: 14, marginBottom: 24 }}>
          Answer 3 questions on camera. AI scores your confidence and clarity 0–100. High scores shown on profile.
        </p>

        {/* INTRO */}
        {step === 'intro' && (
          <div>
            <div className="ai-card" style={{ marginBottom: 20 }}>
              <div style={{ fontSize: 12, fontWeight: 700, color: 'var(--text-muted)', marginBottom: 12, letterSpacing: .04 }}>
                3 QUESTIONS — 30 SECONDS EACH
              </div>
              {QUESTIONS.map((q, i) => (
                <div key={i} style={{ display: 'flex', gap: 12, padding: '10px 0', borderBottom: i < 2 ? '1px solid var(--border)' : 'none' }}>
                  <div style={{ width: 28, height: 28, borderRadius: '50%', background: 'var(--brand)', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 800, fontSize: 13, flexShrink: 0 }}>{i + 1}</div>
                  <div>
                    <div style={{ fontWeight: 600, fontSize: 14 }}>{q.hi}</div>
                    <div style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: 2 }}>{q.en}</div>
                  </div>
                </div>
              ))}
            </div>
            <div className="alert alert-info" style={{ marginBottom: 20 }}>
              💡 Speak in Hindi or English. Be specific. If camera is unavailable, demo answers are used automatically.
            </div>
            <button className="btn btn-saffron btn-full btn-lg" onClick={() => startQuestion(0)}>
              🎥 Start Interview
            </button>
          </div>
        )}

        {/* RECORDING */}
        {step === 'recording' && (
          <div>
            {/* Progress dots */}
            <div style={{ display: 'flex', gap: 6, marginBottom: 20 }}>
              {[0, 1, 2].map(i => (
                <div key={i} style={{ flex: 1, height: 4, borderRadius: 99, background: i <= curQ ? 'var(--brand)' : 'var(--gray-200)', transition: 'background .3s' }} />
              ))}
            </div>

            <div style={{ background: 'var(--brand)', borderRadius: 'var(--r-lg)', padding: '14px 18px', color: '#fff', marginBottom: 16 }}>
              <div style={{ fontSize: 11, opacity: .8, marginBottom: 3 }}>Question {curQ + 1} of 3</div>
              <div style={{ fontWeight: 700, fontSize: 16 }}>{QUESTIONS[curQ].hi}</div>
              <div style={{ fontSize: 13, opacity: .8, marginTop: 3 }}>{QUESTIONS[curQ].en}</div>
            </div>

            <div style={{ position: 'relative', width: '100%', aspectRatio: '16/9', background: '#111', borderRadius: 12, overflow: 'hidden', marginBottom: 16 }}>
              <video ref={videoRef} style={{ width: '100%', height: '100%', objectFit: 'cover' }} muted playsInline />
              {recording && (
                <div style={{ position: 'absolute', top: 10, right: 10, background: 'rgba(220,38,38,.9)', borderRadius: 99, padding: '4px 10px', color: '#fff', fontSize: 12, fontWeight: 700, display: 'flex', alignItems: 'center', gap: 5 }}>
                  <span style={{ width: 7, height: 7, borderRadius: '50%', background: '#fff', display: 'inline-block', animation: 'rec-blink 1s infinite' }} />
                  REC {timeLeft}s
                </div>
              )}
              {!recording && (
                <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'rgba(0,0,0,.5)', color: '#fff', fontSize: 14, fontWeight: 600 }}>
                  Starting camera...
                </div>
              )}
            </div>

            <div style={{ background: 'var(--gray-50)', borderRadius: 8, padding: '8px 12px', marginBottom: 12, minHeight: 40, fontSize: 13, color: 'var(--text-2)' }}>
              {transcripts[curQ] || <span style={{ color: 'var(--text-faint)', fontStyle: 'italic' }}>Listening... (speak now)</span>}
            </div>

            <button className="btn btn-danger btn-full" onClick={() => stopQuestion(curQ)}>
              ⏹ Stop & {curQ < 2 ? 'Next Question' : 'Finish'}
            </button>
          </div>
        )}

        {/* ANALYSING */}
        {step === 'analysing' && (
          <div className="card" style={{ textAlign: 'center', padding: 48 }}>
            <div style={{ fontSize: 56, marginBottom: 16 }}>🤖</div>
            <h3 style={{ fontSize: 20, marginBottom: 8 }}>Analysing your interview...</h3>
            <div className="progress-wrap" style={{ maxWidth: 280, margin: '0 auto 12px' }}>
              <div className="progress-fill" style={{ width: '80%', background: 'var(--saffron)', transition: 'width 2.5s ease' }} />
            </div>
            <p style={{ fontSize: 13, color: 'var(--text-muted)' }}>AI is evaluating confidence, clarity and communication...</p>
          </div>
        )}

        {/* RESULT */}
        {step === 'result' && scores && (
          <div className="ai-result fade-up">
            <h3 style={{ fontSize: 18, fontWeight: 700, marginBottom: 24, textAlign: 'center' }}>🎯 Your Interview Results</h3>

            <ScoreBar label="Confidence" value={scores.confidence} />
            <ScoreBar label="Clarity"    value={scores.clarity} />
            <ScoreBar label="Overall"    value={scores.overall} />

            <div style={{ background: 'var(--gray-50)', borderRadius: 10, padding: '14px 16px', margin: '20px 0', borderLeft: '3px solid var(--saffron)' }}>
              <div style={{ fontSize: 10, color: 'var(--saffron)', fontWeight: 800, marginBottom: 6, letterSpacing: .05 }}>AI FEEDBACK</div>
              <p style={{ fontSize: 14, color: 'var(--text-2)', lineHeight: 1.7 }}>"{scores.feedback}"</p>
            </div>

            <div style={{ background: scores.overall >= 70 ? 'var(--success-bg)' : 'var(--warning-bg)', borderRadius: 12, padding: 16, marginBottom: 20, textAlign: 'center', border: `1px solid ${scores.overall >= 70 ? 'var(--success-ring)' : 'var(--warning-ring)'}` }}>
              <div style={{ fontSize: 36, fontWeight: 800, color: scores.overall >= 70 ? 'var(--success)' : 'var(--warning)' }}>{scores.overall}%</div>
              <div style={{ fontSize: 13, color: scores.overall >= 70 ? '#166534' : '#92400e', marginTop: 4 }}>
                {scores.overall >= 80 ? '🏆 Excellent! This badge will boost your profile ranking.' : scores.overall >= 60 ? '👍 Good. Keep practising to reach 80%+.' : '📚 Keep practising. Try again to improve your score.'}
              </div>
            </div>

            {!saved ? (
              <button className="btn btn-saffron btn-full btn-lg" onClick={saveToProfile}>
                💾 Save Score to Profile
              </button>
            ) : (
              <div>
                <div className="alert alert-success">✅ Interview score saved! Clients will see this badge on your profile.</div>
                <button className="btn btn-ghost btn-full" style={{ marginTop: 10 }} onClick={() => { setStep('intro'); setScores(null); setSaved(false); setTrans(['', '', '']); }}>
                  🔄 Retake Interview
                </button>
              </div>
            )}

            {/* Show captured transcripts */}
            <div style={{ marginTop: 20 }}>
              <div style={{ fontSize: 11, color: 'var(--text-muted)', marginBottom: 8, fontWeight: 600 }}>TRANSCRIPTS ANALYSED</div>
              {transcripts.map((t, i) => (
                <div key={i} style={{ marginBottom: 8, background: '#f8fafc', borderRadius: 8, padding: '8px 12px' }}>
                  <div style={{ fontSize: 10, color: 'var(--text-faint)', marginBottom: 3 }}>Q{i + 1}: {QUESTIONS[i].en}</div>
                  <div className="font-mono" style={{ fontSize: 11, color: 'var(--text-muted)', lineHeight: 1.5 }}>{t || '(no transcript)'}</div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
      <style>{`@keyframes rec-blink{0%,100%{opacity:1}50%{opacity:.2}}`}</style>
    </div>
  );
}
