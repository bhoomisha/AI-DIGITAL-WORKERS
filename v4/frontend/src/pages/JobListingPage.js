import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { calculateMatchScore, matchColor, matchClass, matchLabel } from '../services/api';
import JobCard from '../components/JobCard';
import VoiceAssistant from '../components/VoiceAssistant';

const CATS = ['All','Painting','Electrician','Plumbing','Carpentry','AC Technician','Masonry','Cleaning'];

export default function JobListingPage() {
  const { jobs, applications, applyToJob, workerProfile, user } = useApp();
  const [search, setSearch]   = useState('');
  const [cat, setCat]         = useState('All');
  const [sort, setSort]       = useState('match');
  const [urgency, setUrgency] = useState('all');
  const [applying, setApplying] = useState(null);
  const [toast, setToast]     = useState('');

  const appliedIds = applications.filter(a => a.workerId===user?.id).map(a => a.jobId);

  const scored = jobs
    .filter(j => j.status==='open')
    .map(j => ({ ...j, matchScore: calculateMatchScore({ job:j, worker:workerProfile||{} }) }))
    .filter(j => {
      const s = search.toLowerCase();
      const matchSearch = !s || j.title.toLowerCase().includes(s) || j.location.toLowerCase().includes(s) || (j.skills||[]).some(sk => sk.toLowerCase().includes(s));
      const matchCat    = cat==='All' || j.category===cat;
      const matchUrg    = urgency==='all' || j.urgency===urgency;
      return matchSearch && matchCat && matchUrg;
    })
    .sort((a,b) => sort==='match' ? b.matchScore-a.matchScore : sort==='pay' ? b.pay-a.pay : a.distance-b.distance);

  async function handleApply(job) {
    if (appliedIds.includes(job.id)) return;
    if (!workerProfile) { setToast('❌ Please complete your profile first'); setTimeout(()=>setToast(''),3000); return; }
    setApplying(job.id);
    await new Promise(r => setTimeout(r, 700));
    const result = applyToJob(job.id, { ...workerProfile, id:user?.id });
    setApplying(null);
    if (result?.error) { setToast(`❌ ${result.error}`); }
    else { setToast(`✅ Applied to "${job.title}"!`); }
    setTimeout(() => setToast(''), 3000);
  }

  return (
    <div className="page-wrapper" style={{ paddingBottom:90 }}>
      <div className="container" style={{ paddingTop:24 }}>
        <div className="section-header" style={{ marginBottom:16 }}>
          <div>
            <h1 style={{ fontFamily:'var(--font-display)', fontSize:26, marginBottom:2 }}>🔍 Find Jobs</h1>
            <p style={{ color:'var(--text-muted)', fontSize:14 }}>{scored.length} jobs available</p>
          </div>
        </div>

        {toast && <div className={`alert ${toast.startsWith('✅')?'alert-success':'alert-error'}`}>{toast}</div>}

        {/* Search */}
        <input className="form-input" placeholder="🔍 Search jobs, skills, location..." value={search} onChange={e=>setSearch(e.target.value)} style={{ marginBottom:12 }} />

        {/* Category filter */}
        <div style={{ display:'flex', gap:6, overflowX:'auto', paddingBottom:8, marginBottom:10 }}>
          {CATS.map(c => (
            <button key={c} onClick={() => setCat(c)} style={{ padding:'7px 14px', borderRadius:99, border:`2px solid ${cat===c?'var(--primary)':'var(--border)'}`, background:cat===c?'var(--primary)':'#fff', color:cat===c?'#fff':'var(--text-muted)', cursor:'pointer', fontWeight:600, fontSize:13, whiteSpace:'nowrap' }}>{c}</button>
          ))}
        </div>

        {/* Sort + urgency */}
        <div style={{ display:'flex', gap:8, alignItems:'center', marginBottom:14, flexWrap:'wrap' }}>
          <span style={{ fontSize:13, color:'var(--text-muted)', fontWeight:600 }}>Sort:</span>
          {[['match','🤖 AI Match'],['pay','💰 Pay'],['distance','📍 Nearest']].map(([v,l]) => (
            <button key={v} onClick={() => setSort(v)} className={`btn btn-sm ${sort===v?'btn-primary':'btn-outline'}`} style={{ fontSize:12 }}>{l}</button>
          ))}
          <select className="form-select" style={{ padding:'7px 12px', fontSize:13, width:'auto' }} value={urgency} onChange={e=>setUrgency(e.target.value)}>
            <option value="all">All</option>
            <option value="urgent">🔴 Urgent</option>
            <option value="normal">🟡 Normal</option>
          </select>
        </div>

        {/* AI explanation */}
        <div className="alert alert-info" style={{ fontSize:12, marginBottom:14 }}>
          <span className="ai-badge" style={{ marginRight:8 }}>🤖 AI</span>
          Match Score = Skills(35%) + Experience(25%) + Rating(20%) + Distance(10%) + Availability(10%)
        </div>

        {/* Job list */}
        {scored.length === 0
          ? <div className="empty-state"><span className="emoji">😔</span><h3>No jobs found</h3><p>Try changing search or filters</p></div>
          : scored.map(job => (
            <div key={job.id} style={{ position:'relative' }}>
              {applying===job.id && (
                <div style={{ position:'absolute', inset:0, background:'rgba(255,255,255,.85)', borderRadius:16, display:'flex', alignItems:'center', justifyContent:'center', zIndex:10, fontSize:16, fontWeight:700, color:'var(--primary)' }}>
                  ⏳ Applying...
                </div>
              )}
              <JobCard job={job} matchScore={job.matchScore} showApply applied={appliedIds.includes(job.id)} onApply={handleApply} />
            </div>
          ))
        }
      </div>
      <VoiceAssistant />
    </div>
  );
}
