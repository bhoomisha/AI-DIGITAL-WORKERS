import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useApp } from '../context/AppContext';
import NavigatorHelper, { StepGuide } from '../components/NavigatorHelper';

const SKILLS  = ['Painting','Electrician','Plumbing','Carpentry','AC Technician','Masonry','Welding','Tiling','Gardening','Cleaning','Driving','Security Guard'];
const CATS    = ['Painting','Electrician','Plumbing','Carpentry','AC Technician','Masonry','Welding','Tiling','Gardening','Cleaning','Driving','Security'];
const STEPS   = ['Job Details','Requirements','Payment','Review'];

export default function PostJobPage() {
  const { postJob, user } = useApp();
  const navigate = useNavigate();
  const [step, setStep]   = useState(0);
  const [posting, setPosting] = useState(false);
  const [success, setSuccess] = useState(false);
  const [postedJob, setPostedJob] = useState(null);
  const [form, setForm] = useState({ title:'', category:'', location:'', description:'', skills:[], experience:'', duration:'', durationUnit:'days', workers:'1', pay:'', payType:'daily', urgency:'normal', startDate:'' });

  const upd = (k,v) => setForm(f => ({ ...f, [k]:v }));
  const toggleSkill = s => setForm(f => ({ ...f, skills:f.skills.includes(s)?f.skills.filter(x=>x!==s):[...f.skills,s] }));

  async function handlePost() {
    setPosting(true);
    await new Promise(r => setTimeout(r, 800));
    const job = postJob({ ...form, distance:+(Math.random()*10+1).toFixed(1), clientId:user?.id, clientName:'Client', clientRating:null });
    setPostedJob(job); setPosting(false); setSuccess(true);
  }

  if (success && postedJob) return (
    <div className="page-wrapper"><div className="container" style={{ paddingTop:60, maxWidth:480, textAlign:'center' }}>
      <div style={{ fontSize:80, marginBottom:16 }}>🎉</div>
      <h2 style={{ fontFamily:'var(--font-display)', fontSize:28, marginBottom:8 }}>Job Posted!</h2>
      <p style={{ color:'var(--text-muted)', fontSize:15, marginBottom:28 }}>"{postedJob.title}" is now live. Workers will start applying.</p>
      <div style={{ display:'flex', flexDirection:'column', gap:12 }}>
        <button className="btn btn-primary btn-lg" onClick={() => navigate('/client/applicants')}>👥 View Applicants</button>
        <button className="btn btn-outline btn-lg" onClick={() => navigate('/client/dashboard')}>🏠 Back to Dashboard</button>
        <button className="btn btn-outline btn-lg" onClick={() => { setSuccess(false); setStep(0); setForm({ title:'',category:'',location:'',description:'',skills:[],experience:'',duration:'',durationUnit:'days',workers:'1',pay:'',payType:'daily',urgency:'normal',startDate:'' }); }}>➕ Post Another Job</button>
      </div>
    </div></div>
  );

  return (
    <div className="page-wrapper" style={{ paddingBottom:40 }}>
      <div className="container" style={{ paddingTop:24, maxWidth:600 }}>
        <h1 style={{ fontFamily:'var(--font-display)', fontSize:26, marginBottom:4 }}>➕ Post a Job</h1>
        <p style={{ color:'var(--text-muted)', fontSize:14, marginBottom:24 }}>Fill details to find the right worker</p>
        <StepGuide steps={STEPS} current={step} />

        <div className="card">
          {step===0 && (
            <div className="fade-in">
              <h2 style={{ fontSize:20, marginBottom:20 }}>📋 Job Details</h2>
              {[
                { label:'Job Title *', key:'title', placeholder:'e.g. House Painting – 2BHK', tip:'Write a clear title so workers understand the job', step:1 },
                { label:'Location *', key:'location', placeholder:'e.g. Sector 14, Noida', tip:'Enter exact work location', step:3 },
              ].map(f => (
                <div className="form-group" key={f.key}>
                  <label className="form-label">{f.label}</label>
                  <NavigatorHelper tip={f.tip} step={f.step}><input className="form-input" placeholder={f.placeholder} value={form[f.key]} onChange={e=>upd(f.key,e.target.value)} /></NavigatorHelper>
                </div>
              ))}
              <div className="form-group">
                <label className="form-label">Category *</label>
                <NavigatorHelper tip="Select main work type — used for AI matching" step={2}>
                  <select className="form-select" value={form.category} onChange={e=>upd('category',e.target.value)}>
                    <option value="">Select Category</option>
                    {CATS.map(c => <option key={c}>{c}</option>)}
                  </select>
                </NavigatorHelper>
              </div>
              <div className="form-group">
                <label className="form-label">Description</label>
                <NavigatorHelper tip="Describe work scope, materials provided, special requirements" step={4} position="bottom">
                  <textarea className="form-textarea" placeholder="Describe what work needs to be done..." value={form.description} onChange={e=>upd('description',e.target.value)} />
                </NavigatorHelper>
              </div>
              <div className="form-group">
                <label className="form-label">Urgency</label>
                <div style={{ display:'flex', gap:10 }}>
                  {[['normal','🟡 Normal'],['urgent','🔴 Urgent']].map(([v,l]) => (
                    <button key={v} type="button" onClick={()=>upd('urgency',v)} style={{ flex:1, padding:12, borderRadius:10, border:`2px solid ${form.urgency===v?'var(--primary)':'var(--border)'}`, background:form.urgency===v?'#fff0e8':'#fff', cursor:'pointer', fontWeight:600, fontSize:14 }}>{l}</button>
                  ))}
                </div>
              </div>
            </div>
          )}

          {step===1 && (
            <div className="fade-in">
              <h2 style={{ fontSize:20, marginBottom:14 }}>🛠 Required Skills</h2>
              <p style={{ color:'var(--text-muted)', fontSize:14, marginBottom:14 }}>Select skills — used for AI worker matching</p>
              <div style={{ display:'flex', flexWrap:'wrap', gap:10, marginBottom:20 }}>
                {SKILLS.map(s => <button key={s} type="button" onClick={()=>toggleSkill(s)} className={`skill-btn ${form.skills.includes(s)?'selected':''}`}>{form.skills.includes(s)?'✓ ':''}{s}</button>)}
              </div>
              <div className="form-group">
                <label className="form-label">Minimum Experience</label>
                <select className="form-select" value={form.experience} onChange={e=>upd('experience',e.target.value)}>
                  <option value="">Any experience</option>
                  {['Less than 1 year','1-2 years','3-5 years','5+ years'].map(o=><option key={o}>{o}</option>)}
                </select>
              </div>
              <div className="form-group">
                <label className="form-label">Workers Needed</label>
                <input className="form-input" type="number" min="1" max="50" value={form.workers} onChange={e=>upd('workers',e.target.value)} />
              </div>
              <div className="form-group">
                <label className="form-label">Expected Start Date</label>
                <input className="form-input" type="date" value={form.startDate} onChange={e=>upd('startDate',e.target.value)} min={new Date().toISOString().split('T')[0]} />
              </div>
            </div>
          )}

          {step===2 && (
            <div className="fade-in">
              <h2 style={{ fontSize:20, marginBottom:20 }}>💰 Payment Details</h2>
              <div className="form-group">
                <label className="form-label">Pay Amount (₹) *</label>
                <NavigatorHelper tip="How much you will pay per day or fixed amount" step={1}>
                  <input className="form-input" type="number" placeholder="e.g. 800" value={form.pay} onChange={e=>upd('pay',e.target.value)} />
                </NavigatorHelper>
              </div>
              <div className="form-group">
                <label className="form-label">Pay Type</label>
                <div style={{ display:'flex', gap:10 }}>
                  {[['daily','📅 Per Day'],['fixed','💵 Fixed'],['hourly','🕐 Per Hour']].map(([v,l]) => (
                    <button key={v} type="button" onClick={()=>upd('payType',v)} style={{ flex:1, padding:12, borderRadius:10, border:`2px solid ${form.payType===v?'var(--primary)':'var(--border)'}`, background:form.payType===v?'#fff0e8':'#fff', cursor:'pointer', fontWeight:600, fontSize:13 }}>{l}</button>
                  ))}
                </div>
              </div>
              <div className="form-group">
                <label className="form-label">Duration</label>
                <div style={{ display:'flex', gap:10 }}>
                  <input className="form-input" type="number" placeholder="e.g. 3" value={form.duration} onChange={e=>upd('duration',e.target.value)} style={{ flex:1 }} />
                  <select className="form-select" value={form.durationUnit} onChange={e=>upd('durationUnit',e.target.value)} style={{ flex:1 }}>
                    <option value="days">Days</option>
                    <option value="weeks">Weeks</option>
                    <option value="months">Months</option>
                  </select>
                </div>
              </div>
            </div>
          )}

          {step===3 && (
            <div className="fade-in">
              <h2 style={{ fontSize:20, marginBottom:20 }}>✅ Review Job</h2>
              <div style={{ background:'var(--bg)', borderRadius:12, padding:20 }}>
                <h3 style={{ fontSize:18, marginBottom:6 }}>{form.title||'—'}</h3>
                <div style={{ display:'flex', flexWrap:'wrap', gap:6, marginBottom:10 }}>
                  {form.skills.map(s=><span key={s} className="badge badge-orange">{s}</span>)}
                  {form.skills.length===0 && <span className="badge badge-gray">No skills selected</span>}
                </div>
                <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:'6px 16px', fontSize:13, color:'var(--text-muted)' }}>
                  <span>📍 {form.location||'—'}</span><span>🏷 {form.category||'—'}</span>
                  <span>💰 ₹{form.pay||'—'}/{form.payType}</span><span>⏱ {form.duration||'—'} {form.durationUnit}</span>
                  <span>👥 {form.workers} worker(s)</span><span>{form.urgency==='urgent'?'🔴 Urgent':'🟡 Normal'}</span>
                  {form.startDate&&<span>📅 Start: {form.startDate}</span>}
                </div>
                {form.description&&<p style={{ marginTop:10, fontSize:13, color:'var(--text-muted)' }}>{form.description}</p>}
              </div>
              {form.pay&&form.duration&&(
                <div className="alert alert-info" style={{ marginTop:14, fontSize:13 }}>
                  💡 Estimated: ₹{form.pay} × {form.workers} worker × {form.duration} {form.durationUnit} = <strong>₹{parseInt(form.pay)*parseInt(form.workers)*(parseInt(form.duration)||1)}</strong>
                </div>
              )}
            </div>
          )}

          <div style={{ display:'flex', gap:12, marginTop:28 }}>
            {step>0&&<button className="btn btn-outline" onClick={()=>setStep(s=>s-1)}>← Back</button>}
            {step<3
              ? <button className="btn btn-primary" style={{ flex:1 }} onClick={()=>setStep(s=>s+1)} disabled={step===0&&(!form.title||!form.category||!form.location)}>Next →</button>
              : <button className="btn btn-primary" style={{ flex:1 }} onClick={handlePost} disabled={posting||!form.pay}>{posting?'⏳ Posting...':'🚀 Post Job'}</button>
            }
          </div>
        </div>
      </div>
    </div>
  );
}
