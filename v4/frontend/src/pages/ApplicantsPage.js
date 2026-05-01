import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { calculateMatchScore, matchColor, matchClass, matchLabel } from '../services/api';
import ProfileCard from '../components/ProfileCard';

const MOCK_WORKERS = [
  { id:'mw1', name:'Raju Mistri',   phone:'9876543210', skills:['Painting','Wall Finishing'], experience:5, rating:null, location:'Sector 62, Noida',  availability:'available', jobsDone:0 },
  { id:'mw2', name:'Suresh Kumar',  phone:'9812345678', skills:['Plumbing','Pipe Fitting','Electrician'], experience:8, rating:null, location:'Indirapuram',  availability:'available', jobsDone:0 },
  { id:'mw3', name:'Manoj Sharma',  phone:'9900112233', skills:['Carpentry','Wood Work'], experience:3, rating:null, location:'Vasundhara',  availability:'available', jobsDone:0 },
  { id:'mw4', name:'Dinesh Yadav',  phone:'9988776655', skills:['AC Repair','Electrician'], experience:6, rating:null, location:'Raj Nagar',  availability:'busy', jobsDone:0 },
  { id:'mw5', name:'Ramesh Bhai',   phone:'9776655443', skills:['Painting','Tiling','Masonry'], experience:10, rating:null, location:'Noida Sector 18', availability:'available', jobsDone:0 },
];

export default function ApplicantsPage() {
  const { jobs, applications, workCompletions, hireWorker, rejectApplication, approveWork, rejectWork, user } = useApp();
  const [selJobId, setSelJobId]   = useState(jobs[0]?.id||null);
  const [hiredMap, setHiredMap]   = useState({});
  const [rejectedMap, setRejMap]  = useState({});
  const [sortBy, setSortBy]       = useState('match');
  const [tab, setTab]             = useState('applicants'); // applicants | approvals
  const [toast, setToast]         = useState('');
  const [rejectNote, setRejectNote] = useState('');

  const myJobs = jobs.filter(j => j.clientId===user?.id);
  const selJob = myJobs.find(j=>j.id===selJobId) || myJobs[0];

  function showToast(msg) { setToast(msg); setTimeout(()=>setToast(''),3500); }

  // Merge real applicants + mock for demo
  const realApps  = applications.filter(a => a.jobId===selJob?.id);
  const realWorkers = realApps.map(a => ({ ...a.workerData, appId:a.id, status:a.status }));
  const allWorkers  = [...MOCK_WORKERS, ...realWorkers].filter((w,i,arr)=>arr.findIndex(x=>x.id===w.id)===i);

  const scored = allWorkers
    .map(w => ({ ...w, matchScore: selJob ? calculateMatchScore({ job:selJob, worker:w }) : 0 }))
    .sort((a,b) => sortBy==='match' ? b.matchScore-a.matchScore : sortBy==='rating' ? (b.rating||0)-(a.rating||0) : b.experience-a.experience);

  const pendingWork = workCompletions.filter(wc => myJobs.some(j=>j.id===wc.jobId) && wc.status==='pending_approval');

  function handleHire(worker) {
    setHiredMap(prev => ({ ...prev, [worker.id]:true }));
    const app = applications.find(a=>a.jobId===selJob?.id&&a.workerData?.id===worker.id);
    if (app) hireWorker(selJob.id, app.id);
    showToast(`✅ ${worker.name} hired!`);
  }

  function handleApprove(wc) {
    approveWork(wc.jobId, wc.workerId);
    showToast('✅ Work approved! Payment unlocked for worker.');
  }

  function handleReject(wc) {
    if (!rejectNote.trim()) { showToast('❌ Enter a remark before rejecting'); return; }
    rejectWork(wc.jobId, wc.workerId, rejectNote);
    setRejectNote('');
    showToast('🔄 Work rejected. Worker notified.');
  }

  return (
    <div className="page-wrapper" style={{ paddingBottom:40 }}>
      <div className="container" style={{ paddingTop:24 }}>
        <h1 style={{ fontFamily:'var(--font-display)', fontSize:26, marginBottom:4 }}>👥 Applicants & Approvals</h1>
        <p style={{ color:'var(--text-muted)', fontSize:14, marginBottom:20 }}>Review, hire workers and approve completed work</p>

        {toast && <div className="alert alert-success">{toast}</div>}

        <div className="tabs">
          <button className={`tab ${tab==='applicants'?'active':''}`} onClick={()=>setTab('applicants')}>👥 Applicants</button>
          <button className={`tab ${tab==='approvals'?'active':''}`} onClick={()=>setTab('approvals')}>✅ Work Approvals {pendingWork.length>0&&<span className="badge badge-orange" style={{ marginLeft:6 }}>{pendingWork.length}</span>}</button>
        </div>

        {tab==='applicants' && (
          <>
            <div className="form-group">
              <label className="form-label">Select Job</label>
              <select className="form-select" value={selJobId||''} onChange={e=>setSelJobId(parseInt(e.target.value))}>
                {myJobs.map(j=><option key={j.id} value={j.id}>{j.title} – {j.location}</option>)}
                {myJobs.length===0 && <option>No jobs posted yet</option>}
              </select>
            </div>
            {selJob && (
              <div style={{ background:'#fff0e8', border:'1px solid var(--primary)', borderRadius:12, padding:'12px 16px', marginBottom:16, fontSize:14, display:'flex', justifyContent:'space-between', flexWrap:'wrap', gap:8 }}>
                <strong>{selJob.title}</strong>
                <span>👥 {scored.length} applicant(s)</span>
                <span>💰 ₹{selJob.pay}/{selJob.payType}</span>
              </div>
            )}
            <div className="alert alert-info" style={{ fontSize:12, marginBottom:14 }}>
              <span className="ai-badge" style={{ marginRight:8 }}>🤖 AI</span>
              Match Score: Skills(35%) + Experience(25%) + Rating(20%) + Distance(10%) + Availability(10%)
            </div>
            <div style={{ display:'flex', gap:8, marginBottom:16, flexWrap:'wrap' }}>
              <span style={{ fontSize:13, color:'var(--text-muted)', fontWeight:600 }}>Sort:</span>
              {[['match','🤖 Best Match'],['rating','⭐ Rating'],['experience','🛠 Experience']].map(([v,l])=>(
                <button key={v} onClick={()=>setSortBy(v)} className={`btn btn-sm ${sortBy===v?'btn-primary':'btn-outline'}`} style={{ fontSize:12 }}>{l}</button>
              ))}
            </div>
            {scored.length===0
              ? <div className="empty-state"><span className="emoji">👤</span><h3>No Applicants Yet</h3><p>Workers will apply to your job soon</p></div>
              : scored.map(worker=>(
                <ProfileCard key={worker.id} worker={worker} matchScore={worker.matchScore} showHire hired={!!hiredMap[worker.id]||worker.status==='hired'} onHire={handleHire} />
              ))
            }
          </>
        )}

        {tab==='approvals' && (
          <>
            {pendingWork.length===0
              ? <div className="empty-state"><span className="emoji">✅</span><h3>No Pending Approvals</h3><p>Worker work submissions will appear here</p></div>
              : pendingWork.map(wc=>{
                  const job = jobs.find(j=>j.id===wc.jobId);
                  return (
                    <div key={wc.id} className="card fade-in" style={{ marginBottom:16 }}>
                      <div style={{ display:'flex', justifyContent:'space-between', alignItems:'flex-start', flexWrap:'wrap', gap:8, marginBottom:12 }}>
                        <div>
                          <h3 style={{ fontSize:17, marginBottom:4 }}>{job?.title||'Job'}</h3>
                          <div style={{ fontSize:13, color:'var(--text-muted)' }}>👷 Worker: {wc.workerName}</div>
                          <div style={{ fontSize:13, color:'var(--text-muted)' }}>📅 Submitted: {new Date(wc.submittedAt).toLocaleString('en-IN',{dateStyle:'medium',timeStyle:'short'})}</div>
                          <div style={{ fontSize:13, color:'var(--text-muted)' }}>📅 Days worked: {wc.totalDays}</div>
                        </div>
                        <div style={{ textAlign:'right' }}>
                          <div style={{ padding:'4px 12px', borderRadius:99, fontSize:12, fontWeight:700, background: wc.aiConfidence>=60?'#dcfce7':'#fef9c3', color:wc.aiConfidence>=60?'#15803d':'#854d0e' }}>
                            🤖 AI: {wc.aiConfidence}%
                          </div>
                          <div style={{ fontSize:11, color:'var(--text-muted)', marginTop:3 }}>{wc.aiApproved?'AI Approved':'Needs Review'}</div>
                        </div>
                      </div>
                      {wc.description && <div style={{ background:'var(--bg)', borderRadius:10, padding:12, marginBottom:12, fontSize:13, color:'var(--text-muted)', lineHeight:1.6 }}><strong>Worker's Description:</strong><br/>{wc.description}</div>}
                      {wc.photoUrl && <img src={wc.photoUrl} alt="work" style={{ width:'100%', maxHeight:200, objectFit:'cover', borderRadius:10, marginBottom:12 }} />}
                      <div className="form-group">
                        <label className="form-label">Remark (required if rejecting)</label>
                        <input className="form-input" placeholder="e.g. Painting not uniform, please redo..." value={rejectNote} onChange={e=>setRejectNote(e.target.value)} />
                      </div>
                      <div style={{ display:'flex', gap:10 }}>
                        <button className="btn btn-success" style={{ flex:1 }} onClick={()=>handleApprove(wc)}>✅ Approve & Unlock Payment</button>
                        <button className="btn btn-danger" onClick={()=>handleReject(wc)}>❌ Reject</button>
                      </div>
                    </div>
                  );
                })
            }
          </>
        )}
      </div>
    </div>
  );
}
