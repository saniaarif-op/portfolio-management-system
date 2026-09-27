# Portfolio Management System

A full-stack portfolio management platform built for the EncoderX Remote Internship Batch 02, Week 03 task.

## Features

- Secure creator login/register
- Creator dashboard
- Profile, bio, skills and social links management
- Project CRUD with technology tags, links and image URL
- Drag-and-drop project reordering
- Public portfolio at `/portfolio/:username`
- Responsive modern UI
- RESTful API
- SQLite database with Prisma ORM
- Password hashing with bcrypt
- JWT authentication
- Protected dashboard/API routes
- Input validation with Zod
- Rate limiting, Helmet and CORS
- Rich text-style project descriptions
- API documentation
- Local setup and deployment instructions

## Tech Stack

Frontend: React, Vite, React Router, Axios, Lucide React, CSS
Backend: Node.js, Express, Prisma, SQLite, JWT, bcryptjs, Zod
Architecture: Separate frontend/backend REST API

## Requirements

- Node.js 18+
- npm 9+

## Run locally

### 1. Backend

```bash
cd backend
npm install
copy .env.example .env
npx prisma migrate dev --name init
npm run seed
npm run dev
```

Backend runs on `http://localhost:5000`.

### 2. Frontend

Open a second terminal:

```bash
cd frontend
npm install
copy .env.example .env
npm run dev
```

Frontend runs on the Vite URL shown in the terminal, normally `http://localhost:5173`.



## API

- `POST /api/auth/register`
- `POST /api/auth/login`
- `GET /api/auth/me`
- `GET /api/portfolio/:username`
- `PUT /api/portfolio/profile`
- `POST /api/portfolio/projects`
- `PUT /api/portfolio/projects/:id`
- `DELETE /api/portfolio/projects/:id`
- `PUT /api/portfolio/projects/reorder`
- `GET /api/portfolio/me`

## Submission checklist

- [x] System architecture
- [x] Database structure
- [x] User profile model
- [x] Project model
- [x] REST API
- [x] Dynamic username routing
- [x] Creator dashboard
- [x] Public portfolio
- [x] Responsive UI
- [x] Database-connected forms
- [x] Input validation
- [x] Protected routes
- [x] Unauthorized update prevention
- [x] API documentation
- [x] Local setup
- [x] Deployment guidance
- [x] Professional README

You still need to create your final 3–5 minute demo recording, LinkedIn post and submission PDF links after running/deploying your own copy.
