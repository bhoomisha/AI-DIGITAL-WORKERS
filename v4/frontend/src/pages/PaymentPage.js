import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { calculatePayment } from '../services/api';
import VoiceAssistant from '../components/VoiceAssistant';

/* ══════════════════════════════════════════════════
   PAYMENT LOGIC FIX:
   - Fixed cost  → amount = fixed price (NO days multiply)
   - Per day     → amount = rate × days
   This is handled by calculatePayment() in api.js
══════════════════════════════════════════════════ */

const UPI_APPS = [
  { id:'googlepay', label:'Google Pay', icon:'🟢' },
  { id:'phonepe',   label:'PhonePe',    icon:'🟣' },
  { id:'paytm',     label:'Paytm',      icon:'💙' },
  { id:'bhim',      label:'BHIM UPI',   icon:'🇮🇳' },
];

export default function PaymentPage() {
  const { user, jobs, payments, workCompletions, processPayment } = useApp();
  const [method,   setMethod]   = useState('upi');
  const [upiApp,   setUpiApp]   = useState('googlepay');
  const [upiId,    setUpiId]    = useState('');
  const [selJobId, setSelJobId] = useState('');
  const [processing, setProc]   = useState(false);
  const [success,  setSuccess]  = useState(null);
  const [error,    setError]    = useState('');
  const [step,     setStep]     = useState('select'); // select | confirm | done

  const myJobs     = jobs.filter(j => j.clientId === user?.id);
  const unlocked   = myJobs.filter(j => j.paymentUnlocked && j.status !== 'paid');
  const paid       = myJobs.filter(j => j.status === 'paid');
  const myPayments = payments.filter(p => p.clientId === user?.id);

  const selJob = myJobs.find(j => j.id === parseInt(selJobId));
  const wcEntry = workCompletions.find(w => w.jobId === parseInt(selJobId));

  /* ─── FIXED PAYMENT CALCULATION ─────────────
     calculatePayment correctly handles:
     - 'fixed'  → amount = pay (no days multiply)
     - 'daily'  → amount = pay × days
  ─────────────────────────────────────────── */
  const days       = wcEntry?.totalDays || parseInt(selJob?.duration) || 1;
  const calcResult = selJob
    ? calculatePayment(selJob.payType, selJob.pay, days)
    : { amount:0, platformFee:0, total:0, breakdown:'' };

  async function handlePay() {
    if (!selJobId) { setError('Select a job'); return; }
    if (!selJob?.paymentUnlocked) { setError('Work not approved yet'); return; }
    if (method === 'upi' && !upiId.includes('@')) { setError('Enter valid UPI ID (e.g. name@upi)'); return; }
    setError(''); setProc(true);

    // Simulate payment processing (2s delay)
    await new Promise(r => setTimeout(r, 2000));

    const result = processPayment({
      jobId:    parseInt(selJobId),
      workerId: wcEntry?.workerId || 'worker',
      clientId: user?.id,
      amount:   calcResult.amount,
      method,
      upiId,
    });
    setProc(false);
    if (result?.error) { setError(result.error); }
    else { setSuccess(result); setStep('done'); }
  }

  if (step === 'done' && success) return (
    <div className="page">
      <div className="container" style={{ paddingTop:48, maxWidth:480 }}>
        <div className="card" style={{ textAlign:'center', padding:40 }}>
          <div style={{ width:72, height:72, borderRadius:'50%', background:'#f0fdf4', border:'2px solid #bbf7d0', display:'flex', alignItems:'center', justifyContent:'center', fontSize:32, margin:'0 auto 20px' }}>✅</div>
          <h2 style={{ fontSize:22, marginBottom:6 }}>Payment Successful!</h2>
          <p style={{ color:'var(--text-muted)', marginBottom:4 }}>₹{calcResult.amount} paid to worker</p>
          <p style={{ fontSize:13, color:'var(--text-muted)', marginBottom:24 }}>
            TXN: <code style={{ background:'var(--gray-100)', padding:'2px 7px', borderRadius:5, fontSize:12 }}>{success.transactionId}</code>
          </p>
          <div style={{ background:'var(--gray-50)', borderRadius:12, padding:16, textAlign:'left', fontSize:13, marginBottom:24 }}>
            <div style={{ display:'flex', justifyContent:'space-between', marginBottom:6 }}>
              <span style={{ color:'var(--text-muted)' }}>Job</span>
              <span style={{ fontWeight:600 }}>{selJob?.title}</span>
            </div>
            <div style={{ display:'flex', justifyContent:'space-between', marginBottom:6 }}>
              <span style={{ color:'var(--text-muted)' }}>Calculation</span>
              <span>{calcResult.breakdown}</span>
            </div>
            <div style={{ display:'flex', justifyContent:'space-between', marginBottom:6 }}>
              <span style={{ color:'var(--text-muted)' }}>Platform fee (2%)</span>
              <span>₹{calcResult.platformFee}</span>
            </div>
            <div style={{ height:1, background:'var(--border)', margin:'8px 0' }} />
            <div style={{ display:'flex', justifyContent:'space-between', fontWeight:700, fontSize:15 }}>
              <span>Total paid</span>
              <span style={{ color:'var(--success)' }}>₹{calcResult.total}</span>
            </div>
          </div>
          <div className="pay-status success" style={{ justifyContent:'center', marginBottom:20 }}>
            ✅ Payment completed
          </div>
          <button className="btn btn-ghost btn-full" onClick={() => { setSuccess(null); setSelJobId(''); setStep('select'); }}>
            Make Another Payment
          </button>
        </div>
      </div>
    </div>
  );

  return (
    <div className="page" style={{ paddingBottom:90 }}>
      <div className="container" style={{ paddingTop:28, maxWidth:580 }}>

        <div style={{ marginBottom:24 }}>
          <h1 style={{ fontSize:24, fontWeight:700, marginBottom:4 }}>💳 Payment</h1>
          <p style={{ color:'var(--text-muted)', fontSize:14 }}>Pay workers securely after work approval</p>
        </div>

        {error && <div className="alert alert-error">{error}</div>}

        {/* Locked jobs notice */}
        {myJobs.filter(j=>!j.paymentUnlocked&&!['paid'].includes(j.status)).length > 0 && (
          <div className="alert alert-warning">
            🔒 Some jobs have locked payments. Approve worker's submitted work first.
          </div>
        )}

        {unlocked.length === 0 && paid.length === 0 ? (
          <div className="card">
            <div className="empty">
              <span className="empty__icon">🔒</span>
              <div className="empty__title">No Payments Available</div>
              <div className="empty__text">Approve a worker's submitted work to unlock payment.</div>
            </div>
          </div>
        ) : (
          <>
            {/* ── Job selection ── */}
            <div className="card" style={{ marginBottom:16 }}>
              <h3 style={{ fontSize:15, fontWeight:600, marginBottom:14 }}>Select Job to Pay</h3>
              {unlocked.length === 0
                ? <div className="alert alert-info">No unlocked payments. Approve work completion first.</div>
                : unlocked.map(j => {
                  const calc = calculatePayment(j.payType, j.pay, wcEntry?.totalDays || parseInt(j.duration) || 1);
                  return (
                    <div key={j.id} onClick={() => setSelJobId(String(j.id))}
                      style={{ border:`1.5px solid ${selJobId===String(j.id)?'var(--brand)':'var(--border)'}`, borderRadius:10, padding:'12px 14px', marginBottom:8, cursor:'pointer', background:selJobId===String(j.id)?'var(--brand-light)':'var(--surface)', transition:'all .15s' }}>
                      <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center' }}>
                        <div>
                          <div style={{ fontWeight:600, fontSize:14 }}>{j.title}</div>
                          <div style={{ fontSize:12, color:'var(--text-muted)', marginTop:2 }}>
                            {j.payType === 'fixed'
                              ? `Fixed price: ₹${j.pay}`
                              : `₹${j.pay}/day × ${wcEntry?.totalDays||parseInt(j.duration)||1} days`
                            }
                          </div>
                        </div>
                        <div style={{ textAlign:'right' }}>
                          <div style={{ fontWeight:700, color:'var(--brand)', fontSize:16 }}>₹{calc.amount}</div>
                          <span className="badge badge-green" style={{ fontSize:11 }}>🔓 Unlocked</span>
                        </div>
                      </div>
                    </div>
                  );
                })
              }
            </div>

            {/* ── Payment method ── */}
            <div className="card" style={{ marginBottom:16 }}>
              <h3 style={{ fontSize:15, fontWeight:600, marginBottom:14 }}>Payment Method</h3>
              <div style={{ display:'flex', gap:10, marginBottom:16 }}>
                {[['upi','📱 UPI'],['cash','💵 Cash'],['bank','🏦 Bank']].map(([v,l]) => (
                  <button key={v} className={`pay-method ${method===v?'sel':''}`} onClick={() => setMethod(v)}>{l}</button>
                ))}
              </div>

              {method === 'upi' && (
                <div>
                  <div className="form-label" style={{ marginBottom:10 }}>Select UPI App</div>
                  <div style={{ display:'flex', gap:8, marginBottom:14, flexWrap:'wrap' }}>
                    {UPI_APPS.map(app => (
                      <button key={app.id} onClick={() => setUpiApp(app.id)} style={{ padding:'8px 14px', borderRadius:8, border:`1.5px solid ${upiApp===app.id?'var(--brand)':'var(--border)'}`, background:upiApp===app.id?'var(--brand-light)':'var(--surface)', cursor:'pointer', fontSize:13, fontWeight:600, color:upiApp===app.id?'var(--brand)':'var(--text-2)', transition:'all .15s' }}>
                        {app.icon} {app.label}
                      </button>
                    ))}
                  </div>
                  <div className="form-group" style={{ marginBottom:0 }}>
                    <label className="form-label">UPI ID</label>
                    <input className="form-input" placeholder="e.g. worker@upi or 9876543210@paytm" value={upiId} onChange={e => setUpiId(e.target.value)} />
                    <p className="form-hint">Enter the worker's UPI ID for direct transfer</p>
                  </div>
                </div>
              )}

              {method === 'cash' && (
                <div className="alert alert-info">
                  💵 Cash payment will be recorded in the system. Pay the worker in person and confirm here to unlock the payment receipt.
                </div>
              )}

              {method === 'bank' && (
                <div>
                  <div className="form-group">
                    <label className="form-label">Account Number</label>
                    <input className="form-input" placeholder="Enter bank account number" />
                  </div>
                  <div className="form-group" style={{ marginBottom:0 }}>
                    <label className="form-label">IFSC Code</label>
                    <input className="form-input" placeholder="e.g. SBIN0001234" style={{ textTransform:'uppercase' }} />
                  </div>
                </div>
              )}
            </div>

            {/* ── Bill summary ── */}
            {selJob && (
              <div className="card" style={{ marginBottom:16, background:'var(--gray-50)', borderStyle:'dashed' }}>
                <h3 style={{ fontSize:15, fontWeight:600, marginBottom:14 }}>🧾 Bill Summary</h3>

                {/* Payment type badge */}
                <div style={{ marginBottom:12 }}>
                  <span className={`badge ${selJob.payType==='fixed'?'badge-purple':'badge-blue'}`}>
                    {selJob.payType === 'fixed' ? '💵 Fixed Price' : selJob.payType === 'daily' ? '📅 Per Day' : '🕐 Per Hour'}
                  </span>
                </div>

                <div style={{ display:'flex', flexDirection:'column', gap:8, fontSize:14 }}>
                  <div style={{ display:'flex', justifyContent:'space-between' }}>
                    <span style={{ color:'var(--text-muted)' }}>Calculation</span>
                    <span style={{ fontWeight:500 }}>{calcResult.breakdown}</span>
                  </div>
                  <div style={{ display:'flex', justifyContent:'space-between', color:'var(--text-muted)' }}>
                    <span>Platform fee (2%)</span>
                    <span>₹{calcResult.platformFee}</span>
                  </div>
                  <hr className="divider" style={{ margin:'6px 0' }} />
                  <div style={{ display:'flex', justifyContent:'space-between', fontWeight:700, fontSize:18 }}>
                    <span>Total</span>
                    <span style={{ color:'var(--brand)' }}>₹{calcResult.total}</span>
                  </div>
                </div>

                {/* Clarify no double-counting */}
                {selJob.payType === 'fixed' && (
                  <div style={{ marginTop:12, padding:'8px 12px', background:'var(--success-bg)', borderRadius:8, fontSize:12, color:'var(--success)' }}>
                    ℹ️ Fixed price job — amount is not multiplied by days worked.
                  </div>
                )}
              </div>
            )}

            <button className="btn btn-primary btn-full btn-lg" onClick={handlePay} disabled={processing || !selJobId || unlocked.length===0}>
              {processing ? (
                <span style={{ display:'flex', alignItems:'center', gap:8 }}>
                  <span style={{ width:16, height:16, border:'2px solid rgba(255,255,255,.3)', borderTopColor:'#fff', borderRadius:'50%', animation:'spin 1s linear infinite', display:'inline-block' }} />
                  Processing payment...
                </span>
              ) : (
                `${method==='upi'?'📱 Pay':'method'==='cash'?'💵 Confirm':'🏦 Transfer'} ₹${calcResult.total || 0} ${method==='upi'?'via UPI':'via '+method}`
              )}
            </button>
            <p style={{ textAlign:'center', fontSize:12, color:'var(--text-faint)', marginTop:10 }}>
              🔒 2% platform fee applies. Payments are non-refundable after confirmation.
            </p>
          </>
        )}

        {/* ── Payment history ── */}
        {myPayments.length > 0 && (
          <div style={{ marginTop:32 }}>
            <div className="section-header"><span className="section-title">Payment History</span></div>
            {myPayments.map(p => (
              <div key={p.id} className="card" style={{ marginBottom:10, padding:'14px 18px' }}>
                <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', flexWrap:'wrap', gap:8 }}>
                  <div>
                    <div style={{ fontWeight:600, fontSize:15 }}>₹{p.amount}</div>
                    <div style={{ fontSize:12, color:'var(--text-muted)' }}>
                      {p.method.toUpperCase()} · {new Date(p.paidAt).toLocaleString('en-IN',{dateStyle:'medium',timeStyle:'short'})}
                    </div>
                    <div style={{ fontSize:11, color:'var(--text-faint)', marginTop:2 }}>TXN: {p.transactionId}</div>
                  </div>
                  <span className="pay-status success">✅ Completed</span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
      <VoiceAssistant />
      <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
    </div>
  );
}
