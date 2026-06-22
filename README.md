# Proposely — Backend

> RESTful API for the Proposely academic research proposal management platform.

[![Node.js](https://img.shields.io/badge/Node.js-18+-339933?logo=node.js&logoColor=white)](https://nodejs.org)
[![Express](https://img.shields.io/badge/Express-5.x-000000?logo=express&logoColor=white)](https://expressjs.com)
[![TypeScript](https://img.shields.io/badge/TypeScript-6.0-3178C6?logo=typescript&logoColor=white)](https://www.typescriptlang.org)
[![MongoDB](https://img.shields.io/badge/MongoDB-Mongoose_9-47A248?logo=mongodb&logoColor=white)](https://mongoosejs.com)
[![JWT](https://img.shields.io/badge/Auth-JWT-000000?logo=jsonwebtokens&logoColor=white)](https://jwt.io)

---

## 🌐 Live API

**Base URL:** `https://proposely-backend.vercel.app/`


---

## 📖 About

Proposely Backend is a role-protected REST API powering the Proposely proposal management system. It handles authentication, role-based access control (Student / Lecturer / Admin), full proposal lifecycle management, inline commenting, version history, and AI-assisted review generation via Google Gemini.

---

## ✨ Features

- **JWT Authentication** — register, login, token-based route protection
- **Role-Based Access Control** — `STUDENT`, `LECTURER`, `ADMIN` roles enforced at middleware level
- **Proposal Lifecycle** — create → draft → submit → assign → review → approve/reject
- **Versioning** — proposal version history tracked on every update
- **Inline Comments** — lecturers add comments; students resolve them
- **AI Review** — Google Gemini integration to auto-generate proposal feedback
- **Express 5** — async error handling without `next(err)` boilerplate

---

## 🛠️ Tech Stack

| Layer | Technology |
|---|---|
| Runtime | Node.js 18+ |
| Framework | Express 5 |
| Language | TypeScript 6 |
| Database | MongoDB (via Mongoose 9) |
| Authentication | JWT (`jsonwebtoken`) + `bcryptjs` |
| AI Integration | Google Gemini (via Axios) |
| Dev Server | ts-node-dev |

---

## 📁 Project Structure

```
src/
├── index.ts                        # App entry — Express setup, DB connect, routes
├── controllers/
│   ├── authController.ts           # register, login
│   ├── proposalController.ts       # Student proposal CRUD + submit + feedback
│   ├── adminProposalController.ts  # Admin: list submitted, assign lecturer
│   ├── lecturerProposalController.ts # Lecturer: review, comment, AI review
│   └── lectureController.ts        # Admin: list all lecturers
├── middleware/
│   ├── authMiddleware.ts           # Verify JWT → attach user to req
│   └── roleMiddleware.ts           # roleMiddleware(...roles) factory
├── models/                         # Mongoose schemas + TypeScript interfaces
└── routes/
    ├── authRoutes.ts
    ├── proposalRoutes.ts
    ├── adminProposalRoutes.ts
    ├── lecturerProposalRoutes.ts
    └── lecturerRouter.ts
```

---

## 🚀 Getting Started

### Prerequisites

- Node.js >= 18
- MongoDB Atlas cluster (or local MongoDB)
- Google Gemini API key

### Installation

```bash
# 1. Clone the repository
git clone https://github.com/sandula-sanchana/Proposely-Backend.git
cd Proposely-Backend

# 2. Install dependencies
npm install

# 3. Create environment file
cp .env.example .env
# OR create it manually (see Environment Variables below)

# 4. Start the development server
npm run dev
```

The server will run at `http://localhost:5000`.

---

## ⚙️ Environment Variables

Create a `.env` file in the project root:

```env
PORT=5000
MONGO_URI=mongodb+srv://<user>:<password>@cluster.mongodb.net/proposely
JWT_SECRET=your_super_secret_key
GEMINI_API_KEY=your_google_gemini_api_key
```

| Variable | Description |
|---|---|
| `PORT` | Port the server listens on (default: `5000`) |
| `MONGO_URI` | MongoDB connection string |
| `JWT_SECRET` | Secret key used to sign JWT tokens |
| `GEMINI_API_KEY` | Google Gemini API key for AI review generation |

---

## 📡 API Reference

All routes are prefixed with `/api/v1`.

### Auth — `/auth`

| Method | Endpoint | Access | Description |
|---|---|---|---|
| `POST` | `/auth/register` | Public | Register a new user |
| `POST` | `/auth/login` | Public | Login and receive JWT |
| `GET` | `/auth/me` | Auth | Verify token (returns status message) |

---

### Student Proposals — `/proposals`

| Method | Endpoint | Access | Description |
|---|---|---|---|
| `POST` | `/proposals` | STUDENT | Create a new proposal |
| `GET` | `/proposals/my` | STUDENT | Get all my proposals |
| `GET` | `/proposals/:id` | Auth | Get proposal by ID |
| `PATCH` | `/proposals/:id` | STUDENT | Update proposal |
| `POST` | `/proposals/:id/submit` | STUDENT | Submit proposal for review |
| `GET` | `/proposals/:id/feedback` | STUDENT | Get feedback on a proposal |
| `PATCH` | `/proposals/comments/:commentId/resolve` | STUDENT | Resolve a comment |

---

### Lecturer Proposals — `/lecturer/proposals`

| Method | Endpoint | Access | Description |
|---|---|---|---|
| `GET` | `/lecturer/proposals/my` | LECTURER | Get assigned proposals |
| `GET` | `/lecturer/proposals/:id/versions` | LECTURER | Get proposal version history |
| `POST` | `/lecturer/proposals/:id/ai-review` | LECTURER | Generate AI review via Gemini |
| `GET` | `/lecturer/proposals/:id/ai-reviews` | LECTURER | Get AI review history |
| `POST` | `/lecturer/proposals/:id/comments` | LECTURER | Add an inline comment |
| `GET` | `/lecturer/proposals/:id/comments` | LECTURER | Get all comments |
| `PATCH` | `/lecturer/proposals/:id/review` | LECTURER | Approve or reject a proposal |

---

### Admin — `/admin`

| Method | Endpoint | Access | Description |
|---|---|---|---|
| `GET` | `/admin/proposals` | ADMIN | Get all submitted proposals |
| `PATCH` | `/admin/proposals/:id/assign` | ADMIN | Assign a lecturer to a proposal |
| `GET` | `/admin/lecturers` | ADMIN | Get all lecturers |

---

## 🔐 Authentication

All protected routes require a `Bearer` token in the `Authorization` header:

```
Authorization: Bearer <your_jwt_token>
```

Tokens are returned in the login response body:

```json
{
  "message": "Login successful",
  "data": {
    "token": "eyJhbGciOiJIUzI1NiIs...",
    "user": {
      "_id": "...",
      "name": "...",
      "role": "STUDENT"
    }
  }
}
```

---

## 🧱 Available Scripts

| Script | Description |
|---|---|
| `npm run dev` | Start dev server with `ts-node-dev` (hot reload) |
| `npm run build` | Compile TypeScript to `dist/` |
| `npm start` | Run compiled production build |

---

## 🚢 Deployment (Render)

1. Push the repo to GitHub.
2. Create a new **Web Service** on [render.com](https://render.com).
3. Set **Build Command:** `npm install && npm run build`
4. Set **Start Command:** `npm start`
5. Add all environment variables (`PORT`, `MONGO_URI`, `JWT_SECRET`, `GEMINI_API_KEY`) in the Render dashboard.

---

## 🔗 Related

- [Proposely Frontend](https://github.com/sandula-sanchana/Proposely-Frontend) — React 19 + Vite + Tailwind v4 + Redux Toolkit
