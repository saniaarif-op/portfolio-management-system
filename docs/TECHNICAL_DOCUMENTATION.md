# Technical Documentation

## 1. System Architecture

The application uses a three-layer structure:

1. React/Vite client
2. Express REST API
3. Prisma/SQLite persistence layer

The frontend never writes directly to the database. It communicates with the backend using JSON REST requests.

## 2. Database Structure

### User

- id
- name
- username
- email
- passwordHash
- title
- bio
- location
- avatarUrl
- resumeUrl
- skills
- social links
- timestamps

### Project

- id
- title
- description
- imageUrl
- projectUrl
- githubUrl
- technologies
- featured
- sortOrder
- userId
- timestamps

One user can own many projects.

## 3. API Specifications

### POST /api/auth/register

Creates a new user.

Request:
```json
{
  "name": "Jane Doe",
  "username": "janedoe",
  "email": "jane@example.com",
  "password": "StrongPassword123"
}
```

### POST /api/auth/login

Returns a JWT token.

### GET /api/portfolio/:username

Public endpoint that returns the selected user's public profile and projects.

### PUT /api/portfolio/profile

Protected endpoint. Updates the authenticated creator's profile.

### POST /api/portfolio/projects

Protected endpoint. Adds a project to the authenticated creator.

### PUT /api/portfolio/projects/:id

Protected endpoint. Updates only a project owned by the authenticated creator.

### DELETE /api/portfolio/projects/:id

Protected endpoint. Deletes only an owned project.

### PUT /api/portfolio/projects/reorder

Protected endpoint. Saves project ordering for the authenticated creator.

## 4. Authentication and Security

- Passwords are hashed with bcrypt.
- JWT is required for protected API requests.
- Middleware verifies token ownership.
- Zod validates request bodies.
- Helmet sets security-related HTTP headers.
- Express rate limiting reduces repeated abusive requests.
- CORS restricts browser access to configured frontend origin.
- Ownership checks prevent one creator from editing another creator's records.
- Public endpoints expose portfolio information intended for public viewing only.

## 5. Local Setup

Install Node.js 18+.

Backend:
```bash
cd backend
npm install
copy .env.example .env
npx prisma migrate dev --name init
npm run seed
npm run dev
```

Frontend:
```bash
cd frontend
npm install
copy .env.example .env
npm run dev
```

## 6. Deployment

### Backend

Use a Node-compatible service such as Render or Railway.

Set:
- `DATABASE_URL`
- `JWT_SECRET`
- `FRONTEND_URL`
- `PORT`

For production, use a managed PostgreSQL database and update the Prisma datasource provider from `sqlite` to `postgresql`.

### Frontend

Build:
```bash
npm run build
```

Deploy the `frontend/dist` output to a static hosting service such as Vercel or Netlify.

Set:
- `VITE_API_URL=https://your-backend-domain/api`

## 7. Design

The interface uses a dark navy/indigo visual system with glass-style cards, gradient accents, clear typography, responsive grids and accessible focus states.

## 8. Testing

Test:
- Registration
- Login
- Invalid credentials
- Protected dashboard
- Profile update
- Project creation
- Project edit/delete
- Reordering
- Public username route
- Mobile layout
- Unauthorized project modification
