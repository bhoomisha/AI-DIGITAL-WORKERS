import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useApp } from '../context/AppContext';
import { verifyWorkCompletion } from '../services/api';
import VoiceAssistant from '../components/VoiceAssistant';

export default function WorkSubmitPage() {
  const { user, jobs, applications, attendance, submitWorkCompletion, approveWork } = useApp();
  const navigate = useNavigate();
  const [selJobId, setSelJobId] = useState('');
  const [desc, setDesc]         = useState('');
  const [photo, setPhoto]       = useState(null);
  const [preview, setPreview]   = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [aiResult, setAiResult] = useState(null);
  const [step, setStep]         = useState('form'); // form | ai | done
  const [toast, setToast]       = useState({ msg:'', type:'' });

  const hiredApps  = applications.filter(a => a.workerId===user?.id && a.status==='hired');
  const activeJobs = jobs.filter(j => hiredApps.some(a => a.jobId===j.id));
  const daysWorked = selJobId ? attendance.filter(a => a.jobId===parseInt(selJobId) && a.workerId===user?.id).length : 0;

  function showToast(msg, type='success') { setToast({msg,type}); setTimeout(()=>setToast({msg:'',type:''}),5000); }

  function handlePhoto(e) {
    const f = e.target.files[0]; if (!f) return;
    setPhoto(f); setPreview(URL.createObjectURL(f));
  }

  async function handleSubmit() {
    if (!selJobId) { showToast('Please select a job','error'); return; }
    if (!desc || desc.length < 15) { showToast('Write a detailed description (min 15 chars)','error'); return; }
    setSubmitting(true); setStep('ai');
    try {
      const ai = await verifyWorkCompletion({ description:desc, imageDataUrl:preview });
      setAiResult(ai);
      submitWorkCompletion({ jobId:parseInt(selJobId), workerId:user?.id, workerName:user?.name||'Worker', description:desc, photoUrl:preview, aiConfidence:ai.confidence, aiApproved:ai.approved, totalDays:daysWorked });
      if (ai.approved) {
        approveWork(parseInt(selJobId), user?.id);
        showToast(`✅ AI auto-approved! ${ai.confidence}% confidence. Payment unlocked!`);
      } else {
        showToast(`⚠️ AI confidence ${ai.confidence}%. Sent to client for review.`, 'warning');
      }
      setStep('done');
    } catch { showToast('Submission failed. Try again.','error'); setStep('form'); }
    finally { setSubmitting(false); }
  }

  return (
    <div className="page-wrapper" style={{ paddingBottom:90 }}>
      <div className="container" style={{ paddingTop:24, maxWidth:600 }}>
        <h1 style={{ fontFamily:'var(--font-display)', fontSize:26, marginBottom:4 }}>📤 Submit Work</h1>
        <p style={{ color:'var(--text-muted)', fontSize:14, marginBottom:20 }}>AI verifies your completion automatically</p>

        {toast.msg && <div className={`alert alert-${toast.type==='error'?'error':toast.type==='warning'?'warning':'success'}`}>{toast.msg}</div>}

        {step==='form' && (
          <div className="card">
            <h3 style={{ fontSize:17, marginBottom:16 }}>Work Completion Details</h3>

            <div className="form-group">
              <label className="form-label">Select Job *</label>
              <select className="form-select" value={selJobId} onChange={e => setSelJobId(e.target.value)}>
                <option value="">-- Select your hired job --</option>
                {activeJobs.map(j => <option key={j.id} value={j.id}>{j.title} — {j.location}</option>)}
              </select>
              {activeJobs.length===0 && <p style={{ fontSize:12, color:'var(--text-muted)', marginTop:4 }}>No hired jobs. You must be hired first.</p>}
            </div>

            {selJobId && (
              <div style={{ background:'#fff0e8', borderRadius:10, padding:12, marginBottom:14, fontSize:13 }}>
                📅 <strong>{daysWorked}</strong> verified attendance day(s) for this job
              </div>
            )}

            <div className="form-group">
              <label className="form-label">Work Description * <span style={{ fontSize:11, color:'var(--text-muted)', fontWeight:400 }}>(AI reads this to verify)</span></label>
              <textarea className="form-textarea" style={{ minHeight:120 }}
                placeholder="Describe what you completed in detail. E.g: 'I completed painting all 3 bedrooms with 2 coats. Cleaned up after. Work done on time...'"
                value={desc} onChange={e=>setDesc(e.target.value)} />
              <div style={{ fontSize:11, color:desc.length>=15?'var(--success)':'var(--text-muted)', textAlign:'right', marginTop:3 }}>
                {desc.length} chars {desc.length>=15?'✅':'(min 15)'}
              </div>
            </div>

            <div className="form-group">
              <label className="form-label">Work Completion Photo <span style={{ fontSize:11, color:'var(--text-muted)', fontWeight:400 }}>(improves AI confidence)</span></label>
              <div onClick={() => document.getElementById('work-photo').click()} style={{ border:'2px dashed var(--border)', borderRadius:12, padding:preview?0:'28px 20px', textAlign:'center', cursor:'pointer', background:'#fdf6ee', overflow:'hidden' }}>
                {preview ? <img src={preview} alt="work" style={{ width:'100%', maxHeight:200, objectFit:'cover', borderRadius:10 }} />
                  : <><div style={{ fontSize:36, marginBottom:6 }}>🖼️</div><p style={{ fontSize:13, color:'var(--text-muted)' }}>Tap to add photo of completed work</p></>}
              </div>
              <input id="work-photo" type="file" accept="image/*" style={{ display:'none' }} onChange={handlePhoto} />
            </div>

            <div className="alert alert-info" style={{ fontSize:12, marginBottom:14 }}>
              <span className="ai-badge" style={{ marginRight:8 }}>🤖 AI</span>
              Score ≥60% → Auto approved + payment unlocked &nbsp;|&nbsp; Below 60% → Client reviews manually
            </div>

            <button className="btn btn-primary btn-full btn-lg" onClick={handleSubmit} disabled={submitting||!selJobId||desc.length<15}>
              {submitting?'🤖 AI Verifying...':'📤 Submit Work for AI Verification'}
            </button>
          </div>
        )}

        {step==='ai' && (
          <div className="card" style={{ textAlign:'center', padding:'50px 20px' }}>
            <div style={{ fontSize:70, marginBottom:16, animation:'pulse-ring 1s infinite' }}>🤖</div>
            <h3 style={{ fontSize:20, marginBottom:8 }}>AI is Verifying Your Work...</h3>
            <p style={{ color:'var(--text-muted)', fontSize:14, marginBottom:16 }}>Analysing description and photo...</p>
            <div className="progress-bar" style={{ maxWidth:260, margin:'0 auto' }}>
              <div className="progress-fill" style={{ width:'80%' }} />
            </div>
          </div>
        )}

        {step==='done' && aiResult && (
          <div className="card" style={{ textAlign:'center' }}>
            <div style={{ marginBottom:16 }}>
              <div style={{ fontSize:13, color:'var(--text-muted)', marginBottom:6 }}>AI Confidence Score</div>
              <div style={{ position:'relative', height:22, background:'var(--border)', borderRadius:99, overflow:'hidden', maxWidth:300, margin:'0 auto 8px' }}>
                <div style={{ height:'100%', width:`${aiResult.confidence}%`, background:aiResult.confidence>=60?'var(--success)':'var(--warning)', borderRadius:99, transition:'width 1.2s ease' }} />
              </div>
              <div style={{ fontSize:32, fontWeight:800, color:aiResult.approved?'var(--success)':'var(--warning)' }}>{aiResult.confidence}%</div>
            </div>
            {aiResult.approved ? (
              <>
                <div style={{ fontSize:60, marginBottom:10 }}>✅</div>
                <h3 style={{ fontSize:20, color:'var(--success)', marginBottom:6 }}>Work Auto-Approved!</h3>
                <p style={{ color:'var(--text-muted)', fontSize:14, marginBottom:16 }}>{aiResult.reason}</p>
                <div className="alert alert-success">💳 Payment is unlocked! Client can now pay you.</div>
                <div style={{ display:'flex', gap:10, marginTop:14 }}>
                  <button className="btn btn-primary" style={{ flex:1 }} onClick={() => navigate('/worker/applications')}>📋 View Applications</button>
                  <button className="btn btn-outline" onClick={() => { setStep('form'); setAiResult(null); setDesc(''); setPreview(null); setSelJobId(''); }}>Submit Another</button>
                </div>
              </>
            ) : (
              <>
                <div style={{ fontSize:60, marginBottom:10 }}>⏳</div>
                <h3 style={{ fontSize:20, color:'var(--warning)', marginBottom:6 }}>Sent for Client Review</h3>
                <p style={{ color:'var(--text-muted)', fontSize:14, marginBottom:16 }}>{aiResult.reason}</p>
                <div className="alert alert-info">Client will review and approve/reject. You will get a notification.</div>
                <button className="btn btn-outline btn-full" style={{ marginTop:14 }} onClick={() => navigate('/worker/applications')}>📋 View Applications</button>
              </>
            )}
          </div>
        )}
      </div>
      <VoiceAssistant />
    </div>
  );
}
