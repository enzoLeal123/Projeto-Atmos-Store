import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import './Login.css';

const API_BASE = 'https://alunos-ads-api-production.up.railway.app';

export default function Login() {
  const navigate = useNavigate();
  const [isRegisterMode, setIsRegisterMode] = useState(false);
  const [name, setName] = useState('');
  const [matricula, setMatricula] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [shake, setShake] = useState(false);

  const triggerShake = (msg) => {
    setError(msg);
    setShake(true);
    setTimeout(() => setShake(false), 500);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (isRegisterMode && !name.trim()) {
      triggerShake('Por favor, preencha o seu nome completo.');
      return;
    }
    if (!matricula.trim()) {
      triggerShake('Por favor, preencha a sua matrícula.');
      return;
    }
    if (!password.trim()) {
      triggerShake('Por favor, preencha a sua senha.');
      return;
    }

    setLoading(true);

    try {
      if (isRegisterMode) {
        // CADASTRO
        await axios.post(`${API_BASE}/auth/primeiro-acesso`, {
          nome: name.trim(),
          matricula: matricula.trim(),
          senha: password,
        });

        // Login automático após cadastro
        const loginRes = await axios.post(`${API_BASE}/auth/login`, {
          matricula: matricula.trim(),
          senha: password,
        });

        const token = loginRes.data?.token || loginRes.data?.accessToken || loginRes.data?.access_token;
        if (token) localStorage.setItem('atmos_token', token);
        navigate('/store');

      } else {
        // LOGIN
        const res = await axios.post(`${API_BASE}/auth/login`, {
          matricula: matricula.trim(),
          senha: password,
        });

        const token = res.data?.token || res.data?.accessToken || res.data?.access_token;
        if (token) localStorage.setItem('atmos_token', token);
        navigate('/store');
      }
    } catch (err) {
      const status = err?.response?.status;
      const serverMsg =
        err?.response?.data?.mensagem ||
        err?.response?.data?.message ||
        err?.response?.data?.erro ||
        err?.response?.data?.error ||
        null;

      if (status === 401 || status === 403) {
        triggerShake('Matrícula ou senha incorretos.');
      } else if (status === 409) {
        triggerShake('Esta matrícula já possui uma conta. Faça login.');
      } else if (status === 422) {
        triggerShake(serverMsg || 'Dados inválidos. Verifique os campos e tente novamente.');
      } else if (status === 404) {
        triggerShake('Matrícula não encontrada.');
      } else if (serverMsg?.toLowerCase().includes('senha definida') || serverMsg?.toLowerCase().includes('login')) {
        triggerShake('Esta matrícula já possui uma conta. Clique em "Fazer Login" abaixo.');
      } else if (serverMsg) {
        triggerShake(serverMsg);
      } else {
        triggerShake('Não foi possível conectar ao servidor. Tente novamente.');
      }
    } finally {
      setLoading(false);
    }
  };

  const toggleMode = () => {
    setIsRegisterMode(!isRegisterMode);
    setName('');
    setMatricula('');
    setPassword('');
    setError('');
  };

  return (
    <div className="login-container">
      {/* PAINEL ESQUERDO */}
      <div className="login-banner">
        <div className="banner-content">
          <div className="logo-icon">🎮</div>
          <h1>Atmos Store</h1>
          <p className="subtitle">Sua biblioteca de jogos na nuvem. Milhares de títulos esperando por você.</p>
          
          <div className="features-list">
            <div className="feature-item">
              <span className="feature-icon">✨</span>
              <div>
                <strong>Biblioteca Infinita</strong>
                <p>Acesse seus jogos de qualquer lugar</p>
              </div>
            </div>
            <div className="feature-item">
              <span className="feature-icon">👥</span>
              <div>
                <strong>Comunidade Ativa</strong>
                <p>Compartilhe reviews e descubra novos jogos</p>
              </div>
            </div>
            <div className="feature-item">
              <span className="feature-icon">🏆</span>
              <div>
                <strong>Ofertas Exclusivas</strong>
                <p>Descontos especiais para membros</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* PAINEL DIREITO */}
      <div className="login-form-section">
        <div className="form-wrapper">
          
          <h2>{isRegisterMode ? 'Criar nova conta' : 'Bem-vindo de volta'}</h2>
          <p className="form-subtitle">
            {isRegisterMode 
              ? 'Junte-se à Atmos Store e comece sua jornada' 
              : 'Entre com suas credenciais para continuar'}
          </p>

          <form onSubmit={handleSubmit}>

            {isRegisterMode && (
              <div className="input-group">
                <label htmlFor="name">NOME COMPLETO</label>
                <div className="input-wrapper">
                  <span className="input-icon">👤</span>
                  <input 
                    type="text" 
                    id="name"
                    placeholder="Seu nome" 
                    value={name}
                    onChange={(e) => { setName(e.target.value); setError(''); }}
                    disabled={loading}
                  />
                </div>
              </div>
            )}

            <div className="input-group">
              <label htmlFor="matricula">MATRÍCULA</label>
              <div className="input-wrapper">
                <span className="input-icon">🪪</span>
                <input 
                  type="text" 
                  id="matricula"
                  placeholder="Ex: XX-XXXXX" 
                  value={matricula}
                  onChange={(e) => { setMatricula(e.target.value); setError(''); }}
                  disabled={loading}
                />
              </div>
            </div>

            <div className="input-group">
              <label htmlFor="password">SENHA</label>
              <div className="input-wrapper">
                <span className="input-icon">🔒</span>
                <input 
                  type="password" 
                  id="password"
                  placeholder="••••••••" 
                  value={password}
                  onChange={(e) => { setPassword(e.target.value); setError(''); }}
                  disabled={loading}
                />
              </div>
            </div>

            {error && (
              <div style={{
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem',
                backgroundColor: 'rgba(252, 129, 129, 0.12)',
                border: '1px solid rgba(252, 129, 129, 0.4)',
                borderRadius: '8px',
                padding: '0.75rem 1rem',
                marginTop: '0.75rem',
                animation: shake ? 'shake 0.4s ease' : 'none',
              }}>
                <span style={{ fontSize: '1rem' }}>⚠️</span>
                <p style={{ color: '#FC8181', fontSize: '0.85rem', margin: 0 }}>
                  {error}
                </p>
              </div>
            )}

            <style>{`
              @keyframes shake {
                0%   { transform: translateX(0); }
                20%  { transform: translateX(-8px); }
                40%  { transform: translateX(8px); }
                60%  { transform: translateX(-5px); }
                80%  { transform: translateX(5px); }
                100% { transform: translateX(0); }
              }
            `}</style>

            <button type="submit" className="btn-primary" disabled={loading}>
              {loading
                ? (isRegisterMode ? 'Cadastrando...' : 'Entrando...')
                : (isRegisterMode ? 'Cadastrar' : 'Entrar')}
            </button>
          </form>

          <div className="register-prompt">
            <p>{isRegisterMode ? 'Já possui uma conta?' : 'Não possui uma conta?'}</p>
            <button 
              type="button" 
              className="btn-link" 
              onClick={toggleMode}
              disabled={loading}
            >
              {isRegisterMode ? 'Fazer Login' : 'Criar Conta Grátis'}
            </button>
          </div>

        </div>
      </div>
    </div>
  );
}
