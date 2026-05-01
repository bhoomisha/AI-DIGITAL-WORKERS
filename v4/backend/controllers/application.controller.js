const db = require('../config/db');

// ── POST /api/applications/apply ─────────────
exports.applyToJob = (req, res) => {
  const { job_id, match_score } = req.body;
  const worker_id = req.user.id;
  if (!job_id) return res.status(400).json({ success: false, message: 'job_id required' });

  db.query('SELECT * FROM applications WHERE job_id=? AND worker_id=?', [job_id, worker_id], (err, results) => {
    if (err) return res.status(500).json({ success: false, error: err.message });
    if (results.length > 0) return res.status(400).json({ success: false, message: 'Already applied to this job' });

    db.query('INSERT INTO applications (job_id,worker_id,match_score) VALUES (?,?,?)', [job_id, worker_id, match_score || 0], (err2, result) => {
      if (err2) return res.status(500).json({ success: false, error: err2.message });
      return res.status(201).json({ success: true, message: 'Applied successfully', applicationId: result.insertId });
    });
  });
};

// ── GET /api/applications/worker/:workerId ────
exports.getWorkerApplications = (req, res) => {
  db.query(
    `SELECT a.*,j.title AS job_title,j.location AS job_location,j.pay,j.pay_type,j.duration,u.name AS client_name FROM applications a LEFT JOIN jobs j ON a.job_id=j.id LEFT JOIN users u ON j.client_id=u.id WHERE a.worker_id=? ORDER BY a.applied_at DESC`,
    [req.params.workerId],
    (err, results) => {
      if (err) return res.status(500).json({ success: false, error: err.message });
      return res.status(200).json({ success: true, applications: results });
    }
  );
};

// ── GET /api/applications/job/:jobId ─────────
exports.getJobApplicants = (req, res) => {
  db.query(
    `SELECT a.*,u.name,u.phone,u.skills,u.experience,u.location,u.rating,u.jobs_done,u.availability FROM applications a LEFT JOIN users u ON a.worker_id=u.id WHERE a.job_id=? ORDER BY a.match_score DESC`,
    [req.params.jobId],
    (err, results) => {
      if (err) return res.status(500).json({ success: false, error: err.message });
      const applicants = results.map(a => ({ ...a, skills: a.skills ? a.skills.split(',') : [] }));
      return res.status(200).json({ success: true, applicants });
    }
  );
};

// ── PUT /api/applications/hire/:id ───────────
exports.hireWorker = (req, res) => {
  db.query('UPDATE applications SET status=? WHERE id=?', ['hired', req.params.id], (err) => {
    if (err) return res.status(500).json({ success: false, error: err.message });
    db.query('SELECT job_id FROM applications WHERE id=?', [req.params.id], (e, r) => {
      if (!e && r.length) db.query('UPDATE jobs SET status=? WHERE id=?', ['assigned', r[0].job_id], () => {});
    });
    return res.status(200).json({ success: true, message: 'Worker hired!' });
  });
};

// ── PUT /api/applications/reject/:id ─────────
exports.rejectApplication = (req, res) => {
  db.query('UPDATE applications SET status=? WHERE id=?', ['rejected', req.params.id], (err) => {
    if (err) return res.status(500).json({ success: false, error: err.message });
    return res.status(200).json({ success: true, message: 'Application rejected' });
  });
};
