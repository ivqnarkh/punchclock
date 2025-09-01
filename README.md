# Punch Clock Application

## Overview

This application is a full-stack, web-based time tracking system designed to allow employees to remotely clock in
and clock out easily, with admin features for managing users and monitoring work hours. This project demonstrates
practical skills in modern web dev, backend API design, secure auth, session management, and deployment.

LIVE DEMO: https://punchclockdemo.vercel.app
- view user interface with testuser password123
- view admin interface with testadmin password123

## Features

User authentication and role based access:
  Secure login system with password hashing (bcrypt), session management stored in postgreSQL, and role based au-
  thorization guards (USER and ADMIN)

Punch in/out
  Employees can punch in and out sequentially with timestamp and location metadata, stored using Prisma ORM

Admin controls
  Admins can register new users, view all employee punch history, and calculate hours worked over custom date ranges
  (WIP) Admin will also be able to manually alter and edit punch data in the event of mispunches

Express + Prisma API
  Structured RESTful API endpoints secured with session based auth and input validation

Persistent sessions
  Sessions are stored securely in a PostgreSQL database via connect-pg-simple

Frontend with React + Vite
  Response UI with role-based views, login experience and efficient data retrieval from api endpoints

Fully deployed
  Backend and database hosted on Railway, frontend deployed on Vercel

## Tech stack
- Frontend: React, Vite, Fetch API
- Backend: Node.js, Express, Prisma ORM, PostgreSQL
- Auth: express-session with secure cookies, bcrypt for password hashing
- Deployment: Railway (backend + db), Vercel (frontend)

## About this project
- This project was developed to solidify fundamentals of end to end development, implementing both frontend and backend from scratch
  while also providing a learning experience about web security practices such as secure session handling, cookie config for cross-
  origin requests, and hashed password storage. I gained a lot of experience with cloud deployment platforms, environment variable
  management, and CORS config.
- I was inspired to create this project during my summer job landscaping, where the employees at the company i worked for simply
  logged hours in a notepad, which is a common theme for small companies like the one I worked for. I spoke to my boss and asked
  if he would like me to develop a solution for this, for which he agreed. He specified a list of requirements, functionality, and
  overall user experience, which served as my starting point. From there I created wireframes of the dashboards, determined what
  requests i would have to make to my backend, designed api endpoints, and then started working on the project. There are still
  many features I would like to add to improve user experience, security, and overall polish the project.


## Getting Started

### Prerequisites

- Node.js
- PostgreSQL db
- npm package manager

### Installation

1. Clone the repository
2. Configure env variables in .env for backend and frontend (note: for frontend no .env is required unless it is deployed):
     - Backend: `DATABASE_URL`, `SESSION_SECRET`, `NODE_ENV`
     - Frontend: `VITE_API_URL` (to deployed backend)
3. Install dependancies
   - cd backend
   - npm install
   - cd ../frontend/punch-clock
   - npm install
4. Run locally
   - npm run dev for both frontend and backend

## Future Improvments
- Add unit and integration tests for frontend and backend functionality
- Enhance UX/UI with accesibility improvements
- Add mobile app wrapper



