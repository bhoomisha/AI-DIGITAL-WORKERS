const db = require('../config/db');

// ── GET /api/notifications ───────────────────
exports.getUserNotifications = (req, res) => {
  db.query('SELECT * FROM notifications WHERE user_id=? ORDER BY created_at DESC', [req.user.id], (err, results) => {
    if (err) return res.status(500).json({ success: false, error: err.message });
    return res.status(200).json({ success: true, notifications: results, unread: results.filter(n=>!n.is_read).length });
  });
};

// ── PUT /api/notifications/:id/read ──────────
exports.markRead = (req, res) => {
  db.query('UPDATE notifications SET is_read=1 WHERE id=? AND user_id=?', [req.params.id, req.user.id], (err) => {
    if (err) return res.status(500).json({ success: false, error: err.message });
    return res.status(200).json({ success: true, message: 'Marked as read' });
  });
};

// ── PUT /api/notifications/read-all ──────────
exports.markAllRead = (req, res) => {
  db.query('UPDATE notifications SET is_read=1 WHERE user_id=?', [req.user.id], (err) => {
    if (err) return res.status(500).json({ success: false, error: err.message });
    return res.status(200).json({ success: true, message: 'All marked as read' });
  });
};
