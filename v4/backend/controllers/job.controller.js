const db = require('../config/db');

// ── GET /api/jobs ────────────────────────────
exports.getAllJobs = (req, res) => {
  const { category, search, urgency } = req.query;
  let query  = `SELECT j.*, u.name AS client_name, u.rating AS client_rating FROM jobs j LEFT JOIN users u ON j.client_id=u.id WHERE j.status='open'`;
  const params = [];

  if (category && category !== 'All') { query += ' AND j.category=?'; params.push(category); }
  if (search)   { query += ' AND (j.title LIKE ? OR j.location LIKE ? OR j.skills LIKE ?)'; params.push(`%${search}%`,`%${search}%`,`%${search}%`); }
  if (urgency)  { query += ' AND j.urgency=?'; params.push(urgency); }
  query += ' ORDER BY j.created_at DESC';

  db.query(query, params, (err, results) => {
    if (err) return res.status(500).json({ success: false, error: err.message });
    const jobs = results.map(j => ({ ...j, skills: j.skills ? j.skills.split(',') : [] }));
    return res.status(200).json({ success: true, jobs });
  });
};

// ── GET /api/jobs/client/:clientId ───────────
exports.getClientJobs = (req, res) => {
  db.query('SELECT * FROM jobs WHERE client_id=? ORDER BY created_at DESC', [req.params.clientId], (err, results) => {
    if (err) return res.status(500).json({ success: false, error: err.message });
    const jobs = results.map(j => ({ ...j, skills: j.skills ? j.skills.split(',') : [] }));
    return res.status(200).json({ success: true, jobs });
  });
};

// ── GET /api/jobs/:id ────────────────────────
exports.getJobById = (req, res) => {
  db.query(`SELECT j.*,u.name AS client_name,u.rating AS client_rating,u.phone AS client_phone FROM jobs j LEFT JOIN users u ON j.client_id=u.id WHERE j.id=?`, [req.params.id], (err, results) => {
    if (err) return res.status(500).json({ success: false, error: err.message });
    if (!results.length) return res.status(404).json({ success: false, message: 'Job not found' });
    const job = { ...results[0], skills: results[0].skills ? results[0].skills.split(',') : [] };
    return res.status(200).json({ success: true, job });
  });
};

// ── POST /api/jobs/create ────────────────────
exports.createJob = (req, res) => {
  const { title, category, location, description, skills, pay, pay_type, duration, duration_unit, urgency, workers_needed, start_date } = req.body;
  if (!title || !location || !pay) return res.status(400).json({ success: false, message: 'Title, location and pay required' });
  const skillsStr = Array.isArray(skills) ? skills.join(',') : (skills || '');
  const clientId  = req.user.id;

  db.query(
    `INSERT INTO jobs (client_id,title,category,location,description,skills,pay,pay_type,duration,urgency,workers_needed,start_date) VALUES (?,?,?,?,?,?,?,?,?,?,?,?)`,
    [clientId, title, category, location, description, skillsStr, pay, pay_type||'daily', duration, urgency||'normal', workers_needed||1, start_date||null],
    (err, result) => {
      if (err) return res.status(500).json({ success: false, error: err.message });
      return res.status(201).json({ success: true, message: 'Job posted!', jobId: result.insertId });
    }
  );
};

// ── PUT /api/jobs/:id/status ─────────────────
exports.updateJobStatus = (req, res) => {
  db.query('UPDATE jobs SET status=? WHERE id=?', [req.body.status, req.params.id], (err) => {
    if (err) return res.status(500).json({ success: false, error: err.message });
    return res.status(200).json({ success: true, message: 'Job status updated' });
  });
};
