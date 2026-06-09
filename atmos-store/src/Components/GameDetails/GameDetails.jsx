import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import './GameDetails.css';

const API_BASE = 'https://alunos-ads-api-production.up.railway.app';

export default function GameDetails() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [game, setGame] = useState(null);
  const [recommendedGames, setRecommendedGames] = useState([]);
  const [loading, setLoading] = useState(true);
  const [usuarioLogadoId, setUsuarioLogadoId] = useState(null);
  const [isOwner, setIsOwner] = useState(false);

  // Estados de edição
  const [editando, setEditando] = useState(false);
  const [formEdicao, setFormEdicao] = useState({ titulo: '', descricao: '', preco: '', desenvolvedora: '', lancamento: '' });
  const [salvandoEdicao, setSalvandoEdicao] = useState(false);
  const [erroEdicao, setErroEdicao] = useState('');

  // Estados de exclusão
  const [confirmandoExclusao, setConfirmandoExclusao] = useState(false);
  const [excluindo, setExcluindo] = useState(false);

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

  // Busca usuário logado
  useEffect(() => {
    const buscarUsuario = async () => {
      try {
        const token = localStorage.getItem('atmos_token');
        if (!token) return;
        const res = await axios.get(`${API_BASE}/auth/me`, { headers: { token } });
        setUsuarioLogadoId(res.data?.id);
      } catch (e) {}
    };
    buscarUsuario();
  }, []);

  // Carrega jogo
  useEffect(() => {
    const carregar = async () => {
      try {
        setLoading(true);
        const resposta = await axios.get(`${API_BASE}/jogos?limite=100&limit=100`);
        const listaJogos = resposta.data.itens || [];
        const jogoEncontrado = listaJogos.find(g => String(g.id) === String(id));

        if (jogoEncontrado) {
          setGame(jogoEncontrado);
          setFormEdicao({
            titulo: jogoEncontrado.titulo || '',
            descricao: jogoEncontrado.descricao || '',
            preco: jogoEncontrado.preco || '',
            desenvolvedora: jogoEncontrado.desenvolvedora || '',
            lancamento: jogoEncontrado.lancamento ? new Date(jogoEncontrado.lancamento).getFullYear().toString() : '',
          });

          const generosAtuais = Array.isArray(jogoEncontrado.generos)
            ? jogoEncontrado.generos.map(g => g.nome.toLowerCase()) : [];
          const recomendados = listaJogos.filter(g => {
            if (String(g.id) === String(id)) return false;
            const outros = Array.isArray(g.generos) ? g.generos.map(gen => gen.nome.toLowerCase()) : [];
            return outros.some(gen => generosAtuais.includes(gen));
          });
          setRecommendedGames(recomendados.slice(0, 3));
        } else {
          setGame(null);
        }
      } catch (erro) {
        setGame(null);
      } finally {
        setLoading(false);
      }
    };
    if (id) carregar();
  }, [id]);

  // Verifica se é dono após carregar jogo e usuário
  useEffect(() => {
    if (game && usuarioLogadoId) {
      setIsOwner(String(game.autorId) === String(usuarioLogadoId));
    }
  }, [game, usuarioLogadoId]);

  const carregarReviews = async () => {
    try {
      setLoadingReviews(true);
      const res = await axios.get(`${API_BASE}/jogos/${id}/reviews`);
      const lista = Array.isArray(res.data) ? res.data : res.data?.itens || res.data?.data || res.data?.reviews || [];
      setReviews(lista);
    } catch (erro) {
      setReviews([]);
    } finally {
      setLoadingReviews(false);
    }
  };

  useEffect(() => { if (id) carregarReviews(); }, [id]);

  const toggleFavorite = () => {
    if (!game) return;
    const updatedFavorites = favorites.some(f => f.id === game.id)
      ? favorites.filter(f => f.id !== game.id)
      : [...favorites, game];
    setFavorites(updatedFavorites);
    localStorage.setItem('atmos_favorites', JSON.stringify(updatedFavorites));
  };

  const handleSalvarEdicao = async (e) => {
    e.preventDefault();
    setErroEdicao('');
    setSalvandoEdicao(true);
    try {
      const token = localStorage.getItem('atmos_token');
      await axios.put(
        `${API_BASE}/jogos/${id}`,
        {
          titulo: formEdicao.titulo,
          descricao: formEdicao.descricao,
          preco: formEdicao.preco,
          desenvolvedora: formEdicao.desenvolvedora,
          lancamento: formEdicao.lancamento,
        },
        { headers: { token } }
      );
      setGame(prev => ({ ...prev, ...formEdicao }));
      setEditando(false);
    } catch (err) {
      const msg = err?.response?.data?.mensagem || err?.response?.data?.message || 'Erro ao salvar alterações.';
      setErroEdicao(msg);
    } finally {
      setSalvandoEdicao(false);
    }
  };

  const handleExcluir = async () => {
    setExcluindo(true);
    try {
      const token = localStorage.getItem('atmos_token');
      await axios.delete(`${API_BASE}/jogos/${id}`, { headers: { token } });
      navigate('/store');
    } catch (err) {
      setConfirmandoExclusao(false);
      setExcluindo(false);
      alert('Erro ao excluir o jogo. Tente novamente.');
    }
  };

  const handleEnviarReview = async (e) => {
    e.preventDefault();
    if (!comentario.trim()) return;
    setErroReview(''); setSucessoReview(false); setEnviandoReview(true);
    try {
      const token = localStorage.getItem('atmos_token');
      await axios.post(`${API_BASE}/jogos/${id}/reviews`, { comentario: comentario.trim(), recomenda }, { headers: { token } });
      setComentario(''); setRecomenda(true); setSucessoReview(true);
      setTimeout(() => setSucessoReview(false), 3000);
      await carregarReviews();
    } catch (err) {
      const serverMsg = err?.response?.data?.mensagem || err?.response?.data?.message || null;
      setErroReview(serverMsg || 'Erro ao enviar avaliação. Tente novamente.');
    } finally {
      setEnviandoReview(false);
    }
  };

  const getNomeUsuario = (rev) => {
    if (rev.usuario && typeof rev.usuario === 'object') {
      if (rev.usuario.nome) return rev.usuario.nome;
      if (rev.usuario.name) return rev.usuario.name;
    }
    if (typeof rev.usuario === 'string') return rev.usuario;
    if (typeof rev.nomeUsuario === 'string') return rev.nomeUsuario;
    if (typeof rev.autor === 'string') return rev.autor;
    return 'Jogador Anônimo';
  };

  if (loading) return <div className="gd-layout"><div className="gd-loading">Carregando...</div></div>;

  if (!game) return (
    <div className="gd-layout">
      <header className="store-header">
        <div className="logo-area" style={{ cursor: 'pointer' }} onClick={() => navigate('/store')}>
          <div className="logo-icon-bg">🎮</div>
          <div className="logo-text"><h2>Atmos Store</h2><span>Game Store</span></div>
        </div>
        <button className="gd-btn-back" onClick={() => navigate('/store')}>← Voltar para a Loja</button>
      </header>
      <div className="gd-loading">Jogo não encontrado.</div>
    </div>
  );

  const isFavorited = favorites.some(f => f.id === game.id);
  const listaReviews = Array.isArray(reviews) ? reviews : [];
  const totalRecomenda = listaReviews.filter(r => r.recomenda === true).length;
  const pctRecomenda = listaReviews.length > 0 ? Math.round((totalRecomenda / listaReviews.length) * 100) : 0;

  return (
    <div className="gd-layout">

      {/* HEADER */}
      <header className="store-header">
        <div className="logo-area" style={{ cursor: 'pointer' }} onClick={() => navigate('/store')}>
          <div className="logo-icon-bg">🎮</div>
          <div className="logo-text"><h2>Atmos Store</h2><span>Game Store</span></div>
        </div>
        <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center' }}>
          {isOwner && !editando && (
            <>
              <button className="gd-btn-edit" onClick={() => setEditando(true)}>✏️ Editar</button>
              <button className="gd-btn-delete" onClick={() => setConfirmandoExclusao(true)}>🗑️ Excluir</button>
            </>
          )}
          <button className="gd-btn-back" onClick={() => navigate('/store')}>← Voltar para a Loja</button>
        </div>
      </header>

      {/* MODAL DE CONFIRMAÇÃO DE EXCLUSÃO */}
      {confirmandoExclusao && (
        <div className="gd-modal-overlay">
          <div className="gd-modal">
            <h3>Excluir jogo?</h3>
            <p>Tem certeza que deseja excluir <strong>"{game.titulo}"</strong>? Esta ação não pode ser desfeita.</p>
            <div className="gd-modal-actions">
              <button className="gd-btn-back" onClick={() => setConfirmandoExclusao(false)} disabled={excluindo}>Cancelar</button>
              <button className="gd-btn-delete" onClick={handleExcluir} disabled={excluindo}>
                {excluindo ? 'Excluindo...' : '🗑️ Confirmar Exclusão'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* HERO */}
      <div className="gd-hero">
        <img
          src={game.capaUrl || 'https://placehold.co/1200x400/2D3748/A0AEC0?text=Sem+Capa'}
          alt={game.titulo} className="gd-hero-img"
          onError={e => { e.target.onerror = null; e.target.src = 'https://placehold.co/1200x400/2D3748/A0AEC0?text=Sem+Capa'; }}
        />
        <div className="gd-hero-overlay" />
      </div>

      {/* CONTEÚDO PRINCIPAL */}
      <div className="gd-content">
        <div className="gd-main-col">

          {/* FORMULÁRIO DE EDIÇÃO */}
          {editando ? (
            <form className="gd-edit-form" onSubmit={handleSalvarEdicao}>
              <h2>Editando: {game.titulo}</h2>

              <div className="gd-edit-field">
                <label>TÍTULO</label>
                <input type="text" value={formEdicao.titulo} onChange={e => setFormEdicao({...formEdicao, titulo: e.target.value})} />
              </div>
              <div className="gd-edit-field">
                <label>DESCRIÇÃO</label>
                <textarea rows="4" value={formEdicao.descricao} onChange={e => setFormEdicao({...formEdicao, descricao: e.target.value})} />
              </div>
              <div className="gd-edit-row">
                <div className="gd-edit-field">
                  <label>PREÇO</label>
                  <input type="number" step="0.01" value={formEdicao.preco} onChange={e => setFormEdicao({...formEdicao, preco: e.target.value})} />
                </div>
                <div className="gd-edit-field">
                  <label>ANO DE LANÇAMENTO</label>
                  <input type="text" maxLength={4} value={formEdicao.lancamento} onChange={e => setFormEdicao({...formEdicao, lancamento: e.target.value})} />
                </div>
              </div>
              <div className="gd-edit-field">
                <label>DESENVOLVEDORA</label>
                <input type="text" value={formEdicao.desenvolvedora} onChange={e => setFormEdicao({...formEdicao, desenvolvedora: e.target.value})} />
              </div>

              {erroEdicao && (
                <div className="gd-review-error"><span>⚠️</span><p>{erroEdicao}</p></div>
              )}

              <div className="gd-edit-actions">
                <button type="button" className="gd-btn-back" onClick={() => { setEditando(false); setErroEdicao(''); }}>Cancelar</button>
                <button type="submit" className="gd-btn-buy" disabled={salvandoEdicao}>
                  {salvandoEdicao ? 'Salvando...' : '💾 Salvar Alterações'}
                </button>
              </div>
            </form>
          ) : (
            <>
              <div className="gd-title-row">
                <div>
                  <span className="gd-dev">{game.desenvolvedora || 'Estúdio Indie'}</span>
                  <h1 className="gd-title">{game.titulo}</h1>
                </div>
                <button className={`gd-btn-fav ${isFavorited ? 'is-fav' : ''}`} onClick={toggleFavorite}>
                  {isFavorited ? '⭐' : '☆'}
                </button>
              </div>

              <div className="gd-tags">
                {Array.isArray(game.generos) && game.generos.map((g, i) => <span key={i} className="tag">{g.nome}</span>)}
              </div>

              <p className="gd-description">{game.descricao || 'Sem descrição cadastrada.'}</p>

              <div className="gd-buy-card">
                <div className="gd-price-block">
                  <span className="gd-price-label">Preço</span>
                  <strong className="gd-price">R$ {Number(game.preco || 0).toFixed(2)}</strong>
                </div>
                <button className="gd-btn-buy">Comprar Agora</button>
              </div>

              {listaReviews.length > 0 && (
                <div className="gd-score-bar">
                  <span className="gd-score-label">
                    {pctRecomenda >= 80 ? '👍 Muito Positivo' : pctRecomenda >= 50 ? '😐 Misto' : '👎 Negativo'}
                  </span>
                  <span className="gd-score-pct">{pctRecomenda}% recomendam ({listaReviews.length} avaliações)</span>
                  <div className="gd-score-track">
                    <div className="gd-score-fill" style={{ width: `${pctRecomenda}%` }} />
                  </div>
                </div>
              )}
            </>
          )}
        </div>

        <div className="gd-side-col">
          <div className="gd-info-card">
            <h3>Informações</h3>
            <div className="gd-info-row"><span>Desenvolvedora</span><strong>{game.desenvolvedora || '—'}</strong></div>
            <div className="gd-info-row"><span>Gêneros</span><strong>{Array.isArray(game.generos) && game.generos.length > 0 ? game.generos.map(g => g.nome).join(', ') : '—'}</strong></div>
            <div className="gd-info-row">
              <span>Lançamento</span>
              <strong>{game.lancamento ? new Date(game.lancamento).getFullYear() : '—'}</strong>
            </div>
            <div className="gd-info-row"><span>Preço</span><strong className="gd-info-price">R$ {Number(game.preco || 0).toFixed(2)}</strong></div>
          </div>
        </div>
      </div>

      {/* AVALIAÇÕES */}
      <div className="gd-reviews-section">
        <h2>Avaliações dos Usuários</h2>
        <div className="gd-reviews-grid">
          <form className="gd-review-form" onSubmit={handleEnviarReview}>
            <h3>Deixe sua análise</h3>
            <p className="gd-form-label">Você recomenda este jogo?</p>
            <div className="gd-rec-buttons">
              <button type="button" className={`gd-btn-rec yes ${recomenda === true ? 'active' : ''}`} onClick={() => setRecomenda(true)}>👍 Sim, recomendo</button>
              <button type="button" className={`gd-btn-rec no ${recomenda === false ? 'active' : ''}`} onClick={() => setRecomenda(false)}>👎 Não recomendo</button>
            </div>
            <p className="gd-form-label">Escreva sua análise:</p>
            <textarea rows="5" placeholder="Conte para a comunidade o que você achou do jogo..." value={comentario} onChange={e => { setComentario(e.target.value); setErroReview(''); }} className="gd-textarea" required />
            {erroReview && <div className="gd-review-error"><span>⚠️</span><p>{erroReview}</p></div>}
            {sucessoReview && <div className="gd-review-success"><span>✅</span><p>Avaliação publicada com sucesso!</p></div>}
            <button type="submit" className="gd-btn-submit" disabled={enviandoReview}>
              {enviandoReview ? 'Enviando...' : 'Publicar Análise'}
            </button>
          </form>

          <div className="gd-reviews-list">
            <h3>Análises mais recentes {!loadingReviews && <span className="gd-reviews-count">({listaReviews.length})</span>}</h3>
            <div className="gd-reviews-scroll">
              {loadingReviews ? <p className="gd-no-reviews">Carregando avaliações...</p>
              : listaReviews.length === 0 ? <p className="gd-no-reviews">Ainda não há avaliações. Seja o primeiro! 🎮</p>
              : listaReviews.map((rev, idx) => (
                <div key={rev.id || idx} className="gd-review-card">
                  <div className="gd-review-header">
                    <span className="gd-review-user">👤 {getNomeUsuario(rev)}</span>
                    <span className={`gd-review-badge ${rev.recomenda ? 'badge-yes' : 'badge-no'}`}>
                      {rev.recomenda ? '👍 RECOMENDA' : '👎 NÃO RECOMENDA'}
                    </span>
                  </div>
                  <p className="gd-review-text">"{rev.comentario}"</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* RECOMENDAÇÕES */}
      {recommendedGames.length > 0 && (
        <div className="gd-recommendations">
          <h2>Você também pode gostar</h2>
          <div className="gd-rec-grid">
            {recommendedGames.map(rec => (
              <div key={rec.id} className="gd-rec-card" onClick={() => navigate(`/game/${rec.id}`)}>
                <img src={rec.capaUrl || 'https://placehold.co/600x350/2D3748/A0AEC0?text=Sem+Capa'} alt={rec.titulo}
                  onError={e => { e.target.onerror = null; e.target.src = 'https://placehold.co/600x350/2D3748/A0AEC0?text=Sem+Capa'; }} />
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
