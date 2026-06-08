import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import axios from 'axios';
import "./CreateGame.css";

const API_BASE = 'https://alunos-ads-api-production.up.railway.app';

export default function CreateGame() {
  const navigate = useNavigate();
  const { id } = useParams();
  const isEditMode = Boolean(id);

  // Estados do formulário
  const [titulo, setTitulo] = useState('');
  const [descricao, setDescricao] = useState('');
  const [desenvolvedora, setDesenvolvedora] = useState('');
  const [preco, setPreco] = useState('');
  const [lancamento, setLancamento] = useState('');
  const [capaUrl, setCapaUrl] = useState('');
  
  const [enviando, setEnviando] = useState(false);
  const [erro, setErro] = useState('');
  const [sucesso, setSucesso] = useState(false);

  // Efeito para carregar os dados do jogo caso seja modo Edição
  useEffect(() => {
    if (isEditMode) {
      const carregarJogo = async () => {
        try {
          const token = localStorage.getItem('atmos_token');
          const response = await axios.get(`${API_BASE}/jogos/${id}`, {
            headers: { token }
          });
          
          const jogo = response.data;
          
          // ── AJUSTE 1: Extrair apenas o ano se vier uma data completa (Ex: "2026-01-01..." -> "2026")
          let anoTratado = jogo.lancamento || '';
          if (anoTratado && anoTratado.includes('-')) {
            anoTratado = anoTratado.split('-')[0];
          }

          // Preenche o formulário com os dados tratados
          setTitulo(jogo.titulo || '');
          setDescricao(jogo.descricao || '');
          setDesenvolvedora(jogo.desenvolvedora || '');
          setPreco(jogo.preco || '');
          setLancamento(anoTratado);
          setCapaUrl(jogo.capaUrl || '');
        } catch (err) {
          console.error(err);
          setErro('Não foi possível carregar os dados do jogo para edição.');
        }
      };

      carregarJogo();
    }
  }, [id, isEditMode]);

  // Função para Salvar (Criar ou Atualizar)
  const handleSalvarJogo = async (e) => {
    e.preventDefault();
    setEnviando(true);
    setErro('');

    // ── AJUSTE 2: Garantir que o preço substitui vírgula por ponto antes de converter para Number
    const precoLimpo = String(preco).replace(',', '.');

    const dadosJogo = {
      titulo: titulo.trim(),
      descricao: descricao.trim(),
      desenvolvedora: desenvolvedora.trim(),
      preco: Number(precoLimpo) || 0,
      lancamento: String(lancamento).trim(), // Garante que o ano vai como string limpa
      capaUrl: capaUrl.trim() || null,
      generos: []
    };

    try {
      const token = localStorage.getItem('atmos_token');
      
      if (isEditMode) {
        // Rota de ATUALIZAR
        await axios.put(`${API_BASE}/jogos/${id}`, dadosJogo, { 
          headers: { token } 
        });
      } else {
        // Rota de CRIAR
        await axios.post(`${API_BASE}/jogos`, dadosJogo, { 
          headers: { token } 
        });
      }

      setSucesso(true);
    } catch (err) {
      console.error(err);
      const msgErro = err?.response?.data?.mensagem || err?.response?.data?.erro || 'Erro ao salvar o jogo. Verifique os dados.';
      setErro(msgErro);
    } finally {
      setEnviando(false);
    }
  };

  // Função para EXCLUIR o jogo
  const handleExcluirJogo = async () => {
    const confirmar = window.confirm(`Tem certeza que deseja excluir permanentemente o jogo "${titulo}"?`);
    if (!confirmar) return;

    setEnviando(true);
    setErro('');

    try {
      const token = localStorage.getItem('atmos_token');
      await axios.delete(`${API_BASE}/jogos/${id}`, { 
        headers: { token } 
      });

      alert('Jogo excluído com sucesso!');
      navigate('/store');
    } catch (err) {
      console.error(err);
      const msgErro = err?.response?.data?.mensagem || err?.response?.data?.erro || 'Erro ao excluir o jogo.';
      setErro(msgErro);
    } finally {
      setEnviando(false);
    }
  };

  if (sucesso) {
    return (
      <div className="cg-layout">
        <div className="cg-success-screen">
          <div className="cg-success-card">
            <div className="cg-success-icon">🎉</div>
            <h2>{isEditMode ? 'Jogo Atualizado!' : 'Jogo Criado!'}</h2>
            <p>O jogo <strong>{titulo}</strong> foi salvo com sucesso no catálogo.</p>
            <div className="cg-success-actions">
              <button className="cg-btn-primary" onClick={() => navigate('/store')}>
                Ir para a Loja
              </button>
              {!isEditMode && (
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
              )}
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
          ← Voltar para a Loja
        </button>
      </header>

      {/* ── CONTEÚDO ── */}
      <div className="cg-content">
        <aside className="cg-sidebar">
          <h3>{isEditMode ? 'Editar Jogo' : 'Novo Jogo'}</h3>
          <p>{isEditMode ? 'Modifique as informações necessárias para atualizar o catálogo.' : 'Preencha as informações do jogo para adicioná-lo ao catálogo da Atmos Store.'}</p>
          
          <div className="cg-tips">
            <div className="cg-tip"><span>📄</span><div><strong>Título</strong><p>Use o nome oficial.</p></div></div>
            <div className="cg-tip"><span>💰</span><div><strong>Preço</strong><p>Use ponto para decimais.</p></div></div>
            <div className="cg-tip"><span>📅</span><div><strong>Lançamento</strong><p>Informe o ano. Ex: 2024</p></div></div>
            <div className="cg-tip"><span>🏢</span><div><strong>Desenvolvedora</strong><p>Nome do estúdio.</p></div></div>
          </div>
        </aside>

        {/* Formulário */}
        <form className="cg-form" onSubmit={handleSalvarJogo}>
          <h2>{isEditMode ? 'Alterar Informações' : 'Informações do Jogo'}</h2>

          <div className="cg-field">
            <label>TÍTULO DO JOGO <span className="cg-required">*</span></label>
            <input type="text" required placeholder="Ex: The Last of Us" value={titulo} onChange={e => setTitulo(e.target.value)} />
          </div>

          <div className="cg-field">
            <label>DESCRIÇÃO <span className="cg-required">*</span></label>
            <textarea required placeholder="Descreva o jogo para os jogadores..." value={descricao} onChange={e => setDescricao(e.target.value)} />
          </div>

          <div className="cg-row">
            <div className="cg-field">
              <label>PREÇO (R$) <span className="cg-required">*</span></label>
              <input type="text" required placeholder="Ex: 59.90" value={preco} onChange={e => setPreco(e.target.value)} />
            </div>
            
            <div className="cg-field">
              <label>ANO DE LANÇAMENTO <span className="cg-required">*</span></label>
              <input type="text" required placeholder="Ex: 2024" value={lancamento} onChange={e => setLancamento(e.target.value)} />
            </div>
          </div>

          <div className="cg-field">
            <label>DESENVOLVEDORA <span className="cg-required">*</span></label>
            <input type="text" required placeholder="Ex: Naughty Dog" value={desenvolvedora} onChange={e => setDesenvolvedora(e.target.value)} />
          </div>

          <div className="cg-field">
            <label>URL DA CAPA</label>
            <input type="url" placeholder="https://exemplo.com/imagem.jpg" value={capaUrl} onChange={e => setCapaUrl(e.target.value)} />
          </div>

          {erro && (
            <div className="cg-error">
              <span>⚠️</span>
              <p>{erro}</p>
            </div>
          )}

          <div className="cg-actions" style={{ display: 'flex', justifyContent: 'space-between', width: '100%' }}>
            {isEditMode ? (
              <button type="button" className="btn-danger-delete" onClick={handleExcluirJogo} disabled={enviando}>
                🗑️ Excluir Jogo
              </button>
            ) : <div />}

            <div style={{ display: 'flex', gap: '12px' }}>
              <button type="button" className="cg-btn-secondary" onClick={() => navigate('/store')} disabled={enviando}>
                Cancelar
              </button>
              <button type="submit" className="cg-btn-primary" disabled={enviando}>
                {enviando ? 'Salvando...' : isEditMode ? '💾 Salvar Alterações' : '🎮 Criar Jogo'}
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}