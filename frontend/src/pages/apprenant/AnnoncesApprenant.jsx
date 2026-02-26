import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import API from '../../services/api';
import { FiBell, FiRefreshCw, FiClock } from 'react-icons/fi';

export default function AnnoncesApprenant() {
  const [annonces, setAnnonces] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState('');

  const fetchAnnonces = async () => {
    try {
      setError('');
      const endpoints = [
        '/admin/annonces/public/apprenants',
        '/admin/annonces/apprenants'
      ];
      let loaded = false;
      for (const ep of endpoints) {
        try {
          const res = await API.get(ep);
          const payload = res?.data;
          const list = Array.isArray(payload) ? payload : (payload?.data || payload?.rows || []);
          if (Array.isArray(list)) {
            setAnnonces(list);
            loaded = true;
            break;
          }
        } catch (inner) {
          continue;
        }
      }
      if (!loaded) {
        setAnnonces([]);
        setError("Impossible de charger les annonces. Vérifiez que l'API est démarrée.");
      }
    } catch (e) {
      setError("Erreur lors du chargement des annonces.");
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchAnnonces();
  }, []);

  const handleRefresh = () => {
    setRefreshing(true);
    fetchAnnonces();
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 2, repeat: Infinity, ease: 'linear' }}
          className="w-12 h-12 border-4 border-blue-200 border-t-blue-600 rounded-full"
        />
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className="p-3 bg-blue-600 rounded-xl">
            <FiBell className="w-6 h-6 text-white" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-gray-800">Annonces</h1>
            <p className="text-gray-500">Messages envoyés par l’administration</p>
          </div>
        </div>
        <button
          onClick={handleRefresh}
          disabled={refreshing}
          className="px-4 py-2 bg-white border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors flex items-center gap-2"
        >
          <FiRefreshCw className={`w-4 h-4 ${refreshing ? 'animate-spin' : ''}`} />
          Rafraîchir
        </button>
      </div>

      {error && (
        <div className="mb-4 p-3 rounded-lg bg-red-50 text-red-700 border border-red-200">
          {error}
        </div>
      )}

      {annonces.length === 0 ? (
        <div className="bg-white border border-gray-100 rounded-xl p-8 text-center">
          <div className="w-12 h-12 mx-auto mb-3 rounded-full bg-blue-50 flex items-center justify-center">
            <FiBell className="w-6 h-6 text-blue-600" />
          </div>
          <p className="text-gray-600">Aucune annonce pour le moment</p>
        </div>
      ) : (
        <div className="space-y-4">
          <AnimatePresence>
            {annonces.map((a) => (
              <motion.div
                key={a.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="bg-white border border-gray-100 rounded-xl p-4"
              >
                <div className="flex items-start justify-between">
                  <div>
                    <h3 className="text-lg font-semibold text-gray-800">{a.titre}</h3>
                    <p className="text-gray-600 mt-1 whitespace-pre-line">{a.contenu}</p>
                    <div className="mt-2 flex items-center text-xs text-gray-400">
                      <FiClock className="w-3 h-3 mr-1" />
                      {a.createdAt ? new Date(a.createdAt).toLocaleString('fr-FR') : '-'}
                    </div>
                  </div>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      )}
    </div>
  );
}
