# MedCompare

A platform to compare diagnostic test prices across hospitals and labs.

Built this to solve a real problem — when my family needed an MRI, prices varied from ₹2500 to ₹6000 across different labs in the same city. No single place to compare them.

## What it does

- Search nearby hospitals and diagnostic centers
- Compare prices for tests like Blood Test, MRI, X-Ray, CT Scan, ECG
- Book appointments online
- View ratings, distance, and available slots

## Tech Stack

**Backend**
- Node.js + Express
- PostgreSQL
- Prisma ORM
- JWT Authentication

**Frontend** *(in progress)*
- React + Vite
- Tailwind CSS
- React Query
- Zustand

## Local Setup

```bash
# Clone the repo
git clone https://github.com/yourusername/medcompare.git
cd medcompare

# Backend
cd backend
npm install
npm run dev

# Frontend
cd frontend
npm install
npm run dev
```

## API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | /api/auth/register | Register user |
| POST | /api/auth/login | Login |
| GET | /api/hospitals | Get all hospitals |
| GET | /api/hospitals/nearby | Get nearby hospitals |
| GET | /api/tests/compare/:id | Compare test prices |
| POST | /api/bookings | Book appointment |

## Status

- [x] Backend setup
- [x] Database schema
- [x] Auth APIs
- [x] Hospital & Test APIs
- [x] Booking APIs
- [x] Frontend pages (Landing, Login, Register, Hospitals, Hospital Detail, Booking, My Bookings)
- [ ] Google Maps integration
- [ ] Deployment
## Notes

Still learning — open to feedback and suggestions.