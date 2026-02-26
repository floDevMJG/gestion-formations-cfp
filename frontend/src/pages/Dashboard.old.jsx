// ARCHIVE - Ancien Dashboard.jsx remplacé par DashboardApprenant.jsx
// Ce fichier est conservé pour référence historique

import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import API from '../services/api';

// Composant de carte de formation avec animations
const FormationCard = ({ formation, index }) => {
  const [isHovered, setIsHovered] = useState(false);
  const navigate = useNavigate();

  return (
    <div
      className="bg-white rounded-xl shadow-md overflow-hidden hover:shadow-2xl transition-all duration-500 transform hover:-translate-y-2"
      style={{
        animation: `fadeInUp 0.6s ease-out ${index * 0.1}s backwards`
      }}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <div className="h-2 bg-gradient-to-r from-blue-500 via-blue-600 to-blue-700"></div>
      <div className="p-6">
        <div className="flex justify-between items-start">
          <div className="flex-1">
            <h3 className="text-xl font-bold text-gray-800 mb-2 transition-colors duration-300 hover:text-blue-600">
              {formation.titre}
            </h3>
            <p className="text-gray-600 text-sm leading-relaxed">
              {formation.description || 'Aucune description disponible'}
            </p>
          </div>
          {formation.niveau && (
          <span className="bg-blue-100 text-blue-800 text-xs px-3 py-1 rounded-full font-semibold ml-4 whitespace-nowrap animate-pulse">
              {formation.niveau}
          </span>
          )}
        </div>

        <div className="mt-5 flex items-center text-sm text-gray-500 space-x-6">
          <div className="flex items-center transform transition-transform duration-300 hover:scale-110">
            <svg className="w-5 h-5 mr-2 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <span className="font-medium">
              {formation.duree}
              {formation.duree && typeof formation.duree === 'string' &&
               !formation.duree.includes('heure') &&
               !formation.duree.includes('mois') &&
               !formation.duree.includes('jour') &&
               !formation.duree.includes('h') ? ' heures' : ''}
            </span>
          </div>
          <div className="flex items-center transform transition-transform duration-300 hover:scale-110">
            <svg className="w-5 h-5 mr-2 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
            </svg>
            {formation.places && (
              <span className="font-medium">{formation.places} places</span>
            )}
          </div>
        </div>

        <div className="mt-5 pt-5 border-t border-gray-100 flex justify-between items-center">
          <div className="text-xs text-gray-500">
            📅 {new Date(formation.updatedAt || new Date()).toLocaleDateString('fr-FR')}
          </div>
          <button
            onClick={() => navigate(`/formation/${formation.id}`)}
            className="group relative inline-flex items-center text-blue-600 hover:text-blue-800 font-semibold text-sm transition-all duration-300"
          >
            <span>Voir détails</span>
            <svg
              className={`w-4 h-4 ml-1 transform transition-transform duration-300 ${isHovered ? 'translate-x-2' : ''}`}
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </button>
        </div>
      </div>
    </div>
  );
};

// Composant de statistiques avec animations
const StatsCard = ({ title, value, icon, color, delay }) => {
  const [count, setCount] = useState(0);

  useEffect(() => {
    const target = parseInt(value);
    const duration = 2000;
    const steps = 60;
    const increment = target / steps;
    let current = 0;

    const timer = setInterval(() => {
      current += increment;
      if (current >= target) {
        setCount(target);
        clearInterval(timer);
      } else {
        setCount(Math.floor(current));
      }
    }, duration / steps);

    return () => clearInterval(timer);
  }, [value]);

  return (
    <div
      className="bg-white p-6 rounded-xl shadow-lg hover:shadow-2xl transition-all duration-500 transform hover:scale-105 border-l-4 border-blue-500"
      style={{
        animation: `slideInFromTop 0.8s ease-out ${delay}s backwards`
      }}
    >
      <div className="flex items-center justify-between">
        <div className="flex-1">
          <p className="text-sm font-semibold text-gray-500 uppercase tracking-wide mb-2">{title}</p>
          <p className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-blue-800 bg-clip-text text-transparent">
            {count}
          </p>
        </div>
        <div className={`p-4 rounded-full ${color} bg-opacity-10 animate-bounce-slow`}>
          {icon}
        </div>
      </div>
    </div>
  );
};

export default function Dashboard() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [formations, setFormations] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  // Charger les formations depuis l'API
  useEffect(() => {
    const fetchFormations = async () => {
      try {
        setIsLoading(true);
        const response = await API.get('/formations');
        setFormations(response.data || []);
      } catch (error) {
        console.error('Erreur lors du chargement des formations:', error);
        // En cas d'erreur, on garde un tableau vide
        setFormations([]);
      } finally {
        setIsLoading(false);
      }
    };

    fetchFormations();
  }, []);

  const filteredFormations = formations.filter(formation =>
    formation.titre.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (formation.description && formation.description.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  const totalFormations = formations.length;
  const totalPlaces = formations.reduce((acc, curr) => {
    const places = typeof curr.places === 'number' ? curr.places : 0;
    return acc + places;
  }, 0);

  return (
    <>
      <style>{`
        @keyframes fadeInUp {
          from {
            opacity: 0;
            transform: translateY(30px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        @keyframes slideInFromTop {
          from {
            opacity: 0;
            transform: translateY(-50px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        @keyframes float {
          0%, 100% {
            transform: translateY(0px);
          }
          50% {
            transform: translateY(-10px);
          }
        }

        @keyframes bounce-slow {
          0%, 100% {
            transform: translateY(0);
          }
          50% {
            transform: translateY(-5px);
          }
        }

        .animate-bounce-slow {
          animation: bounce-slow 3s ease-in-out infinite;
        }

        .animate-float {
          animation: float 6s ease-in-out infinite;
        }

        .bg-pattern {
          background-color: #f0f9ff;
          background-image:
            radial-gradient(circle at 20% 50%, rgba(59, 130, 246, 0.05) 0%, transparent 50%),
            radial-gradient(circle at 80% 80%, rgba(96, 165, 250, 0.05) 0%, transparent 50%),
            radial-gradient(circle at 40% 20%, rgba(147, 197, 253, 0.05) 0%, transparent 50%);
        }

        .gradient-text {
          background: linear-gradient(135deg, #2563eb 0%, #1d4ed8 100%);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
        }
      `}</style>

      <div className="min-h-screen bg-pattern p-4 sm:p-6 lg:p-8 relative overflow-hidden">
        {/* Décorations d'arrière-plan */}
        <div className="absolute top-0 right-0 w-96 h-96 bg-blue-200 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-float"></div>
        <div className="absolute bottom-0 left-0 w-96 h-96 bg-blue-300 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-float" style={{ animationDelay: '2s' }}></div>

        <div className="max-w-7xl mx-auto relative z-10">
          {/* En-tête avec logo et bouton d'ajout */}
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8 animate-fadeInUp">
            <div className="flex items-center mb-4 sm:mb-0">
              <div className="h-20 w-20 mr-4 bg-gradient-to-br from-blue-500 to-blue-700 rounded-2xl flex items-center justify-center shadow-xl transform hover:rotate-6 transition-transform duration-300">
                <svg className="w-12 h-12 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                </svg>
              </div>
              <div>
                <h1 className="text-3xl font-bold gradient-text mb-1">
                  {user ? `Bienvenue, ${user.prenom}!` : 'Tableau de bord'}
                </h1>
                <p className="text-gray-600 font-medium">
                  {user ? 'Découvrez nos formations disponibles' : 'Centre de Formation Professionnelle CFP Charpentier Marine'}
                </p>
              </div>
            </div>
            <button
            onClick={() => navigate('/create-formation')}
              className="group bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white px-6 py-3 rounded-lg shadow-lg hover:shadow-xl flex items-center transition-all duration-300 transform hover:scale-105"
            >
              <svg className="w-5 h-5 mr-2 group-hover:rotate-90 transition-transform duration-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
              </svg>
              <span className="font-semibold">Nouvelle formation</span>
            </button>
          </div>

          {/* Cartes de statistiques */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            <StatsCard
              title="Total des formations"
              value={totalFormations}
              delay={0}
              icon={
                <svg className="w-8 h-8 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                </svg>
              }
              color="text-blue-600"
            />
            <StatsCard
              title="Places disponibles"
              value={totalPlaces}
              delay={0.1}
              icon={
                <svg className="w-8 h-8 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                </svg>
              }
              color="text-blue-600"
            />
            <StatsCard
              title="Prochaines sessions"
              value="3"
              delay={0.2}
              icon={
                <svg className="w-8 h-8 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
              }
              color="text-blue-600"
            />
          </div>

          {/* Barre de recherche et filtres */}
          <div className="bg-white p-6 rounded-xl shadow-lg mb-8 border border-blue-100" style={{ animation: 'fadeInUp 0.6s ease-out 0.3s backwards' }}>
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
              <div className="w-full sm:w-2/3">
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <svg className="h-5 w-5 text-blue-500" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M8 4a4 4 0 100 8 4 4 0 000-8zM2 8a6 6 0 1110.89 3.476l4.817 4.817a1 1 0 01-1.414 1.414l-4.816-4.816A6 6 0 012 8z" clipRule="evenodd" />
                    </svg>
                  </div>
                  <input
                    type="text"
                    className="block w-full pl-10 pr-3 py-3 border-2 border-blue-100 rounded-lg leading-5 bg-blue-50 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 focus:bg-white transition-all duration-300"
                    placeholder="🔍 Rechercher une formation..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                  />
                </div>
              </div>
              <div className="flex space-x-2 w-full sm:w-auto">
                <select className="block w-full sm:w-auto pl-4 pr-10 py-3 text-base border-2 border-blue-100 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 rounded-lg bg-blue-50 font-medium transition-all duration-300">
                  <option>Tous les niveaux</option>
                  <option>Débutant</option>
                  <option>Intermédiaire</option>
                  <option>Avancé</option>
                </select>
                <button className="px-4 py-3 border-2 border-blue-100 rounded-lg bg-blue-50 text-blue-700 hover:bg-blue-600 hover:text-white hover:border-blue-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-all duration-300 transform hover:scale-105">
                  <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z" />
                  </svg>
                </button>
              </div>
            </div>
          </div>

          {/* Liste des formations */}
          <div>
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-bold text-gray-800">✨ Formations disponibles</h2>
              <p className="text-sm font-semibold text-blue-600 bg-blue-100 px-4 py-2 rounded-full">
                {filteredFormations.length} formation{filteredFormations.length !== 1 ? 's' : ''}
              </p>
            </div>

            {isLoading ? (
              <div className="flex justify-center items-center py-12">
                <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-b-4 border-blue-600"></div>
              </div>
            ) : filteredFormations.length > 0 ? (
              <div className="grid grid-cols-1 gap-6">
                {filteredFormations.map((formation, index) => (
                  <FormationCard
                    key={formation.id}
                    formation={formation}
                    index={index}
                  />
                ))}
              </div>
            ) : (
              <div className="bg-white p-12 rounded-xl shadow-lg text-center border-2 border-dashed border-blue-200">
                <div className="animate-bounce-slow inline-block">
                  <svg className="mx-auto h-16 w-16 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <h3 className="mt-4 text-xl font-bold text-gray-900">Aucune formation trouvée</h3>
                <p className="mt-2 text-gray-600">Essayez de modifier vos critères de recherche.</p>
                <div className="mt-8">
                  <button
                    onClick={() => navigate('/create-formation')}
                    className="inline-flex items-center px-6 py-3 border border-transparent shadow-lg text-base font-medium rounded-lg text-white bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-all duration-300 transform hover:scale-105"
                  >
                    <svg className="-ml-1 mr-2 h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                    </svg>
                    Créer une nouvelle formation
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  );
}