import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import API from '../../services/api';
import { useAuth } from '../../contexts/AuthContext';
import {
  FiCalendar,
  FiClock,
  FiMapPin,
  FiUser,
  FiFilter,
  FiChevronLeft,
  FiChevronRight,
  FiPlus,
  FiTrash2,
  FiRefreshCw
} from 'react-icons/fi';
import { FaChalkboardTeacher } from 'react-icons/fa';

export default function EmploiDuTempsApprenant() {
  const { user } = useAuth();
  const [cours, setCours] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentWeek, setCurrentWeek] = useState(new Date());
  const [viewMode, setViewMode] = useState('week'); // week, month, day
  const [showAdd, setShowAdd] = useState(false);
  const [addTarget, setAddTarget] = useState({ date: null, heure: '' });
  const [chooseType, setChooseType] = useState('');
  const [titlesOptions, setTitlesOptions] = useState([]);
  const [sallesOptions, setSallesOptions] = useState([]);
  const [selectedTitle, setSelectedTitle] = useState('');
  const [selectedSalle, setSelectedSalle] = useState('');
  const [loadingOptions, setLoadingOptions] = useState(false);

  const storageKey = 'cfp_timetable_apprenant_local';
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

  const hhmm = (v) => (v ? String(v).substring(0, 5) : '');
  const ymd = (d) => {
    if (!d) return '';
    if (typeof d === 'string') {
      if (/^\d{4}-\d{2}-\d{2}$/.test(d)) return d;
      const dt = new Date(d);
      const y = dt.getFullYear();
      const m = String(dt.getMonth() + 1).padStart(2, '0');
      const day = String(dt.getDate()).padStart(2, '0');
      return `${y}-${m}-${day}`;
    }
    const y = d.getFullYear();
    const m = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    return `${y}-${m}-${day}`;
  };
  const buildKey = (c) => [
    (c.titre || '').trim().toLowerCase(),
    ymd(c.date),
    hhmm(c.heureDebut),
    hhmm(c.heureFin),
    (c.salle || '').trim().toLowerCase()
  ].join('|');
  const dedup = (arr) => {
    const seen = new Set();
    const out = [];
    for (const c of arr || []) {
      const k = buildKey(c);
      if (seen.has(k)) continue;
      seen.add(k);
      out.push(c);
    }
    return out;
  };

  useEffect(() => {
    if (!user || user.role !== 'apprenant') {
      return;
    }
    const cached = readLocal();
    if (cached && cached.length) {
      setCours(dedup(cached));
      setLoading(false);
    }
    fetchEmploiDuTemps();
  }, [user, currentWeek]);

  const fetchEmploiDuTemps = async () => {
    try {
      const response = await API.get(`/cours/apprenant/${user.id}/emploi-du-temps`);
      const data = response.data || [];
      setCours(dedup(mergeWithLocal(data)));
    } catch (error) {
      
    } finally {
      setLoading(false);
    }
  };

  const getWeekDays = () => {
    const startOfWeek = new Date(currentWeek);
    const day = startOfWeek.getDay();
    const diff = startOfWeek.getDate() - day + (day === 0 ? -6 : 1);
    startOfWeek.setDate(diff);
    
    const days = [];
    for (let i = 0; i < 7; i++) {
      const day = new Date(startOfWeek);
      day.setDate(startOfWeek.getDate() + i);
      days.push(day);
    }
    return days;
  };

  const getCoursForDay = (date) => {
    const dateStr = ymd(date);
    return cours.filter(cour => ymd(cour.date) === dateStr);
  };

  const navigateWeek = (direction) => {
    const newWeek = new Date(currentWeek);
    newWeek.setDate(newWeek.getDate() + (direction === 'next' ? 7 : -7));
    setCurrentWeek(newWeek);
  };

  const getTimeSlots = () => {
    const slots = [];
    for (let hour = 7; hour <= 19; hour++) {
      slots.push(`${hour.toString().padStart(2, '0')}:00`);
    }
    return slots;
  };

  const openAddForCell = (date, heure) => {
    setAddTarget({ date, heure });
    setChooseType('');
    setTitlesOptions([]);
    setSallesOptions([]);
    setSelectedTitle('');
    setSelectedSalle('');
    setLoadingOptions(false);
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
        const payload = resAt.ok ? await resAt.json() : [];
        allAteliers = Array.isArray(payload) ? payload : (payload?.data || []);
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
        titles = Array.from(new Set(src.filter(a => (a?.type === 'pratique' || a?.type === 'tp')).map(a => a?.titre).filter(Boolean)));
      }
      const salles = Array.from(new Set((allAteliers.length ? allAteliers : cours).map(a => a?.salle).filter(Boolean)));
      setTitlesOptions(titles.sort((a,b)=>a.localeCompare(b)));
      setSallesOptions(salles.sort((a,b)=>a.localeCompare(b)));
    } finally {
      setLoadingOptions(false);
    }
  };

  const addLocalCour = () => {
    if (!addTarget.date || !addTarget.heure || !chooseType || !selectedTitle || !selectedSalle) return;
    const d = addTarget.date;
    const yyyy = d.getFullYear();
    const mm = String(d.getMonth() + 1).padStart(2, '0');
    const dd = String(d.getDate()).padStart(2, '0');
    const dateStr = `${yyyy}-${mm}-${dd}`;
    const startHour = parseInt(addTarget.heure.split(':')[0], 10);
    const endHour = Math.min(startHour + 1, 23);
    const heureFin = `${String(endHour).padStart(2, '0')}:00`;
    const newItem = {
      id: `local-${Date.now()}`,
      titre: selectedTitle,
      date: dateStr,
      heureDebut: addTarget.heure,
      heureFin,
      salle: selectedSalle,
      type: chooseType === 'pratique' ? 'tp' : 'theorique',
      formateur: null
    };
    const k = buildKey(newItem);
    const existsNow = new Set((cours || []).map(c => buildKey(c)));
    if (existsNow.has(k)) {
      setShowAdd(false);
      return;
    }
    setCours(prev => dedup([newItem, ...prev]));
    const localList = readLocal();
    writeLocal(dedup([newItem, ...(localList || [])]));
    setShowAdd(false);
  };

  const deleteLocalCour = (id) => {
    setCours(prev => prev.filter(c => String(c.id) !== String(id)));
    const localList = readLocal().filter(c => String(c.id) !== String(id));
    writeLocal(localList);
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

  const weekDays = getWeekDays();
  const timeSlots = getTimeSlots();

  return (
    <>
      <div className="flex items-center justify-between mb-4">
        <h1 className="text-xl font-bold text-gray-800">Emploi du temps</h1>
        <button
          onClick={fetchEmploiDuTemps}
          className="px-3 py-1.5 bg-white border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors flex items-center gap-2 text-sm"
        >
          <FiRefreshCw className="w-4 h-4" />
          Actualiser
        </button>
      </div>
      {/* Légende */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white rounded-xl shadow-sm border border-blue-100 p-4 mb-6"
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-6">
            <div className="flex items-center space-x-2">
              <div className="w-4 h-4 bg-blue-500 rounded"></div>
              <span className="text-sm text-gray-600">Cours théorique</span>
            </div>
            <div className="flex items-center space-x-2">
              <div className="w-4 h-4 bg-green-500 rounded"></div>
              <span className="text-sm text-gray-600">Travaux pratiques</span>
            </div>
            <div className="flex items-center space-x-2">
              <div className="w-4 h-4 bg-orange-500 rounded"></div>
              <span className="text-sm text-gray-600">Examen</span>
            </div>
          </div>
          <div className="text-sm text-gray-500">
            {(() => {
              const keys = new Set(getWeekDays().map(d => ymd(d)));
              const names = new Set(
                (cours || [])
                  .filter(c => keys.has(ymd(c.date)))
                  .map(c => (c.titre || '').trim().toLowerCase())
                  .filter(Boolean)
              );
              return names.size;
            })()} cours cette semaine
          </div>
        </div>
      </motion.div>

      {/* Grille de l'emploi du temps */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white rounded-xl shadow-sm border border-blue-100 overflow-hidden"
      >
        <div className="overflow-x-auto">
          <div className="min-w-[800px]">
            {/* En-têtes des jours */}
            <div className="grid grid-cols-8 border-b border-gray-200">
              <div className="p-4 text-sm font-medium text-gray-700 bg-gray-50">Heure</div>
              {weekDays.map((day, index) => (
                <div key={index} className="p-4 text-center border-l border-gray-200">
                  <div className="text-sm font-medium text-gray-900">
                    {day.toLocaleDateString('fr-FR', { weekday: 'long' })}
                  </div>
                  <div className="text-xs text-gray-500">
                    {day.toLocaleDateString('fr-FR', { day: 'numeric', month: 'short' })}
                  </div>
                </div>
              ))}
            </div>

            {/* Lignes de temps */}
            {timeSlots.map((time, timeIndex) => (
              <div key={timeIndex} className="grid grid-cols-8 border-b border-gray-100">
                <div className="p-4 text-sm text-gray-600 bg-gray-50 border-r border-gray-200">
                  {time}
                </div>
                {weekDays.map((day, dayIndex) => {
                  const dayCours = getCoursForDay(day);
                  const currentCours = dayCours.find(cour => {
                    const courTime = cour.heureDebut?.substring(0, 5);
                    return courTime === time;
                  });

                  return (
                    <div key={dayIndex} className="p-2 border-l border-gray-200 min-h-[60px] relative group">
                      {currentCours ? (
                        <motion.div
                          initial={{ opacity: 0, scale: 0.9 }}
                          animate={{ opacity: 1, scale: 1 }}
                          className={`p-2 rounded-lg text-xs cursor-pointer hover:shadow-md transition-shadow ${
                            currentCours.type === 'tp' ? 'bg-green-100 text-green-800 border border-green-200' :
                            currentCours.type === 'examen' ? 'bg-orange-100 text-orange-800 border border-orange-200' :
                            'bg-blue-100 text-blue-800 border border-blue-200'
                          }`}
                        >
                          <div className="font-medium truncate">{currentCours.titre}</div>
                          <div className="flex items-center space-x-1 mt-1">
                            <FiMapPin className="w-3 h-3" />
                            <span className="truncate">{currentCours.salle}</span>
                          </div>
                          <div className="flex items-center space-x-1 mt-1">
                            <FiUser className="w-3 h-3" />
                            <span className="truncate">{currentCours.formateur?.nom}</span>
                          </div>
                          <div className="text-xs mt-1">
                            {currentCours.heureDebut?.substring(0, 5)} - {currentCours.heureFin?.substring(0, 5)}
                          </div>
                          <button
                            onClick={() => deleteLocalCour(currentCours.id)}
                            className="absolute top-1 right-1 p-1 rounded bg-white/80 border border-gray-200 opacity-0 group-hover:opacity-100 transition"
                            title="Supprimer"
                          >
                            <FiTrash2 className="w-3 h-3 text-red-600" />
                          </button>
                        </motion.div>
                      ) : (
                        <button
                          onClick={() => openAddForCell(day, time)}
                          className="w-full h-full min-h-[44px] flex items-center justify-center text-xs text-blue-600 border border-dashed border-blue-200 rounded hover:bg-blue-50"
                          title="Ajouter"
                        >
                          <FiPlus className="w-4 h-4 mr-1" />
                          Ajouter
                        </button>
                      )}
                    </div>
                  );
                })}
              </div>
            ))}
          </div>
        </div>
      </motion.div>

      {/* Liste des cours de la semaine */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="mt-8"
      >
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Cours de la semaine</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {cours.map((cour) => (
            <motion.div
              key={cour.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-white rounded-lg shadow-sm border border-blue-100 p-4 hover:shadow-md transition-shadow"
            >
              <div className="flex items-start justify-between mb-3">
                <div className="flex-1">
                  <h3 className="font-medium text-gray-900">{cour.titre}</h3>
                  <p className="text-sm text-gray-600">{cour.formation?.titre}</p>
                </div>
                <div className={`px-2 py-1 rounded-full text-xs font-medium ${
                  cour.type === 'tp' ? 'bg-green-100 text-green-800' :
                  cour.type === 'examen' ? 'bg-orange-100 text-orange-800' :
                  'bg-blue-100 text-blue-800'
                }`}>
                  {cour.type}
                </div>
              </div>
              <div className="space-y-2 text-sm text-gray-600">
                <div className="flex items-center space-x-2">
                  <FiCalendar className="w-4 h-4" />
                  <span>{new Date(cour.date).toLocaleDateString('fr-FR')}</span>
                </div>
                <div className="flex items-center space-x-2">
                  <FiClock className="w-4 h-4" />
                  <span>{cour.heureDebut?.substring(0, 5)} - {cour.heureFin?.substring(0, 5)}</span>
                </div>
                <div className="flex items-center space-x-2">
                  <FiMapPin className="w-4 h-4" />
                  <span>{cour.salle}</span>
                </div>
                <div className="flex items-center space-x-2">
                  <FaChalkboardTeacher className="w-4 h-4" />
                  <span>{cour.formateur?.nom} {cour.formateur?.prenom}</span>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
        {cours.length === 0 && (
          <div className="text-center py-12">
            <FiCalendar className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">Aucun cours cette semaine</h3>
            <p className="text-gray-500">Profitez de votre temps libre pour réviser !</p>
          </div>
        )}
      </motion.div>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: showAdd ? 1 : 0 }}
        className={`fixed inset-0 ${showAdd ? 'pointer-events-auto' : 'pointer-events-none'} z-50`}
      >
        <div className="absolute inset-0 bg-black/30" onClick={() => setShowAdd(false)} />
        <div className="absolute inset-0 flex items-center justify-center p-4">
          <div className="w-full max-w-md bg-white rounded-xl shadow-lg border border-gray-100 p-6 relative z-50">
            <h3 className="text-lg font-semibold text-gray-800 mb-4">Ajouter un créneau</h3>
            {!chooseType ? (
              <div className="grid grid-cols-2 gap-3">
                <button
                  onClick={() => selectType('theorique')}
                  className="p-4 rounded-lg border border-gray-200 hover:bg-gray-50"
                  disabled={loadingOptions}
                >
                  Théorique
                </button>
                <button
                  onClick={() => selectType('pratique')}
                  className="p-4 rounded-lg border border-gray-200 hover:bg-gray-50"
                  disabled={loadingOptions}
                >
                  Pratique
                </button>
              </div>
            ) : (
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Titre</label>
                  {titlesOptions.length > 0 ? (
                    <select
                      value={selectedTitle}
                      onChange={e => setSelectedTitle(e.target.value)}
                      className="w-full border border-gray-300 rounded-lg p-2"
                    >
                      <option value="">Choisir</option>
                      {titlesOptions.map(t => (
                        <option key={t} value={t}>{t}</option>
                      ))}
                    </select>
                  ) : (
                    <input
                      type="text"
                      value={selectedTitle}
                      onChange={e => setSelectedTitle(e.target.value)}
                      placeholder="Saisir un titre"
                      className="w-full border border-gray-300 rounded-lg p-2"
                    />
                  )}
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Salle</label>
                  {sallesOptions.length > 0 ? (
                    <select
                      value={selectedSalle}
                      onChange={e => setSelectedSalle(e.target.value)}
                      className="w-full border border-gray-300 rounded-lg p-2"
                    >
                      <option value="">Choisir</option>
                      {sallesOptions.map(s => (
                        <option key={s} value={s}>{s}</option>
                      ))}
                    </select>
                  ) : (
                    <input
                      type="text"
                      value={selectedSalle}
                      onChange={e => setSelectedSalle(e.target.value)}
                      placeholder="Saisir une salle"
                      className="w-full border border-gray-300 rounded-lg p-2"
                    />
                  )}
                </div>
                <div className="flex justify-end gap-2">
                  <button
                    onClick={() => setShowAdd(false)}
                    className="px-4 py-2 border border-gray-200 rounded-lg"
                  >
                    Annuler
                  </button>
                  <button
                    onClick={addLocalCour}
                    className="px-4 py-2 bg-blue-600 text-white rounded-lg"
                    disabled={!selectedTitle || !selectedSalle}
                  >
                    Ajouter
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </motion.div>
    </>
  );
}
