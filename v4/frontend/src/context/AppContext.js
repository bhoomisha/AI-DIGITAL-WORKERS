import React, { createContext, useContext, useState, useEffect } from 'react';
import { getDistance } from '../services/api';

const AppContext = createContext(null);
const load = (k, fb) => { try { const v = localStorage.getItem(k); return v ? JSON.parse(v) : fb; } catch { return fb; } };
const save = (k, v)  => { try { localStorage.setItem(k, JSON.stringify(v)); } catch {} };

// Seed jobs with real coordinates-based distance
const SEED_JOBS = [
  { id:1, title:'House Painting', category:'Painting', location:'Sector 14, Noida', distance:8.2,
    pay:800, payType:'daily', duration:'3', durationUnit:'days', skills:['Painting','Wall Finishing'],
    description:'Interior painting for a 2BHK flat. Materials provided by client.', urgency:'normal',
    clientId:'seed-1', clientName:'Ramesh Gupta', postedAt:new Date().toISOString(), status:'open', applicants:[] },
  { id:2, title:'Electrical Wiring', category:'Electrician', location:'Indirapuram',   distance:3.1,
    pay:1200, payType:'daily', duration:'2', durationUnit:'days', skills:['Wiring','Electrician'],
    description:'3-phase wiring for new office. Must bring tools.', urgency:'urgent',
    clientId:'seed-2', clientName:'Sunita Sharma', postedAt:new Date(Date.now()-86400000).toISOString(), status:'open', applicants:[] },
  { id:3, title:'Plumbing Repair', category:'Plumbing', location:'Vasundhara',         distance:5.8,
    pay:600, payType:'daily', duration:'1', durationUnit:'day',  skills:['Plumbing','Pipe Fitting'],
    description:'Kitchen and bathroom pipe repair. Urgent.', urgency:'urgent',
    clientId:'seed-1', clientName:'Ramesh Gupta', postedAt:new Date(Date.now()-172800000).toISOString(), status:'open', applicants:[] },
  { id:4, title:'Carpentry – Door Repair', category:'Carpentry', location:'Raj Nagar', distance:9.1,
    pay:5000, payType:'fixed', duration:'2', durationUnit:'days', skills:['Carpentry','Wood Work'],
    description:'3 doors + 2 windows need repair and polish. Fixed price job.', urgency:'normal',
    clientId:'seed-3', clientName:'Priya Mehta', postedAt:new Date(Date.now()-259200000).toISOString(), status:'open', applicants:[] },
  { id:5, title:'AC Installation', category:'AC Technician', location:'Crossings Republik', distance:12.4,
    pay:3500, payType:'fixed', duration:'1', durationUnit:'day',  skills:['AC Repair','Electrician'],
    description:'Install 2 new ACs and service 3 existing units. Fixed price.', urgency:'normal',
    clientId:'seed-2', clientName:'Sunita Sharma', postedAt:new Date(Date.now()-345600000).toISOString(), status:'open', applicants:[] },
];

export function AppProvider({ children }) {
  const [user, _setU]      = useState(() => load('adw_user', null));
  const [role, _setR]      = useState(() => load('adw_role', null));
  const [wp,   _setWP]     = useState(() => load('adw_wp', null));
  const [jobs, _setJ]      = useState(() => load('adw_jobs', SEED_JOBS));
  const [apps, _setA]      = useState(() => load('adw_apps', []));
  const [reviews, _setRev] = useState(() => load('adw_reviews', []));
  const [payments, _setPay]= useState(() => load('adw_pay', []));
  const [attend, _setAtt]  = useState(() => load('adw_att', []));
  const [notifs, _setNot]  = useState(() => load('adw_notifs', []));
  const [wc, _setWC]       = useState(() => load('adw_wc', []));

  function setUser(v)         { _setU(v);  save('adw_user', v); }
  function setRole(v)         { _setR(v);  save('adw_role', v); }
  function setWorkerProfile(v){ _setWP(v); save('adw_wp', v); }

  useEffect(() => { save('adw_jobs',    jobs);    }, [jobs]);
  useEffect(() => { save('adw_apps',    apps);    }, [apps]);
  useEffect(() => { save('adw_reviews', reviews); }, [reviews]);
  useEffect(() => { save('adw_pay',     payments);}, [payments]);
  useEffect(() => { save('adw_att',     attend);  }, [attend]);
  useEffect(() => { save('adw_notifs',  notifs);  }, [notifs]);
  useEffect(() => { save('adw_wc',      wc);      }, [wc]);

  function notify(userId, title, message, type='info') {
    _setNot(p => [{ id:Date.now(), userId, title, message, type, is_read:false, created_at:new Date().toISOString() }, ...p]);
  }

  function postJob(data) {
    // Calculate real distance if worker location known
    const workerLoc = wp?.location || '';
    const dist = workerLoc ? getDistance(workerLoc, data.location) : parseFloat((4+Math.random()*12).toFixed(1));
    const job = { ...data, id:Date.now(), postedAt:new Date().toISOString(), status:'open', applicants:[], distance:dist };
    _setJ(p => [job, ...p]);
    return job;
  }

  function applyToJob(jobId, workerData) {
    if (apps.some(a => a.jobId===jobId && a.workerId===workerData.id)) return { error:'Already applied' };
    const app = { id:Date.now(), jobId, workerId:workerData.id, workerData, status:'pending', appliedAt:new Date().toISOString() };
    _setA(p => [...p, app]);
    _setJ(p => p.map(j => j.id===jobId ? { ...j, applicants:[...(j.applicants||[]), app] } : j));
    const job = jobs.find(j=>j.id===jobId);
    if (job) notify(job.clientId, '👷 New Applicant', `${workerData.name} applied for "${job.title}"`, 'application');
    return app;
  }

  function hireWorker(jobId, appId) {
    _setJ(p => p.map(j => j.id===jobId ? { ...j, status:'assigned', hiredAppId:appId } : j));
    _setA(p => p.map(a => a.id===appId ? { ...a, status:'hired' } : a));
    const app = apps.find(a=>a.id===appId);
    if (app) notify(app.workerId, '🎉 You are Hired!', 'A client hired you. Start work and mark attendance!', 'hired');
  }

  function rejectApplication(appId) {
    _setA(p => p.map(a => a.id===appId ? { ...a, status:'rejected' } : a));
  }

  function markAttendance(record) {
    const today = new Date().toISOString().split('T')[0];
    if (attend.some(a => a.jobId===record.jobId && a.workerId===record.workerId && a.date===today))
      return { error:'Attendance already marked for today.' };
    const entry = { ...record, id:Date.now(), date:today, time:new Date().toLocaleTimeString('en-IN'), createdAt:new Date().toISOString() };
    _setAtt(p => [...p, entry]);
    return entry;
  }

  function submitWorkCompletion(data) {
    const entry = { ...data, id:Date.now(), status:'pending_approval', submittedAt:new Date().toISOString() };
    _setWC(p => [...p, entry]);
    _setJ(p => p.map(j => j.id===data.jobId ? { ...j, status:'pending_approval' } : j));
    const job = jobs.find(j=>j.id===data.jobId);
    if (job) notify(job.clientId, '📤 Work Submitted', `Worker submitted "${job.title}". Please review.`, 'completion');
    return entry;
  }

  function approveWork(jobId, workerId) {
    _setWC(p => p.map(w => w.jobId===jobId ? { ...w, status:'approved', approvedAt:new Date().toISOString() } : w));
    _setJ(p => p.map(j => j.id===jobId ? { ...j, status:'completed', paymentUnlocked:true } : j));
    if (workerId) notify(workerId, '✅ Work Approved!', 'Payment is now unlocked!', 'payment');
  }

  function rejectWork(jobId, workerId, remark='') {
    _setWC(p => p.map(w => w.jobId===jobId ? { ...w, status:'rejected', remark } : w));
    _setJ(p => p.map(j => j.id===jobId ? { ...j, status:'rework_required' } : j));
    if (workerId) notify(workerId, '🔄 Rework Required', remark||'Client requested rework.', 'rejection');
  }

  function processPayment(data) {
    const job = jobs.find(j=>j.id===data.jobId);
    if (!job?.paymentUnlocked) return { error:'Work must be approved before payment.' };
    if (job.status==='paid') return { error:'Payment already made for this job.' };
    const fee     = Math.round(data.amount * 0.02);
    const total   = data.amount + fee;
    const txn     = `TXN${Date.now()}`;
    const payment = { ...data, id:Date.now(), transactionId:txn, platformFee:fee, totalAmount:total, paidAt:new Date().toISOString(), status:'completed' };
    _setPay(p => [...p, payment]);
    _setJ(p => p.map(j => j.id===data.jobId ? { ...j, status:'paid' } : j));
    if (data.workerId) notify(data.workerId, '💳 Payment Received!', `₹${data.amount} paid!`, 'payment');
    return payment;
  }

  function submitReview(review) {
    const r = { ...review, id:Date.now(), createdAt:new Date().toISOString() };
    _setRev(p => [...p, r]);
    return r;
  }

  function getUserRating(userId) {
    const mine = reviews.filter(r => r.targetId===userId);
    if (!mine.length) return null;
    return { average: parseFloat((mine.reduce((s,r)=>s+r.rating,0)/mine.length).toFixed(1)), count: mine.length };
  }

  function markNotifRead(id)   { _setNot(p => p.map(n => n.id===id ? { ...n, is_read:true } : n)); }
  function markAllNotifsRead() { _setNot(p => p.map(n => ({ ...n, is_read:true }))); }

  function logout() {
    ['adw_user','adw_role','adw_token','adw_wp'].forEach(k => localStorage.removeItem(k));
    _setU(null); _setR(null); _setWP(null);
  }

  return (
    <AppContext.Provider value={{
      user, setUser, role, setRole,
      workerProfile:wp, setWorkerProfile,
      jobs, postJob,
      applications:apps, applyToJob, hireWorker, rejectApplication,
      attendance:attend, markAttendance,
      workCompletions:wc, submitWorkCompletion, approveWork, rejectWork,
      payments, processPayment,
      reviews, submitReview, getUserRating,
      notifications:notifs, markNotifRead, markAllNotifsRead, notify,
      logout,
    }}>
      {children}
    </AppContext.Provider>
  );
}

export function useApp() { return useContext(AppContext); }
