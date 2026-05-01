const db = require('../config/db');

// ── POST /api/reviews/submit ─────────────────
exports.submitReview = (req, res) => {
  const { job_id, target_id, rating, comment, type } = req.body;
  const reviewer_id = req.user.id;

  if (!target_id || !rating || !type) return res.status(400).json({ success: false, message: 'target_id, rating, type required' });
  if (rating < 1 || rating > 5) return res.status(400).json({ success: false, message: 'Rating must be 1–5' });

  db.query(
    'INSERT INTO reviews (job_id,reviewer_id,target_id,rating,comment,type) VALUES (?,?,?,?,?,?)',
    [job_id || null, reviewer_id, target_id, rating, comment || null, type],
    (err, result) => {
      if (err) return res.status(500).json({ success: false, error: err.message });
      // Update user average rating
      db.query('UPDATE users SET rating=(SELECT AVG(rating) FROM reviews WHERE target_id=?) WHERE id=?', [target_id, target_id], () => {});
      return res.status(201).json({ success: true, message: 'Review submitted!', reviewId: result.insertId });
    }
  );
};

// ── GET /api/reviews/:userId ─────────────────
exports.getUserReviews = (req, res) => {
  db.query(
    `SELECT r.*,u.name AS reviewer_name,t.name AS target_name,j.title AS job_title FROM reviews r LEFT JOIN users u ON r.reviewer_id=u.id LEFT JOIN users t ON r.target_id=t.id LEFT JOIN jobs j ON r.job_id=j.id WHERE r.target_id=? ORDER BY r.created_at DESC`,
    [req.params.userId],
    (err, results) => {
      if (err) return res.status(500).json({ success: false, error: err.message });
      const avg = results.length ? (results.reduce((s,r)=>s+r.rating,0)/results.length).toFixed(1) : 0;
      return res.status(200).json({ success: true, reviews: results, averageRating: parseFloat(avg), totalReviews: results.length });
    }
  );
};

// ── GET /api/reviews/all ─────────────────────
exports.getAllReviews = (req, res) => {
  db.query(
    `SELECT r.*,u.name AS reviewer_name,t.name AS target_name,j.title AS job_title FROM reviews r LEFT JOIN users u ON r.reviewer_id=u.id LEFT JOIN users t ON r.target_id=t.id LEFT JOIN jobs j ON r.job_id=j.id ORDER BY r.created_at DESC`,
    [],
    (err, results) => {
      if (err) return res.status(500).json({ success: false, error: err.message });
      return res.status(200).json({ success: true, reviews: results });
    }
  );
};
