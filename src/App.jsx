import React from "react";
import { Routes, Route } from "react-router-dom";
import Home from "./Pages/Home";
import About from "./Pages/aboutus";
import Contact from "./Pages/contact";
import Navbar from "./components/Navbar";
import Sidebar from "./components/Sidebar";
import Login from "./Pages/login";
import Signin from "./Pages/sigin";
import Player from "./components/Player";
import Favourites from "./Pages/Favourites";
import LikedSongs from "./Pages/LikedSongs";
import MyPlaylist from "./Pages/MyPlaylist";
import Search from "./Pages/Search";
import Artist from "./Pages/Artist";
import { PlayerProvider } from "./context/PlayerContext";
import { AuthProvider } from "./context/AuthContext";
import { LibraryProvider } from "./context/LibraryContext";
import './App.css';

function App() {
  return (
    <AuthProvider>
      <LibraryProvider>
        <PlayerProvider>
          <div className="app-container">
            <div className="navbar">
              <Navbar />
            </div>
            <div className="main-layout">
              <Sidebar />
              <main className="content-area">
                <Routes>
                  <Route path="/" element={<Home />} />
                  <Route path="/about" element={<About />} />
                  <Route path="/contact" element={<Contact />} />
                  <Route path="/login" element={<Login />} />
                  <Route path="/signin" element={<Signin />} />
                  <Route path="/favourites" element={<Favourites />} />
                  <Route path="/liked" element={<LikedSongs />} />
                  <Route path="/playlists" element={<MyPlaylist />} />
                  <Route path="/search" element={<Search />} />
                  <Route path="/artist/:name" element={<Artist />} />
                </Routes>
              </main>
            </div>
            <Player />
          </div>
        </PlayerProvider>
      </LibraryProvider>
    </AuthProvider>
  );
}

export default App;
