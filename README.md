# ⚒️ AI Digital Workers

A full-stack web platform connecting workers and clients with smart matching, verification, and workflow tools.

Built using React, Node.js, and MySQL.

---

## 📌 Overview

AI Digital Workers is a labour marketplace platform designed to simplify hiring, job discovery, and worker verification.

The system provides structured workflows for both workers and clients, including job applications, attendance tracking, and payment handling.

---

## 🚀 Features

- Worker–Client job marketplace
- Smart job matching system
- Face-based attendance verification
- Voice-enabled interactions (Hindi + English)
- Interview scoring and profile evaluation
- Contract generation
- Job demand heatmap visualization
- Demo mode for full platform walkthrough

---

## 🏗️ Tech Stack

**Frontend**
- React 18
- Context API
- Custom UI system

**Backend**
- Node.js
- Express.js

**Database**
- MySQL

**Other Libraries**
- face-api.js
- Leaflet.js

---

## 📁 Project Structure

```
ai-digital-workers/
├── frontend/
│   ├── public/
│   ├── src/
│   │   ├── components/
│   │   ├── context/
│   │   ├── pages/
│   │   └── services/
│   └── package.json
│
└── backend/
    ├── config/
    ├── controllers/
    ├── middleware/
    ├── routes/
    └── server.js
```

---

## ⚙️ Setup Instructions

### 1. Clone the repository
```bash
git clone <your-repo-url>
cd ai-digital-workers
```

### 2. Backend Setup
```bash
cd backend
npm install
npm run dev
```

### 3. Frontend Setup
```bash
cd ../frontend
npm install
npm start
```

---

## 🗄️ Database Setup

1. Start MySQL (XAMPP or local server)
2. Open phpMyAdmin
3. Import:
```
backend/config/schema.sql
```

---

## 🌐 Running the App

- Frontend → http://localhost:3000  
- Backend → http://localhost:5001  

---

## 🧪 Demo Access

- `/demo` → Full demo dashboard  
- `/?demo=true` → Role switcher mode  

---

## 📊 Core Logic

### Payment Calculation

```javascript
if (payType === 'fixed') amount = rate;
if (payType === 'daily') amount = rate * days;
```

### Distance Calculation

Uses Haversine formula for accurate location-based matching.

---

## 🛠️ Troubleshooting

| Issue | Solution |
|------|--------|
| Frontend not starting | Run `npm install` inside frontend |
| `'react-scripts' not found` | Install dependencies again |
| Backend not connecting | Check MySQL is running |
| API errors | Verify `.env` configuration |

---

## 📌 Notes

- This project includes a demo mode for testing features without external dependencies.
- Some features simulate responses for demonstration purposes.

---
