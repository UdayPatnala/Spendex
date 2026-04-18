#!/bin/bash

# Configuration
API_BASE="https://spedex.onrender.com/api"
# API_BASE="http://localhost:8080/api" # Uncomment for local testing

echo "--- Spedex API Validation ---"
echo "Testing base: $API_BASE"

# 1. Health Check
echo ""
echo "[1] Testing Health Check..."
HEALTH_RES=$(curl -s -w "\n%{http_code}" "$API_BASE/health")
HEALTH_CODE=$(echo "$HEALTH_RES" | tail -n 1)
HEALTH_BODY=$(echo "$HEALTH_RES" | sed '$d')
echo "Status: $HEALTH_CODE"
echo "Body: $HEALTH_BODY"

if [ "$HEALTH_CODE" != "200" ]; then
    echo "ERROR: Health check failed!"
    exit 1
fi

# 2. Signup Test (random user)
echo ""
echo "[2] Testing Signup..."
RAND_ID=$RANDOM
SIGNUP_BODY="{\"name\": \"Tester $RAND_ID\", \"email\": \"test_$RAND_ID@example.com\", \"password\": \"password123\"}"
SIGNUP_RES=$(curl -s -w "\n%{http_code}" -X POST -H "Content-Type: application/json" -d "$SIGNUP_BODY" "$API_BASE/auth/signup")
SIGNUP_CODE=$(echo "$SIGNUP_RES" | tail -n 1)
SIGNUP_JSON=$(echo "$SIGNUP_RES" | sed '$d')
echo "Status: $SIGNUP_CODE"
# Extract token (requires jq, or we can use grep/sed)
TOKEN=$(echo "$SIGNUP_JSON" | grep -oP '"access_token":"\K[^"]+')

if [ -z "$TOKEN" ]; then
    echo "ERROR: Signup failed to return token!"
    echo "Body: $SIGNUP_JSON"
    exit 1
fi
echo "Signup SUCCESS. Token extracted."

# 3. Authenticated Overview Check
echo ""
echo "[3] Testing Authenticated Dashboard Overview..."
DASH_RES=$(curl -s -w "\n%{http_code}" -X GET -H "Authorization: Bearer $TOKEN" "$API_BASE/dashboard/overview")
DASH_CODE=$(echo "$DASH_RES" | tail -n 1)
DASH_BODY=$(echo "$DASH_RES" | sed '$d')
echo "Status: $DASH_CODE"

if [ "$DASH_CODE" == "200" ]; then
    echo "SUCCESS: Dashboard data received."
else
    echo "ERROR: Dashboard access failed!"
    echo "Body: $DASH_BODY"
    exit 1
fi

echo ""
echo "--- ALL VALIDATION TESTS PASSED ---"
