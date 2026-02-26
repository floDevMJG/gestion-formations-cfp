import React from 'react';
import { FiBookOpen, FiCheckCircle, FiTrendingUp, FiAward, FiClock, FiTarget } from 'react-icons/fi';

const StatCard = ({ icon, title, value, color }) => (
  <div className={`bg-white p-6 rounded-lg shadow-md border-l-4 border-${color}-500`}>
    <div className="flex items-center">
      <div className={`p-3 rounded-full bg-${color}-100 text-${color}-600`}>
        {icon}
      </div>
      <div className="ml-4">
        <p className="text-sm font-medium text-gray-500">{title}</p>
        <p className="text-2xl font-bold text-gray-800">{value}</p>
      </div>
    </div>
  </div>
);

const ProgressBar = ({ label, value, color }) => (
  <div>
    <div className="flex justify-between mb-1">
      <span className="text-sm font-medium text-gray-700">{label}</span>
      <span className={`text-sm font-medium text-${color}-600`}>{value}%</span>
    </div>
    <div className="w-full bg-gray-200 rounded-full h-2.5">
      <div className={`bg-${color}-500 h-2.5 rounded-full`} style={{ width: `${value}%` }}></div>
    </div>
  </div>
);

export default function DashboardApprenant() {
  return (
    <div>
      <h1 className="text-3xl font-bold text-gray-800 mb-8">Tableau de bord de l'Apprenant</h1>
      
      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
        <StatCard icon={<FiBookOpen size={24} />} title="Formations en cours" value="3" color="blue" />
        <StatCard icon={<FiCheckCircle size={24} />} title="Formations terminées" value="5" color="green" />
        <StatCard icon={<FiTrendingUp size={24} />} title="Progression moyenne" value="75%" color="indigo" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Progression Section */}
        <div className="lg:col-span-2 bg-white p-6 rounded-lg shadow-md">
          <h2 className="text-xl font-semibold text-gray-800 mb-6">Progression des formations</h2>
          <div className="space-y-6">
            <ProgressBar label="React - Les bases" value={80} color="blue" />
            <ProgressBar label="Node.js - Avancé" value={65} color="green" />
            <ProgressBar label="Design UI/UX" value={90} color="purple" />
          </div>
        </div>

        {/* Other Stats */}
        <div className="bg-white p-6 rounded-lg shadow-md">
          <h2 className="text-xl font-semibold text-gray-800 mb-6">Statistiques clés</h2>
          <div className="space-y-5">
            <div className="flex items-center">
              <div className="p-2 bg-yellow-100 text-yellow-600 rounded-full mr-4">
                <FiAward size={20} />
              </div>
              <div>
                <p className="font-semibold text-gray-700">Certificats obtenus</p>
                <p className="text-lg font-bold text-gray-800">2</p>
              </div>
            </div>
            <div className="flex items-center">
              <div className="p-2 bg-red-100 text-red-600 rounded-full mr-4">
                <FiClock size={20} />
              </div>
              <div>
                <p className="font-semibold text-gray-700">Heures de formation</p>
                <p className="text-lg font-bold text-gray-800">120</p>
              </div>
            </div>
            <div className="flex items-center">
              <div className="p-2 bg-teal-100 text-teal-600 rounded-full mr-4">
                <FiTarget size={20} />
              </div>
              <div>
                <p className="font-semibold text-gray-700">Objectifs atteints</p>
                <p className="text-lg font-bold text-gray-800">8 / 10</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
