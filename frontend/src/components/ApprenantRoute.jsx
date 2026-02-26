import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

const ApprenantRoute = ({ children }) => {
  const { isAuthenticated, user, loading } = useAuth();
  const location = useLocation();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // Vérifier le rôle depuis localStorage aussi
  let userRole = user?.role;
  let userStatut = user?.statut;
  
  if (!userRole || !userStatut) {
    const userStr = localStorage.getItem('user');
    if (userStr) {
      try {
        const userObj = JSON.parse(userStr);
        userRole = userObj.role;
        userStatut = userObj.statut;
      } catch (e) {
        console.error('Erreur parsing user:', e);
      }
    }
  }

  // Bloquer l'accès aux comptes admin et formateur
  if (userRole === 'admin' || userRole === 'formateur') {
    return <Navigate to="/login" replace />;
  }

  // Vérifier que le compte est validé (pour les apprenants)
  if (userRole === 'apprenant' && userStatut !== 'valide') {
    if (userStatut === 'en_attente') {
      return <Navigate to="/en-attente" replace />;
    }
    if (userStatut === 'rejete') {
      return <Navigate to="/login" replace />;
    }
  }

  return children;
};

export default ApprenantRoute;
