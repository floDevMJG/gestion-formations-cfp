import React, { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useNavigate } from "react-router-dom";
import API from "../../services/api";
import { useAuth } from "../../contexts/AuthContext";
import {
  FiPlus,
  FiCalendar,
  FiClock,
  FiUsers,
  FiEdit2,
  FiTrash2,
  FiEye,
  FiFilter,
  FiSearch
} from "react-icons/fi";
import { FaChalkboardTeacher } from "react-icons/fa";

const FormateurAteliers = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [ateliers, setAteliers] = useState([]);
  const [filteredAteliers, setFilteredAteliers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [showForm, setShowForm] = useState(false);
  const [editingAtelier, setEditingAtelier] = useState(null);
  const [showAll, setShowAll] = useState(false);
  const [formData, setFormData] = useState({
    titre: "",
    description: "",
    date: "",
    heureDebut: "",
    heureFin: "",
    salle: "",
    capacite: "",
    type: "pratique"
  });

  useEffect(() => {
    fetchAteliers();
  }, []);

  useEffect(() => {
    const filtered = ateliers.filter(atelier =>
      atelier.titre?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      atelier.description?.toLowerCase().includes(searchTerm.toLowerCase())
    );
    setFilteredAteliers(filtered);
  }, [searchTerm, ateliers]);

  const fetchAteliers = async () => {
    try {
      const endpoint = showAll ? "/ateliers" : "/formateur/ateliers";
      const res = await API.get(endpoint);
      setAteliers(res.data);
      setFilteredAteliers(res.data);
    } catch (error) {
      console.error("Erreur lors de la récupération des ateliers:", error);
      // Données de démonstration en cas d'erreur
      setAteliers([
        {
          id: 1,
          titre: "Atelier Charpente Marine Traditionnelle",
          description: "Apprentissage des techniques traditionnelles de charpenterie marine : assemblages, jointures et travail du bois pour la construction navale",
          date: "2024-01-15",
          heureDebut: "09:00",
          heureFin: "12:00",
          salle: "Atelier Naval 101",
          capacite: 20,
          inscrits: 15,
          type: "pratique",
          statut: "actif"
        },
        {
          id: 2,
          titre: "Atelier Construction Coque en Bois",
          description: "Maîtrise des techniques de construction de coques en bois : bordé, membrures et renforts pour bateaux traditionnels",
          date: "2024-01-18",
          heureDebut: "14:00",
          heureFin: "17:00",
          salle: "Atelier Naval 102",
          capacite: 15,
          inscrits: 12,
          type: "pratique",
          statut: "actif"
        },
        {
          id: 3,
          titre: "Atelier Vitrerie Marine",
          description: "Techniques de vitrerie marine : pose de hublots, fenêtres et vitrages spécifiques pour les embarcations",
          date: "2024-01-22",
          heureDebut: "10:00",
          heureFin: "13:00",
          salle: "Atelier Naval 103",
          capacite: 18,
          inscrits: 16,
          type: "pratique",
          statut: "actif"
        }
      ]);
      setFilteredAteliers([
        {
          id: 1,
          titre: "Atelier Charpente Marine Traditionnelle",
          description: "Apprentissage des techniques traditionnelles de charpenterie marine : assemblages, jointures et travail du bois pour la construction navale",
          date: "2024-01-15",
          heureDebut: "09:00",
          heureFin: "12:00",
          salle: "Atelier Naval 101",
          capacite: 20,
          inscrits: 15,
          type: "pratique",
          statut: "actif"
        },
        {
          id: 2,
          titre: "Atelier Construction Coque en Bois",
          description: "Maîtrise des techniques de construction de coques en bois : bordé, membrures et renforts pour bateaux traditionnels",
          date: "2024-01-18",
          heureDebut: "14:00",
          heureFin: "17:00",
          salle: "Atelier Naval 102",
          capacite: 15,
          inscrits: 12,
          type: "pratique",
          statut: "actif"
        },
        {
          id: 3,
          titre: "Atelier Vitrerie Marine",
          description: "Techniques de vitrerie marine : pose de hublots, fenêtres et vitrages spécifiques pour les embarcations",
          date: "2024-01-22",
          heureDebut: "10:00",
          heureFin: "13:00",
          salle: "Atelier Naval 103",
          capacite: 18,
          inscrits: 16,
          type: "pratique",
          statut: "actif"
        }
      ]);
    } finally {
      setLoading(false);
    }
  };

  const toggleShowAll = async () => {
    setShowAll(prev => !prev);
    setLoading(true);
    try {
      await fetchAteliers();
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editingAtelier) {
        await API.put(`/ateliers/${editingAtelier.id}`, formData);
      } else {
        await API.post("/ateliers", { ...formData, formateurId: user.id });
      }
      resetForm();
      fetchAteliers();
    } catch (error) {
      console.error("Erreur lors de l'enregistrement de l'atelier:", error);
      alert("Erreur lors de l'enregistrement de la version");
    }
  };

  const deleteAtelier = async (id) => {
    if (window.confirm("Supprimer cette version ?")) {
      try {
        await API.delete(`/ateliers/${id}`);
        fetchAteliers();
      } catch (error) {
        console.error("Erreur lors de la suppression:", error);
        alert("Erreur lors de la suppression de la version");
      }
    }
  };

  const resetForm = () => {
    setFormData({
      titre: "",
      description: "",
      date: "",
      heureDebut: "",
      heureFin: "",
      salle: "",
      capacite: "",
      type: "pratique"
    });
    setEditingAtelier(null);
    setShowForm(false);
  };

  const editAtelier = (atelier) => {
    setFormData(atelier);
    setEditingAtelier(atelier);
    setShowForm(true);
  };

  const getTypeColor = (type) => {
    switch (type) {
      case "pratique":
        return "bg-blue-100 text-blue-800 border-blue-200";
      case "theorique":
        return "bg-green-100 text-green-800 border-green-200";
      case "hybride":
        return "bg-purple-100 text-purple-800 border-purple-200";
      default:
        return "bg-gray-100 text-gray-800 border-gray-200";
    }
  };

  const getStatutColor = (statut) => {
    switch (statut) {
      case "actif":
        return "bg-green-100 text-green-800";
      case "annulé":
        return "bg-red-100 text-red-800";
      case "terminé":
        return "bg-gray-100 text-gray-800";
      default:
        return "bg-yellow-100 text-yellow-800";
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
                <h1 className="text-2xl font-bold text-gray-800">Ateliers</h1>
                <p className="text-sm text-gray-500">Gérez vos ateliers et formations pratiques</p>
              </div>
            </div>
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => setShowForm(true)}
              className="px-4 py-2 bg-gradient-to-r from-purple-500 to-blue-500 text-white rounded-lg hover:from-purple-600 hover:to-blue-600 transition-all shadow-md flex items-center space-x-2"
            >
              <FiPlus className="w-4 h-4" />
              <span>Nouvel Atelier</span>
            </motion.button>
          </div>
        </div>
      </motion.div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Barre de recherche et filtres */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 mb-8"
        >
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1 relative">
              <FiSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                type="text"
                placeholder="Rechercher un atelier..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
              />
            </div>
            <div className="flex items-center space-x-2">
              <FiFilter className="text-gray-500" />
              <span className="text-sm text-gray-600">
                {filteredAteliers.length} atelier{filteredAteliers.length > 1 ? 's' : ''}
              </span>
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={toggleShowAll}
                className="ml-3 px-3 py-2 bg-gray-100 text-gray-800 rounded-lg hover:bg-gray-200 transition-colors text-sm"
              >
                {showAll ? 'Mes ateliers' : 'Voir plus'}
              </motion.button>
            </div>
          </div>
        </motion.div>

        {/* Grille des ateliers */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ staggerChildren: 0.1 }}
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
        >
          {filteredAteliers.map((atelier, index) => (
            <motion.div
              key={atelier.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 * index }}
              whileHover={{ y: -5, transition: { duration: 0.2 } }}
              className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden hover:shadow-lg transition-all"
            >
              <div className="p-6">
                <div className="flex justify-between items-start mb-4">
                  <div className="flex-1">
                    <h3 className="text-lg font-bold text-gray-800 mb-2">{atelier.titre}</h3>
                    <p className="text-sm text-gray-600 line-clamp-2">{atelier.description}</p>
                  </div>
                  <span className={`px-2 py-1 text-xs font-medium rounded-full border ${getTypeColor(atelier.type)}`}>
                    {atelier.type}
                  </span>
                </div>

                <div className="space-y-3 mb-4">
                  <div className="flex items-center space-x-2 text-sm text-gray-600">
                    <FiCalendar className="w-4 h-4" />
                    <span>{new Date(atelier.date).toLocaleDateString('fr-FR')}</span>
                  </div>
                  <div className="flex items-center space-x-2 text-sm text-gray-600">
                    <FiClock className="w-4 h-4" />
                    <span>{atelier.heureDebut} - {atelier.heureFin}</span>
                  </div>
                  <div className="flex items-center space-x-2 text-sm text-gray-600">
                    <FiUsers className="w-4 h-4" />
                    <span>{atelier.inscrits || 0}/{atelier.capacite} participants</span>
                  </div>
                  {atelier.salle && (
                    <div className="text-sm text-gray-600">
                      📍 {atelier.salle}
                    </div>
                  )}
                </div>

                <div className="flex items-center justify-between mb-4">
                  <span className={`px-2 py-1 text-xs font-medium rounded-full ${getStatutColor(atelier.statut)}`}>
                    {atelier.statut}
                  </span>
                  <div className="w-full bg-gray-200 rounded-full h-2 max-w-[100px]">
                    <div
                      className="bg-gradient-to-r from-purple-500 to-blue-500 h-2 rounded-full"
                      style={{ width: `${((atelier.inscrits || 0) / atelier.capacite) * 100}%` }}
                    />
                  </div>
                </div>

                <div className="flex space-x-2">
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => navigate(`/formateur/ateliers/${atelier.id}`)}
                    className="flex-1 px-3 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors flex items-center justify-center space-x-1 text-sm"
                  >
                    <FiEye className="w-4 h-4" />
                    <span>Voir</span>
                  </motion.button>
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => editAtelier(atelier)}
                    className="px-3 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600 transition-colors"
                  >
                    <FiEdit2 className="w-4 h-4" />
                  </motion.button>
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => deleteAtelier(atelier.id)}
                    className="px-3 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors"
                  >
                    <FiTrash2 className="w-4 h-4" />
                  </motion.button>
                </div>
              </div>
            </motion.div>
          ))}
        </motion.div>

        {filteredAteliers.length === 0 && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-center py-12"
          >
            <div className="text-gray-400 mb-4">
              <FiCalendar className="w-16 h-16 mx-auto" />
            </div>
            <h3 className="text-lg font-medium text-gray-600 mb-2">Aucun atelier trouvé</h3>
            <p className="text-gray-500">
              {searchTerm ? "Essayez une autre recherche" : "Créez votre premier atelier"}
            </p>
          </motion.div>
        )}
      </div>

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
                    {editingAtelier ? "Modifier l'atelier" : "Nouvel atelier"}
                  </h2>
                </div>
                <form onSubmit={handleSubmit} className="p-6 space-y-4">
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
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Salle</label>
                      <input
                        type="text"
                        value={formData.salle}
                        onChange={(e) => setFormData({ ...formData, salle: e.target.value })}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Capacité</label>
                      <input
                        type="number"
                        required
                        value={formData.capacite}
                        onChange={(e) => setFormData({ ...formData, capacite: e.target.value })}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                      />
                    </div>
                  </div>
                  <div className="flex space-x-3 pt-4">
                    <motion.button
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      type="submit"
                      className="flex-1 px-4 py-2 bg-gradient-to-r from-purple-500 to-blue-500 text-white rounded-lg hover:from-purple-600 hover:to-blue-600 transition-all"
                    >
                      {editingAtelier ? "Mettre à jour" : "Créer"}
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
};

export default FormateurAteliers;
