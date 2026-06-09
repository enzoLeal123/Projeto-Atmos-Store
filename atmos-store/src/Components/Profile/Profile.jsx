import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import './Profile.css';

const API_BASE = 'https://alunos-ads-api-production.up.railway.app';

export default function Profile() {
  const navigate = useNavigate();
  const [usuario, setUsuario] = useState(null);
  const [loading, setLoading] = useState(true);
  const [jogosCriados, setJogosCriados] = useState([]);
  const [loadingJogos, setLoadingJogos] = useState(true);

  useEffect(() => {
    const carregar = async () => {
      try {
        const token = localStorage.getItem('atmos_token');
        if (!token) { navigate('/'); return; }

        // Busca dados do usuário
        const meRes = await axios.get(`${API_BASE}/auth/me`, { headers: { token } });
        setUsuario(meRes.data);

        // Busca jogos criados pelo usuário
        setLoadingJogos(true);
        const jogosRes = await axios.get(`${API_BASE}/jogos?limite=100&limit=100`);
        const todos = jogosRes.data.itens || [];
        const meus = todos.filter(j => String(j.autorId) === String(meRes.data.id));
        setJogosCriados(meus);
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
        setLoadingJogos(false);
      }
    };
    carregar();
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('atmos_token');
    navigate('/');
  };

  const getIniciais = (nome) => {
    if (!nome) return '?';
    const partes = nome.trim().split(' ');
    if (partes.length === 1) return partes[0][0].toUpperCase();
    return (partes[0][0] + partes[partes.length - 1][0]).toUpperCase();
  };

  const getRoleBadge = (role) => {
    if (role === 'ADMIN') return { label: 'Administrador', color: '#f59e0b' };
    return { label: 'Aluno', color: '#6366f1' };
  };

  const formatarData = (data) => {
    if (!data) return '—';
    return new Date(data).toLocaleDateString('pt-BR', { day: '2-digit', month: 'long', year: 'numeric' });
  };

  if (loading) return (
    <div className="pf-layout">
      <div className="pf-loading">Carregando perfil...</div>
    </div>
  );

  const badge = getRoleBadge(usuario?.role);
  const favorites = JSON.parse(localStorage.getItem('atmos_favorites') || '[]');

  return (
    <div className="pf-layout">

      {/* HEADER */}
      <header className="store-header">
        <div className="logo-area" style={{ cursor: 'pointer' }} onClick={() => navigate('/store')}>
          <div className="logo-icon-bg">🎮</div>
          <div className="logo-text"><h2>Atmos Store</h2><span>Game Store</span></div>
        </div>
        <div style={{ display: 'flex', gap: '0.75rem' }}>
          <button className="pf-btn-secondary" onClick={() => navigate('/store')}>← Voltar para a Loja</button>
          <button className="pf-btn-logout" onClick={handleLogout}>🚪 Sair</button>
        </div>
      </header>

      <div className="pf-content">

        {/* COLUNA ESQUERDA — Card do perfil */}
        <div className="pf-left">

          <div className="pf-card pf-identity">
            {/* Avatar com iniciais */}
            <div className="pf-avatar">
              <span>{getIniciais(usuario?.nome)}</span>
            </div>

            <div className="pf-identity-info">
              <h1 className="pf-name">{usuario?.nome || 'Usuário'}</h1>
              <span className="pf-role-badge" style={{ background: `${badge.color}22`, color: badge.color, borderColor: `${badge.color}44` }}>
                {badge.label}
              </span>
            </div>

            <div className="pf-meta">
              <div className="pf-meta-item">
                <span>🪪 Matrícula</span>
                <strong>{usuario?.matricula || '—'}</strong>
              </div>
              <div className="pf-meta-item">
                <span>📅 Membro desde</span>
                <strong>{formatarData(usuario?.createdAt)}</strong>
              </div>
            </div>

            <button className="pf-btn-logout full" onClick={handleLogout}>
              🚪 Encerrar Sessão
            </button>
          </div>

          {/* Stats */}
          <div className="pf-card pf-stats">
            <h3>Estatísticas</h3>
            <div className="pf-stats-grid">
              <div className="pf-stat">
                <strong>{usuario?._count?.jogosCriados ?? 0}</strong>
                <span>Jogos Criados</span>
              </div>
              <div className="pf-stat">
                <strong>{usuario?._count?.reviews ?? 0}</strong>
                <span>Avaliações</span>
              </div>
              <div className="pf-stat">
                <strong>{favorites.length}</strong>
                <span>Favoritos</span>
              </div>
              <div className="pf-stat">
                <strong>{usuario?._count?.biblioteca ?? 0}</strong>
                <span>Biblioteca</span>
              </div>
            </div>
          </div>

          {/* Ações rápidas */}
          <div className="pf-card pf-quick-actions">
            <h3>Ações Rápidas</h3>
            <button className="pf-action-btn" onClick={() => navigate('/library')}>
              <span>📚</span>
              <div><strong>Minha Biblioteca</strong><p>Ver favoritos e jogos criados</p></div>
            </button>
            <button className="pf-action-btn" onClick={() => navigate('/create-game')}>
              <span>➕</span>
              <div><strong>Criar Jogo</strong><p>Adicionar novo jogo ao catálogo</p></div>
            </button>
            <button className="pf-action-btn" onClick={() => navigate('/store')}>
              <span>🛍️</span>
              <div><strong>Explorar Loja</strong><p>Descobrir novos jogos</p></div>
            </button>
          </div>
        </div>

        {/* COLUNA DIREITA — Jogos criados */}
        <div className="pf-right">
          <div className="pf-card">
            <div className="pf-section-header">
              <h2>Meus Jogos</h2>
              <span className="pf-count">{jogosCriados.length} jogos</span>
            </div>

            {loadingJogos ? (
              <p className="pf-empty">Carregando...</p>
            ) : jogosCriados.length === 0 ? (
              <div className="pf-empty-state">
                <span>🎮</span>
                <p>Você ainda não criou nenhum jogo.</p>
                <button className="pf-btn-primary" onClick={() => navigate('/create-game')}>Criar meu primeiro jogo</button>
              </div>
            ) : (
              <div className="pf-games-list">
                {jogosCriados.map(jogo => (
                  <div key={jogo.id} className="pf-game-item" onClick={() => navigate(`/game/${jogo.id}`)}>
                    <div className="pf-game-thumb">
                      <img
                        src={jogo.capaUrl || 'https://placehold.co/80x60/1c1f2e/475569?text=🎮'}
                        alt={jogo.titulo}
                        onError={e => { e.target.onerror = null; e.target.src = 'https://placehold.co/80x60/1c1f2e/475569?text=🎮'; }}
                      />
                    </div>
                    <div className="pf-game-info">
                      <h4>{jogo.titulo}</h4>
                      <p>{jogo.descricao?.slice(0, 80)}{jogo.descricao?.length > 80 ? '...' : ''}</p>
                      <div className="pf-game-meta">
                        {Array.isArray(jogo.generos) && jogo.generos.slice(0, 2).map((g, i) => (
                          <span key={i} className="pf-tag">{g.nome}</span>
                        ))}
                        {(!jogo.generos || jogo.generos.length === 0) && <span className="pf-tag">Geral</span>}
                      </div>
                    </div>
                    <div className="pf-game-price">
                      <strong>R$ {Number(jogo.preco || 0).toFixed(2)}</strong>
                      <span>{jogo._count?.reviews ?? 0} reviews</span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

      </div>
    </div>
  );
}
