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

  // NOVO: Estado inicializado buscando os favoritos já salvos no localStorage
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

  // NOVO: Função para adicionar ou remover um jogo dos favoritos
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

  const handleBiblioteca = () => {
    navigate('/library');
  };

  const handleLogout = () => {
    localStorage.removeItem('atmos_token');
    navigate('/');
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
    <div className="store-layout">
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
          <input 
            type="text" 
            placeholder="Buscar jogos ou desenvolvedoras..." 
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>

        <div className="user-actions">
          <div className="avatar-container">
            <div className="user-avatar" onClick={() => setMenuAberto(!menuAberto)}>
              👤
            </div>
            
            {menuAberto && (
              <div className="avatar-dropdown">
                <button className="dropdown-item" onClick={handleBiblioteca}>
                  <span>📚</span> Biblioteca
                </button>
                <hr className="dropdown-divider" />
                <button className="dropdown-item logout" onClick={handleLogout}>
                  <span>🚪</span> Sair
                </button>
              </div>
            )}
          </div>
        </div>
      </header>

      <div className="store-content">
        <aside className="sidebar">
          <h3>Filtros</h3>
          <h4 className="sidebar-subtitle">GÊNEROS</h4>
          
          <ul className="genre-list">
            {genres.map((genre) => (
              <li 
                key={genre.name} 
                className={genre.name === selectedGenre ? 'active' : ''}
                onClick={() => setSelectedGenre(genre.name)}
              >
                <span className="genre-name">{genre.name}</span>
                <span className="genre-count">{genre.count}</span>
              </li>
            ))}
          </ul>

          <div className="games-found-badge">
            <strong>{processedGames.length}</strong> jogos exibidos
          </div>
        </aside>

        <main className="games-grid-area">
          <div className="grid-header">
            <div className="header-titles">
              <h2>{selectedGenre === 'Todos' ? 'Todos os Jogos' : `Jogos de ${selectedGenre}`}</h2>
              <p>Mostrando {processedGames.length} de {games.length} jogos do catálogo</p>
            </div>
            <div className="header-sort">
              <label>Ordenar por:</label>
              <select value={sortOption} onChange={(e) => setSortOption(e.target.value)}>
                <option value="Relevancia">Relevância</option>
                <option value="A-Z">Ordem Alfabética (A-Z)</option>
                <option value="Z-A">Ordem Alfabética (Z-A)</option>
              </select>
            </div>
          </div>
          
          <div className="cards-container">
            {loading ? (
              <p>Carregando catálogo do Railway...</p>
            ) : processedGames.length === 0 ? (
              <p className="no-games-message">Nenhum jogo encontrado com este filtro.</p>
            ) : (
              processedGames.map((game) => (
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
                    {/* NOVO: Botão dinâmico de Estrela sobre a imagem */}
                    <button 
                      className={`btn-favorite ${favorites.some(fav => fav.id === game.id) ? 'is-fav' : ''}`}
                      onClick={() => toggleFavorite(game)}
                    >
                      {favorites.some(fav => fav.id === game.id) ? '⭐' : '☆'}
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
                        <span>Preço</span>
                        <strong className="price-value">R$ {Number(game.preco || 0).toFixed(2)}</strong>
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