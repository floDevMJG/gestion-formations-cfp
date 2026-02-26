import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
  FiCalendar,
  FiClock,
  FiSend,
  FiCheckCircle,
  FiAlertCircle,
  FiUpload,
  FiFileText,
  FiX,
  FiPlus,
  FiInfo,
  FiCalendar as FiCalendarIcon
} from 'react-icons/fi';
import { useAuth } from '../../contexts/AuthContext';
import API from '../../services/api';
import axios from 'axios';

export default function DemandeCongeFormateur() {
  const { user } = useAuth();
  const [formData, setFormData] = useState({
    typeConge: 'annuel',
    dateDebut: '',
    dateFin: '',
    motif: '',
    documents: [],
    contactUrgence: '',
    telephoneUrgence: ''
  });
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');
  const [congesStats, setCongesStats] = useState({
    totalJours: 30,
    joursPris: 12,
    joursRestants: 18,
    enAttente: 2
  });
  const [dragActive, setDragActive] = useState(false);

  useEffect(() => {
    fetchCongesStats();
  }, []);

  const fetchCongesStats = async () => {
    try {
      // Simulation - remplacer par vrai appel API
      setCongesStats({
        totalJours: 30,
        joursPris: 12,
        joursRestants: 18,
        enAttente: 2
      });
    } catch (error) {
      console.error('Erreur:', error);
    }
  };

  const calculateJours = () => {
    if (!formData.dateDebut || !formData.dateFin) return 0;
    const debut = new Date(formData.dateDebut);
    const fin = new Date(formData.dateFin);
    const diffTime = Math.abs(fin - debut);
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1;
    return diffDays;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccess(false);

    try {
      // Validation
      if (!formData.dateDebut || !formData.dateFin || !formData.motif) {
        setError('Veuillez remplir tous les champs obligatoires');
        setLoading(false);
        return;
      }

      const jours = calculateJours();
      if (jours < 10) {
        setError('Le congé doit être d\'au moins 10 jours');
        setLoading(false);
        return;
      }

      if (jours > congesStats.joursRestants) {
        setError('Jours insuffisants pour cette demande');
        setLoading(false);
        return;
      }

      // Préparation des données pour l'API
      const formDataToSend = new FormData();
      formDataToSend.append('user_id', user.id);
      formDataToSend.append('user_name', `${user.nom} ${user.prenom}`);
      formDataToSend.append('user_email', user.email);
      formDataToSend.append('user_role', user.role);
      formDataToSend.append('type_conge', formData.typeConge);
      formDataToSend.append('date_debut', formData.dateDebut);
      formDataToSend.append('date_fin', formData.dateFin);
      formDataToSend.append('jours_demandes', jours);
      formDataToSend.append('motif', formData.motif);
      formDataToSend.append('contact_urgence', formData.contactUrgence);
      formDataToSend.append('telephone_urgence', formData.telephoneUrgence);

      // Ajout des documents
      formData.documents.forEach((doc, index) => {
        formDataToSend.append(`documents`, doc);
      });

      // Envoi à l'API réelle
      const response = await axios.post('/api/conges-permissions/conges/demande', formDataToSend, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      if (response.data.success) {
        setSuccess(true);
        setLoading(false);
        fetchCongesStats();
        
        // Réinitialiser le formulaire
        setFormData({
          typeConge: 'annuel',
          dateDebut: '',
          dateFin: '',
          motif: '',
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
        className="min-h-screen bg-gradient-to-br from-blue-50 to-cyan-50 flex items-center justify-center p-4"
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
            Votre demande de congé a été envoyée avec succès et est en attente de validation.
          </p>
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
            <p className="text-sm text-blue-800">
              <strong>Référence :</strong> CONG-{Date.now().toString().slice(-6)}
            </p>
            <p className="text-sm text-blue-800">
              <strong>Date :</strong> {new Date().toLocaleDateString('fr-FR')}
            </p>
          </div>
          <button
            onClick={() => {
              setSuccess(false);
              setFormData({
                typeConge: 'annuel',
                dateDebut: '',
                dateFin: '',
                motif: '',
                documents: [],
                contactUrgence: '',
                telephoneUrgence: ''
              });
            }}
            className="w-full px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
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
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Demande de Congé</h1>
        <p className="text-gray-600">Faire une demande de congé de 10 jours minimum</p>
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
              <p className="text-sm text-gray-600">Total annuel</p>
              <p className="text-2xl font-bold text-gray-900">{congesStats.totalJours} jours</p>
            </div>
            <FiCalendar className="text-3xl text-blue-600" />
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
              <p className="text-sm text-gray-600">Jours pris</p>
              <p className="text-2xl font-bold text-orange-600">{congesStats.joursPris} jours</p>
            </div>
            <FiCalendarIcon className="text-3xl text-orange-600" />
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
              <p className="text-sm text-gray-600">Jours restants</p>
              <p className="text-2xl font-bold text-green-600">{congesStats.joursRestants} jours</p>
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
              <p className="text-2xl font-bold text-yellow-600">{congesStats.enAttente}</p>
            </div>
            <FiAlertCircle className="text-3xl text-yellow-600" />
          </div>
        </motion.div>
      </div>

      {/* Formulaire */}
      <div className="bg-white rounded-lg shadow p-6">
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Type de congé */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Type de congé
            </label>
            <select
              value={formData.typeConge}
              onChange={(e) => setFormData({...formData, typeConge: e.target.value})}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              required
            >
              <option value="annuel">Congé annuel</option>
              <option value="maladie">Congé maladie</option>
              <option value="maternite">Congé maternité</option>
              <option value="exceptionnel">Congé exceptionnel</option>
            </select>
          </div>

          {/* Dates */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Date de début
              </label>
              <input
                type="date"
                value={formData.dateDebut}
                onChange={(e) => setFormData({...formData, dateDebut: e.target.value})}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                required
                min={new Date().toISOString().split('T')[0]}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Date de fin
              </label>
              <input
                type="date"
                value={formData.dateFin}
                onChange={(e) => setFormData({...formData, dateFin: e.target.value})}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                required
                min={formData.dateDebut || new Date().toISOString().split('T')[0]}
              />
            </div>
          </div>

          {/* Calcul des jours */}
          {formData.dateDebut && formData.dateFin && (
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <FiInfo className="text-blue-600" />
                  <span className="text-blue-800">
                    Durée du congé : <strong>{calculateJours()} jours</strong>
                  </span>
                </div>
                {calculateJours() > congesStats.joursRestants && (
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
              Motif du congé
            </label>
            <textarea
              value={formData.motif}
              onChange={(e) => setFormData({...formData, motif: e.target.value})}
              rows={4}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="Décrivez le motif de votre demande de congé..."
              required
            />
          </div>

          {/* Contact d'urgence */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Contact d'urgence
              </label>
              <input
                type="text"
                value={formData.contactUrgence}
                onChange={(e) => setFormData({...formData, contactUrgence: e.target.value})}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Nom du contact"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Téléphone d'urgence
              </label>
              <input
                type="tel"
                value={formData.telephoneUrgence}
                onChange={(e) => setFormData({...formData, telephoneUrgence: e.target.value})}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Numéro de téléphone"
              />
            </div>
          </div>

          {/* Documents */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Documents (optionnel)
            </label>
            <div
              className={`border-2 border-dashed rounded-lg p-6 text-center transition-colors ${
                dragActive ? 'border-blue-500 bg-blue-50' : 'border-gray-300'
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
                PDF, JPG, PNG (max 5MB)
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
                id="file-upload"
              />
              <label
                htmlFor="file-upload"
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
              disabled={loading || (formData.dateDebut && formData.dateFin && calculateJours() > congesStats.joursRestants)}
              className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2"
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
