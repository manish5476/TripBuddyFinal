# 🧳 Trip Buddy — React Native App

Complete travel buddy finder app built with **Expo + React Native**, connected to **Node.js + MongoDB** backend.

---

## ✅ Prerequisites

Install these before starting:

1. **Node.js** (v18+) → https://nodejs.org
2. **Expo CLI** → `npm install -g expo-cli`
3. **Expo Go app** on your phone → Search "Expo Go" on Play Store / App Store

---

## 🚀 Setup — 3 Steps

### Step 1 — Install dependencies

```bash
cd TripBuddy
npm install --legacy-peer-deps
```

### Step 2 — Configure your backend URL

Open `src/constants/index.js` and update `BASE_URL`:

```js
// Android Emulator
BASE_URL: 'http://10.0.2.2:5000/api'

// iOS Simulator
BASE_URL: 'http://localhost:5000/api'

// Physical Device (find your PC IP with `ipconfig` on Windows or `ifconfig` on Mac)
BASE_URL: 'http://192.168.1.XXX:5000/api'
```

### Step 3 — Start the app

```bash
npx expo start
```

Then:
- **Phone** → Scan QR code with Expo Go app
- **Android Emulator** → Press `a`
- **iOS Simulator** → Press `i`

---

## 📁 Project Structure

```
TripBuddy/
├── App.js                          ← Root entry point
├── app.json                        ← Expo configuration
├── package.json                    ← Dependencies
├── babel.config.js                 ← Babel config
├── .env                            ← Environment variables
│
└── src/
    ├── constants/
    │   └── index.js                ← 🔧 Colors, API URL, Endpoints
    │
    ├── context/
    │   └── AuthContext.js          ← Global auth state (JWT)
    │
    ├── services/
    │   ├── apiClient.js            ← Axios instance + interceptors
    │   ├── index.js                ← All API service functions
    │   └── socketService.js        ← Socket.io real-time chat
    │
    ├── navigation/
    │   └── AppNavigator.js         ← Drawer + Bottom Tabs + Stack
    │
    ├── components/
    │   ├── common/
    │   │   ├── Header.js           ← App header
    │   │   └── Sidebar.js          ← Drawer sidebar
    │   └── map/
    │       └── LeafletMap.js       ← FREE Leaflet + OpenStreetMap
    │
    ├── utils/
    │   └── helpers.js              ← Utility functions
    │
    └── screens/
        ├── Auth/
        │   ├── LoginScreen.js      ✅ Connected to POST /auth/login
        │   └── RegisterScreen.js   ✅ Connected to POST /auth/register
        ├── Home/
        │   ├── HomeScreen.js       ✅ Connected to GET /trips/my
        │   └── ExploreMapScreen.js ✅ Leaflet map with destinations
        ├── Trip/
        │   ├── MyTripsScreen.js    ✅ Connected to GET /trips/my
        │   ├── CreateTripScreen.js ✅ Connected to POST /trips
        │   └── TripDetailScreen.js ✅ Connected to GET /trips/:id
        ├── Buddy/
        │   ├── FindBuddiesScreen.js  ✅ Connected to GET /buddies/find
        │   └── BuddyProfileScreen.js ✅ Connected to POST /buddies/request
        ├── Chat/
        │   ├── ChatListScreen.js   ✅ Connected to GET /chat/rooms
        │   └── ChatRoomScreen.js   ✅ Socket.io real-time messages
        ├── Expenses/
        │   └── ExpensesScreen.js   ✅ Connected to GET/POST /expenses
        └── Profile/
            └── ProfileScreen.js    ✅ Connected to PUT /users/update
```

---

## 🔌 Backend API Expected

Your Node.js backend should have these routes:

### Auth
```
POST   /api/auth/login           → { email, password } → { token, user }
POST   /api/auth/register        → { name, email, password } → { token, user }
POST   /api/auth/logout
GET    /api/auth/me              → { user }
```

### Trips
```
GET    /api/trips/my             → { trips: [...] }
GET    /api/trips/:id            → { trip: {...} }
POST   /api/trips                → { destination, startDate, endDate, budget, maxMembers, tripType, description }
PUT    /api/trips/:id
DELETE /api/trips/:id
```

### Buddies
```
GET    /api/buddies/find         → { buddies: [...] }  (query: destination, startDate)
POST   /api/buddies/request      → { userId }
GET    /api/buddies/matches      → { matches: [...] }
```

### Chat
```
GET    /api/chat/rooms           → { rooms: [...] }
GET    /api/chat/:roomId/messages → { messages: [...] }
POST   /api/chat/:roomId/send   → { text }
```

### Expenses
```
GET    /api/expenses/:tripId     → { expenses: [...] }
POST   /api/expenses             → { tripId, description, amount, category, paidBy, splitAmong }
DELETE /api/expenses/:id
```

### Users
```
GET    /api/users/profile        → { user }
PUT    /api/users/update         → { name, city, bio, interests, travelStyle }
```

---

## 🗺️ Map — FREE, No API Key

Uses **Leaflet.js + OpenStreetMap** inside a WebView.
- 100% free forever
- No API key needed
- Works offline with cached tiles

---

## 💡 Demo Mode

All screens fall back to sample data if backend is not connected. So you can **run the app and see all screens** without a backend first.

---

## 📦 Tech Stack

| Layer        | Technology                      |
|--------------|---------------------------------|
| Mobile       | Expo + React Native             |
| Navigation   | React Navigation v7 (Drawer + Tabs + Stack) |
| Maps         | Leaflet.js + OpenStreetMap (FREE) |
| State        | React Context + AsyncStorage    |
| HTTP         | Axios + JWT interceptors        |
| Real-time    | Socket.io                       |
| Backend      | Node.js + Express.js            |
| Database     | MongoDB + Mongoose              |

---

*Built with ❤️ for travellers*
