// ProtectedRoute.js
// Componente wrapper para rotas protegidas pelo login

import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';

function ProtectedRoute({ children }) {
  // Verifica se o usuário está autenticado pelo localStorage
  const isAuthenticated = localStorage.getItem('username') !== null;

  if (!isAuthenticated) {
    // Se não autenticado, redireciona para /login
    return <Navigate to="/login" replace />;
  }
   // Se o usuário estiver logado e acessando "/", redireciona para /home
  const location = useLocation();
  if (location.pathname === "/") return <Navigate to="/home" replace />;

  return children;
}

export default ProtectedRoute;
