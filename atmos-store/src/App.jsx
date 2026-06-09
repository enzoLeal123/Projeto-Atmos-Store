import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Login from './components/Login/Login';
import Store from './components/Store/Store';
import Library from './components/Library/Library';
import GameDetails from './components/GameDetails/GameDetails.jsx';
import CreateGame from './components/CreateGame/CreateGame.jsx';
import Profile from './components/Profile/Profile.jsx';

function RotaProtegida({ children }) {
  const token = localStorage.getItem('atmos_token');
  if (!token) return <Navigate to="/" replace />;
  return children;
}

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Login />} />
        <Route path="/store" element={<RotaProtegida><Store /></RotaProtegida>} />
        <Route path="/library" element={<RotaProtegida><Library /></RotaProtegida>} />
        <Route path="/game/:id" element={<RotaProtegida><GameDetails /></RotaProtegida>} />
        <Route path="/create-game" element={<RotaProtegida><CreateGame /></RotaProtegida>} />
        <Route path="/profile" element={<RotaProtegida><Profile /></RotaProtegida>} />
      </Routes>
    </Router>
  );
}

export default App;
