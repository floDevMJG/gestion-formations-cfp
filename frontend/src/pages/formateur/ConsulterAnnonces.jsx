import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import API from '../../services/api';
import { FiList, FiFileText } from 'react-icons/fi';

export default function ConsulterAnnonces() {
  const [annonces, setAnnonces] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchAnnonces = async () => {
      try {
        const res = await API.get('/admin/annonces/public/formateurs');
        const data = Array.isArray(res.data) ? res.data : [];
        setAnnonces(data);
      } catch (e) {
        setError('Erreur lors du chargement des annonces');
      } finally {
        setLoading(false);
      }
    };
    fetchAnnonces();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen bg-gradient-to-br from-purple-50 to-blue-50">
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 2, repeat: Infinity, ease: 'linear' }}
          className="w-16 h-16 border-4 border-purple-200 border-t-purple-600 rounded-full"
        />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-white to-blue-50">
      <div className="max-w-5xl mx-auto p-6">
        <div className="flex items-center gap-3 mb-6">
          <div className="p-2 bg-gradient-to-r from-purple-500 to-blue-500 rounded-lg">
            <FiFileText className="w-6 h-6 text-white" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-gray-800">Annonces de l'administration</h1>
            <p className="text-sm text-gray-500">Messages envoyés par l'admin</p>
          </div>
        </div>

        {error && (
          <div className="mb-4 p-3 rounded-lg bg-red-50 text-red-700 border border-red-200">
            {error}
          </div>
        )}

        <div className="bg-white rounded-2xl border border-gray-200 shadow-sm">
          <div className="px-6 py-4 border-b border-gray-100 flex items-center gap-2">
            <FiList className="text-gray-500" />
            <h2 className="text-lg font-semibold text-gray-800">Annonces</h2>
          </div>
          <div className="divide-y divide-gray-100">
            {annonces.length === 0 ? (
              <div className="p-6 text-gray-500">Aucune annonce pour le moment</div>
            ) : (
              annonces.map(a => (
                <div key={a.id} className="p-6">
                  <div className="flex items-center justify-between">
                    <h3 className="text-xl font-semibold text-gray-900">{a.titre}</h3>
                    <span className="text-sm text-gray-500">
                      {new Date(a.createdAt).toLocaleString('fr-FR')}
                    </span>
                  </div>
                  <p className="text-gray-700 mt-2 whitespace-pre-line">{a.contenu}</p>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
