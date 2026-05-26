import React, { useState } from 'react';
import './Login.css';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const handleLogin = (e) => {
    e.preventDefault();
    console.log('Dados prontos para a API:', { email, password });
  };

  return (
    <div className="login-container">
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

      <div className="login-form-section">
        <div className="form-wrapper">
          <h2>Bem-vindo de volta</h2>
          <p className="form-subtitle">Entre com suas credenciais para continuar</p>

          <form onSubmit={handleLogin}>
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
                  required
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
                  required
                />
              </div>
            </div>

            <button type="submit" className="btn-primary">Entrar</button>
          </form>

          <div className="register-prompt">
            <p>Não possui uma conta?</p>
            <button className="btn-link">Criar Conta Grátis</button>
          </div>
        </div>
      </div>
    </div>
  );
}