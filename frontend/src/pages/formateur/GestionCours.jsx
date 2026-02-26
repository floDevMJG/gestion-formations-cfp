import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import API from '../../services/api';
import { useAuth } from '../../contexts/AuthContext';
import {
  FiBook,
  FiCalendar,
  FiClock,
  FiUser,
  FiFile,
  FiDownload,
  FiEdit,
  FiTrash2,
  FiPlus,
  FiSearch,
  FiFilter
} from 'react-icons/fi';
import { FaChalkboardTeacher, FaFilePdf } from 'react-icons/fa';

export default function GestionCours() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [cours, setCours] = useState([]);
  const [formations, setFormations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedFormation, setSelectedFormation] = useState('');
  const [filteredCours, setFilteredCours] = useState([]);

  useEffect(() => {
    if (user?.role !== 'formateur' && user?.role !== 'admin') {
      navigate('/dashboard');
      return;
    }
    fetchData();
  }, [user, navigate]);

  useEffect(() => {
    // Filtrer les cours
    let filtered = Array.isArray(cours) ? cours : [];
    
    if (searchTerm) {
      filtered = filtered.filter(c => 
        c.titre.toLowerCase().includes(searchTerm.toLowerCase()) ||
        c.description.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }
    
    if (selectedFormation) {
      filtered = filtered.filter(c => c.formationId == selectedFormation);
    }
    
    setFilteredCours(filtered);
  }, [searchTerm, selectedFormation, cours]);

  const fetchData = async () => {
    try {
      console.log('🔄 Chargement des données...');
      
      // Récupérer les cours via l'instance API (évite les réponses HTML)
      const coursRes = await API.get('/cours');
      const coursData = Array.isArray(coursRes.data) ? coursRes.data : [];
      console.log('✅ Cours récupérés:', coursData.length);
      setCours(coursData);
      
      // Récupérer les formations (avec authentification)
      const formationsRes = await API.get('/formations');
      console.log('✅ Formations récupérées:', formationsRes.data.length);
      setFormations(formationsRes.data);
      
    } catch (error) {
      console.error('❌ Erreur lors du chargement des données:', error);
      console.error('Détail de l\'erreur:', error.response?.data || error.message);
      setError('Erreur de chargement des données');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (coursId) => {
    if (!window.confirm('Êtes-vous sûr de vouloir supprimer ce cours ?')) {
      return;
    }

    try {
      await API.delete(`/cours/${coursId}`);
      setCours(cours.filter(c => c.id !== coursId));
    } catch (error) {
      console.error('Erreur lors de la suppression:', error);
      alert('Erreur lors de la suppression du cours');
    }
  };

  const handleDownload = (fichierUrl, fichierNom) => {
    if (fichierUrl) {
      // Créer un lien temporaire pour forcer le téléchargement direct
      const link = document.createElement('a');
      const apiBase = (API.defaults?.baseURL || '').replace(/\/api\/?$/, '');
      const cleanPath = String(fichierUrl).replace(/^\/+/, '');
      link.href = `${apiBase}/${cleanPath}`;
      link.download = fichierNom || 'document.pdf';
      link.target = '_blank';
      link.style.display = 'none';
      
      // Ajouter le lien au DOM, cliquer dessus, puis le supprimer
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen bg-gradient-to-br from-purple-50 to-blue-50">
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
          className="w-16 h-16 border-4 border-purple-200 border-t-purple-600 rounded-full"
        />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-white to-blue-50">
      {/* Header */}
      <motion.div
        initial={{ y: -20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        className="bg-white shadow-sm border-b border-gray-100"
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div className="flex items-center space-x-4">
              <div className="p-2 bg-gradient-to-r from-purple-500 to-blue-500 rounded-lg">
                <FaChalkboardTeacher className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-gray-800">Gestion des Cours</h1>
                <p className="text-sm text-gray-500">Liste de tous les cours disponibles</p>
              </div>
            </div>
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => navigate('/formateur/ajout-cours')}
              className="px-4 py-2 bg-gradient-to-r from-purple-500 to-purple-600 text-white rounded-lg hover:from-purple-600 hover:to-purple-700 transition-all shadow-md flex items-center space-x-2"
            >
              <FiPlus className="w-4 h-4" />
              <span>Ajouter un cours</span>
            </motion.button>
          </div>
        </div>
      </motion.div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Message d'erreur */}
        {error && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-red-50 border border-red-200 rounded-2xl p-4 mb-6"
          >
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-red-100 rounded-lg">
                <FiFile className="w-5 h-5 text-red-600" />
              </div>
              <div>
                <h3 className="text-red-800 font-semibold">Erreur de chargement</h3>
                <p className="text-red-600 text-sm">{error}</p>
              </div>
            </div>
          </motion.div>
        )}

        {/* Filtres */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 mb-6"
        >
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="relative">
              <FiSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                type="text"
                placeholder="Rechercher un cours..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              />
            </div>
            <div>
              <select
                value={selectedFormation}
                onChange={(e) => setSelectedFormation(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              >
                <option value="">Toutes les formations</option>
                {formations.map((formation) => (
                  <option key={formation.id} value={formation.id}>
                    {formation.titre}
                  </option>
                ))}
              </select>
            </div>
            <div className="flex items-center space-x-2 text-sm text-gray-600">
              <FiFilter className="w-4 h-4" />
              <span>{Array.isArray(filteredCours) ? filteredCours.length : 0} cours trouvés</span>
            </div>
          </div>
        </motion.div>

        {/* Liste des cours */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
        >
          {Array.isArray(filteredCours) && filteredCours.map((cour, index) => (
            <motion.div
              key={cour.id}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.1 * index }}
              whileHover={{ y: -5, scale: 1.02 }}
              className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 hover:shadow-lg transition-all duration-300"
            >
              <div className="flex items-start justify-between mb-4">
                <div className="p-3 bg-gradient-to-r from-purple-500 to-blue-500 rounded-xl shadow-lg">
                  {cour.type === 'pdf' ? (
                    <FaFilePdf className="w-6 h-6 text-white" />
                  ) : (
                    <FiBook className="w-6 h-6 text-white" />
                  )}
                </div>
                <div className="flex items-center space-x-1">
                  {cour.type === 'pdf' && (
                    <span className="px-2 py-1 bg-red-100 text-red-600 text-xs font-medium rounded-full">
                      PDF
                    </span>
                  )}
                </div>
              </div>

              <div className="mb-4">
                <h3 className="text-lg font-semibold text-gray-800 mb-2">{cour.titre}</h3>
                <p className="text-sm text-gray-600 line-clamp-2">{cour.description}</p>
              </div>

              <div className="space-y-2 mb-4">
                <div className="flex items-center text-sm text-gray-500">
                  <FiUser className="w-4 h-4 mr-2" />
                  <span>{cour.Formateur?.nom} {cour.Formateur?.prenom}</span>
                </div>
                <div className="flex items-center text-sm text-gray-500">
                  <FiBook className="w-4 h-4 mr-2" />
                  <span>{cour.formation?.titre}</span>
                </div>
                {cour.date && (
                  <div className="flex items-center text-sm text-gray-500">
                    <FiCalendar className="w-4 h-4 mr-2" />
                    <span>{new Date(cour.date).toLocaleDateString('fr-FR')}</span>
                  </div>
                )}
                {cour.fichierNom && (
                  <div className="flex items-center text-sm text-gray-500">
                    <FiFile className="w-4 h-4 mr-2" />
                    <span className="truncate">{cour.fichierNom}</span>
                  </div>
                )}
              </div>

              <div className="flex space-x-2">
                {cour.fichierUrl && (
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => handleDownload(cour.fichierUrl, cour.fichierNom)}
                    className="flex-1 px-3 py-2 bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-lg hover:from-blue-600 hover:to-blue-700 transition-all text-sm flex items-center justify-center space-x-1"
                  >
                    <FiDownload className="w-4 h-4" />
                    <span>Télécharger</span>
                  </motion.button>
                )}
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => navigate(`/formateur/ajout-cours?id=${cour.id}`)}
                  className="px-3 py-2 bg-gradient-to-r from-purple-500 to-purple-600 text-white rounded-lg hover:from-purple-600 hover:to-purple-700 transition-all text-sm"
                >
                  <FiEdit className="w-4 h-4" />
                </motion.button>
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => handleDelete(cour.id)}
                  className="px-3 py-2 bg-gradient-to-r from-red-500 to-red-600 text-white rounded-lg hover:from-red-600 hover:to-red-700 transition-all text-sm"
                >
                  <FiTrash2 className="w-4 h-4" />
                </motion.button>
              </div>
            </motion.div>
          ))}
        </motion.div>

        {Array.isArray(filteredCours) && filteredCours.length === 0 && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-center py-12"
          >
            <div className="p-8 bg-white rounded-2xl shadow-sm border border-gray-100">
              <FiBook className="w-16 h-16 text-gray-300 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-800 mb-2">Aucun cours trouvé</h3>
              <p className="text-gray-500 mb-4">
                {searchTerm || selectedFormation 
                  ? 'Essayez de modifier vos filtres' 
                  : 'Commencez par ajouter votre premier cours'
                }
              </p>
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => navigate('/formateur/ajout-cours')}
                className="px-6 py-3 bg-gradient-to-r from-purple-500 to-purple-600 text-white rounded-lg hover:from-purple-600 hover:to-purple-700 transition-all shadow-md"
              >
                <FiPlus className="w-4 h-4 mr-2 inline" />
                Ajouter un cours
              </motion.button>
            </div>
          </motion.div>
        )}
      </div>
    </div>
  );
}
