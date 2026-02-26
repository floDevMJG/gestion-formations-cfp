import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import Swal from 'sweetalert2';
import { FiUser, FiMail, FiLock, FiPhone, FiMapPin, FiCalendar, FiAnchor, FiCheckCircle, FiArrowLeft } from 'react-icons/fi';
import API from '../services/api';

export default function InscriptionFormateur() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    nom: '',
    prenom: '',
    email: '',
    password: '',
    confirmPassword: '',
    telephone: '',
    adresse: '',
    dateNaissance: ''
  });

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Validation
    if (formData.password !== formData.confirmPassword) {
      Swal.fire({
        icon: 'error',
        title: 'Erreur de validation',
        text: 'Les mots de passe ne correspondent pas',
        timer: 3000,
        timerProgressBar: true,
        showConfirmButton: false,
        position: 'top-end',
        toast: true,
        customClass: {
          container: 'swal2-container'
        }
      });
      return;
    }

    if (formData.password.length < 6) {
      Swal.fire({
        icon: 'error',
        title: 'Mot de passe trop court',
        text: 'Le mot de passe doit contenir au moins 6 caractères',
        timer: 3000,
        timerProgressBar: true,
        showConfirmButton: false,
        position: 'top-end',
        toast: true,
        customClass: {
          container: 'swal2-container'
        }
      });
      return;
    }

    setLoading(true);

    try {
      const response = await API.post('/auth/register', {
        ...formData,
        role: 'formateur'
      });

      // Afficher une notification de succès détaillée avec SweetAlert
      Swal.fire({
        icon: 'success',
        title: 'Inscription Formateur réussie !',
        html: `
          <div style="text-align: left; font-size: 14px;">
            <p style="margin-bottom: 10px;">Félicitations ${formData.prenom} ${formData.nom} ! Votre compte formateur a été créé avec succès.</p>
            <p style="color: #6b7280; font-size: 12px;">
              <strong>Prochaines étapes :</strong><br/>
              • Votre compte est en attente de validation par l'administrateur<br/>
              • L'administrateur recevra une notification de votre inscription<br/>
              • Vous recevrez un email une fois votre compte validé<br/>
              • Vous pourrez alors vous connecter et accéder à votre espace formateur
            </p>
            <p style="color: #2563eb; font-size: 12px; margin-top: 10px;">
              <strong>Email de confirmation :</strong> ${formData.email}
            </p>
          </div>
        `,
        timer: 5000,
        timerProgressBar: true,
        showConfirmButton: false,
        position: 'top-end',
        toast: true,
        customClass: {
          container: 'swal2-container'
        }
      });

      // Redirection vers la page de connexion
      setTimeout(() => {
        navigate('/login');
      }, 5000);

    } catch (error) {
      console.error('Erreur:', error);
      const errorMessage = error.response?.data?.message || 'Erreur lors de l\'inscription';
      
      // Afficher une notification d'erreur détaillée avec SweetAlert
      Swal.fire({
        icon: 'error',
        title: 'Erreur d\'inscription',
        html: `
          <div style="text-align: left; font-size: 14px;">
            <p style="margin-bottom: 10px;">${errorMessage}</p>
            <p style="color: #6b7280; font-size: 12px;">
              <strong>Suggestions :</strong><br/>
              • Vérifiez que tous les champs obligatoires sont remplis<br/>
              • Assurez-vous que l'email n'est pas déjà utilisé<br/>
              • Le mot de passe doit contenir au moins 6 caractères<br/>
              • Vérifiez la confirmation du mot de passe<br/>
              • Assurez-vous que l'email est valide
            </p>
          </div>
        `,
        timer: 4000,
        timerProgressBar: true,
        showConfirmButton: false,
        position: 'top-end',
        toast: true,
        customClass: {
          container: 'swal2-container'
        }
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-blue-50 flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className="w-full max-w-2xl bg-white rounded-2xl shadow-xl p-8"
      >
        {/* Header avec bouton retour */}
        <div className="flex justify-between items-center mb-8">
          <button
            onClick={() => navigate('/')}
            className="text-gray-500 hover:text-gray-700"
            title="Retour à l'accueil"
          >
            <FiArrowLeft className="w-6 h-6" />
          </button>
          <div className="text-center flex-1">
            <div className="flex justify-center mb-4">
              <div className="relative">
                <div className="absolute inset-0 bg-gradient-to-r from-blue-600 to-blue-800 rounded-xl blur opacity-50"></div>
                <div className="relative bg-gradient-to-r from-blue-600 to-blue-800 p-4 rounded-xl">
                  <FiUser className="text-white text-3xl" />
                </div>
              </div>
            </div>
            <h1 className="text-3xl font-bold text-gray-800 mb-2">
              Inscription Formateur
            </h1>
            <p className="text-gray-600">
              Rejoignez notre équipe d'enseignants qualifiés
            </p>
          </div>
          <div className="w-6"></div> {/* Pour l'alignement */}
        </div>

        {/* Info Box */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="mb-6 p-4 bg-blue-50 border-l-4 border-blue-500 rounded-lg"
        >
          <div className="flex items-start gap-3">
            <FiCheckCircle className="text-blue-600 mt-0.5 flex-shrink-0" />
            <div>
              <p className="text-blue-800 font-medium">Processus d'inscription</p>
              <ul className="text-blue-700 text-sm mt-1 space-y-1">
                <li>• Remplissez vos informations</li>
                <li>• Votre compte sera en attente de validation</li>
                <li>• L'administrateur recevra une notification</li>
                <li>• Vous recevrez un code d'accès une fois validé</li>
              </ul>
            </div>
          </div>
        </motion.div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Informations personnelles */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-gray-700 text-sm font-semibold mb-2 flex items-center gap-2">
                <FiUser className="text-blue-600" />
                Nom *
              </label>
              <input
                type="text"
                name="nom"
                value={formData.nom}
                onChange={handleChange}
                required
                className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200"
                placeholder="Votre nom"
              />
            </div>
            <div>
              <label className="block text-gray-700 text-sm font-semibold mb-2 flex items-center gap-2">
                <FiUser className="text-blue-600" />
                Prénom *
              </label>
              <input
                type="text"
                name="prenom"
                value={formData.prenom}
                onChange={handleChange}
                required
                className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200"
                placeholder="Votre prénom"
              />
            </div>
          </div>

          {/* Email et téléphone */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-gray-700 text-sm font-semibold mb-2 flex items-center gap-2">
                <FiMail className="text-blue-600" />
                Email *
              </label>
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                required
                className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200"
                placeholder="votre.email@exemple.com"
              />
            </div>
            <div>
              <label className="block text-gray-700 text-sm font-semibold mb-2 flex items-center gap-2">
                <FiPhone className="text-blue-600" />
                Téléphone
              </label>
              <input
                type="tel"
                name="telephone"
                value={formData.telephone}
                onChange={handleChange}
                className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200"
                placeholder="+261 XX XX XXX XX"
              />
            </div>
          </div>

          {/* Date de naissance et adresse */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-gray-700 text-sm font-semibold mb-2 flex items-center gap-2">
                <FiCalendar className="text-blue-600" />
                Date de naissance
              </label>
              <input
                type="date"
                name="dateNaissance"
                value={formData.dateNaissance}
                onChange={handleChange}
                className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200"
              />
            </div>
            <div>
              <label className="block text-gray-700 text-sm font-semibold mb-2 flex items-center gap-2">
                <FiMapPin className="text-blue-600" />
                Adresse
              </label>
              <input
                type="text"
                name="adresse"
                value={formData.adresse}
                onChange={handleChange}
                className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200"
                placeholder="Votre adresse"
              />
            </div>
          </div>

          {/* Mots de passe */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-gray-700 text-sm font-semibold mb-2 flex items-center gap-2">
                <FiLock className="text-blue-600" />
                Mot de passe *
              </label>
              <input
                type="password"
                name="password"
                value={formData.password}
                onChange={handleChange}
                required
                minLength={6}
                className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200"
                placeholder="Minimum 6 caractères"
              />
            </div>
            <div>
              <label className="block text-gray-700 text-sm font-semibold mb-2 flex items-center gap-2">
                <FiLock className="text-blue-600" />
                Confirmer le mot de passe *
              </label>
              <input
                type="password"
                name="confirmPassword"
                value={formData.confirmPassword}
                onChange={handleChange}
                required
                className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200"
                placeholder="Répétez votre mot de passe"
              />
            </div>
          </div>

          {/* Bouton de soumission */}
          <motion.button
            type="submit"
            disabled={loading}
            whileHover={{ scale: 1.02, y: -2 }}
            whileTap={{ scale: 0.98 }}
            className={`w-full py-4 px-4 rounded-lg font-semibold text-lg focus:outline-none focus:ring-2 focus:ring-offset-2 transition-all duration-300 shadow-lg hover:shadow-xl flex items-center justify-center gap-2 ${
              loading
                ? 'bg-gray-400 cursor-not-allowed'
                : 'bg-gradient-to-r from-blue-600 to-blue-800 hover:from-blue-700 hover:to-blue-900 focus:ring-blue-500 text-white'
            }`}
          >
            {loading ? (
              <>
                <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Inscription en cours...
              </>
            ) : (
              <>
                <FiCheckCircle className="text-xl" />
                S'inscrire comme formateur
              </>
            )}
          </motion.button>
        </form>

        {/* Lien vers connexion */}
        <div className="mt-6 text-center">
          <p className="text-gray-600">
            Déjà inscrit ?
            <Link to="/login" className="text-blue-600 hover:text-blue-800 font-semibold ml-1">
              Se connecter
            </Link>
          </p>
        </div>

        {/* Footer */}
        <div className="mt-8 pt-6 border-t border-gray-200 flex items-center justify-center gap-2">
          <FiAnchor className="text-blue-600" />
          <span className="text-xs text-gray-500">CFP Charpentier Marine</span>
        </div>
      </motion.div>
    </div>
  );
}