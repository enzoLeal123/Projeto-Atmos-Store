import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Login from './components/Login/Login';
import Store from './components/Store/Store';

function App() {
  return (
    <Router>
      <Routes>
        {/* Rota inicial (Login) */}
        <Route path="/" element={<Login />} />
        
        {/* Rota da Loja */}
        <Route path="/store" element={<Store />} />
      </Routes>
    </Router>
  );
}

export default App;