import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { checkAttendanceFraud } from '../services/api';
import FaceVerification from '../components/FaceVerification';
import VoiceAssistant from '../components/VoiceAssistant';

export default function AttendancePage() {
  const { user, workerProfile, jobs, applications, attendance, markAttendance } = useApp();
  const [step, setStep]   = useState('select'); // select | face | done
  const [selJob, setSelJob] = useState(null);
  const [note, setNote]   = useState('');
  const [faceScore, setFaceScore] = useState(null);
  const [toast, setToast] = useState({ msg:'', type:'' });

  const today    = new Date().toLocaleDateString('en-IN',{ weekday:'long', year:'numeric', month:'long', day:'numeric' });
  const todayKey = new Date().toISOString().split('T')[0];

  const hiredApps  = applications.filter(a => a.workerId===user?.id && a.status==='hired');
  const activeJobs = jobs.filter(j => hiredApps.some(a => a.jobId===j.id) && ['assigned','in_progress','open'].includes(j.status));
  const myRecords  = attendance.filter(a => a.workerId===user?.id).sort((a,b) => new Date(b.createdAt)-new Date(a.createdAt));

  function showToast(msg, type='success') { setToast({msg,type}); setTimeout(()=>setToast({msg:'',type:''}),4000); }

  function handleSelectJob(job) {
    const fraud = checkAttendanceFraud(attendance, job.id, user?.id);
    if (fraud.fraud) { showToast(`⚠️ ${fraud.reason}`, 'error'); return; }
    setSelJob(job); setStep('face');
  }

  function handleFaceVerified(score, passed) {
    setFaceScore(score);
    if (!passed) { showToast(`❌ Face verification failed (${score}% match). Try again.`, 'error'); setTimeout(()=>setStep('select'),3000); return; }
    saveAttendance(score);
  }

  function saveAttendance(score) {
    const result = markAttendance({ jobId:selJob?.id||'demo', jobTitle:selJob?.title||'Demo Job', workerId:user?.id, workerName:workerProfile?.name||'Worker', faceScore:score, faceVerified:true, note });
    if (result?.error) { showToast(`❌ ${result.error}`, 'error'); setStep('select'); }
    else { setStep('done'); showToast(`✅ Attendance marked! Face match: ${score}%`); }
  }

  function reset() { setStep('select'); setSelJob(null); setNote(''); setFaceScore(null); }

  return (
    <div className="page-wrapper" style={{ paddingBottom:90 }}>
      <div className="container" style={{ paddingTop:24, maxWidth:600 }}>
        <h1 style={{ fontFamily:'var(--font-display)', fontSize:26, marginBottom:2 }}>📸 Attendance</h1>
        <p style={{ color:'var(--text-muted)', fontSize:14, marginBottom:20 }}>{today}</p>

        {toast.msg && <div className={`alert alert-${toast.type==='error'?'error':'success'}`}>{toast.msg}</div>}

        {/* STEP 1: Select Job */}
        {step==='select' && (
          <div className="card" style={{ marginBottom:20 }}>
            <h3 style={{ fontSize:17, marginBottom:14 }}>📋 Select Active Job</h3>
            {activeJobs.length===0 ? (
              <div>
                <div style={{ textAlign:'center', padding:'20px', color:'var(--text-muted)' }}>
                  <div style={{ fontSize:40, marginBottom:8 }}>💼</div>
                  <p>No active hired jobs found.</p>
                  <p style={{ fontSize:13 }}>You need to be hired for a job first.</p>
                </div>
                <button className="btn btn-outline btn-full" style={{ marginTop:8 }} onClick={() => { setSelJob({ id:'demo', title:'Demo Job' }); setStep('face'); }}>
                  📸 Demo: Mark Attendance
                </button>
              </div>
            ) : (
              activeJobs.map(job => {
                const markedToday = attendance.some(a => a.jobId===job.id && a.workerId===user?.id && a.date===todayKey);
                return (
                  <div key={job.id} onClick={() => !markedToday&&handleSelectJob(job)} style={{ border:`2px solid ${markedToday?'#86efac':'var(--border)'}`, borderRadius:12, padding:14, marginBottom:10, cursor:markedToday?'default':'pointer', background:markedToday?'#dcfce7':'#fff', transition:'all .15s' }}>
                    <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center' }}>
                      <div>
                        <div style={{ fontWeight:700, fontSize:15 }}>{job.title}</div>
                        <div style={{ fontSize:13, color:'var(--text-muted)' }}>📍 {job.location} | 💰 ₹{job.pay}/{job.payType}</div>
                      </div>
                      {markedToday ? <span className="badge badge-green">✅ Done Today</span> : <span className="badge badge-orange">Mark Now →</span>}
                    </div>
                  </div>
                );
              })
            )}
          </div>
        )}

        {/* STEP 2: Face Verification */}
        {step==='face' && (
          <div className="card" style={{ marginBottom:20 }}>
            <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:14 }}>
              <h3 style={{ fontSize:17 }}>🤖 AI Face Verification</h3>
              <button onClick={reset} style={{ background:'none', border:'none', cursor:'pointer', fontSize:20, color:'var(--text-muted)' }}>✕</button>
            </div>
            {selJob && (
              <div style={{ background:'var(--bg)', borderRadius:10, padding:10, marginBottom:12, fontSize:13 }}>
                <strong>Job:</strong> {selJob.title} &nbsp;|&nbsp; <strong>Date:</strong> {todayKey}
              </div>
            )}
            <div className="alert alert-info" style={{ fontSize:12, marginBottom:14 }}>
              🤖 Your live selfie will be compared with your profile photo. Minimum 55% match required.
            </div>
            <FaceVerification mode="verify" referenceImage={workerProfile?.facePhoto||null} threshold={0.55} onVerified={handleFaceVerified} onError={() => { showToast('⚠️ AI unavailable — using simulated verification'); }} />
            <div className="form-group" style={{ marginTop:14 }}>
              <label className="form-label">Work Note (optional)</label>
              <input className="form-input" placeholder="e.g. Completed 2 rooms today" value={note} onChange={e=>setNote(e.target.value)} />
            </div>
          </div>
        )}

        {/* STEP 3: Done */}
        {step==='done' && (
          <div className="card" style={{ marginBottom:20, textAlign:'center', background:'linear-gradient(135deg,#dcfce7,#bbf7d0)', border:'1px solid #86efac' }}>
            <div style={{ fontSize:60, marginBottom:8 }}>✅</div>
            <h3 style={{ color:'#15803d', marginBottom:4 }}>Attendance Marked!</h3>
            {faceScore!==null && <p style={{ fontSize:14, color:'#166534' }}>Face match: <strong>{faceScore}%</strong></p>}
            <p style={{ fontSize:13, color:'#166534', marginBottom:16 }}>{todayKey} | {new Date().toLocaleTimeString('en-IN')}</p>
            <button className="btn btn-success" onClick={reset}>Mark Another Day</button>
          </div>
        )}

        {/* History */}
        <div>
          <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:12 }}>
            <h3 style={{ fontSize:17 }}>📅 Attendance History</h3>
            <span style={{ fontSize:13, color:'var(--text-muted)' }}>{myRecords.length} record(s)</span>
          </div>
          {myRecords.length===0
            ? <div className="empty-state" style={{ padding:'24px' }}><span className="emoji" style={{ fontSize:36 }}>📭</span><p>No records yet</p></div>
            : myRecords.map(r => (
              <div key={r.id} className="card fade-in" style={{ marginBottom:10, padding:14 }}>
                <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', flexWrap:'wrap', gap:8 }}>
                  <div>
                    <div style={{ fontWeight:700 }}>{r.jobTitle||'Job'}</div>
                    <div style={{ fontSize:13, color:'var(--text-muted)' }}>📅 {r.date} &nbsp; 🕐 {r.time}</div>
                    {r.note && <div style={{ fontSize:13, color:'var(--text-muted)' }}>📝 {r.note}</div>}
                  </div>
                  <div style={{ textAlign:'right' }}>
                    <span className="badge badge-green">✅ Present</span>
                    {r.faceScore!=null && <div style={{ fontSize:11, color:'var(--text-muted)', marginTop:3 }}>Face: {r.faceScore}%</div>}
                  </div>
                </div>
              </div>
            ))
          }
        </div>

        {myRecords.length > 0 && (
          <div className="card" style={{ marginTop:16, background:'linear-gradient(135deg,#dcfce7,#bbf7d0)', border:'1px solid #86efac' }}>
            <h3 style={{ fontSize:15, color:'#15803d', marginBottom:6 }}>🎉 Ready to Submit Work?</h3>
            <p style={{ fontSize:13, color:'#166534', marginBottom:12 }}>{myRecords.length} verified attendance day(s) on record.</p>
            <button className="btn btn-success btn-full" onClick={() => window.location.href='/worker/submit-work'}>📤 Submit Work Completion</button>
          </div>
        )}
      </div>
      <VoiceAssistant />
    </div>
  );
}
