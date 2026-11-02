# HMusic: Development Version

The working development copy of **HMusic**, a full-stack music streaming and discovery app built with React, Node.js, Express and MongoDB.

> 📖 Full documentation (features, architecture and API reference) lives in the main repository: **[music_project](https://github.com/namaysingh3925/music_project)**.

## Features

- Search tracks and artists, with artist pages showing top tracks
- Audio previews in a persistent player
- Sign up and log in with hashed passwords and JWT
- Liked songs, favourite artists and custom playlists
- Optional Spotify sign-in (OAuth PKCE)

## Tech stack

| Frontend | Backend |
|---|---|
| React 19, Vite, React Router 7 | Node.js, Express |
| Context API for player / auth state | MongoDB with Mongoose |
| Plain CSS (dark theme) | JWT auth middleware |

## Run it locally

```bash
# 1. Backend
cd backend
cp .env.example .env      # then fill in JWT_SECRET (any long random string)
npm install
npm start

# 2. Frontend (in a new terminal, from the project root)
cp .env.example .env      # add your Spotify client ID if you use Spotify login
npm install
npm run dev
```

MongoDB needs to be running locally (`mongodb://127.0.0.1:27017`), or put a MongoDB Atlas connection string in `MONGO_URI`.
