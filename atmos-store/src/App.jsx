import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Login from './components/Login/Login';
import Store from './components/Store/Store';
import Library from './components/Library/Library'; 

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

        {/* MUDANÇA 2: Adicionada a rota privada da biblioteca */}
        <Route
          path="/library"
          element={
            <RotaProtegida>
              <Library />
            </RotaProtegida>
          }
        />
      </Routes>
    </Router>
  );
}

export default App;