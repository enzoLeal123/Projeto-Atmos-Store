import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Login from './components/Login/Login';
import Store from './components/Store/Store';
import Library from './components/Library/Library'; 
import GameDetails from "./components/GameDetails/GameDetails.jsx"; // NOVO: Importando a página de detalhes

// Componente que protege rotas privadas
function RotaProtegida({ children }) {
  const token = localStorage.getItem('atmos_token');
  if (!token) {
    return <Navigate to="/" replace />;
  }
  return children;
}

function App() {
  return (
    <Router>
      <Routes>
        {/* Rota inicial (Login) */}
        <Route path="/" element={<Login />} />

        {/* Rota da Loja - só entra com token */}
        <Route
          path="/store"
          element={
            <RotaProtegida>
              <Store />
            </RotaProtegida>
          }
        />

        {/* Rota privada da biblioteca */}
        <Route
          path="/library"
          element={
            <RotaProtegida>
              <Library />
            </RotaProtegida>
          }
        />

        {/* NOVO: Rota privada para Detalhes do Jogo usando o ID dinâmico */}
        <Route
          path="/game/:id"
          element={
            <RotaProtegida>
              <GameDetails />
            </RotaProtegida>
          }
        />
      </Routes>
    </Router>
  );
}

export default App;