import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useApp } from '../context/AppContext';
import NavigatorHelper, { StepGuide } from '../components/NavigatorHelper';
import FaceVerification from '../components/FaceVerification';

const SKILLS = ['Painting','Electrician','Plumbing','Carpentry','AC Technician','Masonry','Welding','Tiling','Gardening','Cleaning','Driving','Security Guard'];
const STEPS  = ['Basic Info','Skills','Work Prefs','Face Photo','Review'];

export default function WorkerProfileSetup() {
  const { user, setWorkerProfile } = useApp();
  const navigate = useNavigate();
  const [step, setStep] = useState(0);
  const [saving, setSaving] = useState(false);
  const [faceCaptureDone, setFaceCaptureDone] = useState(false);
  const [form, setForm] = useState({
    name:'', phone:user?.phone||'', location:'', pincode:'',
    skills:[], experience:'', dailyRate:'', availability:'available', bio:'',
    facePhoto:null, faceDescriptor:null,
  });

  const upd = (k,v) => setForm(f => ({ ...f, [k]:v }));
  const toggleSkill = s => setForm(f => ({ ...f, skills: f.skills.includes(s) ? f.skills.filter(x=>x!==s) : [...f.skills,s] }));

  async function handleFinish() {
    setSaving(true);
    await new Promise(r => setTimeout(r, 800));
    setWorkerProfile({
      id: user?.id,
      name: form.name,
      phone: form.phone,
      location: form.location,
      pincode: form.pincode,
      skills: form.skills,
      experience: parseInt(form.experience) || 0,
      dailyRate: parseInt(form.dailyRate) || 0,
      availability: form.availability,
      bio: form.bio,
      facePhoto: form.facePhoto,
      faceDescriptor: form.faceDescriptor,
      rating: null,
      jobsDone: 0,
      joinedAt: new Date().toISOString(),
    });
    setSaving(false);
    navigate('/worker/dashboard');
  }

  const step0Valid = form.name && form.phone && form.location;
  const step1Valid = form.skills.length > 0;

  return (
    <div style={{ minHeight:'100vh', background:'var(--bg)', padding:'32px 20px 60px' }}>
      <div style={{ maxWidth:560, margin:'0 auto' }}>
        <div style={{ textAlign:'center', marginBottom:24 }}>
          <h1 style={{ fontFamily:'var(--font-display)', fontSize:26 }}>Create Your Profile</h1>
          <p style={{ color:'var(--text-muted)', fontSize:14 }}>Complete all steps to get better job matches</p>
        </div>
        <StepGuide steps={STEPS} current={step} />

        <div className="card">
          {/* STEP 0 */}
          {step===0 && (
            <div className="fade-in">
              <h2 style={{ fontSize:20, marginBottom:20 }}>👤 Basic Information</h2>
              {[
                { label:'Full Name *', key:'name', placeholder:'e.g. Raju Mistri', tip:'Enter your full name as on Aadhaar card', step:1 },
                { label:'Mobile Number *', key:'phone', placeholder:'10-digit mobile', tip:'Your registered mobile for job alerts', step:2, type:'tel' },
                { label:'Your Area / Location *', key:'location', placeholder:'e.g. Sector 62, Noida', tip:'Enter your area name to show nearby jobs', step:3 },
                { label:'PIN Code', key:'pincode', placeholder:'e.g. 201301', tip:'Your PIN code helps find closest jobs', step:4, maxLen:6 },
              ].map(f => (
                <div className="form-group" key={f.key}>
                  <label className="form-label">{f.label}</label>
                  <NavigatorHelper tip={f.tip} step={f.step} position={f.step===4?'bottom':'top'}>
                    <input className="form-input" type={f.type||'text'} placeholder={f.placeholder} value={form[f.key]} onChange={e => upd(f.key, f.maxLen ? e.target.value.replace(/\D/g,'').slice(0,f.maxLen) : e.target.value)} />
                  </NavigatorHelper>
                </div>
              ))}
            </div>
          )}

          {/* STEP 1 */}
          {step===1 && (
            <div className="fade-in">
              <h2 style={{ fontSize:20, marginBottom:8 }}>🛠 Your Skills</h2>
              <p style={{ color:'var(--text-muted)', fontSize:14, marginBottom:16 }}>Select all skills you have (used for AI matching)</p>
              <div style={{ display:'flex', flexWrap:'wrap', gap:10 }}>
                {SKILLS.map(s => (
                  <button key={s} type="button" onClick={() => toggleSkill(s)} className={`skill-btn ${form.skills.includes(s)?'selected':''}`}>
                    {form.skills.includes(s)?'✓ ':''}{s}
                  </button>
                ))}
              </div>
              {form.skills.length===0 && <div className="alert alert-info" style={{ marginTop:16 }}>💡 Select at least one skill to get job recommendations</div>}
            </div>
          )}

          {/* STEP 2 */}
          {step===2 && (
            <div className="fade-in">
              <h2 style={{ fontSize:20, marginBottom:20 }}>⚙️ Work Preferences</h2>
              <div className="form-group">
                <label className="form-label">Years of Experience *</label>
                <NavigatorHelper tip="More experience = higher AI match score for experienced jobs" step={1}>
                  <select className="form-select" value={form.experience} onChange={e => upd('experience', e.target.value)}>
                    <option value="">Select experience</option>
                    {[['<1','Less than 1 year'],['1','1 year'],['2','2 years'],['3','3 years'],['5','5 years'],['8','8 years'],['10','10+ years']].map(([v,l]) => <option key={v} value={v}>{l}</option>)}
                  </select>
                </NavigatorHelper>
              </div>
              <div className="form-group">
                <label className="form-label">Expected Daily Rate (₹)</label>
                <NavigatorHelper tip="How much do you charge per day? Clients see this." step={2}>
                  <input className="form-input" type="number" placeholder="e.g. 800" value={form.dailyRate} onChange={e => upd('dailyRate', e.target.value)} />
                </NavigatorHelper>
              </div>
              <div className="form-group">
                <label className="form-label">Availability</label>
                <div style={{ display:'flex', gap:10 }}>
                  {[['available','🟢 Available Now'],['busy','🔴 Currently Busy']].map(([v,l]) => (
                    <button key={v} type="button" onClick={() => upd('availability',v)} style={{ flex:1, padding:12, borderRadius:10, border:`2px solid ${form.availability===v?'var(--primary)':'var(--border)'}`, background:form.availability===v?'#fff0e8':'#fff', cursor:'pointer', fontWeight:600, fontSize:14 }}>{l}</button>
                  ))}
                </div>
              </div>
              <div className="form-group">
                <label className="form-label">About Yourself</label>
                <textarea className="form-textarea" placeholder="Describe your work experience and specialties..." value={form.bio} onChange={e => upd('bio', e.target.value)} />
              </div>
            </div>
          )}

          {/* STEP 3: Face Photo */}
          {step===3 && (
            <div className="fade-in">
              <h2 style={{ fontSize:20, marginBottom:8 }}>📸 Face Photo</h2>
              <p style={{ color:'var(--text-muted)', fontSize:14, marginBottom:6 }}>This photo is used for attendance verification using AI</p>
              <div className="alert alert-info" style={{ fontSize:12, marginBottom:16 }}>
                🤖 Your face photo will be compared with your selfie at attendance time using AI face recognition.
                Threshold: 55% match required to mark attendance.
              </div>
              <FaceVerification
                mode="capture"
                onCapture={(b64, descriptor) => {
                  upd('facePhoto', b64);
                  upd('faceDescriptor', descriptor);
                  setFaceCaptureDone(true);
                }}
                onError={() => setFaceCaptureDone(true)}
              />
              {faceCaptureDone && <div className="alert alert-success" style={{ marginTop:12 }}>✅ Face photo saved! You can proceed.</div>}
              <button className="btn btn-outline btn-sm" style={{ marginTop:10 }} onClick={() => { upd('facePhoto', null); upd('faceDescriptor', null); setFaceCaptureDone(true); }}>
                Skip (not recommended)
              </button>
            </div>
          )}

          {/* STEP 4: Review */}
          {step===4 && (
            <div className="fade-in">
              <h2 style={{ fontSize:20, marginBottom:20 }}>✅ Review Your Profile</h2>
              <div style={{ background:'var(--bg)', borderRadius:12, padding:20 }}>
                <div style={{ display:'flex', gap:16, alignItems:'center', marginBottom:16 }}>
                  {form.facePhoto
                    ? <img src={form.facePhoto} alt="face" style={{ width:60, height:60, borderRadius:'50%', objectFit:'cover', border:'3px solid var(--primary)' }} />
                    : <div className="avatar" style={{ width:60, height:60, fontSize:24 }}>{form.name?form.name[0]:'?'}</div>
                  }
                  <div>
                    <h3 style={{ fontSize:18 }}>{form.name||'—'}</h3>
                    <div style={{ color:'var(--text-muted)', fontSize:14 }}>📱 {form.phone||'—'}</div>
                    <div style={{ color:'var(--text-muted)', fontSize:14 }}>📍 {form.location||'—'}</div>
                  </div>
                </div>
                <div style={{ display:'flex', flexWrap:'wrap', gap:6, marginBottom:10 }}>
                  {form.skills.map(s => <span key={s} className="badge badge-orange">{s}</span>)}
                </div>
                <div style={{ display:'flex', flexWrap:'wrap', gap:16, fontSize:14, color:'var(--text-muted)' }}>
                  <span>🛠 {form.experience||'—'} yrs exp</span>
                  <span>💰 ₹{form.dailyRate||'—'}/day</span>
                  <span>{form.availability==='available'?'🟢 Available':'🔴 Busy'}</span>
                  <span>{form.facePhoto?'📸 Face verified':'⚠️ No face photo'}</span>
                </div>
                {form.bio && <p style={{ marginTop:10, fontSize:14, color:'var(--text-muted)' }}>{form.bio}</p>}
              </div>
            </div>
          )}

          {/* Navigation */}
          <div style={{ display:'flex', gap:12, marginTop:28 }}>
            {step > 0 && <button className="btn btn-outline" onClick={() => setStep(s=>s-1)}>← Back</button>}
            {step < 4 ? (
              <button className="btn btn-primary" style={{ flex:1 }} onClick={() => setStep(s=>s+1)}
                disabled={(step===0&&!step0Valid)||(step===1&&!step1Valid)||(step===3&&!faceCaptureDone&&!form.facePhoto)}>
                Next →
              </button>
            ) : (
              <button className="btn btn-primary" style={{ flex:1 }} onClick={handleFinish} disabled={saving}>
                {saving?'⏳ Saving...':'🚀 Complete Setup'}
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
