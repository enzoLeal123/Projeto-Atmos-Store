import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import "./CreateGame.css";

const API_BASE = 'https://alunos-ads-api-production.up.railway.app';

export default function GameDetails() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [game, setGame] = useState(null);
  const [recommendedGames, setRecommendedGames] = useState([]);
  const [loading, setLoading] = useState(true);

  const [reviews, setReviews] = useState([]);
  const [loadingReviews, setLoadingReviews] = useState(true);
  const [comentario, setComentario] = useState('');
  const [recomenda, setRecomenda] = useState(true);
  const [enviandoReview, setEnviandoReview] = useState(false);
  const [erroReview, setErroReview] = useState('');
  const [sucessoReview, setSucessoReview] = useState(false);

  const [favorites, setFavorites] = useState(() => {
    const saved = localStorage.getItem('atmos_favorites');
    return saved ? JSON.parse(saved) : [];
  });

  // Carrega jogo e recomendados
  useEffect(() => {
    const carregar = async () => {
      try {
        setLoading(true);
        const resposta = await axios.get(`${API_BASE}/jogos?limite=100&limit=100`);
        const listaJogos = resposta.data.itens || [];
        const jogoEncontrado = listaJogos.find(g => String(g.id) === String(id));

        if (jogoEncontrado) {
          setGame(jogoEncontrado);

          const generosAtuais = Array.isArray(jogoEncontrado.generos)
            ? jogoEncontrado.generos.map(g => g.nome.toLowerCase())
            : [];

          const recomendados = listaJogos.filter(g => {
            if (String(g.id) === String(id)) return false;
            const outros = Array.isArray(g.generos) ? g.generos.map(gen => gen.nome.toLowerCase()) : [];
            return outros.some(gen => generosAtuais.includes(gen));
          });
          setRecommendedGames(recomendados.slice(0, 3));
        }
      } catch (erro) {
        console.error('Erro ao carregar jogo:', erro);
      } finally {
        setLoading(false);
      }
    };
    carregar();
  }, [id]);

  // Carrega reviews da API
  const carregarReviews = async () => {
    try {
      setLoadingReviews(true);
      const res = await axios.get(`${API_BASE}/jogos/${id}/reviews`);
      // A API pode retornar array direto ou dentro de .itens / .data
      const lista = Array.isArray(res.data)
        ? res.data
        : res.data?.itens || res.data?.data || res.data?.reviews || [];
      setReviews(lista);
    } catch (erro) {
      console.error('Erro ao carregar reviews:', erro);
      setReviews([]);
    } finally {
      setLoadingReviews(false);
    }
  };

  useEffect(() => {
    carregarReviews();
  }, [id]);

  const toggleFavorite = () => {
    if (!game) return;
    const updatedFavorites = favorites.some(f => f.id === game.id)
      ? favorites.filter(f => f.id !== game.id)
      : [...favorites, game];
    setFavorites(updatedFavorites);
    localStorage.setItem('atmos_favorites', JSON.stringify(updatedFavorites));
  };

  const handleEnviarReview = async (e) => {
    e.preventDefault();
    if (!comentario.trim()) return;

    setErroReview('');
    setSucessoReview(false);
    setEnviandoReview(true);

    try {
      const token = localStorage.getItem('atmos_token');
      await axios.post(
        `${API_BASE}/jogos/${id}/reviews`,
        { comentario: comentario.trim(), recomenda },
        { headers: { token } }
      );
      setComentario('');
      setRecomenda(true);
      setSucessoReview(true);
      setTimeout(() => setSucessoReview(false), 3000);
      // Recarrega reviews após postar
      await carregarReviews();
    } catch (err) {
      const serverMsg =
        err?.response?.data?.mensagem ||
        err?.response?.data?.message ||
        err?.response?.data?.erro ||
        null;
      setErroReview(serverMsg || 'Erro ao enviar avaliação. Tente novamente.');
    } finally {
      setEnviandoReview(false);
    }
  };

  if (loading) return (
    <div className="gd-layout">
      <div className="gd-loading">Carregando...</div>
    </div>
  );

  if (!game) return (
    <div className="gd-layout">
      <div className="gd-loading">Jogo não encontrado.</div>
    </div>
  );

  const isFavorited = favorites.some(f => f.id === game.id);
  const totalRecomenda = reviews.filter(r => r.recomenda === true).length;
  const pctRecomenda = reviews.length > 0 ? Math.round((totalRecomenda / reviews.length) * 100) : 0;

  // Tenta extrair o nome do usuário de diferentes formatos da API
  const getNomeUsuario = (rev) =>
    rev.usuario?.nome || rev.usuario?.name || rev.nomeUsuario || rev.autor || 'Jogador Anônimo';

  return (
    <div className="gd-layout">

      {/* ── HEADER ── */}
      <header className="store-header">
        <div className="logo-area" style={{ cursor: 'pointer' }} onClick={() => navigate('/store')}>
          <div className="logo-icon-bg">🎮</div>
          <div className="logo-text">
            <h2>Atmos Store</h2>
            <span>Game Store</span>
          </div>
        </div>
        <button className="gd-btn-back" onClick={() => navigate('/store')}>
          ← Voltar para a Loja
        </button>
      </header>

      {/* ── HERO ── */}
      <div className="gd-hero">
        <img
          src={game.capaUrl || 'https://placehold.co/1200x400/2D3748/A0AEC0?text=Sem+Capa'}
          alt={game.titulo}
          className="gd-hero-img"
          onError={e => { e.target.onerror = null; e.target.src = 'https://placehold.co/1200x400/2D3748/A0AEC0?text=Sem+Capa'; }}
        />
        <div className="gd-hero-overlay" />
      </div>

      {/* ── CONTEÚDO PRINCIPAL ── */}
      <div className="gd-content">

        <div className="gd-main-col">
          <div className="gd-title-row">
            <div>
              <span className="gd-dev">{game.desenvolvedora || 'Estúdio Indie'}</span>
              <h1 className="gd-title">{game.titulo}</h1>
            </div>
            <button
              className={`gd-btn-fav ${isFavorited ? 'is-fav' : ''}`}
              onClick={toggleFavorite}
              title={isFavorited ? 'Remover dos favoritos' : 'Adicionar aos favoritos'}
            >
              {isFavorited ? '⭐' : '☆'}
            </button>
          </div>

          <div className="gd-tags">
            {Array.isArray(game.generos) && game.generos.map((g, i) => (
              <span key={i} className="tag">{g.nome}</span>
            ))}
          </div>

          <p className="gd-description">{game.descricao || 'Sem descrição cadastrada.'}</p>

          <div className="gd-buy-card">
            <div className="gd-price-block">
              <span className="gd-price-label">Preço</span>
              <strong className="gd-price">R$ {Number(game.preco || 0).toFixed(2)}</strong>
            </div>
            <button className="gd-btn-buy">Comprar Agora</button>
          </div>

          {reviews.length > 0 && (
            <div className="gd-score-bar">
              <span className="gd-score-label">
                {pctRecomenda >= 80 ? '👍 Muito Positivo' : pctRecomenda >= 50 ? '😐 Misto' : '👎 Negativo'}
              </span>
              <span className="gd-score-pct">{pctRecomenda}% recomendam ({reviews.length} avaliações)</span>
              <div className="gd-score-track">
                <div className="gd-score-fill" style={{ width: `${pctRecomenda}%` }} />
              </div>
            </div>
          )}
        </div>

        <div className="gd-side-col">
          <div className="gd-info-card">
            <h3>Informações</h3>
            <div className="gd-info-row">
              <span>Desenvolvedora</span>
              <strong>{game.desenvolvedora || '—'}</strong>
            </div>
            <div className="gd-info-row">
              <span>Gêneros</span>
              <strong>{Array.isArray(game.generos) && game.generos.length > 0 ? game.generos.map(g => g.nome).join(', ') : '—'}</strong>
            </div>
            <div className="gd-info-row">
              <span>Lançamento</span>
              <strong>{game.lancamento || '—'}</strong>
            </div>
            <div className="gd-info-row">
              <span>Preço</span>
              <strong className="gd-info-price">R$ {Number(game.preco || 0).toFixed(2)}</strong>
            </div>
          </div>
        </div>
      </div>

      {/* ── AVALIAÇÕES ── */}
      <div className="gd-reviews-section">
        <h2>Avaliações dos Usuários</h2>

        <div className="gd-reviews-grid">

          {/* Formulário */}
          <form className="gd-review-form" onSubmit={handleEnviarReview}>
            <h3>Deixe sua análise</h3>

            <p className="gd-form-label">Você recomenda este jogo?</p>
            <div className="gd-rec-buttons">
              <button type="button" className={`gd-btn-rec yes ${recomenda === true ? 'active' : ''}`} onClick={() => setRecomenda(true)}>
                👍 Sim, recomendo
              </button>
              <button type="button" className={`gd-btn-rec no ${recomenda === false ? 'active' : ''}`} onClick={() => setRecomenda(false)}>
                👎 Não recomendo
              </button>
            </div>

            <p className="gd-form-label">Escreva sua análise:</p>
            <textarea
              rows="5"
              placeholder="Conte para a comunidade o que você achou do jogo..."
              value={comentario}
              onChange={e => { setComentario(e.target.value); setErroReview(''); }}
              className="gd-textarea"
              required
            />

            {erroReview && (
              <div className="gd-review-error">
                <span>⚠️</span>
                <p>{erroReview}</p>
              </div>
            )}

            {sucessoReview && (
              <div className="gd-review-success">
                <span>✅</span>
                <p>Avaliação publicada com sucesso!</p>
              </div>
            )}

            <button type="submit" className="gd-btn-submit" disabled={enviandoReview}>
              {enviandoReview ? 'Enviando...' : 'Publicar Análise'}
            </button>
          </form>

          {/* Lista de reviews */}
          <div className="gd-reviews-list">
            <h3>
              Análises mais recentes
              {!loadingReviews && <span className="gd-reviews-count"> ({reviews.length})</span>}
            </h3>

            <div className="gd-reviews-scroll">
              {loadingReviews ? (
                <p className="gd-no-reviews">Carregando avaliações...</p>
              ) : reviews.length === 0 ? (
                <p className="gd-no-reviews">Ainda não há avaliações. Seja o primeiro! 🎮</p>
              ) : (
                reviews.map((rev, idx) => (
                  <div key={rev.id || idx} className="gd-review-card">
                    <div className="gd-review-header">
                      <span className="gd-review-user">👤 {getNomeUsuario(rev)}</span>
                      <span className={`gd-review-badge ${rev.recomenda ? 'badge-yes' : 'badge-no'}`}>
                        {rev.recomenda ? '👍 RECOMENDA' : '👎 NÃO RECOMENDA'}
                      </span>
                    </div>
                    <p className="gd-review-text">"{rev.comentario}"</p>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </div>

      {/* ── RECOMENDAÇÕES ── */}
      {recommendedGames.length > 0 && (
        <div className="gd-recommendations">
          <h2>Você também pode gostar</h2>
          <div className="gd-rec-grid">
            {recommendedGames.map(rec => (
              <div key={rec.id} className="gd-rec-card" onClick={() => navigate(`/game/${rec.id}`)}>
                <img
                  src={rec.capaUrl || 'https://placehold.co/600x350/2D3748/A0AEC0?text=Sem+Capa'}
                  alt={rec.titulo}
                  onError={e => { e.target.onerror = null; e.target.src = 'https://placehold.co/600x350/2D3748/A0AEC0?text=Sem+Capa'; }}
                />
                <div className="gd-rec-info">
                  <h4>{rec.titulo}</h4>
                  <span>R$ {Number(rec.preco || 0).toFixed(2)}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

    </div>
  );
}
