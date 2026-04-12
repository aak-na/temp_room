# temp_room 💬

> A real-time temporary chat app — create a session, share a link, chat instantly, and it disappears when you're done.

**🚧 Building this in 7 days — follow the daily progress on [LinkedIn](https://www.linkedin.com/in/nambu-aakash-narayan-297440225/)**

---

## What is this?

temp_room lets you start a private chat session in seconds.

- You hit **Create Session** and get a unique link + code
- Share that link with anyone
- They open it, type a name, and join instantly
- You chat in real-time — no accounts, no sign up, nothing saved
- The session **auto-terminates after 10 minutes of silence**, or you can end it manually
- When it's over, everything is gone

No data stored. No history. Just a temporary room that disappears.

---

## Tech Stack

| Layer | Technology |
|---|---|
| Frontend | React + Vite |
| Backend | Node.js + Express |
| Real-time | Socket.io |
| Database | MongoDB + Mongoose |
| Hosting | Render (free tier) |
| DB Hosting | MongoDB Atlas (free tier) |

---

## Features

- ✅ Create a session — get a unique shareable link and code
- ✅ Join via link or by entering the session code
- ✅ Real-time messaging with Socket.io rooms
- ✅ Multiple sessions run in parallel, completely isolated
- ✅ Typing indicator — see when the other person is typing
- ✅ Online user count per session
- ✅ Auto-terminate after 10 minutes of inactivity
- ✅ Manual "End Session" button
- ✅ Mobile responsive UI
- ✅ No accounts, no login, no data stored permanently

---

## How Sessions Work

Each session is a **Socket.io room** identified by a unique UUID.

```
User A creates session  →  room: "abc-123-xyz" is created
User B joins via link   →  joins room "abc-123-xyz"
Messages sent           →  only delivered inside "abc-123-xyz"
10 min no messages      →  server closes the room automatically
```

Multiple sessions can run on the same server simultaneously — they never interfere with each other.

---

## Project Structure

```
temp_room/
├── client/                 # React frontend
│   ├── src/
│   │   ├── pages/
│   │   │   ├── Home.jsx        # Create or join a session
│   │   │   ├── ChatRoom.jsx    # The chat UI
│   │   │   └── SessionEnded.jsx
│   │   ├── App.jsx
│   │   └── main.jsx
│   └── package.json
│
├── server/                 # Node.js + Express backend
│   ├── models/
│   │   ├── Session.js      # Mongoose session model
│   │   └── Message.js      # Mongoose message model
│   ├── routes/
│   │   └── session.js      # REST API routes
│   ├── socket/
│   │   └── socketHandler.js # All Socket.io logic
│   ├── index.js            # Entry point
│   └── package.json
│
└── README.md
```

---

## Getting Started (Run Locally)

### Prerequisites
- Node.js v18+
- A free [MongoDB Atlas](https://www.mongodb.com/atlas) account

### 1. Clone the repo

```bash
git clone https://github.com/aak-na/temp_room.git
cd temp_room
```

### 2. Set up the server

```bash
cd server
npm install
```

Create a `.env` file inside `server/`:

```env
PORT=5000
MONGO_URI=your_mongodb_atlas_connection_string
CLIENT_URL=http://localhost:5173
```

Start the server:

```bash
npm run dev
```

### 3. Set up the client

```bash
cd client
npm install
npm run dev
```

### 4. Open the app

Go to `http://localhost:5173` in your browser.
Open a second tab, create a session in one, join in the other — you're chatting.

---

## Deployment

- **Backend** — deployed on [Render](https://render.com) free tier (Web Service)
- **Frontend** — served as static files from Express (`dist/` folder after `npm run build`)
- **Database** — [MongoDB Atlas](https://www.mongodb.com/atlas) free cluster (512MB)

> Note: Render free tier spins down after 15 minutes of inactivity. First load after sleep takes ~30 seconds.

---

## 7-Day Build Log

| Day | What I built | Status |
|---|---|---|
| Day 1 | Project setup, MongoDB connected, Express running | ✅ Done |
| Day 2 | Socket.io integration, session creation API | 🔄 In progress |
| Day 3 | Real-time messaging between users | ⏳ Upcoming |
| Day 4 | Auto-terminate, End Session button, user count | ⏳ Upcoming |
| Day 5 | Full UI polish, React Router, mobile responsive | ⏳ Upcoming |
| Day 6 | Deploy to Render, fix CORS, live testing | ⏳ Upcoming |
| Day 7 | Edge case testing, README, final cleanup | ⏳ Upcoming |

---

## Live Demo

🔗 Coming on Day 6 — link will be posted here and on LinkedIn.

---

## Author

**aak-na**
- GitHub: [@aak-na](https://github.com/aak-na)
- Building in public — follow the daily updates on LinkedIn

---

## License

MIT — free to use, fork, and learn from.