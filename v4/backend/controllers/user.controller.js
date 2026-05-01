const db = require('../config/db');

// ── POST /api/users/profile ──────────────────
exports.createProfile = (req, res) => {
  const { name, role, skills, experience, location, pincode, daily_rate, availability, bio } = req.body;
  const userId    = req.user.id;
  const skillsStr = Array.isArray(skills) ? skills.join(',') : (skills || '');

  db.query(
    `UPDATE users SET name=?, role=?, skills=?, experience=?, location=?, pincode=?, daily_rate=?, availability=?, bio=? WHERE id=?`,
    [name, role, skillsStr, experience, location, pincode, daily_rate || 0, availability || 'available', bio, userId],
    (err) => {
      if (err) return res.status(500).json({ success: false, message: 'Error updating profile', error: err.message });
      return res.status(200).json({ success: true, message: 'Profile saved successfully' });
    }
  );
};

// ── GET /api/users/workers ───────────────────
exports.getAllWorkers = (req, res) => {
  db.query(`SELECT id,name,phone,skills,experience,location,daily_rate,availability,rating,jobs_done FROM users WHERE role='worker' ORDER BY rating DESC`, [], (err, results) => {
    if (err) return res.status(500).json({ success: false, error: err.message });
    const workers = results.map(w => ({ ...w, skills: w.skills ? w.skills.split(',') : [] }));
    return res.status(200).json({ success: true, workers });
  });
};

// ── GET /api/users/:id ───────────────────────
exports.getUserById = (req, res) => {
  db.query('SELECT * FROM users WHERE id=?', [req.params.id], (err, results) => {
    if (err) return res.status(500).json({ success: false, error: err.message });
    if (!results.length) return res.status(404).json({ success: false, message: 'User not found' });
    const user = { ...results[0], skills: results[0].skills ? results[0].skills.split(',') : [] };
    return res.status(200).json({ success: true, user });
  });
};

// ── PUT /api/users/:id ───────────────────────
exports.updateUser = (req, res) => {
  const { name, skills, experience, location, daily_rate, availability, bio } = req.body;
  const skillsStr = Array.isArray(skills) ? skills.join(',') : (skills || '');
  db.query(
    `UPDATE users SET name=?,skills=?,experience=?,location=?,daily_rate=?,availability=?,bio=? WHERE id=?`,
    [name, skillsStr, experience, location, daily_rate, availability, bio, req.params.id],
    (err) => {
      if (err) return res.status(500).json({ success: false, error: err.message });
      return res.status(200).json({ success: true, message: 'Profile updated' });
    }
  );
};
