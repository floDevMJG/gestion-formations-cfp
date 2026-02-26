import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import Swal from 'sweetalert2';
import { FcGoogle } from 'react-icons/fc';
import { FiMail, FiLock, FiUser, FiCheckCircle } from 'react-icons/fi';

export default function GoogleAuthCallback() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { updateAuthState } = useAuth();

  useEffect(() => {
    const token = searchParams.get('token');
    const userData = searchParams.get('user');
    const created = searchParams.get('created');

    if (token && userData) {
      try {
        const user = JSON.parse(decodeURIComponent(userData));
        
        // Si nouvel utilisateur formateur en attente, afficher l'interface d'attente sans authentifier
        if (String(created) === '1' && user.role === 'formateur' && user.statut === 'en_attente') {
          console.log('ℹ️ Nouveau formateur créé via Google, en attente de validation admin');
          
          // Afficher une notification d'inscription réussie avec attente
          Swal.fire({
            icon: 'info',
            title: 'Inscription Google réussie !',
            text: 'Votre compte formateur a été créé avec succès. Il est en attente de validation par l\'administrateur. Vous recevrez un email une fois validé.',
            timer: 4000,
            timerProgressBar: true,
            showConfirmButton: false,
            position: 'top-end',
            toast: true,
            customClass: {
              container: 'swal2-container'
            }
          });
          
          navigate('/en-attente-validation', { replace: true });
          return;
        }
        updateAuthState(token, user);
        try {
          sessionStorage.setItem('formateurUser', JSON.stringify(user));
          localStorage.setItem('formateurUser', JSON.stringify(user));
          sessionStorage.setItem('formateurLoginData', JSON.stringify({ email: user.email, password: '' }));
          localStorage.setItem('formateurLoginData', JSON.stringify({ email: user.email, password: '' }));
        } catch {}
        
        console.log('✅ Connexion Google réussie:', user);
        
        // Afficher une notification de succès différente selon si c'est une inscription ou une connexion
        if (String(created) === '1') {
          // Nouvel utilisateur inscrit
          Swal.fire({
            icon: 'success',
            title: 'Inscription Google réussie !',
            text: `Bienvenue ${user.prenom || user.email} ! Votre compte a été créé avec succès via Google.`,
            timer: 3000,
            timerProgressBar: true,
            showConfirmButton: false,
            position: 'top-end',
            toast: true,
            customClass: {
              container: 'swal2-container'
            }
          });
        } else {
          // Utilisateur existant qui se connecte
          Swal.fire({
            icon: 'success',
            title: 'Connexion Google réussie !',
            text: `Bonjour ${user.prenom || user.email} ! Vous êtes maintenant connecté.`,
            timer: 2000,
            timerProgressBar: true,
            showConfirmButton: false,
            position: 'top-end',
            toast: true,
            customClass: {
              container: 'swal2-container'
            }
          });
        }
        
        // Rediriger selon le rôle
        setTimeout(() => {
          if (user.role === 'admin') {
            navigate('/admin', { replace: true });
          } else if (user.role === 'formateur') {
            navigate('/formateur/code', { replace: true });
          } else {
            navigate('/dashboard', { replace: true });
          }
        }, 1500);
        
      } catch (error) {
        console.error('❌ Erreur parsing données Google:', error);
        
        // Afficher une notification d'erreur
        Swal.fire({
          icon: 'error',
          title: 'Erreur Google',
          text: 'Une erreur est survenue lors de la connexion avec Google. Veuillez réessayer.',
          timer: 3000,
          timerProgressBar: true,
          showConfirmButton: false,
          position: 'top-end',
          toast: true,
          customClass: {
            container: 'swal2-container'
          }
        });
        
        navigate('/login?error=invalid_data');
      }
    } else {
      // Afficher une notification d'erreur si échec de l'auth Google
      Swal.fire({
        icon: 'error',
        title: 'Échec de la connexion Google',
        text: 'La connexion avec Google a échoué. Veuillez réessayer ou utiliser une autre méthode.',
        timer: 3000,
        timerProgressBar: true,
        showConfirmButton: false,
        position: 'top-end',
        toast: true,
        customClass: {
          container: 'swal2-container'
        }
      });
      
      navigate('/login?error=google_failed');
    }
  }, [navigate, updateAuthState, searchParams]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className="w-full max-w-md"
      >
        <div className="bg-white rounded-2xl shadow-xl p-8 border border-gray-100">
          {/* Header */}
          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-blue-100 rounded-full mb-4">
              <FcGoogle className="text-3xl" />
            </div>
            <h2 className="text-2xl font-bold text-gray-800 mb-2">
              Connexion Google Réussie
            </h2>
            <p className="text-gray-600">
              Vous êtes maintenant connecté avec votre compte Google
            </p>
          </div>

          {/* Animation de succès */}
          <div className="text-center py-8">
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
              className="inline-flex items-center justify-center w-12 h-12 bg-green-100 rounded-full"
            >
              <FiCheckCircle className="text-green-600 text-xl" />
            </motion.div>
            <p className="mt-4 text-sm text-gray-600">
              Redirection vers votre tableau de bord...
            </p>
          </div>

          {/* Informations utilisateur */}
          <div className="bg-blue-50 rounded-lg p-4 mb-6">
            <div className="flex items-center space-x-2 text-sm text-blue-700">
              <FiUser className="text-blue-600" />
              <span>Connexion sécurisée via Google</span>
            </div>
          </div>

          {/* Boutons d'action */}
          <div className="space-y-3">
            <button
              onClick={() => navigate('/dashboard')}
              className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 text-white py-3 px-4 rounded-lg font-medium hover:from-blue-700 hover:to-indigo-700 transition-all duration-200 flex items-center justify-center"
            >
              Accéder au Dashboard
            </button>
            <button
              onClick={() => navigate('/login')}
              className="w-full bg-gray-100 text-gray-700 py-3 px-4 rounded-lg font-medium hover:bg-gray-200 transition-colors duration-200"
            >
              Retour à la connexion
            </button>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
