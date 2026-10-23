# 🎓 GradePilot

### Academic Performance Analytics for University Students

GradePilot is a modern academic analytics platform designed to help university students calculate GPA and CGPA, track academic progress, predict future results, and make informed academic decisions.

Built for **National University (NU)** students and students from other universities.

<p align="center">
  <a href="https://grade-pilot-mj.vercel.app">
    <img src="https://img.shields.io/badge/Live_Website-Visit_GradePilot-4F46E5?style=for-the-badge&logo=vercel&logoColor=white" alt="Live Website" />
  </a>
  <img src="https://img.shields.io/badge/Version-2.0_Beta-6366F1?style=for-the-badge" alt="Version" />
  <img src="https://img.shields.io/badge/Status-Public_Beta-10B981?style=for-the-badge" alt="Status" />
</p>

<p align="center">
  <strong>Calculate Smarter. Track Better. Plan Ahead.</strong>
</p>

---

## 🌐 Live Website

**[https://grade-pilot-mj.vercel.app](https://grade-pilot-mj.vercel.app)**

---

## ✨ Features

### 📊 GPA & CGPA Calculator

- Credit-weighted GPA and CGPA calculations
- 4.00 grading scale
- Previous CGPA and completed credits support
- Dynamic subject management
- Instant academic result updates
- Year-wise and semester-wise GPA calculation

### 🎓 University-Specific Academic Tracking

GradePilot supports two academic systems:

**National University (NU)**
- Year-wise academic tracking
- First Year through Fourth Year
- Subject-wise grade and credit management

**Other Universities**
- Semester-wise academic tracking
- Multiple academic semesters
- Flexible subject and credit management

Academic profiles are preserved separately when switching university systems.

### 📈 Academic Dashboard

- Current CGPA overview
- Completed credits
- Subject statistics
- Grade distribution
- GPA trends
- Academic period performance
- Interactive charts and visualizations

### 🎯 CGPA Prediction

- Future CGPA estimation
- Target CGPA planning
- Required GPA calculation
- Credit-based academic projections
- Goal feasibility analysis

### 🔄 Grade Improvement Simulator

- Simulate alternative subject grades
- Analyze potential CGPA improvements
- Compare current and hypothetical results
- Identify high-impact subjects

Improvement simulations are hypothetical and do not represent official university improvement regulations.

### 💡 Academic Insights

- Academic performance analysis
- Strong and weak subject identification
- Academic risk indicators
- Improvement priorities
- Rule-based academic suggestions

GradePilot currently uses a **local rule-based analytics engine**, not an external generative AI service.

### 🔐 Authentication

- Email and password authentication
- Google OAuth sign-in
- Secure session management using Better Auth
- Guest access to Dashboard and Calculator
- Protected advanced features
- Contextual login prompts
- Smart post-login redirects

### ☁️ Cloud Academic Storage

- MongoDB Atlas integration
- Account-specific academic records
- Cross-device data synchronization
- Debounced automatic cloud saving
- Local and cloud data selection
- Revision-based conflict detection
- Offline change preservation and retry mechanisms
- Separate guest and authenticated user storage

**Beta Notice:** Advanced synchronization scenarios, including concurrent device conflicts and offline retry, require additional runtime verification.

### 📄 Academic Report Export

- Professional PDF reports
- High-quality PNG result export
- CGPA and credit summaries
- Subject-wise grade reports
- Year/Semester grouping
- Dynamic PNG layouts for multiple subjects

Generated reports are informational academic summaries, not official university transcripts.

### 🎨 User Experience

- Modern SaaS-inspired dashboard
- Responsive desktop and mobile layouts
- Light and dark themes
- Indigo-based design system
- Interactive academic charts
- Clean navigation
- Contextual notifications
- Professional typography

---

## 🛠️ Technology Stack

### Frontend

![React](https://img.shields.io/badge/React_19-20232A?style=flat-square&logo=react&logoColor=61DAFB)
![Vite](https://img.shields.io/badge/Vite_8-646CFF?style=flat-square&logo=vite&logoColor=white)
![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS_4-06B6D4?style=flat-square&logo=tailwindcss&logoColor=white)
![JavaScript](https://img.shields.io/badge/JavaScript-F7DF1E?style=flat-square&logo=javascript&logoColor=black)

Additional frontend technologies:

- DaisyUI 5
- React Router
- Recharts
- Lucide React
- Framer Motion
- React Hot Toast
- SweetAlert2
- jsPDF

### Backend & Infrastructure

![MongoDB](https://img.shields.io/badge/MongoDB_Atlas-47A248?style=flat-square&logo=mongodb&logoColor=white)
![Vercel](https://img.shields.io/badge/Vercel-000000?style=flat-square&logo=vercel&logoColor=white)
![Node.js](https://img.shields.io/badge/Node.js-339933?style=flat-square&logo=nodedotjs&logoColor=white)

- Better Auth
- MongoDB Atlas
- MongoDB Node.js Driver
- Vercel Serverless Functions
- Google OAuth 2.0

The frontend and backend are maintained in the **same repository**.

---

## 📁 Project Structure

```text
GradePilot/
├── api/
│   ├── academic.js
│   ├── auth.js
│   ├── database-health.js
│   └── health.js
│
├── server/
│   ├── academic/
│   ├── auth/
│   └── db/
│
├── public/
│   └── favicon.svg
│
├── src/
│   ├── components/
│   │   ├── auth/
│   │   ├── charts/
│   │   ├── layout/
│   │   └── ui/
│   │
│   ├── context/
│   ├── data/
│   ├── hooks/
│   ├── lib/
│   ├── pages/
│   ├── utils/
│   ├── App.jsx
│   └── main.jsx
│
├── index.html
├── package.json
├── vercel.json
└── vite.config.js
```

---

## 🚀 Getting Started

### Prerequisites

Make sure you have:

- Node.js compatible with Vite 8
- npm
- Git
- MongoDB Atlas account
- Google OAuth credentials
- Vercel account

### 1. Clone the Repository

```bash
git clone <repository-url>
cd GradePilot
```

Replace `<repository-url>` with the actual GitHub repository URL.

### 2. Install Dependencies

```bash
npm install
```

### 3. Configure Environment Variables

Create a `.env.local` file in the project root.

```env
MONGODB_URI=your_mongodb_connection_string
MONGODB_DB_NAME=gradepilot

BETTER_AUTH_SECRET=your_secure_random_secret
BETTER_AUTH_URL=http://localhost:3000

GOOGLE_CLIENT_ID=your_google_client_id
GOOGLE_CLIENT_SECRET=your_google_client_secret
```

For local environments experiencing MongoDB DNS resolution issues, the following optional configuration is supported:

```env
MONGODB_DNS_SERVERS=8.8.8.8,1.1.1.1
```

**Security:** Never commit `.env.local`, database credentials, authentication secrets, or OAuth client secrets.

### 4. Start Frontend Development

```bash
npm run dev
```

Default URL:

```text
http://localhost:5173
```

This runs the Vite frontend only.

### 5. Start Full-Stack Development

For Better Auth, MongoDB APIs, and Vercel Serverless Functions:

```bash
npx vercel dev
```

Default URL:

```text
http://localhost:3000
```

### 6. Production Build

```bash
npm run build
```

---

## 🔑 Google OAuth Configuration

Configure a Google OAuth Web Application through Google Cloud Console.

### Authorized JavaScript Origins

```text
http://localhost:3000
https://grade-pilot-mj.vercel.app
```

### Authorized Redirect URIs

```text
http://localhost:3000/api/auth/callback/google
https://grade-pilot-mj.vercel.app/api/auth/callback/google
```

Google OAuth Client ID and Client Secret must belong to the same OAuth client.

---

## ☁️ Deployment

GradePilot is deployed using **Vercel**.

Production Website:

https://grade-pilot-mj.vercel.app

### Production Environment Variables

```env
MONGODB_URI=your_mongodb_connection_string
MONGODB_DB_NAME=gradepilot

BETTER_AUTH_SECRET=your_secure_random_secret
BETTER_AUTH_URL=https://grade-pilot-mj.vercel.app

GOOGLE_CLIENT_ID=your_google_client_id
GOOGLE_CLIENT_SECRET=your_google_client_secret
```

The connected `main` branch triggers automatic Vercel deployments.

---

## 🛡️ Security & Data Protection

GradePilot implements:

- Better Auth session-based authentication
- Server-side API authorization
- Account-specific MongoDB academic records
- Academic payload validation
- Revision-based optimistic concurrency control
- Explicit confirmation before replacing existing cloud records
- Separate guest and authenticated user storage
- Environment-based server-side secrets
- Restricted database health checks
- Local academic data backup mechanisms

Security controls and synchronization workflows remain subject to ongoing verification during beta development.

---

## 📌 Access Model

| Feature | Guest | Authenticated |
|---|:---:|:---:|
| Dashboard | ✅ | ✅ |
| GPA/CGPA Calculator | ✅ | ✅ |
| University Tracking | ✅ | ✅ |
| Local Academic Storage | ✅ | ✅ |
| CGPA Prediction | 🔒 | ✅ |
| Grade Improvement | 🔒 | ✅ |
| Academic Insights | 🔒 | ✅ |
| PDF Export | 🔒 | ✅ |
| PNG Export | 🔒 | ✅ |
| MongoDB Cloud Storage | ❌ | ✅ |
| Cross-device Sync | ❌ | ✅ |

---

## 🧪 Release Status

**Current Version:** `2.0.0-beta`

**Release Stage:** Public Beta

### Implemented

- Academic calculator and analytics
- University-specific academic tracking
- Authentication and Google OAuth
- MongoDB academic storage
- Academic sync mechanisms
- PDF and PNG reports
- Responsive interface
- Production deployment

### Known Limitations

- Advanced cloud synchronization scenarios require additional runtime testing.
- Offline retry and concurrent conflict resolution require additional verification.
- GradePilot is not currently an installable offline-first PWA.
- Academic suggestions are rule-based rather than generative AI.
- The current grading system uses a 4.00 scale.
- Academic reports are not official university documents.

---

## 🗺️ Future Roadmap

Potential future improvements include:

- Installable Progressive Web App (PWA)
- Offline-first academic calculator
- Additional grading scales
- Custom university grading systems
- Improved academic report templates
- Optional AI-powered academic assistance
- Enhanced academic planning tools

These are potential future features, not commitments for the current beta release.

---

## ⚠️ Disclaimer

GradePilot is an independent academic analytics platform.

It is not officially affiliated with National University or any other university.

Academic calculations, predictions, simulations, and suggestions are provided for informational and educational purposes.

Users should verify academic regulations, grading policies, and official results through their respective universities.

---

## 📜 License

Copyright © 2026 GradePilot.

All rights reserved unless a separate license is explicitly provided.

---

<p align="center">
  <strong>GradePilot — Calculate Smarter. Track Better. Plan Ahead.</strong>
</p>

<p align="center">
  Made with React, Better Auth, MongoDB Atlas, and Vercel.
</p>
