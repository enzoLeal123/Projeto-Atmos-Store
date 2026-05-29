import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import './Library.css'; 

export default function Library() {
  const navigate = useNavigate();
  const [favorites, setFavorites] = useState([]);

  // Recarrega a lista do localStorage sempre que o componente é montado
  useEffect(() => {
    const saved = localStorage.getItem('atmos_favorites');
    if (saved) {
      setFavorites(JSON.parse(saved));
    }
  }, []);

  // Remove o favorito e sincroniza o localStorage
  const removeFavorite = (id) => {
    const updated = favorites.filter(game => game.id !== id);
    setFavorites(updated);
    localStorage.setItem('atmos_favorites', JSON.stringify(updated));
  };

  const extrairNomesGeneros = (game) => {
    if (Array.isArray(game.generos) && game.generos.length > 0) {
      return game.generos.map(g => g.nome); 
    }
    return [];
  };

  return (
    <div className="library-container">
      <button onClick={() => navigate('/store')} className="btn-back">
        ⬅ Voltar para a Loja
      </button>

      <h1>Minha Biblioteca</h1>
      <p className="library-text">Aqui estão os seus jogos favoritos guardados no seu perfil.</p>

      {/* Grid reutilizando os estilos globais de cards de jogos */}
      <div className="cards-container" style={{ marginTop: '30px' }}>
        {favorites.length === 0 ? (
          <p className="no-games-message">Você ainda não adicionou nenhum jogo às estrelas de favoritos.</p>
        ) : (
          favorites.map((game) => (
            <div key={game.id} className="game-card">
              <div className="card-image-wrapper">
                <img 
                  src={game.capaUrl || 'https://placehold.co/600x350/2D3748/A0AEC0?text=Sem+Capa'} 
                  alt={game.titulo || 'Jogo'}
                  onError={(e) => {
                    e.target.onerror = null;
                    e.target.src = 'https://placehold.co/600x350/2D3748/A0AEC0?text=Sem+Capa';
                  }}
                />
                <button className="btn-favorite is-fav" onClick={() => removeFavorite(game.id)}>
                  ⭐
                </button>
              </div>
              
              <div className="card-info">
                <h4>{game.titulo || 'Jogo Desconhecido'}</h4>
                <p className="description">{game.descricao || 'Sem descrição cadastrada.'}</p>

                <div className="tags-area">
                  {extrairNomesGeneros(game).slice(0, 2).map((gen, idx) => (
                    <span key={idx} className="tag">{gen}</span>
                  ))}
                  {extrairNomesGeneros(game).length === 0 && (
                    <span className="tag">Sem Gênero</span>
                  )}
                </div>

                <div className="card-footer">
                  <div className="developer-info">
                    <span>Desenvolvedora</span>
                    <strong>{game.desenvolvedora || 'Não informada'}</strong>
                  </div>
                  <div className="price-info">
                    <button className="btn-play">
                      ▶ Jogar
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}