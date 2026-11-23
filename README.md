# AarogyaLink
A MERN application for sharing hospital bed, ventilator and oxygen availability.

## Requirements
- Node.js 18+
- MongoDB local instance or MongoDB Atlas connection string

## Setup
1. Create `server/.env` from `server/.env.example` and set `MONGO_URI` and a long `JWT_SECRET`.
2. From the project root run:
   ```bash
   npm install
   npm run install-all
   npm run dev
   ```
3. Frontend: http://localhost:5173 | API: http://localhost:5000

## First admin
Register a normal account, then promote it in MongoDB Compass/shell:
```js
db.users.updateOne({ email: "admin@example.com" }, { $set: { role: "admin" } })
```

## Roles and workflow
- Public visitors can search approved hospitals without signing in.
- Hospital staff register and sign in. Their hospital profile remains pending until an admin approves it.
- Approved hospital staff can update their hospital details and availability.
- Admins approve, reject or deactivate hospitals and view city-level totals.

## Availability status
The status is calculated per resource: green = more than 30% available, yellow = 1–30%, red = 0 available. The percentage is relative to the resource's total capacity. This is an informational indicator, not a guarantee of real-time capacity.

## Important production note
This is a working educational starter, not a certified emergency-care or hospital integration system. Availability is self-reported by hospitals and may become stale. Verify by phone before travelling. Add institutional verification, audit logging, rate limiting, HTTPS, backups, monitoring and formal data governance before public deployment. The map uses OpenStreetMap tiles and browser geolocation only after the visitor selects “Near me”.
