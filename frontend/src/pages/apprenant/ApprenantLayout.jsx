import React from 'react';
import { Outlet, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { FiHome, FiBook, FiCalendar, FiDownload, FiAward, FiUser, FiLogOut, FiMenu, FiChevronDown, FiLayers, FiBell } from 'react-icons/fi';
import { FaGraduationCap } from 'react-icons/fa';
import NotificationBell from '../../components/NotificationBell';

const NavItem = ({ icon, text, active, onClick }) => (
  <button
    onClick={onClick}
    className={`flex items-center w-full px-4 py-3 text-sm font-medium rounded-lg transition-colors duration-200 hover-lift ${
      active 
        ? 'bg-white/20 text-white' 
        : 'text-blue-100 hover:bg-white/10'
    }`}
  >
    <span className="mr-3">{icon}</span>
    {text}
  </button>
);

export default function ApprenantLayout() {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, logout } = useAuth();
  const [userMenuOpen, setUserMenuOpen] = React.useState(false);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const getNavItems = () => [
    { path: '/dashboard', icon: <FiBook className="w-5 h-5" />, text: 'Mes formations' },
    { path: '/cours-apprenant', icon: <FiDownload className="w-5 h-5" />, text: 'Mes Cours' },
    { path: '/emploi-du-temps-apprenant', icon: <FiCalendar className="w-5 h-5" />, text: 'Emploi du temps' },
    { path: '/annonces-apprenant', icon: <FiBell className="w-5 h-5" />, text: 'Annonces' },
    { path: '/certifications', icon: <FiAward className="w-5 h-5" />, text: 'Certifications' },
    { path: '/profile-apprenant', icon: <FiUser className="w-5 h-5" />, text: 'Mon Profil' },
  ];

  return (
    <div className="min-h-screen bg-app-gradient flex">
      {/* Sidebar */}
      <div className="hidden md:flex md:flex-shrink-0">
        <div className="flex flex-col w-64 bg-gradient-to-b from-blue-800 to-blue-900 text-white shadow-xl">
          <div className="flex items-center justify-center h-16 px-4 border-b border-blue-700">
            <div className="flex items-center">
              <FaGraduationCap className="h-8 w-8 text-blue-300 mr-2 animate-float" />
              <span className="text-xl font-bold text-white">EduFormation</span>
            </div>
          </div>
          <div className="flex flex-col flex-grow px-4 py-6 overflow-y-auto">
            <div className="flex items-center px-4 py-3 mb-8 bg-white/10 rounded-lg">
              <div className="flex-shrink-0">
                <div className="w-10 h-10 rounded-full bg-blue-500 flex items-center justify-center text-white font-semibold shadow-md">
                  {user?.prenom?.charAt(0)}{user?.nom?.charAt(0)}
                </div>
              </div>
              <div className="ml-3">
                <p className="text-sm font-medium text-white">{user?.prenom} {user?.nom}</p>
                <p className="text-xs font-medium text-blue-200">Apprenant</p>
              </div>
            </div>
            
            <nav className="flex-1 space-y-1">
              {getNavItems().map(item => (
                <NavItem 
                  key={item.path}
                  icon={item.icon} 
                  text={item.text} 
                  active={location.pathname === item.path}
                  onClick={() => navigate(item.path)}
                />
              ))}
            </nav>

            <div className="mt-auto pb-4">
              <NavItem
                icon={<FiLogOut className="w-5 h-5" />}
                text="Déconnexion"
                onClick={handleLogout}
              />
            </div>
          </div>
        </div>
      </div>

      {/* Main content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Top navigation */}
        <header className="bg-white/90 backdrop-blur shadow-sm z-10">
          <div className="flex items-center justify-between px-6 py-4">
            <div className="flex items-center md:hidden">
              <button className="text-gray-500 hover:text-gray-600">
                <FiMenu className="w-6 h-6" />
              </button>
            </div>
            
            <div className="flex-1 flex justify-between items-center">
              <h1 className="text-xl font-bold text-gray-800 ml-4 md:ml-0">
                {getNavItems().find(item => item.path === location.pathname)?.text || 'Apprenant'}
              </h1>
              <div className="flex items-center space-x-4">
                <NotificationBell />
                <div className="relative">
                  <div className="flex items-center space-x-2">
                    <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 font-semibold">
                      {user?.prenom?.charAt(0)}
                    </div>
                    <span className="hidden md:inline-block text-sm font-medium text-gray-700">
                      {user?.prenom} {user?.nom}
                    </span>
                    <button
                      aria-label="Ouvrir le menu utilisateur"
                      onClick={() => setUserMenuOpen((v) => !v)}
                      className="flex items-center justify-center w-6 h-6 rounded hover:bg-gray-100"
                    >
                      <FiChevronDown className="w-4 h-4 text-gray-600" />
                    </button>
                  </div>
                  {userMenuOpen && (
                    <div className="absolute right-0 mt-2 w-48 bg-white/95 backdrop-blur rounded-md shadow-lg py-1 z-20 animate-fade-in">
                      <button 
                        onClick={handleLogout}
                        className="flex items-center w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                      >
                        <FiLogOut className="w-4 h-4 mr-2" />
                        Déconnexion
                      </button>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </header>

        {/* Page content */}
        <main className="flex-1 overflow-y-auto bg-transparent p-4 md:p-8">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
