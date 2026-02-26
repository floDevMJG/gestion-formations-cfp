import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../../contexts/AuthContext';
import API from '../../services/api';
import {
  FiBook,
  FiUpload,
  FiFile,
  FiPlus,
  FiX,
  FiSave,
  FiAlertCircle,
  FiCheckCircle,
  FiCalendar,
  FiUser,
  FiTag,
  FiLoader,
  FiEye
} from 'react-icons/fi';
import { FaChalkboardTeacher, FaFilePdf } from 'react-icons/fa';

export default function AjoutCoursFormateur() {
  const { user } = useAuth();
  const [formations, setFormations] = useState([]);
  const [cours, setCours] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [previewFile, setPreviewFile] = useState(null);
  const [message, setMessage] = useState({ type: '', text: '' });

  const [formData, setFormData] = useState({
    titre: '',
    description: '',
    formationId: '',
    fichier: null
  });

  useEffect(() => {
    if (user?.role !== 'formateur' && user?.role !== 'admin') {
      return;
    }
    fetchData();
  }, [user]);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [formationsRes, coursRes] = await Promise.all([
        API.get('/formations'),
        API.get('/cours')
      ]);
      
      setFormations(formationsRes.data || []);
      setCours(coursRes.data || []);
    } catch (error) {
      console.error('Erreur lors du chargement:', error);
      setMessage({ type: 'error', text: 'Erreur lors du chargement des données' });
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      // Vérifier si c'est un PDF
      if (file.type !== 'application/pdf') {
        setMessage({ type: 'error', text: 'Veuillez sélectionner un fichier PDF' });
        return;
      }
      
      // Vérifier la taille (max 10MB)
      if (file.size > 10 * 1024 * 1024) {
        setMessage({ type: 'error', text: 'Le fichier ne doit pas dépasser 10MB' });
        return;
      }

      setFormData(prev => ({
        ...prev,
        fichier: file
      }));

      // Créer un aperçu
      const fileURL = URL.createObjectURL(file);
      setPreviewFile(fileURL);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!formData.titre || !formData.description || !formData.formationId || !formData.fichier) {
      setMessage({ type: 'error', text: 'Veuillez remplir tous les champs' });
      return;
    }

    try {
      setUploading(true);
      setMessage({ type: '', text: '' });

      const formDataToSend = new FormData();
      formDataToSend.append('titre', formData.titre);
      formDataToSend.append('description', formData.description);
      formDataToSend.append('formationId', formData.formationId);
      formDataToSend.append('fichier', formData.fichier);
      formDataToSend.append('formateurId', user.id);

      const response = await API.post('/cours', formDataToSend, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });

      setMessage({ type: 'success', text: 'Cours ajouté avec succès!' });
      
      // Réinitialiser le formulaire
      setFormData({
        titre: '',
        description: '',
        formationId: '',
        fichier: null
      });
      setPreviewFile(null);
      setShowForm(false);
      
      // Rafraîchir la liste des cours
      fetchData();

    } catch (error) {
      console.error('Erreur lors de l\'ajout du cours:', error);
      const serverMsg = error.response?.data?.message || error.message || 'Erreur lors de l\'ajout du cours';
      setMessage({ type: 'error', text: serverMsg });
    } finally {
      setUploading(false);
    }
  };

  const handleDeleteCours = async (coursId) => {
    if (!window.confirm('Êtes-vous sûr de vouloir supprimer ce cours ?')) {
      return;
    }

    try {
      await API.delete(`/cours/${coursId}`);
      setMessage({ type: 'success', text: 'Cours supprimé avec succès!' });
      fetchData();
    } catch (error) {
      console.error('Erreur lors de la suppression:', error);
      setMessage({ type: 'error', text: 'Erreur lors de la suppression du cours' });
    }
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

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-cyan-50">
      {/* En-tête */}
      <div className="bg-white shadow-sm border-b border-blue-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-blue-600 rounded-lg">
                <FaChalkboardTeacher className="text-white text-xl" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">Gestion des Cours</h1>
                <p className="text-sm text-gray-600">Ajoutez et gérez vos cours PDF</p>
              </div>
            </div>
            <button
              onClick={() => setShowForm(!showForm)}
              className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              <FiPlus />
              <span>Ajouter un cours</span>
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Message */}
        <AnimatePresence>
          {message.text && (
            <motion.div
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className={`mb-6 p-4 rounded-lg flex items-center space-x-3 ${
                message.type === 'success' 
                  ? 'bg-green-100 text-green-800 border border-green-200' 
                  : 'bg-red-100 text-red-800 border border-red-200'
              }`}
            >
              {message.type === 'success' ? (
                <FiCheckCircle className="text-xl" />
              ) : (
                <FiAlertCircle className="text-xl" />
              )}
              <span>{message.text}</span>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Formulaire d'ajout */}
        <AnimatePresence>
          {showForm && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.3 }}
              className="bg-white rounded-xl shadow-sm border border-blue-100 p-6 mb-8"
            >
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-semibold text-gray-900">Ajouter un nouveau cours</h2>
                <button
                  onClick={() => {
                    setShowForm(false);
                    setFormData({
                      titre: '',
                      description: '',
                      formationId: '',
                      fichier: null
                    });
                    setPreviewFile(null);
                  }}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <FiX className="text-xl" />
                </button>
              </div>

              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Titre du cours *
                    </label>
                    <input
                      type="text"
                      name="titre"
                      value={formData.titre}
                      onChange={handleInputChange}
                      required
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="Ex: Introduction à la navigation"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Formation *
                    </label>
                    <select
                      name="formationId"
                      value={formData.formationId}
                      onChange={handleInputChange}
                      required
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    >
                      <option value="">Sélectionnez une formation</option>
                      {formations.map(formation => (
                        <option key={formation.id} value={formation.id}>
                          {formation.titre}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Description *
                  </label>
                  <textarea
                    name="description"
                    value={formData.description}
                    onChange={handleInputChange}
                    required
                    rows={4}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Décrivez le contenu du cours..."
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Fichier PDF *
                  </label>
                  <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-blue-400 transition-colors">
                    <input
                      type="file"
                      accept=".pdf"
                      onChange={handleFileChange}
                      className="hidden"
                      id="pdf-upload"
                    />
                    <label
                      htmlFor="pdf-upload"
                      className="cursor-pointer flex flex-col items-center space-y-2"
                    >
                      <FaFilePdf className="text-4xl text-gray-400" />
                      <span className="text-sm text-gray-600">
                        {formData.fichier ? formData.fichier.name : 'Cliquez pour sélectionner un PDF'}
                      </span>
                      <span className="text-xs text-gray-500">Max: 10MB</span>
                    </label>
                  </div>
                </div>

                {/* Aperçu du fichier */}
                {previewFile && (
                  <div className="border border-gray-200 rounded-lg p-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-3">
                        <FaFilePdf className="text-red-500 text-xl" />
                        <div>
                          <p className="font-medium text-gray-900">{formData.fichier.name}</p>
                          <p className="text-sm text-gray-500">
                            {(formData.fichier.size / 1024 / 1024).toFixed(2)} MB
                          </p>
                        </div>
                      </div>
                      <button
                        type="button"
                        onClick={() => {
                        const link = document.createElement('a');
                        link.href = previewFile;
                        link.download = 'preview.pdf';
                        link.target = '_blank';
                        link.style.display = 'none';
                        document.body.appendChild(link);
                        link.click();
                        document.body.removeChild(link);
                      }}
                        className="text-blue-600 hover:text-blue-700"
                      >
                        <FiEye className="text-xl" />
                      </button>
                    </div>
                  </div>
                )}

                <div className="flex justify-end space-x-4">
                  <button
                    type="button"
                    onClick={() => setShowForm(false)}
                    className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                  >
                    Annuler
                  </button>
                  <button
                    type="submit"
                    disabled={uploading}
                    className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {uploading ? (
                      <>
                        <FiLoader className="animate-spin" />
                        <span>Enregistrement...</span>
                      </>
                    ) : (
                      <>
                        <FiSave />
                        <span>Enregistrer le cours</span>
                      </>
                    )}
                  </button>
                </div>
              </form>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Liste des cours */}
        <div className="bg-white rounded-xl shadow-sm border border-blue-100 p-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-6">Mes cours ({cours.length})</h2>
          
          {cours.length === 0 ? (
            <div className="text-center py-12">
              <div className="inline-flex items-center justify-center w-16 h-16 bg-gray-100 rounded-full mb-4">
                <FiBook className="text-gray-400 text-2xl" />
              </div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">Aucun cours ajouté</h3>
              <p className="text-gray-600 mb-4">Commencez par ajouter votre premier cours.</p>
              <button
                onClick={() => setShowForm(true)}
                className="inline-flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                <FiPlus />
                <span>Ajouter un cours</span>
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {cours.map((cour, index) => (
                <motion.div
                  key={cour.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3, delay: index * 0.1 }}
                  className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow"
                >
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex items-center space-x-3">
                      <div className="p-2 bg-red-100 rounded-lg">
                        <FaFilePdf className="text-red-600 text-lg" />
                      </div>
                      <div className="flex-1">
                        <h3 className="font-medium text-gray-900">{cour.titre}</h3>
                        <p className="text-sm text-gray-600">{cour.formationTitre}</p>
                      </div>
                    </div>
                    <button
                      onClick={() => handleDeleteCours(cour.id)}
                      className="text-red-500 hover:text-red-700"
                    >
                      <FiX />
                    </button>
                  </div>
                  
                  <p className="text-sm text-gray-700 mb-3 line-clamp-2">
                    {cour.description}
                  </p>
                  
                  <div className="flex items-center justify-between text-xs text-gray-500">
                    <span>{new Date(cour.createdAt).toLocaleDateString('fr-FR')}</span>
                    <button
                      onClick={() => {
                        const link = document.createElement('a');
                        link.href = `/${cour.fichierUrl}`;
                        link.download = cour.fichierNom || 'document.pdf';
                        link.target = '_blank';
                        link.style.display = 'none';
                        document.body.appendChild(link);
                        link.click();
                        document.body.removeChild(link);
                      }}
                      className="text-blue-600 hover:text-blue-700"
                    >
                      Voir
                    </button>
                  </div>
                </motion.div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
