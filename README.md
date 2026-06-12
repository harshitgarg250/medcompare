# MedCompare

A healthcare comparison platform to find and book diagnostic tests at the best price near you.

Built this to solve a real problem — when my family needed an MRI, prices varied from ₹2,500 to ₹6,000 across different labs in the same city. No single place to compare them.

## Live Demo
Coming soon...

## Features

- Detect user location automatically
- Search nearby hospitals and diagnostic centers
- Compare prices for Blood Test, MRI, X-Ray, CT Scan, ECG, Ultrasound and more
- Filter by price, rating, distance, availability
- Interactive map with real hospital markers
- Hospital detail page with tests, prices and reviews
- Slot-based appointment booking
- My Bookings history
- User authentication (Register/Login)

## Tech Stack

**Frontend**
- React + Vite
- Tailwind CSS
- Framer Motion
- React Query
- Zustand
- Leaflet.js (Maps)

**Backend**
- Node.js + Express
- PostgreSQL
- Prisma ORM
- JWT Authentication
- bcrypt

## Local Setup

```bash
# Clone the repo
git clone https://github.com/harshitgarg250/medcompare.git
cd medcompare
```

**Backend:**
```bash
cd backend
npm install
npm run dev
```

**Frontend:**
```bash
cd frontend
npm install
npm run dev
```

**Database:**
```bash
# Create PostgreSQL database
psql postgres -c "CREATE DATABASE medcompare;"

# Run migrations
cd backend
npx prisma migrate dev

# Add demo hospitals, tests and prices
npm run seed
```

## Environment Variables

```env
PORT=5001
DATABASE_URL="postgresql://username@localhost:5432/medcompare?schema=public"
JWT_SECRET=your_secret_key
```

## API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | /api/auth/register | Register user |
| POST | /api/auth/login | Login |
| GET | /api/auth/me | Get profile |
| GET | /api/hospitals | Get all hospitals |
| GET | /api/hospitals/nearby | Get nearby hospitals |
| GET | /api/hospitals/:id | Get hospital detail |
| GET | /api/tests | Get all tests |
| GET | /api/tests/compare/:id | Compare test prices |
| POST | /api/bookings | Book appointment |
| GET | /api/bookings/my | My bookings |
| PATCH | /api/bookings/:id/cancel | Cancel booking |
| GET | /api/slots | Get available slots |

## Project Status

- [x] Backend setup
- [x] Database schema (10 tables)
- [x] JWT Authentication
- [x] Hospital & Test APIs
- [x] Booking system with slot management
- [x] Landing page with animations
- [x] Hospital search with filters
- [x] Interactive map (OpenStreetMap + Leaflet)
- [x] Hospital detail page
- [x] Booking flow (3 steps)
- [x] My Bookings page
- [x] Real hospital data (10 hospitals, 15 tests)
- [ ] Deployment

## Screenshots
Coming soon...

## Author
Harshit Garg
