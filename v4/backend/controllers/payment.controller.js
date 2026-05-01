const db = require('../config/db');

// ── POST /api/payments/process ───────────────
exports.processPayment = (req, res) => {
  const { job_id, worker_id, amount, method, upi_id } = req.body;
  const client_id = req.user.id;

  if (!job_id || !worker_id || !amount || !method) {
    return res.status(400).json({ success: false, message: 'job_id, worker_id, amount, method required' });
  }

  // Check job is approved
  db.query('SELECT * FROM jobs WHERE id=? AND (status=? OR status=?)', [job_id, 'completed', 'pending_approval'], (err, results) => {
    if (err) return res.status(500).json({ success: false, error: err.message });
    if (!results.length) return res.status(400).json({ success: false, message: 'Payment not allowed. Work must be approved first.' });

    const platformFee     = Math.round(amount * 0.02);
    const totalAmount     = parseInt(amount) + platformFee;
    const transactionId   = `TXN${Date.now()}${Math.floor(Math.random()*1000)}`;

    db.query(
      `INSERT INTO payments (job_id,worker_id,client_id,amount,platform_fee,total_amount,method,upi_id,transaction_id,status) VALUES (?,?,?,?,?,?,?,?,?,'completed')`,
      [job_id, worker_id, client_id, amount, platformFee, totalAmount, method, upi_id || null, transactionId],
      (err2, result) => {
        if (err2) return res.status(500).json({ success: false, error: err2.message });
        db.query('UPDATE jobs SET status=? WHERE id=?', ['paid', job_id], () => {});
        db.query('UPDATE users SET jobs_done=jobs_done+1 WHERE id=?', [worker_id], () => {});
        return res.status(201).json({ success: true, message: 'Payment successful!', transactionId, amount, platformFee, totalAmount, paymentId: result.insertId });
      }
    );
  });
};

// ── GET /api/payments/history/:userId ────────
exports.getPaymentHistory = (req, res) => {
  const { role } = req.query;
  const field    = role === 'worker' ? 'p.worker_id' : 'p.client_id';
  db.query(
    `SELECT p.*,j.title AS job_title,w.name AS worker_name,c.name AS client_name FROM payments p LEFT JOIN jobs j ON p.job_id=j.id LEFT JOIN users w ON p.worker_id=w.id LEFT JOIN users c ON p.client_id=c.id WHERE ${field}=? ORDER BY p.paid_at DESC`,
    [req.params.userId],
    (err, results) => {
      if (err) return res.status(500).json({ success: false, error: err.message });
      return res.status(200).json({ success: true, payments: results });
    }
  );
};
