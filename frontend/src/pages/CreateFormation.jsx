import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import API from '../services/api';

const containerVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.5,
      when: "beforeChildren",
      staggerChildren: 0.1
    }
  }
};

const itemVariants = {
  hidden: { y: 20, opacity: 0 },
  visible: {
    y: 0,
    opacity: 1
  }
};

export default function CreateFormation() {
  const [formData, setFormData] = useState({
    titre: '',
    duree: '',
    description: '',
    niveau: 'Débutant',
    places: 10
  });
  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitStatus, setSubmitStatus] = useState({ type: '', message: '' });
  const navigate = useNavigate();

  const niveaux = ['Débutant', 'Intermédiaire', 'Avancé'];

  const validateForm = () => {
    const newErrors = {};
    if (!formData.titre.trim()) newErrors.titre = 'Le titre est requis';
    if (!formData.duree) newErrors.duree = 'La durée est requise';
    if (formData.places < 1) newErrors.places = 'Le nombre de places doit être supérieur à 0';
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: name === 'places' ? parseInt(value) || '' : value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) return;
    
    setIsSubmitting(true);
    setSubmitStatus({ type: '', message: '' });
    
    try {
      await API.post('/formations', formData);
      setSubmitStatus({
        type: 'success',
        message: 'Formation créée avec succès !'
      });
      
      // Redirection après un court délai
      setTimeout(() => {
        navigate('/dashboard');
      }, 1500);
      
    } catch (error) {
      console.error('Erreur lors de la création de la formation:', error);
      setSubmitStatus({
        type: 'error',
        message: error.response?.data?.message || 'Une erreur est survenue lors de la création de la formation.'
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-2xl mx-auto">
        <motion.div 
          className="text-center mb-8"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <h1 className="text-3xl font-extrabold text-gray-900">Créer une nouvelle formation</h1>
          <p className="mt-2 text-gray-600">Remplissez les détails de la nouvelle formation</p>
        </motion.div>

        <motion.div
          className="bg-white p-8 rounded-xl shadow-md"
          variants={containerVariants}
          initial="hidden"
          animate="visible"
        >
          {submitStatus.message && (
            <motion.div 
              className={`mb-6 p-4 rounded-md ${
                submitStatus.type === 'success' 
                  ? 'bg-green-50 text-green-800' 
                  : 'bg-red-50 text-red-800'
              }`}
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
            >
              {submitStatus.message}
            </motion.div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            <motion.div variants={itemVariants} key="titre-formation">
              <label htmlFor="titre" className="block text-sm font-medium text-gray-700 mb-1">
                Titre de la formation <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                id="titre"
                name="titre"
                value={formData.titre}
                onChange={handleChange}
                className={`w-full px-4 py-2 border rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                  errors.titre ? 'border-red-500' : 'border-gray-300'
                }`}
                placeholder="Ex: Initiation à la charpente marine"
              />
              {errors.titre && (
                <p className="mt-1 text-sm text-red-600">{errors.titre}</p>
              )}
            </motion.div>

            <motion.div variants={itemVariants} key="description-formation">
              <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-1">
                Description
              </label>
              <textarea
                id="description"
                name="description"
                value={formData.description}
                onChange={handleChange}
                rows="3"
                className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Décrivez la formation en détail..."
              />
            </motion.div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <motion.div variants={itemVariants} key="duree-formation">
                <label htmlFor="duree" className="block text-sm font-medium text-gray-700 mb-1">
                  Durée (en heures) <span className="text-red-500">*</span>
                </label>
                <input
                  type="number"
                  id="duree"
                  name="duree"
                  value={formData.duree}
                  onChange={handleChange}
                  min="1"
                  className={`w-full px-4 py-2 border rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                    errors.duree ? 'border-red-500' : 'border-gray-300'
                  }`}
                  placeholder="Ex: 20"
                />
                {errors.duree && (
                  <p className="mt-1 text-sm text-red-600">{errors.duree}</p>
                )}
              </motion.div>

              <motion.div variants={itemVariants} key="niveau-formation">
                <label htmlFor="niveau" className="block text-sm font-medium text-gray-700 mb-1">
                  Niveau
                </label>
                <select
                  id="niveau"
                  name="niveau"
                  value={formData.niveau}
                  onChange={handleChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  {niveaux.map(niveau => (
                    <option key={niveau} value={niveau}>{niveau}</option>
                  ))}
                </select>
              </motion.div>

              <motion.div variants={itemVariants} key="places-formation">
                <label htmlFor="places" className="block text-sm font-medium text-gray-700 mb-1">
                  Nombre de places <span className="text-red-500">*</span>
                </label>
                <input
                  type="number"
                  id="places"
                  name="places"
                  value={formData.places}
                  onChange={handleChange}
                  min="1"
                  className={`w-full px-4 py-2 border rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                    errors.places ? 'border-red-500' : 'border-gray-300'
                  }`}
                />
                {errors.places && (
                  <p className="mt-1 text-sm text-red-600">{errors.places}</p>
                )}
              </motion.div>
            </div>

            <motion.div 
              className="pt-4 flex justify-end space-x-3"
              variants={itemVariants}
            >
              <button
                type="button"
                onClick={() => navigate(-1)}
                className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                disabled={isSubmitting}
              >
                Annuler
              </button>
              <button
                type="submit"
                disabled={isSubmitting}
                className={`px-6 py-2 border border-transparent rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 ${
                  isSubmitting ? 'opacity-70 cursor-not-allowed' : ''
                }`}
              >
                {isSubmitting ? (
                  <span className="flex items-center">
                    <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Création...
                  </span>
                ) : 'Créer la formation'}
              </button>
            </motion.div>
          </form>
        </motion.div>
      </div>
    </div>
  );
}
