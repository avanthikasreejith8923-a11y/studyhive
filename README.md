# 🐝 StudyHive: Cozy Gamified Pixel Library Co-Working

StudyHive is a cozy, gamified 16-bit co-working application designed to transform study and deep work into an engaging, collaborative experience. Inspired by retro pixel RPG aesthetics, warm libraries, and the gentle buzz of productivity, StudyHive allows students and scholars to take a seat at interactive library desks, run Pomodoro timers, manage session goals, earn sweet Honey drops and XP, customize their pixel avatar, team up in real-time multiplayer "Hives", play unlockable break mini-games, and get instant study guidance from an integrated AI assistant.

---

## 📸 Screenshots & Visual Tour

### 🏛️ The Archival Library Hall & Desk Focus
| The Archival Study Hall | Claim Desk & Focus Mode Target |
| :---: | :---: |
| ![The Archival Study Hall](./screenshots/library-room.png) | ![Claim Desk and Focus Target](./screenshots/desk-focus.png) |
| *Interactive 5-desk library hall with active timers and goal tracking* | *Choose your subject and configure focus blocks (15 to 60 minutes)* |

### 🐝 Landing & Scholar Authentication
| Cozy Retro Landing Page | Library Pass Sign-In & Demo Access | New Scholar Registration |
| :---: | :---: | :---: |
| ![StudyHive Landing Page](./screenshots/landing-page.png) | ![Library Pass Sign-In](./screenshots/auth-login.png) | ![New Scholar Registration](./screenshots/auth-register.png) |
| *Retro 16-bit entrance & theme* | *Pass sign-in with 1-click test accounts* | *Get your library card + 50 honey bonus* |

### 🤖 Scholar AI Assistant & Additional Features
| StudyHive Scholar AI Assistant | Feature Views & Galleries |
| :---: | :---: |
| ![StudyHive Scholar AI Assistant](./screenshots/study-assistant.png) | *Additional visual galleries:*<br>• [Avatar Wardrobe & Shop](./screenshots/avatar-shop.png)<br>• [Real-Time Study Hives](./screenshots/hive-room.png)<br>• [Friends & Direct Messaging](./screenshots/friends-chat.png)<br>• [Pomodoro Break Mini-Games](./screenshots/break-games.png)<br>• [Head Librarian Admin Dashboard](./screenshots/admin-dashboard.png)<br>• [Scholar Study Logbook](./screenshots/scholar-logbook.png) |
| *Floating AI study assistant powered by Claude* | *Interactive features and customization views* |


---

## ✨ Features

### 🔐 Authentication & Accounts
- **Secure Registration & Login:** JWT-based authentication with bcrypt password hashing (minimum 10 salt rounds).
- **Hardened Security:** Passwords excluded from database queries (`select: false`), robust input validation and sanitization, and rate-limited endpoints.
- **Role-Based Access Control:** Differentiated roles for scholars and administrators ("Head Librarians").

### 📖 Study Sessions & Desks
- **Interactive Cozy Library:** Choose from thematic library spots like *The Window Alcove*, *The Grand Oak Table*, *The Fireplace Hearth*, *The Bookshelf Nook*, and *The Botanical Corner*.
- **Focused Desk "Zoom-In" View:** Clicking an open desk transitions into an immersive personal study nook with ambient lighting, timer controls, goals, and desk decor.
- **Customizable Pomodoro Timer:** Configurable focus blocks (15, 25, 45, 60 minutes) and short/long break intervals with gentle 8-bit web audio chimes.
- **Session Goals Checklist:** Real-time checklist manager with progress bar and completion metrics.
- **Scholar Study Logbook:** Historical record of completed study sessions with duration, earned rewards, dates, and pagination.

### 🍯 Rewards, Leveling & Pixel Avatars
- **Honey Drops & XP Currency:** Earn honey drops (`🍯`) and experience points (`⭐`) for staying focused; early departures yield partial rewards.
- **Customizable Pixel Character:** Stylized retro pixel avatar with customizable hair, cozy sweaters, antennae, round glasses, and desk decorations.
- **Library Wardrobe & Shop:** Unlock accessories, hairstyles, outfits, and desk plants using earned Honey drops.

### 🐝 Hives & Social Co-Working
- **Multiplayer Study Hives:** Real-time co-working rooms powered by Socket.io with synchronized group timers and join codes.
- **Atomic Desk Seating:** Concurrency-safe check-and-set desk claiming prevents seat collisions.
- **Presence & Multi-Tab Grace:** Live online/in-hive status tracking with a 5-second reconnect grace window.
- **Distraction-Free Direct Messaging:** Friend request system where private chat is strictly restricted to mutual friends.

### 🎮 Break Mini-Games & Ambient Lo-Fi
- **Strict Break Interval Unlocking:** Mini-games remain locked during focus mode and automatically unlock during Pomodoro breaks.
- **Memory Match & 2048 Honey Tiles:** Playable retro games that automatically pause gracefully when focus time resumes.
- **Lo-Fi Audio Player:** Integrated ambient player with rainy window sounds, fireplace crackles, coffee shop background noise, and soothing study beats.

### 🎓 AI Study Assistant & Admin Console
- **StudyHive Scholar AI Chatbot:** In-app floating assistant powered server-side by the Anthropic Claude API for study techniques, problem breakdowns, and Pomodoro planning.
- **Librarian Admin Dashboard:** Dedicated administrative console to monitor real-time platform metrics, inspect and moderate active study hives, and manage scholar accounts.

---

## 💻 Tech Stack

### Frontend (Client)
- **Framework:** React 18 (SPA)
- **Build Tool:** Vite 6
- **Styling:** Tailwind CSS + Vanilla CSS pixel styling tokens
- **Typography:** Google Fonts (`Press Start 2P`, `VT323`, `Inter`)
- **Real-Time WebSockets:** Socket.io Client
- **Icons:** Lucide React
- **Celebrations:** Canvas Confetti

### Backend (Server)
- **Runtime:** Node.js (ES Modules)
- **Server Framework:** Express 5
- **Database & ODM:** MongoDB & Mongoose 9
- **In-Memory Fallback:** `mongodb-memory-server` (automatic zero-config fallback for local development)
- **Real-Time Server:** Socket.io 4
- **Security & Validation:** `jsonwebtoken`, `bcryptjs`, `express-rate-limit`, `express-validator`, `cors`
- **AI Integration:** Anthropic API (Claude)

---

## 🚀 Getting Started

### Prerequisites
- [Node.js](https://nodejs.org/) (v18.x or higher)
- [npm](https://www.npmjs.com/) (v9.x or higher)
- *(Optional)* Local [MongoDB](https://www.mongodb.com/) instance (if MongoDB is not running locally on port 27017, the server will automatically launch an in-memory database).

### 1. Clone the Repository
```bash
git clone https://github.com/your-username/studyhive.git
cd studyhive
```

### 2. Install Dependencies
Install dependencies for both client and server:
```bash
# In the root directory:
npm run install:all

# Or individually:
cd server && npm install
cd ../client && npm install
```

### 3. Configure Environment Variables

Create `.env` files in both the `server` and `client` directories based on the provided examples:

#### Server Configuration (`server/.env`):
```env
PORT=
MONGODB_URI=
JWT_SECRET=
CLIENT_URL=
NODE_ENV=
ANTHROPIC_API_KEY=
```
> **Note:** If `ANTHROPIC_API_KEY` is not provided, the server will continue running normally and the study assistant widget will display a friendly offline configuration banner.

#### Client Configuration (`client/.env`):
```env
VITE_API_URL=
```

### 4. Run the Application

You can launch both server and client concurrently from the project root:
```bash
npm run dev
```

Alternatively, run each in dedicated terminal windows:
```bash
# Terminal 1: Backend Server (default: http://localhost:5000)
cd server
npm run dev

# Terminal 2: Frontend Client (default: http://localhost:5173)
cd client
npm run dev
```

- **Frontend App:** [http://localhost:5173](http://localhost:5173)
- **Backend Health Check:** [http://localhost:5000/api/health](http://localhost:5000/api/health)

---

## 👑 Promoting a User to Admin

To grant a user administrative privileges (Head Librarian role) to access `/admin`:

1. Ensure the user has registered an account through the app.
2. In your terminal, navigate to the `server/` directory and run the admin promotion script with the user's username or email:
   ```bash
   cd server
   node scripts/makeAdmin.js <username_or_email>
   ```
3. Example:
   ```bash
   node scripts/makeAdmin.js scholar123
   ```
4. Once promoted, the user will see an **Admin** badge in the navigation bar upon logging in, granting access to the moderation console.

---

## 📄 License

This project is licensed under the [MIT License](LICENSE). You are free to use, modify, and distribute this software in personal and commercial projects.
