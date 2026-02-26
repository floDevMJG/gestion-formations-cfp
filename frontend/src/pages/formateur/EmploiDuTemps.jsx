import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import API from '../../services/api';
import { FiCalendar, FiClock, FiMapPin, FiUsers, FiChevronLeft, FiChevronRight, FiFilter, FiPlus, FiRefreshCw, FiTrash2 } from 'react-icons/fi';
import { FaChalkboardTeacher } from 'react-icons/fa';

export default function EmploiDuTemps() {
  const navigate = useNavigate();
  const [cours, setCours] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedWeek, setSelectedWeek] = useState(new Date());
  const [viewMode, setViewMode] = useState('week'); // 'week' ou 'day'
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [showAdd, setShowAdd] = useState(false);
  const [addTarget, setAddTarget] = useState({ date: null, heure: '' });
  const [chooseType, setChooseType] = useState('');
  const [titlesOptions, setTitlesOptions] = useState([]);
  const [sallesOptions, setSallesOptions] = useState([]);
  const [selectedTitle, setSelectedTitle] = useState('');
  const [selectedSalle, setSelectedSalle] = useState('');
  const [loadingOptions, setLoadingOptions] = useState(false);
  const [saving, setSaving] = useState(false);

  const storageKey = 'cfp_timetable_local';
  const readLocal = () => {
    try {
      const raw = localStorage.getItem(storageKey);
      return raw ? JSON.parse(raw) : [];
    } catch {
      return [];
    }
  };
  const writeLocal = (list) => {
    try {
      localStorage.setItem(storageKey, JSON.stringify(list));
    } catch {}
  };
  const mergeWithLocal = (serverList) => {
    const localList = readLocal();
    const byId = new Map((serverList || []).filter(e => e.id != null).map(e => [String(e.id), e]));
    const result = [...(serverList || [])];
    (localList || []).forEach(e => {
      if (e.id != null && byId.has(String(e.id))) return;
      const exists = result.some(s =>
        (s.titre || '') === (e.titre || '') &&
        (s.date || '') === (e.date || '') &&
        (s.heureDebut || '') === (e.heureDebut || '') &&
        (s.heureFin || '') === (e.heureFin || '') &&
        (s.salle || '') === (e.salle || '') &&
        (s.type || '') === (e.type || '')
      );
      if (!exists) result.push(e);
    });
    return result;
  };

  useEffect(() => {
    // Pré-remplir immédiatement avec le cache local pour éviter toute disparition visuelle au rafraîchissement
    const cached = readLocal();
    if (cached && cached.length) {
      setCours(cached);
      setLoading(false);
    }
    fetchCours();
    const onVisible = () => {
      if (document.visibilityState === 'visible') {
        fetchCours();
      }
    };
    document.addEventListener('visibilitychange', onVisible);
    return () => {
      document.removeEventListener('visibilitychange', onVisible);
    };
  }, []);

  const fetchCours = async () => {
    try {
      const response = await API.get('/formateur/ateliers');
      const data = response.data || [];
      setCours(mergeWithLocal(data));
    } catch (error) {
      console.error('Erreur chargement ateliers:', error);
      // En cas d'erreur réseau/API, on conserve les cours déjà affichés (pas de fallback qui efface)
    } finally {
      setLoading(false);
    }
  };

  const getWeekDates = (date) => {
    const d = new Date(date);
    const day = d.getDay();
    const diff = d.getDate() - day + (day === 0 ? -6 : 1); // Lundi
    const monday = new Date(d.setDate(diff));
    const week = [];
    for (let i = 0; i < 7; i++) {
      const date = new Date(monday);
      date.setDate(monday.getDate() + i);
      week.push(date);
    }
    return week;
  };

  const weekDates = getWeekDates(selectedWeek);
  const jours = ['Lundi', 'Mardi', 'Mercredi', 'Jeudi', 'Vendredi', 'Samedi', 'Dimanche'];
  const heures = ['08:00', '09:00', '10:00', '11:00', '12:00', '13:00', '14:00', '15:00', '16:00', '17:00', '18:00'];

  const getCoursForDay = (date) => {
    const yyyy = date.getFullYear();
    const mm = String(date.getMonth() + 1).padStart(2, '0');
    const dd = String(date.getDate()).padStart(2, '0');
    const cellStr = `${yyyy}-${mm}-${dd}`;
    return cours.filter(c => {
      const raw = c.date || '';
      const coursDateStr = /^\d{4}-\d{2}-\d{2}/.test(raw) ? raw.slice(0, 10) : (() => {
        try { return new Date(raw).toISOString().slice(0,10); } catch { return ''; }
      })();
      return coursDateStr === cellStr;
    });
  };

  const getCoursForTimeSlot = (date, heure) => {
    const dayCours = getCoursForDay(date);
    return dayCours.filter(c => {
      const ch = (c.heureDebut || '').slice(0,2);
      const sh = (heure || '').slice(0,2);
      const coursHeure = parseInt(ch, 10);
      const slotHeure = parseInt(sh, 10);
      if (Number.isNaN(coursHeure) || Number.isNaN(slotHeure)) return false;
      return coursHeure === slotHeure;
    });
  };

  const navigateWeek = (direction) => {
    const newWeek = new Date(selectedWeek);
    newWeek.setDate(newWeek.getDate() + (direction === 'next' ? 7 : -7));
    setSelectedWeek(newWeek);
  };

  const getCoursTypeColor = (type) => {
    switch (type) {
      case 'pratique':
        return 'bg-gradient-to-r from-blue-500 to-blue-600 text-white';
      case 'theorique':
        return 'bg-gradient-to-r from-green-500 to-green-600 text-white';
      case 'hybride':
        return 'bg-gradient-to-r from-purple-500 to-purple-600 text-white';
      default:
        return 'bg-gray-500 text-white';
    }
  };

  const openAddForCell = (date, heure) => {
    setAddTarget({ date, heure });
    setChooseType('');
    setTitlesOptions([]);
    setSallesOptions([]);
    setSelectedTitle('');
    setSelectedSalle('');
    setShowAdd(true);
  };

  const selectType = async (type) => {
    setChooseType(type);
    setLoadingOptions(true);
    try {
      const base = (API?.defaults && API.defaults.baseURL) ? API.defaults.baseURL : '/api';
      let allAteliers = [];
      try {
        const resAt = await fetch(`${base}/ateliers`, { headers: { 'Accept': 'application/json' } });
        allAteliers = resAt.ok ? (await resAt.json()) : [];
      } catch {
        allAteliers = [];
      }
      let titles = [];
      if (type === 'theorique') {
        try {
          const resCours = await API.get('/cours');
          const dataCours = resCours?.data || [];
          titles = Array.from(new Set(dataCours.map(c => c?.titre).filter(Boolean)));
        } catch {
          titles = Array.from(new Set(cours.map(c => c?.titre).filter(Boolean)));
        }
      } else {
        const src = allAteliers.length ? allAteliers : cours;
        titles = Array.from(new Set(src.filter(a => a?.type === 'pratique').map(a => a?.titre).filter(Boolean)));
      }
      const salles = Array.from(new Set((allAteliers.length ? allAteliers : cours).map(a => a?.salle).filter(Boolean)));
      setTitlesOptions(titles.sort((a,b)=>a.localeCompare(b)));
      setSallesOptions(salles.sort((a,b)=>a.localeCompare(b)));
    } catch (e) {
      const filteredLocal = cours.filter(a => a?.type === type);
      const titlesSet = new Set(filteredLocal.map(a => a?.titre).filter(Boolean));
      const sallesSet = new Set(filteredLocal.map(a => a?.salle).filter(Boolean));
      setTitlesOptions(Array.from(titlesSet).sort((a,b)=>a.localeCompare(b)));
      setSallesOptions(Array.from(sallesSet).sort((a,b)=>a.localeCompare(b)));
    } finally {
      setLoadingOptions(false);
    }
  };

  const addAtelier = async () => {
    if (!addTarget.date || !addTarget.heure || !chooseType || !selectedTitle || !selectedSalle) return;
    try {
      setSaving(true);
      const d = addTarget.date;
      const yyyy = d.getFullYear();
      const mm = String(d.getMonth() + 1).padStart(2, '0');
      const dd = String(d.getDate()).padStart(2, '0');
      const dateStr = `${yyyy}-${mm}-${dd}`;
      const startHour = parseInt(addTarget.heure.split(':')[0], 10);
      const endHour = Math.min(startHour + 1, 23);
      const heureFin = `${String(endHour).padStart(2, '0')}:00`;
      const res = await API.post('/ateliers', {
        titre: selectedTitle,
        description: '',
        date: dateStr,
        heureDebut: addTarget.heure,
        heureFin,
        salle: selectedSalle,
        capacite: 20,
        type: chooseType,
        statut: 'actif'
      });
      const newId = res?.data?.id || Math.random().toString(36).slice(2);
      const newItem = {
        id: newId,
        titre: selectedTitle,
        description: '',
        date: dateStr,
        heureDebut: addTarget.heure,
        heureFin,
        salle: selectedSalle,
        capacite: 20,
        inscrits: 0,
        type: chooseType,
        statut: 'actif'
      };
      setCours(prev => [newItem, ...prev]);
      const localList = readLocal();
      writeLocal([newItem, ...localList]);
      setShowAdd(false);
      await fetchCours();
    } catch (e) {
      console.error(e);
      alert("Erreur lors de l'ajout");
    } finally {
      setSaving(false);
    }
  };

  const deleteAtelier = async (id) => {
    if (!window.confirm('Supprimer ce cours ?')) return;
    try {
      await API.delete(`/ateliers/${id}`);
      setCours(prev => prev.filter(c => String(c.id) !== String(id)));
      const localList = readLocal().filter(c => String(c.id) !== String(id));
      writeLocal(localList);
      await fetchCours();
    } catch (e) {
      console.error(e);
      const status = e?.response?.status;
      if (status === 404) {
        // Élement inexistant côté serveur (probablement local-only) → nettoyer local quand même
        setCours(prev => prev.filter(c => String(c.id) !== String(id)));
        const localList = readLocal().filter(c => String(c.id) !== String(id));
        writeLocal(localList);
        return;
      }
      alert('Erreur lors de la suppression');
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
      {cours.length === 0 && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-6 p-4 bg-yellow-50 border border-yellow-200 rounded-lg text-center"
        >
          <div className="text-sm text-yellow-800">
            Aucun cours/atelier planifié pour l'instant. Utilisez "Ajouter" pour créer votre emploi du temps.
          </div>
        </motion.div>
      )}
      {/* Header */}
      <motion.div
        initial={{ y: -20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        className="mb-8"
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-gradient-to-r from-purple-500 to-blue-500 rounded-xl">
              <FiCalendar className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-gray-800">Emploi du Temps</h1>
              <p className="text-gray-500">Gérez votre planning hebdomadaire</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => setViewMode(viewMode === 'week' ? 'day' : 'week')}
              className="px-4 py-2 bg-white border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors flex items-center gap-2"
            >
              <FiFilter className="w-4 h-4" />
              {viewMode === 'week' ? 'Vue Journalière' : 'Vue Hebdomadaire'}
            </motion.button>
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={fetchCours}
              className="px-4 py-2 bg-white border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors flex items-center gap-2"
            >
              <FiRefreshCw className="w-4 h-4" />
              Rafraîchir
            </motion.button>
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => navigate('/formateur/cours?action=create')}
              className="px-4 py-2 bg-gradient-to-r from-purple-500 to-blue-500 text-white rounded-lg hover:from-purple-600 hover:to-blue-600 transition-all flex items-center gap-2"
            >
              <FiPlus className="w-4 h-4" />
              Ajouter un cours
            </motion.button>
          </div>
        </div>
      </motion.div>

      {/* Navigation de semaine */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white rounded-2xl shadow-lg border border-gray-100 p-6 mb-6"
      >
        <div className="flex items-center justify-between">
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => navigateWeek('prev')}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <FiChevronLeft className="w-5 h-5" />
          </motion.button>

          <div className="text-center">
            <h2 className="text-xl font-bold text-gray-800">
              {viewMode === 'week' ? 'Semaine du' : 'Jour du'} {weekDates[0].toLocaleDateString('fr-FR', { 
                day: 'numeric', 
                month: 'long',
                year: 'numeric'
              })}
              {viewMode === 'week' && ` au ${weekDates[6].toLocaleDateString('fr-FR', { 
                day: 'numeric',
                month: 'long'
              })}`}
            </h2>
          </div>

          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => navigateWeek('next')}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <FiChevronRight className="w-5 h-5" />
          </motion.button>
        </div>
      </motion.div>

      {/* Grille de l'emploi du temps */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden"
      >
        <div className="overflow-x-auto">
          <div className="min-w-[800px]">
            {/* En-têtes des jours */}
            <div className="grid grid-cols-8 bg-gray-50 border-b border-gray-200">
              <div className="p-4 text-center text-sm font-semibold text-gray-600">Heure</div>
              {viewMode === 'week' ? (
                weekDates.map((date, index) => (
                  <div key={index} className="p-4 text-center border-l border-gray-200">
                    <div className="text-sm font-semibold text-gray-800">{jours[index]}</div>
                    <div className="text-xs text-gray-500">{date.getDate()}</div>
                    {date.toDateString() === new Date().toDateString() && (
                      <div className="mt-1 inline-block px-2 py-1 bg-purple-100 text-purple-600 text-xs rounded-full">
                        Aujourd'hui
                      </div>
                    )}
                  </div>
                ))
              ) : (
                <div className="p-4 text-center border-l border-gray-200">
                  <div className="text-sm font-semibold text-gray-800">
                    {jours[selectedDate.getDay() === 0 ? 6 : selectedDate.getDay() - 1]}
                  </div>
                  <div className="text-xs text-gray-500">{selectedDate.getDate()}</div>
                  {selectedDate.toDateString() === new Date().toDateString() && (
                    <div className="mt-1 inline-block px-2 py-1 bg-purple-100 text-purple-600 text-xs rounded-full">
                      Aujourd'hui
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Grille des heures */}
            <div className="divide-y divide-gray-200">
              {heures.map((heure, heureIndex) => (
                <div key={heureIndex} className="grid grid-cols-8">
                  <div className="p-4 text-center text-sm text-gray-600 border-r border-gray-200">
                    {heure}
                  </div>
                  {(viewMode === 'week' ? weekDates : [selectedDate]).map((date, dayIndex) => {
                    const coursList = getCoursForTimeSlot(date, heure);
                    return (
                      <div key={dayIndex} className="p-2 border-l border-t border-gray-200 min-h-[80px]">
                        <AnimatePresence>
                          {coursList.map((cours) => (
                            <motion.div
                              key={cours.id}
                              initial={{ opacity: 0, scale: 0.8 }}
                              animate={{ opacity: 1, scale: 1 }}
                              exit={{ opacity: 0, scale: 0.8 }}
                              whileHover={{ scale: 1.02 }}
                              onClick={() => navigate(`/formateur/cours/${cours.id}`)}
                              className={`${getCoursTypeColor(cours.type)} p-2 rounded-lg cursor-pointer shadow-sm mb-1`}
                            >
                          <div className="flex items-start justify-between gap-2">
                            <div className="flex-1">
                              <div className="text-xs font-semibold truncate">{cours.titre}</div>
                              <div className="text-xs opacity-90 truncate">{cours.salle}</div>
                            </div>
                            <span className="text-xs opacity-75">{cours.heureDebut}-{cours.heureFin}</span>
                          </div>
                          <div className="flex items-center justify-between mt-1">
                            <span className="text-xs opacity-75">{cours.inscrits}/{cours.capacite}</span>
                            <button
                              onClick={(e) => { e.stopPropagation(); deleteAtelier(cours.id); }}
                              className="text-xs px-2 py-0.5 bg-white/20 hover:bg-white/30 rounded flex items-center gap-1"
                            >
                              <FiTrash2 className="w-3 h-3" />
                              Supprimer
                            </button>
                          </div>
                            </motion.div>
                          ))}
                        </AnimatePresence>
                    <button
                      onClick={() => openAddForCell(date, heure)}
                      className="mt-1 w-full text-xs px-2 py-1 border border-dashed border-gray-300 rounded hover:bg-gray-50"
                    >
                      Ajouter
                    </button>
                      </div>
                    );
                  })}
                </div>
              ))}
            </div>
          </div>
        </div>
      </motion.div>

      {/* Légende */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="mt-6 bg-white rounded-2xl shadow-lg border border-gray-100 p-6"
      >
        <h3 className="text-lg font-semibold text-gray-800 mb-4">Légende</h3>
        <div className="flex flex-wrap gap-4">
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 bg-gradient-to-r from-blue-500 to-blue-600 rounded"></div>
            <span className="text-sm text-gray-600">Cours Pratique</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 bg-gradient-to-r from-green-500 to-green-600 rounded"></div>
            <span className="text-sm text-gray-600">Cours Théorique</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 bg-gradient-to-r from-purple-500 to-purple-600 rounded"></div>
            <span className="text-sm text-gray-600">Cours Hybride</span>
          </div>
        </div>
      </motion.div>

      {/* Statistiques rapides */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        className="mt-6 grid grid-cols-1 md:grid-cols-4 gap-6"
      >
        <motion.div
          whileHover={{ scale: 1.02 }}
          className="bg-white rounded-2xl shadow-lg border border-gray-100 p-6"
        >
          <div className="flex items-center gap-4">
            <div className="p-3 bg-blue-100 rounded-xl">
              <FiCalendar className="w-6 h-6 text-blue-600" />
            </div>
            <div>
              <p className="text-sm text-gray-600">Cours cette semaine</p>
              <p className="text-2xl font-bold text-gray-800">
                {cours.filter(c => {
                  const coursDate = new Date(c.date);
                  const weekStart = weekDates[0];
                  const weekEnd = weekDates[6];
                  return coursDate >= weekStart && coursDate <= weekEnd;
                }).length}
              </p>
            </div>
          </div>
        </motion.div>

        <motion.div
          whileHover={{ scale: 1.02 }}
          className="bg-white rounded-2xl shadow-lg border border-gray-100 p-6"
        >
          <div className="flex items-center gap-4">
            <div className="p-3 bg-green-100 rounded-xl">
              <FiClock className="w-6 h-6 text-green-600" />
            </div>
            <div>
              <p className="text-sm text-gray-600">Heures cette semaine</p>
              <p className="text-2xl font-bold text-gray-800">
                {cours.filter(c => {
                  const coursDate = new Date(c.date);
                  const weekStart = weekDates[0];
                  const weekEnd = weekDates[6];
                  return coursDate >= weekStart && coursDate <= weekEnd;
                }).reduce((total, c) => {
                  const debut = parseInt((c.heureDebut || '').split(':')[0], 10);
                  const fin = parseInt((c.heureFin || '').split(':')[0], 10);
                  const delta = Number.isNaN(debut) || Number.isNaN(fin) ? 0 : Math.max(0, fin - debut);
                  return total + delta;
                }, 0)}h
              </p>
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
              <p className="text-sm text-gray-600">Étudiants totaux</p>
              <p className="text-2xl font-bold text-gray-800">
                {cours.reduce((total, c) => total + (Number(c.inscrits) || 0), 0)}
              </p>
            </div>
          </div>
        </motion.div>

        <motion.div
          whileHover={{ scale: 1.02 }}
          className="bg-white rounded-2xl shadow-lg border border-gray-100 p-6"
        >
          <div className="flex items-center gap-4">
            <div className="p-3 bg-orange-100 rounded-xl">
              <FiMapPin className="w-6 h-6 text-orange-600" />
            </div>
            <div>
              <p className="text-sm text-gray-600">Salles utilisées</p>
              <p className="text-2xl font-bold text-gray-800">
                {[...new Set(cours.map(c => c.salle).filter(Boolean))].length}
              </p>
            </div>
          </div>
        </motion.div>
      </motion.div>
      {showAdd && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30">
          <div className="bg-white rounded-xl shadow-lg border border-gray-100 w-full max-w-md p-6">
            <div className="text-lg font-semibold text-gray-800 mb-2">Ajouter un cours</div>
            <div className="text-sm text-gray-500 mb-4">
              {addTarget.date && addTarget.date.toLocaleDateString('fr-FR')} à {addTarget.heure}
            </div>
            {!chooseType ? (
              <div className="grid grid-cols-2 gap-3">
                <button
                  onClick={() => selectType('pratique')}
                  className="p-4 rounded-lg border border-gray-200 hover:bg-blue-50 text-blue-700"
                >
                  Pratique
                </button>
                <button
                  onClick={() => selectType('theorique')}
                  className="p-4 rounded-lg border border-gray-200 hover:bg-green-50 text-green-700"
                >
                  Théorique
                </button>
              </div>
            ) : (
              <>
                <div className="text-sm font-medium text-gray-700 mb-2">
                  {chooseType === 'pratique' ? 'Cours pratique' : 'Cours théorique'}
                </div>
                <div className="grid grid-cols-1 gap-3">
                  <div>
                    <div className="text-xs text-gray-500 mb-1">Titre du cours</div>
                    <select
                      value={selectedTitle}
                      onChange={(e) => setSelectedTitle(e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded bg-white"
                      disabled={loadingOptions}
                    >
                      <option value="">{loadingOptions ? 'Chargement...' : 'Sélectionner un titre'}</option>
                      {titlesOptions.map((t, idx) => (
                        <option key={idx} value={t}>{t}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <div className="text-xs text-gray-500 mb-1">Salle</div>
                    <select
                      value={selectedSalle}
                      onChange={(e) => setSelectedSalle(e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded bg-white"
                      disabled={loadingOptions}
                    >
                      <option value="">{loadingOptions ? 'Chargement...' : 'Sélectionner une salle'}</option>
                      {sallesOptions.map((s, idx) => (
                        <option key={idx} value={s}>{s}</option>
                      ))}
                    </select>
                  </div>
                </div>
                <div className="flex items-center justify-end gap-2 mt-4">
                  <button
                    onClick={() => setShowAdd(false)}
                    className="px-3 py-2 rounded border border-gray-200 hover:bg-gray-50"
                  >
                    Annuler
                  </button>
                  <button
                    disabled={!selectedTitle || !selectedSalle || saving}
                    onClick={addAtelier}
                    className="px-3 py-2 rounded bg-gradient-to-r from-purple-500 to-blue-500 text-white disabled:opacity-60"
                  >
                    Ajouter
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
