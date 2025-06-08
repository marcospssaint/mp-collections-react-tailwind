import React from 'react'
import ReactDOM from 'react-dom/client'
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import App from './App'
import Movies from './pages/Movies'
import Books from './pages/Books'
import './index.css'
import Series from './pages/Series'
import Home from './pages/Home'

import { DataProvider } from './context/DataContext'

import ProtectedRoute from './ProtectedRoute';
import Login from './Login';

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <BrowserRouter>
      <Routes>
        {/* Rota pública de Login */}
        <Route path="/login" element={<Login />} />

        <Route path="/" element={
          <ProtectedRoute>
            <DataProvider>
              <App />
            </DataProvider>
          </ProtectedRoute>
        }>

          {/* Página inicial */}
          <Route path="/home" element={
            <ProtectedRoute>
              <Home />
            </ProtectedRoute>
          } />

          {/* Outras páginas */}
          <Route path="/movies" element={
            <ProtectedRoute>
              <Movies />
            </ProtectedRoute>
          } />
          <Route path="/series" element={
            <ProtectedRoute>
                <Series />
              </ProtectedRoute>
          } />
          <Route path="/books" element={
            <ProtectedRoute>
                <Books />
              </ProtectedRoute>
          } />
        </Route>
      </Routes>
    </BrowserRouter>
  </React.StrictMode>
)
