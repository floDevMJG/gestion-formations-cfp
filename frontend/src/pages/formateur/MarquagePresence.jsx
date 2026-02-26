import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate, useParams } from 'react-router-dom';
import API from '../../services/api';
import { FiCheck, FiX, FiClock, FiCalendar, FiUsers, FiMapPin, FiSave, FiSearch, FiFilter } from 'react-icons/fi';
import { FaChalkboardTeacher } from 'react-icons/fa';

export default function MarquagePresence() {
  const navigate = useNavigate();
  const { id } = useParams();
  const [cours, setCours] = useState(null);
  const [allCours, setAllCours] = useState([]);
  const [eleves, setEleves] = useState([]);
  const [presences, setPresences] = useState({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatut, setFilterStatut] = useState('all');
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);

  useEffect(() => {
    if (id) {
      fetchCoursAndEleves();
    } else {
      fetchAllCours();
    }
  }, [id]);

  const fetchAllCours = async () => {
    try {
      const response = await API.get('/cours/formateur');
      setAllCours(response.data || [
        {
          id: 1,
          titre: "Charpente Marine Avancée",
          date: "2024-01-15",
          heureDebut: "09:00",
          heureFin: "12:00",
          salle: "Atelier A",
          inscrits: 15,
          capacite: 20,
          statut: "actif"
        },
        {
          id: 2,
          titre: "Théorie des Structures",
          date: "2024-01-16",
          heureDebut: "14:00",
          heureFin: "17:00",
          salle: "Salle B2",
          inscrits: 25,
          capacite: 30,
          statut: "actif"
        }
      ]);
    } catch (error) {
      console.error('Erreur:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchCoursAndEleves = async () => {
    try {
      const [coursRes, elevesRes] = await Promise.all([
        API.get(`/formateur/cours`).then(res => res.data.find(c => c.id === parseInt(id))),
        API.get(`/formateur/cours/${id}/eleves`)
      ]);
      
      setCours(coursRes);
      setEleves(elevesRes.data || [
        { id: 1, nom: "Dupont", prenom: "Jean", email: "jean.dupont@email.com", presence: { statut: 'present' } },
        { id: 2, nom: "Martin", prenom: "Marie", email: "marie.martin@email.com", presence: { statut: 'absent' } },
        { id: 3, nom: "Bernard", prenom: "Pierre", email: "pierre.bernard@email.com", presence: { statut: 'retard' } }
      ]);
      
      // Initialiser les présences
      const presencesInit = {};
      elevesRes.data.forEach(eleve => {
        presencesInit[eleve.id] = eleve.presence?.statut || 'absent';
      });
      setPresences(presencesInit);
    } catch (error) {
      console.error('Erreur:', error);
      // Données de démonstration
      setCours({
        id: 1,
        titre: "Charpente Marine Avancée",
        date: "2024-01-15",
        heureDebut: "09:00",
        heureFin: "12:00",
        salle: "Atelier A",
        inscrits: 15,
        capacite: 20,
        statut: "actif"
      });
      setEleves([
        { id: 1, nom: "Dupont", prenom: "Jean", email: "jean.dupont@email.com", presence: { statut: 'present' } },
        { id: 2, nom: "Martin", prenom: "Marie", email: "marie.martin@email.com", presence: { statut: 'absent' } },
        { id: 3, nom: "Bernard", prenom: "Pierre", email: "pierre.bernard@email.com", presence: { statut: 'retard' } }
      ]);
      setPresences({
        1: 'present',
        2: 'absent',
        3: 'retard'
      });
    } finally {
      setLoading(false);
    }
  };

  const handlePresenceChange = (eleveId, statut) => {
    setPresences(prev => ({
      ...prev,
      [eleveId]: statut
    }));
  };

  const handleSavePresence = async () => {
    setSaving(true);
    try {
      await API.post(`/formateur/cours/${id}/presence`, {
        date: selectedDate,
        presences: presences
      });
      alert('Présences enregistrées avec succès !');
    } catch (error) {
      console.error('Erreur:', error);
      alert('Erreur lors de l\'enregistrement des présences');
    } finally {
      setSaving(false);
    }
  };

  const filteredEleves = eleves.filter(eleve => {
    const matchesSearch = eleve.nom.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         eleve.prenom.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         eleve.email.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatut = filterStatut === 'all' || presences[eleve.id] === filterStatut;
    return matchesSearch && matchesStatut;
  });

  const getStatutColor = (statut) => {
    switch (statut) {
      case 'present':
        return 'bg-green-100 text-green-800 border-green-200';
      case 'absent':
        return 'bg-red-100 text-red-800 border-red-200';
      case 'retard':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getStatutIcon = (statut) => {
    switch (statut) {
      case 'present':
        return <FiCheck className="w-4 h-4" />;
      case 'absent':
        return <FiX className="w-4 h-4" />;
      case 'retard':
        return <FiClock className="w-4 h-4" />;
      default:
        return null;
    }
  };

  const getStatistiques = () => {
    const total = Object.keys(presences).length;
    const presents = Object.values(presences).filter(s => s === 'present').length;
    const absents = Object.values(presences).filter(s => s === 'absent').length;
    const retards = Object.values(presences).filter(s => s === 'retard').length;
    
    return { total, presents, absents, retards };
  };

  const stats = getStatistiques();

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

  // Si pas d'ID spécifié, afficher la liste des cours
  if (!id) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-50 via-white to-blue-50 p-6">
        {/* Header */}
        <motion.div
          initial={{ y: -20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          className="mb-8"
        >
          <div className="flex items-center gap-4">
            <div className="p-3 bg-gradient-to-r from-purple-500 to-blue-500 rounded-xl">
              <FiUsers className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-gray-800">Marquage de Présence</h1>
              <p className="text-gray-500">Sélectionnez un cours pour marquer les présences</p>
            </div>
          </div>
        </motion.div>

        {/* Liste des cours */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
        >
          {allCours.map((coursItem, index) => (
            <motion.div
              key={coursItem.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 * index }}
              whileHover={{ y: -5, transition: { duration: 0.2 } }}
              className="bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden hover:shadow-xl transition-all cursor-pointer"
              onClick={() => navigate(`/formateur/presence/${coursItem.id}`)}
            >
              <div className="p-6">
                <div className="flex items-center gap-3 mb-4">
                  <div className="p-2 bg-purple-100 rounded-lg">
                    <FaChalkboardTeacher className="w-5 h-5 text-purple-600" />
                  </div>
                  <div>
                    <h3 className="text-lg font-bold text-gray-800">{coursItem.titre}</h3>
                    <p className="text-sm text-gray-500">{coursItem.statut}</p>
                  </div>
                </div>
                
                <div className="space-y-2 mb-4">
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
                  <div className="flex items-center gap-2 text-sm text-gray-600">
                    <FiUsers className="w-4 h-4" />
                    <span>{coursItem.inscrits}/{coursItem.capacite} étudiants</span>
                  </div>
                </div>

                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div
                    className="bg-gradient-to-r from-purple-500 to-blue-500 h-2 rounded-full"
                    style={{ width: `${(coursItem.inscrits / coursItem.capacite) * 100}%` }}
                  />
                </div>
              </div>
            </motion.div>
          ))}
        </motion.div>
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
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => navigate('/formateur/presence')}
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <FiX className="w-5 h-5" />
            </motion.button>
            <div className="p-3 bg-gradient-to-r from-purple-500 to-blue-500 rounded-xl">
              <FiUsers className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-gray-800">Marquage de Présence</h1>
              <p className="text-gray-500">{cours?.titre}</p>
            </div>
          </div>
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={handleSavePresence}
            disabled={saving}
            className="px-4 py-2 bg-gradient-to-r from-green-500 to-green-600 text-white rounded-lg hover:from-green-600 hover:to-green-700 transition-all flex items-center gap-2 disabled:opacity-50"
          >
            <FiSave className="w-4 h-4" />
            {saving ? 'Enregistrement...' : 'Enregistrer'}
          </motion.button>
        </div>
      </motion.div>

      {/* Informations du cours */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white rounded-2xl shadow-lg border border-gray-100 p-6 mb-6"
      >
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-blue-100 rounded-lg">
              <FiCalendar className="w-5 h-5 text-blue-600" />
            </div>
            <div>
              <p className="text-sm text-gray-600">Date</p>
              <p className="font-semibold">{new Date(cours?.date).toLocaleDateString('fr-FR')}</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <div className="p-2 bg-green-100 rounded-lg">
              <FiClock className="w-5 h-5 text-green-600" />
            </div>
            <div>
              <p className="text-sm text-gray-600">Horaires</p>
              <p className="font-semibold">{cours?.heureDebut} - {cours?.heureFin}</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <div className="p-2 bg-purple-100 rounded-lg">
              <FiMapPin className="w-5 h-5 text-purple-600" />
            </div>
            <div>
              <p className="text-sm text-gray-600">Salle</p>
              <p className="font-semibold">{cours?.salle}</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <div className="p-2 bg-orange-100 rounded-lg">
              <FiUsers className="w-5 h-5 text-orange-600" />
            </div>
            <div>
              <p className="text-sm text-gray-600">Étudiants</p>
              <p className="font-semibold">{eleves.length} inscrits</p>
            </div>
          </div>
        </div>
      </motion.div>

      {/* Statistiques */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6"
      >
        <motion.div
          whileHover={{ scale: 1.02 }}
          className="bg-white rounded-2xl shadow-lg border border-gray-100 p-6"
        >
          <div className="flex items-center gap-4">
            <div className="p-3 bg-green-100 rounded-xl">
              <FiCheck className="w-6 h-6 text-green-600" />
            </div>
            <div>
              <p className="text-sm text-gray-600">Présents</p>
              <p className="text-2xl font-bold text-green-600">{stats.presents}</p>
            </div>
          </div>
        </motion.div>

        <motion.div
          whileHover={{ scale: 1.02 }}
          className="bg-white rounded-2xl shadow-lg border border-gray-100 p-6"
        >
          <div className="flex items-center gap-4">
            <div className="p-3 bg-red-100 rounded-xl">
              <FiX className="w-6 h-6 text-red-600" />
            </div>
            <div>
              <p className="text-sm text-gray-600">Absents</p>
              <p className="text-2xl font-bold text-red-600">{stats.absents}</p>
            </div>
          </div>
        </motion.div>

        <motion.div
          whileHover={{ scale: 1.02 }}
          className="bg-white rounded-2xl shadow-lg border border-gray-100 p-6"
        >
          <div className="flex items-center gap-4">
            <div className="p-3 bg-yellow-100 rounded-xl">
              <FiClock className="w-6 h-6 text-yellow-600" />
            </div>
            <div>
              <p className="text-sm text-gray-600">Retards</p>
              <p className="text-2xl font-bold text-yellow-600">{stats.retards}</p>
            </div>
          </div>
        </motion.div>

        <motion.div
          whileHover={{ scale: 1.02 }}
          className="bg-white rounded-2xl shadow-lg border border-gray-100 p-6"
        >
          <div className="flex items-center gap-4">
            <div className="p-3 bg-purple-100 rounded-xl">
              <FiUsers className="w-6 h-6 text-purple-600" />
            </div>
            <div>
              <p className="text-sm text-gray-600">Total</p>
              <p className="text-2xl font-bold text-purple-600">{stats.total}</p>
            </div>
          </div>
        </motion.div>
      </motion.div>

      {/* Filtres et recherche */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="bg-white rounded-2xl shadow-lg border border-gray-100 p-6 mb-6"
      >
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="relative">
            <FiSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            <input
              type="text"
              placeholder="Rechercher un étudiant..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
            />
          </div>
          <select
            value={filterStatut}
            onChange={(e) => setFilterStatut(e.target.value)}
            className="px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
          >
            <option value="all">Tous les statuts</option>
            <option value="present">Présents</option>
            <option value="absent">Absents</option>
            <option value="retard">Retards</option>
          </select>
          <div className="flex items-center gap-2 text-sm text-gray-600">
            <FiFilter className="w-4 h-4" />
            <span>{filteredEleves.length} étudiants trouvés</span>
          </div>
        </div>
      </motion.div>

      {/* Liste des étudiants */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        className="bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden"
      >
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Étudiant
                </th>
                <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Email
                </th>
                <th className="px-6 py-4 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Statut
                </th>
                <th className="px-6 py-4 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              <AnimatePresence>
                {filteredEleves.map((eleve, index) => (
                  <motion.tr
                    key={eleve.id}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: 20 }}
                    transition={{ delay: 0.05 * index }}
                    className="hover:bg-gray-50 transition-colors"
                  >
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="w-10 h-10 bg-gradient-to-r from-purple-500 to-blue-500 rounded-full flex items-center justify-center text-white font-bold mr-3">
                          {eleve.nom[0]}{eleve.prenom[0]}
                        </div>
                        <div>
                          <div className="text-sm font-medium text-gray-900">
                            {eleve.prenom} {eleve.nom}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-600">{eleve.email}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-center">
                      <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium border ${getStatutColor(presences[eleve.id])}`}>
                        {getStatutIcon(presences[eleve.id])}
                        <span className="ml-1">
                          {presences[eleve.id] === 'present' ? 'Présent' : 
                           presences[eleve.id] === 'absent' ? 'Absent' : 'Retard'}
                        </span>
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-center">
                      <div className="flex items-center justify-center gap-2">
                        <motion.button
                          whileHover={{ scale: 1.05 }}
                          whileTap={{ scale: 0.95 }}
                          onClick={() => handlePresenceChange(eleve.id, 'present')}
                          className={`p-2 rounded-lg transition-colors ${
                            presences[eleve.id] === 'present' 
                              ? 'bg-green-500 text-white' 
                              : 'bg-gray-200 text-gray-600 hover:bg-green-100'
                          }`}
                          title="Marquer comme présent"
                        >
                          <FiCheck className="w-4 h-4" />
                        </motion.button>
                        <motion.button
                          whileHover={{ scale: 1.05 }}
                          whileTap={{ scale: 0.95 }}
                          onClick={() => handlePresenceChange(eleve.id, 'absent')}
                          className={`p-2 rounded-lg transition-colors ${
                            presences[eleve.id] === 'absent' 
                              ? 'bg-red-500 text-white' 
                              : 'bg-gray-200 text-gray-600 hover:bg-red-100'
                          }`}
                          title="Marquer comme absent"
                        >
                          <FiX className="w-4 h-4" />
                        </motion.button>
                        <motion.button
                          whileHover={{ scale: 1.05 }}
                          whileTap={{ scale: 0.95 }}
                          onClick={() => handlePresenceChange(eleve.id, 'retard')}
                          className={`p-2 rounded-lg transition-colors ${
                            presences[eleve.id] === 'retard' 
                              ? 'bg-yellow-500 text-white' 
                              : 'bg-gray-200 text-gray-600 hover:bg-yellow-100'
                          }`}
                          title="Marquer comme retard"
                        >
                          <FiClock className="w-4 h-4" />
                        </motion.button>
                      </div>
                    </td>
                  </motion.tr>
                ))}
              </AnimatePresence>
            </tbody>
          </table>
        </div>
      </motion.div>
    </div>
  );
}
