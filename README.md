# Spedex

Spedex is a fintech workspace for tracking how fast money moves and where it goes. The name blends "speed index" and "spending index" into one product for payments, budgets, and live spending insight.

## Project Structure

- `backend/`: FastAPI API with SQLite-by-default and PostgreSQL-ready configuration
- `mobile/`: Expo React Native app for the mobile Spedex experience
- `dashboard_app/`: React dashboard for desktop spending operations
- `api/`: Vercel entrypoint that routes web traffic to the backend service

## Quick Start

### 1. Backend

```bash
cd backend
python -m venv .venv
.venv\Scripts\activate
pip install -r requirements.txt
uvicorn app.main:app --reload
```

The API defaults to SQLite at `backend/spedex.db`. Set `DATABASE_URL` to a PostgreSQL connection string to switch databases.

Demo credentials:

- Email: `alex@spedex.app`
- Password: `spedex123`

### 2. Mobile

```bash
cd mobile
npm install
npm start
```

By default the app points at `http://localhost:8000`. For Android emulators it automatically uses `http://10.0.2.2:8000`.

### 3. Dashboard

```bash
cd dashboard_app
npm install
npm run dev
```

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
