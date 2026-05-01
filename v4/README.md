# ⚒️ AI Digital Workers 

> India's AI-Powered Labour Marketplace  
> React + Node.js + MySQL +  face-api.js

---

## 📁 Project Structure

```
ai-digital-workers/
├── frontend/                    ← React 18 app (port 3000)
│   ├── public/index.html        ← Fonts (Playfair+DM Sans) + face-api.js CDN
│   ├── package.json
│   └── src/
│       ├── App.js               ← All 20+ routes
│       ├── index.css            ← Complete design system (saffron/navy theme)
│       ├── context/AppContext.js← Global state + localStorage persistence
│       ├── services/api.js      ← OTP, AI match, payment calc, distance
│       ├── components/
│       │   ├── Navbar.js        ← With AI Tools dropdown menu
│       │   ├── JobCard.js       ← AI match score rings + color bars
│       │   ├── ProfileCard.js   ← Trust badge + match ring
│       │   ├── FaceVerification.js ← face-api.js real AI
│       │   ├── VoiceAssistant.js   ← Hindi + English bilingual
│       │   └── ai/
│       │       ├── AIChatbot.js        ←  chatbot (Hinglish)
│       │       └── DemoRoleSwitcher.js ← Switch roles without logout
│       └── pages/
│           ├── LandingPage.js       ← Playfair Display, saffron/navy, SVG hero
│           ├── LoginPage.js         ← OTP login, shown on screen
│           ├── WorkerDashboard.js   ← AI features panel + completeness meter
│           ├── ClientDashboard.js   ← Stats + activity feed
│           ├── DemoDashboard.js     ← Full split-screen supervisor mode
│           └── ai/
│               ├── VideoBioPage.js         ← 🎥 Record + AI transcribe + extract skills
│               ├── VoiceResumePage.js      ← 🎤 Hindi voice → structured profile (Claude)
│               ├── ContractMakerPage.js    ← 📄 Bilingual PDF contract (Claude)
│               ├── InterviewScorerPage.js  ← 🎯 3-question interview → AI score
│               ├── FakeProfileDetectorPage.js ← 🛡️ Trust score + fraud signals
│               └── DemandHeatmapPage.js    ← 📍 Leaflet.js job demand map
│
└── backend/                     ← Node.js + Express (port 5001)
    ├── server.js
    ├── .env
    ├── config/db.js + schema.sql
    ├── middleware/
    ├── controllers/
    └── routes/
```

---

## ⚡ Quick Start (5 Steps)

### Step 1 — Database Setup

1. Open XAMPP → Start **Apache** and **MySQL**
2. Open `http://localhost/phpmyadmin`
3. Click **SQL** tab → paste contents of `backend/config/schema.sql` → **Go**

### Step 2 — Backend

```bash
cd ai-digital-workers/backend
npm install
npm run dev
```

Expected output:
```
🚀 AI Digital Workers Backend v4
🚀 Running on http://localhost:5001
✅ MySQL Database Connected!
```

### Step 3 — Frontend

```bash
cd ai-digital-workers/frontend
npm install
npm start
```

Opens at `http://localhost:3000`

### Step 4 — Login

```
1. Enter any 10-digit phone number
2. Click "Get OTP"
3. OTP appears on screen + browser console (F12)
4. Enter OTP → Select role → Done!
```

### Step 5 — Demo Mode

```
http://localhost:3000/demo         ← Full split-screen demo
http://localhost:3000?demo=true    ← Demo Role Switcher (floating panel)
```

---

## 🤖 AI Features

### Works WITHOUT API Keys (Demo Mode)
All AI features have intelligent fallbacks that demonstrate the full UI and logic without needing real API keys. Set `DEMO_MODE=true` in `.env`.

```

| Feature | API Used | Fallback |
|---|---|---|
| AI Chatbot |  Keyword-based responses |
| Voice Resume | Speech API + Claude | Browser SpeechRecognition |
| Video Bio | face-api.js + Claude | Demo transcript |
| Contract Maker | Claude API | Pre-built Hindi+English template |
| Interview Scorer | Claude API | Algorithm-based scoring |
| Fraud Detector | Built-in logic | Always available |
| Heatmap | Leaflet.js (free) | Always available |

---

## 📋 All Pages & Routes

### Public
| URL | Page |
|---|---|
| `/` | Landing Page (Playfair Display, saffron/navy, SVG hero) |
| `/login` | OTP Login |
| `/demo` | Full Demo Dashboard (split-screen) |
| `/heatmap` | Job Demand Heatmap |

### Worker (authenticated)
| URL | Page |
|---|---|
| `/worker/dashboard` | Dashboard with AI features panel |
| `/worker/jobs` | Job listings (AI match scores) |
| `/worker/applications` | My applications |
| `/worker/attendance` | Face verification attendance |
| `/worker/submit-work` | AI work verification |
| `/worker/video-bio` | 🎥 AI Video Bio |
| `/worker/voice-resume` | 🎤 Hindi Voice Resume |
| `/worker/interview` | 🎯 AI Interview Scorer |
| `/worker/trust-score` | 🛡️ Fraud Detector / Trust Score |

### Client (authenticated)
| URL | Page |
|---|---|
| `/client/dashboard` | Dashboard with stats + activity |
| `/client/post-job` | Post job (4-step) |
| `/client/applicants` | Review + hire + approve |
| `/client/payment` | Payment (fixed/daily calc fixed) |
| `/client/contract` | 📄 AI Contract Maker |

---

## 💰 Payment Calculation (Fixed)

```javascript
// Fixed price → NEVER multiplied by days
if (payType === 'fixed') amount = rate;

// Daily rate → rate × days worked  
if (payType === 'daily') amount = rate × days;
```

## 📏 Distance Calculation (Real)

Uses Haversine formula with actual lat/lng coordinates:
```
Pratap Vihar → Vasundhara = 8.3 km ✅ (was incorrectly 2.5 km before)
```

## 🎨 Match Score Colors

```
> 60%  → 🟢 Green  "Good Match"
25-60% → 🟡 Amber  "Moderate"
< 25%  → 🔴 Red    "Poor Match"
```

---

## 🎬 Demo Dashboard Guide

```
http://localhost:3000/demo

Step-by-step:
1 → Client: Post Job (set Fixed or Daily)
2 → Worker: Apply (see AI match score ring)
3 → Client: Hire worker
4 → Worker: Attendance + Photo
5 → Worker: Submit work (AI scores 40-95%, not always 99%)
6 → Client: See AI confidence + manually Approve/Reject
7 → Client: Pay (correct amount based on Fixed vs Daily)
8 → Both sides: Leave reviews and ratings
```

---

## 🎤 Voice Assistant

Click the 🎤 button (bottom right on worker pages):
```
"Find job" / "काम ढूंढो"    → Job search guidance
"Attendance" / "अटेंडेंस"  → Attendance help
"Payment" / "पेमेंट"        → Payment info  
"Video bio"                  → AI Video Bio guidance
"Interview"                  → Interview score help
"Demo"                       → Demo dashboard info
```

---

## 🤖 AI Chatbot

Click the 🤖 button (bottom right, teal, all pages):
- Type in English, Hindi, or Hinglish
- Asks about jobs, wages, contracts, platform navigation
- Uses Claude API with intelligent fallback responses

---

## 🔧 Troubleshooting

| Problem | Fix |
|---|---|
| `scoreColor is not defined` | Fixed — use `matchColor()` from api.js |
| Payment wrong amount | Fixed — `calculatePayment()` handles fixed vs daily |
| Distance incorrect | Fixed — Haversine with real NCR coordinates |
| AI features show loading forever | Add `ANTHROPIC_API_KEY` to `.env` or rely on demo mode |
| Camera not working | Allow camera permission in browser; demo mode works without camera |
| Chatbot not responding | Check browser console for Claude API errors; fallback is automatic |
| MySQL not connecting | Start XAMPP MySQL; check DB_PASSWORD in `.env` |

---

## 🌐 URLs Summary

```
Frontend      → http://localhost:3000
Backend API   → http://localhost:5001
Demo Mode     → http://localhost:3000/demo
Role Switcher → http://localhost:3000?demo=true
phpMyAdmin    → http://localhost/phpmyadmin
```

---


