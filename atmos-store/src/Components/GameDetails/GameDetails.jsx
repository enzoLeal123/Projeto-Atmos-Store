import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import './GameDetails.css';

export default function GameDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  
  const [game, setGame] = useState(null);
  const [recommendedGames, setRecommendedGames] = useState([]);
  const [loading, setLoading] = useState(true);

  // === ESTADOS PARA OS REVIEWS ===
  const [reviews, setReviews] = useState([]);          
  const [comentario, setComentario] = useState('');    
  const [recomenda, setRecomenda] = useState(true);    
  const [enviandoReview, setEnviandoReview] = useState(false);

  // Estado dos favoritos (LocalStorage)
  const [favorites, setFavorites] = useState(() => {
    const saved = localStorage.getItem('atmos_favorites');
    return saved ? JSON.parse(saved) : [];
  });

  const carregarDadosPagina = async () => {
    try {
      setLoading(true);
      const URL_BASE = 'https://alunos-ads-api-production.up.railway.app/jogos';
      
      const resposta = await axios.get(`${URL_BASE}?limite=100&limit=100`);
      const listaJogos = resposta.data.itens || [];
      const jogoEncontrado = listaJogos.find(g => String(g.id) === String(id));
      
      if (jogoEncontrado) {
        setGame(jogoEncontrado);
        
        // Lógica de Recomendações por Gênero
        const generosDoJogoAtual = Array.isArray(jogoEncontrado.generos) 
          ? jogoEncontrado.generos.map(g => g.nome.toLowerCase()) 
          : [];
          
        const recomendados = listaJogos.filter(g => {
          if (String(g.id) === String(id)) return false;
          const generosDoOutro = Array.isArray(g.generos) ? g.generos.map(gen => gen.nome.toLowerCase()) : [];
          return generosDoOutro.some(gen => generosDoJogoAtual.includes(gen));
        });
        setRecommendedGames(recomendados.slice(0, 3));

        // Mock de comentários para preencher a tela
        setReviews([
          { id: 1, usuario: "Jogador_Atmos", recomenda: true, comentario: "Muito bom! Gráficos excelentes e ótima otimização." },
          { id: 2, usuario: "Anônimo", recomenda: false, comentario: "História legal, mas achei que tem muitos bugs no lançamento." }
        ]);
      }
    } catch (erro) {
      console.error("Erro ao carregar dados da página:", erro);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    carregarDadosPagina();
  }, [id]);

  const handleEnviarReview = async (e) => {
    e.preventDefault();
    if (!comentario.trim()) return;

    try {
      setEnviandoReview(true);
      const novoReview = {
        usuario: "Jogador_Logado", 
        recomenda: recomenda,
        comentario: comentario
      };

      setReviews([...reviews, { id: Date.now(), ...novoReview }]);
      setComentario('');
      alert("Avaliação enviada com sucesso!");
    } catch (erro) {
      console.error("Erro ao enviar avaliação:", erro);
    } finally {
      setEnviandoReview(false);
    }
  };

  const toggleFavorite = () => {
    if (!game) return;
    let updatedFavorites = favorites.some(fav => fav.id === game.id)
      ? favorites.filter(fav => fav.id !== game.id)
      : [...favorites, game];
    setFavorites(updatedFavorites);
    localStorage.setItem('atmos_favorites', JSON.stringify(updatedFavorites));
  };

  if (loading) {
    return <div className="store-layout" style={{ justifyContent: 'center', alignItems: 'center' }}><p>Carregando...</p></div>;
  }

  if (!game) {
    return <div className="store-layout" style={{ justifyContent: 'center', alignItems: 'center', padding: '2rem' }}><h2>Jogo não encontrado!</h2></div>;
  }

  const isFavorited = favorites.some(fav => fav.id === game.id);

  const galeriaFotos = Array.isArray(game.fotos) && game.fotos.length > 0 
    ? game.fotos 
    : [game.capaUrl];

  return (
    <div className="store-layout">
      {/* Header Original Intacto */}
      <header className="store-header">
        <div className="logo-area" style={{ cursor: 'pointer' }} onClick={() => navigate('/store')}>
          <div className="logo-icon-bg">🎮</div>
          <div className="logo-text"><h2>Atmos Store</h2><span>Game Store</span></div>
        </div>
        <button className="btn-back-store" onClick={() => navigate('/store')}>⬅ Voltar para a Loja</button>
      </header>

      {/* REATIVADO: O container principal que conserta o layout de todos os jogos */}
      <div className="details-container">
        
        {/* Seção Superior (Imagens na esquerda, especificações na direita) */}
        <div className="main-details-section">
          <div className="gallery-wrapper">
            <div className="main-photo-box">
              <img src={game.capaUrl} alt={game.titulo} />
            </div>
            {galeriaFotos.length > 1 && (
              <div className="thumbnails-grid">
                {galeriaFotos.map((url, index) => (
                  <div key={index} className="thumb-item">
                    <img src={url} alt={`Screenshot ${index + 1}`} />
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="info-buy-card">
            <span className="details-dev">{game.desenvolvedora || 'Indie Studio'}</span>
            <div className="details-title-area">
              <h1>{game.titulo}</h1>
              <button className={`btn-details-favorite ${isFavorited ? 'is-fav' : ''}`} onClick={toggleFavorite}>
                {isFavorited ? '⭐' : '☆'}
              </button>
            </div>
            <div className="details-genres">
              {Array.isArray(game.generos) && game.generos.map((g, idx) => <span key={idx} className="tag">{g.nome}</span>)}
            </div>
            <p className="details-full-description">{game.descricao}</p>
            <div className="buy-zone">
              <div className="details-price"><span>Preço total:</span><strong>R$ {Number(game.preco || 0).toFixed(2)}</strong></div>
              <button className="btn-buy-now">Comprar Agora</button>
            </div>
          </div>
        </div>

        {/* SEÇÃO DE AVALIAÇÕES: Customizada com estilos inline para não interferir nas outras classes */}
        <div style={{ margin: '3rem 0', padding: '1.5rem', background: '#1a1d24', borderRadius: '8px', border: '1px solid #2d3748' }}>
          <h2 style={{ color: '#fff', marginBottom: '1.5rem', fontSize: '1.5rem' }}>Avaliações dos Usuários</h2>
          
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '2rem' }}>
            {/* Formulário */}
            <form onSubmit={handleEnviarReview} className="review-form">
              <h3 style={{ color: '#e2e8f0', fontSize: '1.1rem', marginBottom: '1rem' }}>Deixe sua análise sobre o jogo</h3>
              
              <div className="recommend-buttons-box" style={{ marginBottom: '1rem' }}>
                <p style={{ color: '#a0aec0', marginBottom: '0.5rem' }}>Você recomenda este jogo?</p>
                <div className="buttons-group" style={{ display: 'flex', gap: '1rem' }}>
                  <button 
                    type="button" 
                    className={`btn-rate btn-yes ${recomenda === true ? 'active' : ''}`}
                    onClick={() => setRecomenda(true)}
                  >
                    👍 Sim, recomendo
                  </button>
                  <button 
                    type="button" 
                    className={`btn-rate btn-no ${recomenda === false ? 'active' : ''}`}
                    onClick={() => setRecomenda(false)}
                  >
                    👎 Não recomendo
                  </button>
                </div>
              </div>

              <div className="input-group" style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', marginBottom: '1rem' }}>
                <label htmlFor="comment" style={{ color: '#cbd5e0' }}>Escreva sua análise detalhada:</label>
                <textarea 
                  id="comment"
                  rows="4"
                  placeholder="Conte para a comunidade o que você achou do jogo..."
                  value={comentario}
                  onChange={(e) => setComentario(e.target.value)}
                  required
                  style={{ background: '#121418', border: '1px solid #4a5568', color: '#fff', padding: '0.8rem', borderRadius: '6px', resize: 'vertical' }}
                ></textarea>
              </div>

              <button type="submit" className="btn-submit-review" disabled={enviandoReview}>
                {enviandoReview ? 'Enviando...' : 'Publicar Análise'}
              </button>
            </form>

            {/* Lista de Comentários */}
            <div className="reviews-list-box">
              <h3 style={{ color: '#e2e8f0', fontSize: '1.1rem', marginBottom: '1rem' }}>Análises mais recentes</h3>
              <div className="reviews-scroll-container" style={{ display: 'flex', flexDirection: 'column', gap: '1rem', maxHeight: '280px', overflowY: 'auto' }}>
                {reviews.map((rev) => (
                  <div key={rev.id} className="review-item-card" style={{ background: '#121418', border: '1px solid #2d3748', padding: '1rem', borderRadius: '8px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                      <span style={{ color: '#fff', fontWeight: '600' }}>👤 {rev.usuario}</span>
                      <span style={{ color: rev.recomenda ? '#4299e1' : '#f56565', fontWeight: 'bold' }}>
                        {rev.recomenda ? '👍 RECOMENDA' : '👎 NÃO RECOMENDA'}
                      </span>
                    </div>
                    <p style={{ color: '#cbd5e0', margin: 0, fontStyle: 'italic' }}>"{rev.comentario}"</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Rodapé de Recomendações Original (Volta a funcionar perfeitamente em grid) */}
        {recommendedGames.length > 0 && (
          <div className="recommendations-section">
            <h3>Você também pode gostar</h3>
            <div className="recommendations-grid">
              {recommendedGames.map((recGame) => (
                <div key={recGame.id} className="rec-card" onClick={() => navigate(`/game/${recGame.id}`)}>
                  <img src={recGame.capaUrl || 'https://placehold.co/600x350/2D3748/A0AEC0?text=Sem+Capa'} alt={recGame.titulo} />
                  <div className="rec-card-info">
                    <h4>{recGame.titulo}</h4>
                    <span>R$ {Number(recGame.preco || 0).toFixed(2)}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

      </div>
    </div>
  );
}