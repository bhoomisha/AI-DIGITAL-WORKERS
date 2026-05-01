import React from 'react';
import { matchClass, matchColor, matchLabel } from '../services/api';

/* ══════════════════════════════════════════════
   AI Match Score Visualization:
   > 60%  → Green  (Good Match)
   25–60% → Yellow (Moderate Match)
   < 25%  → Red    (Poor Match)
══════════════════════════════════════════════ */

export function MatchScoreBadge({ score, size = 'md' }) {
  const cls   = matchClass(score);
  const color = matchColor(score);
  const label = matchLabel(score);

  const sizes = { sm:{ ring:44, font:12 }, md:{ ring:56, font:13 }, lg:{ ring:68, font:15 } };
  const s = sizes[size] || sizes.md;

  return (
    <div style={{ textAlign:'center', flexShrink:0 }}>
      {/* Circular ring */}
      <div style={{ position:'relative', width:s.ring, height:s.ring, margin:'0 auto' }}>
        {/* Background ring */}
        <svg width={s.ring} height={s.ring} style={{ position:'absolute', top:0, left:0 }}>
          <circle cx={s.ring/2} cy={s.ring/2} r={s.ring/2-3} fill="none" stroke={`${color}25`} strokeWidth={4} />
          <circle
            cx={s.ring/2} cy={s.ring/2} r={s.ring/2-3} fill="none"
            stroke={color} strokeWidth={4}
            strokeDasharray={`${(2*Math.PI*(s.ring/2-3)) * score/100} ${2*Math.PI*(s.ring/2-3)}`}
            strokeLinecap="round"
            transform={`rotate(-90 ${s.ring/2} ${s.ring/2})`}
            style={{ transition:'stroke-dasharray .6s ease' }}
          />
        </svg>
        <div style={{ position:'absolute', inset:0, display:'flex', alignItems:'center', justifyContent:'center', fontSize:s.font, fontWeight:800, color }}>
          {score}%
        </div>
      </div>
      {/* Label */}
      <div style={{ fontSize:10, fontWeight:700, color, marginTop:3, letterSpacing:.03 }}>
        {label.toUpperCase()}
      </div>
    </div>
  );
}

export function MatchScoreBar({ score, showLabel = true }) {
  const cls   = matchClass(score);
  const color = matchColor(score);
  const label = matchLabel(score);

  return (
    <div>
      <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:4 }}>
        {showLabel && <span style={{ fontSize:12, color:'var(--text-muted)' }}>AI Match</span>}
        <span style={{ fontSize:12, fontWeight:700, color }}>{score}% · {label}</span>
      </div>
      <div className="match-bar-wrap">
        <div className={`match-bar-fill ${cls}`} style={{ width:`${score}%` }} />
      </div>
    </div>
  );
}

const STATUS_MAP = {
  open:             { label:'Open',           badge:'badge-green' },
  assigned:         { label:'Assigned',       badge:'badge-blue' },
  pending_approval: { label:'Pending Review', badge:'badge-yellow' },
  completed:        { label:'Completed',      badge:'badge-green' },
  paid:             { label:'Paid',           badge:'badge-purple' },
  rework_required:  { label:'Rework',         badge:'badge-red' },
};

export default function JobCard({ job, matchScore, showApply=false, onApply, applied=false, showStatus=false }) {
  const st = STATUS_MAP[job.status] || STATUS_MAP.open;

  return (
    <div className="card card-hover" style={{ marginBottom:14 }}>
      <div style={{ display:'flex', justifyContent:'space-between', alignItems:'flex-start', gap:14 }}>
        <div style={{ flex:1, minWidth:0 }}>
          {/* Title row */}
          <div style={{ display:'flex', alignItems:'center', gap:8, flexWrap:'wrap', marginBottom:8 }}>
            <h3 style={{ fontSize:16, fontWeight:700, margin:0 }}>{job.title}</h3>
            <span className={`badge ${job.urgency==='urgent'?'badge-red':'badge-yellow'}`}>
              {job.urgency==='urgent'?'🔴 Urgent':'🟡 Normal'}
            </span>
            {showStatus && <span className={`badge ${st.badge}`}>{st.label}</span>}
          </div>

          {/* Skills */}
          <div style={{ display:'flex', flexWrap:'wrap', gap:5, marginBottom:10 }}>
            {(job.skills||[]).map(s => <span key={s} className="badge badge-blue">{s}</span>)}
          </div>

          {/* Meta grid */}
          <div style={{ display:'grid', gridTemplateColumns:'auto auto', gap:'3px 18px', fontSize:13, color:'var(--text-muted)' }}>
            <span>📍 {job.location}</span>
            <span>📏 {job.distance} km</span>
            <span style={{ fontWeight:job.payType==='fixed'?700:400, color:job.payType==='fixed'?'var(--brand)':'var(--text-muted)' }}>
              💰 {job.payType==='fixed' ? `₹${job.pay} fixed` : `₹${job.pay}/${job.payType}`}
            </span>
            <span>⏱ {job.duration} {job.durationUnit||'days'}</span>
            <span>👤 {job.clientName||'Client'}</span>
            <span>📅 {new Date(job.postedAt).toLocaleDateString('en-IN')}</span>
          </div>

          {job.description && (
            <p style={{ marginTop:10, fontSize:13, color:'var(--text-muted)', lineHeight:1.5 }}>{job.description}</p>
          )}
        </div>

        {/* AI Match Score — enhanced visualization */}
        {matchScore !== undefined && <MatchScoreBadge score={matchScore} size="md" />}
      </div>

      {/* Match bar (only when score shown) */}
      {matchScore !== undefined && (
        <div style={{ marginTop:12 }}>
          <MatchScoreBar score={matchScore} />
        </div>
      )}

      <hr className="divider" style={{ margin:'12px 0 10px' }} />
      <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', gap:8, flexWrap:'wrap' }}>
        <span style={{ fontSize:12, color:'var(--text-faint)' }}>
          {job.applicants?.length||0} applicant{(job.applicants?.length||0)!==1?'s':''}
        </span>
        {showApply && (
          applied
            ? <span className="badge badge-green">✅ Applied</span>
            : <button className="btn btn-primary btn-sm" onClick={() => onApply && onApply(job)}>Apply →</button>
        )}
      </div>
    </div>
  );
}
