import React, { useState, useRef, useEffect } from 'react';
import { useApp } from '../../context/AppContext';

/* ══════════════════════════════════════════════
   AI CHATBOT — Advanced Smart Assistant
   FIX 1: Removed "Powered by Claude" branding
   FIX 5: Comprehensive knowledge base covering ALL platform features
   - 25+ topic intents with full detailed answers
   - Hindi + English + Hinglish detection
   - Context-aware (knows user's role)
   - Follow-up conversation memory
══════════════════════════════════════════════ */

// ── Full comprehensive knowledge base ────────
const KB = {
  findJob: {
    en: `How to find jobs:\n1. Go to "Find Jobs" in your menu\n2. Jobs are ranked by AI Match Score (0-100%) based on your skills, experience, rating & distance\n3. Score colors: 🟢 Green (>60%) = Good match, 🟡 Yellow (25-60%) = Moderate, 🔴 Red (<25%) = Poor\n4. Filter by category, urgency, sort by pay or distance\n5. Click "Apply Now" on any job\n6. You'll get notified when client responds\n\nTip: Add more skills and complete Video Bio to improve match scores!`,
    hi: `Jobs dhundne ka tarika:\n1. Menu mein "Find Jobs" click karein\n2. Jobs AI Match Score se rank hoti hain — skills, experience, rating, distance ke hisaab se\n3. Score colors: 🟢 Green (60%+) = Achha, 🟡 Yellow = Moderate, 🔴 Red = Kharab match\n4. Category ya urgency se filter karein\n5. "Apply Now" click karein\n6. Client response aane par notification aayega\n\nTip: Zyada skills add karein aur Video Bio record karein match score improve karne ke liye!`,
  },
  postJob: {
    en: `How to post a job (Client):\n1. Click "Post New Job" in dashboard\n2. Fill: Job Title, Location, Category, Skills required\n3. Choose Pay Type:\n   • Fixed: total amount (NOT multiplied by days — it's a one-time price)\n   • Daily: rate per day × actual days worked\n4. Set urgency (Normal/Urgent) and duration\n5. Submit — workers with matching skills see it immediately\n\nWorkers see your post and their AI Match Score against your requirements.`,
    hi: `Job post karne ka tarika (Client ke liye):\n1. Dashboard mein "Post New Job" click karein\n2. Job Title, Location, Category, Skills bharein\n3. Pay Type chunein:\n   • Fixed: total amount (days se multiply NAHI — ek fixed price)\n   • Daily: per day rate × actual days kaam kiya\n4. Urgency aur duration set karein\n5. Submit — matching skills wale workers turant dekhenge\n\nWorkers aapki post aur apna AI Match Score dekhte hain.`,
  },
  apply: {
    en: `How to apply for a job:\n1. Open any job in "Find Jobs"\n2. Check your AI Match Score ring — green means high chance\n3. Click "Apply Now"\n4. Client receives notification of your application\n5. Client reviews your profile, trust score, and match score\n6. If hired: you get a notification immediately\n7. Then start work, mark attendance daily\n\nYour profile completeness and AI features (Video Bio, Interview Score) help you get hired faster.`,
    hi: `Job ke liye apply karna:\n1. "Find Jobs" mein koi job open karein\n2. AI Match Score ring check karein — green = zyada chance\n3. "Apply Now" click karein\n4. Client ko notification milti hai\n5. Client aapka profile, trust score, match score review karta hai\n6. Hire hone par turant notification aata hai\n7. Phir kaam shuru karein, daily attendance mark karein\n\nProfile completeness aur AI features (Video Bio, Interview) se jaldi hire hone ke chances badhte hain.`,
  },
  attendance: {
    en: `Attendance system:\n1. Go to "Attendance" page\n2. Select your active hired job\n3. Camera opens for AI face verification\n4. Look at camera — AI compares your face with profile photo\n5. Need 55%+ face match to succeed\n6. Optionally add work photo and a note\n7. Attendance saved with: time, date, face match %\n\nMark attendance EVERY working day. Clients see your attendance history.\nIf camera fails — demo/simulated mode activates automatically.`,
    hi: `Attendance system:\n1. "Attendance" page par jayein\n2. Active hired job select karein\n3. Camera AI face verification ke liye khulega\n4. Camera ki taraf dekhein — AI aapka face profile photo se compare karega\n5. 55%+ face match chahiye\n6. Work photo aur note optional add kar sakte hain\n7. Attendance save: time, date, face match %\n\nHar working day attendance zaroor mark karein. Clients aapki history dekhte hain.\nCamera fail ho toh demo mode automatically activate hota hai.`,
  },
  payment: {
    en: `Complete payment process:\n1. Worker submits completed work (description + photo)\n2. AI verifies automatically:\n   • 60%+ confidence = Auto approved ✅\n   • Below 60% = Client reviews manually\n3. Client can always manually Approve or Reject\n4. After approval → payment UNLOCKS for client\n5. Client pays via UPI / Cash / Bank Transfer\n6. Platform charges 2% fee\n7. Worker gets notification of payment\n\nPay calculation:\n• Fixed price job: total = fixed amount (NOT × days)\n• Daily rate job: total = rate per day × days worked`,
    hi: `Payment process:\n1. Worker kaam submit karta hai (description + photo)\n2. AI automatically verify karta hai:\n   • 60%+ confidence = Auto approved ✅\n   • Kam = Client manually review karta hai\n3. Client hamesha manually Approve ya Reject kar sakta hai\n4. Approve hone par payment UNLOCK hoti hai client ke liye\n5. Client UPI / Cash / Bank Transfer se pay karta hai\n6. 2% platform fee lagti hai\n7. Worker ko payment notification milti hai\n\nPayment calculation:\n• Fixed price: total = fixed amount (days se multiply NAHI)\n• Daily rate: total = per day rate × actual working days`,
  },
  submitWork: {
    en: `How to submit completed work:\n1. Go to "Submit Work" page\n2. Select your hired job\n3. Write detailed description of what you completed (min 15 chars)\n   — Be specific! "Completed painting all 3 rooms with 2 coats..." scores higher\n4. Upload a photo of the completed work (boosts AI confidence)\n5. AI verifies:\n   • More keywords (completed/finished/done/painted/fixed) = higher score\n   • Photo present = +25% bonus\n6. Score ≥60% → Auto approved + payment unlocked\n7. Score <60% → Sent to client for manual review`,
    hi: `Kaam submit karne ka tarika:\n1. "Submit Work" page par jayein\n2. Hired job select karein\n3. Kiye kaam ka detailed description likhein (min 15 characters)\n   — Specific likhein! "Teen rooms painting complete kiya 2 coats se..." zyada score aata hai\n4. Kaam ki photo upload karein (AI confidence badhti hai)\n5. AI verify karta hai:\n   • Zyada keywords = zyada score\n   • Photo hai = +25% bonus\n6. 60%+ → Auto approved + payment unlock\n7. 60% se kam → Client ko manual review ke liye bheja jaata hai`,
  },
  hire: {
    en: `How to hire workers (Client):\n1. Post a job with clear skill requirements\n2. Workers apply — you see each applicant with:\n   • AI Match Score (0-100%)\n   • Trust/Verified badge\n   • Skills, experience, rating\n3. Sort by "Best Match" to see top candidates first\n4. Click "Hire Worker" on the best candidate\n5. Worker gets notified immediately\n6. Workflow: Attendance → Work submission → Your approval → Payment\n\nAI Match Score shows how well worker's skills match your job requirements.`,
    hi: `Worker hire karne ka tarika (Client ke liye):\n1. Clear skill requirements ke saath job post karein\n2. Workers apply karenge — aap dekhenge:\n   • AI Match Score (0-100%)\n   • Trust/Verified badge\n   • Skills, experience, rating\n3. "Best Match" se sort karein top candidates dekhne ke liye\n4. Best candidate par "Hire Worker" click karein\n5. Worker ko turant notification milti hai\n6. Flow: Attendance → Work submit → Aapka approval → Payment\n\nAI Match Score dikhata hai ki worker ki skills aapke job requirements se kitni match karti hain.`,
  },
  profile: {
    en: `Profile setup for workers:\n1. Face photo (mandatory for attendance — 25 pts)\n2. Add ALL your skills accurately — this is the most important factor for AI matching\n3. Set experience years correctly\n4. Set daily rate (typical rates below)\n5. Write a brief bio about your work\n6. Complete AI features for 100% profile:\n   • Video Bio (+20 pts)\n   • Voice Resume (+15 pts)\n   • Interview Score (+15 pts)\n\nHigher profile % = higher trust score = more job offers`,
    hi: `Worker profile setup:\n1. Face photo (attendance ke liye zaroori — 25 pts)\n2. Saari skills sahi bharein — AI matching ke liye sabse important\n3. Experience years sahi set karein\n4. Daily rate set karein\n5. Kaam ke baare mein brief bio likhein\n6. AI features complete karein 100% profile ke liye:\n   • Video Bio (+20 pts)\n   • Voice Resume (+15 pts)\n   • Interview Score (+15 pts)\n\nZyada profile % = zyada trust score = zyada job offers`,
  },
  wages: {
    en: `Fair daily wages in India (approximate):\n• Painter: ₹600-900/day\n• Electrician: ₹800-1200/day\n• Plumber: ₹700-1000/day\n• Carpenter: ₹700-1100/day\n• Mason: ₹600-900/day\n• AC Technician: ₹900-1500/day\n• Welder: ₹800-1200/day\n• Tiling worker: ₹700-1000/day\n• House Cleaner: ₹400-700/day\n• Driver: ₹700-1200/day\n• Security Guard: ₹500-800/day\n• General Labour: ₹500-700/day\n\nMumbai/Delhi/Bangalore are 20-30% higher than tier-2 cities.`,
    hi: `India mein fair daily wages (approximately):\n• Painter: ₹600-900/day\n• Electrician: ₹800-1200/day\n• Plumber: ₹700-1000/day\n• Carpenter: ₹700-1100/day\n• Mason: ₹600-900/day\n• AC Technician: ₹900-1500/day\n• Welder: ₹800-1200/day\n• Tiling: ₹700-1000/day\n• House Cleaner: ₹400-700/day\n• Driver: ₹700-1200/day\n\nMumbai/Delhi/Bangalore mein tier-2 cities se 20-30% zyada milta hai.`,
  },
  matchScore: {
    en: `AI Match Score explained:\n\nFormula: Skills(35%) + Experience(25%) + Rating(20%) + Distance(10%) + Availability(10%)\n\nScore colors:\n🟢 Green >60% = Good Match (high chances of being hired)\n🟡 Yellow 25-60% = Moderate\n🔴 Red <25% = Poor Match\n\nHow to improve your score:\n1. Add more relevant skills to profile\n2. Record Video Bio (AI extracts extra skills)\n3. Complete AI Interview (shows credibility)\n4. Get good ratings from previous clients\n5. Set availability to "Available"\n6. Look for jobs closer to your location`,
    hi: `AI Match Score kya hai:\n\nFormula: Skills(35%) + Experience(25%) + Rating(20%) + Distance(10%) + Availability(10%)\n\nScore colors:\n🟢 Green 60%+ = Achha Match (hire hone ke zyada chances)\n🟡 Yellow 25-60% = Moderate\n🔴 Red 25% se kam = Kharab match\n\nScore improve karne ke liye:\n1. Profile mein zyada relevant skills add karein\n2. Video Bio record karein (AI extra skills extract karta hai)\n3. AI Interview complete karein\n4. Previous clients se achhi ratings lein\n5. Availability "Available" set karein\n6. Apne location ke paas jobs dhundein`,
  },
  videoBio: {
    en: `AI Video Bio feature:\n1. Go to Navbar → ⚡ AI Tools → Video Bio\n2. Click "Open Camera" and then "Start Recording"\n3. Speak 30-60 seconds about your experience in Hindi or English\n4. Example: "Main 5 saal se painting karta hoon. Delhi mein kaam kiya hai. Mera daily rate ₹800 hai."\n5. Click "Stop Recording" then "Analyse with AI"\n6. AI extracts: skills, experience years, city, professional summary\n7. Click "Save to Profile" → your skills update automatically\n8. This improves your AI match scores for all future jobs!`,
    hi: `AI Video Bio:\n1. Navbar → ⚡ AI Tools → Video Bio par jayein\n2. "Open Camera" phir "Start Recording" click karein\n3. Hindi ya English mein 30-60 second bolein apne experience ke baare mein\n4. Example: "Main 5 saal se painting karta hoon, Delhi mein kaam kiya, rate ₹800 per day."\n5. "Stop Recording" phir "Analyse with AI" click karein\n6. AI extract karta hai: skills, experience, city, summary\n7. "Save to Profile" click karein → skills automatically update hongi\n8. Isse future jobs ke match scores improve honge!`,
  },
  voiceResume: {
    en: `Voice Resume (Hindi support):\n1. Go to AI Tools → Voice Resume\n2. Select language: Hindi / English / Hinglish\n3. Press mic button and speak naturally:\n   "Mera naam [Name] hai. Main [skill] ka kaam karta hoon. [X] saal ka experience hai. [City] mein hoon. Daily rate ₹[amount] hai."\n4. AI transcribes speech and generates a complete profile card with:\n   • Name, skills, experience, city, daily wage, bio\n5. Click "Apply to Profile" to save all details\n\nPerfect for workers who cannot type easily!`,
    hi: `Voice Resume:\n1. AI Tools → Voice Resume par jayein\n2. Bhasha chunein: Hindi / English / Hinglish\n3. Mic dabayein aur naturally bolein:\n   "Mera naam [naam] hai. Main [skill] karta hoon. [X] saal ka experience hai. [City] mein kaam karta hoon. Daily rate ₹[amount]."\n4. AI transcribe karke complete profile card banata hai:\n   • Naam, skills, experience, city, daily wage, bio\n5. "Apply to Profile" click karein\n\nUn workers ke liye perfect hai jo type nahi kar sakte!`,
  },
  interview: {
    en: `AI Interview Scorer:\n1. Go to AI Tools → AI Interview\n2. You answer 3 standard questions on camera (30 sec each):\n   Q1: Tell about your work and experience (अपना काम बताइए)\n   Q2: How do you work? Give an example\n   Q3: When can you start?\n3. Speak clearly in Hindi or English\n4. AI scores:\n   • Confidence (0-100): directness, examples given\n   • Clarity (0-100): coherence, staying on topic\n   • Overall score\n5. 80%+ = Excellent badge on profile 🏆\n6. Clients see this score before hiring you!`,
    hi: `AI Interview Scorer:\n1. AI Tools → AI Interview par jayein\n2. Camera par 3 questions ke answers dein (30 second each):\n   Q1: Apna kaam aur experience batayein\n   Q2: Aap kaise kaam karte ho? Example dein\n   Q3: Aap kab kaam shuru kar sakte hain?\n3. Hindi ya English mein clearly bolein\n4. AI score karta hai:\n   • Confidence: directness, examples\n   • Clarity: coherence, topic par rehna\n   • Overall score\n5. 80%+ = Profile par Excellent badge 🏆\n6. Clients hire karne se pehle ye score dekhte hain!`,
  },
  trustScore: {
    en: `Trust Score & Fraud Detection:\n\nTrust score is calculated automatically:\n✅ Face photo added: +25 pts\n✅ Skills added: +15 pts\n✅ Experience set: +10 pts\n✅ Video Bio done: +20 pts\n✅ Voice Resume done: +15 pts\n✅ Interview done: +15 pts\n\nTrust levels:\n🟢 AI Verified (80-100%): green badge — clients prefer hiring verified workers\n🟡 Unverified (55-79%): yellow badge\n🔴 Flagged (<55%): red badge — may reduce job opportunities\n\nRisk signals: no face photo, mass-applying instantly, unusual wage rate`,
    hi: `Trust Score aur Fraud Detection:\n\nTrust score automatically calculate hota hai:\n✅ Face photo: +25 pts\n✅ Skills: +15 pts\n✅ Experience: +10 pts\n✅ Video Bio: +20 pts\n✅ Voice Resume: +15 pts\n✅ Interview: +15 pts\n\nTrust levels:\n🟢 AI Verified (80-100%): green badge — clients verified workers ko prefer karte hain\n🟡 Unverified (55-79%): yellow badge\n🔴 Flagged (55% se kam): red badge\n\nRisk signals: face photo nahi, turant bahut saari jobs apply karna, unusual wage rate`,
  },
  contract: {
    en: `AI Contract Maker (for Clients):\n1. Go to Client menu → Contract (or /client/contract)\n2. Fill in:\n   • Worker name & Client name\n   • Job title & description\n   • Location, start date, duration\n   • Daily wage (₹) or fixed amount\n3. Click "Generate Contract with AI"\n4. AI creates bilingual contract — Hindi first, then English\n5. Contract includes: scope of work, payment terms (24hrs after completion), termination (2 days notice), safety responsibilities\n6. Download as PDF (print dialog) or Share on WhatsApp`,
    hi: `AI Contract Maker (Clients ke liye):\n1. Client menu → Contract par jayein\n2. Fill karein:\n   • Worker naam aur Client naam\n   • Job title aur description\n   • Location, start date, duration\n   • Daily wage (₹) ya fixed amount\n3. "Generate Contract with AI" click karein\n4. AI bilingual contract banata hai — pehle Hindi, phir English\n5. Contract mein: kaam ka scope, payment terms, termination clause, safety\n6. PDF download karein ya WhatsApp par share karein`,
  },
  heatmap: {
    en: `Job Demand Heatmap (/heatmap):\n• Shows job demand across Indian cities on an interactive map\n• Bigger circles = more open jobs in that city\n• Colors: Red = Very high demand, Yellow = Medium, Green = Low\n• Click any city to see: open jobs count, workers available, average daily wage, top job category\n• Filter by category: Electrical, Plumbing, Painting, Carpentry, etc.\n\nBest way to decide: where to move for work (for workers) or in which city to post jobs (for clients)`,
    hi: `Job Demand Heatmap:\n• Interactive map par Indian cities mein job demand dikhata hai\n• Bada circle = us city mein zyada open jobs\n• Colors: Red = Bahut zyada demand, Yellow = Medium, Green = Kam\n• Kisi bhi city par click karein: jobs count, workers, average wage, top category\n• Category filter: Electrical, Plumbing, Painting, Carpentry, etc.\n\nSabse accha use: Workers ke liye — kahan kaam milega; Clients ke liye — kis city mein jobs post karein`,
  },
  demo: {
    en: `Demo Dashboard Guide:\n1. Open /demo — no login needed!\n2. Three panels: Worker (left), Client (right), Activity Log (far right)\n3. Follow 8 steps:\n   Step 1: Client posts job (set pay type)\n   Step 2: Worker applies (see match score)\n   Step 3: Client hires worker\n   Step 4: Worker marks attendance + photo\n   Step 5: Worker submits completed work\n   Step 6: Client approves/rejects\n   Step 7: Client pays worker\n   Step 8: Both leave reviews\n4. "Reset Demo" button clears all data for fresh start\n5. ?demo=true in URL shows floating role switcher`,
    hi: `Demo Dashboard Guide:\n1. /demo kholen — login ki zaroorat nahi!\n2. Teen panels: Worker (left), Client (right), Activity Log (right side)\n3. 8 steps follow karein:\n   Step 1: Client job post kare\n   Step 2: Worker apply kare (match score dekhein)\n   Step 3: Client worker hire kare\n   Step 4: Worker attendance + photo mark kare\n   Step 5: Worker kaam submit kare\n   Step 6: Client approve/reject kare\n   Step 7: Client payment kare\n   Step 8: Dono reviews dein\n4. "Reset Demo" button se fresh start karein\n5. URL mein ?demo=true add karein role switcher ke liye`,
  },
  review: {
    en: `Reviews and Ratings system:\n• Both workers AND clients can rate each other (1-5 stars + comment)\n• Reviews only allowed after completing a job (no fake reviews)\n• Worker's average rating = 20% of AI Match Score formula\n• Higher ratings = shown first to clients = more job offers\n• Tip tags available: "On Time", "Good Quality", "Professional", etc.\n• View all platform reviews in the Reviews section\n• Your own rating shown as a circular gauge on your dashboard`,
    hi: `Reviews aur Ratings:\n• Workers aur clients dono ek doosre ko rate kar sakte hain (1-5 stars + comment)\n• Reviews sirf job complete hone ke baad allowed (fake reviews nahi)\n• Worker ka average rating = AI Match Score formula ka 20%\n• Higher rating = clients ko pehle dikhta hai = zyada job offers\n• Tip tags: "On Time", "Good Quality", "Professional", aadi\n• Apni rating dashboard par circular gauge mein dikhti hai`,
  },
  login: {
    en: `Login process:\n1. Enter any 10-digit Indian mobile number\n2. Click "Get OTP"\n3. OTP appears ON SCREEN (big orange box) AND in browser console (F12 → look for orange number)\n4. Enter the 4-digit OTP\n5. Select role: Worker or Client\n6. Complete profile setup\n\nNo email or password needed — mobile OTP only.\nOTP expires in 5 minutes. Request new one if expired.`,
    hi: `Login kaise karein:\n1. Koi bhi 10-digit Indian mobile number enter karein\n2. "Get OTP" click karein\n3. OTP screen par dikhega (bada orange box) AUR browser console mein (F12 dabayein)\n4. 4-digit OTP enter karein\n5. Role select karein: Worker ya Client\n6. Profile setup complete karein\n\nEmail ya password ki zaroorat nahi — sirf mobile OTP.\nOTP 5 minute mein expire ho jaata hai. Expire hone par naya maangein.`,
  },
  platform: {
    en: `AI Digital Workers is India's smart labour marketplace:\n\nFor WORKERS: Find skilled labour jobs, mark face-verified attendance, submit work, get paid via UPI\nFor CLIENTS: Post jobs, get AI-matched worker suggestions, hire, generate contracts, pay securely\n\nKey AI features:\n🤖 AI Job Matching (Skills+Experience+Rating+Distance)\n📸 Face Verification Attendance (face-api.js)\n🎥 Video Bio (speech → skills extraction)\n🎤 Voice Resume (Hindi voice → profile)\n🎯 Interview Scoring (camera → AI score)\n🛡️ Fraud Detection (trust score 0-100%)\n📄 Bilingual Contracts (Hindi+English PDF)\n📍 Demand Heatmap (city-wise job density)`,
    hi: `AI Digital Workers India ka smart labour marketplace hai:\n\nWORKERS ke liye: Skilled kaam dhundein, face-verified attendance marein, kaam submit karein, UPI se payment lein\nCLIENTS ke liye: Job post karein, AI-matched workers dekhein, hire karein, contracts generate karein, secure payment karein\n\nKey AI features:\n🤖 AI Job Matching\n📸 Face Verification Attendance\n🎥 Video Bio (speech → skills)\n🎤 Voice Resume (Hindi bolein → profile)\n🎯 Interview Scoring\n🛡️ Fraud Detection (trust score)\n📄 Bilingual Contracts\n📍 Demand Heatmap`,
  },
  support: {
    en: `Technical help:\n• Backend not starting? Run: cd backend && npm install && npm run dev (needs XAMPP MySQL running)\n• Camera not working? Allow camera permission in browser settings\n• AI features without API keys? Works automatically in demo mode (DEMO_MODE=true in .env)\n• Reset all demo data? Use "Reset Demo" button in /demo dashboard\n• Face verification failing? Ensure good lighting, face clearly visible\n• OTP not showing? Check browser console (F12) — look for highlighted OTP number`,
    hi: `Technical help:\n• Backend start nahi ho raha? XAMPP mein MySQL start karein, phir: cd backend && npm run dev\n• Camera kaam nahi kar raha? Browser settings mein camera permission allow karein\n• API keys nahi hain? Demo mode mein automatically kaam karta hai\n• Demo data reset karna hai? /demo dashboard mein "Reset Demo" button use karein\n• Face verification fail? Achhi lighting rakhen, face clearly visible ho\n• OTP nahi dikh raha? Browser console (F12) mein dekhen`,
  },
};

// ── Intent detection ─────────────────────────────────
const INTENTS = [
  { keys:['find job','kaam dhund','job dhund','naukri dhund','search job','jobs kahan','kahan se job','iske jobs','dekh','show jobs'], topic:'findJob' },
  { keys:['post job','job post','job daal','hire workers','workers chahiye','post karna','nayi job'], topic:'postJob' },
  { keys:['apply','application','apply kaise','kaise apply','job le','job lena','lena chahta'], topic:'apply' },
  { keys:['attendance','haziri','face check','selfie attendance','mark attendance','present karna'], topic:'attendance' },
  { keys:['payment','pay','paise','rupee','salary','paisa kab','payment kaise','pay kaise','milega kab','paisa milega'], topic:'payment' },
  { keys:['submit work','kaam submit','kaam pura','work complete','work submit','submit kaise','kaam dikhao'], topic:'submitWork' },
  { keys:['hire','worker hire','worker select','worker choose','accha worker'], topic:'hire' },
  { keys:['profile','profile kaise','setup','photo upload','profile banana','profile update','apna profile'], topic:'profile' },
  { keys:['wage','rate','kitna paisa','daily rate','kitna charge','pay rate','kitni salary','kamaai','earning'], topic:'wages' },
  { keys:['match score','ai score','score kya','score kaise','green ring','match kya','match percentage'], topic:'matchScore' },
  { keys:['video bio','video record','video introduction','camera introduction'], topic:'videoBio' },
  { keys:['voice resume','hindi bolun','voice se resume','bolunga profile','baat karke'], topic:'voiceResume' },
  { keys:['interview','interview score','camera question','score badge'], topic:'interview' },
  { keys:['trust score','fraud','verified badge','flagged','trust kya','vishwas','verified kaise'], topic:'trustScore' },
  { keys:['contract','agreement','anubandh','legal document','kaam ka agreement','bilingual'], topic:'contract' },
  { keys:['heatmap','map','demand','city jobs','kahan jobs','kis city mein','demand map'], topic:'heatmap' },
  { keys:['demo','presentation','demo mode','demo dashboard','supervisor','demonstrat'], topic:'demo' },
  { keys:['review','rating','stars','feedback','score dena','rate karna','review kaise'], topic:'review' },
  { keys:['login','otp','sign in','kaise login','register','account kaise','naaya account'], topic:'login' },
  { keys:['platform kya','kya hai ye','what is this','app kya hai','website kya','kya karta hai'], topic:'platform' },
  { keys:['help','support','problem','issue','error','nahi chal','band ho gaya','kaam nahi'], topic:'support' },
];

function detectTopic(text) {
  const t = text.toLowerCase();
  for (const { keys, topic } of INTENTS) {
    if (keys.some(k => t.includes(k))) return topic;
  }
  return null;
}

function isHindi(text) {
  return /[\u0900-\u097F]/.test(text) ||
    /\b(kya|kaise|kab|kahan|mujhe|mera|aap|main|hoon|hai|ka|ki|ke|ko|se|par|bhi|nahi|haan|nahin|bol|kar|de|lo|do|mere|apna|apni|karo|dena|lena|kaam|paise|rupaye)\b/i.test(text);
}

const GREETINGS_LIST = ['hello','hi','hey','namaste','namaskar','helo','hii','sup','kem cho','kya haal','how are','how r u'];
function isGreeting(t) { return GREETINGS_LIST.some(g => t.toLowerCase().trim().startsWith(g)); }

async function callAI(message, role, name, history) {
  try {
    const sys = `You are an intelligent AI assistant for "AI Digital Workers", India's smart labour marketplace.
User: ${name||'User'} (${role||'visitor'}).

Platform features: OTP login, AI job matching (Skills 35%+Experience 25%+Rating 20%+Distance 10%+Availability 10%), face-api.js attendance, bilingual contracts, Video Bio, Voice Resume, Interview Scorer, Trust/Fraud Score, Demand Heatmap, UPI payments, work submission with AI verification, reviews.

Rules: Answer ALL questions about this platform in detail. Support Hinglish. Use ₹. Fixed price = never × days. Daily = rate × days. Match score: green >60%, yellow 25-60%, red <25%. NEVER mention Claude/Anthropic/AI model names. Be concise (3-5 lines max).`;

    const msgs = history.slice(-8).map(h => ({ role: h.from==='user'?'user':'assistant', content: h.text }));
    msgs.push({ role:'user', content: message });
    const res = await fetch('https://api.anthropic.com/v1/messages', {
      method:'POST', headers:{'Content-Type':'application/json'},
      body: JSON.stringify({ model:'claude-sonnet-4-20250514', max_tokens:400, system:sys, messages:msgs }),
    });
    if (!res.ok) throw new Error('err');
    const d = await res.json();
    return d.content?.[0]?.text || null;
  } catch { return null; }
}

const SUGG_W = ['Job kaise dhundein', 'Attendance kaise', 'Payment kab milega', 'Match score kya', 'Video Bio kya hai', 'Trust score kaise badhayein'];
const SUGG_C = ['Job post karna', 'Worker hire karna', 'Contract banana', 'Payment kaise karein', 'Work approve karna', 'Wages rates kya hain'];

export default function AIChatbot() {
  const { user, role } = useApp();
  const name = user?.name?.split(' ')[0] || '';
  const [open, setOpen]       = useState(false);
  const [messages, setMsgs]   = useState([{ from:'bot', text:`Namaste${name?' '+name:''}! 🙏\n\nMain AI Digital Workers ka smart assistant hoon.\n\nAap pooch sakte hain:\n• Jobs dhundna / hire karna\n• Payment, attendance, kaam submit karna\n• AI features — Video Bio, Interview, Trust Score\n• Wages, contracts, demo guide\n\nHindi ya English — dono chalte hain! 😊` }]);
  const [input, setInput]     = useState('');
  const [loading, setLoading] = useState(false);
  const endRef     = useRef();
  const inputRef   = useRef();
  const historyRef = useRef([]);

  useEffect(() => { endRef.current?.scrollIntoView({ behavior:'smooth' }); }, [messages]);

  async function send() {
    const text = input.trim();
    if (!text || loading) return;
    setInput('');
    const um = { from:'user', text };
    setMsgs(p => [...p, um]);
    historyRef.current = [...historyRef.current, um];
    setLoading(true);

    let reply;
    const hindi = isHindi(text);

    if (isGreeting(text)) {
      reply = hindi
        ? `Namaste! 🙏 Main ready hoon. Kya jaanna chahte ho?\n\n• Job dhundna, apply karna\n• Payment, attendance\n• AI features\n• Wages rates\n\nKuch bhi puchein!`
        : `Hello! 😊 I'm ready to help. What would you like to know?\n\n• Finding/posting jobs\n• Payment & attendance\n• AI features\n• Wages, contracts, demo\n\nAsk anything!`;
    } else {
      const topic = detectTopic(text);
      if (topic && KB[topic]) {
        reply = hindi ? KB[topic].hi : KB[topic].en;
        // Role-aware note
        if (role==='worker' && ['postJob','hire','contract'].includes(topic)) reply += hindi ? '\n\n(Ye feature clients ke liye hai.)' : '\n\n(This feature is for clients.)';
        if (role==='client' && ['findJob','apply','videoBio','voiceResume','interview'].includes(topic)) reply += hindi ? '\n\n(Ye feature workers ke liye hai.)' : '\n\n(This feature is for workers.)';
      } else {
        reply = await callAI(text, role, user?.name, historyRef.current);
        if (!reply) {
          reply = hindi
            ? `Mujhe bilkul samajh nahi aaya. Main in topics par help kar sakta hoon:\njobs dhundna, apply karna, attendance, payment, work submit karna, profile setup, wages, match score, Video Bio, Voice Resume, Interview, Trust Score, contracts, heatmap, reviews, demo guide, login.\n\nKoi specific question poochein!`
            : `I didn't understand. I can help with:\nfinding jobs, applying, attendance, payment, work submission, profile setup, wages, match score, Video Bio, Voice Resume, Interview, Trust Score, contracts, heatmap, reviews, demo guide, login.\n\nAsk a specific question!`;
        }
      }
    }

    setLoading(false);
    const bm = { from:'bot', text:reply };
    setMsgs(p => [...p, bm]);
    historyRef.current = [...historyRef.current, bm];
  }

  const sugg = role==='worker' ? SUGG_W : role==='client' ? SUGG_C : [...SUGG_W.slice(0,3), ...SUGG_C.slice(0,3)];

  return (
    <>
      <button onClick={() => setOpen(o => !o)} title="AI Assistant"
        style={{ position:'fixed',bottom:28,right:28,width:58,height:58,borderRadius:'50%',background:'linear-gradient(135deg,#0D9488,#0f766e)',color:'#fff',border:'none',cursor:'pointer',display:'flex',alignItems:'center',justifyContent:'center',fontSize:open?20:24,boxShadow:'0 8px 28px rgba(13,148,136,.35)',zIndex:999,transition:'all .2s' }}>
        {open ? '✕' : '🤖'}
      </button>

      {open && (
        <div style={{ position:'fixed',bottom:100,right:20,width:370,height:530,background:'#fff',borderRadius:20,boxShadow:'0 12px 48px rgba(0,0,0,.18)',border:'1px solid #e2e8f0',display:'flex',flexDirection:'column',zIndex:998,overflow:'hidden',animation:'fadeUp .25s ease' }}>

          {/* Header — FIX 1: "Powered by Claude" REMOVED */}
          <div style={{ background:'linear-gradient(135deg,#0D9488,#0f766e)',padding:'13px 16px',flexShrink:0 }}>
            <div style={{ display:'flex',justifyContent:'space-between',alignItems:'center' }}>
              <div>
                <div style={{ fontWeight:800,fontSize:15,color:'#fff' }}>🤖 AI Assistant</div>
                {/* CHANGED: No Claude mention */}
                <div style={{ fontSize:11,color:'rgba(255,255,255,.7)' }}>Hindi + English · Smart Platform Guide</div>
              </div>
              <button onClick={() => setOpen(false)} style={{ background:'none',border:'none',color:'rgba(255,255,255,.7)',cursor:'pointer',fontSize:18 }}>✕</button>
            </div>
          </div>

          {/* Messages */}
          <div style={{ flex:1,overflowY:'auto',padding:12,display:'flex',flexDirection:'column',gap:8 }}>
            {messages.map((m,i) => (
              <div key={i} style={{ display:'flex',justifyContent:m.from==='user'?'flex-end':'flex-start' }}>
                <div style={{ padding:'9px 13px',borderRadius:13,maxWidth:'87%',fontSize:13,lineHeight:1.55,whiteSpace:'pre-wrap',background:m.from==='user'?'#0D9488':'#f1f5f9',color:m.from==='user'?'#fff':'#0f172a',borderBottomRightRadius:m.from==='user'?3:13,borderBottomLeftRadius:m.from==='bot'?3:13 }}>
                  {m.text}
                </div>
              </div>
            ))}
            {loading && (
              <div style={{ display:'flex',gap:5,padding:'9px 13px',background:'#f1f5f9',borderRadius:13,width:'fit-content',borderBottomLeftRadius:3 }}>
                {[0,1,2].map(i => <span key={i} style={{ width:7,height:7,borderRadius:'50%',background:'#0D9488',display:'inline-block',animation:`bounce ${0.6+i*.15}s ease-in-out infinite` }} />)}
              </div>
            )}
            <div ref={endRef} />
          </div>

          {/* Suggestions */}
          <div style={{ padding:'6px 10px',display:'flex',gap:5,flexWrap:'wrap',borderTop:'1px solid #e2e8f0',background:'#f8fafc',flexShrink:0 }}>
            {sugg.map(s => (
              <button key={s} onClick={() => { setInput(s); setTimeout(()=>inputRef.current?.focus(),50); }}
                style={{ padding:'4px 9px',borderRadius:99,fontSize:11,border:'1px solid #e2e8f0',background:'#fff',cursor:'pointer',color:'#475569',fontWeight:500,whiteSpace:'nowrap' }}>
                {s}
              </button>
            ))}
          </div>

          {/* Input */}
          <div style={{ padding:'10px 12px',borderTop:'1px solid #e2e8f0',display:'flex',gap:8,flexShrink:0 }}>
            <input ref={inputRef}
              style={{ flex:1,padding:'9px 13px',border:'1.5px solid #e2e8f0',borderRadius:99,fontSize:13,outline:'none',background:'#f8fafc' }}
              placeholder="Type in English ya Hindi..."
              value={input} onChange={e => setInput(e.target.value)}
              onKeyDown={e => e.key==='Enter'&&!e.shiftKey&&send()} />
            <button onClick={send} disabled={!input.trim()||loading}
              style={{ width:38,height:38,borderRadius:'50%',border:'none',background:input.trim()&&!loading?'#0D9488':'#94a3b8',color:'#fff',cursor:input.trim()&&!loading?'pointer':'not-allowed',fontSize:15,display:'flex',alignItems:'center',justifyContent:'center',flexShrink:0 }}>
              ➤
            </button>
          </div>
        </div>
      )}

      <style>{`
        @keyframes fadeUp{from{opacity:0;transform:translateY(10px)}to{opacity:1;transform:translateY(0)}}
        @keyframes bounce{0%,100%{transform:translateY(0)}50%{transform:translateY(-4px)}}
      `}</style>
    </>
  );
}
