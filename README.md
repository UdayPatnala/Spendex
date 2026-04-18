# Spedex

Spedex is a fintech workspace for tracking how fast money moves and where it goes. The name blends "speed index" and "spending index" into one product for payments, budgets, and live spending insight.

## Project Structure

- `backend/`: Java Spring Boot backend API with in-memory H2 database by default and PostgreSQL-ready configuration.
- `mobile/`: Expo React Native app for the mobile Spedex experience.
- `dashboard_app/`: React Vite dashboard for desktop spending operations.

## Quick Start

### 1. Backend

The backend is a Java Spring Boot application built with Maven.

`cd backend`

`chmod +x mvnw`

`./mvnw spring-boot:run`

The API defaults to an H2 database. Configure your application properties to set `spring.datasource.url` to a PostgreSQL connection string to switch databases.

Demo credentials:

- Email: `alex@spedex.app`
- Password: `spedex123`

### 2. Mobile

`cd mobile`

`npm install`

`npm run start`

By default the app points at `http://localhost:8080`. For Android emulators it automatically uses `http://10.0.2.2:8080`.

### 3. Dashboard

`cd dashboard_app`

`npm install`

`npm run dev`

## Environment Setup

Set these environment variables or application properties as appropriate:

| Variable / Property | Description |
|---|---|
| `JWT_SECRET` | Strong random string (at least 256 bits) used for token generation |
| `spring.datasource.url` | PostgreSQL connection string |
| `spedex.cors.allowed-origins` | Your deployed frontend URLs |

## API Highlights

- `POST /api/auth/signup`
- `POST /api/auth/login`
- `GET /api/mobile/home`
- `GET /api/mobile/budgets`
- `GET /api/mobile/vendors`
- `GET /api/mobile/analytics`
- `GET /api/dashboard/overview`

## Branding Notes

Spedex keeps the indigo-first visual language while shifting the brand voice to "speed index" and "spending index" across the backend, dashboard, and mobile app.
