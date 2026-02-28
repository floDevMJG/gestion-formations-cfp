import axios from 'axios';

const isLocalhost = typeof window !== 'undefined' && window.location && window.location.hostname === 'localhost';
const apiBase =
  isLocalhost
    ? (process.env.REACT_APP_API_URL || 'http://localhost:5000/api')
    : (process.env.REACT_APP_API_URL || '/api');

const api = axios.create({
  baseURL: apiBase,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 8000, // 8 secondes timeout pour toutes les requêtes
});

// Ajout automatique du token d'authentification
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Gestion des erreurs
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      const url = error.config?.url || '';
      // Ne pas rediriger pour les endpoints d'auth publique
      const skipRedirect = url.includes('/auth/login') || url.includes('/auth/verify-formateur-code') || url.includes('/auth/register');
      if (!skipRedirect) {
        localStorage.removeItem('token');
        window.location.href = '/login';
      }
    } else if (!error.response) {
      // Erreur réseau - le serveur n'est probablement pas accessible
      console.error('Erreur de connexion réseau:', error.message);
      if (error.code === 'ECONNREFUSED' || error.message.includes('Network Error')) {
        console.error('Le serveur backend n\'est pas accessible. Assurez-vous qu\'il est démarré.');
      }
    }
    return Promise.reject(error);
  }
);

export default api;
