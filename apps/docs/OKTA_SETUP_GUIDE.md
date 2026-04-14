# Okta Setup Guide - TimeTrack App

This guide walks you through setting up Okta authentication for the TimeTrack mobile and backend apps.

---

## Prerequisites

- Okta account (free developer account works)
- Access to Okta Admin Console
- TimeTrack mobile and backend repositories

---

## Part 1: Create Okta Application

### Step 1: Create New Application

1. Log into your **Okta Admin Console**: https://YOUR-DOMAIN.okta.com/admin
2. Navigate to: **Applications** → **Applications**
3. Click **"Create App Integration"**
4. Select:
   - **Sign-in method**: OIDC - OpenID Connect
   - **Application type**: Native Application
5. Click **"Next"**

### Step 2: Configure Application Settings

**App integration name:**
```
TimeTrack Mobile
```

**Grant type:**
- ✅ Authorization Code
- ✅ Refresh Token

**Sign-in redirect URIs:**
```
exp://localhost:8081
http://localhost:8081
```
*(Add both for development)*

**Sign-out redirect URIs:**
```
exp://localhost:8081
http://localhost:8081
```

**Controlled access:**
- Select: "Allow everyone in your organization to access"
- Or create a specific group for TimeTrack users

Click **"Save"**

---

## Part 2: Gather Required Information

After creating the application, you'll need to collect 3 pieces of information:

### 1. Client ID

**Location:** Application → General tab → Client Credentials section

**Example:**
```
0oa5example1234567
```

**What it looks like:**
- Starts with `0oa`
- About 20 characters long
- Mix of letters and numbers

### 2. Issuer URL

**Option A: Default Authorization Server (Recommended for dev)**
```
https://YOUR-DOMAIN.okta.com/oauth2/default
```

**Option B: Custom Authorization Server**
```
https://YOUR-DOMAIN.okta.com/oauth2/YOUR-AUTH-SERVER-ID
```

**How to find your domain:**
- Look at your Okta Admin Console URL
- Example: `https://dev-12345.okta.com/admin` → Your domain is `dev-12345.okta.com`

**How to verify the issuer URL:**
1. Go to: **Security** → **API** → **Authorization Servers**
2. Find "default" authorization server
3. Copy the **Issuer URI**

### 3. Client Secret (Backend Only)

**Location:** Application → General tab → Client Credentials → Client secret

**Example:**
```
AbCdEfGhIjKlMnOpQrStUvWxYz1234567890AbCdEfGh
```

**⚠️ Important:** 
- This is **only shown once** when you create the app
- If you lose it, you'll need to regenerate it
- Only needed for backend, NOT mobile app

---

## Part 3: Configure Mobile App

### Edit `.env` file

**Location:** `/apps/mobile/.env`

**Replace these values:**

```bash
# Okta Issuer URL
# Replace YOUR-DOMAIN with your Okta domain
EXPO_PUBLIC_OKTA_ISSUER=https://YOUR-DOMAIN.okta.com/oauth2/default

# Okta Client ID
# Replace with your actual Client ID from Okta app
EXPO_PUBLIC_OKTA_CLIENT_ID=0oa5example1234567

# Okta Redirect URI (keep this for local development)
EXPO_PUBLIC_OKTA_REDIRECT_URI=exp://localhost:8081

# Backend API URL (already configured)
EXPO_PUBLIC_API_URL=http://192.168.1.243:3000/graphql
```

### Example (with real values):

```bash
EXPO_PUBLIC_OKTA_ISSUER=https://dev-12345.okta.com/oauth2/default
EXPO_PUBLIC_OKTA_CLIENT_ID=0oa5xyz123abc456
EXPO_PUBLIC_OKTA_REDIRECT_URI=exp://localhost:8081
EXPO_PUBLIC_API_URL=http://192.168.1.243:3000/graphql
```

---

## Part 4: Configure Backend

### Edit `.env` file

**Location:** `/apps/backend/.env`

**Replace these values:**

```bash
DATABASE_URL="mongodb://localhost:27017/timetrack"
JWT_SECRET="your-super-secret-jwt-key-change-in-production"
JWT_EXPIRES_IN="7d"

# Okta Issuer (without /oauth2/default)
OKTA_ISSUER="https://YOUR-DOMAIN.okta.com"

# Okta Client ID (same as mobile)
OKTA_CLIENT_ID="0oa5example1234567"

# Okta Client Secret (from Okta app credentials)
OKTA_CLIENT_SECRET="AbCdEfGhIjKlMnOpQrStUvWxYz1234567890AbCdEfGh"

PORT=3000

# Set to false when testing real Okta login
ENABLE_MOCK_AUTH=true
```

### Example (with real values):

```bash
DATABASE_URL="mongodb://localhost:27017/timetrack"
JWT_SECRET="my-super-secret-key-12345"
JWT_EXPIRES_IN="7d"
OKTA_ISSUER="https://dev-12345.okta.com"
OKTA_CLIENT_ID="0oa5xyz123abc456"
OKTA_CLIENT_SECRET="AbCdEfGhIjKlMnOpQrStUvWxYz1234567890AbCdEfGh"
PORT=3000
ENABLE_MOCK_AUTH=true
```

**⚠️ Important Difference:**
- **Mobile** `OKTA_ISSUER` includes `/oauth2/default`
- **Backend** `OKTA_ISSUER` does NOT include `/oauth2/default`

---

## Part 5: Create Test Users in Okta

### Add Users

1. Go to: **Directory** → **People**
2. Click **"Add Person"**
3. Fill in user details:
   - **First name**: John
   - **Last name**: Doe
   - **Username**: john.doe@example.com
   - **Primary email**: john.doe@example.com
   - **Password**: Set password or send activation email
4. Click **"Save"**

### Assign Users to Application

1. Go to: **Applications** → **Applications** → **TimeTrack Mobile**
2. Click **"Assignments"** tab
3. Click **"Assign"** → **"Assign to People"**
4. Find your test user and click **"Assign"**
5. Click **"Done"**

---

## Part 6: Test the Configuration

### Test Mobile App

1. **Restart Expo:**
   ```bash
   # Kill existing Expo server
   lsof -ti:8081 | xargs kill -9
   
   # Start fresh
   cd /Users/martinlarios/personal/apps/mobile
   npx expo start --clear
   ```

2. **Open app in Expo Go**

3. **You should see login screen with:**
   - "Sign in with Okta" button
   - "DEV MODE - Mock Login" section (if ENABLE_MOCK_AUTH=true)

4. **Test Okta Login:**
   - Tap "Sign in with Okta"
   - Enter your Okta username/password
   - Approve any consent screens
   - You should be redirected back to the app

### Test Backend

1. **Restart backend:**
   ```bash
   docker restart timetrack-backend-dev
   docker logs -f timetrack-backend-dev
   ```

2. **Verify configuration:**
   - Check logs for Okta issuer URL
   - Should see: "Okta auth configured with issuer: https://YOUR-DOMAIN.okta.com"

---

## Troubleshooting

### Issue: "Invalid redirect URI"

**Cause:** Okta app doesn't have correct redirect URI configured

**Fix:**
1. Go to Okta app → General tab → Login section
2. Add both redirect URIs:
   - `exp://localhost:8081`
   - `http://localhost:8081`

### Issue: "Invalid client" error

**Cause:** Client ID is wrong or app is disabled

**Fix:**
1. Verify Client ID matches exactly
2. Check app is "Active" in Okta (not "Inactive")

### Issue: "Issuer does not match"

**Cause:** Issuer URL format is wrong

**Fix:**
- **Mobile**: Must include `/oauth2/default`
  ```
  https://dev-12345.okta.com/oauth2/default
  ```
- **Backend**: Must NOT include `/oauth2/default`
  ```
  https://dev-12345.okta.com
  ```

### Issue: Mobile app not reading .env changes

**Fix:**
```bash
# Kill Expo completely
killall node
killall expo

# Clear cache and restart
cd /Users/martinlarios/personal/apps/mobile
npx expo start --clear
```

### Issue: Backend not reading .env changes

**Fix:**
```bash
# Restart Docker container
docker restart timetrack-backend-dev

# Or rebuild if needed
docker-compose up --build -d
```

---

## Quick Reference: What Goes Where

### Mobile App (.env)

```bash
EXPO_PUBLIC_OKTA_ISSUER=https://YOUR-DOMAIN.okta.com/oauth2/default
EXPO_PUBLIC_OKTA_CLIENT_ID=YOUR_CLIENT_ID
EXPO_PUBLIC_OKTA_REDIRECT_URI=exp://localhost:8081
```

### Backend (.env)

```bash
OKTA_ISSUER=https://YOUR-DOMAIN.okta.com
OKTA_CLIENT_ID=YOUR_CLIENT_ID
OKTA_CLIENT_SECRET=YOUR_CLIENT_SECRET
```

### Okta Application Settings

- **Name**: TimeTrack Mobile
- **Type**: Native Application
- **Grant Types**: Authorization Code, Refresh Token
- **Sign-in redirect URIs**: 
  - `exp://localhost:8081`
  - `http://localhost:8081`
- **Scopes**: openid, profile, email, offline_access

---

## Next Steps After Setup

1. **Test with mock login first** (ENABLE_MOCK_AUTH=true)
2. **Verify all GraphQL queries work**
3. **Test Okta login with test user**
4. **Disable mock auth** (ENABLE_MOCK_AUTH=false) when ready for production

---

**Document Version:** 1.0  
**Last Updated:** April 14, 2026  
**Status:** Ready for use
