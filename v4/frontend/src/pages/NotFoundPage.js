import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useApp } from '../context/AppContext';
export default function NotFoundPage() {
  const { role } = useApp(); const nav = useNavigate();
  return (
    <div style={{ minHeight:'100vh', display:'flex', alignItems:'center', justifyContent:'center', padding:24, textAlign:'center' }}>
      <div><div style={{ fontSize:80, marginBottom:16 }}>🔍</div><h1 style={{ fontFamily:'var(--font-display)', fontSize:32, marginBottom:8 }}>Page Not Found</h1><p style={{ color:'var(--text-muted)', marginBottom:28 }}>This page doesn't exist.</p><button className="btn btn-primary btn-lg" onClick={() => nav(role==='worker'?'/worker/dashboard':role==='client'?'/client/dashboard':'/')}>🏠 Go Home</button></div>
    </div>
  );
}
