# Spedex

Spedex is a fintech workspace for tracking how fast money moves and where it goes. The name blends "speed index" and "spending index" into one product for payments, budgets, and live spending insight.

## Project Structure

- `backend/`: Spring Boot API (Java 17) with H2 default storage and JWT auth
- `mobile/`: Expo React Native app for the mobile Spedex experience
- `dashboard_app/`: React dashboard for desktop spending operations

## Quick Start

### 1. Backend

```bash
cd backend
./mvnw spring-boot:run
```

The API runs on `http://localhost:8080` by default.

Default local datastore is H2:

- `spring.datasource.url=jdbc:h2:file:/tmp/spedex_db...`
- H2 console: `http://localhost:8080/h2-console`

Optional environment variables:

- `JWT_SECRET`: JWT signing key (used by `spedex.jwt.secret`)
- `SERVER_PORT`: override server port

### 2. Mobile

```bash
cd mobile
npm install
npm start
```

By default, mobile points at the backend on `http://localhost:8080` (or `http://10.0.2.2:8080` for Android emulators).

### 3. Dashboard

```bash
cd dashboard_app
npm install
npm run dev
```

## Deploying to Vercel

```bash
npm i -g vercel
vercel
```

Set these environment variables in the Vercel dashboard:

| Variable | Description |
|---|---|
| `VITE_API_BASE_URL` | Backend API URL, for example `https://your-api.example.com/api` |

## API Highlights

- `POST /api/auth/signup`
- `POST /api/auth/login`
- `GET /api/mobile/home`
- `GET /api/mobile/budgets`
- `GET /api/mobile/vendors`
- `GET /api/mobile/analytics`
- `GET /api/dashboard/overview`
- `POST /api/payments/prepare`
- `POST /api/payments/{transaction_id}/complete`

## Branding Notes

Spedex keeps the indigo-first visual language while shifting the brand voice to "speed index" and "spending index" across the backend, dashboard, and mobile app.
