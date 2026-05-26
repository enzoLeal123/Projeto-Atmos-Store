import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './Login.css';

export default function Login() {
  const navigate = useNavigate();
  const [isRegisterMode, setIsRegisterMode] = useState(false);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    
    // Removi as validações. Clicou no botão, ele navega direto pra loja!
    navigate('/store'); 
  };

  const toggleMode = () => {
    setIsRegisterMode(!isRegisterMode);
    setName('');
    setEmail('');
    setPassword('');
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
                    onChange={(e) => setName(e.target.value)}
                    /* Removido o 'required' daqui */
                  />
                </div>
              </div>
            )}

            <div className="input-group">
              <label htmlFor="email">EMAIL</label>
              <div className="input-wrapper">
                <span className="input-icon">✉️</span>
                <input 
                  type="email" 
                  id="email"
                  placeholder="seu@email.com" 
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  /* Removido o 'required' daqui */
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
                  onChange={(e) => setPassword(e.target.value)}
                  /* Removido o 'required' daqui */
                />
              </div>
            </div>

            <button type="submit" className="btn-primary">
              {isRegisterMode ? 'Cadastrar' : 'Entrar'}
            </button>
          </form>

          <div className="register-prompt">
            <p>{isRegisterMode ? 'Já possui uma conta?' : 'Não possui uma conta?'}</p>
            <button 
              type="button" 
              className="btn-link" 
              onClick={toggleMode}
            >
              {isRegisterMode ? 'Fazer Login' : 'Criar Conta Grátis'}
            </button>
          </div>

        </div>
      </div>
    </div>
  );
}