// Login.js
// Componente de login com apenas campo de username

import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

function Login() {
  const [username, setUsername] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();

  // Função para gerar hash SHA-256 a partir do username
  async function hashUsername(str) {
    const encoder = new TextEncoder();
    const data = encoder.encode(str);
    
    const hashBuffer = await crypto.subtle.digest('SHA-256', data);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    // Converte o hash para string hexadecimal
    const hashHex = hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
    return hashHex;
  }

  const handleSubmit = async (e) => {
    e.preventDefault();
    const inputHash = await hashUsername(username);
    // Compara o hash do input com o hash armazenado na variável de ambiente
    if (inputHash === process.env.REACT_APP_AUTH_HASH) {
      // Se correto, armazena o login e navega para a rota protegida (Home)
      localStorage.setItem('username', username);
      navigate('/');
    } else {
      setError('Username incorreto.');
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100">
      <div className="bg-white p-8 rounded shadow-md w-full max-w-xs">
        <h2 className="text-2xl font-bold mb-6 text-center">Login</h2>
        <form onSubmit={handleSubmit}>
          <input
            type="text"
            placeholder="Username"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            className="w-full border p-2 mb-4"
          />
          <button
            type="submit"
            className="w-full bg-blue-500 text-white p-2 rounded hover:bg-blue-600"
          >
            Entrar
          </button>
        </form>
        {error && <p className="text-red-500 mt-4 text-center">{error}</p>}
      </div>
    </div>
  );
}

export default Login;
