# 🐝 StudyHive: Gamified Pixel-Art Co-Working Study App

> A cozy 16-bit library aesthetic co-working space featuring Pomodoro focus desks, honey drop rewards, customizable pixel avatars, real-time hives, friend chat, break mini-games, and lo-fi tunes.

---

## 🍯 Palette & Aesthetics
- **Honey-Gold & Warm Cream**: Accent gold (`#F59E0B`), warm amber (`#D97706`), parchment cream (`#FFFBEB`), and rich library oak (`#451A03`).
- **Pixel Typography**: Retro headers powered by `Press Start 2P`, retro statistics with `VT323`, and clean legible tasks with `Courier Prime`.
- **Chunky Pixel Borders**: 3px - 4px solid borders with crisp pixel drop-shadows and tactile click feedback.
- **Pixel Bee Mascot**: Handcrafted SVG pixel bee with fluttering wings and cozy animations.

---

## 🚀 Monorepo Architecture

```
studyhive/
├── client/              # React 18 + Vite + Tailwind CSS + Lucide Icons
│   ├── src/
│   │   ├── components/  # Pixel components, Auth, Desks, Timer, Tasks, Avatar, Games, Lo-Fi, Chatbot, Admin
│   │   ├── context/     # AuthContext, SocketContext, TimerContext
│   │   ├── services/    # api.js & socket.js client wrappers
│   │   └── styles/      # index.css (custom pixel borders & textures)
│   └── .env.example
├── server/              # Node.js + Express + Mongoose + Socket.io
│   ├── src/
│   │   ├── config/      # db.js (with automatic in-memory MongoDB fallback)
│   │   ├── controllers/ # auth, session, hive, friend, chat, admin, ai
│   │   ├── middleware/  # authMiddleware, adminMiddleware
│   │   ├── models/      # User, Session, Hive, FriendRequest, Message
│   │   └── server.js    # Express & Socket.io server
│   └── .env.example
├── package.json         # Root runner scripts
└── README.md
```

---

## 🛠️ Setup & Installation

### Prerequisites
- Node.js (v18+)
- npm (v9+)
- *(Optional)* MongoDB instance running locally (the server automatically boots an in-memory MongoDB instance if local MongoDB is not found, so you can test immediately without setup hurdles!).

### 1. Install Dependencies
```bash
# In the repository root
npm run install:all
```

### 2. Environment Configuration
Both `/client` and `/server` have `.env.example` templates:

**Server (`/server/.env`):**
```env
PORT=5000
MONGODB_URI=mongodb://127.0.0.1:27017/studyhive
JWT_SECRET=studyhive_super_secret_jwt_key_cozy_library_2026
CLIENT_URL=http://localhost:5173
NODE_ENV=development
```

**Client (`/client/.env`):**
```env
VITE_API_URL=http://localhost:5000
```

### 3. Running the App
Run both client and server concurrently:
```bash
npm run dev
```

Or run them in dedicated terminal tabs:
```bash
# Terminal 1: Backend Server
cd server
npm run dev

# Terminal 2: Frontend Client
cd client
npm run dev
```

- **Frontend**: [http://localhost:5173](http://localhost:5173)
- **Backend API**: [http://localhost:5000/api/health](http://localhost:5000/api/health)

---

## 🌟 Core Features Breakdown

1. **Pixel Bitmoji Avatar & Honey Rewards**
   - Earn **Honey Drops** (`🍯`) and **XP** (`⭐`) for completing focus intervals and tasks.
   - Mix-and-match hair, sweaters, bee antennae, round glasses, and library desk decorations.
2. **Library Study Desks & Pomodoro Timer**
   - Pick your spot: *Grand Oak Table*, *Window Alcove*, *Fireplace Nook*, or *Bookshelf Hideaway*.
   - Customizable focus and break intervals, audio chimes, and checklist task manager.
3. **Real-Time Group Hives & Friend-Only Chat**
   - Join co-working rooms via Socket.io. See other avatars studying at adjacent desks in real time.
   - Send and accept friend requests. Chat is strictly enabled only between confirmed friends to prevent distractions.
4. **Strict Break Mini-Games & Lo-Fi Cassette Player**
   - Play **Memory Match** or **2048** — locked during focus time and unlocked only when the break timer is ticking.
   - Ambient player with cozy rain, coffee shop sounds, and lo-fi study beats.
5. **Study Assistant Chatbot & Admin Dashboard**
   - Floating pixel bee assistant providing study advice, breakdown tips, and motivation.
   - Admin moderation interface to inspect active hives, session metrics, and manage users.

---

## 📸 Screenshots & UI Showcase

*(Screenshots captured during live browser test sessions)*

- **Cozy Landing & Library Card Auth**
- **Interactive Library Desks & Pomodoro Timer**
- **Modular Pixel Avatar Maker & Honey Shop**
- **Real-Time Study Hive with Desks**
- **Break Time Mini-Games (Memory Match & 2048)**
- **StudyHive Assistant & Admin Dashboard**
