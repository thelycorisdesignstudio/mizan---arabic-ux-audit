# Mizan — Arabic UX Audit

A comprehensive Arabic UX audit platform built with the MERN stack (MongoDB, Express, React, Node.js). Mizan scans digital products across eight checkpoints to ensure RTL compliance, accessibility, and cultural relevance for the Arabic-speaking world.

## Architecture

```
mizan/
├── client/          # React + Vite frontend
│   ├── src/
│   │   ├── App.tsx        # Main application
│   │   ├── constants.ts   # Checkpoint definitions
│   │   ├── types.ts       # TypeScript interfaces
│   │   ├── index.css      # Tailwind + custom styles
│   │   └── main.tsx       # Entry point
│   ├── package.json
│   └── vite.config.ts
├── server/          # Express + MongoDB backend
│   ├── src/
│   │   ├── index.ts           # Server entry point
│   │   ├── config/db.ts       # MongoDB connection
│   │   ├── models/Audit.ts    # Mongoose audit model
│   │   ├── routes/
│   │   │   ├── audit.ts       # HTML audit endpoints
│   │   │   ├── figma.ts       # Figma audit endpoints
│   │   │   ├── metadata.ts    # APK/IPA metadata audit
│   │   │   └── ai.ts         # AI chat & vision audit
│   │   └── services/
│   │       └── auditEngine.ts # Core audit logic
│   ├── package.json
│   └── .env
└── package.json     # Root scripts
```

## Prerequisites

- Node.js 18+
- MongoDB (local or Atlas)

## Setup

1. Install all dependencies:
   ```bash
   npm install
   ```

2. Configure the server environment:
   ```bash
   cp server/.env.example server/.env
   # Edit server/.env with your credentials
   ```

3. Start MongoDB (if running locally):
   ```bash
   mongod
   ```

4. Run the development servers:
   ```bash
   npm run dev
   ```

   This starts both:
   - **Client** on http://localhost:5173
   - **Server** on http://localhost:5000

## Audit Checkpoints

| # | Checkpoint | What it checks |
|---|-----------|----------------|
| 1 | RTL Patterns | Layout direction, icon mirroring, CSS logical properties |
| 2 | Content Governance | Register consistency, terminology standards |
| 3 | Accessibility | ARIA labels, focus order, screen reader support |
| 4 | Readability | Arabic fonts, line-height, typography stack |
| 5 | Search Behaviour | Hamza/ta-marbuta/diacritics normalization |
| 6 | Approval Workflow | Hreflang tags, bilingual publishing |
| 7 | SEO & AEO | Regional metadata, Answer Engine Optimization |
| 8 | GEO Intelligence | Local trust signals, regional compliance |

## API Endpoints

| Method | Path | Description |
|--------|------|-------------|
| POST | `/api/audit` | Audit a URL or HTML snippet |
| GET | `/api/audit/:id` | Retrieve a saved audit |
| POST | `/api/figma` | Audit a Figma file |
| POST | `/api/metadata` | Audit APK/IPA metadata |
| POST | `/api/ai/chat` | AI expert chat |
| POST | `/api/ai/vision-audit` | Screenshot-based audit |
| GET | `/api/health` | Health check |

## Tech Stack

- **Frontend:** React 19, Vite, Tailwind CSS 4, Motion, GSAP
- **Backend:** Express, Mongoose, Anthropic Claude AI
- **Database:** MongoDB
