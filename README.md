# My Browser (Electron + React)

A modern, minimal desktop web browser built with Electron and React, featuring multi-tab UI, smart address bar, persistent bookmarks, and a dynamic "Top Stories" start page.

## ✨ Features
- Multi-tab browsing with favicon detection and keyboard shortcuts
- Address bar with suggestions, search-engine selection, and URL normalization
- Bookmarks with title + favicon enrichment (MongoDB) and offline local fallback
- Start page with rotating Top Stories aggregated from multiple RSS sources
- Light/Dark theme toggle with persistence
- Electron production mode with clean User-Agent for site compatibility

## 🧱 Tech Stack
- Desktop: Electron (main + preload)
- UI: React + CSS (no heavy UI framework)
- Backend: Node + Express + MongoDB (Mongoose)
- Feeds: rss-parser

## 🚀 Getting Started

### Prerequisites
- Node.js 18+ (recommended LTS)
- MongoDB (local or Atlas). Example connection string:
  - `mongodb://localhost:27017/mybrowser` (local)

### Environment
Create `config/.env` file:
```
MONGO_URI=mongodb://localhost:27017/mybrowser
NODE_ENV=development
```

### Install
From project root:
```
# install root, backend, renderer deps
npm run install-all
```

### Run (development)
```
# starts backend (http://localhost:5000) and React (http://localhost:3000)
npm run start
```
Electron can be launched separately in another terminal once React dev server is up:
```
npm run electron
```

### Build (production)
```
# build React production bundle
npm run build

# then start Electron which serves the built app
npm run electron
```

## 🧭 Keyboard Shortcuts
- Ctrl+T: New tab
- Ctrl+W: Close current tab
- Ctrl+L: Focus address bar
- Ctrl+,: Open settings (state-backed; UI can be extended)

## 🔖 Bookmarks
- Clicking "Bookmark" saves the current URL
- When backend is reachable, bookmarks persist to MongoDB with title + favicon
- If backend is down, bookmarks are saved to `localStorage` and still appear in the list; they’ll sync once the API is available

## 📰 Top Stories
- Aggregated from multiple RSS sources (Google News, BBC, NYT)
- Categorized via smart heuristics (Technology, Business, Science, Entertainment)
- Auto-rotates highlights every 8 seconds and refreshes every minute

## 🔌 API
Base URL: `http://localhost:5000`
- `GET /api/bookmarks` – list bookmarks
- `POST /api/bookmarks` – create `{ url }`
- `DELETE /api/bookmarks/:id` – delete by id
- `GET /api/news` – aggregated news items `{ items: [{ title, link, pubDate, source }] }`

## 🔒 Iframe Restrictions
Many sites disallow embedding in iframes. The app detects common restricted domains and opens them externally (default browser) seamlessly to avoid user interruptions.

## 🗂️ Project Structure
```
backend/        # Express API, Mongo, RSS
renderer/       # React UI
electron/       # Electron main process
preload/        # Safe IPC bridge
config/.env     # Environment variables (not committed)
```

## 🧪 Troubleshooting
- Port 5000 in use: stop the running server or change `PORT`
- Mongo not running: start MongoDB or update `MONGO_URI`
- "Refused to connect" pages: expected for sites that block iframes; app opens them externally

## 📦 Scripts (root)
- `npm run install-all` – install all deps (root, backend, renderer)
- `npm run start` – start backend and renderer concurrently
- `npm run server` – start backend only
- `npm run build` – build renderer for production
- `npm run electron` – launch Electron

---
