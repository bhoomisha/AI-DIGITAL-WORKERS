import React from 'react';
import { matchColor, matchLabel } from '../services/api';

export default function ProfileCard({ worker, matchScore, showHire=false, hired=false, onHire }) {
  const initials = (worker.name||'U').split(' ').map(n=>n[0]).join('').toUpperCase().slice(0,2);
  const mc = matchScore !== undefined ? matchColor(matchScore) : null;
  const ml = matchScore !== undefined ? matchLabel(matchScore) : null;

  return (
    <div className="card" style={{ marginBottom:14 }}>
      <div style={{ display:'flex', gap:14, alignItems:'flex-start' }}>
        <div className="avatar" style={{ width:54, height:54, fontSize:18, background:'var(--brand)' }}>{initials}</div>
        <div style={{ flex:1 }}>
          <div style={{ display:'flex', justifyContent:'space-between', alignItems:'flex-start', flexWrap:'wrap', gap:8 }}>
            <div>
              <h3 style={{ fontSize:17, marginBottom:2 }}>{worker.name}</h3>
              <div style={{ fontSize:13, color:'var(--text-muted)' }}>📱 {worker.phone}</div>
              <div style={{ fontSize:13, color:'var(--text-muted)' }}>📍 {worker.location}</div>
            </div>
            {matchScore !== undefined && (
              <div style={{ textAlign:'center' }}>
                <div style={{ width:52, height:52, borderRadius:'50%', background:mc, display:'flex', alignItems:'center', justifyContent:'center', fontSize:13, fontWeight:800, color:'#fff' }}>{matchScore}%</div>
                <div style={{ fontSize:9, color:mc, marginTop:3, fontWeight:800 }}>{ml?.toUpperCase()}</div>
              </div>
            )}
          </div>
          <div style={{ display:'flex', flexWrap:'wrap', gap:6, margin:'8px 0' }}>
            {(worker.skills||[]).map(s => <span key={s} className="badge badge-blue">{s}</span>)}
          </div>
          <div style={{ display:'flex', flexWrap:'wrap', gap:12, fontSize:13, color:'var(--text-muted)' }}>
            <span>🛠 {worker.experience} yrs</span>
            {worker.rating ? <span style={{ color:'#d97706', fontWeight:600 }}>⭐ {worker.rating}/5</span> : <span className="badge badge-gray">New</span>}
            <span>✅ {worker.jobsDone||0} jobs</span>
            <span style={{ color:worker.availability==='available'||worker.availability===true?'var(--success)':'var(--danger)', fontWeight:600 }}>
              {worker.availability==='available'||worker.availability===true?'🟢 Available':'🔴 Busy'}
            </span>
          </div>
          {matchScore !== undefined && (
            <div style={{ marginTop:8, height:5, background:'var(--gray-200)', borderRadius:99, overflow:'hidden' }}>
              <div style={{ height:'100%', width:matchScore+'%', background:mc, borderRadius:99, transition:'width .6s ease' }} />
            </div>
          )}
        </div>
      </div>
      {showHire && (<><hr className="divider" /><div style={{ display:'flex', justifyContent:'flex-end' }}>{hired?<span className="badge badge-green" style={{ padding:'8px 16px', fontSize:13 }}>✅ Hired</span>:<button className="btn btn-primary btn-sm" onClick={()=>onHire&&onHire(worker)}>Hire Worker</button>}</div></>)}
    </div>
  );
}
