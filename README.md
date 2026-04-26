# Exam Seating Allocation System — Gautam Buddha University

A full-stack academic ERP-style web application for GBU exam seating allocation with student login/signup, authorized admin dashboard, randomized seating generation, capacity indicators, responsive grids, toast notifications, and A4 print layout.

## Stack

- React 19 + Vite + TanStack Start
- Tailwind CSS v4 design tokens
- Framer Motion animations
- Lucide Icons
- React Toastify notifications
- TanStack server routes for backend APIs
- Mock JWT-style authentication and mock student/room data

> This Lovable project uses TanStack Start server routes instead of a separate Express process, so the requested backend APIs run inside the same full-stack app.

## Run commands

```bash
npm install
npm run dev
```

Equivalent Bun commands:

```bash
bun install
bun run dev
```

## Demo credentials

### Student

- Username / Roll Number: `235/UCS/001`
- Password: `student123`

### Admin

- Username: `gbu-admin`
- Password: `admin123`

## API endpoints

### `POST /generate-seating`

Requires admin bearer token.

Input:

```json
{
  "examName": "Mid Term",
  "roomId": "IL101",
  "department": "SOICT",
  "studentList": [],
  "alternateSeating": true
}
```

Response:

```json
{
  "seatingMatrix": [],
  "totalAllocated": 36,
  "remainingSeats": 4,
  "room": {},
  "pattern": "Alternate",
  "examName": "Mid Term",
  "department": "SOICT"
}
```

### `GET /rooms`

Returns rooms and capacities:

- Room IL101 — Capacity 40
- Room IL102 — Capacity 50
- Room IL200 — Capacity 60
- Room IL201 — Capacity 45
- Room IL202 — Capacity 70
- Room IL203 — Capacity 80

### `GET /students`

Returns 100+ mock students. Optional query:

```bash
/students?department=SOICT
```

### `POST /auth/student-login`

```json
{
  "username": "235/UCS/001",
  "password": "student123"
}
```

### `POST /auth/student-signup`

```json
{
  "fullName": "Student Name",
  "rollNumber": "235/UCS/030",
  "email": "student@gbu.ac.in",
  "password": "student123",
  "confirmPassword": "student123"
}
```

### `POST /auth/admin-login`

```json
{
  "username": "gbu-admin",
  "password": "admin123"
}
```

## Features

- GBU-inspired header, logo placement, maroon/gold institutional palette, and official campus hero image
- Student login, student signup, and admin login tabs
- Show/hide password and validation feedback
- Student dashboard with details and personal seat allocation
- Admin dashboard with exam, room, department, and alternate seating controls
- Dynamic randomized seating on reset/regenerate
- Capacity status: green when okay, red on overflow
- Responsive seating grid with seat number and student roll number
- A4-optimized printable seating arrangement
- API-level invalid input, capacity overflow, and unauthorized admin handling

## Project structure

```text
src/
  components/
    AppHeader.tsx
    GbuBrand.tsx
  lib/
    exam-data.ts
    mock-auth.ts
  routes/
    index.tsx
    rooms.ts
    students.ts
    generate-seating.ts
    auth.student-login.ts
    auth.student-signup.ts
    auth.admin-login.ts
public/
  gbu/
    campus-hero.jpg
    logo.png
```
