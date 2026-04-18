# Spedex Validation & Test Plan

This document outlines the professional validation steps for the Spedex Smart Wallet project.

## 1. Backend API Validation
Use the included `test-endpoints.sh` to verify all REST endpoints.

### Endpoints Checklist
- [ ] **Health Check**: `GET /api/health` -> Should return `200 OK` with Java/Spring Boot status.
- [ ] **Signup**: `POST /api/auth/signup` -> Should create a user and return a JWT.
- [ ] **Login**: `POST /api/auth/login` -> Should authenticate and return a JWT.
- [ ] **Dashboard Overview**: `GET /api/dashboard/overview` -> Requires JWT.
- [ ] **Mobile Data**: `GET /api/mobile/vendors`, `/api/mobile/budgets`, `/api/mobile/analytics` -> Requires JWT.

## 2. Security Validation
### JWT Verification
- Copy the `access_token` from a login response and paste it into [jwt.io](https://jwt.io).
- Verify the `sub` claim contains the user's email.
- Verify the signature is valid (using the secret key from `application.properties`).

### CORS Verification
- Run: `curl -v -X OPTIONS -H "Origin: https://spe-dex.vercel.app" -H "Access-Control-Request-Method: GET" https://spedex.onrender.com/api/health`
- Verify `Access-Control-Allow-Origin: https://spe-dex.vercel.app` is present in the response.

## 3. Frontend Validation
### Theme Check
- Open `https://spe-dex.vercel.app/`.
- Verify the background gradient matches the Indian Currency note colors (Magenta, Fluorescent Blue, etc.).
- Check components match the 2000, 500, 100, 50, 20, 10 rupee note shades.

### Functional Check
- Login/Signup flow on the responsive dashboard.
- Data loading on the overview cards.
- Quick Pay vendor list rendering.

## 4. Deployment Check
- **Render**: Dashboard status should be "Live". Build logs should show "Docker build successful".
- **Vercel**: Deployment status "Ready".
