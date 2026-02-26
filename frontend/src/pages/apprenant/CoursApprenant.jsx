import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../../contexts/AuthContext';
import API from '../../services/api';
import {
  FiBook,
  FiDownload,
  FiCalendar,
  FiUser,
  FiFile,
  FiFilter,
  FiSearch,
  FiEye,
  FiClock,
  FiTag,
  FiChevronDown,
  FiLoader
} from 'react-icons/fi';
import { FaGraduationCap, FaFilePdf } from 'react-icons/fa';

export default function CoursApprenant() {
  const { user } = useAuth();
  const [cours, setCours] = useState([]);
  const [formations, setFormations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedFormation, setSelectedFormation] = useState('all');
  const [showFilters, setShowFilters] = useState(false);
  const [downloadingFile, setDownloadingFile] = useState(null);

  useEffect(() => {
    if (user?.role !== 'apprenant') {
      return;
    }
    fetchData();
  }, [user]);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [coursRes, formationsRes] = await Promise.all([
        API.get('/cours'),
        API.get('/formations')
      ]);
      
      setCours(coursRes.data || []);
      setFormations(formationsRes.data || []);
    } catch (error) {
      console.error('Erreur lors du chargement des cours:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDownload = async (cour) => {
    setDownloadingFile(cour.id);
    
    try {
      // Créer un lien temporaire pour forcer le téléchargement direct
      if (cour.fichierUrl) {
        const link = document.createElement('a');
        const apiBase = (API.defaults?.baseURL || '').replace(/\/api\/?$/, '');
        const cleanPath = String(cour.fichierUrl).replace(/^\/+/, '');
        link.href = `${apiBase}/${cleanPath}`;
        link.download = cour.fichierNom || `${cour.titre}.pdf`;
        link.target = '_blank';
        link.style.display = 'none';
        
        // Ajouter le lien au DOM, cliquer dessus, puis le supprimer
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
      }
      
    } catch (error) {
      console.error('Erreur lors du téléchargement:', error);
      // Alternative: ouvrir le fichier dans un nouvel onglet
      if (cour.fichierUrl) {
        const apiBase = (API.defaults?.baseURL || '').replace(/\/api\/?$/, '');
        const cleanPath = String(cour.fichierUrl).replace(/^\/+/, '');
        window.open(`${apiBase}/${cleanPath}`, '_blank');
      }
    } finally {
      setDownloadingFile(null);
    }
  };

  const filteredCours = cours.filter(cour => {
    const matchesSearch = cour.titre?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         cour.description?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesFormation = selectedFormation === 'all' || 
                            cour.formationId === parseInt(selectedFormation);
    return matchesSearch && matchesFormation;
  });

  const getFormationName = (formationId) => {
    const formation = formations.find(f => f.id === formationId);
    return formation?.titre || 'Formation inconnue';
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-cyan-50 flex items-center justify-center">
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
          className="w-16 h-16 border-4 border-blue-600 border-t-transparent rounded-full"
        />
      </div>
    );
  }

  return (
    <>
      <div className="bg-white rounded-xl shadow-sm border border-blue-100 p-6 mb-8">
        <h1 className="text-xl font-bold text-gray-800 mb-4">Mes Cours</h1>
        {/* Filtres et recherche */}
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
          {/* Recherche */}
          <div className="flex-1">
            <div className="relative">
              <FiSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                placeholder="Rechercher un cours..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
          </div>

          {/* Filtres */}
          <div className="flex items-center space-x-4">
            <button
              onClick={() => setShowFilters(!showFilters)}
              className="flex items-center space-x-2 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
            >
              <FiFilter className="text-gray-600" />
              <span className="text-sm font-medium text-gray-700">Filtres</span>
              <FiChevronDown className={`text-gray-600 transform transition-transform ${showFilters ? 'rotate-180' : ''}`} />
            </button>
          </div>
        </div>

        {/* Filtres étendus */}
        <AnimatePresence>
          {showFilters && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.3 }}
              className="mt-4 pt-4 border-t border-gray-200"
            >
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Formation</label>
                  <select
                    value={selectedFormation}
                    onChange={(e) => setSelectedFormation(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value="all">Toutes les formations</option>
                    {formations.map(formation => (
                      <option key={formation.id} value={formation.id}>
                        {formation.titre}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Liste des cours */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <AnimatePresence>
          {filteredCours.map((cour, index) => (
            <motion.div
              key={cour.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.3, delay: index * 0.1 }}
              className="bg-white rounded-xl shadow-sm border border-blue-100 hover:shadow-lg transition-all duration-300 overflow-hidden group"
            >
              {/* En-tête du cours */}
              <div className="p-6 border-b border-gray-100">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center space-x-3">
                    <div className="p-2 bg-blue-100 rounded-lg group-hover:bg-blue-200 transition-colors">
                      <FaFilePdf className="text-blue-600 text-xl" />
                    </div>
                    <div className="flex-1">
                      <h3 className="text-lg font-semibold text-gray-900 group-hover:text-blue-600 transition-colors">
                        {cour.titre}
                      </h3>
                      <p className="text-sm text-gray-600">{getFormationName(cour.formationId)}</p>
                    </div>
                  </div>
                </div>

                <p className="text-gray-700 text-sm mb-4 px-6 line-clamp-3">
                  {cour.description}
                </p>

                {/* Métadonnées */}
                <div className="flex items-center justify-between text-xs text-gray-500 px-6 pb-4">
                  <div className="flex items-center space-x-4">
                    <div className="flex items-center space-x-1">
                      <FiCalendar className="text-gray-400" />
                      <span>{new Date(cour.createdAt).toLocaleDateString('fr-FR')}</span>
                    </div>
                    <div className="flex items-center space-x-1">
                      <FiUser className="text-gray-400" />
                      <span>{cour.formateurName || 'Formateur'}</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Actions */}
              <div className="p-4 bg-gray-50">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <FiFile className="text-gray-400" />
                    <span className="text-sm text-gray-600">PDF</span>
                  </div>
                  <button
                    onClick={() => handleDownload(cour)}
                    disabled={downloadingFile === cour.id}
                    className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {downloadingFile === cour.id ? (
                      <>
                        <FiLoader className="animate-spin" />
                        <span>Téléchargement...</span>
                      </>
                    ) : (
                      <>
                        <FiDownload />
                        <span>Télécharger</span>
                      </>
                    )}
                  </button>
                </div>
              </div>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>

      {/* Message si aucun cours */}
      {filteredCours.length === 0 && !loading && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center py-12"
        >
          <div className="inline-flex items-center justify-center w-16 h-16 bg-gray-100 rounded-full mb-4">
            <FiBook className="text-gray-400 text-2xl" />
          </div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">Aucun cours trouvé</h3>
          <p className="text-gray-600">
            {searchTerm || selectedFormation !== 'all' 
              ? 'Essayez de modifier vos filtres de recherche.'
              : 'Les formateurs n\'ont pas encore ajouté de cours.'}
          </p>
        </motion.div>
      )}
    </>
  );
}
