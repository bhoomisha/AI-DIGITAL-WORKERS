import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';

/* ══════════════════════════════════════════════
   AI CONTRACT MAKER
   Generates bilingual Hindi + English work contract
   Downloads as HTML (print-to-PDF)
   WhatsApp share option included
══════════════════════════════════════════════ */

async function generateContract(details) {
  try {
    const res = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        model: 'claude-sonnet-4-20250514',
        max_tokens: 2000,
        messages: [{
          role: 'user',
          content: `Generate a professional work agreement contract for daily wage labour in India.
Write it in BOTH Hindi and English (Hindi first, then English translation).

Details:
- Worker: ${details.workerName}
- Client: ${details.clientName}
- Job: ${details.jobTitle} — ${details.jobDescription}
- Location: ${details.location}
- Start Date: ${details.startDate}
- Duration: ${details.duration} days
- Daily Wage: ₹${details.dailyWage}
- Total Amount: ₹${parseInt(details.dailyWage)*parseInt(details.duration)}
- Working Hours: ${details.hours} hours/day

Include: scope of work, payment terms (pay on completion), termination clause (2 days notice), safety responsibilities, dispute resolution.
Format with clear section headers. Make it legally sound but readable for low-literacy workers.

Return the contract as clean HTML (no markdown, no code blocks). Start directly with HTML content.`,
        }],
      }),
    });
    const data = await res.json();
    return data.content?.[0]?.text || '';
  } catch {
    return generateDemoContract(details);
  }
}

function generateDemoContract(d) {
  const total = parseInt(d.dailyWage||0) * parseInt(d.duration||0);
  return `
<div style="font-family:Georgia,serif;max-width:700px;margin:0 auto;padding:30px;color:#1a1a1a">
  <div style="text-align:center;border-bottom:3px double #FF6B1A;padding-bottom:20px;margin-bottom:24px">
    <h1 style="font-size:24px;color:#0A1628;margin-bottom:4px">कार्य समझौता अनुबंध</h1>
    <h2 style="font-size:20px;color:#0A1628;margin-bottom:8px">WORK AGREEMENT CONTRACT</h2>
    <p style="font-size:12px;color:#64748b">AI Digital Workers Platform · दिनांक / Date: ${new Date().toLocaleDateString('en-IN')}</p>
  </div>

  <section style="margin-bottom:20px">
    <h3 style="color:#FF6B1A;border-bottom:1px solid #e2e8f0;padding-bottom:6px">पक्षकार / PARTIES</h3>
    <table style="width:100%;border-collapse:collapse;font-size:14px">
      <tr><td style="padding:6px 0;font-weight:600;width:140px">कर्मचारी / Worker:</td><td>${d.workerName}</td></tr>
      <tr><td style="padding:6px 0;font-weight:600">नियोक्ता / Client:</td><td>${d.clientName}</td></tr>
      <tr><td style="padding:6px 0;font-weight:600">स्थान / Location:</td><td>${d.location}</td></tr>
    </table>
  </section>

  <section style="margin-bottom:20px">
    <h3 style="color:#FF6B1A;border-bottom:1px solid #e2e8f0;padding-bottom:6px">कार्य विवरण / SCOPE OF WORK</h3>
    <p style="font-size:14px;line-height:1.7"><strong>कार्य:</strong> ${d.jobTitle}</p>
    <p style="font-size:14px;line-height:1.7"><strong>विवरण:</strong> ${d.jobDescription||'As agreed between parties'}</p>
    <p style="font-size:14px;line-height:1.7"><strong>प्रारंभ तिथि / Start Date:</strong> ${d.startDate}</p>
    <p style="font-size:14px;line-height:1.7"><strong>अवधि / Duration:</strong> ${d.duration} दिन / days</p>
    <p style="font-size:14px;line-height:1.7"><strong>कार्य समय / Working Hours:</strong> ${d.hours} hours per day</p>
  </section>

  <section style="margin-bottom:20px;background:#f0fdf4;border-radius:8px;padding:16px">
    <h3 style="color:#16a34a;margin-bottom:12px">💰 भुगतान शर्तें / PAYMENT TERMS</h3>
    <table style="width:100%;font-size:14px">
      <tr><td style="padding:4px 0;font-weight:600">दैनिक मजदूरी / Daily Wage:</td><td style="text-align:right;font-weight:700">₹${d.dailyWage}</td></tr>
      <tr><td style="padding:4px 0">अवधि / Duration:</td><td style="text-align:right">${d.duration} days</td></tr>
      <tr style="border-top:2px solid #86efac"><td style="padding:8px 0;font-size:16px;font-weight:800">कुल राशि / TOTAL:</td><td style="text-align:right;font-size:16px;font-weight:800;color:#15803d">₹${total.toLocaleString('en-IN')}</td></tr>
    </table>
    <p style="font-size:12px;color:#166534;margin-top:8px">भुगतान कार्य पूर्ण होने के 24 घंटे के भीतर किया जायेगा। Payment within 24 hours of work completion.</p>
  </section>

  <section style="margin-bottom:20px">
    <h3 style="color:#FF6B1A;border-bottom:1px solid #e2e8f0;padding-bottom:6px">समाप्ति खंड / TERMINATION</h3>
    <p style="font-size:13px;line-height:1.7;color:#374151">Either party may terminate this agreement with 2 days written notice. In case of early termination by client, pro-rated payment will be made for days worked. In case of abandonment by worker without notice, no payment for the final 2 days. / दोनों पक्ष 2 दिन की सूचना से इस अनुबंध को समाप्त कर सकते हैं।</p>
  </section>

  <section style="margin-bottom:20px">
    <h3 style="color:#FF6B1A;border-bottom:1px solid #e2e8f0;padding-bottom:6px">सुरक्षा / SAFETY</h3>
    <p style="font-size:13px;line-height:1.7;color:#374151">Client will provide safe working conditions. Worker will follow all safety instructions. Both parties agree to use AI Digital Workers platform for dispute resolution. / नियोक्ता सुरक्षित कार्य वातावरण प्रदान करेगा।</p>
  </section>

  <div style="margin-top:40px;display:grid;grid-template-columns:1fr 1fr;gap:30px;border-top:1px solid #e2e8f0;padding-top:20px">
    <div style="text-align:center">
      <div style="height:60px;border-bottom:1px solid #374151;margin-bottom:6px"></div>
      <p style="font-size:13px;font-weight:600">${d.workerName}</p>
      <p style="font-size:11px;color:#64748b">Worker Signature / कर्मचारी हस्ताक्षर</p>
    </div>
    <div style="text-align:center">
      <div style="height:60px;border-bottom:1px solid #374151;margin-bottom:6px"></div>
      <p style="font-size:13px;font-weight:600">${d.clientName}</p>
      <p style="font-size:11px;color:#64748b">Client Signature / नियोक्ता हस्ताक्षर</p>
    </div>
  </div>

  <p style="text-align:center;font-size:11px;color:#94a3b8;margin-top:20px">Generated by AI Digital Workers · www.aidigitalworkers.in</p>
</div>`;
}

export default function ContractMakerPage() {
  const { user, workerProfile, applications, jobs } = useApp();
  const [form, setForm] = useState({
    workerName:     workerProfile?.name || '',
    clientName:     user?.name || 'Client',
    jobTitle:       '',
    jobDescription: '',
    location:       workerProfile?.location || '',
    startDate:      new Date(Date.now()+86400000).toISOString().split('T')[0],
    duration:       '3',
    dailyWage:      '800',
    hours:          '8',
  });
  const [generating, setGenerating] = useState(false);
  const [contract, setContract]     = useState('');
  const [toast, setToast]           = useState('');
  const upd = (k,v) => setForm(p=>({...p,[k]:v}));

  function showToast(m) { setToast(m); setTimeout(()=>setToast(''),3000); }

  async function generate() {
    if (!form.workerName || !form.clientName || !form.jobTitle || !form.dailyWage) {
      showToast('❌ Fill in all required fields'); return;
    }
    setGenerating(true);
    const html = await generateContract(form);
    setContract(html);
    setGenerating(false);
  }

  function downloadPDF() {
    const w = window.open('', '_blank');
    w.document.write(`<!DOCTYPE html><html><head><title>Contract — ${form.jobTitle}</title><style>@media print{body{margin:0}}</style></head><body>${contract}</body></html>`);
    w.document.close();
    w.print();
  }

  function shareWhatsApp() {
    const total = parseInt(form.dailyWage) * parseInt(form.duration);
    const text  = `Work Agreement:%0A%0AWorker: ${form.workerName}%0AJob: ${form.jobTitle}%0ALocation: ${form.location}%0ADuration: ${form.duration} days%0ADaily Wage: ₹${form.dailyWage}%0ATotal: ₹${total}%0AStart: ${form.startDate}%0A%0AGenerated by AI Digital Workers`;
    window.open(`https://wa.me/?text=${text}`, '_blank');
  }

  const total = parseInt(form.dailyWage||0) * parseInt(form.duration||0);

  return (
    <div className="page" style={{ paddingBottom:80 }}>
      <div className="container" style={{ paddingTop:28, maxWidth:700 }}>
        <h1 style={{ fontSize:24, fontWeight:700, marginBottom:4 }}>📄 AI Contract Maker</h1>
        <p style={{ color:'var(--text-muted)', fontSize:14, marginBottom:24 }}>Generate a professional bilingual (Hindi + English) work agreement in seconds.</p>

        {toast && <div className="alert alert-error">{toast}</div>}

        {!contract ? (
          <>
            <div className="ai-card" style={{ marginBottom:20 }}>
              <h3 style={{ fontSize:16, marginBottom:4 }}>Contract Details</h3>
              <p style={{ fontSize:13, color:'var(--text-muted)', marginBottom:18 }}>Pre-fill from accepted job or enter manually</p>

              <div className="grid-2">
                <div className="form-group">
                  <label className="form-label">Worker Name *</label>
                  <input className="form-input" value={form.workerName} onChange={e=>upd('workerName',e.target.value)} placeholder="e.g. Raju Mistri" />
                </div>
                <div className="form-group">
                  <label className="form-label">Client Name *</label>
                  <input className="form-input" value={form.clientName} onChange={e=>upd('clientName',e.target.value)} placeholder="e.g. Ramesh Gupta" />
                </div>
              </div>

              <div className="form-group">
                <label className="form-label">Job Title *</label>
                <input className="form-input" value={form.jobTitle} onChange={e=>upd('jobTitle',e.target.value)} placeholder="e.g. House Painting — 2BHK" />
              </div>

              <div className="form-group">
                <label className="form-label">Job Description</label>
                <textarea className="form-input" value={form.jobDescription} onChange={e=>upd('jobDescription',e.target.value)} placeholder="Describe the work in detail..." style={{ minHeight:70 }} />
              </div>

              <div className="form-group">
                <label className="form-label">Work Location *</label>
                <input className="form-input" value={form.location} onChange={e=>upd('location',e.target.value)} placeholder="e.g. Sector 14, Noida" />
              </div>

              <div className="grid-2">
                <div className="form-group">
                  <label className="form-label">Start Date</label>
                  <input className="form-input" type="date" value={form.startDate} onChange={e=>upd('startDate',e.target.value)} />
                </div>
                <div className="form-group">
                  <label className="form-label">Duration (days) *</label>
                  <input className="form-input" type="number" value={form.duration} onChange={e=>upd('duration',e.target.value)} min="1" />
                </div>
              </div>

              <div className="grid-2">
                <div className="form-group">
                  <label className="form-label">Daily Wage (₹) *</label>
                  <input className="form-input" type="number" value={form.dailyWage} onChange={e=>upd('dailyWage',e.target.value)} placeholder="800" />
                </div>
                <div className="form-group">
                  <label className="form-label">Working Hours/Day</label>
                  <input className="form-input" type="number" value={form.hours} onChange={e=>upd('hours',e.target.value)} min="4" max="14" />
                </div>
              </div>

              {/* Total preview */}
              {total > 0 && (
                <div style={{ background:'var(--success-bg)', border:'1px solid var(--success-ring)', borderRadius:10, padding:'12px 16px', marginBottom:16, display:'flex', justifyContent:'space-between', alignItems:'center' }}>
                  <span style={{ fontSize:14, color:'var(--success)' }}>Total Contract Value</span>
                  <span style={{ fontSize:20, fontWeight:800, color:'var(--success)' }}>₹{total.toLocaleString('en-IN')}</span>
                </div>
              )}

              <button className="btn btn-saffron btn-full btn-lg" onClick={generate} disabled={generating}>
                {generating ? '🤖 AI is drafting your contract in Hindi & English...' : '✨ Generate Contract with AI'}
              </button>
            </div>

            {generating && (
              <div className="card" style={{ textAlign:'center', padding:32 }}>
                <div style={{ fontSize:48, marginBottom:12 }}>📄</div>
                <p style={{ fontWeight:600, marginBottom:8 }}>AI is drafting your contract...</p>
                <div className="progress-wrap"><div className="progress-fill" style={{ width:'60%', background:'var(--saffron)', transition:'width 3s ease' }} /></div>
                <p style={{ fontSize:12, color:'var(--text-muted)', marginTop:8 }}>Generating bilingual Hindi + English content</p>
              </div>
            )}
          </>
        ) : (
          <div className="fade-up">
            {/* Action buttons */}
            <div style={{ display:'flex', gap:10, marginBottom:20, flexWrap:'wrap' }}>
              <button className="btn btn-primary" onClick={downloadPDF}>🖨️ Download / Print PDF</button>
              <button className="btn btn-success" onClick={shareWhatsApp}>📱 Share on WhatsApp</button>
              <button className="btn btn-ghost" onClick={() => setContract('')}>✏️ Edit Details</button>
            </div>

            {/* Contract preview */}
            <div className="card" style={{ padding:0, overflow:'hidden' }}>
              <div style={{ background:'var(--gray-100)', padding:'10px 16px', borderBottom:'1px solid var(--border)', fontSize:13, color:'var(--text-muted)', display:'flex', justifyContent:'space-between' }}>
                <span>📄 Contract Preview</span>
                <span className="badge badge-green">AI Generated</span>
              </div>
              <div dangerouslySetInnerHTML={{ __html:contract }} style={{ maxHeight:600, overflowY:'auto', padding:4 }} />
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
