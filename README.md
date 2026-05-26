# wp-clone

A lightweight WordPress-like CMS built with a Node.js + Express backend and a React + Vite frontend. This README documents how to run the project and enumerates the backend API routes and frontend routes/pages.

---

## Table of contents

- Project overview
- Quick start
- Backend
  - Tech stack
  - Running
  - Folder layout
  - API routes (endpoints)
- Frontend
  - Tech stack
  - Running
  - Routes / pages
- Database & seed
- Uploads / media
- Notes

---

## Project overview

This repository is a simple CMS clone with a JSON API backend and a single-page React admin + public frontend. The backend exposes REST endpoints under `/api/*`. The frontend consumes that API and provides a visitor-facing site and an admin console at `/admin/*`.

## Quick start

Prerequisites:
- Node.js (16+ recommended)
- npm or yarn

1. Start backend

```
cd backend
npm install
npm run dev   # or `npm start` depending on your package scripts
```

2. Start frontend

```
cd frontend
npm install
npm run dev
```

By default the frontend expects the API at `http://localhost:5000/api`. See `frontend/src/App.jsx` for `API_BASE`.

## Backend

- Location: `backend/`
- Entry: `backend/src/server.js`
- DB: Prisma schema at `backend/prisma/schema.prisma` (seeding in `backend/prisma/seed.js`).

Tech stack
- Node.js, Express
- Prisma (Postgres/SQLite depending on env)
- Multer for file uploads

Running
- Install deps in `backend/`, configure environment (database URL, JWT secret), then run the dev or start script.

Folder layout (selected files)
- `backend/src/server.js` - app bootstrap and router mounting
- `backend/src/db.js` - DB connection / Prisma client
- `backend/src/controllers/` - business logic for each resource
- `backend/src/routes/` - route definitions
- `backend/src/middlewares/auth.middleware.js` - auth helpers (`authenticate`, `requireAdmin`)

API base path: `/api`

API Routes

Authentication
- POST `/api/auth/register` — register a new user
- POST `/api/auth/login` — login and receive JWT
- GET  `/api/auth/me` — get current user (requires `Authorization: Bearer <token>`)

Categories
- GET  `/api/categories/` — list categories
- POST `/api/categories/` — create category (admin only)
- DELETE `/api/categories/:id` — delete category (admin only)

Tags
- GET  `/api/tags/` — list tags
- POST `/api/tags/` — create tag (admin only)
- DELETE `/api/tags/:id` — delete tag (admin only)

Posts
- GET  `/api/posts/` — list posts
- GET  `/api/posts/:slug` — get single post by slug
- POST `/api/posts/` — create post (admin only)
- PUT  `/api/posts/:id` — update post (admin only)
- DELETE `/api/posts/:id` — delete post (admin only)

Pages
- GET  `/api/pages/` — list pages
- GET  `/api/pages/:slug` — get page by slug
- POST `/api/pages/` — create page (admin only)
- PUT  `/api/pages/:id` — update page (admin only)
- DELETE `/api/pages/:id` — delete page (admin only)

Comments
- GET  `/api/comments/` — list all comments (admin only)
- GET  `/api/comments/post/:postId` — list comments for a given post
- POST `/api/comments/` — create a comment (visitor)
- PUT  `/api/comments/:id` — moderate / approve (admin only)
- DELETE `/api/comments/:id` — delete comment (admin only)

Media
- GET  `/api/media/` — list uploaded media
- POST `/api/media/` — upload media (admin only; expects multipart `file` field)
- DELETE `/api/media/:id` — delete media (admin only)

Settings
- GET  `/api/settings/` — read site settings
- PUT  `/api/settings/` — update site settings (admin only)

Notes on backend auth
- Routes that require admin use a `requireAdmin` middleware.
- Authenticated user info is fetched via `/api/auth/me` using the `authenticate` middleware.

## Frontend

- Location: `frontend/`
- Entry: `frontend/src/main.jsx` (Vite) and `frontend/src/App.jsx` (routes + layout).
- `API_BASE` is defined in `frontend/src/App.jsx` and defaults to `http://localhost:5000/api`.

Tech stack
- React, React Router, Vite

Pages / Routes (client-side)

Public visitor routes
- `/` — Home (lists posts)
- `/post/:slug` — Post detail page
- `/:slug` — Page detail (pages by slug)

Admin console routes (protected)
- `/admin/login` — Admin login
- `/admin` and `/admin/dashboard` — Dashboard overview
- `/admin/posts` — Posts manager
- `/admin/posts/new` — Create new post
- `/admin/posts/edit/:id` — Edit post
- `/admin/pages` — Pages manager
- `/admin/pages/new` — Create page
- `/admin/pages/edit/:id` — Edit page
- `/admin/media` — Media library
- `/admin/comments` — Comments moderator
- `/admin/settings` — Site settings panel

Relevant frontend files
- `frontend/src/App.jsx` — app layout, route definitions, `API_BASE` constant
- `frontend/src/pages/` — contains `Home.jsx`, `PostDetail.jsx`, `PageDetail.jsx`, and admin pages under `frontend/src/pages/admin/`

## Database & seed

- Prisma schema at `backend/prisma/schema.prisma`.
- A seed script is at `backend/prisma/seed.js` to create initial data (run after migrations depending on setup).

## Uploads / media

- Uploaded files are stored under `backend/public/uploads/`.
- The media upload route accepts multipart form data with form field `file`.

## Environment variables (common)
- `DATABASE_URL` — Prisma DB connection string
- `JWT_SECRET` — secret used for signing JWTs
- `PORT` — backend server port (default often 5000)

## Troubleshooting & notes
- If the frontend cannot reach the API, verify `API_BASE` in `frontend/src/App.jsx` and backend `PORT`.
- Ensure the DB is migrated and seeded before starting the backend if using a fresh DB.

---