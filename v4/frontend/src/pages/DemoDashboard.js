import React, { useState, useRef, useEffect, useCallback } from 'react';
import { useApp } from '../context/AppContext';
import {
  calculateMatchScore, matchColor, matchLabel,
  verifyWorkCompletion, calculatePayment, checkAttendanceFraud
} from '../services/api';

/* ══════════════════════════════════════════════
   FULL FEATURED DEMO DASHBOARD
   - Worker: Profile, Jobs, Apply, Attendance (with photo), Submit Work
   - Client: Post Job, Review Applicants, Approve/Reject Work, Payment, Reviews
   - AI Work Verification (realistic scores, not always 99%)
   - Client manual approve option always available
   - Ratings & Reviews for both sides
   Title: "Live Demo Dashboard" (no "Supervisor Mode")
══════════════════════════════════════════════ */

const SKILLS_LIST = ['Painting','Electrician','Plumbing','Carpentry','AC Technician','Masonry','Cleaning'];
const DEMO_WORKER = { id:'demo-worker', name:'Raju Mistri', skills:['Painting','Wall Finishing'], experience:5, rating:null, availability:'available', location:'Vasundhara', phone:'9876543210' };

// ── Helpers ──────────────────────────────────
function ScoreRing({ score, size=44 }) {
  const color = matchColor(score);
  const label = matchLabel(score);
  return (
    <div style={{ textAlign:'center' }}>
      <div style={{ width:size, height:size, borderRadius:'50%', background:color, display:'flex', alignItems:'center', justifyContent:'center', color:'#fff', fontSize:size*0.24, fontWeight:800 }}>{score}%</div>
      <div style={{ fontSize:9, color, fontWeight:800, marginTop:2 }}>{label.toUpperCase()}</div>
    </div>
  );
}

function Toast({ msg }) {
  if (!msg) return null;
  return (
    <div style={{ position:'fixed', top:58, left:'50%', transform:'translateX(-50%)', background:'#1e293b', color:'#f1f5f9', padding:'9px 20px', borderRadius:99, fontSize:13, fontWeight:700, zIndex:999, border:'1px solid #2563eb', boxShadow:'0 4px 20px rgba(0,0,0,.4)', whiteSpace:'nowrap' }}>
      {msg}
    </div>
  );
}

function SectionHead({ title, sub }) {
  return (
    <div style={{ padding:'10px 14px', borderBottom:'1px solid #e2e8f0', background:'#f8fafc', flexShrink:0 }}>
      <div style={{ fontWeight:700, fontSize:13, color:'#0f172a' }}>{title}</div>
      {sub && <div style={{ fontSize:11, color:'#64748b', marginTop:1 }}>{sub}</div>}
    </div>
  );
}

// ══════════════════════════════════════════════
// WORKER PANEL — Full features
// ══════════════════════════════════════════════
function WorkerPanel({ jobs, applications, attendance, workCompletions, reviews, onApply, onAttend, onSubmitWork, onReview }) {
  const [tab, setTab]       = useState('profile');
  const [desc, setDesc]     = useState('');
  const [photo, setPhoto]   = useState(null);
  const [preview, setPrev]  = useState(null);
  const [rating, setRating] = useState(0);
  const [revText, setRevText] = useState('');
  const [revTarget, setRevTarget] = useState('');
  const fileRef = useRef();

  const myApps    = applications.filter(a => a.workerId === 'demo-worker');
  const appliedIds = myApps.map(a => a.jobId);
  const hiredApps  = myApps.filter(a => a.status === 'hired');
  const today      = new Date().toISOString().split('T')[0];
  const myAttend   = attendance.filter(a => a.workerId === 'demo-worker');
  const myPay      = workCompletions.filter(w => w.workerId === 'demo-worker' && w.status === 'approved');
  const myReviews  = reviews.filter(r => r.type === 'worker-to-client' && r.reviewerId === 'demo-worker');

  function handleFileChange(e) {
    const f = e.target.files[0];
    if (!f) return;
    setPhoto(f);
    setPrev(URL.createObjectURL(f));
  }

  async function handleSubmit(jobId, title) {
    onSubmitWork(jobId, title, desc, preview);
    setDesc(''); setPhoto(null); setPrev(null);
    if (fileRef.current) fileRef.current.value = '';
  }

  function handleReviewSubmit() {
    if (!rating || !revTarget) return;
    onReview({ reviewerId:'demo-worker', reviewerName:'Raju Mistri', targetId:revTarget, targetName:revTarget, rating, comment:revText, type:'worker-to-client', jobTitle:'Demo Job' });
    setRating(0); setRevText(''); setRevTarget('');
  }

  const TABS = [
    { id:'profile', label:'👤' },
    { id:'jobs',    label:'🔍' },
    { id:'apps',    label:'📋' },
    { id:'attend',  label:'📸' },
    { id:'submit',  label:'📤' },
    { id:'review',  label:'⭐' },
  ];

  return (
    <div style={{ display:'flex', flexDirection:'column', height:'100%', background:'#fff', overflow:'hidden' }}>
      {/* Header */}
      <div style={{ background:'linear-gradient(135deg,#1d4ed8,#3b82f6)', padding:'10px 14px', color:'#fff', flexShrink:0 }}>
        <div style={{ display:'flex', alignItems:'center', gap:8 }}>
          <div style={{ width:32, height:32, borderRadius:'50%', background:'rgba(255,255,255,.2)', display:'flex', alignItems:'center', justifyContent:'center', fontWeight:800, fontSize:13 }}>R</div>
          <div><div style={{ fontWeight:700, fontSize:13 }}>👷 Raju Mistri</div><div style={{ fontSize:10, opacity:.8 }}>Worker Demo</div></div>
        </div>
      </div>
      {/* Tab bar */}
      <div style={{ display:'flex', background:'#f1f5f9', borderBottom:'1px solid #e2e8f0', flexShrink:0 }}>
        {TABS.map(t => (
          <button key={t.id} onClick={() => setTab(t.id)} title={t.id} style={{ flex:1, padding:'8px 2px', border:'none', background:tab===t.id?'#fff':'transparent', color:tab===t.id?'#1d4ed8':'#64748b', fontWeight:tab===t.id?700:500, fontSize:16, cursor:'pointer', borderBottom:tab===t.id?'2px solid #1d4ed8':'2px solid transparent', transition:'all .15s' }}>
            {t.label}
          </button>
        ))}
      </div>
      {/* Content */}
      <div style={{ flex:1, overflowY:'auto', padding:'10px' }}>

        {/* PROFILE */}
        {tab==='profile' && (
          <div>
            <div style={{ background:'linear-gradient(135deg,#eff6ff,#dbeafe)', borderRadius:12, padding:14, marginBottom:12, textAlign:'center' }}>
              <div style={{ width:56, height:56, borderRadius:'50%', background:'#1d4ed8', display:'flex', alignItems:'center', justifyContent:'center', color:'#fff', fontWeight:800, fontSize:22, margin:'0 auto 8px' }}>R</div>
              <div style={{ fontWeight:700, fontSize:15 }}>Raju Mistri</div>
              <div style={{ fontSize:12, color:'#64748b' }}>📍 Vasundhara · 📱 9876543210</div>
            </div>
            <div style={{ display:'flex', flexWrap:'wrap', gap:5, marginBottom:10 }}>
              {DEMO_WORKER.skills.map(s => <span key={s} style={{ background:'#eff6ff', color:'#1d4ed8', padding:'3px 9px', borderRadius:99, fontSize:11, fontWeight:600 }}>{s}</span>)}
            </div>
            <div style={{ fontSize:12, color:'#64748b', display:'flex', flexDirection:'column', gap:4 }}>
              <span>🛠 {DEMO_WORKER.experience} years experience</span>
              <span>✅ {myApps.filter(a=>a.status==='hired').length} hired jobs</span>
              <span>📅 {myAttend.length} attendance records</span>
              <span>⭐ No ratings yet (complete jobs to earn)</span>
            </div>
          </div>
        )}

        {/* FIND JOBS */}
        {tab==='jobs' && (
          <div>
            <div style={{ fontSize:11, color:'#64748b', marginBottom:8 }}>AI-ranked jobs matching your skills</div>
            {/* FIX 4: Show ALL open jobs including ones just posted by demo-client */}
            {jobs.filter(j => j.status==='open').length === 0
              ? <div style={{ textAlign:'center', padding:20, color:'#64748b', fontSize:12 }}>No open jobs yet.<br/>Ask client to post a job first (Step 1).</div>
              : [...jobs.filter(j => j.status==='open')].sort((a,b) => {
                  // Show newest demo-client jobs FIRST so worker sees them immediately
                  if (a.clientId==='demo-client' && b.clientId!=='demo-client') return -1;
                  if (b.clientId==='demo-client' && a.clientId!=='demo-client') return 1;
                  return new Date(b.postedAt) - new Date(a.postedAt);
                }).map(job => {
                const score   = calculateMatchScore({ job, worker:DEMO_WORKER });
                const applied = appliedIds.includes(job.id);
                return (
                  <div key={job.id} style={{ border:'1px solid #e2e8f0', borderRadius:10, padding:10, marginBottom:8 }}>
                    <div style={{ display:'flex', justifyContent:'space-between', gap:8 }}>
                      <div style={{ flex:1 }}>
                        <div style={{ fontWeight:600, fontSize:13, marginBottom:2 }}>{job.title}</div>
                        <div style={{ fontSize:11, color:'#64748b', marginBottom:4 }}>
                          📍 {job.location} · {job.payType==='fixed'?'₹'+job.pay+' fixed':'₹'+job.pay+'/day'} · {job.distance}km
                        </div>
                        <div style={{ display:'flex', gap:3, flexWrap:'wrap' }}>
                          {(job.skills||[]).map(s => <span key={s} style={{ background:'#eff6ff', color:'#1d4ed8', padding:'1px 6px', borderRadius:99, fontSize:10, fontWeight:600 }}>{s}</span>)}
                        </div>
                      </div>
                      <ScoreRing score={score} size={44} />
                    </div>
                    {/* Score bar */}
                    <div style={{ height:4, background:'#e2e8f0', borderRadius:99, overflow:'hidden', margin:'8px 0 6px' }}>
                      <div style={{ height:'100%', width:score+'%', background:matchColor(score), borderRadius:99 }} />
                    </div>
                    {applied
                      ? <span style={{ fontSize:11, color:'#16a34a', fontWeight:700 }}>✅ Applied</span>
                      : <button onClick={() => onApply(job.id, score)} style={{ padding:'5px 12px', background:'#1d4ed8', color:'#fff', border:'none', borderRadius:6, fontSize:11, fontWeight:600, cursor:'pointer' }}>Apply Now</button>
                    }
                  </div>
                );
              })
            }
          </div>
        )}

        {/* MY APPLICATIONS */}
        {tab==='apps' && (
          <div>
            {myApps.length===0
              ? <div style={{ textAlign:'center', padding:20, color:'#64748b', fontSize:12 }}>No applications yet. Go to Jobs tab.</div>
              : myApps.map(app => {
                const job = jobs.find(j=>j.id===app.jobId);
                return (
                  <div key={app.id} style={{ border:'1px solid #e2e8f0', borderRadius:10, padding:10, marginBottom:8 }}>
                    <div style={{ fontWeight:600, fontSize:13 }}>{job?.title||'Job'}</div>
                    <div style={{ fontSize:11, color:'#64748b', margin:'2px 0 6px' }}>{new Date(app.appliedAt).toLocaleString('en-IN',{dateStyle:'short',timeStyle:'short'})}</div>
                    <span style={{ padding:'3px 9px', borderRadius:99, fontSize:11, fontWeight:700, background:app.status==='hired'?'#f0fdf4':app.status==='rejected'?'#fef2f2':'#fefce8', color:app.status==='hired'?'#16a34a':app.status==='rejected'?'#dc2626':'#d97706' }}>
                      {app.status==='hired'?'✅ Hired':app.status==='rejected'?'❌ Rejected':'⏳ Pending'}
                    </span>
                  </div>
                );
              })
            }
          </div>
        )}

        {/* ATTENDANCE */}
        {tab==='attend' && (
          <div>
            {hiredApps.length===0
              ? <div style={{ textAlign:'center', padding:20, color:'#64748b', fontSize:12 }}>Get hired first to mark attendance.</div>
              : hiredApps.map(app => {
                const job    = jobs.find(j=>j.id===app.jobId);
                const marked = attendance.some(a=>a.jobId===app.jobId&&a.workerId==='demo-worker'&&a.date===today);
                const jobAtt = attendance.filter(a=>a.jobId===app.jobId&&a.workerId==='demo-worker');
                return (
                  <div key={app.id} style={{ border:'1px solid #e2e8f0', borderRadius:10, padding:10, marginBottom:12 }}>
                    <div style={{ fontWeight:600, fontSize:13, marginBottom:6 }}>{job?.title}</div>
                    {!marked && (
                      <div>
                        {/* Photo upload */}
                        <div onClick={() => fileRef.current?.click()} style={{ border:'2px dashed #e2e8f0', borderRadius:8, padding:preview?0:'20px 10px', textAlign:'center', cursor:'pointer', background:'#f8fafc', marginBottom:8, overflow:'hidden' }}>
                          {preview
                            ? <img src={preview} alt="attendance" style={{ width:'100%', maxHeight:120, objectFit:'cover', borderRadius:6 }} />
                            : <div style={{ fontSize:11, color:'#64748b' }}>📷 Tap to add photo<br/>(simulates face verification)</div>
                          }
                        </div>
                        <input ref={fileRef} type="file" accept="image/*" style={{ display:'none' }} onChange={handleFileChange} />
                        <button onClick={() => onAttend(app.jobId, job?.title, preview)} style={{ width:'100%', padding:'7px', background:'#1d4ed8', color:'#fff', border:'none', borderRadius:7, fontSize:12, fontWeight:700, cursor:'pointer' }}>
                          📸 Mark Attendance {preview?'(with photo)':'(simulated)'}
                        </button>
                      </div>
                    )}
                    {marked && <div style={{ fontSize:11, color:'#16a34a', fontWeight:700, marginBottom:6 }}>✅ Marked today</div>}
                    {/* History */}
                    {jobAtt.length > 0 && (
                      <div style={{ marginTop:8 }}>
                        <div style={{ fontSize:10, color:'#64748b', fontWeight:700, marginBottom:4 }}>HISTORY ({jobAtt.length} days)</div>
                        {jobAtt.map(r => (
                          <div key={r.id} style={{ display:'flex', justifyContent:'space-between', alignItems:'center', fontSize:11, padding:'3px 0', borderBottom:'1px solid #f1f5f9' }}>
                            <span style={{ color:'#374151' }}>{r.date} {r.time}</span>
                            <div style={{ display:'flex', alignItems:'center', gap:6 }}>
                              {r.photoUrl && <img src={r.photoUrl} alt="att" style={{ width:24, height:24, borderRadius:4, objectFit:'cover' }} />}
                              <span style={{ color:'#16a34a', fontWeight:700 }}>✅ {r.faceScore?r.faceScore+'%':''}</span>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                );
              })
            }
          </div>
        )}

        {/* SUBMIT WORK */}
        {tab==='submit' && (
          <div>
            {hiredApps.length===0
              ? <div style={{ textAlign:'center', padding:20, color:'#64748b', fontSize:12 }}>Get hired first to submit work.</div>
              : hiredApps.map(app => {
                const job = jobs.find(j=>j.id===app.jobId);
                const wc  = workCompletions.find(w=>w.jobId===app.jobId&&w.workerId==='demo-worker');
                const att = attendance.filter(a=>a.jobId===app.jobId&&a.workerId==='demo-worker').length;
                return (
                  <div key={app.id} style={{ border:'1px solid #e2e8f0', borderRadius:10, padding:10, marginBottom:12 }}>
                    <div style={{ fontWeight:600, fontSize:13, marginBottom:6 }}>{job?.title}</div>
                    <div style={{ fontSize:11, color:'#64748b', marginBottom:8 }}>📅 {att} day(s) of attendance</div>
                    {wc ? (
                      <div style={{ padding:'8px 10px', background:wc.status==='approved'?'#f0fdf4':'#fefce8', borderRadius:8, fontSize:11 }}>
                        AI: {wc.aiConfidence}% · Status: <strong>{wc.status}</strong>
                        {wc.status==='approved' && <span style={{ color:'#16a34a', marginLeft:4 }}>✅ Payment unlocked!</span>}
                      </div>
                    ) : (
                      <div>
                        <textarea value={desc} onChange={e=>setDesc(e.target.value)} placeholder="Describe completed work in detail (min 15 chars)..." style={{ width:'100%', padding:'7px', border:'1.5px solid #e2e8f0', borderRadius:7, fontSize:11, minHeight:60, marginBottom:6, resize:'vertical', fontFamily:'inherit' }} />
                        <div style={{ fontSize:10, color:desc.length>=15?'#16a34a':'#64748b', marginBottom:6 }}>{desc.length} chars {desc.length>=15?'✅':'(min 15)'}</div>
                        {/* Work photo */}
                        <div onClick={() => fileRef.current?.click()} style={{ border:'2px dashed #e2e8f0', borderRadius:8, padding:preview?0:'14px 10px', textAlign:'center', cursor:'pointer', background:'#f8fafc', marginBottom:8, overflow:'hidden' }}>
                          {preview ? <img src={preview} alt="work" style={{ width:'100%', maxHeight:100, objectFit:'cover', borderRadius:6 }} />
                            : <div style={{ fontSize:11, color:'#64748b' }}>📷 Add work completion photo<br/>(improves AI confidence)</div>}
                        </div>
                        <input ref={fileRef} type="file" accept="image/*" style={{ display:'none' }} onChange={handleFileChange} />
                        <button onClick={() => handleSubmit(app.jobId, job?.title)} disabled={desc.length<15} style={{ width:'100%', padding:'7px', background:desc.length>=15?'#1d4ed8':'#94a3b8', color:'#fff', border:'none', borderRadius:7, fontSize:12, fontWeight:700, cursor:desc.length>=15?'pointer':'not-allowed' }}>
                          🤖 Submit for AI Verification
                        </button>
                      </div>
                    )}
                  </div>
                );
              })
            }
          </div>
        )}

        {/* REVIEWS */}
        {tab==='review' && (
          <div>
            <div style={{ marginBottom:12 }}>
              <div style={{ fontSize:12, fontWeight:700, color:'#374151', marginBottom:8 }}>Rate the Client</div>
              <input value={revTarget} onChange={e=>setRevTarget(e.target.value)} placeholder="Client name (e.g. Demo Client)" style={{ width:'100%', padding:'7px 10px', border:'1.5px solid #e2e8f0', borderRadius:7, fontSize:12, marginBottom:8 }} />
              <div style={{ display:'flex', gap:4, marginBottom:8 }}>
                {[1,2,3,4,5].map(s => (
                  <span key={s} onClick={() => setRating(s)} style={{ fontSize:24, cursor:'pointer', filter:s<=rating?'none':'grayscale(1) opacity(.4)', transition:'transform .1s', transform:s<=rating?'scale(1.1)':'scale(1)' }}>⭐</span>
                ))}
              </div>
              <textarea value={revText} onChange={e=>setRevText(e.target.value)} placeholder="Your experience with the client..." style={{ width:'100%', padding:'7px', border:'1.5px solid #e2e8f0', borderRadius:7, fontSize:11, minHeight:60, resize:'vertical', fontFamily:'inherit', marginBottom:8 }} />
              <button onClick={handleReviewSubmit} disabled={!rating||!revTarget} style={{ width:'100%', padding:'7px', background:rating&&revTarget?'#1d4ed8':'#94a3b8', color:'#fff', border:'none', borderRadius:7, fontSize:12, fontWeight:700, cursor:rating&&revTarget?'pointer':'not-allowed' }}>
                ⭐ Submit Review
              </button>
            </div>
            {myReviews.length > 0 && (
              <div>
                <div style={{ fontSize:11, fontWeight:700, color:'#64748b', marginBottom:6 }}>MY REVIEWS</div>
                {myReviews.map(r => (
                  <div key={r.id} style={{ border:'1px solid #e2e8f0', borderRadius:8, padding:8, marginBottom:6, fontSize:11 }}>
                    <div style={{ color:'#f59e0b' }}>{'⭐'.repeat(r.rating)}</div>
                    <div style={{ color:'#374151', marginTop:2 }}>→ {r.targetName}</div>
                    {r.comment && <div style={{ color:'#64748b', fontStyle:'italic' }}>"{r.comment}"</div>}
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

      </div>
    </div>
  );
}

// ══════════════════════════════════════════════
// CLIENT PANEL — Full features
// ══════════════════════════════════════════════
function ClientPanel({ jobs, applications, workCompletions, payments, reviews, onPost, onHire, onReject, onApprove, onManualApprove, onPay, onReview }) {
  const [tab, setTab]     = useState('post');
  const [form, setForm]   = useState({ title:'', location:'Indirapuram', pay:'', skills:'Painting', urgency:'normal', payType:'daily', duration:'3' });
  const [posting, setP]   = useState(false);
  const [upiId, setUpi]   = useState('');
  const [rating, setRating] = useState(0);
  const [revText, setRevText] = useState('');
  const [revTarget, setRevTarget] = useState('');

  const myJobs    = jobs.filter(j => j.clientId === 'demo-client');
  const myApps    = applications.filter(a => myJobs.some(j => j.id === a.jobId));
  const pendingWC = workCompletions.filter(wc => myJobs.some(j => j.id === wc.jobId) && wc.status === 'pending_approval');
  const unlocked  = myJobs.filter(j => j.paymentUnlocked && j.status !== 'paid');
  const myPaid    = payments.filter(p => p.clientId === 'demo-client');
  const myReviews = reviews.filter(r => r.type === 'client-to-worker' && r.reviewerId === 'demo-client');

  async function handlePost() {
    if (!form.title || !form.pay) return;
    setP(true); await new Promise(r => setTimeout(r, 400));
    onPost({ title:form.title, category:form.skills, location:form.location, description:'Posted from demo dashboard.', skills:[form.skills], pay:parseInt(form.pay), payType:form.payType, duration:form.duration, durationUnit:'days', urgency:form.urgency, clientId:'demo-client', clientName:'Demo Client', distance:4.2 });
    setForm({ title:'', location:'Indirapuram', pay:'', skills:'Painting', urgency:'normal', payType:'daily', duration:'3' });
    setP(false); setTab('applicants');
  }

  function handleReviewSubmit() {
    if (!rating || !revTarget) return;
    onReview({ reviewerId:'demo-client', reviewerName:'Demo Client', targetId:revTarget, targetName:revTarget, rating, comment:revText, type:'client-to-worker', jobTitle:'Demo Job' });
    setRating(0); setRevText(''); setRevTarget('');
  }

  const TABS = [
    { id:'post',       label:'➕' },
    { id:'applicants', label:'👥' },
    { id:'approval',   label:'✅' + (pendingWC.length ? ' '+pendingWC.length : '') },
    { id:'payment',    label:'💳' },
    { id:'review',     label:'⭐' },
  ];

  return (
    <div style={{ display:'flex', flexDirection:'column', height:'100%', background:'#fff', overflow:'hidden', borderLeft:'1px solid #e2e8f0' }}>
      <div style={{ background:'linear-gradient(135deg,#0f172a,#1e3a5f)', padding:'10px 14px', color:'#fff', flexShrink:0 }}>
        <div style={{ display:'flex', alignItems:'center', gap:8 }}>
          <div style={{ width:32, height:32, borderRadius:'50%', background:'rgba(255,255,255,.1)', display:'flex', alignItems:'center', justifyContent:'center', fontWeight:800, fontSize:13 }}>C</div>
          <div><div style={{ fontWeight:700, fontSize:13 }}>🏢 Demo Client</div><div style={{ fontSize:10, opacity:.8 }}>Client Demo</div></div>
        </div>
      </div>
      <div style={{ display:'flex', background:'#f1f5f9', borderBottom:'1px solid #e2e8f0', flexShrink:0 }}>
        {TABS.map(t => (
          <button key={t.id} onClick={() => setTab(t.id)} style={{ flex:1, padding:'8px 2px', border:'none', background:tab===t.id?'#fff':'transparent', color:tab===t.id?'#0f172a':'#64748b', fontWeight:tab===t.id?700:500, fontSize:t.id==='approval'?10:15, cursor:'pointer', borderBottom:tab===t.id?'2px solid #0f172a':'2px solid transparent', transition:'all .15s' }}>
            {t.label}
          </button>
        ))}
      </div>
      <div style={{ flex:1, overflowY:'auto', padding:'10px' }}>

        {/* POST JOB */}
        {tab==='post' && (
          <div>
            {[{l:'Job Title *',k:'title',ph:'e.g. House Painting'},{l:'Location',k:'location',ph:'Indirapuram'}].map(f => (
              <div key={f.k} style={{ marginBottom:8 }}>
                <div style={{ fontSize:11, fontWeight:600, color:'#374151', marginBottom:3 }}>{f.l}</div>
                <input style={{ width:'100%', padding:'7px 10px', border:'1.5px solid #e2e8f0', borderRadius:7, fontSize:12 }} placeholder={f.ph} value={form[f.k]} onChange={e => setForm(p => ({ ...p, [f.k]:e.target.value }))} />
              </div>
            ))}
            {/* Pay type */}
            <div style={{ marginBottom:8 }}>
              <div style={{ fontSize:11, fontWeight:600, color:'#374151', marginBottom:3 }}>Pay Type</div>
              <div style={{ display:'flex', gap:6 }}>
                {[['daily','Per Day'],['fixed','Fixed Total']].map(([v,l]) => (
                  <button key={v} onClick={() => setForm(p => ({ ...p, payType:v }))} style={{ flex:1, padding:'6px', border:'1.5px solid '+(form.payType===v?'#0f172a':'#e2e8f0'), borderRadius:6, fontSize:11, fontWeight:600, cursor:'pointer', background:form.payType===v?'#0f172a':'#fff', color:form.payType===v?'#fff':'#374151' }}>{l}</button>
                ))}
              </div>
            </div>
            <div style={{ marginBottom:8 }}>
              <div style={{ fontSize:11, fontWeight:600, color:'#374151', marginBottom:3 }}>
                {form.payType==='fixed'?'Fixed Amount (₹) *':'Rate per Day (₹) *'}
              </div>
              <input type="number" style={{ width:'100%', padding:'7px 10px', border:'1.5px solid #e2e8f0', borderRadius:7, fontSize:12 }} placeholder={form.payType==='fixed'?'e.g. 5000':'e.g. 800'} value={form.pay} onChange={e => setForm(p => ({ ...p, pay:e.target.value }))} />
              {form.pay && (
                <div style={{ fontSize:10, marginTop:3, color:'#16a34a', fontWeight:600 }}>
                  {form.payType==='fixed'
                    ? 'Total = ₹'+form.pay+' (fixed, not × days)'
                    : 'Total = ₹'+form.pay+' × '+form.duration+' days = ₹'+(parseInt(form.pay)*parseInt(form.duration||3))
                  }
                </div>
              )}
            </div>
            {form.payType==='daily' && (
              <div style={{ marginBottom:8 }}>
                <div style={{ fontSize:11, fontWeight:600, color:'#374151', marginBottom:3 }}>Duration (days)</div>
                <input type="number" style={{ width:'100%', padding:'7px 10px', border:'1.5px solid #e2e8f0', borderRadius:7, fontSize:12 }} value={form.duration} onChange={e => setForm(p => ({ ...p, duration:e.target.value }))} />
              </div>
            )}
            <div style={{ marginBottom:8 }}>
              <div style={{ fontSize:11, fontWeight:600, color:'#374151', marginBottom:3 }}>Skills</div>
              <select style={{ width:'100%', padding:'7px 10px', border:'1.5px solid #e2e8f0', borderRadius:7, fontSize:12 }} value={form.skills} onChange={e => setForm(p => ({ ...p, skills:e.target.value }))}>
                {SKILLS_LIST.map(s => <option key={s}>{s}</option>)}
              </select>
            </div>
            <div style={{ display:'flex', gap:6, marginBottom:12 }}>
              {[['normal','🟡 Normal'],['urgent','🔴 Urgent']].map(([v,l]) => (
                <button key={v} onClick={() => setForm(p => ({ ...p, urgency:v }))} style={{ flex:1, padding:'6px', border:'1.5px solid '+(form.urgency===v?'#0f172a':'#e2e8f0'), borderRadius:6, fontSize:11, fontWeight:600, cursor:'pointer', background:form.urgency===v?'#0f172a':'#fff', color:form.urgency===v?'#fff':'#374151' }}>{l}</button>
              ))}
            </div>
            <button onClick={handlePost} disabled={posting||!form.title||!form.pay} style={{ width:'100%', padding:'9px', background:!form.title||!form.pay?'#94a3b8':'#0f172a', color:'#fff', border:'none', borderRadius:8, fontWeight:700, fontSize:12, cursor:!form.title||!form.pay?'not-allowed':'pointer' }}>
              {posting?'Posting...':'🚀 Post Job'}
            </button>
          </div>
        )}

        {/* APPLICANTS */}
        {tab==='applicants' && (
          <div>
            {myApps.length===0
              ? <div style={{ textAlign:'center', padding:20, color:'#64748b', fontSize:12 }}>No applicants yet. Worker must apply first.</div>
              : myApps.map(app => {
                const job   = jobs.find(j=>j.id===app.jobId);
                const score = calculateMatchScore({ job:job||{skills:[]}, worker:app.workerData||DEMO_WORKER });
                return (
                  <div key={app.id} style={{ border:'1px solid #e2e8f0', borderRadius:10, padding:10, marginBottom:8 }}>
                    <div style={{ display:'flex', justifyContent:'space-between', alignItems:'flex-start', marginBottom:6 }}>
                      <div>
                        <div style={{ fontWeight:600, fontSize:13 }}>{app.workerData?.name||'Worker'}</div>
                        <div style={{ fontSize:11, color:'#64748b' }}>For: {job?.title}</div>
                        <div style={{ fontSize:11, color:'#64748b' }}>🛠 {app.workerData?.experience||5} yrs · {(app.workerData?.skills||['Painting']).join(', ')}</div>
                      </div>
                      <ScoreRing score={score} size={40} />
                    </div>
                    {/* Match bar */}
                    <div style={{ height:4, background:'#e2e8f0', borderRadius:99, overflow:'hidden', marginBottom:8 }}>
                      <div style={{ height:'100%', width:score+'%', background:matchColor(score), borderRadius:99 }} />
                    </div>
                    {app.status==='hired'
                      ? <span style={{ fontSize:11, color:'#16a34a', fontWeight:700 }}>✅ Hired</span>
                      : app.status==='rejected'
                      ? <span style={{ fontSize:11, color:'#dc2626', fontWeight:700 }}>❌ Rejected</span>
                      : (
                        <div style={{ display:'flex', gap:6 }}>
                          <button onClick={() => onHire(app.jobId, app.id)} style={{ flex:1, padding:'6px', background:'#0f172a', color:'#fff', border:'none', borderRadius:6, fontSize:11, fontWeight:700, cursor:'pointer' }}>✅ Hire</button>
                          <button onClick={() => onReject(app.id)} style={{ padding:'6px 10px', background:'#fef2f2', color:'#dc2626', border:'1px solid #fecaca', borderRadius:6, fontSize:11, fontWeight:700, cursor:'pointer' }}>Reject</button>
                        </div>
                      )
                    }
                  </div>
                );
              })
            }
          </div>
        )}

        {/* WORK APPROVAL */}
        {tab==='approval' && (
          <div>
            {pendingWC.length===0
              ? <div style={{ textAlign:'center', padding:20, color:'#64748b', fontSize:12 }}>No work submissions pending review.</div>
              : pendingWC.map(wc => {
                const job = jobs.find(j=>j.id===wc.jobId);
                return (
                  <div key={wc.id} style={{ border:'1px solid #e2e8f0', borderRadius:10, padding:10, marginBottom:12 }}>
                    <div style={{ fontWeight:600, fontSize:13, marginBottom:4 }}>{job?.title}</div>
                    <div style={{ fontSize:11, color:'#64748b', marginBottom:6 }}>
                      👷 {wc.workerName} · {wc.totalDays} day(s) · Submitted {new Date(wc.submittedAt).toLocaleString('en-IN',{dateStyle:'short',timeStyle:'short'})}
                    </div>
                    {/* AI confidence with realistic color */}
                    <div style={{ padding:'8px 10px', borderRadius:8, background:wc.aiConfidence>=60?'#f0fdf4':'#fefce8', marginBottom:8 }}>
                      <div style={{ fontSize:11, fontWeight:700, color:wc.aiConfidence>=60?'#16a34a':'#d97706' }}>
                        🤖 AI Confidence: {wc.aiConfidence}%
                      </div>
                      <div style={{ height:5, background:'#e2e8f0', borderRadius:99, overflow:'hidden', marginTop:4 }}>
                        <div style={{ height:'100%', width:wc.aiConfidence+'%', background:wc.aiConfidence>=60?'#16a34a':'#d97706', borderRadius:99 }} />
                      </div>
                      <div style={{ fontSize:10, color:'#64748b', marginTop:4 }}>{wc.aiReason}</div>
                    </div>
                    {wc.description && (
                      <div style={{ fontSize:11, color:'#374151', background:'#f8fafc', borderRadius:7, padding:'6px 8px', marginBottom:8, fontStyle:'italic' }}>
                        "{wc.description}"
                      </div>
                    )}
                    {wc.photoUrl && (
                      <img src={wc.photoUrl} alt="work" style={{ width:'100%', maxHeight:120, objectFit:'cover', borderRadius:8, marginBottom:8 }} />
                    )}
                    {/* CLIENT always has option to approve or reject manually */}
                    <div style={{ fontSize:10, color:'#64748b', marginBottom:6, fontWeight:600 }}>
                      CLIENT DECISION (override AI if needed):
                    </div>
                    <div style={{ display:'flex', gap:6 }}>
                      <button onClick={() => onManualApprove(wc.jobId, wc.workerId)} style={{ flex:1, padding:'7px', background:'#16a34a', color:'#fff', border:'none', borderRadius:6, fontSize:11, fontWeight:700, cursor:'pointer' }}>
                        ✅ Approve & Unlock Payment
                      </button>
                      <button onClick={() => onApprove(wc.jobId, wc.workerId, true)} style={{ flex:1, padding:'7px', background:'#dc2626', color:'#fff', border:'none', borderRadius:6, fontSize:11, fontWeight:700, cursor:'pointer' }}>
                        ❌ Reject Work
                      </button>
                    </div>
                  </div>
                );
              })
            }
          </div>
        )}

        {/* PAYMENT */}
        {tab==='payment' && (
          <div>
            {unlocked.length===0
              ? <div style={{ textAlign:'center', padding:20, color:'#64748b', fontSize:12 }}>No unlocked payments. Approve work first.</div>
              : unlocked.map(j => {
                const wc   = workCompletions.find(w => w.jobId===j.id);
                const calc = calculatePayment(j.payType, j.pay, wc?.totalDays || parseInt(j.duration) || 3);
                return (
                  <div key={j.id} style={{ border:'1px solid #bbf7d0', borderRadius:10, padding:10, marginBottom:12, background:'#f0fdf4' }}>
                    <div style={{ fontWeight:600, fontSize:13, marginBottom:4 }}>{j.title}</div>
                    {/* Show correct calculation */}
                    <div style={{ fontSize:11, marginBottom:8 }}>
                      <div style={{ color:'#374151' }}>{calc.breakdown}</div>
                      <div style={{ color:'#64748b' }}>Platform fee (2%): ₹{calc.platformFee}</div>
                      <div style={{ fontWeight:700, color:'#0f172a', fontSize:13, marginTop:3 }}>Total: ₹{calc.total}</div>
                      {j.payType==='fixed' && <div style={{ color:'#16a34a', fontSize:10, marginTop:2 }}>✓ Fixed price — not multiplied by days</div>}
                    </div>
                    {/* UPI input */}
                    <input value={upiId} onChange={e=>setUpi(e.target.value)} placeholder="Worker's UPI ID (e.g. name@upi)" style={{ width:'100%', padding:'7px 10px', border:'1.5px solid #e2e8f0', borderRadius:7, fontSize:12, marginBottom:8 }} />
                    <div style={{ display:'flex', gap:5 }}>
                      {[['upi','📱 UPI'],['cash','💵 Cash'],['bank','🏦 Bank']].map(([m,l]) => (
                        <button key={m} onClick={() => onPay(j.id, calc.amount, m, upiId)} style={{ flex:1, padding:'7px', background:'#0f172a', color:'#fff', border:'none', borderRadius:6, fontSize:10, fontWeight:700, cursor:'pointer' }}>{l}</button>
                      ))}
                    </div>
                  </div>
                );
              })
            }
            {/* Payment history */}
            {myPaid.length > 0 && (
              <div style={{ marginTop:12 }}>
                <div style={{ fontSize:10, color:'#64748b', fontWeight:700, marginBottom:6 }}>PAYMENT HISTORY</div>
                {myPaid.map(p => (
                  <div key={p.id} style={{ fontSize:11, padding:'5px 0', borderBottom:'1px solid #f1f5f9', display:'flex', justifyContent:'space-between' }}>
                    <span>₹{p.amount} via {p.method}</span>
                    <span style={{ color:'#16a34a', fontWeight:700 }}>✅ {p.transactionId}</span>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* REVIEWS */}
        {tab==='review' && (
          <div>
            <div style={{ marginBottom:12 }}>
              <div style={{ fontSize:12, fontWeight:700, color:'#374151', marginBottom:8 }}>Rate the Worker</div>
              <input value={revTarget} onChange={e=>setRevTarget(e.target.value)} placeholder="Worker name (e.g. Raju Mistri)" style={{ width:'100%', padding:'7px 10px', border:'1.5px solid #e2e8f0', borderRadius:7, fontSize:12, marginBottom:8 }} />
              <div style={{ display:'flex', gap:4, marginBottom:8 }}>
                {[1,2,3,4,5].map(s => (
                  <span key={s} onClick={() => setRating(s)} style={{ fontSize:24, cursor:'pointer', filter:s<=rating?'none':'grayscale(1) opacity(.4)', transition:'transform .1s', transform:s<=rating?'scale(1.1)':'scale(1)' }}>⭐</span>
                ))}
              </div>
              <textarea value={revText} onChange={e=>setRevText(e.target.value)} placeholder="Work quality, punctuality, behaviour..." style={{ width:'100%', padding:'7px', border:'1.5px solid #e2e8f0', borderRadius:7, fontSize:11, minHeight:60, resize:'vertical', fontFamily:'inherit', marginBottom:8 }} />
              <button onClick={handleReviewSubmit} disabled={!rating||!revTarget} style={{ width:'100%', padding:'7px', background:rating&&revTarget?'#0f172a':'#94a3b8', color:'#fff', border:'none', borderRadius:7, fontSize:12, fontWeight:700, cursor:rating&&revTarget?'pointer':'not-allowed' }}>
                ⭐ Submit Review
              </button>
            </div>
            {myReviews.length > 0 && (
              <div>
                <div style={{ fontSize:11, fontWeight:700, color:'#64748b', marginBottom:6 }}>MY REVIEWS</div>
                {myReviews.map(r => (
                  <div key={r.id} style={{ border:'1px solid #e2e8f0', borderRadius:8, padding:8, marginBottom:6, fontSize:11 }}>
                    <div style={{ color:'#f59e0b' }}>{'⭐'.repeat(r.rating)}</div>
                    <div style={{ color:'#374151', marginTop:2 }}>→ {r.targetName}</div>
                    {r.comment && <div style={{ color:'#64748b', fontStyle:'italic' }}>"{r.comment}"</div>}
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

      </div>
    </div>
  );
}

// ── Activity Log ──────────────────────────────
function ActivityLog({ events }) {
  const ref = useRef();
  useEffect(() => { ref.current?.scrollIntoView({ behavior:'smooth' }); }, [events]);
  return (
    <div style={{ display:'flex', flexDirection:'column', height:'100%', background:'#0d1117', borderLeft:'1px solid rgba(255,255,255,.06)' }}>
      <div style={{ padding:'10px 12px', fontSize:11, fontWeight:700, color:'#94a3b8', borderBottom:'1px solid rgba(255,255,255,.06)', background:'#111827', flexShrink:0 }}>
        📋 Activity Log
      </div>
      <div style={{ flex:1, overflowY:'auto', padding:8 }}>
        {events.length===0
          ? <div style={{ fontSize:11, color:'#374151', textAlign:'center', marginTop:20 }}>Follow the steps above ↑</div>
          : events.map((e,i) => (
            <div key={i} style={{ fontSize:10, padding:'3px 0', borderBottom:'1px solid #1f2937', display:'flex', gap:6 }}>
              <span style={{ color:'#374151', flexShrink:0 }}>{e.time}</span>
              <span style={{ color:e.color||'#94a3b8', lineHeight:1.4 }}>{e.msg}</span>
            </div>
          ))
        }
        <div ref={ref} />
      </div>
    </div>
  );
}

// ══════════════════════════════════════════════
// MAIN DEMO DASHBOARD
// ══════════════════════════════════════════════
export default function DemoDashboard() {
  const {
    jobs, postJob, applications, applyToJob, hireWorker, rejectApplication,
    attendance, markAttendance,
    workCompletions, submitWorkCompletion, approveWork, rejectWork,
    payments, processPayment,
    reviews, submitReview,
  } = useApp();

  const [events, setEvents] = useState([]);
  const [toast,  setToast]  = useState('');

  // FIX 2: Reset all demo data for a fresh start
  function handleReset() {
    const keys = ['adw_jobs','adw_apps','adw_reviews','adw_pay','adw_att','adw_notifs','adw_wc'];
    keys.forEach(k => localStorage.removeItem(k));
    // Reload page to reinitialise with seed data only
    window.location.reload();
  }

  function log(msg, color) {
    var t = new Date().toLocaleTimeString('en-IN',{hour:'2-digit',minute:'2-digit',second:'2-digit'});
    setEvents(function(p) { return [...p.slice(-99), { time:t, msg:msg, color:color||'#86efac' }]; });
  }
  function showToast(msg) { setToast(msg); setTimeout(function(){ setToast(''); }, 3500); }

  // Worker actions
  function handleApply(jobId, score) {
    var r = applyToJob(jobId, { ...DEMO_WORKER, id:'demo-worker' });
    if (r && r.error) { log('⚠️ '+r.error, '#fbbf24'); return; }
    log('👷 Raju applied (Match: '+score+'%)', '#60a5fa');
    showToast('✅ Applied! Score: '+score+'%');
  }

  function handleAttend(jobId, title, photoUrl) {
    var fraud = checkAttendanceFraud(attendance, jobId, 'demo-worker');
    if (fraud.fraud) { log('⚠️ '+fraud.reason, '#fbbf24'); showToast('⚠️ '+fraud.reason); return; }
    var faceScore = photoUrl ? Math.floor(65 + Math.random()*28) : Math.floor(50 + Math.random()*20);
    var r = markAttendance({ jobId:jobId, jobTitle:title, workerId:'demo-worker', workerName:'Raju Mistri', faceScore:faceScore, faceVerified:true, note:'Demo', photoUrl:photoUrl||null });
    if (r && r.error) { log('⚠️ '+r.error, '#fbbf24'); return; }
    log('📸 Attendance: "'+title+'" — Face match: '+faceScore+'%'+(photoUrl?' (photo ✓)':''), '#86efac');
    showToast('✅ Attendance marked! Face match: '+faceScore+'%');
  }

  async function handleSubmitWork(jobId, title, desc, photoUrl) {
    log('🤖 AI verifying work submission...', '#a78bfa');
    var ai = await verifyWorkCompletion({ description:desc, imageDataUrl:photoUrl });
    log('🤖 AI result: '+ai.confidence+'% — '+(ai.approved?'AUTO APPROVED ✅':'Below threshold, needs review ⚠️'), ai.approved?'#86efac':'#fbbf24');

    submitWorkCompletion({ jobId:jobId, workerId:'demo-worker', workerName:'Raju Mistri', description:desc, photoUrl:photoUrl||null, aiConfidence:ai.confidence, aiApproved:ai.approved, aiReason:ai.reason, totalDays:attendance.filter(function(a){ return a.jobId===jobId&&a.workerId==='demo-worker'; }).length||1 });

    if (ai.approved) {
      approveWork(jobId, 'demo-worker');
      log('✅ Work auto-approved by AI. Payment unlocked!', '#86efac');
      showToast('🤖 AI approved ('+ai.confidence+'%)! Payment unlocked.');
    } else {
      log('⚠️ AI confidence '+ai.confidence+'%. Awaiting client manual review.', '#fbbf24');
      showToast('⚠️ AI: '+ai.confidence+'% — pending client review');
    }
  }

  // Client actions
  function handlePost(data) {
    var j = postJob(data);
    log('🏢 Job posted: "'+j.title+'" ('+data.payType+': ₹'+data.pay+')', '#93c5fd');
    showToast('✅ Job "'+j.title+'" posted!');
  }

  function handleHire(jobId, appId) {
    hireWorker(jobId, appId);
    log('✅ Worker hired for job #'+jobId, '#86efac');
    showToast('✅ Worker hired!');
  }

  function handleReject(appId) {
    rejectApplication(appId);
    log('❌ Application rejected', '#fca5a5');
    showToast('❌ Application rejected');
  }

  // Client manually approves (always available, AI decision is advisory)
  function handleManualApprove(jobId, workerId) {
    approveWork(jobId, workerId);
    log('✅ Client manually approved work. Payment unlocked!', '#86efac');
    showToast('✅ Work approved! Payment unlocked.');
  }

  // Client rejects work
  function handleRejectWork(jobId, workerId, isReject) {
    if (isReject) {
      rejectWork(jobId, workerId, 'Quality not satisfactory.');
      log('❌ Client rejected work. Rework required.', '#fca5a5');
      showToast('❌ Work rejected. Worker notified.');
    }
  }

  function handlePay(jobId, amount, method, upiId) {
    var job = jobs.find(function(j){ return j.id===jobId; });
    if (!job || !job.paymentUnlocked) { showToast('❌ Payment not unlocked!'); return; }
    var r = processPayment({ jobId:jobId, workerId:'demo-worker', clientId:'demo-client', amount:amount, method:method, upiId:upiId||'' });
    if (r && r.error) { log('❌ '+r.error, '#fca5a5'); showToast('❌ '+r.error); return; }
    log('💳 Payment ₹'+amount+' via '+method.toUpperCase()+' — '+r.transactionId, '#86efac');
    showToast('✅ Payment of ₹'+amount+' completed!');
  }

  function handleReview(reviewData) {
    submitReview(reviewData);
    log('⭐ '+reviewData.reviewerName+' rated '+reviewData.targetName+': '+reviewData.rating+'/5', '#fbbf24');
    showToast('⭐ Review submitted!');
  }

  return (
    <div style={{ height:'100vh', display:'flex', flexDirection:'column', background:'#0f172a', overflow:'hidden', fontFamily:'system-ui,sans-serif' }}>
      {/* Top bar */}
      <div style={{ background:'#1e293b', padding:'0 16px', height:48, display:'flex', alignItems:'center', justifyContent:'space-between', borderBottom:'1px solid rgba(255,255,255,.08)', flexShrink:0 }}>
        <div style={{ display:'flex', alignItems:'center', gap:10 }}>
          <div style={{ width:28, height:28, borderRadius:6, background:'#2563eb', display:'flex', alignItems:'center', justifyContent:'center', fontSize:13 }}>⚒️</div>
          <div>
            {/* Title: "Live Demo Dashboard" */}
            <div style={{ fontWeight:700, fontSize:13, color:'#f1f5f9' }}>AI Digital Workers</div>
            <div style={{ fontSize:10, color:'#64748b' }}>🎬 Live Demo Dashboard</div>
          </div>
        </div>
        <div style={{ display:'flex', gap:6, alignItems:'center' }}>
          <span style={{ width:7, height:7, borderRadius:'50%', background:'#16a34a', display:'inline-block' }} />
          <span style={{ fontSize:10, color:'#86efac' }}>Live</span>
          {/* FIX 2: Reset button for fresh start before presentation */}
          <button onClick={handleReset} style={{ padding:'4px 10px', background:'rgba(220,38,38,.2)', color:'#fca5a5', border:'1px solid rgba(220,38,38,.3)', borderRadius:6, fontSize:10, fontWeight:700, cursor:'pointer', marginLeft:2 }}
            title="Clear all demo interactions for a fresh start">
            🔄 Reset Demo
          </button>
          <a href="/" style={{ padding:'4px 10px', background:'#2563eb', color:'#fff', borderRadius:6, fontSize:11, fontWeight:700, textDecoration:'none', marginLeft:2 }}>← Exit</a>
        </div>
      </div>

      {/* Step guide */}
      <div style={{ background:'#0f172a', padding:'4px 12px', display:'flex', gap:6, overflowX:'auto', flexShrink:0, borderBottom:'1px solid rgba(255,255,255,.04)' }}>
        {['1️⃣ Client: Post Job','2️⃣ Worker: Apply','3️⃣ Client: Hire','4️⃣ Worker: Attend+Photo','5️⃣ Worker: Submit Work','6️⃣ Client: Approve/Reject','7️⃣ Client: Pay','8️⃣ Both: Leave Reviews'].map(function(s,i){
          return <span key={i} style={{ fontSize:9, color:'#475569', whiteSpace:'nowrap', padding:'2px 7px', background:'#1e293b', borderRadius:99 }}>{s}</span>;
        })}
      </div>

      <Toast msg={toast} />

      {/* 3-column layout */}
      <div style={{ flex:1, display:'grid', gridTemplateColumns:'1fr 1fr 200px', overflow:'hidden', minHeight:0 }}>
        <WorkerPanel
          jobs={jobs} applications={applications} attendance={attendance}
          workCompletions={workCompletions} reviews={reviews}
          onApply={handleApply} onAttend={handleAttend}
          onSubmitWork={handleSubmitWork} onReview={handleReview}
        />
        <ClientPanel
          jobs={jobs} applications={applications} workCompletions={workCompletions}
          payments={payments} reviews={reviews}
          onPost={handlePost} onHire={handleHire} onReject={handleReject}
          onApprove={handleRejectWork} onManualApprove={handleManualApprove}
          onPay={handlePay} onReview={handleReview}
        />
        <ActivityLog events={events} />
      </div>
    </div>
  );
}
