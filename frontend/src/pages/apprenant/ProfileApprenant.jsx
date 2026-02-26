import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import API from '../../services/api';
import { useAuth } from '../../contexts/AuthContext';
import {
  FiUser,
  FiMail,
  FiPhone,
  FiCalendar,
  FiBook,
  FiAward,
  FiEdit,
  FiCamera,
  FiMapPin,
  FiGlobe,
  FiClock
} from 'react-icons/fi';
import { FaGraduationCap } from 'react-icons/fa';

export default function ProfileApprenant() {
  const navigate = useNavigate();
  const { user, updateUser } = useAuth();
  const [profile, setProfile] = useState(null);
  const [formations, setFormations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(false);
  const [formData, setFormData] = useState({
    nom: '',
    prenom: '',
    email: '',
    telephone: '',
    adresse: '',
    dateNaissance: '',
    bio: ''
  });

  useEffect(() => {
    if (!user || user.role !== 'apprenant') {
      navigate('/dashboard');
      return;
    }
    fetchProfile();
  }, [user, navigate]);

  const fetchProfile = async () => {
    try {
      // Utiliser directement les données de l'utilisateur connecté
      if (user) {
        console.log('Utilisateur connecté:', user);
        
        setProfile(user);
        setFormData({
          nom: user.nom || '',
          prenom: user.prenom || '',
          email: user.email || '',
          telephone: user.telephone || '',
          adresse: user.adresse || '',
          dateNaissance: user.dateNaissance || '',
          bio: user.bio || ''
        });

        // Récupérer les formations de l'apprenant
        try {
          const formationsRes = await API.get(`/formations/apprenant/${user.id}`);
          setFormations(formationsRes.data);
        } catch (error) {
          console.log('Erreur formations, utilisation de données vides');
          setFormations([]);
        }
      }
    } catch (error) {
      console.error('Erreur:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await API.put(`/auth/me`, formData);
      setProfile(response.data);
      updateUser(response.data);
      setEditing(false);
    } catch (error) {
      console.error('Erreur:', error);
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
      {/* Header */}
      <motion.div
        initial={{ y: -20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        className="bg-white shadow-sm border-b border-blue-100"
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-blue-600 rounded-lg">
                <FiUser className="text-white text-xl" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">Mon Profil</h1>
                <p className="text-sm text-gray-600">Gérez vos informations personnelles</p>
              </div>
            </div>
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => setEditing(!editing)}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center space-x-2"
            >
              <FiEdit />
              <span>{editing ? 'Annuler' : 'Modifier'}</span>
            </motion.button>
          </div>
        </div>
      </motion.div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Profil principal */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="lg:col-span-2"
          >
            <div className="bg-white rounded-xl shadow-sm border border-blue-100 p-6">
              {/* Photo de profil */}
              <div className="flex items-center space-x-6 mb-8">
                <div className="relative">
                  <div className="w-24 h-24 bg-gradient-to-r from-blue-500 to-cyan-500 rounded-full flex items-center justify-center">
                    <span className="text-white text-3xl font-bold">
                      {(profile?.nom?.[0] || user?.nom?.[0] || 'U')}{(profile?.prenom?.[0] || user?.prenom?.[0] || 'U')}
                    </span>
                  </div>
                  <button className="absolute bottom-0 right-0 p-2 bg-blue-600 text-white rounded-full hover:bg-blue-700">
                    <FiCamera className="w-4 h-4" />
                  </button>
                </div>
                <div>
                  <h2 className="text-2xl font-bold text-gray-900">
                    {profile?.nom || user?.nom || 'Nom'} {profile?.prenom || user?.prenom || 'Prénom'}
                  </h2>
                  <p className="text-gray-600">Apprenant</p>
                </div>
              </div>

              {/* Formulaire */}
              {editing ? (
                <form onSubmit={handleSubmit} className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        <FiUser className="inline mr-2" />
                        Nom
                      </label>
                      <input
                        type="text"
                        value={formData.nom}
                        onChange={(e) => setFormData({...formData, nom: e.target.value})}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Prénom
                      </label>
                      <input
                        type="text"
                        value={formData.prenom}
                        onChange={(e) => setFormData({...formData, prenom: e.target.value})}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        required
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      <FiMail className="inline mr-2" />
                      Email
                    </label>
                    <input
                      type="email"
                      value={formData.email}
                      onChange={(e) => setFormData({...formData, email: e.target.value})}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      <FiPhone className="inline mr-2" />
                      Téléphone
                    </label>
                    <input
                      type="tel"
                      value={formData.telephone}
                      onChange={(e) => setFormData({...formData, telephone: e.target.value})}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      <FiMapPin className="inline mr-2" />
                      Adresse
                    </label>
                    <input
                      type="text"
                      value={formData.adresse}
                      onChange={(e) => setFormData({...formData, adresse: e.target.value})}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      <FiCalendar className="inline mr-2" />
                      Date de naissance
                    </label>
                    <input
                      type="date"
                      value={formData.dateNaissance}
                      onChange={(e) => setFormData({...formData, dateNaissance: e.target.value})}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Bio
                    </label>
                    <textarea
                      value={formData.bio}
                      onChange={(e) => setFormData({...formData, bio: e.target.value})}
                      rows={4}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>

                  <div className="flex space-x-4">
                    <button
                      type="submit"
                      className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                    >
                      Enregistrer
                    </button>
                    <button
                      type="button"
                      onClick={() => setEditing(false)}
                      className="px-6 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors"
                    >
                      Annuler
                    </button>
                  </div>
                </form>
              ) : (
                <div className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <p className="text-sm text-gray-500 mb-1">Nom complet</p>
                      <p className="font-medium text-gray-900">{profile?.nom || user?.nom || 'Non renseigné'} {profile?.prenom || user?.prenom || ''}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500 mb-1">Email</p>
                      <p className="font-medium text-gray-900">{profile?.email || user?.email || 'Non renseigné'}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500 mb-1">Téléphone</p>
                      <p className="font-medium text-gray-900">{profile?.telephone || user?.telephone || 'Non renseigné'}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500 mb-1">Date de naissance</p>
                      <p className="font-medium text-gray-900">
                        {profile?.dateNaissance || user?.dateNaissance ? 
                          new Date(profile?.dateNaissance || user?.dateNaissance).toLocaleDateString('fr-FR') : 
                          'Non renseignée'
                        }
                      </p>
                    </div>
                  </div>
                  {(profile?.adresse || user?.adresse) && (
                    <div>
                      <p className="text-sm text-gray-500 mb-1">Adresse</p>
                      <p className="font-medium text-gray-900">{profile?.adresse || user?.adresse}</p>
                    </div>
                  )}
                  {(profile?.bio || user?.bio) && (
                    <div>
                      <p className="text-sm text-gray-500 mb-1">Bio</p>
                      <p className="font-medium text-gray-900">{profile?.bio || user?.bio}</p>
                    </div>
                  )}
                </div>
              )}
            </div>
          </motion.div>

          {/* Sidebar */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            className="space-y-6"
          >
            {/* Statistiques */}
            <div className="bg-white rounded-xl shadow-sm border border-blue-100 p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Mes Statistiques</h3>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <FiBook className="text-blue-600" />
                    <span className="text-sm text-gray-600">Formations</span>
                  </div>
                  <span className="font-semibold text-gray-900">{formations.length}</span>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <FiAward className="text-green-600" />
                    <span className="text-sm text-gray-600">Certificats</span>
                  </div>
                  <span className="font-semibold text-gray-900">0</span>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <FiClock className="text-orange-600" />
                    <span className="text-sm text-gray-600">Heures de formation</span>
                  </div>
                  <span className="font-semibold text-gray-900">120h</span>
                </div>
              </div>
            </div>

            {/* Formations en cours */}
            <div className="bg-white rounded-xl shadow-sm border border-blue-100 p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Mes Formations</h3>
              <div className="space-y-3">
                {formations.slice(0, 3).map((formation) => (
                  <div key={formation.id} className="flex items-center space-x-3">
                    <div className="p-2 bg-blue-100 rounded-lg">
                      <FaGraduationCap className="text-blue-600" />
                    </div>
                    <div className="flex-1">
                      <p className="font-medium text-gray-900 text-sm">{formation.titre}</p>
                      <p className="text-xs text-gray-500">En cours</p>
                    </div>
                  </div>
                ))}
                {formations.length === 0 && (
                  <p className="text-sm text-gray-500">Aucune formation</p>
                )}
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
}
