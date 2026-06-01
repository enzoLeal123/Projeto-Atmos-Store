import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import './CreateGame.css';

const API_BASE = 'https://alunos-ads-api-production.up.railway.app';

export default function CreateGame() {
  const navigate = useNavigate();

  const [form, setForm] = useState({
    titulo: '',
    descricao: '',
    preco: '',
    desenvolvedora: '',
    lancamento: '',
  });

  const [loading, setLoading] = useState(false);
  const [erro, setErro] = useState('');
  const [sucesso, setSucesso] = useState(false);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
    setErro('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErro('');

    // Validações
    if (!form.titulo.trim()) { setErro('O título é obrigatório.'); return; }
    if (!form.descricao.trim()) { setErro('A descrição é obrigatória.'); return; }
    if (!form.preco || isNaN(Number(form.preco))) { setErro('Informe um preço válido.'); return; }
    if (!form.desenvolvedora.trim()) { setErro('A desenvolvedora é obrigatória.'); return; }
    if (!form.lancamento.trim()) { setErro('O ano de lançamento é obrigatório.'); return; }

    setLoading(true);
    try {
      const token = localStorage.getItem('atmos_token');
      await axios.post(
        `${API_BASE}/jogos`,
        {
          titulo: form.titulo.trim(),
          descricao: form.descricao.trim(),
          preco: form.preco,
          desenvolvedora: form.desenvolvedora.trim(),
          lancamento: form.lancamento.trim(),
        },
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      setSucesso(true);
    } catch (err) {
      const serverMsg =
        err?.response?.data?.mensagem ||
        err?.response?.data?.message ||
        err?.response?.data?.erro ||
        null;
      if (err?.response?.status === 403) {
        setErro('Você não tem permissão para criar jogos. É necessário ser administrador.');
      } else {
        setErro(serverMsg || 'Erro ao criar jogo. Tente novamente.');
      }
    } finally {
      setLoading(false);
    }
  };

  if (sucesso) return (
    <div className="cg-layout">
      <header className="store-header">
        <div className="logo-area" style={{ cursor: 'pointer' }} onClick={() => navigate('/store')}>
          <div className="logo-icon-bg">🎮</div>
          <div className="logo-text"><h2>Atmos Store</h2><span>Game Store</span></div>
        </div>
      </header>
      <div className="cg-success-screen">
        <div className="cg-success-card">
          <span className="cg-success-icon">🎉</span>
          <h2>Jogo criado com sucesso!</h2>
          <p>O jogo <strong>"{form.titulo}"</strong> foi adicionado ao catálogo.</p>
          <div className="cg-success-actions">
            <button className="cg-btn-primary" onClick={() => navigate('/store')}>Ver Catálogo</button>
            <button className="cg-btn-secondary" onClick={() => { setSucesso(false); setForm({ titulo: '', descricao: '', preco: '', desenvolvedora: '', lancamento: '' }); }}>
              Criar Outro Jogo
            </button>
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <div className="cg-layout">

      {/* HEADER */}
      <header className="store-header">
        <div className="logo-area" style={{ cursor: 'pointer' }} onClick={() => navigate('/store')}>
          <div className="logo-icon-bg">🎮</div>
          <div className="logo-text"><h2>Atmos Store</h2><span>Game Store</span></div>
        </div>
        <button className="cg-btn-back" onClick={() => navigate('/store')}>← Voltar para a Loja</button>
      </header>

      {/* CONTEÚDO */}
      <div className="cg-content">

        {/* Painel esquerdo — dicas */}
        <div className="cg-sidebar">
          <h3>Novo Jogo</h3>
          <p>Preencha as informações do jogo para adicioná-lo ao catálogo da Atmos Store.</p>

          <div className="cg-tips">
            <div className="cg-tip">
              <span>📝</span>
              <div>
                <strong>Título</strong>
                <p>Use o nome oficial do jogo.</p>
              </div>
            </div>
            <div className="cg-tip">
              <span>💰</span>
              <div>
                <strong>Preço</strong>
                <p>Use ponto como separador decimal. Ex: 59.90</p>
              </div>
            </div>
            <div className="cg-tip">
              <span>📅</span>
              <div>
                <strong>Lançamento</strong>
                <p>Informe o ano. Ex: 2024</p>
              </div>
            </div>
            <div className="cg-tip">
              <span>🏢</span>
              <div>
                <strong>Desenvolvedora</strong>
                <p>Nome do estúdio responsável.</p>
              </div>
            </div>
          </div>
        </div>

        {/* Formulário */}
        <form className="cg-form" onSubmit={handleSubmit}>
          <h2>Informações do Jogo</h2>

          <div className="cg-field">
            <label htmlFor="titulo">TÍTULO DO JOGO <span className="cg-required">*</span></label>
            <input
              id="titulo"
              name="titulo"
              type="text"
              placeholder="Ex: The Last of Us"
              value={form.titulo}
              onChange={handleChange}
              disabled={loading}
            />
          </div>

          <div className="cg-field">
            <label htmlFor="descricao">DESCRIÇÃO <span className="cg-required">*</span></label>
            <textarea
              id="descricao"
              name="descricao"
              rows="5"
              placeholder="Descreva o jogo para os jogadores..."
              value={form.descricao}
              onChange={handleChange}
              disabled={loading}
            />
          </div>

          <div className="cg-row">
            <div className="cg-field">
              <label htmlFor="preco">PREÇO (R$) <span className="cg-required">*</span></label>
              <input
                id="preco"
                name="preco"
                type="number"
                step="0.01"
                min="0"
                placeholder="Ex: 59.90"
                value={form.preco}
                onChange={handleChange}
                disabled={loading}
              />
            </div>

            <div className="cg-field">
              <label htmlFor="lancamento">ANO DE LANÇAMENTO <span className="cg-required">*</span></label>
              <input
                id="lancamento"
                name="lancamento"
                type="text"
                placeholder="Ex: 2024"
                maxLength={4}
                value={form.lancamento}
                onChange={handleChange}
                disabled={loading}
              />
            </div>
          </div>

          <div className="cg-field">
            <label htmlFor="desenvolvedora">DESENVOLVEDORA <span className="cg-required">*</span></label>
            <input
              id="desenvolvedora"
              name="desenvolvedora"
              type="text"
              placeholder="Ex: Naughty Dog"
              value={form.desenvolvedora}
              onChange={handleChange}
              disabled={loading}
            />
          </div>

          {/* Erro */}
          {erro && (
            <div className="cg-error">
              <span>⚠️</span>
              <p>{erro}</p>
            </div>
          )}

          {/* Ações */}
          <div className="cg-actions">
            <button type="button" className="cg-btn-secondary" onClick={() => navigate('/store')} disabled={loading}>
              Cancelar
            </button>
            <button type="submit" className="cg-btn-primary" disabled={loading}>
              {loading ? 'Criando jogo...' : '🎮 Criar Jogo'}
            </button>
          </div>
        </form>

      </div>
    </div>
  );
}
