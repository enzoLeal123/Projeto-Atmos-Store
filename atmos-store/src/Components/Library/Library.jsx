import React from 'react';
import { useNavigate } from 'react-router-dom';
import './Library.css'; // Importando o arquivo de estilos que você acabou de criar

export default function Library() {
  const navigate = useNavigate();

  return (
    <div className="library-container">
      {/* Botão agora usa a classe do CSS */}
      <button onClick={() => navigate('/store')} className="btn-back">
        ⬅ Voltar para a Loja
      </button>

      <h1>Minha Biblioteca</h1>
      <p className="library-text">Aqui estarão os jogos que você adquiriu.</p>
    </div>
  );
}