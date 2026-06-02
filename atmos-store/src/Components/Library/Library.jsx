import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import './Library.css'; 

const API_BASE = 'https://alunos-ads-api-production.up.railway.app';

export default function Library() {
  const navigate = useNavigate();
  const [favorites, setFavorites] = useState([]);
  const [myCreatedGames, setMyCreatedGames] = useState([]);
  const [activeTab, setActiveTab] = useState('favorites');
  const [loadingCreated, setLoadingCreated] = useState(false);

  useEffect(() => {
    const saved = localStorage.getItem('atmos_favorites');
    if (saved) setFavorites(JSON.parse(saved));
  }, []);

  useEffect(() => {
    const carregarJogosCriados = async () => {
      try {
        setLoadingCreated(true);
        const token = localStorage.getItem('atmos_token');
        if (!token) return;

        // 1. Busca o id do usuário logado
        const meRes = await axios.get(`${API_BASE}/auth/me`, {
          headers: { token }
        });
        const meuId = meRes.data?.id;

        // 2. Busca todos os jogos
        const jogosRes = await axios.get(`${API_BASE}/jogos?limite=100&limit=100`);
        const listaJogos = jogosRes.data.itens || [];

        // 3. Filtra pelo autorId que bate com o id do usuário logado
        const meusJogos = listaJogos.filter(jogo => String(jogo.autorId) === String(meuId));

        setMyCreatedGames(meusJogos);
      } catch (erro) {
        console.error('Erro ao carregar jogos criados:', erro);
      } finally {
        setLoadingCreated(false);
      }
    };

    carregarJogosCriados();
  }, []);

  const removeFavorite = (id) => {
    const updated = favorites.filter(game => game.id !== id);
    setFavorites(updated);
    localStorage.setItem('atmos_favorites', JSON.stringify(updated));
  };

  const handleVerDetalhes = (id) => navigate(`/game/${id}`);

  const extrairNomesGeneros = (game) => {
    if (Array.isArray(game.generos) && game.generos.length > 0) {
      return game.generos.map(g => g.nome); 
    }
    return [];
  };

  const jogosExibidos = activeTab === 'favorites' ? favorites : myCreatedGames;

  return (
    <div className="library-layout">
      <header className="library-header">
        <div className="lib-logo" onClick={() => navigate('/store')}>
          <span className="logo-icon">🎮</span>
          <div className="logo-text">
            <h2>Atmos Space</h2>
            <span>Sua Coleção Premium</span>
          </div>
        </div>
        <button onClick={() => navigate('/store')} className="btn-back-store">
          ← Voltar para a Loja
        </button>
      </header>

      <main className="library-main-content">
        <div className="library-welcome">
          <h1>Minha Biblioteca</h1>
          <p>Gerencie seus títulos favoritos e os jogos desenvolvidos por você.</p>
        </div>

        <div className="library-tabs">
          <button 
            className={`tab-btn ${activeTab === 'favorites' ? 'active' : ''}`}
            onClick={() => setActiveTab('favorites')}
          >
            ⭐ Meus Favoritos <span className="tab-count">({favorites.length})</span>
          </button>
          <button 
            className={`tab-btn ${activeTab === 'created' ? 'active' : ''}`}
            onClick={() => setActiveTab('created')}
          >
            🛠️ Jogos que Criei <span className="tab-count">({myCreatedGames.length})</span>
          </button>
        </div>

        <div className="modern-grid">
          {activeTab === 'created' && loadingCreated ? (
            <p className="lib-status-message">Carregando seus projetos...</p>
          ) : jogosExibidos.length === 0 ? (
            <p className="lib-status-message">
              {activeTab === 'favorites' 
                ? "Você ainda não favoritou nenhum jogo no catálogo." 
                : "Você ainda não criou nenhum jogo. Vá em 'Criar Jogo' na loja para começar!"}
            </p>
          ) : (
            jogosExibidos.map((game) => (
              <div key={game.id} className="modern-game-card">
                <div className="card-thumb-wrapper" onClick={() => handleVerDetalhes(game.id)}>
                  <img 
                    src={game.capaUrl || 'https://placehold.co/600x350/1A1C23/A0AEC0?text=Sem+Capa'} 
                    alt={game.titulo}
                    onError={(e) => {
                      e.target.onerror = null;
                      e.target.src = 'https://placehold.co/600x350/1A1C23/A0AEC0?text=Sem+Capa';
                    }}
                  />
                  {activeTab === 'favorites' && (
                    <button className="card-unfav-badge" onClick={(e) => { e.stopPropagation(); removeFavorite(game.id); }}>
                      ★
                    </button>
                  )}
                </div>
                
                <div className="card-details">
                  <div className="card-header-info">
                    <h4 onClick={() => handleVerDetalhes(game.id)}>{game.titulo || 'Sem Título'}</h4>
                    <span className="card-dev-tag">{game.desenvolvedora || 'Indie Studio'}</span>
                  </div>

                  <p className="card-excerpt">{game.descricao || 'Nenhuma descrição disponível.'}</p>

                  <div className="card-meta-tags">
                    {extrairNomesGeneros(game).slice(0, 2).map((gen, idx) => (
                      <span key={idx} className="meta-tag">{gen}</span>
                    ))}
                    {extrairNomesGeneros(game).length === 0 && <span className="meta-tag">Geral</span>}
                  </div>

                  <div className="card-action-bar">
                    <span className="card-price-display">
                      {Number(game.preco) === 0 ? 'Gratuito' : `R$ ${Number(game.preco || 0).toFixed(2)}`}
                    </span>
                    <button className="btn-launch-game" onClick={() => handleVerDetalhes(game.id)}>
                      {activeTab === 'favorites' ? '▶ Jogar' : '📝 Ver Detalhes'}
                    </button>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </main>
    </div>
  );
}
