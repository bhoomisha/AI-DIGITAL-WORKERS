const express = require('express');
const router  = express.Router();
const multer  = require('multer');
const upload  = multer({ storage: multer.memoryStorage(), limits: { fileSize: 50 * 1024 * 1024 } });
const auth    = require('../middleware/auth.middleware');
const ai      = require('../services/aiService');

// POST /api/ai/video-bio — transcribe video + extract skills
router.post('/video-bio', auth, upload.single('video'), async (req, res) => {
  try {
    const transcript = await ai.transcribeAudio(req.file?.buffer || Buffer.alloc(0), 'hi');
    const analysis   = await ai.extractSkillsFromTranscript(transcript);
    res.json({ success: true, transcript, ...analysis });
  } catch (e) {
    res.status(500).json({ success: false, error: e.message });
  }
});

// POST /api/ai/voice-resume — Hindi voice → structured profile
router.post('/voice-resume', auth, upload.single('audio'), async (req, res) => {
  try {
    const language   = req.body.language || 'hi';
    const transcript = await ai.transcribeAudio(req.file?.buffer || Buffer.alloc(0), language);
    const profile    = await ai.generateVoiceResume(transcript);
    res.json({ success: true, transcript, profile });
  } catch (e) {
    res.status(500).json({ success: false, error: e.message });
  }
});

// POST /api/ai/interview-score — score 3 video answers
router.post('/interview-score', auth, upload.fields([{ name:'q0' },{ name:'q1' },{ name:'q2' }]), async (req, res) => {
  try {
    const t0 = await ai.transcribeAudio(req.files?.q0?.[0]?.buffer || Buffer.alloc(0), 'hi');
    const t1 = await ai.transcribeAudio(req.files?.q1?.[0]?.buffer || Buffer.alloc(0), 'hi');
    const t2 = await ai.transcribeAudio(req.files?.q2?.[0]?.buffer || Buffer.alloc(0), 'hi');
    const scores = await ai.scoreInterview([t0, t1, t2]);
    res.json({ success: true, transcripts: [t0, t1, t2], scores });
  } catch (e) {
    res.status(500).json({ success: false, error: e.message });
  }
});

// POST /api/ai/fraud-check — run fraud check on user profile
router.post('/fraud-check', auth, async (req, res) => {
  try {
    const result = ai.runFraudCheck(req.body.profile || {});
    res.json({ success: true, ...result });
  } catch (e) {
    res.status(500).json({ success: false, error: e.message });
  }
});

// POST /api/ai/chatbot — AI chatbot with Claude
router.post('/chatbot', auth, async (req, res) => {
  try {
    const { message, role, name, history = [] } = req.body;
    if (!message) return res.status(400).json({ success: false, message: 'message required' });
    const reply = await ai.chatbotReply(message, role, name, history);
    res.json({ success: true, reply });
  } catch (e) {
    res.status(500).json({ success: false, error: e.message });
  }
});

// POST /api/contracts/generate — generate bilingual contract + return HTML
router.post('/contract', auth, async (req, res) => {
  try {
    const { workerName, clientName, jobTitle, jobDescription, location, startDate, duration, dailyWage, workingHours } = req.body;
    if (!workerName || !clientName || !jobTitle || !dailyWage) {
      return res.status(400).json({ success: false, message: 'workerName, clientName, jobTitle, dailyWage required' });
    }
    const totalAmount = parseInt(dailyWage) * parseInt(duration || 1);
    const contractText = await ai.generateContract({ workerName, clientName, jobTitle, jobDescription: jobDescription || '', location: location || 'Delhi NCR', startDate: startDate || new Date().toLocaleDateString('en-IN'), duration: duration || 1, dailyWage, totalAmount, workingHours: workingHours || '8' });
    res.json({ success: true, contractText, totalAmount });
  } catch (e) {
    res.status(500).json({ success: false, error: e.message });
  }
});

module.exports = router;
