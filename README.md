## Book Review 
A full-stack web application where users can search for books and write reviews about them.
I am using React, TypeScript, Node.js, Express, JWT authentication, and an external API.

## Features
User registration and login
JWT authentication
Search for books using an external API
View book details
Add book reviews
Edit reviews
Delete reviews
Responsive UI
REST API backend
Persistent data using JSON database

## Technologies Used
1- Frontend
React
TypeScript
Vite
React Router
CSS

2- Backend
Node.js
Express
TypeScript
JWT Authentication
bcrypt (password hashing)
External API
Open Library API
https://openlibrary.org/developers/api⁠�

## Project Structure

book-reviews
│
├── book-reviews-frontend
│   ├── src
│   │   ├── components
│   │   ├── pages
│   │   │   ├── Home.tsx
│   │   │   ├── Login.tsx
│   │   │   ├── Register.tsx
│   │   │   └── BookDetails.tsx
│   │   ├── lib
│   │   │   └── api.ts
│   │   └── App.tsx
│   │
│   └── package.json
│
├── book-reviews-backend
│   ├── src
│   │   ├── routes
│   │   │   ├── auth.ts
│   │   │   ├── reviews.ts
│   │   │   └── books.ts
│   │   ├── middleware
│   │   ├── data
│   │   │   └── db.json
│   │   └── index.ts
│   │
│   └── package.json
│
└── README.md

## Installation

Backend Setup
(https://github.com/Sabrinaltahan/book-reviews-backend.git)
cd book-reviews-backend
npm install
npm run dev
The backend will run on:
http://localhost:4000

Frontend Setup
(https://github.com/Sabrinaltahan/book-reviews-frontend.git)
cd book-reviews-frontend
npm install
npm run dev
The frontend will run on:
http://localhost:5174


## Authentication
The application uses JWT tokens for authentication.
After login:
The backend generates a JWT token
The token is stored in localStorage
The token is sent in API requests using the header:
## Review System
Users can:
Add Review
POST /reviews
Get Reviews

GET /reviews/object/:objectId
Update Review:
PUT /reviews/:id

Delete Review:
DELETE /reviews/:id

Reviews include:
text
rating (1–5)
userId
createdAt
## Security
Passwords are hashed using:
bcrypt
Authentication is handled using:
JWT (JSON Web Tokens)
🖥 Example Workflow
Register a user
Login
Search for a book
Open book details
Add a review
Edit or delete the review
## Example Books

Harry Potter

Pride and Prejudice

the hobbit

Deep Work

## Author:
Developed by: Sabrin Altahan

## Github:
Backend link:
https://github.com/Sabrinaltahan/book-reviews-backend.git

Frontend link:
https://github.com/Sabrinaltahan/book-reviews-frontend.git

Webbsite link:
