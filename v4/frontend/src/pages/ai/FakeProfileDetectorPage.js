import React, { useState, useEffect } from 'react';
import { useApp } from '../../context/AppContext';

/* ══════════════════════════════════════════════
   FAKE PROFILE DETECTOR
   Runs fraud checks and assigns trust scores
   Displays trust badges on profiles
══════════════════════════════════════════════ */

export function calculateFraudScore(worker, applications, allUsers) {
  let score = 0;
  const reasons = [];

  // 1. No face photo AND no profile completion
  if (!worker.facePhoto && !worker.bio) {
    score += 15; reasons.push('No face photo or bio');
  }

  // 2. Profile created and immediately applied to many jobs
  if (applications) {
    const workerApps = applications.filter(a => a.workerId === worker.id);
    const hourAgo    = Date.now() - 3600000;
    const recentApps = workerApps.filter(a => new Date(a.appliedAt).getTime() > hourAgo);
    if (recentApps.length > 8) {
      score += 20; reasons.push('Mass applying (bot behaviour)');
    }
  }

  // 3. Suspiciously low or high wage
  if (worker.dailyRate) {
    if (worker.dailyRate < 150) { score += 10; reasons.push('Suspiciously low wage'); }
    if (worker.dailyRate > 5000) { score += 10; reasons.push('Suspiciously high wage'); }
  }

  // 4. No verification at all
  if (!worker.facePhoto && !worker.interviewDone && !worker.videoBioSaved && !worker.voiceResumeDone) {
    score += 15; reasons.push('No AI verification completed');
  }

  // 5. Duplicate phone (simulated check)
  if (allUsers && worker.phone) {
    const samePhone = allUsers.filter(u => u.phone === worker.phone && u.id !== worker.id);
    if (samePhone.length > 0) { score += 30; reasons.push('Phone number used by multiple accounts'); }
  }

  return {
    score: Math.min(score, 100),
    level: score <= 20 ? 'low' : score <= 50 ? 'medium' : 'high',
    reasons,
  };
}

export function TrustBadge({ worker, applications, compact=false }) {
  const { fraudScore, level } = React.useMemo(() => {
    const r = calculateFraudScore(worker, applications, []);
    return { fraudScore: r.score, level: r.level };
  }, [worker?.id]);

  if (compact) {
    return (
      <span className={`badge ${level==='low'?'trust-verified':level==='medium'?'trust-unverified':'trust-flagged'}`} style={{ fontSize:11 }}>
        {level==='low'?'🟢 AI Verified':level==='medium'?'🟡 Unverified':'🔴 Flagged'}
      </span>
    );
  }

  return (
    <div style={{ display:'flex', alignItems:'center', gap:8 }}>
      <span className={`badge ${level==='low'?'trust-verified':level==='medium'?'trust-unverified':'trust-flagged'}`}>
        {level==='low'?'🟢 AI Verified':level==='medium'?'🟡 Unverified':'🔴 Suspicious'}
      </span>
      <span style={{ fontSize:11, color:'var(--text-faint)' }}>Trust: {100-fraudScore}%</span>
    </div>
  );
}

export default function FakeProfileDetectorPage() {
  const { workerProfile, applications } = useApp();
  const [running, setRunning] = useState(false);
  const [result, setResult]   = useState(null);

  async function runCheck() {
    if (!workerProfile) return;
    setRunning(true);
    await new Promise(r=>setTimeout(r,2000));
    const r = calculateFraudScore(workerProfile, applications, []);
    setResult(r);
    setRunning(false);
  }

  useEffect(() => { if (workerProfile) runCheck(); }, []);

  const completionItems = [
    { label:'Face Photo Uploaded',       done:!!workerProfile?.facePhoto,         points:25 },
    { label:'Video Bio Recorded',        done:!!workerProfile?.videoBioSaved,      points:20 },
    { label:'Voice Resume Done',         done:!!workerProfile?.voiceResumeDone,    points:15 },
    { label:'Interview Score Saved',     done:!!workerProfile?.interviewDone,      points:20 },
    { label:'Skills Added',              done:(workerProfile?.skills?.length||0)>0, points:10 },
    { label:'Work Experience Set',       done:!!workerProfile?.experience,         points:10 },
  ];

  const completionPct = Math.round(completionItems.filter(i=>i.done).reduce((s,i)=>s+i.points,0));
  const trustScore    = result ? 100 - result.score : 100 - (calculateFraudScore(workerProfile||{}, applications, []).score);
  const trustLevel    = result?.level || (calculateFraudScore(workerProfile||{}, applications, []).level);

  return (
    <div className="page" style={{ paddingBottom:80 }}>
      <div className="container" style={{ paddingTop:28, maxWidth:600 }}>
        <h1 style={{ fontSize:24, fontWeight:700, marginBottom:4 }}>🛡️ Trust Score & Verification</h1>
        <p style={{ color:'var(--text-muted)', fontSize:14, marginBottom:24 }}>AI checks your profile for fraud signals and assigns a trust score. Clients see this before hiring.</p>

        {/* Trust score gauge */}
        <div className="card" style={{ textAlign:'center', marginBottom:20, padding:32 }}>
          <div style={{ position:'relative', width:140, height:140, margin:'0 auto 16px' }}>
            <svg viewBox="0 0 140 140" style={{ width:'100%', height:'100%' }}>
              <circle cx="70" cy="70" r="58" fill="none" stroke="var(--gray-200)" strokeWidth="12" />
              <circle cx="70" cy="70" r="58" fill="none"
                stroke={trustLevel==='low'?'var(--success)':trustLevel==='medium'?'var(--warning)':'var(--danger)'}
                strokeWidth="12" strokeLinecap="round"
                strokeDasharray={`${(2*Math.PI*58)*trustScore/100} ${2*Math.PI*58}`}
                transform="rotate(-90 70 70)"
                style={{ transition:'stroke-dasharray 1s ease' }} />
            </svg>
            <div style={{ position:'absolute', inset:0, display:'flex', flexDirection:'column', alignItems:'center', justifyContent:'center' }}>
              <div style={{ fontSize:32, fontWeight:800, color:trustLevel==='low'?'var(--success)':trustLevel==='medium'?'var(--warning)':'var(--danger)' }}>{running?'...':trustScore}%</div>
              <div style={{ fontSize:11, fontWeight:700, color:'var(--text-muted)' }}>TRUST SCORE</div>
            </div>
          </div>

          <div className={`badge ${trustLevel==='low'?'trust-verified':trustLevel==='medium'?'trust-unverified':'trust-flagged'}`} style={{ fontSize:14, padding:'6px 16px', marginBottom:8 }}>
            {trustLevel==='low'?'🟢 AI Verified':trustLevel==='medium'?'🟡 Unverified':'🔴 Flagged — Review Required'}
          </div>
          <p style={{ fontSize:13, color:'var(--text-muted)' }}>
            {trustLevel==='low'?'Your profile looks authentic. Clients trust you more!':trustLevel==='medium'?'Complete your profile to get verified status.':'Please complete verification to restore trust.'}
          </p>
        </div>

        {/* Fraud signals */}
        {result && result.reasons.length > 0 && (
          <div className="alert alert-warning" style={{ marginBottom:20 }}>
            <div>
              <div style={{ fontWeight:700, marginBottom:6 }}>⚠️ Issues detected:</div>
              <ul style={{ paddingLeft:18, fontSize:13 }}>
                {result.reasons.map(r => <li key={r}>{r}</li>)}
              </ul>
            </div>
          </div>
        )}

        {/* Profile completeness */}
        <div className="ai-card" style={{ marginBottom:20 }}>
          <div style={{ display:'flex', justifyContent:'space-between', marginBottom:14 }}>
            <div style={{ fontWeight:700 }}>Profile Completeness</div>
            <div style={{ fontWeight:800, fontSize:18, color:'var(--saffron)' }}>{completionPct}%</div>
          </div>
          <div className="progress-wrap" style={{ marginBottom:16 }}>
            <div className="progress-fill" style={{ width:completionPct+'%', background:`linear-gradient(90deg,var(--saffron),var(--gold))` }} />
          </div>
          <div style={{ display:'flex', flexDirection:'column', gap:8 }}>
            {completionItems.map(item => (
              <div key={item.label} style={{ display:'flex', alignItems:'center', gap:10, fontSize:13 }}>
                <span style={{ width:20, height:20, borderRadius:'50%', background:item.done?'var(--success)':'var(--gray-200)', display:'flex', alignItems:'center', justifyContent:'center', color:item.done?'#fff':'var(--gray-400)', fontSize:11, fontWeight:700, flexShrink:0 }}>
                  {item.done?'✓':''}
                </span>
                <span style={{ flex:1, color:item.done?'var(--text-2)':'var(--text-muted)' }}>{item.label}</span>
                <span className={`badge ${item.done?'badge-green':'badge-gray'}`} style={{ fontSize:10 }}>+{item.points}pts</span>
              </div>
            ))}
          </div>
        </div>

        {/* How to improve */}
        <div className="card">
          <div style={{ fontWeight:600, fontSize:15, marginBottom:12 }}>🚀 Improve Your Trust Score</div>
          <div style={{ display:'flex', flexDirection:'column', gap:10, fontSize:13 }}>
            {!workerProfile?.facePhoto && <div style={{ display:'flex', gap:10, alignItems:'center' }}><span style={{ fontSize:18 }}>📸</span><span>Add face photo in <strong>Profile Setup</strong></span></div>}
            {!workerProfile?.videoBioSaved && <div style={{ display:'flex', gap:10, alignItems:'center' }}><span style={{ fontSize:18 }}>🎥</span><span>Record <strong>Video Bio</strong> (AI extracts skills)</span></div>}
            {!workerProfile?.voiceResumeDone && <div style={{ display:'flex', gap:10, alignItems:'center' }}><span style={{ fontSize:18 }}>🎤</span><span>Try <strong>Voice Resume</strong> to build profile</span></div>}
            {!workerProfile?.interviewDone && <div style={{ display:'flex', gap:10, alignItems:'center' }}><span style={{ fontSize:18 }}>🎯</span><span>Complete <strong>AI Interview</strong> for score badge</span></div>}
            {completionPct===100 && <div className="alert alert-success" style={{ margin:0 }}>🎉 Profile 100% complete! You have maximum trust.</div>}
          </div>
        </div>
      </div>
    </div>
  );
}
