import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate, useSearchParams } from 'react-router-dom';
import API from '../../services/api';
import { FiBook, FiCalendar, FiClock, FiUsers, FiMapPin, FiEdit2, FiTrash2, FiPlus, FiFilter, FiSearch, FiEye } from 'react-icons/fi';
import { FaChalkboardTeacher } from 'react-icons/fa';

export default function MesCours() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const action = searchParams.get('action');
  
  const [cours, setCours] = useState([]);
  const [formations, setFormations] = useState([]);
  const [formateurs, setFormateurs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(action === 'create');
  const [editingId, setEditingId] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState('all');
  const [filterStatut, setFilterStatut] = useState('all');
  
  const [formData, setFormData] = useState({
    formationId: '',
    titre: '',
    description: '',
    date: '',
    heureDebut: '',
    heureFin: '',
    salle: '',
    type: 'cours',
    formateurId: ''
  });

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [coursRes, formationsRes, formateursRes] = await Promise.all([
        API.get('/formateur/ateliers'),
        API.get('/formations'),
        API.get('/admin/users')
      ]);
      setCours(coursRes.data || []);
      setFormations(formationsRes.data || []);
      // Filtrer pour n'obtenir que les formateurs
      setFormateurs((formateursRes.data || []).filter(user => user.role === 'formateur'));
    } catch (error) {
      console.error('Erreur:', error);
      // Données de démonstration
      setCours([
        {
          id: 1,
          titre: "Charpente Marine Avancée",
          description: "Techniques avancées de charpenterie marine",
          date: "2024-01-15",
          heureDebut: "09:00",
          heureFin: "12:00",
          salle: "Atelier A",
          type: "pratique",
          statut: "actif"
        },
        {
          id: 2,
          titre: "Théorie des Structures",
          description: "Principes fondamentaux de la résistance des matériaux",
          date: "2024-01-16",
          heureDebut: "14:00",
          heureFin: "17:00",
          salle: "Salle B2",
          type: "theorique",
          statut: "actif"
        }
      ]);
      setFormations([
        { id: 1, titre: "Techniques de Charpenterie" },
        { id: 2, titre: "Génie Civil" }
      ]);
      setFormateurs([
        { id: 1, nom: "Dupont", prenom: "Jean", email: "jean.dupont@email.com" },
        { id: 2, nom: "Martin", prenom: "Marie", email: "marie.martin@email.com" }
      ]);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editingId) {
        await API.put(`/ateliers/${editingId}`, {
          titre: formData.titre,
          description: formData.description,
          date: formData.date,
          heureDebut: formData.heureDebut,
          heureFin: formData.heureFin,
          salle: formData.salle,
          capacite: formData.capacite || 20,
          type: formData.type || 'cours',
          statut: formData.statut || 'actif',
          formateur_id: formData.formateurId || ''
        });
        alert('Cours mis à jour avec succès');
      } else {
        await API.post('/ateliers', {
          titre: formData.titre,
          description: formData.description,
          date: formData.date,
          heureDebut: formData.heureDebut,
          heureFin: formData.heureFin,
          salle: formData.salle,
          capacite: formData.capacite || 20,
          type: formData.type || 'cours',
          statut: formData.statut || 'actif',
          formateur_id: formData.formateurId || ''
        });
        alert('Cours créé avec succès');
      }
      resetForm();
      fetchData();
    } catch (error) {
      console.error('Erreur:', error);
      alert(`Erreur lors de l'opération: ${error.response?.data?.message || error.message || 'Erreur serveur'}`);
    }
  };

  const handleEdit = (cours) => {
    setFormData({
      formationId: cours.formationId || '',
      titre: cours.titre,
      description: cours.description,
      date: cours.date,
      heureDebut: cours.heureDebut,
      heureFin: cours.heureFin,
      salle: cours.salle,
      type: cours.type,
      formateurId: cours.formateurId || ''
    });
    setEditingId(cours.id);
    setShowForm(true);
  };

  const handleDelete = async (id) => {
    if (window.confirm('Êtes-vous sûr de vouloir supprimer ce cours ?')) {
      try {
        await API.delete(`/ateliers/${id}`);
        alert('Cours supprimé avec succès');
        fetchData();
      } catch (error) {
        console.error('Erreur:', error);
        alert('Erreur lors de la suppression');
      }
    }
  };

  const resetForm = () => {
    setFormData({
      formationId: '',
      titre: '',
      description: '',
      date: '',
      heureDebut: '',
      heureFin: '',
      salle: '',
      type: 'cours',
      formateurId: ''
    });
    setEditingId(null);
    setShowForm(false);
  };

  const filteredCours = cours.filter(c => {
    const matchesSearch = c.titre.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         c.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesType = filterType === 'all' || c.type === filterType;
    const matchesStatut = filterStatut === 'all' || c.statut === filterStatut;
    return matchesSearch && matchesType && matchesStatut;
  });

  const getTypeColor = (type) => {
    switch (type) {
      case 'pratique':
        return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'theorique':
        return 'bg-green-100 text-green-800 border-green-200';
      case 'hybride':
        return 'bg-purple-100 text-purple-800 border-purple-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getStatutColor = (statut) => {
    switch (statut) {
      case 'actif':
        return 'bg-green-100 text-green-800';
      case 'annulé':
        return 'bg-red-100 text-red-800';
      case 'terminé':
        return 'bg-gray-100 text-gray-800';
      default:
        return 'bg-yellow-100 text-yellow-800';
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
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-white to-blue-50 p-6">
      {/* Header */}
      <motion.div
        initial={{ y: -20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        className="mb-8"
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-gradient-to-r from-purple-500 to-blue-500 rounded-xl">
              <FiBook className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-gray-800">Mes Cours</h1>
              <p className="text-gray-500">Gérez vos cours et formations</p>
            </div>
          </div>
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => setShowForm(true)}
            className="px-4 py-2 bg-gradient-to-r from-purple-500 to-blue-500 text-white rounded-lg hover:from-purple-600 hover:to-blue-600 transition-all flex items-center gap-2"
          >
            <FiPlus className="w-4 h-4" />
            Nouveau Cours
          </motion.button>
        </div>
      </motion.div>

      {/* Filtres et recherche */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white rounded-2xl shadow-lg border border-gray-100 p-6 mb-6"
      >
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="relative">
            <FiSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            <input
              type="text"
              placeholder="Rechercher un cours..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
            />
          </div>
          <select
            value={filterType}
            onChange={(e) => setFilterType(e.target.value)}
            className="px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
          >
            <option value="all">Tous les types</option>
            <option value="pratique">Pratique</option>
            <option value="theorique">Théorique</option>
            <option value="hybride">Hybride</option>
          </select>
          <select
            value={filterStatut}
            onChange={(e) => setFilterStatut(e.target.value)}
            className="px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
          >
            <option value="all">Tous les statuts</option>
            <option value="actif">Actif</option>
            <option value="annulé">Annulé</option>
            <option value="terminé">Terminé</option>
          </select>
          <div className="flex items-center gap-2 text-sm text-gray-600">
            <FiFilter className="w-4 h-4" />
            <span>{filteredCours.length} cours trouvés</span>
          </div>
        </div>
      </motion.div>

      {/* Grille des cours */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ staggerChildren: 0.1 }}
        className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8"
      >
        {filteredCours.map((coursItem, index) => (
          <motion.div
            key={coursItem.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 * index }}
            whileHover={{ y: -5, transition: { duration: 0.2 } }}
            className="bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden hover:shadow-xl transition-all"
          >
            <div className="p-6">
              <div className="flex justify-between items-start mb-4">
                <div className="flex-1">
                  <h3 className="text-lg font-bold text-gray-800 mb-2">{coursItem.titre}</h3>
                  <p className="text-sm text-gray-600 line-clamp-2">{coursItem.description}</p>
                </div>
                <span className={`px-2 py-1 text-xs font-medium rounded-full border ${getTypeColor(coursItem.type)}`}>
                  {coursItem.type}
                </span>
              </div>

              <div className="space-y-3 mb-4">
                <div className="flex items-center gap-2 text-sm text-gray-600">
                  <FiCalendar className="w-4 h-4" />
                  <span>{new Date(coursItem.date).toLocaleDateString('fr-FR')}</span>
                </div>
                <div className="flex items-center gap-2 text-sm text-gray-600">
                  <FiClock className="w-4 h-4" />
                  <span>{coursItem.heureDebut} - {coursItem.heureFin}</span>
                </div>
                <div className="flex items-center gap-2 text-sm text-gray-600">
                  <FiMapPin className="w-4 h-4" />
                  <span>{coursItem.salle}</span>
                </div>
              </div>

              <div className="flex items-center justify-between mb-4">
                <span className={`px-2 py-1 text-xs font-medium rounded-full ${getStatutColor(coursItem.statut)}`}>
                  {coursItem.statut}
                </span>
              </div>

              <div className="flex gap-2">
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => navigate(`/formateur/cours/${coursItem.id}`)}
                  className="flex-1 px-3 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors flex items-center justify-center gap-1 text-sm"
                >
                  <FiEye className="w-4 h-4" />
                  Voir
                </motion.button>
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => handleEdit(coursItem)}
                  className="px-3 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600 transition-colors"
                >
                  <FiEdit2 className="w-4 h-4" />
                </motion.button>
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => handleDelete(coursItem.id)}
                  className="px-3 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors"
                >
                  <FiTrash2 className="w-4 h-4" />
                </motion.button>
              </div>
            </div>
          </motion.div>
        ))}
      </motion.div>

      {filteredCours.length === 0 && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="text-center py-12"
        >
          <div className="text-gray-400 mb-4">
            <FiBook className="w-16 h-16 mx-auto" />
          </div>
          <h3 className="text-lg font-medium text-gray-600 mb-2">Aucun cours trouvé</h3>
          <p className="text-gray-500">
            {searchTerm || filterType !== 'all' || filterStatut !== 'all' 
              ? "Essayez d'ajuster vos filtres" 
              : "Créez votre premier cours"}
          </p>
        </motion.div>
      )}

      {/* Modal formulaire */}
      <AnimatePresence>
        {showForm && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black bg-opacity-50 z-40"
              onClick={resetForm}
            />
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="fixed inset-0 z-50 flex items-center justify-center p-4"
            >
              <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full max-h-[90vh] overflow-y-auto">
                <div className="bg-gradient-to-r from-purple-500 to-blue-500 text-white p-6 rounded-t-2xl">
                  <h2 className="text-xl font-bold">
                    {editingId ? "Modifier le cours" : "Nouveau cours"}
                  </h2>
                </div>
                <form onSubmit={handleSubmit} className="p-6 space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Formation</label>
                    <select
                      value={formData.formationId}
                      onChange={(e) => setFormData({ ...formData, formationId: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                      required
                    >
                      <option value="">Sélectionner une formation</option>
                      {formations.map(formation => (
                        <option key={formation.id} value={formation.id}>
                          {formation.titre}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Formateur</label>
                    <select
                      value={formData.formateurId}
                      onChange={(e) => setFormData({ ...formData, formateurId: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                      required
                    >
                      <option value="">Sélectionner un formateur</option>
                      {formateurs.map(formateur => (
                        <option key={formateur.id} value={formateur.id}>
                          {formateur.prenom} {formateur.nom} - {formateur.email}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Titre</label>
                    <input
                      type="text"
                      required
                      value={formData.titre}
                      onChange={(e) => setFormData({ ...formData, titre: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Description</label>
                    <textarea
                      required
                      value={formData.description}
                      onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                      rows={3}
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Date</label>
                      <input
                        type="date"
                        required
                        value={formData.date}
                        onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Type</label>
                      <select
                        value={formData.type}
                        onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                      >
                        <option value="cours">Cours</option>
                        <option value="pratique">Pratique</option>
                        <option value="theorique">Théorique</option>
                        <option value="hybride">Hybride</option>
                      </select>
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Heure début</label>
                      <input
                        type="time"
                        required
                        value={formData.heureDebut}
                        onChange={(e) => setFormData({ ...formData, heureDebut: e.target.value })}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Heure fin</label>
                      <input
                        type="time"
                        required
                        value={formData.heureFin}
                        onChange={(e) => setFormData({ ...formData, heureFin: e.target.value })}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Salle</label>
                    <input
                      type="text"
                      required
                      value={formData.salle}
                      onChange={(e) => setFormData({ ...formData, salle: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                    />
                  </div>
                  <div className="flex space-x-3 pt-4">
                    <motion.button
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      type="submit"
                      className="flex-1 px-4 py-2 bg-gradient-to-r from-purple-500 to-blue-500 text-white rounded-lg hover:from-purple-600 hover:to-blue-600 transition-all"
                    >
                      {editingId ? "Mettre à jour" : "Créer"}
                    </motion.button>
                    <motion.button
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      type="button"
                      onClick={resetForm}
                      className="px-4 py-2 bg-gray-200 text-gray-800 rounded-lg hover:bg-gray-300 transition-colors"
                    >
                      Annuler
                    </motion.button>
                  </div>
                </form>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}
