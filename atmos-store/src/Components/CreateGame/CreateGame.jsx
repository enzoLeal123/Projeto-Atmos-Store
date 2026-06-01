import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import "./CreateGame.css";

const API_BASE = 'https://alunos-ads-api-production.up.railway.app';

export default function CreateGame() {
  const navigate = useNavigate();

  // Estados do formulário baseados nas classes do seu CSS
  const [titulo, setTitulo] = useState('');
  const [descricao, setDescricao] = useState('');
  const [desenvolvedora, setDesenvolvedora] = useState('');
  const [preco, setPreco] = useState('');
  const [lancamento, setLancamento] = useState('');
  const [capaUrl, setCapaUrl] = useState('');
  
  const [enviando, setEnviando] = useState(false);
  const [erro, setErro] = useState('');
  const [sucesso, setSucesso] = useState(false);

  const handleCriarJogo = async (e) => {
    e.preventDefault();
    setEnviando(true);
    setErro('');

    try {
      const token = localStorage.getItem('atmos_token');
      
      // Envia os dados para a API
      await axios.post(
        `${API_BASE}/jogos`,
        {
          titulo: titulo.trim(),
          descricao: descricao.trim(),
          desenvolvedora: desenvolvedora.trim(),
          preco: Number(preco) || 0,
          lancamento: lancamento,
          capaUrl: capaUrl.trim() || null,
          generos: [] // Caso sua API exija uma array inicial de gêneros
        },
        { headers: { token } }
      );

      setSucesso(true);
    } catch (err) {
      console.error(err);
      const msgErro = err?.response?.data?.mensagem || err?.response?.data?.erro || 'Erro ao criar o jogo. Verifique os dados.';
      setErro(msgErro);
    } finally {
      setEnviando(false);
    }
  };

  // Se o jogo foi criado com sucesso, exibe a tela de sucesso configurada no seu CSS
  if (sucesso) {
    return (
      <div className="cg-layout">
        <div className="cg-success-screen">
          <div className="cg-success-card">
            <div className="cg-success-icon">🎉</div>
            <h2>Jogo Criado!</h2>
            <p>O jogo <strong>{titulo}</strong> foi adicionado com sucesso ao catálogo.</p>
            <div className="cg-success-actions">
              <button className="cg-btn-primary" onClick={() => navigate('/store')}>
                Ir para a Loja
              </button>
              <button className="cg-btn-secondary" onClick={() => {
                setSucesso(false);
                setTitulo('');
                setDescricao('');
                setDesenvolvedora('');
                setPreco('');
                setLancamento('');
                setCapaUrl('');
              }}>
                Criar outro jogo
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="cg-layout">
      {/* ── HEADER ── */}
      <header className="store-header">
        <div className="logo-area" style={{ cursor: 'pointer' }} onClick={() => navigate('/store')}>
          <div className="logo-icon-bg">🎮</div>
          <div className="logo-text">
            <h2>Atmos Store</h2>
            <span>Game Store</span>
          </div>
        </div>
        <button className="cg-btn-back" onClick={() => navigate('/store')}>
          ← Cancelar
        </button>
      </header>

      {/* ── CONTEÚDO ── */}
      <div className="cg-content">
        {/* Sidebar de Dicas */}
        <aside className="cg-sidebar">
          <h3>Novo Jogo</h3>
          <p>Preencha os dados ao lado para disponibilizar o seu jogo na Atmos Store de Muriaé.</p>
          <div className="cg-tips">
            <div className="cg-tip">
              <span>💡</span>
              <div>
                <strong>Imagens de Capa</strong>
                <p>Utilize links de imagens hospedadas (ex: Imgur, Unsplash) para a capa aparecer corretamente.</p>
              </div>
            </div>
          </div>
        </aside>

        {/* Formulário */}
        <form className="cg-form" onSubmit={handleCriarJogo}>
          <h2>Cadastrar Jogo</h2>

          <div className="cg-field">
            <label>TÍTULO DO JOGO <span className="cg-required">*</span></label>
            <input 
              type="text" 
              required 
              placeholder="Ex: Sekiro: Shadows Die Twice" 
              value={titulo}
              onChange={e => setTitulo(e.target.value)}
            />
          </div>

          <div className="cg-field">
            <label>DESENVOLVEDORA <span className="cg-required">*</span></label>
            <input 
              type="text" 
              required 
              placeholder="Ex: FromSoftware" 
              value={desenvolvedora}
              onChange={e => setDesenvolvedora(e.target.value)}
            />
          </div>

          <div className="cg-row">
            <div className="cg-field">
              <label>PREÇO (R$) <span className="cg-required">*</span></label>
              <input 
                type="number" 
                step="0.01" 
                required 
                placeholder="0.00" 
                value={preco}
                onChange={e => setPreco(e.target.value)}
              />
            </div>
            <div className="cg-field">
              <label>DATA DE LANÇAMENTO</label>
              <input 
                type="text" 
                placeholder="Ex: 22/03/2019" 
                value={lancamento}
                onChange={e => setLancamento(e.target.value)}
              />
            </div>
          </div>

          <div className="cg-field">
            <label>URL DA CAPA</label>
            <input 
              type="url" 
              placeholder="https://exemplo.com/imagem.jpg" 
              value={capaUrl}
              onChange={e => setCapaUrl(e.target.value)}
            />
          </div>

          <div className="cg-field">
            <label>DESCRIÇÃO <span className="cg-required">*</span></label>
            <textarea 
              required 
              placeholder="Fale um pouco sobre a história e mecânicas do jogo..." 
              value={descricao}
              onChange={e => setDescricao(e.target.value)}
            />
          </div>

          {erro && (
            <div className="cg-error">
              <span>⚠️</span>
              <p>{erro}</p>
            </div>
          )}

          <div className="cg-actions">
            <button type="button" className="cg-btn-secondary" onClick={() => navigate('/store')} disabled={enviando}>
              Cancelar
            </button>
            <button type="submit" className="cg-btn-primary" disabled={enviando}>
              {enviando ? 'Salvando...' : 'Salvar Jogo'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}