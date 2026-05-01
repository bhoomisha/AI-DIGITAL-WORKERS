import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useApp } from '../../context/AppContext';
import { sendOTP, verifyOTP } from '../../services/api';

/* ══════════════════════════════════════════════
   DEMO ROLE SWITCHER
   Visible when ?demo=true is in URL
   Allows switching between Worker and Client
   without logout — perfect for presentations
══════════════════════════════════════════════ */

const DEMO_ACCOUNTS = {
  worker: { phone:'9900000001', name:'Raju Mistri (Demo Worker)',  role:'worker', otp:'0001' },
  client: { phone:'9900000002', name:'Demo Client (Ramesh Gupta)', role:'client', otp:'0002' },
};

export default function DemoRoleSwitcher() {
  const navigate = useNavigate();
  const { user, role, setUser, setRole, setWorkerProfile } = useApp();
  const [switching, setSwitching] = useState(null);
  const [expanded, setExpanded]   = useState(true);

  // Only show when ?demo=true or NODE_ENV=development
  const params = new URLSearchParams(window.location.search);
  if (!params.get('demo') && process.env.NODE_ENV !== 'development') return null;

  async function switchTo(targetRole) {
    const acc = DEMO_ACCOUNTS[targetRole];
    if (role === acc.role) return; // already this role
    setSwitching(targetRole);
    try {
      await sendOTP(acc.phone);
      const res = await verifyOTP(acc.phone, acc.otp);
      setUser({ id: res.user?.id || `demo_${targetRole}`, phone: acc.phone, name: acc.name, isDemo: true });
      setRole(acc.role);
      if (acc.role === 'worker') {
        setWorkerProfile({ id: `demo_${targetRole}`, name:'Raju Mistri', phone: acc.phone, skills:['Painting','Electrician'], experience:5, location:'Vasundhara, Ghaziabad', availability:'available', rating:null, jobsDone:0, facePhoto:null });
      }
      navigate(acc.role === 'worker' ? '/worker/dashboard' : '/client/dashboard');
    } catch (e) {
      // Direct switch in demo mode
      setUser({ id:`demo_${targetRole}`, phone:acc.phone, name:acc.name, isDemo:true });
      setRole(acc.role);
      if (acc.role === 'worker') setWorkerProfile({ id:`demo_worker`, name:'Raju Mistri', phone:acc.phone, skills:['Painting','Electrician'], experience:5, location:'Vasundhara', availability:'available', rating:null, jobsDone:0 });
      navigate(acc.role === 'worker' ? '/worker/dashboard' : '/client/dashboard');
    }
    setSwitching(null);
  }

  return (
    <div className="demo-switcher" style={{ color:'#fff' }}>
      <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:expanded?12:0 }}>
        <div style={{ display:'flex', alignItems:'center', gap:8 }}>
          <span className="demo-badge">DEMO MODE</span>
          <span style={{ fontSize:12, color:'#94a3b8' }}>👁 Presentation</span>
        </div>
        <button onClick={() => setExpanded(e=>!e)} style={{ background:'none', border:'none', color:'#94a3b8', cursor:'pointer', fontSize:14 }}>
          {expanded ? '▲' : '▼'}
        </button>
      </div>

      {expanded && (
        <>
          <div style={{ fontSize:11, color:'#64748b', marginBottom:10 }}>
            Current: <span style={{ color:'#f1f5f9', fontWeight:700 }}>{user?.name || 'Not logged in'}</span>
          </div>
          <div style={{ display:'flex', gap:8 }}>
            <button onClick={() => switchTo('client')} disabled={!!switching}
              style={{ flex:1, padding:'8px', border:`2px solid ${role==='client'?'#2563eb':'rgba(255,255,255,.15)'}`, borderRadius:8, background:role==='client'?'#2563eb':'rgba(255,255,255,.06)', color:'#fff', cursor:'pointer', fontWeight:700, fontSize:12, transition:'all .15s', opacity:switching&&switching!=='client'?.5:1 }}>
              {switching==='client' ? '⏳' : role==='client' ? '✅' : ''} CLIENT
            </button>
            <button onClick={() => switchTo('worker')} disabled={!!switching}
              style={{ flex:1, padding:'8px', border:`2px solid ${role==='worker'?'#FF6B1A':'rgba(255,255,255,.15)'}`, borderRadius:8, background:role==='worker'?'#FF6B1A':'rgba(255,255,255,.06)', color:'#fff', cursor:'pointer', fontWeight:700, fontSize:12, transition:'all .15s', opacity:switching&&switching!=='worker'?.5:1 }}>
              {switching==='worker' ? '⏳' : role==='worker' ? '✅' : ''} WORKER
            </button>
          </div>
          <div style={{ marginTop:10, fontSize:10, color:'#475569', textAlign:'center' }}>
            No logout needed · Perfect for presentations
          </div>
        </>
      )}
    </div>
  );
}
