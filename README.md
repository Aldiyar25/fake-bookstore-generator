Fake Bookstore Generator
A full-stack application built with React (Vite) and Express that generates fake bookstore data (books, covers, reviews) deterministically based on a seed. Users can specify language (EN/RU/FR), seed, average likes/reviews, and paginate through an infinite-scrolling catalog.

Features:
Language/Locale: English, Russian, French
Deterministic Data: All titles, authors, ISBNs, likes/reviews are seeded for repeatability
Average Likes/Reviews: Supports fractional values (e.g., 0.5 yields sometimes 0, sometimes 1)
Infinite Scrolling: Batch‐based loading (20 items on first page, 10 on subsequent)
Expandable Rows: Click a book to view cover image and reviews
Single‐Folder Setup: Frontend (Vite) + Backend (Express) in one repo
Single Production Server: Express serves both API and built React static files

Prerequisites:
Node.js v16+ (includes npm)
npm v8+
(Optional) git for cloning

Installation
Clone the repository:
git clone https://github.com/your-username/fake-bookstore.git
cd fake-bookstore

Install dependencies (both frontend & backend):
bash
npm install

Development

1. Run the Backend (Express)
   In one terminal:
   npm run dev:server
   Uses nodemon server.js

Listens on port 3000 by default

2. Run the Frontend (React/Vite)
   In a separate terminal:
   npm run dev
   Launches Vite on port 5173

API requests to /api are proxied to localhost:3000 (see vite.config.js)

You can now open http://localhost:5173 in your browser. Changes to React components or server code will hot‐reload automatically.
