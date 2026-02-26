import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';

import API from '../../services/api';

const StatsCard = ({ title, value, icon, color, link }) => {
  return (
    <Link to={link} className="block group">
      <div className={`bg-white rounded-lg shadow p-6 transition-all duration-300 transform hover:scale-105 hover:shadow-lg`}>
        <div className="flex items-center">
          <div className={`p-3 rounded-full ${color} bg-opacity-20`}>
            {icon}
          </div>
          <div className="ml-4">
            <p className="text-sm font-medium text-gray-500">{title}</p>
            <p className="text-2xl font-semibold text-gray-800">{value}</p>
          </div>
        </div>
      </div>
    </Link>
  );
};

const RecentActivityItem = ({ title, description, time, icon }) => {
  return (
    <div className="flex items-start pb-4 mb-4 border-b border-gray-100 last:border-0">
      <div className="p-2 bg-blue-100 text-blue-600 rounded-full">
        {icon}
      </div>
      <div className="ml-3 flex-1">
        <p className="text-sm font-medium text-gray-800">{title}</p>
        <p className="text-xs text-gray-500">{description}</p>
      </div>
      <span className="text-xs text-gray-400">{time}</span>
    </div>
  );
};

const Dashboard = () => {
  const [statistics, setStatistics] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchStatistics = async () => {
      try {
        console.log('🔄 Récupération des statistiques pour le dashboard...');
        const response = await API.get('/statistics');
        
        const data = response.data;
        console.log('📊 Données reçues pour le dashboard:', data);
        setStatistics(data);
        setLoading(false);
      } catch (error) {
        console.error('❌ Erreur lors de la récupération des statistiques:', error);
        setError(error.message);
        setLoading(false);
      }
    };

    fetchStatistics();
  }, []);

  // Données dynamiques basées sur les statistiques de l'API
  const stats = statistics ? [
    {
      title: 'Utilisateurs',
      value: statistics.users?.total || 0,
      color: 'bg-blue-100 text-blue-600',
      icon: (
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
        </svg>
      ),
      link: '/admin/utilisateurs'
    },
    {
      title: 'Formations',
      value: statistics.formations?.total || 0,
      color: 'bg-green-100 text-green-600',
      icon: (
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
        </svg>
      ),
      link: '/admin/formations'
    },
    {
      title: 'Cours',
      value: statistics.cours?.total || 0,
      color: 'bg-yellow-100 text-yellow-600',
      icon: (
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
        </svg>
      ),
      link: '/admin/cours'
    },
    {
      title: 'Apprenants',
      value: statistics.users?.byRole?.apprenant || 0,
      color: 'bg-purple-100 text-purple-600',
      icon: (
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
        </svg>
      ),
      link: '/admin/apprenants'
    }
  ] : [];

  const recentActivities = [
    {
      title: 'Nouveaux utilisateurs',
      description: `${statistics?.users?.total || 0} utilisateurs actifs`,
      time: 'Aujourd\'hui',
      icon: (
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
        </svg>
      )
    },
    {
      title: 'Formations disponibles',
      description: `${statistics?.formations?.total || 0} formations actives`,
      time: 'Aujourd\'hui',
      icon: (
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
        </svg>
      )
    },
    {
      title: 'Cours publiés',
      description: `${statistics?.cours?.total || 0} cours disponibles`,
      time: 'Aujourd\'hui',
      icon: (
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      )
    }
  ];

  if (loading) {
    return (
      <div className="container mx-auto">
        <div className="flex justify-center items-center h-64">
          <div className="text-lg text-gray-600">Chargement des statistiques...</div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container mx-auto">
        <div className="flex justify-center items-center h-64">
          <div className="text-lg text-red-600">Erreur: {error}</div>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-800">Tableau de bord</h1>
        <p className="text-gray-600">Bienvenue dans votre espace d'administration</p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {stats.map((stat, index) => (
          <StatsCard
            key={index}
            title={stat.title}
            value={stat.value}
            icon={stat.icon}
            color={stat.color}
            link={stat.link}
          />
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Dernières activités */}
        <div className="lg:col-span-2 bg-white rounded-lg shadow p-6">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-lg font-semibold text-gray-800">Activité récente</h2>
            <button className="text-sm text-blue-600 hover:text-blue-800">Voir tout</button>
          </div>
          <div className="divide-y divide-gray-100">
            {recentActivities.map((activity, index) => (
              <RecentActivityItem
                key={index}
                title={activity.title}
                description={activity.description}
                time={activity.time}
                icon={activity.icon}
              />
            ))}
          </div>
        </div>

        {/* Prochaines échéances */}
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-lg font-semibold text-gray-800 mb-6">Statistiques détaillées</h2>
          <div className="space-y-4">
            <div className="flex items-start p-3 bg-blue-50 rounded-lg">
              <div className="flex-shrink-0 mt-1">
                <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
              </div>
              <div className="ml-3">
                <p className="text-sm font-medium text-gray-800">Administrateurs</p>
                <p className="text-xs text-gray-500">{statistics?.users?.byRole?.admin || 0} administrateurs</p>
              </div>
            </div>
            <div className="flex items-start p-3 bg-green-50 rounded-lg">
              <div className="flex-shrink-0 mt-1">
                <div className="w-2 h-2 bg-green-500 rounded-full"></div>
              </div>
              <div className="ml-3">
                <p className="text-sm font-medium text-gray-800">Formateurs</p>
                <p className="text-xs text-gray-500">{statistics?.users?.byRole?.formateur || 0} formateurs</p>
              </div>
            </div>
            <div className="flex items-start p-3 bg-yellow-50 rounded-lg">
              <div className="flex-shrink-0 mt-1">
                <div className="w-2 h-2 bg-yellow-500 rounded-full"></div>
              </div>
              <div className="ml-3">
                <p className="text-sm font-medium text-gray-800">Apprenants</p>
                <p className="text-xs text-gray-500">{statistics?.users?.byRole?.apprenant || 0} apprenants</p>
              </div>
            </div>
          </div>
          <button className="mt-4 w-full text-center text-sm text-blue-600 hover:text-blue-800 font-medium">
            Voir toutes les statistiques
          </button>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
