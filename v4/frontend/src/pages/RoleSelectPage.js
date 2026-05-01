import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useApp } from '../context/AppContext';

export default function RoleSelectPage() {
  const { setRole } = useApp();
  const navigate    = useNavigate();
  const [selected, setSelected] = useState(null);

  function continueRole() {
    if (!selected) return;
    setRole(selected);
    navigate(selected === 'worker' ? '/worker/profile-setup' : '/client/dashboard');
  }

  return (
    <div style={{ minHeight:'100vh', background:'linear-gradient(160deg,var(--bg),#fff8ef)', display:'flex', alignItems:'center', justifyContent:'center', padding:20 }}>
      <div style={{ width:'100%', maxWidth:480 }}>
        <div style={{ textAlign:'center', marginBottom:32 }}>
          <div style={{ fontSize:48, marginBottom:8 }}>👤</div>
          <h1 style={{ fontFamily:'var(--font-display)', fontSize:28 }}>Who are you?</h1>
          <p style={{ color:'var(--text-muted)', fontSize:15, marginTop:6 }}>Select your role to continue</p>
        </div>

        {[
          { id:'worker', emoji:'👷', title:'Worker', desc:'Find jobs, apply, mark attendance, get paid', color:'#fff5ee', border:'var(--primary)', check:'#fff0e8' },
          { id:'client', emoji:'🏢', title:'Client', desc:'Post jobs, hire workers, manage payments', color:'#eef5ff', border:'#2563eb', check:'#eef5ff' },
        ].map(r => (
          <div key={r.id} onClick={() => setSelected(r.id)} className="card"
            style={{ cursor:'pointer', border:`2px solid ${selected===r.id?r.border:'var(--border)'}`, background:selected===r.id?r.color:'#fff', transition:'all .2s', transform:selected===r.id?'scale(1.02)':'scale(1)', marginBottom:14 }}>
            <div style={{ display:'flex', alignItems:'center', gap:16 }}>
              <div style={{ fontSize:48 }}>{r.emoji}</div>
              <div style={{ flex:1 }}>
                <h3 style={{ fontSize:20, marginBottom:4 }}>{r.title}</h3>
                <p style={{ color:'var(--text-muted)', fontSize:14 }}>{r.desc}</p>
              </div>
              <div style={{ fontSize:26 }}>{selected===r.id?'✅':'⬜'}</div>
            </div>
          </div>
        ))}

        <button className="btn btn-primary btn-full btn-lg" onClick={continueRole} disabled={!selected} style={{ marginTop:8 }}>
          Continue as {selected ? (selected==='worker'?'Worker':'Client') : '...'} →
        </button>
      </div>
    </div>
  );
}
