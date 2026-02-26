import React, { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import Swal from 'sweetalert2';
import { FiUpload, FiUser, FiMail, FiLock, FiCheck, FiArrowLeft, FiCheckCircle } from 'react-icons/fi';
import { motion } from 'framer-motion';

const Inscription = () => {
  const [formData, setFormData] = useState({
    nom: '',
    prenom: '',
    email: '',
    password: '',
    confirmPassword: '',
    role: 'apprenant',
    telephone: '',
    adresse: ''
  });
  
  const [photo, setPhoto] = useState(null);
  const [photoPreview, setPhotoPreview] = useState(null);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
    const fileInputRef = useRef(null);
  const { register } = useAuth();
  const navigate = useNavigate();

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handlePhotoChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setPhoto(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setPhotoPreview(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const triggerFileInput = () => {
    fileInputRef.current.click();
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (formData.password !== formData.confirmPassword) {
      return setError('Les mots de passe ne correspondent pas');
    }

    try {
      setError('');
      setSuccess('');
      // Envoyer en JSON (l'API d'inscription n'accepte pas de fichier)
      const payload = {
        nom: formData.nom,
        prenom: formData.prenom,
        email: formData.email,
        password: formData.password,
        role: formData.role,
        telephone: formData.telephone,
        adresse: formData.adresse
      };

      const result = await register(payload);
      
      console.log('🔍 Résultat de l\'inscription:', result);
      
      if (result.success || result.data) {
        // Message différent selon le rôle
        let successMessage = '';
        let successTitle = '';
        
        if (formData.role === 'apprenant') {
          successTitle = 'Inscription Apprenant réussie !';
          successMessage = `Félicitations ${formData.prenom} ${formData.nom} ! Votre compte apprenant a été créé avec succès. Il est en attente de validation par l'administrateur. Vous recevrez un email à l'adresse ${formData.email} une fois votre compte validé.`;
        } else {
          successTitle = 'Inscription Formateur réussie !';
          successMessage = `Félicitations ${formData.prenom} ${formData.nom} ! Votre compte formateur a été créé avec succès. Vous pouvez maintenant vous connecter et commencer à proposer des formations.`;
        }
        
        // Afficher une notification de succès détaillée avec SweetAlert
        Swal.fire({
          icon: 'success',
          title: successTitle,
          html: `
            <div style="text-align: left; font-size: 14px;">
              <p style="margin-bottom: 10px;">${successMessage}</p>
              ${formData.role === 'apprenant' ? 
                '<p style="color: #6b7280; font-size: 12px;"><strong>Prochaines étapes :</strong><br/>• Attendez la validation admin<br/>• Recevez un email de confirmation<br/>• Connectez-vous à votre espace</p>' : 
                '<p style="color: #6b7280; font-size: 12px;"><strong>Prochaines étapes :</strong><br/>• Connectez-vous immédiatement<br/>• Accédez à votre espace formateur<br/>• Commencez à créer des formations</p>'
              }
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
        
        setSuccess(successMessage);
        
        // Rediriger vers la page de connexion après 4 secondes
        setTimeout(() => {
          navigate('/login');
        }, 4000);
        
        // Réinitialiser le formulaire
        setFormData({
          nom: '',
          prenom: '',
          email: '',
          password: '',
          confirmPassword: '',
          role: 'apprenant',
          telephone: '',
          adresse: ''
        });
        setPhoto(null);
        setPhotoPreview(null);
      }
    } catch (err) {
      console.error('❌ Erreur lors de l\'inscription:', err);
      const errorMessage = err.response?.data?.error || 'Échec de l\'inscription. Veuillez réessayer.';
      setError(errorMessage);
      
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
              • Vérifiez la confirmation du mot de passe
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
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-cyan-100 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-4xl bg-white rounded-2xl shadow-xl overflow-hidden"
      >
        <div className="md:flex">
          {/* Côté gauche avec l'image */}
          <div className="hidden md:block md:w-1/2 bg-gradient-to-br from-blue-600 to-cyan-500 p-12 text-white">
            <div className="flex flex-col h-full justify-between">
              <div>
                <h1 className="text-3xl font-bold mb-4">Rejoignez notre plateforme</h1>
                <p className="text-blue-100">
                  Créez votre compte pour accéder à toutes les fonctionnalités de notre plateforme de formation.
                </p>
              </div>
              <div className="mt-8">
                <div className="flex items-center mb-6">
                  <div className="bg-blue-500 p-2 rounded-full mr-4">
                    <FiCheck className="text-white" />
                  </div>
                  <p>Accès à toutes les formations</p>
                </div>
                <div className="flex items-center mb-6">
                  <div className="bg-blue-500 p-2 rounded-full mr-4">
                    <FiCheck className="text-white" />
                  </div>
                  <p>Suivez votre progression</p>
                </div>
                <div className="flex items-center">
                  <div className="bg-blue-500 p-2 rounded-full mr-4">
                    <FiCheck className="text-white" />
                  </div>
                  <p>Apprentissage personnalisé</p>
                </div>
              </div>
              <div className="mt-12 text-center">
                <p>Déjà inscrit ?</p>
                <button
                  type="button"
                  onClick={() => navigate('/login')}
                  className="mt-2 px-6 py-2 border-2 border-white text-white rounded-full hover:bg-white hover:text-blue-600 transition-colors duration-200"
                >
                  Se connecter
                </button>
              </div>
            </div>
          </div>

          {/* Côté droit avec le formulaire */}
          <div className="p-8 md:p-12 md:w-1/2">
            <div className="flex justify-between items-center mb-8">
              <button
                onClick={() => navigate('/')}
                className="text-gray-500 hover:text-gray-700"
                title="Retour à l'accueil"
              >
                <FiArrowLeft className="w-6 h-6" />
              </button>
              <h2 className="text-2xl font-bold text-gray-800">Créer un compte</h2>
              <div className="w-6"></div> {/* Pour l'alignement */}
            </div>

            {error && (
              <div className="mb-6 p-4 bg-red-50 border-l-4 border-red-500 text-red-700 rounded-r-md" role="alert">
                <p className="font-medium">Erreur</p>
                <p className="text-sm">{error}</p>
              </div>
            )}
            
            {success && (
              <div className="mb-6 p-4 bg-green-50 border-l-4 border-green-500 text-green-700 rounded-r-md flex items-start" role="alert">
                <FiCheckCircle className="h-5 w-5 text-green-500 mr-2 mt-0.5 flex-shrink-0" />
                <div>
                  <p className="font-medium">Succès !</p>
                  <p className="text-sm">{success}</p>
                </div>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Photo de profil */}
              <div className="flex flex-col items-center">
                <div 
                  onClick={triggerFileInput}
                  className="w-24 h-24 rounded-full bg-gray-100 border-2 border-dashed border-gray-300 flex items-center justify-center cursor-pointer hover:border-blue-500 transition-colors overflow-hidden"
                >
                  {photoPreview ? (
                    <img 
                      src={photoPreview} 
                      alt="Prévisualisation" 
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="text-center">
                      <FiUpload className="mx-auto text-gray-400" />
                      <span className="text-xs text-gray-500 mt-1">Photo</span>
                    </div>
                  )}
                </div>
                <input
                  type="file"
                  ref={fileInputRef}
                  onChange={handlePhotoChange}
                  accept="image/*"
                  className="hidden"
                />
                <p className="mt-2 text-xs text-gray-500">Cliquez pour ajouter une photo</p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Prénom */}
                <div>
                  <label htmlFor="prenom" className="block text-sm font-medium text-gray-700 mb-1">
                    Prénom *
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <FiUser className="text-gray-400" />
                    </div>
                    <input
                      id="prenom"
                      name="prenom"
                      type="text"
                      required
                      className="pl-10 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                      placeholder="Votre prénom"
                      value={formData.prenom}
                      onChange={handleChange}
                    />
                  </div>
                </div>

                {/* Nom */}
                <div>
                  <label htmlFor="nom" className="block text-sm font-medium text-gray-700 mb-1">
                    Nom *
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <FiUser className="text-gray-400" />
                    </div>
                    <input
                      id="nom"
                      name="nom"
                      type="text"
                      required
                      className="pl-10 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                      placeholder="Votre nom"
                      value={formData.nom}
                      onChange={handleChange}
                    />
                  </div>
                </div>
              </div>

              {/* Email */}
              <div>
                <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
                  Adresse email *
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <FiMail className="text-gray-400" />
                  </div>
                  <input
                    id="email"
                    name="email"
                    type="email"
                    autoComplete="email"
                    required
                    className="pl-10 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                    placeholder="votre@email.com"
                    value={formData.email}
                    onChange={handleChange}
                  />
                </div>
              </div>

              {/* Téléphone */}
              <div>
                <label htmlFor="telephone" className="block text-sm font-medium text-gray-700 mb-1">
                  Téléphone
                </label>
                <input
                  id="telephone"
                  name="telephone"
                  type="tel"
                  className="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                  placeholder="Votre numéro de téléphone"
                  value={formData.telephone}
                  onChange={handleChange}
                />
              </div>

              {/* Adresse */}
              <div>
                <label htmlFor="adresse" className="block text-sm font-medium text-gray-700 mb-1">
                  Adresse
                </label>
                <textarea
                  id="adresse"
                  name="adresse"
                  rows="2"
                  className="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                  placeholder="Votre adresse complète"
                  value={formData.adresse}
                  onChange={handleChange}
                ></textarea>
              </div>

              {/* Type de compte */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Je suis un(e) *
                </label>
                <div className="grid grid-cols-2 gap-4">
                  <div 
                    onClick={() => setFormData({...formData, role: 'apprenant'})}
                    className={`p-4 border rounded-lg cursor-pointer transition-colors ${formData.role === 'apprenant' ? 'border-blue-500 bg-blue-50' : 'border-gray-300 hover:border-blue-300'}`}
                  >
                    <div className="flex items-center">
                      <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center mr-3 ${formData.role === 'apprenant' ? 'border-blue-500 bg-blue-500' : 'border-gray-400'}`}>
                        {formData.role === 'apprenant' && <FiCheck className="text-white text-xs" />}
                      </div>
                      <span>Apprenant</span>
                    </div>
                    <p className="text-xs text-gray-500 mt-1 ml-8">Je veux suivre des formations</p>
                  </div>
                  <div 
                    onClick={() => setFormData({...formData, role: 'formateur'})}
                    className={`p-4 border rounded-lg cursor-pointer transition-colors ${formData.role === 'formateur' ? 'border-blue-500 bg-blue-50' : 'border-gray-300 hover:border-blue-300'}`}
                  >
                    <div className="flex items-center">
                      <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center mr-3 ${formData.role === 'formateur' ? 'border-blue-500 bg-blue-500' : 'border-gray-400'}`}>
                        {formData.role === 'formateur' && <FiCheck className="text-white text-xs" />}
                      </div>
                      <span>Formateur</span>
                    </div>
                    <p className="text-xs text-gray-500 mt-1 ml-8">Je veux proposer des formations</p>
                  </div>
                </div>
              </div>

              {/* Mot de passe */}
              <div>
                <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1">
                  Mot de passe *
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <FiLock className="text-gray-400" />
                  </div>
                  <input
                    id="password"
                    name="password"
                    type="password"
                    autoComplete="new-password"
                    required
                    minLength="6"
                    className="pl-10 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                    placeholder="••••••••"
                    value={formData.password}
                    onChange={handleChange}
                  />
                </div>
              </div>

              {/* Confirmation du mot de passe */}
              <div>
                <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700 mb-1">
                  Confirmer le mot de passe *
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <FiLock className="text-gray-400" />
                  </div>
                  <input
                    id="confirmPassword"
                    name="confirmPassword"
                    type="password"
                    autoComplete="new-password"
                    required
                    minLength="6"
                    className="pl-10 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                    placeholder="Confirmez votre mot de passe"
                    value={formData.confirmPassword}
                    onChange={handleChange}
                  />
                </div>
                <p className="mt-1 text-xs text-gray-500">Le mot de passe doit contenir au moins 6 caractères</p>
              </div>

              {/* Bouton d'inscription */}
              <div className="pt-2">
                <button
                  type="submit"
                  className="w-full flex justify-center py-3 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors duration-200 flex items-center justify-center"
                >
                  Créer mon compte
                </button>
              </div>

              <div className="mt-6">
                <p className="text-center text-sm text-gray-600">
                  En vous inscrivant, vous acceptez nos{' '}
                  <a href="#" className="font-medium text-blue-600 hover:text-blue-500">
                    conditions d'utilisation
                  </a>{' '}
                  et notre{' '}
                  <a href="#" className="font-medium text-blue-600 hover:text-blue-500">
                    politique de confidentialité
                  </a>.
                </p>
              </div>
            </form>
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export default Inscription;
