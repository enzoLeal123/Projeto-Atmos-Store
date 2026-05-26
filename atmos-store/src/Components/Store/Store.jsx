import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import './Store.css';

export default function Store() {
  const navigate = useNavigate();
  const [games, setGames] = useState([]);
  const [genres, setGenres] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedGenre, setSelectedGenre] = useState('Todos');

  useEffect(() => {
    const buscarDadosDaAPI = async () => {
      // DADOS FALSOS DE SEGURANÇA (PLANO B)
      const mockGames = [
        { id: 1, title: 'Cyber Warriors 2077', description: 'Um jogo de ação futurista ambientado em uma metrópole cyberpunk.', rating: 4.5, reviews: 4, genre: 'Ação', age: '18+', developer: 'NightCity Studios', price: 199.90, image: 'https://images.unsplash.com/photo-1542751371-adc38448a05e?auto=format&fit=crop&q=80&w=600&h=350' },
        { id: 2, title: 'Fantasy Quest IX', description: 'Embarque em uma jornada épica através de reinos fantásticos.', rating: 5.0, reviews: 2, genre: 'RPG', age: '12+', developer: 'Square Legends', price: 149.90, image: 'https://images.unsplash.com/photo-1511512578047-dfb367046420?auto=format&fit=crop&q=80&w=600&h=350' },
        { id: 3, title: 'Speed Racing Ultimate', description: 'A experiência definitiva de corrida com gráficos realistas e física avançada.', rating: 4.2, reviews: 7, genre: 'Corrida', age: 'Livre', developer: 'Velocity Games', price: 129.90, image: 'https://images.unsplash.com/photo-1547394765-185e1e68f34e?auto=format&fit=crop&q=80&w=600&h=350' }
      ];
      
      const mockGenres = [
        { name: 'Todos', count: 3 },
        { name: 'Ação', count: 1 },
        { name: 'RPG', count: 1 },
        { name: 'Corrida', count: 1 }
      ];

      try {
        setLoading(true);
        
        // COLOQUE A URL DO SEU POSTMAN AQUI (Ex: http://localhost:3000)
        const URL_BASE = 'https://aaa814e9-fb65-4de2-a381-b0a67e998852.mock.pstmn.io'; 

        const respostaJogos = await axios.get(`${URL_BASE}/jogos`);
        const respostaGeneros = await axios.get(`${URL_BASE}/generos`);

        // Verifica se a API mandou uma lista de verdade. Se sim, usa a API. Se não, usa o Plano B.
        setGames(Array.isArray(respostaJogos.data) ? respostaJogos.data : mockGames);
        setGenres(Array.isArray(respostaGeneros.data) ? respostaGeneros.data : mockGenres);

      } catch (erro) {
        // Se a API estiver desligada ou der erro de CORS, ele cai aqui e ativa o Plano B
        console.warn("A API falhou ou está desligada. Carregando dados de segurança na tela...", erro);
        setGames(mockGames);
        setGenres(mockGenres);
      } finally {
        setLoading(false);
      }
    };

    buscarDadosDaAPI();
  }, []);

  const handleLogout = () => {
    navigate('/');
  };

  // Trava extra de segurança: o "?" garante que o filtro não quebre se a lista estiver vazia
  const filteredGames = selectedGenre === 'Todos' 
    ? games 
    : games?.filter(game => game.genre === selectedGenre);

  return (
    <div className="store-layout">
      {/* HEADER GLOBAL */}
      <header className="store-header">
        <div className="logo-area">
          <div className="logo-icon-bg">🎮</div>
          <div className="logo-text">
            <h2>Atmos Store</h2>
            <span>Game Store</span>
          </div>
        </div>

        <div className="search-bar">
          <span className="search-icon">🔍</span>
          <input type="text" placeholder="Buscar jogos, gêneros, desenvolvedores..." />
        </div>

        <div className="user-actions">
          <button className="btn-library">
            <span className="lib-icon">📚</span> Biblioteca
          </button>
          <div className="user-avatar">👤</div>
          <button className="btn-logout" onClick={handleLogout}>
            <span>🚪</span>
          </button>
        </div>
      </header>

      <div className="store-content">
        {/* SIDEBAR - FILTROS DE GÊNERO */}
        <aside className="sidebar">
          <h3>Filtros</h3>
          <h4 className="sidebar-subtitle">GÊNEROS</h4>
          
          <ul className="genre-list">
            {/* O "?" aqui protege o map caso a API falhe feio */}
            {genres?.map((genre, index) => (
              <li 
                key={index} 
                className={genre.name === selectedGenre ? 'active' : ''}
                onClick={() => setSelectedGenre(genre.name)}
              >
                <span className="genre-name">{genre.name}</span>
                <span className="genre-count">{genre.count}</span>
              </li>
            ))}
          </ul>

          <div className="games-found-badge">
            <strong>{filteredGames?.length || 0}</strong> jogos encontrados
          </div>
        </aside>

        {/* GRID PRINCIPAL DE JOGOS */}
        <main className="games-grid-area">
          <div className="grid-header">
            <div className="header-titles">
              <h2>{selectedGenre === 'Todos' ? 'Todos os Jogos' : `Jogos de ${selectedGenre}`}</h2>
              <p>Mostrando {filteredGames?.length || 0} jogos</p>
            </div>
            <div className="header-sort">
              <label>Ordenar por:</label>
              <select>
                <option>Relevância</option>
                <option>Menor Preço</option>
                <option>Maior Preço</option>
              </select>
            </div>
          </div>
          
          <div className="cards-container">
            {loading ? (
              <p>Tentando conectar com a API...</p>
            ) : !filteredGames || filteredGames.length === 0 ? (
              <p className="no-games-message">Nenhum jogo cadastrado neste gênero.</p>
            ) : (
              filteredGames.map((game) => (
                <div key={game.id || Math.random()} className="game-card">
                  <div className="card-image-wrapper">
                    <img src={game.image || 'https://via.placeholder.com/600x350?text=Sem+Imagem'} alt={game.title} />
                  </div>
                  
                  <div className="card-info">
                    <h4>{game.title}</h4>
                    <p className="description">{game.description}</p>
                    
                    <div className="rating-area">
                      {game.rating && (
                        <>
                          <span className="stars">★★★★★</span>
                          <span className="rating-score">{Number(game.rating).toFixed(1)}</span>
                          <span className="reviews-count">({game.reviews})</span>
                        </>
                      )}
                    </div>

                    <div className="tags-area">
                      <span className="tag">{game.genre}</span>
                      <span className="tag">{game.age}</span>
                    </div>

                    <div className="card-footer">
                      <div className="developer-info">
                        <span>Desenvolvedor</span>
                        <strong>{game.developer}</strong>
                      </div>
                      <div className="price-info">
                        <span>Preço</span>
                        <strong className="price-value">R$ {Number(game.price || 0).toFixed(2)}</strong>
                      </div>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </main>
      </div>
    </div>
  );
}