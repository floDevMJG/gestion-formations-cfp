import React from 'react';
import { motion } from 'framer-motion';
import { useLocation, useNavigate } from 'react-router-dom';
import {
  FiCheckCircle,
  FiArrowRight,
  FiCalendar,
  FiCreditCard,
  FiUser
} from 'react-icons/fi';

export default function InscriptionConfirmation() {
  const location = useLocation();
  const navigate = useNavigate();
  const { inscription, payment, formation } = location.state || {};

  if (!inscription) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-cyan-50 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Aucune inscription trouvée</h1>
          <button
            onClick={() => navigate('/dashboard')}
            className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            Retour au dashboard
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-cyan-50">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12"
      >
        <div className="text-center mb-8">
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ type: "spring", stiffness: 200, damping: 20 }}
            className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6"
          >
            <FiCheckCircle className="w-10 h-10 text-green-600" />
          </motion.div>
          <h1 className="text-3xl font-bold text-gray-900 mb-4">Inscription Confirmée !</h1>
          <p className="text-lg text-gray-600">
            Votre inscription à la formation a été enregistrée avec succès
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
          {/* Détails de l'inscription */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.2 }}
            className="bg-white rounded-xl shadow-sm border border-blue-100 p-6"
          >
            <h2 className="text-xl font-semibold text-gray-900 mb-4 flex items-center">
              <FiUser className="w-5 h-5 mr-2 text-blue-600" />
              Informations personnelles
            </h2>
            <div className="space-y-3">
              <div className="flex justify-between">
                <span className="text-gray-600">Nom:</span>
                <span className="font-medium">{inscription.nom} {inscription.prenom}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Email:</span>
                <span className="font-medium">{inscription.email}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Téléphone:</span>
                <span className="font-medium">{inscription.telephone}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Date d'inscription:</span>
                <span className="font-medium">
                  {new Date(inscription.createdAt).toLocaleDateString('fr-FR')}
                </span>
              </div>
            </div>
          </motion.div>

          {/* Détails de la formation */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.3 }}
            className="bg-white rounded-xl shadow-sm border border-blue-100 p-6"
          >
            <h2 className="text-xl font-semibold text-gray-900 mb-4">Formation</h2>
            <div className="space-y-3">
              <div>
                <h3 className="font-semibold text-gray-900">{formation?.titre}</h3>
                <p className="text-sm text-gray-600">{formation?.description}</p>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Durée:</span>
                <span className="font-medium">{formation?.duree} heures</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Niveau:</span>
                <span className="font-medium">{formation?.niveau}</span>
              </div>
            </div>
          </motion.div>
        </div>

        {/* Détails du paiement */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="bg-white rounded-xl shadow-sm border border-blue-100 p-6 mb-8"
        >
          <h2 className="text-xl font-semibold text-gray-900 mb-4 flex items-center">
            <FiCreditCard className="w-5 h-5 mr-2 text-green-600" />
            Détails du paiement
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div>
              <p className="text-sm text-gray-600 mb-1">Montant formation</p>
              <p className="text-xl font-bold text-blue-600">
                {new Intl.NumberFormat('fr-MG', { style: 'currency', currency: 'MGA', currencyDisplay: 'symbol' }).format(formation?.prix || 0)}
              </p>
            </div>
            <div>
              <p className="text-sm text-gray-600 mb-1">Frais de scolarité</p>
              <p className="text-xl font-bold text-orange-600">
                {new Intl.NumberFormat('fr-MG', { style: 'currency', currency: 'MGA', currencyDisplay: 'symbol' }).format(inscription.fraisScolarite || 0)}
              </p>
            </div>
            <div>
              <p className="text-sm text-gray-600 mb-1">Total payé</p>
              <p className="text-xl font-bold text-green-600">
                {new Intl.NumberFormat('fr-MG', { style: 'currency', currency: 'MGA', currencyDisplay: 'symbol' }).format(inscription.montant || 0)}
              </p>
            </div>
          </div>
          <div className="mt-4 pt-4 border-t">
            <div className="flex justify-between">
              <span className="text-gray-600">Méthode de paiement:</span>
              <span className="font-medium">
                {inscription.methodePaiement === 'mobile' ? 'Mobile Money' : 'Paiement classique'}
              </span>
            </div>
            {inscription.methodePaiement === 'mobile' && (
              <div className="flex justify-between mt-2">
                <span className="text-gray-600">Opérateur:</span>
                <span className="font-medium uppercase">{payment?.operator}</span>
              </div>
            )}
            <div className="flex justify-between mt-2">
              <span className="text-gray-600">Statut:</span>
              <span className="px-3 py-1 bg-yellow-100 text-yellow-800 rounded-full text-sm">
                En attente de validation
              </span>
            </div>
          </div>
        </motion.div>

        {/* Actions */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="flex flex-col sm:flex-row gap-4 justify-center"
        >
          <button
            onClick={() => navigate('/dashboard')}
            className="px-8 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center justify-center space-x-2"
          >
            <span>Retour au dashboard</span>
            <FiArrowRight />
          </button>
          <button
            onClick={() => navigate('/profile-apprenant')}
            className="px-8 py-3 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors flex items-center justify-center space-x-2"
          >
            <span>Voir mon profil</span>
            <FiUser />
          </button>
        </motion.div>

        {/* Instructions */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
          className="mt-8 p-6 bg-blue-50 border border-blue-200 rounded-xl"
        >
          <h3 className="font-semibold text-blue-900 mb-3">Prochaines étapes</h3>
          <ul className="space-y-2 text-blue-800">
            <li className="flex items-start">
              <span className="mr-2">•</span>
              <span>Vous recevrez un email de confirmation dans les prochaines 24 heures</span>
            </li>
            <li className="flex items-start">
              <span className="mr-2">•</span>
              <span>Le paiement sera validé par notre équipe administrative</span>
            </li>
            <li className="flex items-start">
              <span className="mr-2">•</span>
              <span>Vous pourrez accéder à votre formation dès que le paiement sera confirmé</span>
            </li>
            <li className="flex items-start">
              <span className="mr-2">•</span>
              <span>Pour toute question, contactez-nous au support@cfp.mg</span>
            </li>
          </ul>
        </motion.div>
      </motion.div>
    </div>
  );
}
