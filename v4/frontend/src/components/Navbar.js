import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useApp } from '../context/AppContext';

export default function Navbar() {
  const { user, role, workerProfile, logout, notifications } = useApp();
  const navigate  = useNavigate();
  const location  = useLocation();
  const [menuOpen, setMenuOpen] = useState(false);
  const [aiOpen, setAiOpen]   = useState(false);
  const unread = notifications?.filter(n => !n.is_read && n.userId === user?.id).length || 0;
  const isDemo = user?.isDemo;

  const workerLinks = [
    { to:'/worker/dashboard',    label:'🏠 Home' },
    { to:'/worker/jobs',         label:'🔍 Jobs' },
    { to:'/worker/applications', label:'📋 Applied' },
    { to:'/worker/attendance',   label:'📸 Attend' },
    { to:'/worker/submit-work',  label:'📤 Submit' },
  ];
  const workerAILinks = [
    { to:'/worker/video-bio',    label:'🎥 Video Bio' },
    { to:'/worker/voice-resume', label:'🎤 Voice Resume' },
    { to:'/worker/interview',    label:'🎯 Interview Score' },
    { to:'/worker/trust-score',  label:'🛡️ Trust Score' },
    { to:'/heatmap',             label:'📍 Job Heatmap' },
  ];
  const clientLinks = [
    { to:'/client/dashboard',   label:'🏠 Home' },
    { to:'/client/post-job',    label:'➕ Post Job' },
    { to:'/client/applicants',  label:'👥 Applicants' },
    { to:'/client/payment',     label:'💳 Payment' },
    { to:'/client/contract',    label:'📄 Contract' },
    { to:'/heatmap',            label:'📍 Heatmap' },
  ];
  const links = role === 'worker' ? workerLinks : role === 'client' ? clientLinks : [];
  const displayName = role === 'worker' && workerProfile?.name ? workerProfile.name : (user?.name || user?.phone || 'User');

  if (!user) return null;

  return (
    <nav style={{ position:'fixed', top:0, left:0, right:0, zIndex:200, background:'rgba(255,255,255,.95)', backdropFilter:'blur(12px)', borderBottom:'1px solid var(--border)', boxShadow:'var(--shadow-xs)' }}>
      <div style={{ maxWidth:1120, margin:'0 auto', padding:'0 24px', display:'flex', alignItems:'center', justifyContent:'space-between', height:60 }}>
        <Link to={role==='worker'?'/worker/dashboard':'/client/dashboard'} style={{ display:'flex', alignItems:'center', gap:8 }}>
          <div style={{ width:30, height:30, borderRadius:7, background:'var(--saffron)', display:'flex', alignItems:'center', justifyContent:'center', fontSize:14 }}>⚒️</div>
          <span style={{ fontWeight:800, fontSize:15, color:'var(--navy)' }}>AI Digital Workers</span>
          {isDemo && <span className="demo-badge">DEMO</span>}
        </Link>

        {/* Desktop links */}
        <div style={{ display:'flex', gap:2, alignItems:'center' }} id="desk-nav">
          {links.map(l => (
            <Link key={l.to} to={l.to} className={`navbar-link ${location.pathname===l.to?'active':''}`}>
              {l.label}
            </Link>
          ))}

          {/* AI Features dropdown */}
          {role === 'worker' && (
            <div style={{ position:'relative' }}>
              <button onClick={() => setAiOpen(o=>!o)} className={`navbar-link ${workerAILinks.some(l=>location.pathname===l.to)?'active':''}`} style={{ background:'none', border:'none', cursor:'pointer', display:'flex', alignItems:'center', gap:4 }}>
                ⚡ AI Tools ▾
              </button>
              {aiOpen && (
                <div style={{ position:'absolute', top:'calc(100% + 6px)', left:0, background:'#fff', border:'1px solid var(--border)', borderRadius:12, boxShadow:'var(--shadow-lg)', padding:6, minWidth:180, zIndex:300 }} onMouseLeave={() => setAiOpen(false)}>
                  {workerAILinks.map(l => (
                    <Link key={l.to} to={l.to} onClick={() => setAiOpen(false)} style={{ display:'block', padding:'8px 12px', borderRadius:8, fontSize:13, fontWeight:500, color:'var(--text-2)', transition:'background .15s' }} onMouseEnter={e=>e.target.style.background='var(--gray-100)'} onMouseLeave={e=>e.target.style.background='transparent'}>
                      {l.label}
                    </Link>
                  ))}
                </div>
              )}
            </div>
          )}
          <Link to="/review" className={`navbar-link ${location.pathname==='/review'?'active':''}`}>⭐ Reviews</Link>
        </div>

        <div style={{ display:'flex', alignItems:'center', gap:12 }}>
          <Link to="/notifications" style={{ position:'relative', fontSize:18, color:'var(--text-muted)' }}>
            🔔 {unread>0 && <span className="notif-badge">{unread}</span>}
          </Link>
          <div style={{ display:'flex', alignItems:'center', gap:8 }}>
            <div className="avatar" style={{ width:34, height:34, fontSize:13, background:'var(--saffron)' }}>{displayName[0]?.toUpperCase()}</div>
            <div style={{ fontSize:12 }}>
              <div style={{ fontWeight:700 }}>{displayName.split(' ')[0]}</div>
              <div style={{ color:'var(--text-muted)', textTransform:'capitalize', fontSize:11 }}>{role}</div>
            </div>
          </div>
          <button onClick={() => { logout(); navigate('/'); }} className="btn btn-ghost btn-sm" id="logout-btn">Logout</button>
          <button onClick={() => setMenuOpen(o=>!o)} style={{ background:'none', border:'none', cursor:'pointer', fontSize:20, color:'var(--text-2)' }} id="hamburger">{menuOpen?'✕':'☰'}</button>
        </div>
      </div>

      {menuOpen && (
        <div style={{ background:'#fff', borderTop:'1px solid var(--border)', padding:'12px 20px 20px' }}>
          {[...links, ...(role==='worker'?workerAILinks:[]), { to:'/review', label:'⭐ Reviews' }].map(l => (
            <Link key={l.to} to={l.to} onClick={() => setMenuOpen(false)} style={{ display:'block', padding:'11px 0', borderBottom:'1px solid var(--border)', fontWeight:600, fontSize:15, color:location.pathname===l.to?'var(--saffron)':'var(--text)' }}>
              {l.label}
            </Link>
          ))}
          <button onClick={() => { logout(); navigate('/'); setMenuOpen(false); }} className="btn btn-ghost btn-full" style={{ marginTop:16 }}>🚪 Logout</button>
        </div>
      )}
      <style>{`@media(min-width:768px){#hamburger{display:none!important}#desk-nav{display:flex!important}}@media(max-width:767px){#desk-nav{display:none!important}#logout-btn{display:none!important}}`}</style>
    </nav>
  );
}
