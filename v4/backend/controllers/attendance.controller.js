const db = require('../config/db');

// ── POST /api/attendance/upload ──────────────
exports.markAttendance = (req, res) => {
  const { job_id, note, face_score, face_verified } = req.body;
  const worker_id = req.user.id;
  const today     = new Date().toISOString().split('T')[0];
  const time      = new Date().toTimeString().split(' ')[0];

  if (!job_id) return res.status(400).json({ success: false, message: 'job_id required' });

  db.query('SELECT * FROM attendance WHERE job_id=? AND worker_id=? AND date=?', [job_id, worker_id, today], (err, results) => {
    if (err) return res.status(500).json({ success: false, error: err.message });
    if (results.length > 0) return res.status(400).json({ success: false, message: 'Attendance already marked for today' });

    const photoUrl = req.file ? `${req.protocol}://${req.get('host')}/uploads/${req.file.filename}` : null;

    db.query(
      'INSERT INTO attendance (job_id,worker_id,date,check_in_time,photo_url,face_verified,face_match_score,note) VALUES (?,?,?,?,?,?,?,?)',
      [job_id, worker_id, today, time, photoUrl, face_verified ? 1 : 0, face_score || 0, note || null],
      (err2, result) => {
        if (err2) return res.status(500).json({ success: false, error: err2.message });
        return res.status(201).json({ success: true, message: 'Attendance marked!', attendanceId: result.insertId, photoUrl, date: today, time });
      }
    );
  });
};

// ── GET /api/attendance/:workerId ────────────
exports.getWorkerAttendance = (req, res) => {
  const { job_id } = req.query;
  let query  = `SELECT a.*,j.title AS job_title FROM attendance a LEFT JOIN jobs j ON a.job_id=j.id WHERE a.worker_id=?`;
  const params = [req.params.workerId];
  if (job_id) { query += ' AND a.job_id=?'; params.push(job_id); }
  query += ' ORDER BY a.date DESC';

  db.query(query, params, (err, results) => {
    if (err) return res.status(500).json({ success: false, error: err.message });
    return res.status(200).json({ success: true, attendance: results, totalDays: results.length });
  });
};

// ── POST /api/attendance/complete ────────────
exports.submitCompletion = (req, res) => {
  const { job_id } = req.body;
  db.query('UPDATE jobs SET status=? WHERE id=?', ['pending_approval', job_id], (err) => {
    if (err) return res.status(500).json({ success: false, error: err.message });
    return res.status(200).json({ success: true, message: 'Work submitted. Awaiting client approval.' });
  });
};
