// ReviewPage.js
import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import VoiceAssistant from '../components/VoiceAssistant';

const LABELS = { 1:'Poor', 2:'Fair', 3:'Good', 4:'Very Good', 5:'Excellent' };

function StarPicker({ value, onChange }) {
  return (
    <div style={{ display:'flex', gap:8 }}>
      {[1,2,3,4,5].map(s=>(
        <span key={s} onClick={()=>onChange(s)} style={{ fontSize:32, cursor:'pointer', filter:s<=value?'none':'grayscale(1) opacity(.35)', transition:'transform .1s', transform:s<=value?'scale(1.12)':'scale(1)' }}>⭐</span>
      ))}
    </div>
  );
}

export default function ReviewPage() {
  const { reviews, submitReview, role, user, jobs, getUserRating } = useApp();
  const [tab, setTab]   = useState('leave');
  const [form, setForm] = useState({ rating:0, comment:'', targetName:'', jobTitle:'', targetId:'' });
  const [submitting, setSubmitting] = useState(false);
  const [toast, setToast] = useState('');
  const upd = (k,v) => setForm(f=>({...f,[k]:v}));

  function showToast(msg) { setToast(msg); setTimeout(()=>setToast(''),3500); }

  async function handleSubmit(e) {
    e.preventDefault();
    if (!form.rating) { showToast('❌ Please select a star rating'); return; }
    if (!form.targetName) { showToast('❌ Enter the name of person you are reviewing'); return; }
    setSubmitting(true);
    await new Promise(r=>setTimeout(r,500));
    const result = submitReview({ ...form, reviewerId:user?.id, reviewer:form.targetName==='Client'?'Worker':'Client', type:role==='worker'?'worker-to-client':'client-to-worker', jobId:null });
    if (result?.error) { showToast(`❌ ${result.error}`); }
    else { showToast('✅ Review submitted!'); setForm({ rating:0, comment:'', targetName:'', jobTitle:'', targetId:'' }); setTab('all'); }
    setSubmitting(false);
  }

  const myRating = getUserRating(user?.id);
  const allRevs  = reviews.sort((a,b)=>new Date(b.createdAt)-new Date(a.createdAt));

  return (
    <div className="page-wrapper" style={{ paddingBottom:90 }}>
      <div className="container" style={{ paddingTop:24, maxWidth:600 }}>
        <h1 style={{ fontFamily:'var(--font-display)', fontSize:26, marginBottom:4 }}>⭐ Ratings & Reviews</h1>
        <p style={{ color:'var(--text-muted)', fontSize:14, marginBottom:20 }}>Build trust in the community</p>

        {toast && <div className={`alert ${toast.startsWith('✅')?'alert-success':'alert-error'}`}>{toast}</div>}

        <div className="tabs">
          <button className={`tab ${tab==='leave'?'active':''}`} onClick={()=>setTab('leave')}>✍️ Leave Review</button>
          <button className={`tab ${tab==='all'?'active':''}`} onClick={()=>setTab('all')}>📋 All Reviews ({allRevs.length})</button>
          <button className={`tab ${tab==='mine'?'active':''}`} onClick={()=>setTab('mine')}>👤 My Rating</button>
        </div>

        {tab==='leave' && (
          <div className="card fade-in">
            <h3 style={{ fontSize:18, marginBottom:20 }}>{role==='worker'?'📝 Rate the Client':'📝 Rate the Worker'}</h3>
            <form onSubmit={handleSubmit}>
              <div className="form-group">
                <label className="form-label">{role==='worker'?'Client Name':'Worker Name'} *</label>
                <input className="form-input" placeholder={role==='worker'?'e.g. Ramesh Gupta':'e.g. Raju Mistri'} value={form.targetName} onChange={e=>upd('targetName',e.target.value)} required />
              </div>
              <div className="form-group">
                <label className="form-label">Job / Work Done</label>
                <input className="form-input" placeholder="e.g. House Painting" value={form.jobTitle} onChange={e=>upd('jobTitle',e.target.value)} />
              </div>
              <div className="form-group">
                <label className="form-label">Your Rating *</label>
                <StarPicker value={form.rating} onChange={r=>upd('rating',r)} />
                {form.rating>0&&<div style={{ marginTop:6, fontSize:14, color:'var(--primary)', fontWeight:700 }}>{LABELS[form.rating]}</div>}
              </div>
              <div className="form-group">
                <label className="form-label">Your Review</label>
                <textarea className="form-textarea" placeholder="Share your experience — work quality, punctuality, behaviour..." value={form.comment} onChange={e=>upd('comment',e.target.value)} style={{ minHeight:110 }} />
              </div>
              <div style={{ display:'flex', flexWrap:'wrap', gap:8, marginBottom:16 }}>
                {['On Time','Good Quality','Professional','Cooperative','Paid Promptly','Would Recommend'].map(t=>(
                  <button key={t} type="button" onClick={()=>upd('comment',form.comment?`${form.comment}, ${t}`:t)} style={{ padding:'6px 12px', borderRadius:99, fontSize:12, border:'1px solid var(--border)', background:'#fff', cursor:'pointer', fontWeight:600, color:'var(--text-muted)' }}>+ {t}</button>
                ))}
              </div>
              <button className="btn btn-primary btn-full btn-lg" type="submit" disabled={submitting}>{submitting?'⏳ Submitting...':'⭐ Submit Review'}</button>
            </form>
          </div>
        )}

        {tab==='all' && (
          <div className="fade-in">
            {allRevs.length>0&&(
              <div style={{ background:'#fff0e8', border:'1px solid var(--primary)', borderRadius:14, padding:'16px 20px', marginBottom:20, textAlign:'center' }}>
                <div style={{ fontSize:42, fontWeight:800, fontFamily:'var(--font-display)', color:'var(--primary)' }}>{(allRevs.reduce((s,r)=>s+r.rating,0)/allRevs.length).toFixed(1)}</div>
                <div style={{ fontSize:22, margin:'6px 0' }}>⭐⭐⭐⭐⭐</div>
                <div style={{ color:'var(--text-muted)', fontSize:14 }}>{allRevs.length} review(s)</div>
              </div>
            )}
            {allRevs.length===0
              ? <div className="empty-state"><span className="emoji">💬</span><h3>No Reviews Yet</h3></div>
              : allRevs.map(r=>(
                <div key={r.id} className="card fade-in" style={{ marginBottom:14 }}>
                  <div style={{ display:'flex', justifyContent:'space-between', alignItems:'flex-start', marginBottom:10 }}>
                    <div style={{ display:'flex', gap:10, alignItems:'center' }}>
                      <div className="avatar" style={{ width:40, height:40, fontSize:15 }}>{(r.reviewer||'U')[0]}</div>
                      <div><div style={{ fontWeight:700, fontSize:15 }}>{r.reviewer}</div><div style={{ fontSize:12, color:'var(--text-muted)' }}>→ {r.targetName}</div></div>
                    </div>
                    <div style={{ textAlign:'right' }}>
                      <div style={{ color:'#f59e0b', fontSize:16 }}>{'⭐'.repeat(r.rating)}</div>
                      <div style={{ fontSize:12, color:'var(--text-muted)' }}>{new Date(r.createdAt).toLocaleDateString('en-IN')}</div>
                    </div>
                  </div>
                  {r.comment&&<p style={{ fontSize:14, color:'var(--text-muted)', fontStyle:'italic' }}>"{r.comment}"</p>}
                  {r.jobTitle&&<span className="badge badge-orange" style={{ marginTop:8 }}>💼 {r.jobTitle}</span>}
                </div>
              ))
            }
          </div>
        )}

        {tab==='mine' && (
          <div className="fade-in">
            {myRating ? (
              <div className="card" style={{ textAlign:'center' }}>
                <div style={{ fontSize:56, fontWeight:800, fontFamily:'var(--font-display)', color:'var(--primary)' }}>{myRating.average}</div>
                <div style={{ fontSize:24, margin:'6px 0' }}>{'⭐'.repeat(Math.round(myRating.average))}</div>
                <div style={{ color:'var(--text-muted)' }}>Based on {myRating.count} review(s)</div>
              </div>
            ) : (
              <div className="empty-state"><span className="emoji">⭐</span><h3>No Rating Yet</h3><p>Complete jobs to earn ratings from {role==='worker'?'clients':'workers'}.</p></div>
            )}
          </div>
        )}
      </div>
      <VoiceAssistant />
    </div>
  );
}
