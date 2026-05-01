import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useApp } from '../context/AppContext';

const STATUS = {
  pending:  { label:'⏳ Pending',  cls:'badge-yellow' },
  hired:    { label:'✅ Hired',    cls:'badge-green' },
  rejected: { label:'❌ Rejected', cls:'badge-gray' },
};

export default function ApplicationsPage() {
  const { applications, jobs, user } = useApp();
  const navigate = useNavigate();

  const mine = applications
    .filter(a => a.workerId===user?.id)
    .map(a => ({ ...a, job:jobs.find(j=>j.id===a.jobId) }))
    .sort((a,b) => new Date(b.appliedAt)-new Date(a.appliedAt));

  const counts = { pending:mine.filter(a=>a.status==='pending').length, hired:mine.filter(a=>a.status==='hired').length, rejected:mine.filter(a=>a.status==='rejected').length };

  if (mine.length===0) return (
    <div className="page-wrapper">
      <div className="container" style={{ paddingTop:28 }}>
        <h1 style={{ fontFamily:'var(--font-display)', fontSize:26, marginBottom:28 }}>📋 My Applications</h1>
        <div className="empty-state">
          <span className="emoji">📭</span>
          <h3>No Applications Yet</h3>
          <p>Go to Find Jobs and apply to your first job!</p>
          <button className="btn btn-primary" style={{ marginTop:20 }} onClick={() => navigate('/worker/jobs')}>🔍 Find Jobs</button>
        </div>
      </div>
    </div>
  );

  return (
    <div className="page-wrapper" style={{ paddingBottom:40 }}>
      <div className="container" style={{ paddingTop:24 }}>
        <h1 style={{ fontFamily:'var(--font-display)', fontSize:26, marginBottom:6 }}>📋 My Applications</h1>
        <p style={{ color:'var(--text-muted)', fontSize:14, marginBottom:20 }}>{mine.length} application(s)</p>

        <div className="grid-3" style={{ marginBottom:22 }}>
          {[['⏳ Pending',counts.pending,'badge-yellow'],['✅ Hired',counts.hired,'badge-green'],['❌ Rejected',counts.rejected,'badge-gray']].map(([l,n,c]) => (
            <div key={l} className="stat-box">
              <div className="stat-num" style={{ fontSize:24 }}>{n}</div>
              <div className="stat-label">{l}</div>
            </div>
          ))}
        </div>

        {mine.map(app => {
          const cfg = STATUS[app.status]||STATUS.pending;
          return (
            <div key={app.id} className="card fade-in" style={{ marginBottom:14 }}>
              <div style={{ display:'flex', justifyContent:'space-between', alignItems:'flex-start', flexWrap:'wrap', gap:10 }}>
                <div>
                  <h3 style={{ fontSize:17, marginBottom:4 }}>{app.job?.title||'Job'}</h3>
                  <div style={{ fontSize:14, color:'var(--text-muted)', marginBottom:4 }}>📍 {app.job?.location} &nbsp;|&nbsp; 💰 ₹{app.job?.pay}/{app.job?.payType}</div>
                  <div style={{ fontSize:13, color:'var(--text-muted)' }}>Applied: {new Date(app.appliedAt).toLocaleString('en-IN',{dateStyle:'medium',timeStyle:'short'})}</div>
                </div>
                <span className={`badge ${cfg.cls}`} style={{ padding:'8px 14px', fontSize:13 }}>{cfg.label}</span>
              </div>
              {app.status==='hired' && (
                <>
                  <hr className="divider" />
                  <div style={{ display:'flex', gap:10, flexWrap:'wrap' }}>
                    <button className="btn btn-primary btn-sm" onClick={() => navigate('/worker/attendance')}>📸 Mark Attendance</button>
                    <button className="btn btn-outline btn-sm" onClick={() => navigate('/worker/submit-work')}>📤 Submit Work</button>
                    <button className="btn btn-outline btn-sm" onClick={() => navigate('/review')}>⭐ Leave Review</button>
                  </div>
                </>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
