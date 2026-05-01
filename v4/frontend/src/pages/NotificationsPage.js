// NotificationsPage.js
import React from 'react';
import { useApp } from '../context/AppContext';

const TYPE_ICON = { application:'👷', hired:'🎉', payment:'💳', completion:'📤', rejection:'🔄', info:'ℹ️' };

export default function NotificationsPage() {
  const { user, notifications, markNotificationRead, markAllRead } = useApp();
  const mine = notifications.filter(n => n.userId===user?.id).sort((a,b)=>new Date(b.created_at)-new Date(a.created_at));
  const unread = mine.filter(n=>!n.is_read).length;

  return (
    <div className="page-wrapper" style={{ paddingBottom:40 }}>
      <div className="container" style={{ paddingTop:24, maxWidth:600 }}>
        <div className="section-header">
          <div>
            <h1 style={{ fontFamily:'var(--font-display)', fontSize:26, marginBottom:2 }}>🔔 Notifications</h1>
            <p style={{ color:'var(--text-muted)', fontSize:14 }}>{unread} unread</p>
          </div>
          {unread>0&&<button className="btn btn-outline btn-sm" onClick={markAllRead}>Mark All Read</button>}
        </div>

        {mine.length===0
          ? <div className="empty-state"><span className="emoji">🔔</span><h3>No Notifications</h3><p>Notifications will appear here</p></div>
          : mine.map(n=>(
            <div key={n.id} className={`notif-card ${n.is_read?'read':''}`} onClick={()=>markNotificationRead(n.id)} style={{ cursor:'pointer' }}>
              <div style={{ display:'flex', gap:12, alignItems:'flex-start' }}>
                <span style={{ fontSize:24, flexShrink:0 }}>{TYPE_ICON[n.type]||'ℹ️'}</span>
                <div style={{ flex:1 }}>
                  <div style={{ fontWeight:700, fontSize:15 }}>{n.title}</div>
                  <div style={{ fontSize:13, color:'var(--text-muted)', marginTop:2 }}>{n.message}</div>
                  <div style={{ fontSize:11, color:'var(--text-muted)', marginTop:4 }}>{new Date(n.created_at).toLocaleString('en-IN',{dateStyle:'medium',timeStyle:'short'})}</div>
                </div>
                {!n.is_read&&<span style={{ width:10, height:10, borderRadius:'50%', background:'var(--primary)', flexShrink:0, marginTop:4 }} />}
              </div>
            </div>
          ))
        }
      </div>
    </div>
  );
}
