import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

const FormateurRoute = ({ children }) => {
  const { isAuthenticated, user, loading } = useAuth();
  const location = useLocation();

  console.log('FormateurRoute - Vérification d\'accès:', {
    isAuthenticated,
    userRole: user?.role,
    loading,
    path: location.pathname,
    userEmail: user?.email
  });

  if (loading) {
    console.log('FormateurRoute - État de chargement, affichage du spinner');
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-purple-500"></div>
      </div>
    );
  }

  if (!isAuthenticated) {
    console.log('FormateurRoute - Utilisateur non authentifié, redirection vers /login');
    console.log('Token dans localStorage:', !!localStorage.getItem('token'));
    console.log('User dans localStorage:', !!localStorage.getItem('user'));
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  if (!user) {
    console.log('FormateurRoute - Utilisateur null, redirection vers /login');
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  if (user.role !== 'formateur' && user.role !== 'admin') {
    console.log('FormateurRoute - Rôle incorrect, redirection vers /dashboard', {
      userRole: user.role,
      expectedRoles: ['formateur', 'admin']
    });
    return <Navigate to="/dashboard" replace />;
  }

  console.log('FormateurRoute - Accès autorisé pour', user.role, '- affichage des enfants');
  return children;
};

export default FormateurRoute;
