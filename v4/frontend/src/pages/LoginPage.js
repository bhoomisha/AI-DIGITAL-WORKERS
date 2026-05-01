import React, { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useApp } from '../context/AppContext';
import { sendOTP, verifyOTP } from '../services/api';

export default function LoginPage() {
  const [step, setStep]     = useState('phone');
  const [phone, setPhone]   = useState('');
  const [otp, setOtp]       = useState(['','','','']);
  const [loading, setLoading] = useState(false);
  const [error, setError]   = useState('');
  const [info, setInfo]     = useState('');
  const [timer, setTimer]   = useState(0);
  const [demoOtp, setDemoOtp] = useState('');
  const { setUser }         = useApp();
  const navigate            = useNavigate();
  const refs                = [useRef(),useRef(),useRef(),useRef()];

  useEffect(() => {
    if (timer > 0) { const t = setTimeout(() => setTimer(t=>t-1), 1000); return () => clearTimeout(t); }
  }, [timer]);

  async function handleSend(e) {
    e.preventDefault();
    if (phone.length !== 10) { setError('Enter valid 10-digit number'); return; }
    setLoading(true); setError(''); setInfo('');
    try {
      const res = await sendOTP(phone);
      setStep('otp'); setTimer(60);
      if (res.demo_otp) { setDemoOtp(res.demo_otp); setInfo(`📱 Your OTP: ${res.demo_otp} (also in browser console F12)`); }
      setTimeout(() => refs[0].current?.focus(), 100);
    } catch (err) { setError(err.message || 'Failed to send OTP'); }
    finally { setLoading(false); }
  }

  async function handleVerify(e) {
    e.preventDefault();
    const code = otp.join('');
    if (code.length !== 4) { setError('Enter complete 4-digit OTP'); return; }
    setLoading(true); setError('');
    try {
      const res = await verifyOTP(phone, code);
      setUser({ id: res.user?.id||`user_${phone}`, phone, token:res.token, name:res.user?.name||'', isNew:res.isNewUser });
      navigate('/role-select');
    } catch (err) { setError(err.message || 'Invalid OTP'); }
    finally { setLoading(false); }
  }

  function onChange(val, i) {
    if (!/^\d?$/.test(val)) return;
    const n = [...otp]; n[i] = val; setOtp(n);
    if (val && i < 3) refs[i+1].current?.focus();
  }
  function onKeyDown(e, i) { if (e.key==='Backspace' && !otp[i] && i>0) refs[i-1].current?.focus(); }

  return (
    <div style={{ minHeight:'100vh', background:'linear-gradient(160deg,var(--bg) 0%,#fff8ef 100%)', display:'flex', alignItems:'center', justifyContent:'center', padding:20 }}>
      <div className="card fade-in" style={{ width:'100%', maxWidth:420 }}>
        <div style={{ textAlign:'center', marginBottom:28 }}>
          <div style={{ fontSize:48 }}>⚒️</div>
          <h1 style={{ fontFamily:'var(--font-display)', fontSize:24, color:'var(--primary)' }}>AI Digital Workers</h1>
          <p style={{ color:'var(--text-muted)', fontSize:13 }}>India's Smartest Labour Platform</p>
        </div>

        {error && <div className="alert alert-error">{error}</div>}
        {info  && <div className="alert alert-info" style={{ fontWeight:600 }}>{info}</div>}

        {step==='phone' ? (
          <form onSubmit={handleSend}>
            <h2 style={{ fontSize:19, marginBottom:4 }}>Enter Mobile Number</h2>
            <p style={{ color:'var(--text-muted)', fontSize:13, marginBottom:20 }}>OTP will appear on screen + browser console</p>
            <div className="form-group">
              <label className="form-label">📱 Mobile Number</label>
              <div style={{ display:'flex', gap:8 }}>
                <div style={{ background:'#f3f4f6', border:'2px solid var(--border)', borderRadius:10, padding:'11px 12px', fontWeight:600, fontSize:14, color:'var(--text-muted)', flexShrink:0 }}>🇮🇳 +91</div>
                <input className="form-input" type="tel" placeholder="9876543210" value={phone} onChange={e => setPhone(e.target.value.replace(/\D/g,'').slice(0,10))} maxLength={10} autoFocus required />
              </div>
            </div>
            <button className="btn btn-primary btn-full btn-lg" type="submit" disabled={loading||phone.length!==10}>{loading?'⏳ Generating OTP...':'Get OTP →'}</button>
            <div style={{ textAlign:'center', marginTop:14 }}>
              <button type="button" onClick={() => navigate('/demo')} style={{ background:'none', border:'none', color:'var(--primary)', cursor:'pointer', fontSize:13, fontWeight:700 }}>🎬 Open Demo Dashboard →</button>
            </div>
          </form>
        ) : (
          <form onSubmit={handleVerify}>
            <h2 style={{ fontSize:19, marginBottom:4 }}>Verify OTP</h2>
            <p style={{ color:'var(--text-muted)', fontSize:13, marginBottom:4 }}>Sent to +91 {phone}</p>
            <button type="button" onClick={() => { setStep('phone'); setOtp(['','','','']); setError(''); setInfo(''); }} style={{ background:'none', border:'none', color:'var(--primary)', cursor:'pointer', fontSize:13, fontWeight:600, marginBottom:20 }}>✏️ Change number</button>
            <div className="form-group">
              <label className="form-label">Enter 4-digit OTP</label>
              <div style={{ display:'flex', gap:12, justifyContent:'center' }}>
                {otp.map((d,i) => <input key={i} ref={refs[i]} className="otp-input" type="tel" maxLength={1} value={d} onChange={e => onChange(e.target.value,i)} onKeyDown={e => onKeyDown(e,i)} />)}
              </div>
            </div>
            <button className="btn btn-primary btn-full btn-lg" type="submit" disabled={loading||otp.join('').length!==4}>{loading?'⏳ Verifying...':'Verify & Login ✓'}</button>
            {demoOtp && (
              <div style={{ marginTop:14, padding:14, background:'linear-gradient(135deg,#fff0e8,#fff8f2)', borderRadius:12, textAlign:'center', border:'1px solid var(--primary)' }}>
                <div style={{ fontSize:11, color:'var(--text-muted)', marginBottom:4 }}>Your OTP (Demo Mode)</div>
                <div style={{ fontSize:32, fontWeight:800, letterSpacing:10, color:'var(--primary)' }}>{demoOtp}</div>
              </div>
            )}
            <div style={{ textAlign:'center', marginTop:12 }}>
              {timer > 0
                ? <span style={{ color:'var(--text-muted)', fontSize:13 }}>Resend in {timer}s</span>
                : <button type="button" onClick={handleSend} style={{ background:'none', border:'none', color:'var(--primary)', cursor:'pointer', fontWeight:600, fontSize:13 }}>Resend OTP</button>
              }
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
