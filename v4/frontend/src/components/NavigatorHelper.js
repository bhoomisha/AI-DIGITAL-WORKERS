import React, { useState } from 'react';

export default function NavigatorHelper({ tip, step, children, position='top' }) {
  const [visible, setVisible] = useState(false);
  return (
    <div style={{ position:'relative' }}>
      <div onFocus={() => setVisible(true)} onBlur={() => setVisible(false)} onMouseEnter={() => setVisible(true)} onMouseLeave={() => setVisible(false)}>
        {children}
      </div>
      {visible && tip && (
        <div className="tooltip-box" style={{ [position==='bottom'?'top':'bottom']:position==='bottom'?'calc(100% + 10px)':'calc(100% + 10px)', left:0, position:'absolute' }}>
          {step && <span style={{ display:'inline-block', background:'var(--primary)', color:'#fff', borderRadius:'50%', width:20, height:20, lineHeight:'20px', textAlign:'center', fontSize:11, marginRight:6, fontWeight:700 }}>{step}</span>}
          💡 {tip}
        </div>
      )}
    </div>
  );
}

export function StepGuide({ steps, current }) {
  return (
    <div className="steps">
      {steps.map((s, i) => (
        <React.Fragment key={i}>
          <div style={{ display:'flex', flexDirection:'column', alignItems:'center', gap:4 }}>
            <div className={`step-dot ${i<current?'done':i===current?'cur':'todo'}`}>{i<current?'✓':i+1}</div>
            <span style={{ fontSize:10, color:i===current?'var(--primary)':'var(--text-muted)', fontWeight:i===current?700:400, textAlign:'center', whiteSpace:'nowrap', maxWidth:70, overflow:'hidden', textOverflow:'ellipsis' }}>{s}</span>
          </div>
          {i < steps.length-1 && <div className={`step-line ${i<current?'done':''}`} />}
        </React.Fragment>
      ))}
    </div>
  );
}
