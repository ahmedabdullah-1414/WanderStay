# WanderStay

An Airbnb-inspired full-stack property booking web application where hosts can list their spaces and guests can discover, save, and book accommodations with real-time availability checking and interactive maps.

**Live demo:** https://wanderstay-n8y7.onrender.com

---

## Features

- **Browse listings** with category filters — Trending, Mountains, Castles, Arctic, Boats, Farms, Domes, Amazing Pools, Camping, Iconic Cities, Rooms
- **Search** by title, location, or country from the navbar
- **Interactive maps** on every listing using MapLibre GL and MapTiler
- **Booking system** — pick dates, check availability, see full price breakdown (base + cleaning fee + service fee), confirm reservation
- **Wishlist** — save listings with the heart button, persisted to your account
- **Reviews** — leave star ratings and comments on listings
- **User auth** — signup, login, logout with session management
- **Admin portal** — dashboard with charts, manage users, listings, and bookings

---

## Tech Stack

| Layer | Technology |
|---|---|
| Frontend | EJS, Bootstrap 5, Font Awesome, MapLibre GL, Chart.js |
| Backend | Node.js, Express.js |
| Database | MongoDB (Atlas) + Mongoose |
| Auth | Passport.js + passport-local-mongoose |
| File upload | Multer + Cloudinary |
| Maps | MapTiler Geocoding API + MapLibre GL JS |
| Deployment | Render (app) + MongoDB Atlas (DB) |

---

## Project Structure

```
├── app.js                  # Express app entry point
├── controllers/            # Route handlers
│   ├── listings.js
│   ├── bookings.js
│   ├── reviews.js
│   ├── users.js
│   ├── wishlist.js
│   └── admin.js
├── models/                 # Mongoose schemas
│   ├── listing.js
│   ├── booking.js
│   ├── reviews.js
│   └── user.js
├── routes/                 # Express routers
│   ├── listing.js
│   ├── booking.js
│   ├── myBookings.js
│   ├── review.js
│   ├── user.js
│   ├── wishlist.js
│   └── admin.js
├── views/                  # EJS templates
│   ├── listing/
│   ├── bookings/
│   ├── users/
│   ├── admin/
│   ├── wishlist/
│   ├── includes/
│   └── layouts/
├── public/                 # Static assets (CSS, JS)
├── utils/                  # Helpers (error class, async wrapper, availability check)
├── middleware.js            # Auth, validation, ownership middleware
├── schema.js               # Joi validation schemas
└── cloudConfig.js          # Cloudinary setup
```

---

## Getting Started

### Prerequisites

- Node.js 18+
- MongoDB (local or Atlas)
- Cloudinary account
- MapTiler account

### Installation

```bash
git clone https://github.com/ahmedabdullah-1414/WanderStay.git
cd WanderStay
npm install
```

### Environment Variables

Create a `.env` file in the root:

```env
MONGO_URL=mongodb://127.0.0.1:27017/wanderlust
CLOUD_NAME=your_cloudinary_cloud_name
CLOUD_API_KEY=your_cloudinary_api_key
CLOUD_API_SECRET=your_cloudinary_api_secret
MAP_TOKEN=your_maptiler_api_key
SECRET=your_session_secret
```

### Seed the database

```bash
node init/index.js
```

### Run locally

```bash
nodemon app.js
```

App runs at `http://localhost:8080`

---

## Admin Access

To promote a user to admin:

```bash
node init/makeAdmin.js <username>
```

Admins are redirected to `/admin` on login and have access to the full admin portal.

---

## Deployment

The app is deployed on **Render** with **MongoDB Atlas** as the cloud database.

To deploy your own instance:
1. Push to GitHub
2. Create a Web Service on [render.com](https://render.com) connected to your repo
3. Set all environment variables in Render's dashboard
4. Set build command: `npm install` and start command: `npm start`

---

## Future Improvements

- Razorpay / Stripe payment integration
- Booking confirmation emails via Nodemailer
- Multiple image upload with gallery carousel
- Host dashboard with earnings and booking stats
- User profile pages
- Disable already-booked dates in the date picker
- CSV export for admin
- Dark mode
