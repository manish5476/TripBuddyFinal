# TripBuddy MVP Status and Data Binding Notes

Last updated: 2026-05-13

This note documents the backend/frontend binding work completed so far, the current API contract, and the next modules to finish.

## Project Layout

```txt
D:\Projects\trip
  Trip-Buddy                         Backend API
  TripBuddy_Final\TripBuddyFinal     Expo React Native frontend
```

## Current Stack In This Repo

The original product target mentioned PostgreSQL/Prisma, but the existing application is already built on:

```txt
Backend:  Node.js, Express, MongoDB, Mongoose, JWT, Socket.io, Cloudinary
Frontend: Expo React Native, React Navigation, Axios, AsyncStorage, WebView Leaflet map
Maps:     Leaflet + OpenStreetMap in a React Native WebView
```

The current implementation keeps this stack intact so the MVP can move quickly without a risky rewrite.

## What Has Already Been Done

### 1. Leaflet Map Integration

Frontend file:

```txt
TripBuddy_Final\TripBuddyFinal\src\components\map\LeafletMap.js
```

Completed:

- Replaced the simple WebView Leaflet map with a stronger reusable map component.
- Added support for:
  - markers
  - start pins
  - stop pins
  - live-location pins
  - destination pins
  - route polyline
  - automatic fit-to-route/markers
  - safe popup text escaping

Backend endpoint:

```txt
GET /api/v1/journeys/:id/map
```

Backend files:

```txt
Trip-Buddy\src\controllers\journey.controller.js
Trip-Buddy\src\routes\journey.routes.js
```

This endpoint returns compact map-ready data:

```json
{
  "center": { "lat": 28.61, "lng": 77.2 },
  "routeCoordinates": [{ "lat": 28.61, "lng": 77.2 }],
  "markers": [
    {
      "lat": 28.61,
      "lng": 77.2,
      "kind": "start",
      "title": "Delhi",
      "description": "Starting point"
    }
  ],
  "stopCount": 3,
  "status": "active"
}
```

### 2. Journey Detail Map Binding

Frontend file:

```txt
TripBuddy_Final\TripBuddyFinal\src\screens\Trip\JourneyDetailScreen.js
```

Completed:

- Removed the mock/static map header.
- Bound the journey detail screen to:

```txt
journeyService.getJourney(journeyId)
journeyService.getJourneyMap(journeyId)
```

- The journey screen now renders the real Leaflet map using backend journey coordinates, stops, and live location.

### 3. Explore Map Navigation

Frontend file:

```txt
TripBuddy_Final\TripBuddyFinal\src\navigation\AppNavigator.js
```

Completed:

- Registered `ExploreMapScreen`.
- Existing Home buttons that navigate to `ExploreMap` now have a valid route.

### 4. Authentication Hardening

Backend files:

```txt
Trip-Buddy\src\controllers\auth.controller.js
Trip-Buddy\src\models\user.model.js
Trip-Buddy\src\utils\profileValidation.js
Trip-Buddy\src\utils\sendToken.js
Trip-Buddy\src\middleware\auth.js
```

Completed:

- Registration now requires:
  - `username`
  - `displayName`
  - `email`
  - `password`
  - `dateOfBirth`

- Password validation now requires:
  - at least 8 characters
  - at least one letter
  - at least one number

- Age validation added:
  - default minimum age is `13`
  - configurable with `MINIMUM_USER_AGE`
  - stores `dateOfBirth`
  - stores `ageVerifiedAt`
  - stores `isMinor`

- Auth responses now include:

```json
{
  "requiresOnboarding": true,
  "requiresAgeVerification": false,
  "isMinor": false
}
```

### 5. User Onboarding Backend

Backend endpoint:

```txt
PUT /api/v1/auth/onboarding
```

Required payload:

```json
{
  "travelPersonality": "adventurer",
  "budgetStyle": "mid_range",
  "travelInterests": ["beaches", "food", "hidden gems"],
  "homeCity": "Delhi"
}
```

Supported `travelPersonality` values:

```txt
adventurer
planner
foodie
culture_seeker
luxury
budget_backpacker
digital_nomad
relaxed_explorer
```

Supported `budgetStyle` values:

```txt
budget
mid_range
premium
luxury
```

### 6. User Onboarding Frontend

Frontend files:

```txt
TripBuddy_Final\TripBuddyFinal\App.js
TripBuddy_Final\TripBuddyFinal\src\context\AuthContext.js
TripBuddy_Final\TripBuddyFinal\src\screens\Auth\OnboardingScreen.js
```

Completed:

- App now checks `requiresOnboarding` and `requiresAgeVerification`.
- If either is true, the app shows onboarding before allowing normal app access.
- Existing users missing age verification can enter date of birth during onboarding.
- Onboarding saves to backend and updates local app state.

### 7. Registration Frontend Binding

Frontend file:

```txt
TripBuddy_Final\TripBuddyFinal\src\screens\Auth\RegisterScreen.js
```

Completed:

- Register screen now collects:
  - username
  - display name
  - email
  - phone number
  - date of birth
  - password
  - travel personality
  - budget style
  - travel interests

- Register payload now matches backend requirements.

### 8. Journey/Post Creation Guards

Backend files:

```txt
Trip-Buddy\src\middleware\auth.js
Trip-Buddy\src\routes\journey.routes.js
Trip-Buddy\src\routes\stop.routes.js
```

Completed:

- Journey creation requires:

```txt
JWT auth
age verification
completed onboarding
```

- Post/stop creation requires:

```txt
JWT auth
age verification
completed onboarding
```

If a user is incomplete, backend returns a clear `403` message.

### 9. Post API Alias

The existing backend stores journey timeline posts as `Stop` documents. For product clarity, a `/posts` API alias has been added.

Backend file:

```txt
Trip-Buddy\src\routes\post.routes.js
```

Mounted in:

```txt
Trip-Buddy\src\app.js
```

Available aliases:

```txt
POST   /api/v1/posts
GET    /api/v1/posts/journey/:journeyId
GET    /api/v1/posts/:id
PUT    /api/v1/posts/:id
DELETE /api/v1/posts/:id
POST   /api/v1/posts/:id/react
POST   /api/v1/posts/:id/comments
POST   /api/v1/posts/:id/save
```

Frontend file:

```txt
TripBuddy_Final\TripBuddyFinal\src\services\api\post.service.js
```

The app can now use `postService` while the backend keeps the proven `Stop` model internally.

### 10. Create Post Frontend Binding

Frontend file:

```txt
TripBuddy_Final\TripBuddyFinal\src\screens\Trip\CreateStopScreen.js
```

Completed:

- Screen now uses:

```txt
postService.createPost(formData)
```

- Backend errors are shown directly to users, including onboarding/age guard messages.

## Current Core Data Flow

### Registration

```txt
RegisterScreen
  -> AuthContext.register()
  -> authService.register()
  -> POST /api/v1/auth/register
  -> backend validates username/email/password/dateOfBirth
  -> backend creates User
  -> backend returns token + user flags
  -> AuthContext stores token/user in AsyncStorage
```

### Login

```txt
LoginScreen
  -> AuthContext.login()
  -> authService.login()
  -> POST /api/v1/auth/login
  -> backend returns token + user flags
  -> app opens main app or onboarding based on flags
```

### Onboarding

```txt
OnboardingScreen
  -> AuthContext.completeOnboarding()
  -> PUT /api/v1/auth/update-profile if dateOfBirth is needed
  -> PUT /api/v1/auth/onboarding
  -> backend stores interests/personality/budget
  -> frontend updates local user
  -> AppNavigator unlocks
```

### Journey Creation

```txt
CreateJourneyScreen
  -> journeyService.createJourney()
  -> POST /api/v1/journeys
  -> backend checks auth + age + onboarding
  -> backend creates Journey + LiveSession
```

### Post Creation

```txt
CreateStopScreen
  -> postService.createPost()
  -> POST /api/v1/posts
  -> backend checks auth + age + onboarding
  -> backend saves Stop document
  -> backend emits Socket.io journey:new_stop event
```

### Journey Map

```txt
JourneyDetailScreen
  -> journeyService.getJourney()
  -> journeyService.getJourneyMap()
  -> LeafletMap renders route + markers
```

## Current API Contract Examples

### Register

```json
POST /api/v1/auth/register
{
  "username": "manish",
  "displayName": "Manish Singh",
  "email": "manish@example.com",
  "password": "Password123",
  "dateOfBirth": "2000-01-01",
  "phoneNumber": "9999999999",
  "travelPersonality": "adventurer",
  "budgetStyle": "mid_range",
  "travelInterests": ["beaches", "food", "nightlife"]
}
```

### Complete Onboarding

```json
PUT /api/v1/auth/onboarding
{
  "travelPersonality": "foodie",
  "budgetStyle": "premium",
  "homeCity": "Delhi",
  "travelInterests": ["cafes", "local food", "hidden gems"]
}
```

### Create Journey

```json
POST /api/v1/journeys
{
  "title": "Delhi to Goa",
  "description": "First cinematic group trip",
  "emoji": "✈️",
  "tags": ["goa", "friends"],
  "visibility": "friends",
  "startLocationName": "Delhi",
  "startLat": 28.6139,
  "startLng": 77.209,
  "endLocationName": "Goa",
  "broadcastDelayMinutes": 0,
  "showOnLiveGlobe": true
}
```

### Create Post

```txt
POST /api/v1/posts
Content-Type: multipart/form-data

journeyId
transportMode
lat
lng
caption
locationName
media
```

## Important Product Decision

The internal Mongo model still calls journey posts `Stop`.

That is acceptable for the MVP because a TripBuddy post is not a generic social post. It is a geo-timestamped journey memory. The frontend can use the clearer word `Post`, while backend keeps the stable `Stop` model.

Recommended future cleanup:

```txt
Stop model -> JourneyPost model
stops routes -> posts routes only
CreateStopScreen -> CreatePostScreen
```

Do this after MVP flows are stable.

## Verification Already Run

Backend:

```txt
node --check src\utils\profileValidation.js
node --check src\models\user.model.js
node --check src\controllers\auth.controller.js
node --check src\middleware\auth.js
node --check src\routes\post.routes.js
node --check src\app.js
node -e "require('./src/app')"
```

Frontend:

```txt
npx expo export --platform web --output-dir .expo-web-check
```

The export succeeded after the latest data-binding changes. The temporary `.expo-web-check` folder was removed after verification.

## Known Caveats

- This repo is not currently using Prisma/PostgreSQL even though the original architecture plan mentioned it.
- Existing older users may not have `dateOfBirth` or `onboardingCompletedAt`. The frontend onboarding gate now handles this.
- The app has several mojibake/encoding artifacts in visible strings from older files. These should be cleaned before a polished demo.
- Some frontend screens still use older names such as `CreateStopScreen`. The API now supports `posts`, but UI naming cleanup remains.
- Git status could not be inspected earlier because the repos are marked as dubious ownership on this Windows machine.

## Next Recommended Modules

### Module 1: Journey + Post Timeline Polish

- Rename user-facing stop labels to post/memory.
- Add better empty states.
- Add timeline refresh after creating a post.
- Add post detail media carousel.
- Add optimistic UI for comments/reactions.

### Module 2: Profile Binding

- Bind profile screen to real `/auth/me` and `/users/:username`.
- Show travel personality, interests, budget style, stats.
- Add edit profile form for onboarding fields.

### Module 3: Chat Binding

- Verify channels/messages API against frontend screens.
- Ensure journey group chat is automatically created or linked.
- Add socket room join/leave behavior per journey.

### Module 4: Explore Feed

- Connect explore feed to public journeys, reels, and nearby stops.
- Add map cards with Leaflet coordinates.

### Module 5: Production QA

- Add seed script for demo users/journeys/posts.
- Add Postman/Thunder Client collection.
- Add `.env.example` updates for `MINIMUM_USER_AGE`, Mongo, JWT, Cloudinary, OpenWeather.
- Add backend integration tests for auth/onboarding/post guards.

## Demo Flow To Test

```txt
1. Register with dateOfBirth, travel personality, budget, interests.
2. Confirm app enters main navigator without onboarding.
3. Create a journey.
4. Open journey detail and confirm Leaflet map renders.
5. Add a post with current location and optional media.
6. Return to journey timeline and map.
7. Confirm backend rejects journey/post creation if onboarding or age verification is missing.
```
