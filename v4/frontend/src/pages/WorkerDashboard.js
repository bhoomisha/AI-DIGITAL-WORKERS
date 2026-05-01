import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useApp } from '../context/AppContext';
import { calculateMatchScore } from '../services/api';
import JobCard from '../components/JobCard';
import VoiceAssistant from '../components/VoiceAssistant';

function getGreeting() {
  const h = new Date().getHours();
  return h < 12 ? 'morning' : h < 17 ? 'afternoon' : 'evening';
}

function TrustBadgeInline({ workerProfile, myApps }) {
  let score = 0;
  if (!workerProfile?.facePhoto && !workerProfile?.bio) score += 15;
  if ((myApps||[]).filter(a => new Date(a.appliedAt).getTime() > Date.now()-3600000).length > 8) score += 20;
  if (!workerProfile?.facePhoto && !workerProfile?.interviewDone && !workerProfile?.videoBioSaved) score += 15;
  const trustScore = 100 - score;
  const level = trustScore >= 80 ? 'low' : trustScore >= 55 ? 'medium' : 'high';
  return (
    <span className={`badge ${level==='low'?'trust-verified':level==='medium'?'trust-unverified':'trust-flagged'}`} style={{ fontSize:11 }}>
      {level==='low'?'🟢 AI Verified':level==='medium'?'🟡 Unverified':'🔴 Flagged'}
    </span>
  );
}

export default function WorkerDashboard() {
  const { jobs, applications, workerProfile, user, attendance, getUserRating, notifications } = useApp();
  const navigate = useNavigate();

  const rating   = getUserRating(user?.id);
  const myApps   = applications.filter(a => a.workerId === user?.id);
  const hired    = myApps.filter(a => a.status === 'hired');
  const myAttend = attendance.filter(a => a.workerId === user?.id);
  const unread   = notifications.filter(n => n.userId === user?.id && !n.is_read);

  const CHECKS = [
    { label:'Face Photo',    done:!!workerProfile?.facePhoto,          points:25 },
    { label:'Skills',        done:(workerProfile?.skills?.length||0)>0, points:15 },
    { label:'Experience',    done:!!workerProfile?.experience,          points:10 },
    { label:'Video Bio',     done:!!workerProfile?.videoBioSaved,       points:20 },
    { label:'Voice Resume',  done:!!workerProfile?.voiceResumeDone,     points:15 },
    { label:'Interview',     done:!!workerProfile?.interviewDone,       points:15 },
  ];
  const completionPct = CHECKS.filter(c=>c.done).reduce((s,c)=>s+c.points,0);

  const AI_FEATURES = [
    { label:'Video Bio',    done:!!workerProfile?.videoBioSaved,  path:'/worker/video-bio',   icon:'🎥', desc:'AI extracts skills from speech' },
    { label:'Voice Resume', done:!!workerProfile?.voiceResumeDone,path:'/worker/voice-resume',icon:'🎤', desc:'Speak Hindi → get profile' },
    { label:'AI Interview', done:!!workerProfile?.interviewDone,  path:'/worker/interview',   icon:'🎯', desc:'Score badge shown to clients' },
    { label:'Trust Score',  done:completionPct>=70,               path:'/worker/trust-score', icon:'🛡️', desc:'See your fraud risk level' },
  ];

  const topJobs = jobs
    .filter(j => j.status === 'open')
    .map(j => ({ ...j, matchScore: calculateMatchScore({ job:j, worker:workerProfile||{} }) }))
    .sort((a,b) => b.matchScore - a.matchScore)
    .slice(0, 3);

  const activity = [
    ...myApps.map(a => ({ time:a.appliedAt, text:'Applied to job', color:'var(--brand)' })),
    ...myAttend.map(a => ({ time:a.createdAt, text:`Attendance: ${a.jobTitle||'Job'} (${a.faceScore||'—'}%)`, color:'var(--success)' })),
  ].sort((a,b) => new Date(b.time)-new Date(a.time)).slice(0,5);

  const name = workerProfile?.name || user?.phone || 'Worker';

  return (
    <div className="page" style={{ paddingBottom:100 }}>
      <div className="container" style={{ paddingTop:24 }}>

        {unread.length > 0 && (
          <div className="alert alert-info" style={{ marginBottom:16 }}>
            🔔 {unread.length} new — <button onClick={()=>navigate('/notifications')} style={{ background:'none',border:'none',color:'var(--info)',fontWeight:700,cursor:'pointer' }}>View →</button>
          </div>
        )}

        {/* Header */}
        <div style={{ display:'flex', justifyContent:'space-between', alignItems:'flex-start', flexWrap:'wrap', gap:16, marginBottom:24 }}>
          <div style={{ display:'flex', alignItems:'center', gap:14 }}>
            {workerProfile?.facePhoto
              ? <img src={workerProfile.facePhoto} alt="profile" style={{ width:56, height:56, borderRadius:'50%', objectFit:'cover', border:'2px solid var(--saffron)' }} />
              : <div className="avatar" style={{ width:56, height:56, fontSize:22, background:'var(--saffron)' }}>{name[0]?.toUpperCase()}</div>
            }
            <div>
              <h1 style={{ fontSize:22, fontWeight:700, marginBottom:3 }}>Good {getGreeting()}, {name.split(' ')[0]}!</h1>
              <div style={{ display:'flex', alignItems:'center', gap:8, flexWrap:'wrap' }}>
                <span style={{ color:'var(--text-muted)', fontSize:13 }}>📍 {workerProfile?.location||'Location not set'}</span>
                {rating && <span style={{ fontSize:12, color:'#d97706', fontWeight:600 }}>⭐ {rating.average}</span>}
                <TrustBadgeInline workerProfile={workerProfile} myApps={myApps} />
              </div>
            </div>
          </div>
          {workerProfile?.interviewScore?.overall && (
            <div className="interview-badge">
              🎯 Interview Score: <strong style={{ fontSize:15 }}>{workerProfile.interviewScore.overall}%</strong>
            </div>
          )}
        </div>

        {/* Stats */}
        <div className="grid-4" style={{ marginBottom:24 }}>
          {[
            { icon:'📋', label:'Applications', value:myApps.length,   bg:'#eff6ff' },
            { icon:'✅', label:'Hired',         value:hired.length,    bg:'#f0fdf4' },
            { icon:'📅', label:'Days Worked',   value:myAttend.length, bg:'#fefce8' },
            { icon:'⭐', label:'Rating',         value:rating?`${rating.average}/5`:'—', bg:'#fdf4ff' },
          ].map(s => (
            <div key={s.label} className="stat-card">
              <div className="stat-card__icon" style={{ background:s.bg }}>{s.icon}</div>
              <div className="stat-card__value">{s.value}</div>
              <div className="stat-card__label">{s.label}</div>
            </div>
          ))}
        </div>

        {/* Profile Completeness */}
        <div className="card" style={{ marginBottom:20 }}>
          <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:10 }}>
            <span style={{ fontWeight:700, fontSize:14 }}>📊 Profile Completeness</span>
            <span style={{ fontWeight:800, fontSize:18, color:completionPct>=80?'var(--success)':completionPct>=50?'var(--warning)':'var(--danger)' }}>{completionPct}%</span>
          </div>
          <div className="progress-wrap" style={{ marginBottom:10 }}>
            <div className="progress-fill" style={{ width:`${completionPct}%`, background:'linear-gradient(90deg,var(--saffron),var(--gold))' }} />
          </div>
          <div style={{ display:'flex', gap:5, flexWrap:'wrap' }}>
            {CHECKS.map(c => (
              <span key={c.label} className={`badge ${c.done?'badge-green':'badge-gray'}`} style={{ fontSize:10 }}>
                {c.done?'✓':'+'}{c.done?'':c.points+'%'} {c.label}
              </span>
            ))}
          </div>
        </div>

        {/* AI Features Panel */}
        <div className="ai-card" style={{ marginBottom:24 }}>
          <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:14 }}>
            <span style={{ fontWeight:700, fontSize:15 }}>⚡ AI Features</span>
            <span style={{ fontSize:11, color:'var(--text-muted)' }}>Complete all → higher match scores</span>
          </div>
          <div style={{ display:'grid', gridTemplateColumns:'repeat(2,1fr)', gap:10 }}>
            {AI_FEATURES.map(f => (
              <button key={f.label} onClick={() => navigate(f.path)}
                style={{ display:'flex', alignItems:'center', gap:10, padding:'12px 14px', borderRadius:10, border:`1.5px solid ${f.done?'var(--success-ring)':'var(--border)'}`, background:f.done?'var(--success-bg)':'#fff', cursor:'pointer', textAlign:'left', transition:'all .15s' }}
                onMouseEnter={e=>{ if(!f.done) e.currentTarget.style.borderColor='var(--saffron)'; }}
                onMouseLeave={e=>{ if(!f.done) e.currentTarget.style.borderColor='var(--border)'; }}>
                <span style={{ fontSize:20 }}>{f.icon}</span>
                <div>
                  <div style={{ fontWeight:600, fontSize:13, color:f.done?'var(--success)':'var(--text-2)' }}>{f.label}</div>
                  <div style={{ fontSize:11, color:f.done?'#16a34a':'var(--text-muted)' }}>{f.done?'✅ Done':f.desc}</div>
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* Quick actions */}
        <div style={{ display:'flex', gap:10, flexWrap:'wrap', marginBottom:28 }}>
          <button className="btn btn-primary" onClick={() => navigate('/worker/jobs')}>🔍 Find Jobs</button>
          <button className="btn btn-ghost"   onClick={() => navigate('/worker/applications')}>📋 Applications</button>
          <button className="btn btn-ghost"   onClick={() => navigate('/worker/attendance')}>📸 Attendance</button>
          <button className="btn btn-ghost"   onClick={() => navigate('/worker/submit-work')}>📤 Submit Work</button>
          <button className="btn btn-ghost btn-sm" onClick={() => navigate('/heatmap')} style={{ borderColor:'var(--saffron)', color:'var(--saffron)' }}>📍 Heatmap</button>
        </div>

        <div style={{ display:'grid', gridTemplateColumns:'1fr 300px', gap:24, alignItems:'start' }}>
          <div>
            <div className="section-header">
              <span className="section-title">🎯 Top Matches For You</span>
              <button className="btn btn-ghost btn-sm" onClick={() => navigate('/worker/jobs')}>See all →</button>
            </div>
            {topJobs.length===0
              ? <div className="card"><div className="empty"><span className="empty__icon">💼</span><div className="empty__title">No jobs available</div><div className="empty__text">Check back soon!</div></div></div>
              : topJobs.map(job => <JobCard key={job.id} job={job} matchScore={job.matchScore} showApply applied={myApps.some(a=>a.jobId===job.id)} onApply={()=>navigate('/worker/jobs')} />)
            }
          </div>

          <div>
            <div className="card" style={{ marginBottom:16 }}>
              <div style={{ display:'flex', justifyContent:'space-between', marginBottom:10 }}>
                <span style={{ fontWeight:600, fontSize:14 }}>Your Skills</span>
                <span className={`badge ${workerProfile?.availability==='available'?'badge-green':'badge-red'}`}>{workerProfile?.availability==='available'?'🟢 Available':'🔴 Busy'}</span>
              </div>
              <div style={{ display:'flex', flexWrap:'wrap', gap:5, marginBottom:8 }}>
                {(workerProfile?.skills||[]).map(s => <span key={s} className="badge badge-blue">{s}</span>)}
                {!workerProfile?.skills?.length && <span style={{ fontSize:12,color:'var(--text-muted)' }}>No skills added yet</span>}
              </div>
              <div style={{ fontSize:13, color:'var(--text-muted)' }}>🛠 {workerProfile?.experience||0} yrs · ₹{workerProfile?.dailyRate||0}/day</div>
            </div>

            <div className="card">
              <span style={{ fontWeight:600, fontSize:14, display:'block', marginBottom:12 }}>Recent Activity</span>
              {activity.length===0
                ? <p style={{ fontSize:13, color:'var(--text-muted)' }}>No activity yet.</p>
                : activity.map((a,i) => (
                  <div key={i} className="feed-item">
                    <div className="feed-dot" style={{ background:a.color }} />
                    <div style={{ flex:1 }}>
                      <div style={{ fontSize:13, color:'var(--text-2)' }}>{a.text}</div>
                      <div style={{ fontSize:11, color:'var(--text-faint)', marginTop:1 }}>{new Date(a.time).toLocaleString('en-IN',{dateStyle:'short',timeStyle:'short'})}</div>
                    </div>
                  </div>
                ))
              }
            </div>
          </div>
        </div>

      </div>
      <VoiceAssistant />
    </div>
  );
}
