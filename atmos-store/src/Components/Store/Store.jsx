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
  const [searchQuery, setSearchQuery] = useState('');
  const [sortOption, setSortOption] = useState('Relevancia');

  const [menuAberto, setMenuAberto] = useState(false);

  // Busca os favoritos já salvos no localStorage
  const [favorites, setFavorites] = useState(() => {
    const saved = localStorage.getItem('atmos_favorites');
    return saved ? JSON.parse(saved) : [];
  });

  useEffect(() => {
    const buscarDadosDaAPI = async () => {
      try {
        setLoading(true);
        
        const URL_BASE = 'https://alunos-ads-api-production.up.railway.app/jogos?limite=100&limit=100';

        const respostaJogos = await axios.get(URL_BASE);
        const jogosRecebidos = respostaJogos.data.itens || []; 
        
        setGames(jogosRecebidos);

        const contagemGeneros = {};
        let semGeneroCount = 0;

        jogosRecebidos.forEach(game => {
          const listaNomesGeneros = Array.isArray(game.generos) && game.generos.length > 0
            ? game.generos.map(g => g.nome)
            : [];
          
          if (listaNomesGeneros.length === 0) {
            semGeneroCount++;
          } else {
            listaNomesGeneros.forEach(generoNome => {
              const nomeFormatado = generoNome.charAt(0).toUpperCase() + generoNome.slice(1).toLowerCase();
              if (!contagemGeneros[nomeFormatado]) {
                contagemGeneros[nomeFormatado] = 0;
              }
              contagemGeneros[nomeFormatado]++;
            });
          }
        });

        const listaSidebar = [
          { name: 'Todos', count: jogosRecebidos.length },
          ...Object.keys(contagemGeneros).sort().map(nome => ({
            name: nome,
            count: contagemGeneros[nome]
          }))
        ];

        if (semGeneroCount > 0) {
          listaSidebar.push({ name: 'Outros', count: semGeneroCount });
        }

        setGenres(listaSidebar);

      } catch (erro) {
        console.error("Erro ao ligar à API:", erro);
      } finally {
        setLoading(false);
      }
    };

    buscarDadosDaAPI();
  }, []);

  const toggleFavorite = (game) => {
    let updatedFavorites;
    if (favorites.some(fav => fav.id === game.id)) {
      updatedFavorites = favorites.filter(fav => fav.id !== game.id);
    } else {
      updatedFavorites = [...favorites, game];
    }
    setFavorites(updatedFavorites);
    localStorage.setItem('atmos_favorites', JSON.stringify(updatedFavorites));
  };

  const handleCriarJogo = () => { navigate("/create-game"); };
  const handleBiblioteca = () => { navigate('/library'); };
  const handleLogout = () => {
    localStorage.removeItem('atmos_token');
    navigate('/');
  };

  const handleVerDetalhes = (id) => {
    navigate(`/game/${id}`);
  };

  const extrairNomesGeneros = (game) => {
    if (Array.isArray(game.generos) && game.generos.length > 0) {
      return game.generos.map(g => g.nome); 
    }
    return [];
  };

  let processedGames = [...games];

  if (searchQuery.trim() !== '') {
    processedGames = processedGames.filter(game => {
      const titulo = String(game.titulo || '').toLowerCase();
      const dev = String(game.desenvolvedora || '').toLowerCase();
      const busca = searchQuery.toLowerCase();
      return titulo.includes(busca) || dev.includes(busca);
    });
  }

  if (selectedGenre !== 'Todos') {
    processedGames = processedGames.filter(game => {
      const listaGeneros = extrairNomesGeneros(game).map(g => g.toLowerCase());
      if (selectedGenre === 'Outros') {
        return listaGeneros.length === 0;
      }
      return listaGeneros.includes(selectedGenre.toLowerCase());
    });
  }

  if (sortOption === 'A-Z') {
    processedGames.sort((a, b) => String(a.titulo || '').localeCompare(String(b.titulo || '')));
  } else if (sortOption === 'Z-A') {
    processedGames.sort((a, b) => String(b.titulo || '').localeCompare(String(a.titulo || '')));
  }

  return (
    <div className="store-container">
      {/* ── HEADER PADRONIZADO GLOBAL ── */}
      <header className="store-header">
        <div className="logo-area" style={{ cursor: 'pointer' }} onClick={() => navigate('/store')}>
          <div className="logo-icon-bg">🎮</div>
          <div className="logo-text">
            <h2>Atmos Store</h2>
            <span>Game Store</span>
          </div>
        </div>

        <div className="search-sort-bar">
          <input 
            type="text" 
            className="store-search-input"
            placeholder="Buscar jogos ou estúdios..." 
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>

        <div className="user-actions">
          <div className="avatar-container" style={{ position: 'relative' }}>
            <div className="user-avatar" style={{ cursor: 'pointer', fontSize: '1.4rem' }} onClick={() => setMenuAberto(!menuAberto)}>
              👤
            </div>
            
            {menuAberto && (
              <div className="avatar-dropdown" style={{
                position: 'absolute', right: 0, top: '40px', background: 'var(--bg-painel)',
                border: '1px solid var(--border-suave)', padding: '0.8rem', borderRadius: '8px',
                display: 'flex', flexDirection: 'column', gap: '0.5rem', zIndex: 200, width: '150px'
              }}>
                <button className="dropdown-item" onClick={handleCriarJogo} style={{ background: 'none', border: 'none', color: '#fff', textAlign: 'left', cursor: 'pointer', fontSize: '0.9rem' }}>
                  ➕ Criar Jogo
                </button>
                <hr className="dropdown-divider" style={{ border: 'none', borderTop: '1px solid var(--border-suave)' }} />
                <button className="dropdown-item" onClick={handleBiblioteca} style={{ background: 'none', border: 'none', color: '#fff', textAlign: 'left', cursor: 'pointer', fontSize: '0.9rem' }}>
                  📚 Biblioteca
                </button>
                <hr className="dropdown-divider" style={{ border: 'none', borderTop: '1px solid var(--border-suave)' }} />
                <button className="dropdown-item logout" onClick={handleLogout} style={{ background: 'none', border: 'none', color: 'var(--error)', textAlign: 'left', cursor: 'pointer', fontSize: '0.9rem', fontWeight: 'bold' }}>
                  🚪 Sair
                </button>
              </div>
            )}
          </div>
        </div>
      </header>

      {/* ── CONTEÚDO PRINCIPAL (DOIS BLOCOS) ── */}
      <div className="store-layout">
        
        {/* Sidebar Lateral de Gêneros */}
        <aside className="filters-sidebar">
          <h3>Filtros</h3>
          <div className="genre-list">
            {genres.map((genre) => (
              <button 
                key={genre.name} 
                className={`genre-btn ${genre.name === selectedGenre ? 'active' : ''}`}
                onClick={() => setSelectedGenre(genre.name)}
              >
                <span>{genre.name}</span>
                <span className="genre-count">{genre.count}</span>
              </button>
            ))}
          </div>
        </aside>

        {/* Seção do Catálogo de Cards */}
        <main className="catalog-section">
          <div className="catalog-header">
            <div className="catalog-title">
              <h1>{selectedGenre === 'Todos' ? 'Todos os Jogos' : `Jogos de ${selectedGenre}`}</h1>
              <span>Mostrando {processedGames.length} de {games.length} títulos</span>
            </div>
            
            <div className="header-sort" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <label style={{ fontSize: '0.85rem', color: 'var(--texto-secundario)' }}>Ordenar:</label>
              <select 
                value={sortOption} 
                onChange={(e) => setSortOption(e.target.value)}
                style={{ background: 'var(--bg-painel)', border: '1px solid var(--border-suave)', color: '#fff', padding: '0.4rem 0.8rem', borderRadius: '6px', outline: 'none' }}
              >
                <option value="Relevancia">Relevância</option>
                <option value="A-Z">A-Z</option>
                <option value="Z-A">Z-A</option>
              </select>
            </div>
          </div>
          
          {/* Grid unificado com o novo layout */}
          <div className="store-grid">
            {loading ? (
              <p className="lib-status-message">Carregando catálogo da nuvem...</p>
            ) : processedGames.length === 0 ? (
              <p className="lib-status-message">Nenhum jogo encontrado com este filtro.</p>
            ) : (
              processedGames.map((game) => {
                const isFav = favorites.some(fav => fav.id === game.id);
                return (
                  <div key={game.id} className="store-game-card">
                    <div className="store-card-thumb">
                      <img 
                        src={game.capaUrl || 'https://placehold.co/600x350/1A1C23/A0AEC0?text=Sem+Capa'} 
                        alt={game.titulo}
                        onClick={() => handleVerDetalhes(game.id)}
                        onError={(e) => {
                          e.target.onerror = null;
                          e.target.src = 'https://placehold.co/600x350/1A1C23/A0AEC0?text=Sem+Capa';
                        }}
                      />
                      <button 
                        className={`store-fav-badge ${isFav ? 'is-favorited' : ''}`}
                        onClick={() => toggleFavorite(game)}
                      >
                        {isFav ? '⭐' : '☆'}
                      </button>
                    </div>
                    
                    <div className="store-card-body">
                      <h4 onClick={() => handleVerDetalhes(game.id)}>{game.titulo || 'Jogo Desconhecido'}</h4>
                      <span className="dev-name">{game.desenvolvedora || 'Não informada'}</span>
                      <p className="store-card-description">{game.descricao || 'Sem descrição cadastrada.'}</p>

                      <div className="store-card-tags">
                        {extrairNomesGeneros(game).slice(0, 2).map((gen, idx) => (
                          <span key={idx} className="store-tag">{gen}</span>
                        ))}
                        {extrairNomesGeneros(game).length === 0 && (
                          <span className="store-tag">Geral</span>
                        )}
                      </div>

                      <div className="store-card-footer">
                        <span className="store-card-price">
                          {Number(game.preco) === 0 ? 'Gratuito' : `R$ ${Number(game.preco || 0).toFixed(2)}`}
                        </span>
                        <button className="btn-view-details" onClick={() => handleVerDetalhes(game.id)}>
                          Detalhes
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </main>
      </div>
    </div>
  );
}