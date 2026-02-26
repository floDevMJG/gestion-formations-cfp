import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import API from '../../services/api';
import { useAuth } from '../../contexts/AuthContext';
import { toast } from 'react-toastify';
import {
  FiTool,
  FiPlus,
  FiEdit,
  FiTrash2,
  FiX,
  FiCalendar,
  FiClock,
  FiMapPin,
  FiUsers,
  FiUser,
  FiSearch,
  FiFilter,
  FiChevronDown,
  FiChevronUp,
  FiBookOpen,
  FiLayers,
  FiZap
} from 'react-icons/fi';

/* ======================= ANIMATIONS ======================= */
const pageVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { 
    opacity: 1, 
    y: 0,
    transition: { duration: 0.6, ease: [0.22, 1, 0.36, 1] }
  }
};

const staggerContainer = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
      delayChildren: 0.2
    }
  }
};

const cardVariants = {
  hidden: { opacity: 0, y: 20, scale: 0.95 },
  visible: { 
    opacity: 1, 
    y: 0, 
    scale: 1,
    transition: { duration: 0.5, ease: [0.22, 1, 0.36, 1] }
  }
};

const modalVariants = {
  hidden: { opacity: 0, scale: 0.9 },
  visible: { 
    opacity: 1, 
    scale: 1,
    transition: { duration: 0.3, ease: [0.22, 1, 0.36, 1] }
  },
  exit: { 
    opacity: 0, 
    scale: 0.9,
    transition: { duration: 0.2 }
  }
};

/* ======================= LOADING SPINNER ======================= */
const LoadingSpinner = () => (
  <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 via-white to-blue-100">
    <div className="relative">
      <motion.div
        className="w-16 h-16 border-4 border-blue-200 border-t-blue-600 rounded-full"
        animate={{ rotate: 360 }}
        transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
      />
      <motion.div
        className="absolute inset-0 w-16 h-16 border-4 border-transparent border-b-blue-400 rounded-full"
        animate={{ rotate: -360 }}
        transition={{ duration: 1.5, repeat: Infinity, ease: "linear" }}
      />
    </div>
  </div>
);

/* ======================= STAT CARD ======================= */
const StatCard = ({ icon: Icon, label, value, color, gradient }) => (
  <motion.div
    variants={cardVariants}
    whileHover={{ y: -4, scale: 1.02 }}
    className="relative overflow-hidden rounded-2xl bg-white/80 backdrop-blur-xl border border-gray-200/50 shadow-lg shadow-gray-200/50 p-6 group"
  >
    <div className={`absolute inset-0 bg-gradient-to-br ${gradient} opacity-0 group-hover:opacity-5 transition-opacity duration-500`} />
    <div className="relative z-10">
      <div className={`inline-flex p-3 rounded-xl bg-gradient-to-br ${gradient} mb-4`}>
        <Icon className="w-6 h-6 text-white" />
      </div>
      <div className="space-y-1">
        <p className="text-sm font-medium text-gray-600">{label}</p>
        <p className="text-3xl font-bold bg-gradient-to-r from-gray-900 to-gray-700 bg-clip-text text-transparent">
          {value}
        </p>
      </div>
    </div>
    <div className="absolute -right-8 -bottom-8 w-32 h-32 bg-gradient-to-br from-gray-100 to-transparent rounded-full blur-2xl opacity-50" />
  </motion.div>
);

/* ======================= WORKSHOP CARD ======================= */
const WorkshopCard = ({ atelier, onEdit, onDelete, isFormateurView, index }) => {
  const getTypeColor = (type) => {
    const colors = {
      pratique: 'from-blue-500 to-blue-600',
      theorique: 'from-sky-500 to-cyan-500',
      hybride: 'from-indigo-500 to-blue-500'
    };
    return colors[type] || 'from-gray-500 to-slate-500';
  };

  const getStatutBadge = (statut) => {
    const styles = {
      actif: 'bg-green-100 text-green-700 border-green-200',
      annulé: 'bg-red-100 text-red-700 border-red-200',
      terminé: 'bg-gray-100 text-gray-700 border-gray-200'
    };
    return styles[statut] || 'bg-gray-100 text-gray-700';
  };

  const occupationPercentage = atelier.capacite > 0 
    ? (atelier.inscrits / atelier.capacite) * 100 
    : 0;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.05 }}
      whileHover={{ y: -4 }}
      className="bg-white/80 backdrop-blur-xl rounded-2xl border border-gray-200/50 shadow-lg shadow-gray-200/50 overflow-hidden group hover:shadow-xl hover:shadow-gray-300/50 transition-all duration-300"
    >
      {/* Header avec gradient */}
      <div className={`h-2 bg-gradient-to-r ${getTypeColor(atelier.type)}`} />
      
      <div className="p-6">
        {/* Titre et badges */}
        <div className="flex items-start justify-between mb-4">
          <div className="flex-1">
            <h3 className="text-xl font-bold text-gray-900 mb-2 group-hover:text-blue-600 transition-colors">
              {atelier.titre}
            </h3>
            <div className="flex flex-wrap gap-2">
              <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold bg-gradient-to-r ${getTypeColor(atelier.type)} text-white shadow-sm`}>
                {atelier.type}
              </span>
              <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium border ${getStatutBadge(atelier.statut)}`}>
                <span className="w-1.5 h-1.5 rounded-full bg-current" />
                {atelier.statut}
              </span>
            </div>
          </div>
        </div>

        {/* Description */}
        {atelier.description && (
          <p className="text-gray-600 text-sm mb-4 line-clamp-2">
            {atelier.description}
          </p>
        )}

        {/* Informations */}
        <div className="space-y-3 mb-4">
          <div className="flex items-center gap-3 text-sm text-gray-700">
            <div className="flex items-center gap-2 flex-1">
              <div className="p-2 bg-blue-100 rounded-lg">
                <FiCalendar className="w-4 h-4 text-blue-600" />
              </div>
              <span className="font-medium">
                {new Date(atelier.date).toLocaleDateString('fr-FR', { 
                  weekday: 'short', 
                  day: 'numeric', 
                  month: 'long', 
                  year: 'numeric' 
                })}
              </span>
            </div>
          </div>

          <div className="flex items-center gap-3 text-sm text-gray-700">
            <div className="flex items-center gap-2 flex-1">
              <div className="p-2 bg-indigo-100 rounded-lg">
                <FiClock className="w-4 h-4 text-indigo-600" />
              </div>
              <span className="font-medium">
                {atelier.heureDebut} - {atelier.heureFin}
              </span>
            </div>
          </div>

          <div className="flex items-center gap-3 text-sm text-gray-700">
            <div className="flex items-center gap-2 flex-1">
              <div className="p-2 bg-blue-100 rounded-lg">
                <FiMapPin className="w-4 h-4 text-blue-600" />
              </div>
              <span className="font-medium">{atelier.salle}</span>
            </div>
          </div>

          {!isFormateurView && atelier.formateur && (
            <div className="flex items-center gap-3 text-sm text-gray-700">
              <div className="flex items-center gap-2 flex-1">
                <div className="p-2 bg-green-100 rounded-lg">
                  <FiUser className="w-4 h-4 text-green-600" />
                </div>
                <span className="font-medium">{atelier.formateur}</span>
              </div>
            </div>
          )}
        </div>

        {/* Barre de progression des inscriptions */}
        <div className="mb-4">
          <div className="flex items-center justify-between text-sm mb-2">
            <span className="font-semibold text-gray-700">Inscriptions</span>
            <span className="text-gray-600">
              <span className="font-bold text-blue-600">{atelier.inscrits}</span>
              <span className="text-gray-400"> / </span>
              <span className="font-semibold">{atelier.capacite}</span>
            </span>
          </div>
          <div className="w-full h-2 bg-gray-200 rounded-full overflow-hidden">
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: `${occupationPercentage}%` }}
              transition={{ duration: 1, delay: 0.3 }}
              className={`h-full rounded-full ${
                occupationPercentage >= 90 
                  ? 'bg-gradient-to-r from-red-500 to-rose-500' 
                  : occupationPercentage >= 70 
                  ? 'bg-gradient-to-r from-blue-400 to-blue-500' 
                  : 'bg-gradient-to-r from-blue-500 to-blue-600'
              }`}
            />
          </div>
        </div>

        {/* Actions */}
        <div className="flex gap-2 pt-4 border-t border-gray-200">
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => onEdit(atelier)}
            className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-xl font-semibold shadow-lg shadow-blue-500/30 hover:shadow-xl hover:shadow-blue-500/40 transition-all"
          >
            <FiEdit className="w-4 h-4" />
            Modifier
          </motion.button>
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => onDelete(atelier.id)}
            className="flex items-center justify-center gap-2 px-4 py-2.5 bg-red-100 text-red-600 rounded-xl font-semibold hover:bg-red-200 transition-all"
          >
            <FiTrash2 className="w-4 h-4" />
          </motion.button>
        </div>
      </div>
    </motion.div>
  );
};

/* ======================= MODAL COMPONENT ======================= */
const AddEditAtelierModal = ({
  showModal,
  onClose,
  onSave,
  initialData,
  isFormateurView
}) => {
  const { user } = useAuth();
  const [formData, setFormData] = useState(initialData || {
    titre: '',
    description: '',
    date: '',
    heureDebut: '',
    heureFin: '',
    salle: '',
    capacite: 20,
    type: 'pratique',
    statut: 'actif',
    formateur_id: user?.role === 'formateur' ? user.id : null
  });
  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState({});
  const [formateurs, setFormateurs] = useState([]);

  useEffect(() => {
    if (user?.role === 'admin') {
      fetchFormateurs();
    }
    if (initialData) {
      setFormData({
        ...initialData,
        date: initialData.date ? new Date(initialData.date).toISOString().split('T')[0] : ''
      });
    } else {
      setFormData({
        titre: '',
        description: '',
        date: '',
        heureDebut: '',
        heureFin: '',
        salle: '',
        capacite: 20,
        type: 'pratique',
        statut: 'actif',
        formateur_id: user?.role === 'formateur' ? user.id : null
      });
    }
  }, [initialData, user]);

  const fetchFormateurs = async () => {
    try {
      const response = await API.get('/admin/users?role=formateur');
      setFormateurs(response.data);
    } catch (error) {
      console.error('Erreur lors du chargement des formateurs:', error);
      toast.error('Erreur lors du chargement des formateurs.');
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    if (errors[name]) setErrors(prev => ({ ...prev, [name]: undefined }));
  };

  const validateForm = () => {
    const newErrors = {};
    if (!formData.titre.trim()) newErrors.titre = 'Le titre est requis.';
    if (!formData.date) newErrors.date = 'La date est requise.';
    if (!formData.heureDebut) newErrors.heureDebut = 'L\'heure de début est requise.';
    if (!formData.heureFin) newErrors.heureFin = 'L\'heure de fin est requise.';
    if (!formData.salle.trim()) newErrors.salle = 'La salle est requise.';
    if (formData.capacite < 0) newErrors.capacite = 'La capacité ne peut pas être négative.';
    // Si l'utilisateur est admin, forcer la sélection d'un formateur pour éviter une erreur d'insertion
    if (user?.role === 'admin' && !isFormateurView && !formData.formateur_id) {
      newErrors.formateur_id = 'Le formateur est requis.';
    }
    
    if (formData.heureDebut && formData.heureFin) {
      const start = new Date(`2000-01-01T${formData.heureDebut}`);
      const end = new Date(`2000-01-01T${formData.heureFin}`);
      if (start >= end) {
        newErrors.heureFin = 'L\'heure de fin doit être après l\'heure de début.';
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;

    setIsLoading(true);
    try {
      await onSave(formData);
      onClose();
    } catch (err) {
      console.error('Erreur lors de la sauvegarde de l\'atelier:', err);
      toast.error(err.response?.data?.message || 'Erreur lors de la sauvegarde.');
    } finally {
      setIsLoading(false);
    }
  };

  if (!showModal) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4"
        onClick={onClose}
      >
        <motion.div
          variants={modalVariants}
          initial="hidden"
          animate="visible"
          exit="exit"
          onClick={(e) => e.stopPropagation()}
          className="bg-white rounded-3xl shadow-2xl max-w-3xl w-full max-h-[90vh] overflow-y-auto"
        >
          {/* Header */}
          <div className="sticky top-0 bg-gradient-to-r from-blue-600 to-indigo-600 px-8 py-6 rounded-t-3xl z-10">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="p-3 bg-white/20 rounded-xl backdrop-blur-sm">
                  <FiTool className="w-6 h-6 text-white" />
                </div>
                <h2 className="text-2xl font-bold text-white">
                  {initialData ? 'Modifier l\'atelier' : 'Nouvel atelier'}
                </h2>
              </div>
              <motion.button
                whileHover={{ scale: 1.1, rotate: 90 }}
                whileTap={{ scale: 0.9 }}
                onClick={onClose}
                className="p-2 hover:bg-white/20 rounded-full transition-colors"
              >
                <FiX className="w-6 h-6 text-white" />
              </motion.button>
            </div>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="p-8 space-y-6">
            {/* Titre */}
            <div>
              <label htmlFor="titre" className="block text-sm font-semibold text-gray-700 mb-2">
                Titre <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <FiBookOpen className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type="text"
                  id="titre"
                  name="titre"
                  value={formData.titre}
                  onChange={handleChange}
                  required
                  className={`w-full pl-12 pr-4 py-3 bg-gray-50 border rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all ${
                    errors.titre ? 'border-red-500' : 'border-gray-200'
                  }`}
                  placeholder="Ex: Atelier pratique de soudure"
                />
              </div>
              {errors.titre && <p className="text-red-600 text-sm mt-1">{errors.titre}</p>}
            </div>

            {/* Description */}
            <div>
              <label htmlFor="description" className="block text-sm font-semibold text-gray-700 mb-2">
                Description
              </label>
              <textarea
                id="description"
                name="description"
                value={formData.description}
                onChange={handleChange}
                rows="3"
                className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all resize-none"
                placeholder="Décrivez les objectifs et le contenu de l'atelier..."
              />
            </div>

            {/* Date et Salle */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label htmlFor="date" className="block text-sm font-semibold text-gray-700 mb-2">
                  Date <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <FiCalendar className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <input
                    type="date"
                    id="date"
                    name="date"
                    value={formData.date}
                    onChange={handleChange}
                    required
                    className={`w-full pl-12 pr-4 py-3 bg-gray-50 border rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all ${
                      errors.date ? 'border-red-500' : 'border-gray-200'
                    }`}
                  />
                </div>
                {errors.date && <p className="text-red-600 text-sm mt-1">{errors.date}</p>}
              </div>

              <div>
                <label htmlFor="salle" className="block text-sm font-semibold text-gray-700 mb-2">
                  Salle <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <FiMapPin className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <input
                    type="text"
                    id="salle"
                    name="salle"
                    value={formData.salle}
                    onChange={handleChange}
                    required
                    className={`w-full pl-12 pr-4 py-3 bg-gray-50 border rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all ${
                      errors.salle ? 'border-red-500' : 'border-gray-200'
                    }`}
                    placeholder="Ex: Salle B01, Atelier Principal"
                  />
                </div>
                {errors.salle && <p className="text-red-600 text-sm mt-1">{errors.salle}</p>}
              </div>
            </div>

            {/* Heures */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label htmlFor="heureDebut" className="block text-sm font-semibold text-gray-700 mb-2">
                  Heure de début <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <FiClock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <input
                    type="time"
                    id="heureDebut"
                    name="heureDebut"
                    value={formData.heureDebut}
                    onChange={handleChange}
                    required
                    className={`w-full pl-12 pr-4 py-3 bg-gray-50 border rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all ${
                      errors.heureDebut ? 'border-red-500' : 'border-gray-200'
                    }`}
                  />
                </div>
                {errors.heureDebut && <p className="text-red-600 text-sm mt-1">{errors.heureDebut}</p>}
              </div>

              <div>
                <label htmlFor="heureFin" className="block text-sm font-semibold text-gray-700 mb-2">
                  Heure de fin <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <FiClock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <input
                    type="time"
                    id="heureFin"
                    name="heureFin"
                    value={formData.heureFin}
                    onChange={handleChange}
                    required
                    className={`w-full pl-12 pr-4 py-3 bg-gray-50 border rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all ${
                      errors.heureFin ? 'border-red-500' : 'border-gray-200'
                    }`}
                  />
                </div>
                {errors.heureFin && <p className="text-red-600 text-sm mt-1">{errors.heureFin}</p>}
              </div>
            </div>

            {/* Type, Statut et Capacité */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div>
                <label htmlFor="type" className="block text-sm font-semibold text-gray-700 mb-2">
                  Type
                </label>
                <div className="relative">
                  <FiLayers className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <select
                    id="type"
                    name="type"
                    value={formData.type}
                    onChange={handleChange}
                    className="w-full pl-12 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all appearance-none"
                  >
                    <option value="pratique">Pratique</option>
                    <option value="theorique">Théorique</option>
                    <option value="hybride">Hybride</option>
                  </select>
                </div>
              </div>

              <div>
                <label htmlFor="statut" className="block text-sm font-semibold text-gray-700 mb-2">
                  Statut
                </label>
                <div className="relative">
                  <FiZap className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <select
                    id="statut"
                    name="statut"
                    value={formData.statut}
                    onChange={handleChange}
                    className="w-full pl-12 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all appearance-none"
                  >
                    <option value="actif">Actif</option>
                    <option value="annulé">Annulé</option>
                    <option value="terminé">Terminé</option>
                  </select>
                </div>
              </div>

              <div>
                <label htmlFor="capacite" className="block text-sm font-semibold text-gray-700 mb-2">
                  Capacité
                </label>
                <div className="relative">
                  <FiUsers className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <input
                    type="number"
                    id="capacite"
                    name="capacite"
                    value={formData.capacite}
                    onChange={handleChange}
                    min="1"
                    className="w-full pl-12 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                  />
                </div>
              </div>
            </div>

            {/* Formateur (Admin only) */}
            {user?.role === 'admin' && !isFormateurView && (
              <div>
                <label htmlFor="formateur_id" className="block text-sm font-semibold text-gray-700 mb-2">
                  Formateur
                </label>
                <div className="relative">
                  <FiUser className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <select
                    id="formateur_id"
                    name="formateur_id"
                    value={formData.formateur_id || ''}
                    onChange={handleChange}
                    className={`w-full pl-12 pr-4 py-3 bg-gray-50 border rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all appearance-none ${
                      errors.formateur_id ? 'border-red-500' : 'border-gray-200'
                    }`}
                  >
                    <option value="">Sélectionner un formateur</option>
                    {formateurs.map(formateur => (
                      <option key={formateur.id} value={formateur.id}>
                        {formateur.nom} {formateur.prenom}
                      </option>
                    ))}
                  </select>
                  {errors.formateur_id && <p className="text-red-600 text-sm mt-1">{errors.formateur_id}</p>}
                </div>
              </div>
            )}

            {/* Buttons */}
            <div className="flex gap-4 pt-6 border-t border-gray-200">
              <motion.button
                type="button"
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={onClose}
                className="flex-1 px-6 py-3 bg-gray-100 hover:bg-gray-200 text-gray-700 font-semibold rounded-xl transition-colors"
              >
                Annuler
              </motion.button>
              <motion.button
                type="submit"
                disabled={isLoading}
                whileHover={{ scale: 1.02, boxShadow: "0 20px 40px rgba(59, 130, 246, 0.3)" }}
                whileTap={{ scale: 0.98 }}
                className={`flex-1 px-6 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-semibold rounded-xl shadow-lg shadow-blue-500/30 hover:shadow-xl hover:shadow-blue-500/40 transition-all flex items-center justify-center gap-2 ${
                  isLoading ? 'opacity-70 cursor-not-allowed' : ''
                }`}
              >
                {isLoading ? (
                  <>
                    <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Sauvegarde...
                  </>
                ) : (
                  'Sauvegarder'
                )}
              </motion.button>
            </div>
          </form>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};

/* ======================= MAIN COMPONENT ======================= */
export default function GestionAteliers({ isFormateurView = false }) {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [ateliers, setAteliers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showAddEditModal, setShowAddEditModal] = useState(false);
  const [currentAtelier, setCurrentAtelier] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState('');
  const [filterStatut, setFilterStatut] = useState('');
  const [filtersOpen, setFiltersOpen] = useState(false);

  useEffect(() => {
    fetchAteliers();
  }, [user, isFormateurView]);

  const fetchAteliers = async () => {
    try {
      setLoading(true);
      console.log('🔄 Tentative de récupération des ateliers...');
      
      // Utiliser la route /api/ateliers pour les ateliers
      const token = localStorage.getItem('token');
      console.log('🔑 Token d\'authentification:', token ? 'Présent' : 'Manquant');
      
      const response = await API.get('/ateliers');
      console.log('📡 Réponse du serveur:', {
        status: response.status,
        statusText: response.statusText,
        headers: response.headers,
        data: response.data
      });
      
      if (response.data) {
        console.log('✅ Ateliers récupérés avec succès', response.data);
        setAteliers(Array.isArray(response.data) ? response.data : []);
      } else {
        console.warn('⚠️ Aucune donnée reçue dans la réponse');
        setAteliers([]);
      }
    } catch (error) {
      console.error('❌ ERREUR lors de la récupération des ateliers:', {
        name: error.name,
        message: error.message,
        stack: error.stack,
        response: error.response ? {
          status: error.response.status,
          statusText: error.response.statusText,
          data: error.response.data,
          headers: error.response.headers
        } : 'Pas de réponse du serveur',
        request: error.request ? 'Requête effectuée mais pas de réponse' : 'Requête non effectuée',
        config: {
          url: error.config?.url,
          method: error.config?.method,
          headers: error.config?.headers,
          data: error.config?.data
        }
      });
      
      // Afficher un message d'erreur plus détaillé
      let errorMessage = 'Erreur lors du chargement des ateliers';
      
      if (error.response) {
        // La requête a été faite et le serveur a répondu avec un code d'erreur
        console.error('Détails de l\'erreur:', error.response.data);
        errorMessage = error.response.data.message || errorMessage;
        
        // Gestion spécifique des codes d'erreur HTTP
        if (error.response.status === 401) {
          errorMessage = 'Non autorisé. Veuillez vous reconnecter.';
        } else if (error.response.status === 403) {
          errorMessage = 'Accès refusé. Vous n\'avez pas les permissions nécessaires.';
        } else if (error.response.status === 404) {
          errorMessage = 'Ressource non trouvée. La route demandée n\'existe pas.';
        } else if (error.response.status >= 500) {
          errorMessage = 'Erreur serveur. Veuillez réessayer plus tard.';
        }
      } else if (error.request) {
        // La requête a été faite mais aucune réponse n'a été reçue
        console.error('Pas de réponse du serveur:', error.request);
        errorMessage = 'Impossible de se connecter au serveur. Vérifiez votre connexion Internet.';
      } else {
        // Une erreur s'est produite lors de la configuration de la requête
        console.error('Erreur de configuration de la requête:', error.message);
        errorMessage = `Erreur de configuration: ${error.message}`;
      }
      
      toast.error(errorMessage, { autoClose: 5000 });
      setAteliers([]);
    } finally {
      setLoading(false);
    }
  };

  const handleAddClick = () => {
    setCurrentAtelier(null);
    setShowAddEditModal(true);
  };

  const handleEditClick = (atelier) => {
    setCurrentAtelier(atelier);
    setShowAddEditModal(true);
  };

  const handleSaveAtelier = async (formData) => {
    try {
      if (formData.id) {
        await API.put(`/ateliers/${formData.id}`, formData);
        toast.success('Atelier modifié avec succès !');
      } else {
        await API.post('/ateliers', formData);
        toast.success('Atelier ajouté avec succès !');
      }
      fetchAteliers();
      return true;
    } catch (error) {
      console.error('Erreur lors de la sauvegarde de l\'atelier:', error);
      toast.error(error.response?.data?.message || 'Erreur lors de la sauvegarde de l\'atelier.');
      return false;
    }
  };

  const handleDeleteAtelier = async (id) => {
    if (!window.confirm('Êtes-vous sûr de vouloir supprimer cet atelier ?')) {
      return;
    }
    try {
      await API.delete(`/ateliers/${id}`);
      toast.success('Atelier supprimé avec succès !');
      fetchAteliers();
    } catch (error) {
      console.error('Erreur lors de la suppression de l\'atelier:', error);
      toast.error(error.response?.data?.message || 'Erreur lors de la suppression de l\'atelier.');
    }
  };

  // Filtrage
  const filteredAteliers = ateliers.filter(atelier => {
    const matchesSearch = 
      atelier.titre?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      atelier.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      atelier.salle?.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesType = !filterType || atelier.type === filterType;
    const matchesStatut = !filterStatut || atelier.statut === filterStatut;

    return matchesSearch && matchesType && matchesStatut;
  });

  // Statistiques
  const stats = {
    total: ateliers.length,
    actifs: ateliers.filter(a => a.statut === 'actif').length,
    pratiques: ateliers.filter(a => a.type === 'pratique').length,
    theoriques: ateliers.filter(a => a.type === 'theorique').length,
    inscrits: ateliers.reduce((sum, a) => sum + (a.inscrits || 0), 0)
  };

  if (loading) return <LoadingSpinner />;

  return (
    <motion.div
      initial="hidden"
      animate="visible"
      variants={pageVariants}
      className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-blue-100 p-8"
    >
      <div className="max-w-7xl mx-auto space-y-8">
        {/* Header */}
        <motion.div 
          variants={cardVariants}
          className="flex flex-col md:flex-row md:items-center justify-between gap-6"
        >
          <div>
            <h1 className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-gray-900 via-blue-800 to-indigo-900 bg-clip-text text-transparent mb-2">
              Gestion des Ateliers
              {isFormateurView && <span className="text-3xl"> (Mes ateliers)</span>}
            </h1>
            <p className="text-gray-600 text-lg">
              Créez et gérez vos ateliers de formation
            </p>
          </div>
          <motion.button
            whileHover={{ scale: 1.05, boxShadow: "0 20px 40px rgba(59, 130, 246, 0.3)" }}
            whileTap={{ scale: 0.95 }}
            onClick={handleAddClick}
            className="px-6 py-3.5 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-xl font-semibold flex items-center gap-2 shadow-lg shadow-blue-500/30 hover:shadow-xl hover:shadow-blue-500/40 transition-all duration-300"
          >
            <FiPlus className="w-5 h-5" />
            Nouvel atelier
          </motion.button>
        </motion.div>

        {/* Stats */}
        <motion.div
          variants={staggerContainer}
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6"
        >
          <StatCard
            icon={FiTool}
            label="Total Ateliers"
            value={stats.total}
            gradient="from-blue-500 to-blue-600"
          />
          <StatCard
            icon={FiZap}
            label="Actifs"
            value={stats.actifs}
            gradient="from-green-500 to-emerald-600"
          />
          <StatCard
            icon={FiBookOpen}
            label="Pratiques"
            value={stats.pratiques}
            gradient="from-blue-500 to-indigo-600"
          />
          <StatCard
            icon={FiLayers}
            label="Théoriques"
            value={stats.theoriques}
            gradient="from-sky-500 to-cyan-600"
          />
          <StatCard
            icon={FiUsers}
            label="Inscrits"
            value={stats.inscrits}
            gradient="from-indigo-500 to-blue-600"
          />
        </motion.div>

        {/* Search & Filters */}
        <motion.div
          variants={cardVariants}
          className="bg-white/80 backdrop-blur-xl rounded-2xl border border-gray-200/50 shadow-lg shadow-gray-200/50 p-6"
        >
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1 relative">
              <FiSearch className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="text"
                placeholder="Rechercher par titre, description ou salle..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-12 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
              />
            </div>
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => setFiltersOpen(!filtersOpen)}
              className="px-6 py-3 bg-gray-100 hover:bg-gray-200 rounded-xl font-medium flex items-center gap-2 transition-colors"
            >
              <FiFilter className="w-5 h-5" />
              Filtres
              {filtersOpen ? <FiChevronUp className="w-4 h-4" /> : <FiChevronDown className="w-4 h-4" />}
            </motion.button>
          </div>

          <AnimatePresence>
            {filtersOpen && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: 'auto', opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                transition={{ duration: 0.3 }}
                className="overflow-hidden"
              >
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-6 pt-6 border-t border-gray-200">
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">Type</label>
                    <select
                      value={filterType}
                      onChange={(e) => setFilterType(e.target.value)}
                      className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    >
                      <option value="">Tous les types</option>
                      <option value="pratique">Pratique</option>
                      <option value="theorique">Théorique</option>
                      <option value="hybride">Hybride</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">Statut</label>
                    <select
                      value={filterStatut}
                      onChange={(e) => setFilterStatut(e.target.value)}
                      className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    >
                      <option value="">Tous les statuts</option>
                      <option value="actif">Actif</option>
                      <option value="annulé">Annulé</option>
                      <option value="terminé">Terminé</option>
                    </select>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>

        {/* Workshops Grid */}
        {filteredAteliers.length === 0 ? (
          <motion.div
            variants={cardVariants}
            className="bg-white/80 backdrop-blur-xl rounded-2xl border border-gray-200/50 shadow-lg p-12 text-center"
          >
            <div className="flex flex-col items-center gap-4">
              <div className="w-20 h-20 rounded-full bg-gradient-to-br from-blue-100 to-indigo-100 flex items-center justify-center">
                <FiTool className="w-10 h-10 text-blue-600" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900">Aucun atelier trouvé</h3>
              <p className="text-gray-600">Commencez par créer votre premier atelier</p>
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={handleAddClick}
                className="mt-4 px-6 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-xl font-semibold shadow-lg shadow-blue-500/30"
              >
                <FiPlus className="inline-block mr-2" />
                Créer un atelier
              </motion.button>
            </div>
          </motion.div>
        ) : (
          <motion.div
            variants={staggerContainer}
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
          >
            {filteredAteliers.map((atelier, index) => (
              <WorkshopCard
                key={atelier.id}
                atelier={atelier}
                index={index}
                onEdit={handleEditClick}
                onDelete={handleDeleteAtelier}
                isFormateurView={isFormateurView}
              />
            ))}
          </motion.div>
        )}
      </div>

      {/* Modal */}
      <AddEditAtelierModal
        showModal={showAddEditModal}
        onClose={() => {
          setShowAddEditModal(false);
          setCurrentAtelier(null);
        }}
        onSave={handleSaveAtelier}
        initialData={currentAtelier}
        isFormateurView={isFormateurView}
      />
    </motion.div>
  );
}
