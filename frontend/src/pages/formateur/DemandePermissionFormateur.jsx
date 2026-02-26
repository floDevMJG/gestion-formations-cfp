import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
  FiClock,
  FiSend,
  FiCheckCircle,
  FiAlertCircle,
  FiUpload,
  FiFileText,
  FiX,
  FiPlus,
  FiInfo,
  FiCalendar,
  FiUser
} from 'react-icons/fi';
import { useAuth } from '../../contexts/AuthContext';
import API from '../../services/api';
import axios from 'axios';

export default function DemandePermissionFormateur() {
  const { user } = useAuth();
  const [formData, setFormData] = useState({
    typePermission: 'personnel',
    date: '',
    heureDebut: '',
    heureFin: '',
    motif: '',
    documents: [],
    retourPrevu: ''
  });
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');
  const [permissionsStats, setPermissionsStats] = useState({
    totalMois: 5,
    utilisees: 2,
    restantes: 3,
    enAttente: 1
  });
  const [dragActive, setDragActive] = useState(false);

  useEffect(() => {
    fetchPermissionsStats();
  }, []);

  const fetchPermissionsStats = async () => {
    try {
      // Simulation - remplacer par vrai appel API
      setPermissionsStats({
        totalMois: 5,
        utilisees: 2,
        restantes: 3,
        enAttente: 1
      });
    } catch (error) {
      console.error('Erreur:', error);
    }
  };

  const calculateDuree = () => {
    if (!formData.heureDebut || !formData.heureFin) return 0;
    const debut = new Date(`2000-01-01T${formData.heureDebut}`);
    const fin = new Date(`2000-01-01T${formData.heureFin}`);
    const diffTime = Math.abs(fin - debut);
    const diffHours = diffTime / (1000 * 60 * 60);
    return diffHours;
  };

  const calculateJours = () => {
    const duree = calculateDuree();
    if (duree <= 4) return 0.5; // Demi-journée
    if (duree <= 8) return 1; // Journée complète
    return Math.ceil(duree / 8); // Plusieurs jours
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    
    try {
      const joursDemandes = calculateJours();
      
      if (joursDemandes > 5) {
        setError('Les permissions ne peuvent pas dépasser 5 jours. Pour une demande plus longue, utilisez la page de congé.');
        setLoading(false);
        return;
      }

      if (joursDemandes > permissionsStats.restantes) {
        setError(`Vous n'avez que ${permissionsStats.restantes} jours restants ce mois-ci.`);
        setLoading(false);
        return;
      }

      // Préparation des données pour l'API
      const formDataToSend = new FormData();
      formDataToSend.append('user_id', user.id);
      formDataToSend.append('user_name', `${user.nom} ${user.prenom}`);
      formDataToSend.append('user_email', user.email);
      formDataToSend.append('user_role', user.role);
      formDataToSend.append('type_permission', formData.typePermission);
      formDataToSend.append('date_permission', formData.date);
      formDataToSend.append('heure_debut', formData.heureDebut);
      formDataToSend.append('heure_fin', formData.heureFin);
      formDataToSend.append('duree', calculateDuree());
      formDataToSend.append('jours_demandes', joursDemandes);
      formDataToSend.append('motif', formData.motif);
      formDataToSend.append('retour_prevu', formData.retourPrevu || '');
      formDataToSend.append('contact_urgence', formData.contactUrgence);
      formDataToSend.append('telephone_urgence', formData.telephoneUrgence);

      // Ajout des documents
      formData.documents.forEach((doc, index) => {
        formDataToSend.append(`documents`, doc);
      });

      // Envoi à l'API réelle
      const response = await axios.post('/api/conges-permissions/permissions/demande', formDataToSend, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      if (response.data.success) {
        setSuccess(true);
        setLoading(false);
        fetchPermissionsStats();
        
        // Réinitialiser le formulaire
        setFormData({
          typePermission: 'personnel',
          date: '',
          heureDebut: '',
          heureFin: '',
          motif: '',
          retourPrevu: '',
          contactUrgence: '',
          telephoneUrgence: '',
          documents: []
        });
      }

    } catch (error) {
      console.error('Erreur:', error);
      setError(error.response?.data?.error || 'Une erreur est survenue lors de l\'envoi de la demande.');
      setLoading(false);
    }
  };

  const handleDrag = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFile(e.dataTransfer.files[0]);
    }
  };

  const handleFile = (file) => {
    if (file.size > 5 * 1024 * 1024) {
      setError('Le fichier ne doit pas dépasser 5MB');
      return;
    }
    
    setFormData({
      ...formData,
      documents: [...formData.documents, file]
    });
  };

  const removeDocument = (index) => {
    setFormData({
      ...formData,
      documents: formData.documents.filter((_, i) => i !== index)
    });
  };

  if (success) {
    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="min-h-screen bg-gradient-to-br from-purple-50 to-pink-50 flex items-center justify-center p-4"
      >
        <div className="bg-white rounded-2xl shadow-xl p-8 max-w-md w-full text-center">
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ type: "spring", stiffness: 200, damping: 20 }}
            className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6"
          >
            <FiCheckCircle className="w-10 h-10 text-green-600" />
          </motion.div>
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Demande envoyée !</h2>
          <p className="text-gray-600 mb-6">
            Votre demande de permission a été envoyée avec succès et est en attente de validation.
          </p>
          <div className="bg-purple-50 border border-purple-200 rounded-lg p-4 mb-6">
            <p className="text-sm text-purple-800">
              <strong>Référence :</strong> PERM-{Date.now().toString().slice(-6)}
            </p>
            <p className="text-sm text-purple-800">
              <strong>Date :</strong> {new Date().toLocaleDateString('fr-FR')}
            </p>
          </div>
          <button
            onClick={() => {
              setSuccess(false);
              setFormData({
                typePermission: 'personnel',
                date: '',
                heureDebut: '',
                heureFin: '',
                motif: '',
                documents: [],
                retourPrevu: ''
              });
            }}
            className="w-full px-6 py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
          >
            Nouvelle demande
          </button>
        </div>
      </motion.div>
    );
  }

  return (
    <div className="p-6">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Demande de Permission</h1>
        <p className="text-gray-600">Faire une demande de permission de 1 à 5 jours maximum</p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white rounded-lg shadow p-6"
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Total mensuel</p>
              <p className="text-2xl font-bold text-gray-900">{permissionsStats.totalMois} jours</p>
            </div>
            <FiCalendar className="text-3xl text-purple-600" />
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-white rounded-lg shadow p-6"
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Utilisées</p>
              <p className="text-2xl font-bold text-orange-600">{permissionsStats.utilisees} jours</p>
            </div>
            <FiClock className="text-3xl text-orange-600" />
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-white rounded-lg shadow p-6"
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Restantes</p>
              <p className="text-2xl font-bold text-green-600">{permissionsStats.restantes} jours</p>
            </div>
            <FiCheckCircle className="text-3xl text-green-600" />
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="bg-white rounded-lg shadow p-6"
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">En attente</p>
              <p className="text-2xl font-bold text-yellow-600">{permissionsStats.enAttente}</p>
            </div>
            <FiAlertCircle className="text-3xl text-yellow-600" />
          </div>
        </motion.div>
      </div>

      {/* Formulaire */}
      <div className="bg-white rounded-lg shadow p-6">
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Type de permission */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Type de permission
            </label>
            <select
              value={formData.typePermission}
              onChange={(e) => setFormData({...formData, typePermission: e.target.value})}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              required
            >
              <option value="personnel">Personnel</option>
              <option value="professionnel">Professionnel</option>
              <option value="exceptionnel">Exceptionnel</option>
            </select>
          </div>

          {/* Date et horaires */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Date
              </label>
              <input
                type="date"
                value={formData.date}
                onChange={(e) => setFormData({...formData, date: e.target.value})}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                required
                min={new Date().toISOString().split('T')[0]}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Heure de début
              </label>
              <input
                type="time"
                value={formData.heureDebut}
                onChange={(e) => setFormData({...formData, heureDebut: e.target.value})}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Heure de fin
              </label>
              <input
                type="time"
                value={formData.heureFin}
                onChange={(e) => setFormData({...formData, heureFin: e.target.value})}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                required
              />
            </div>
          </div>

          {/* Calcul de la durée */}
          {formData.heureDebut && formData.heureFin && (
            <div className="bg-purple-50 border border-purple-200 rounded-lg p-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <FiInfo className="text-purple-600" />
                  <span className="text-purple-800">
                    Durée : <strong>{calculateDuree()} heures</strong> ({calculateJours()} jour(s))
                  </span>
                </div>
                {calculateJours() > permissionsStats.restantes && (
                  <span className="text-red-600 text-sm">
                    ⚠️ Jours insuffisants
                  </span>
                )}
              </div>
            </div>
          )}

          {/* Motif */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Motif de la permission
            </label>
            <textarea
              value={formData.motif}
              onChange={(e) => setFormData({...formData, motif: e.target.value})}
              rows={3}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              placeholder="Décrivez le motif de votre demande de permission..."
              required
            />
          </div>

          {/* Retour prévu */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Heure de retour prévue (optionnel)
            </label>
            <input
              type="time"
              value={formData.retourPrevu}
              onChange={(e) => setFormData({...formData, retourPrevu: e.target.value})}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              placeholder="Quand prévoyez-vous de revenir ?"
            />
          </div>

          {/* Documents */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Documents justificatifs (optionnel)
            </label>
            <div
              className={`border-2 border-dashed rounded-lg p-6 text-center transition-colors ${
                dragActive ? 'border-purple-500 bg-purple-50' : 'border-gray-300'
              }`}
              onDragEnter={handleDrag}
              onDragLeave={handleDrag}
              onDragOver={handleDrag}
              onDrop={handleDrop}
            >
              <FiUpload className="mx-auto h-12 w-12 text-gray-400 mb-4" />
              <p className="text-gray-600 mb-2">
                Glissez les fichiers ici ou cliquez pour sélectionner
              </p>
              <p className="text-sm text-gray-500">
                PDF, JPG, PNG (max 5MB) - Justificatifs médicaux, convocations, etc.
              </p>
              <input
                type="file"
                multiple
                accept=".pdf,.jpg,.jpeg,.png"
                onChange={(e) => {
                  if (e.target.files) {
                    Array.from(e.target.files).forEach(handleFile);
                  }
                }}
                className="hidden"
                id="file-upload-permission"
              />
              <label
                htmlFor="file-upload-permission"
                className="mt-4 inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 cursor-pointer"
              >
                <FiPlus className="mr-2" />
                Ajouter des fichiers
              </label>
            </div>

            {/* Liste des documents */}
            {formData.documents.length > 0 && (
              <div className="mt-4 space-y-2">
                {formData.documents.map((doc, index) => (
                  <div key={index} className="flex items-center justify-between bg-gray-50 p-3 rounded-lg">
                    <div className="flex items-center space-x-2">
                      <FiFileText className="text-gray-500" />
                      <span className="text-sm text-gray-700">{doc.name}</span>
                      <span className="text-xs text-gray-500">
                        ({(doc.size / 1024).toFixed(1)} KB)
                      </span>
                    </div>
                    <button
                      type="button"
                      onClick={() => removeDocument(index)}
                      className="text-red-500 hover:text-red-700"
                    >
                      <FiX />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Erreur */}
          {error && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-4">
              <div className="flex items-center space-x-2">
                <FiAlertCircle className="text-red-600" />
                <span className="text-red-800">{error}</span>
              </div>
            </div>
          )}

          {/* Bouton de soumission */}
          <div className="flex justify-end">
            <button
              type="submit"
              disabled={loading || (formData.heureDebut && formData.heureFin && calculateJours() > permissionsStats.restantes)}
              className="px-6 py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2"
            >
              {loading ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  <span>Envoi en cours...</span>
                </>
              ) : (
                <>
                  <FiSend />
                  <span>Envoyer la demande</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
