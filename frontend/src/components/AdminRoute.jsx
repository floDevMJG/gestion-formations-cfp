import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

const AdminRoute = ({ children }) => {
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

  // Vérifier le rôle depuis localStorage aussi au cas où user n'est pas encore chargé
  let userRole = user?.role;
  if (!userRole) {
    const userStr = localStorage.getItem('user');
    if (userStr) {
      try {
        const userObj = JSON.parse(userStr);
        userRole = userObj.role;
      } catch (e) {
        console.error('Erreur parsing user:', e);
      }
    }
  }

  if (userRole !== 'admin') {
    console.log('AdminRoute: Redirection - rôle non admin:', userRole); // Debug
    return <Navigate to="/dashboard" replace />;
  }

  return children;
};

export default AdminRoute;
