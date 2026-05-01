import React, { useEffect, useRef, useState } from 'react';
import { useApp } from '../../context/AppContext';

/* ══════════════════════════════════════════════
   DEMAND HEATMAP — Leaflet.js
   Shows job demand by city/area
   No API key needed (OpenStreetMap tiles)
══════════════════════════════════════════════ */

const JOB_DEMAND = [
  { city:'Delhi',       lat:28.6139, lng:77.2090, jobs:45, workers:120, avgWage:850,  category:'Mixed',     color:'#dc2626' },
  { city:'Noida',       lat:28.5355, lng:77.3910, jobs:28, workers:65,  avgWage:900,  category:'Electrical',color:'#d97706' },
  { city:'Gurgaon',     lat:28.4595, lng:77.0266, jobs:32, workers:80,  avgWage:950,  category:'Carpentry', color:'#dc2626' },
  { city:'Ghaziabad',   lat:28.6692, lng:77.4538, jobs:18, workers:55,  avgWage:750,  category:'Painting',  color:'#16a34a' },
  { city:'Faridabad',   lat:28.4089, lng:77.3178, jobs:15, workers:42,  avgWage:700,  category:'Plumbing',  color:'#2563eb' },
  { city:'Mumbai',      lat:19.0760, lng:72.8777, jobs:60, workers:140, avgWage:1100, category:'Mixed',     color:'#dc2626' },
  { city:'Pune',        lat:18.5204, lng:73.8567, jobs:35, workers:90,  avgWage:950,  category:'Masonry',   color:'#d97706' },
  { city:'Bangalore',   lat:12.9716, lng:77.5946, jobs:40, workers:100, avgWage:1000, category:'Electrical',color:'#d97706' },
  { city:'Hyderabad',   lat:17.3850, lng:78.4867, jobs:25, workers:70,  avgWage:850,  category:'Plumbing',  color:'#16a34a' },
  { city:'Chennai',     lat:13.0827, lng:80.2707, jobs:22, workers:60,  avgWage:800,  category:'Carpentry', color:'#16a34a' },
];

export default function DemandHeatmapPage() {
  const { jobs } = useApp();
  const mapRef    = useRef(null);
  const mapInst   = useRef(null);
  const [loaded, setLoaded]   = useState(false);
  const [selCity, setSelCity] = useState(null);
  const [filter, setFilter]   = useState('all');

  useEffect(() => {
    loadLeaflet().then(() => {
      setLoaded(true);
      initMap();
    });
    return () => { mapInst.current?.remove(); };
  }, []);

  function loadLeaflet() {
    return new Promise(resolve => {
      if (window.L) { resolve(); return; }
      const link = document.createElement('link');
      link.rel = 'stylesheet'; link.href = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.css';
      document.head.appendChild(link);
      const s = document.createElement('script');
      s.src = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.js';
      s.onload = resolve;
      document.head.appendChild(s);
    });
  }

  function initMap() {
    if (!mapRef.current || mapInst.current) return;
    const L = window.L;
    const map = L.map(mapRef.current).setView([22.5, 79.0], 5);
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '© OpenStreetMap contributors'
    }).addTo(map);
    mapInst.current = map;
    addMarkers(map, 'all');
  }

  function addMarkers(map, catFilter) {
    const L = window.L;
    map.eachLayer(l => { if (l instanceof L.CircleMarker) map.removeLayer(l); });

    const data = catFilter==='all' ? JOB_DEMAND : JOB_DEMAND.filter(d => d.category===catFilter);

    data.forEach(d => {
      const radius = Math.max(12, d.jobs * 0.6);
      const circle = L.circleMarker([d.lat, d.lng], {
        radius,
        fillColor: d.color,
        color: '#fff',
        weight: 2,
        opacity: 1,
        fillOpacity: 0.75,
      }).addTo(map);

      circle.bindPopup(`
        <div style="font-family:system-ui;min-width:160px">
          <div style="font-weight:700;font-size:15px;margin-bottom:6px">${d.city}</div>
          <div style="display:flex;justify-content:space-between;margin-bottom:3px"><span style="color:#64748b">Open Jobs</span><strong>${d.jobs}</strong></div>
          <div style="display:flex;justify-content:space-between;margin-bottom:3px"><span style="color:#64748b">Workers</span><strong>${d.workers}</strong></div>
          <div style="display:flex;justify-content:space-between;margin-bottom:3px"><span style="color:#64748b">Avg Wage</span><strong>₹${d.avgWage}/day</strong></div>
          <div style="display:flex;justify-content:space-between"><span style="color:#64748b">Top Category</span><strong>${d.category}</strong></div>
        </div>
      `);

      circle.on('click', () => setSelCity(d));

      // Label
      L.marker([d.lat, d.lng], {
        icon: L.divIcon({
          className: '',
          html: `<div style="font-size:10px;font-weight:700;color:#fff;text-shadow:0 1px 3px rgba(0,0,0,.6);white-space:nowrap;transform:translateX(-50%)">${d.jobs} jobs</div>`,
          iconSize: [60, 16],
        }),
        zIndexOffset: 1000,
      }).addTo(map);
    });
  }

  function handleFilterChange(cat) {
    setFilter(cat);
    if (mapInst.current) addMarkers(mapInst.current, cat);
  }

  const totalJobs    = JOB_DEMAND.reduce((s,d)=>s+d.jobs,0);
  const totalWorkers = JOB_DEMAND.reduce((s,d)=>s+d.workers,0);
  const avgWage      = Math.round(JOB_DEMAND.reduce((s,d)=>s+d.avgWage,0)/JOB_DEMAND.length);
  const hotspot      = [...JOB_DEMAND].sort((a,b)=>b.jobs-a.jobs)[0];

  return (
    <div className="page" style={{ paddingBottom:80 }}>
      <div className="container" style={{ paddingTop:28 }}>
        <div style={{ marginBottom:20 }}>
          <h1 style={{ fontSize:24, fontWeight:700, marginBottom:4 }}>📍 Job Demand Heatmap</h1>
          <p style={{ color:'var(--text-muted)', fontSize:14 }}>Real-time view of job opportunities across India. Bigger circles = more demand.</p>
        </div>

        {/* Stats */}
        <div className="grid-4" style={{ marginBottom:20 }}>
          {[
            { icon:'💼', label:'Total Open Jobs',   value:totalJobs+jobs.filter(j=>j.status==='open').length, bg:'#eff6ff' },
            { icon:'👷', label:'Available Workers',  value:totalWorkers, bg:'#f0fdf4' },
            { icon:'💰', label:'Average Daily Wage', value:`₹${avgWage}`, bg:'#fefce8' },
            { icon:'🔥', label:'Hotspot City',       value:hotspot.city, bg:'#fdf4ff' },
          ].map(s => (
            <div key={s.label} className="stat-card">
              <div className="stat-card__icon" style={{ background:s.bg }}>{s.icon}</div>
              <div className="stat-card__value" style={{ fontSize:22 }}>{s.value}</div>
              <div className="stat-card__label">{s.label}</div>
            </div>
          ))}
        </div>

        {/* Filter */}
        <div style={{ display:'flex', gap:8, marginBottom:16, flexWrap:'wrap' }}>
          {['all','Electrical','Plumbing','Painting','Carpentry','Masonry','Mixed'].map(c => (
            <button key={c} onClick={() => handleFilterChange(c)} className={`btn btn-sm ${filter===c?'btn-saffron':'btn-ghost'}`} style={{ fontSize:12 }}>
              {c==='all'?'🗺 All':c}
            </button>
          ))}
        </div>

        <div style={{ display:'grid', gridTemplateColumns:'1fr 300px', gap:20, alignItems:'start' }}>
          {/* Map */}
          <div className="card" style={{ padding:0, overflow:'hidden' }}>
            <div ref={mapRef} style={{ height:480, width:'100%' }} />
            {!loaded && (
              <div style={{ position:'absolute', inset:0, background:'var(--gray-100)', display:'flex', alignItems:'center', justifyContent:'center', borderRadius:14 }}>
                <p style={{ color:'var(--text-muted)' }}>Loading map...</p>
              </div>
            )}
          </div>

          {/* Sidebar */}
          <div>
            <div className="card" style={{ marginBottom:16 }}>
              <div style={{ fontWeight:600, fontSize:14, marginBottom:12 }}>Legend</div>
              <div style={{ display:'flex', flexDirection:'column', gap:8, fontSize:13 }}>
                {[['#dc2626','High demand (20+ jobs)'],['#d97706','Medium demand (10-20)'],['#16a34a','Low demand (<10)'],['#2563eb','Plumbing focus']].map(([c,l]) => (
                  <div key={l} className="heatmap-legend"><div className="heatmap-dot" style={{ background:c }} /><span>{l}</span></div>
                ))}
              </div>
            </div>

            {selCity && (
              <div className="card fade-in" style={{ borderLeft:'4px solid var(--saffron)' }}>
                <div style={{ fontWeight:700, fontSize:16, marginBottom:10 }}>{selCity.city}</div>
                <div style={{ display:'flex', flexDirection:'column', gap:6, fontSize:13 }}>
                  <div style={{ display:'flex', justifyContent:'space-between' }}><span style={{ color:'var(--text-muted)' }}>Open Jobs</span><strong>{selCity.jobs}</strong></div>
                  <div style={{ display:'flex', justifyContent:'space-between' }}><span style={{ color:'var(--text-muted)' }}>Workers</span><strong>{selCity.workers}</strong></div>
                  <div style={{ display:'flex', justifyContent:'space-between' }}><span style={{ color:'var(--text-muted)' }}>Avg Daily Wage</span><strong style={{ color:'var(--success)' }}>₹{selCity.avgWage}</strong></div>
                  <div style={{ display:'flex', justifyContent:'space-between' }}><span style={{ color:'var(--text-muted)' }}>Top Category</span><span className="badge badge-saffron">{selCity.category}</span></div>
                </div>
                <div style={{ marginTop:12, height:5, background:'var(--gray-200)', borderRadius:99, overflow:'hidden' }}>
                  <div style={{ height:'100%', width:Math.min(selCity.jobs*1.5,100)+'%', background:'var(--saffron)', borderRadius:99 }} />
                </div>
                <div style={{ fontSize:11, color:'var(--text-muted)', marginTop:4 }}>Demand level: {selCity.jobs>30?'Very High':selCity.jobs>20?'High':selCity.jobs>10?'Medium':'Low'}</div>
              </div>
            )}

            {/* City table */}
            <div className="card" style={{ marginTop:selCity?16:0 }}>
              <div style={{ fontWeight:600, fontSize:14, marginBottom:10 }}>Top Cities by Demand</div>
              {[...JOB_DEMAND].sort((a,b)=>b.jobs-a.jobs).slice(0,5).map((d,i) => (
                <div key={d.city} onClick={() => setSelCity(d)} style={{ display:'flex', justifyContent:'space-between', alignItems:'center', padding:'7px 0', borderBottom:i<4?'1px solid var(--border)':'none', cursor:'pointer' }}>
                  <div style={{ display:'flex', alignItems:'center', gap:8 }}>
                    <span style={{ fontSize:11, fontWeight:700, color:'var(--text-faint)', width:16 }}>{i+1}</span>
                    <span style={{ fontSize:13, fontWeight:600 }}>{d.city}</span>
                  </div>
                  <div style={{ display:'flex', alignItems:'center', gap:8 }}>
                    <span style={{ fontSize:12, color:'var(--text-muted)' }}>{d.jobs} jobs</span>
                    <div style={{ width:6, height:6, borderRadius:'50%', background:d.color }} />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
