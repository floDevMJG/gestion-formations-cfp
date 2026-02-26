import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { FiEdit2, FiTrash2, FiSearch, FiPlus, FiClock, FiUsers } from 'react-icons/fi';
import API from '../../services/api';
import AddFormationModal from '../../components/AddFormationModal';

// Constantes d'animation
export const container = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: { staggerChildren: 0.1 }
  }
};

export const item = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0, transition: { duration: 0.3 } }
};

const NIVEAUX = ['Tous', 'Débutant', 'Intermédiaire', 'Avancé', 'Expert'];

// Composant de chargement
const LoadingSpinner = () => (
  <div className="min-h-screen flex items-center justify-center">
    <div className="text-center">
      <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500 mx-auto"></div>
      <p className="mt-4 text-gray-600">Chargement des formations...</p>
    </div>
  </div>
);

const GestionFormations = () => {
  // État principal
  const [state, setState] = useState({
    formations: [],
    loading: true,
    showAddForm: false,
    editingId: null,
    searchFilter: '',
    levelFilter: 'Tous'
  });

  // États des formulaires
  const [editForm, setEditForm] = useState({
    titre: '',
    description: '',
    duree: '',
    niveau: 'Débutant',
    places: 10
  });

  const [newFormation, setNewFormation] = useState({
    titre: '',
    description: '',
    duree: '',
    niveau: 'Débutant',
    places: 10
  });

  const navigate = useNavigate();
  
  // Extraire les valeurs de l'état
  const { 
    formations, 
    loading, 
    showAddForm, 
    editingId, 
    searchFilter, 
    levelFilter 
  } = state;

  // Fonction pour mettre à jour l'état de manière sûre
  const updateState = useCallback((updates) => {
    setState(prev => ({ ...prev, ...updates }));
  }, []);

  // Chargement initial des formations
  useEffect(() => {
    const loadFormations = async () => {
      try {
        const response = await API.get('/formations');
        updateState({ 
          formations: response.data,
          loading: false 
        });
      } catch (error) {
        console.error('Erreur:', error);
        updateState({ loading: false });
      }
    };

    loadFormations();
  }, [updateState]);

  // Gestion du défilement de la page
  useEffect(() => {
    if (showAddForm) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [showAddForm]);

  // Gestion de la suppression
  const handleDelete = async (id) => {
    if (!window.confirm('Êtes-vous sûr de vouloir supprimer cette formation ?')) {
      return;
    }

    try {
      await API.delete(`/admin/formations/${id}`);
      // Mise à jour locale sans rechargement complet
      updateState({ 
        formations: formations.filter(f => f.id !== id) 
      });
      alert('Formation supprimée avec succès');
    } catch (error) {
      console.error('Erreur:', error);
      alert('Erreur lors de la suppression');
    }
  };

  // Gestion de l'édition
  const handleEdit = (formation) => {
    updateState({ editingId: formation.id });
    setEditForm({
      titre: formation.titre || '',
      description: formation.description || '',
      duree: formation.duree || '',
      niveau: formation.niveau || 'Débutant',
      places: formation.places || 10
    });
  };

  // Sauvegarder les modifications
  const handleSaveEdit = async () => {
    try {
      await API.put(`/admin/formations/${editingId}`, editForm);
      
      // Mise à jour locale sans rechargement complet
      updateState({ 
        editingId: null,
        formations: formations.map(f => 
          f.id === editingId ? { ...f, ...editForm } : f
        )
      });
      
      alert('Formation mise à jour avec succès');
    } catch (error) {
      console.error('Erreur:', error);
      alert('Erreur lors de la mise à jour');
    }
  };

  // Annuler l'édition
  const handleCancelEdit = () => {
    updateState({ editingId: null });
    setEditForm({ 
      titre: '', 
      description: '', 
      duree: '', 
      niveau: 'Débutant', 
      places: 10 
    });
  };

  // Ajouter une nouvelle formation
  const handleAddFormation = async (e) => {
    e.preventDefault();
    try {
      const response = await API.post('/formations', newFormation);
      
      updateState({ 
        showAddForm: false,
        formations: [...formations, response.data]
      });
      
      setNewFormation({ 
        titre: '', 
        description: '', 
        duree: '', 
        niveau: 'Débutant', 
        places: 10 
      });
      
      alert('Formation ajoutée avec succès');
    } catch (error) {
      console.error('Erreur:', error);
      alert('Erreur lors de l\'ajout de la formation');
    }
  };

  // Annuler l'ajout
  const handleCancelAdd = () => {
    updateState({ showAddForm: false });
    setNewFormation({ 
      titre: '', 
      description: '', 
      duree: '', 
      niveau: 'Débutant', 
      places: 10 
    });
  };

  // Gestion du clic sur le fond du modal
  const handleBackdropClick = (e) => {
    if (e.target === e.currentTarget) {
      handleCancelAdd();
    }
  };

  // Gestion des changements dans les champs de formulaire
  const handleInputChange = (formType, field, value) => {
    if (formType === 'edit') {
      setEditForm(prev => ({ ...prev, [field]: value }));
    } else {
      setNewFormation(prev => ({ ...prev, [field]: value }));
    }
  };

  // Gestion de la recherche
  const handleSearch = (e) => {
    updateState({ searchFilter: e.target.value });
  };

  // Gestion du changement de niveau
  const handleLevelChange = (e) => {
    updateState({ levelFilter: e.target.value });
  };

  // Filtrer les formations
  const filteredFormations = useMemo(() => {
    if (!formations) return [];
    
    return formations.filter(formation => {
      const matchesSearch = !searchFilter || 
        (formation.titre?.toLowerCase().includes(searchFilter.toLowerCase()) ||
         formation.description?.toLowerCase().includes(searchFilter.toLowerCase()));
      
      const matchesLevel = levelFilter === 'Tous' || formation.niveau === levelFilter;
      
      return matchesSearch && matchesLevel;
    });
  }, [formations, searchFilter, levelFilter]);

  // Afficher le chargement
  if (loading) {
    return <LoadingSpinner />;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50 p-6">
      {/* En-tête avec dégradé */}
      <div className="bg-gradient-to-r from-blue-600 to-blue-800 rounded-2xl p-6 text-white mb-8 shadow-xl">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center">
          <div>
            <h1 className="text-3xl md:text-4xl font-bold mb-2">Gestion des Formations</h1>
            <p className="text-blue-100">
              Gérez l'ensemble des formations proposées par votre centre
            </p>
          </div>
          <motion.button
            onClick={() => updateState({ showAddForm: true })}
            className="mt-4 md:mt-0 px-6 py-3 bg-white text-blue-700 rounded-xl hover:bg-blue-50 transition-all duration-300 flex items-center shadow-lg hover:shadow-xl"
            whileHover={{ scale: 1.03 }}
            whileTap={{ scale: 0.98 }}
          >
            <FiPlus className="mr-2" />
            Nouvelle formation
          </motion.button>
        </div>

        {/* Barre de recherche et filtres */}
        <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="relative md:col-span-2">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <FiSearch className="text-gray-400" />
            </div>
            <input
              type="text"
              placeholder="Rechercher une formation..."
              className="w-full pl-10 pr-4 py-3 rounded-xl border-0 focus:ring-2 focus:ring-blue-500 text-gray-800"
              value={searchFilter}
              onChange={handleSearch}
            />
          </div>
          <select
            className="px-4 py-3 rounded-xl border-0 focus:ring-2 focus:ring-blue-500 text-gray-800"
            value={levelFilter}
            onChange={handleLevelChange}
          >
            {NIVEAUX.map(niveau => (
              <option key={niveau} value={niveau}>
                Niveau: {niveau}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Modal pour ajouter une formation */}
      <AddFormationModal
        showAddForm={showAddForm}
        newFormation={newFormation}
        setNewFormation={setNewFormation}
        handleAddFormation={handleAddFormation}
        handleCancelAdd={handleCancelAdd}
        onBackdropClick={handleBackdropClick}
      />

      {/* Liste des formations */}
      <motion.div 
        className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
        variants={container}
        initial="hidden"
        animate="show"
      >
        {filteredFormations.length > 0 ? (
          <AnimatePresence>
            {filteredFormations.map((formation) => (
              <motion.div
                key={formation.id}
                className="bg-white rounded-2xl overflow-hidden shadow-lg hover:shadow-2xl transition-shadow duration-300 flex flex-col"
                variants={item}
                layout
              >
                {editingId === formation.id ? (
                  <div className="p-6">
                    <div className="mb-4">
                      <label className="block text-sm font-medium text-gray-700 mb-1">Titre</label>
                      <input
                        type="text"
                        value={editForm.titre}
                        onChange={(e) => handleInputChange('edit', 'titre', e.target.value)}
                        className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        placeholder="Titre de la formation"
                      />
                    </div>
                    <div className="mb-4">
                      <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                      <textarea
                        value={editForm.description}
                        onChange={(e) => handleInputChange('edit', 'description', e.target.value)}
                        className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        rows="3"
                        placeholder="Description de la formation"
                      />
                    </div>
                    <div className="grid grid-cols-2 gap-4 mb-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Durée</label>
                        <input
                          type="text"
                          value={editForm.duree}
                          onChange={(e) => handleInputChange('edit', 'duree', e.target.value)}
                          className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                          placeholder="Ex: 2 mois"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Niveau</label>
                        <select
                          value={editForm.niveau}
                          onChange={(e) => handleInputChange('edit', 'niveau', e.target.value)}
                          className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        >
                          <option value="Débutant">Débutant</option>
                          <option value="Intermédiaire">Intermédiaire</option>
                          <option value="Avancé">Avancé</option>
                          <option value="Expert">Expert</option>
                        </select>
                      </div>
                    </div>
                    <div className="flex justify-end space-x-3 mt-4">
                      <button
                        onClick={handleSaveEdit}
                        className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors flex items-center"
                      >
                        <FiEdit2 className="mr-2" /> Enregistrer
                      </button>
                      <button
                        onClick={handleCancelEdit}
                        className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors"
                      >
                        Annuler
                      </button>
                    </div>
                  </div>
                ) : (
                  <>
                    <div className="relative">
                      <div className="h-2 bg-gradient-to-r from-blue-500 to-blue-700"></div>
                      <div className="p-6">
                        <div className="flex justify-between items-start mb-4">
                          <div>
                            <span className="inline-block px-3 py-1 text-xs font-semibold text-blue-700 bg-blue-100 rounded-full mb-2">
                              {formation.niveau || 'Niveau non spécifié'}
                            </span>
                            <h3 className="text-xl font-bold text-gray-800 mb-2">{formation.titre}</h3>
                          </div>
                          <div className="flex space-x-2">
                            <button
                              onClick={() => handleEdit(formation)}
                              className="p-2 text-blue-600 hover:bg-blue-50 rounded-full transition-colors"
                              title="Modifier"
                            >
                              <FiEdit2 />
                            </button>
                            <button
                              onClick={() => handleDelete(formation.id)}
                              className="p-2 text-red-600 hover:bg-red-50 rounded-full transition-colors"
                              title="Supprimer"
                            >
                              <FiTrash2 />
                            </button>
                          </div>
                        </div>
                        <p className="text-gray-600 mb-6 line-clamp-3">
                          {formation.description || 'Aucune description disponible'}
                        </p>
                        <div className="flex flex-wrap gap-4 text-sm text-gray-500 mt-auto pt-4 border-t">
                          <div className="flex items-center">
                            <FiClock className="mr-2 text-blue-600" />
                            {formation.duree || 'Durée non spécifiée'}
                          </div>
                          <div className="flex items-center">
                            <FiUsers className="mr-2 text-blue-600" />
                            {formation.places || '0'} places
                          </div>
                        </div>
                      </div>
                    </div>
                  </>
                )}
              </motion.div>
            ))}
          </AnimatePresence>
        ) : (
          <div className="col-span-full text-center py-12">
            <div className="inline-block p-4 bg-blue-50 rounded-full mb-4">
              <FiSearch className="text-blue-600 text-3xl" />
            </div>
            <h3 className="text-lg font-medium text-gray-700">Aucune formation trouvée</h3>
            <p className="text-gray-500 mt-1">Essayez de modifier vos critères de recherche</p>
            <button
              onClick={() => {
                updateState({ 
                  searchFilter: '',
                  levelFilter: 'Tous' 
                });
              }}
              className="mt-4 px-4 py-2 text-blue-600 hover:text-blue-800 font-medium"
            >
              Réinitialiser les filtres
            </button>
          </div>
        )}
      </motion.div>
    </div>
  );
};

export default GestionFormations;
