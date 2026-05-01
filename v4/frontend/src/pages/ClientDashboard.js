import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useApp } from '../context/AppContext';

export default function ClientDashboard() {
  const { user, jobs, applications, workCompletions, payments, notifications, getUserRating } = useApp();
  const navigate = useNavigate();

  const myJobs    = jobs.filter(j => j.clientId === user?.id);
  const myApps    = applications.filter(a => myJobs.some(j => j.id === a.jobId));
  const pending   = workCompletions.filter(wc => myJobs.some(j => j.id === wc.jobId) && wc.status === 'pending_approval');
  const myPay     = payments.filter(p => p.clientId === user?.id);
  const unread    = notifications.filter(n => n.userId === user?.id && !n.is_read);
  const rating    = getUserRating(user?.id);

  // Recent activity
  const activity = [
    ...myJobs.slice(0,3).map(j => ({ time:j.postedAt, text:`Posted "${j.title}"`, color:'var(--brand)' })),
    ...myApps.slice(0,3).map(a => { const j=myJobs.find(j=>j.id===a.jobId); return { time:a.appliedAt, text:`New applicant for "${j?.title||'Job'}"`, color:'var(--success)' }; }),
    ...myPay.slice(0,2).map(p => ({ time:p.paidAt, text:`Payment ₹${p.amount} completed`, color:'var(--accent)' })),
  ].sort((a,b) => new Date(b.time)-new Date(a.time)).slice(0,6);

  const statusMap = {
    open:             { label:'Open',           color:'var(--success)',  bg:'var(--success-bg)' },
    assigned:         { label:'Assigned',       color:'var(--brand)',    bg:'var(--brand-light)' },
    pending_approval: { label:'Pending Review', color:'var(--warning)',  bg:'var(--warning-bg)' },
    completed:        { label:'Completed',      color:'var(--success)',  bg:'var(--success-bg)' },
    paid:             { label:'Paid',           color:'var(--accent)',   bg:'#f5f3ff' },
    rework_required:  { label:'Rework',         color:'var(--danger)',   bg:'var(--danger-bg)' },
  };

  return (
    <div className="page" style={{ paddingBottom:40 }}>
      <div className="container" style={{ paddingTop:24 }}>

        {unread.length > 0 && <div className="alert alert-info" style={{ marginBottom:16 }}>🔔 {unread.length} new notification{unread.length>1?'s':''} — <button onClick={()=>navigate('/notifications')} style={{ background:'none',border:'none',color:'var(--info)',fontWeight:700,cursor:'pointer',fontSize:14 }}>View →</button></div>}
        {pending.length > 0 && <div className="alert alert-warning" style={{ marginBottom:16 }}>⚠️ {pending.length} work submission{pending.length>1?'s':''} need your review! <button onClick={()=>navigate('/client/applicants')} style={{ background:'none',border:'none',color:'var(--warning)',fontWeight:700,cursor:'pointer',fontSize:14 }}>Review now →</button></div>}

        {/* ── Header ── */}
        <div style={{ marginBottom:28 }}>
          <h1 style={{ fontSize:22, fontWeight:700, marginBottom:4 }}>
            Good {getGreeting()}! 👋
          </h1>
          <p style={{ color:'var(--text-muted)', fontSize:14 }}>
            Here's what's happening with your jobs today.
            {rating && ` · ⭐ ${rating.average}/5 rating`}
          </p>
        </div>

        {/* ── Stats ── */}
        <div className="grid-4" style={{ marginBottom:28 }}>
          {[
            { icon:'💼', label:'Total Jobs Posted',  value:myJobs.length, bg:'#eff6ff', change:myJobs.filter(j=>new Date(j.postedAt)>new Date(Date.now()-7*86400000)).length ? `+${myJobs.filter(j=>new Date(j.postedAt)>new Date(Date.now()-7*86400000)).length} this week` : null },
            { icon:'👥', label:'Total Applicants',   value:myApps.length, bg:'#f0fdf4' },
            { icon:'✅', label:'Hired Workers',       value:myApps.filter(a=>a.status==='hired').length, bg:'#fdf4ff' },
            { icon:'💳', label:'Payments Made',      value:`₹${myPay.reduce((s,p)=>s+p.amount,0).toLocaleString('en-IN')}`, bg:'#fefce8' },
          ].map(s => (
            <div key={s.label} className="stat-card">
              <div className="stat-card__icon" style={{ background:s.bg, fontSize:20 }}>{s.icon}</div>
              <div className="stat-card__value" style={{ fontSize:s.label.includes('Payment')?20:28 }}>{s.value}</div>
              <div className="stat-card__label">{s.label}</div>
              {s.change && <span className="stat-card__change up">↑ {s.change}</span>}
            </div>
          ))}
        </div>

        {/* ── Quick actions ── */}
        <div style={{ display:'flex', gap:10, flexWrap:'wrap', marginBottom:32 }}>
          <button className="btn btn-primary" onClick={()=>navigate('/client/post-job')}>➕ Post New Job</button>
          <button className="btn btn-ghost"   onClick={()=>navigate('/client/applicants')}>👥 View Applicants</button>
          <button className="btn btn-ghost"   onClick={()=>navigate('/client/payment')}>💳 Make Payment</button>
          <button className="btn btn-ghost"   onClick={()=>navigate('/review')}>⭐ Reviews</button>
        </div>

        <div style={{ display:'grid', gridTemplateColumns:'1fr 300px', gap:24, alignItems:'start' }}>

          {/* ── Jobs list ── */}
          <div>
            <div className="section-header">
              <span className="section-title">📋 Posted Jobs</span>
              <button className="btn btn-ghost btn-sm" onClick={()=>navigate('/client/post-job')}>+ New Job</button>
            </div>
            {myJobs.length === 0
              ? (
                <div className="card" style={{ textAlign:'center', padding:40 }}>
                  <div style={{ fontSize:48, marginBottom:12 }}>📭</div>
                  <h3 style={{ marginBottom:6, fontSize:16 }}>No Jobs Posted Yet</h3>
                  <p style={{ color:'var(--text-muted)', marginBottom:20, fontSize:14 }}>Post your first job to start finding skilled workers</p>
                  <button className="btn btn-primary" onClick={()=>navigate('/client/post-job')}>➕ Post a Job</button>
                </div>
              )
              : myJobs.map(job => {
                const st = statusMap[job.status] || statusMap.open;
                const jobApps = myApps.filter(a=>a.jobId===job.id);
                return (
                  <div key={job.id} className="card" style={{ marginBottom:12 }}>
                    <div style={{ display:'flex', justifyContent:'space-between', alignItems:'flex-start', gap:12, flexWrap:'wrap' }}>
                      <div style={{ flex:1 }}>
                        <div style={{ display:'flex', alignItems:'center', gap:8, marginBottom:6 }}>
                          <h3 style={{ fontSize:15, fontWeight:600 }}>{job.title}</h3>
                          <span style={{ padding:'3px 9px', borderRadius:99, fontSize:11, fontWeight:700, background:st.bg, color:st.color }}>{st.label}</span>
                        </div>
                        <div style={{ display:'flex', flexWrap:'wrap', gap:5, marginBottom:8 }}>
                          {(job.skills||[]).map(s=><span key={s} className="badge badge-blue">{s}</span>)}
                        </div>
                        <div style={{ fontSize:13, color:'var(--text-muted)', display:'flex', gap:16, flexWrap:'wrap' }}>
                          <span>📍 {job.location}</span>
                          <span style={{ fontWeight:job.payType==='fixed'?600:400, color:job.payType==='fixed'?'var(--brand)':'inherit' }}>
                            💰 {job.payType==='fixed'?`₹${job.pay} fixed`:`₹${job.pay}/${job.payType}`}
                          </span>
                          <span>👥 {jobApps.length} applied</span>
                          <span>📅 {new Date(job.postedAt).toLocaleDateString('en-IN')}</span>
                        </div>
                      </div>
                    </div>
                    <hr className="divider" />
                    <div style={{ display:'flex', gap:8, flexWrap:'wrap' }}>
                      <button className="btn btn-ghost btn-xs" onClick={()=>navigate('/client/applicants')}>👥 Applicants</button>
                      {job.paymentUnlocked && job.status!=='paid' && <button className="btn btn-primary btn-xs" onClick={()=>navigate('/client/payment')}>💳 Pay Worker</button>}
                      {job.status==='paid' && <span className="badge badge-green" style={{ padding:'5px 12px', alignSelf:'center' }}>💳 Paid</span>}
                      {job.status==='pending_approval' && <button className="btn btn-xs" style={{ background:'var(--warning-bg)', color:'var(--warning)', border:'none' }} onClick={()=>navigate('/client/applicants')}>⏳ Review Work</button>}
                    </div>
                  </div>
                );
              })
            }
          </div>

          {/* ── Sidebar: Activity ── */}
          <div>
            <div className="card">
              <div className="section-header" style={{ marginBottom:14 }}>
                <span style={{ fontWeight:600, fontSize:14 }}>Recent Activity</span>
              </div>
              {activity.length === 0
                ? <p style={{ fontSize:13, color:'var(--text-muted)' }}>No activity yet. Post your first job!</p>
                : activity.map((a,i) => (
                  <div key={i} className="feed-item">
                    <div className="feed-dot" style={{ background:a.color }} />
                    <div style={{ flex:1 }}>
                      <div style={{ fontSize:13, color:'var(--text-2)', lineHeight:1.4 }}>{a.text}</div>
                      <div style={{ fontSize:11, color:'var(--text-faint)', marginTop:2 }}>
                        {new Date(a.time).toLocaleString('en-IN',{dateStyle:'short',timeStyle:'short'})}
                      </div>
                    </div>
                  </div>
                ))
              }
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}

function getGreeting() {
  const h = new Date().getHours();
  if (h < 12) return 'morning';
  if (h < 17) return 'afternoon';
  return 'evening';
}
