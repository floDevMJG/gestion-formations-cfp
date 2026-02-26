import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useNavigate, useParams } from 'react-router-dom';
import API from '../services/api';
import { useAuth } from '../contexts/AuthContext';
import {
  FiUser,
  FiMail,
  FiPhone,
  FiCalendar,
  FiMapPin,
  FiBook,
  FiCreditCard,
  FiCheck,
  FiAlertCircle,
  FiArrowRight,
  FiArrowLeft
} from 'react-icons/fi';

// Logos des opérateurs (placeholders - vous devrez ajouter les vrais logos)
const OrangeMoneyLogo = () => (
  <div className="w-12 h-12 bg-orange-500 rounded-lg flex items-center justify-center">
    <span className="text-white font-bold text-xs">OM</span>
  </div>
);

const MvolaLogo = () => (
  <div className="w-12 h-12 bg-green-600 rounded-lg flex items-center justify-center">
    <span className="text-white font-bold text-xs">MV</span>
  </div>
);

const AirtelMoneyLogo = () => (
  <div className="w-12 h-12 bg-red-500 rounded-lg flex items-center justify-center">
    <span className="text-white font-bold text-xs">AM</span>
  </div>
);

export default function InscriptionFormation() {
  const navigate = useNavigate();
  const { id: formationIdParam } = useParams();
  const { user } = useAuth();
  const [formation, setFormation] = useState(null);
  const [loading, setLoading] = useState(true);
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState({
    nom: '',
    prenom: '',
    email: '',
    telephone: '',
    dateNaissance: '',
    adresse: '',
    niveauEtude: '',
    motivation: ''
  });
  const [paymentMethod, setPaymentMethod] = useState('');
  const [paymentData, setPaymentData] = useState({
    phoneNumber: '',
    operator: '',
    transactionId: '',
    fraisScolarite: 0,
    methodeFraisScolarite: ''
  });
  const [processing, setProcessing] = useState(false);

  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const formationIdQuery = urlParams.get('formation');
    const formationId = formationIdParam || formationIdQuery;
    if (formationId) {
      fetchFormation(formationId);
    } else {
      const defaultFormation = {
        id: '1',
        titre: 'Formation Maritime',
        description: 'Formation complète en navigation maritime',
        duree: '40',
        niveau: 'Débutant',
        prix: 250000
      };
      setFormation(defaultFormation);
      setLoading(false);
    }
  }, []);

  const fetchFormation = async (id) => {
    try {
      console.log('Récupération de la formation ID:', id);
      const response = await API.get(`/formations/${id}`);
      console.log('Formation récupérée:', response.data);
      setFormation(response.data);
    } catch (error) {
      console.error('Erreur lors de la récupération de la formation:', error);
      
      // Créer une formation par défaut pour le test
      const defaultFormation = {
        id: id || '1',
        titre: 'Formation Test',
        description: 'Formation de test pour démonstration',
        duree: '40',
        niveau: 'Débutant',
        prix: 250000
      };
      
      console.log('Utilisation de la formation par défaut:', defaultFormation);
      setFormation(defaultFormation);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setProcessing(true);
    
    try {
      console.log('=== DÉBUT DE L\'INSCRIPTION ===');
      console.log('Données du formulaire:', formData);
      console.log('Données de paiement:', paymentData);
      console.log('Formation:', formation);
      console.log('ID de la formation:', formation?.id);

      // Vérifier si la formation existe
      if (!formation) {
        console.error('ERREUR: Aucune formation trouvée');
        alert('Aucune formation sélectionnée. Veuillez sélectionner une formation avant de continuer.');
        setProcessing(false);
        return;
      }

      if (!formation.id) {
        console.error('ERREUR: Formation sans ID');
        alert('Formation invalide. Veuillez réessayer.');
        setProcessing(false);
        return;
      }

      // Validation des champs requis
      if (!formData.nom || !formData.prenom || !formData.email || !formData.telephone) {
        console.error('ERREUR: Champs obligatoires manquants');
        alert('Veuillez remplir tous les champs obligatoires (nom, prénom, email, téléphone)');
        setProcessing(false);
        return;
      }

      if (!paymentMethod) {
        console.error('ERREUR: Méthode de paiement non sélectionnée');
        alert('Veuillez sélectionner une méthode de paiement');
        setProcessing(false);
        return;
      }

      if (paymentMethod === 'mobile' && (!paymentData.operator || !paymentData.phoneNumber)) {
        console.error('ERREUR: Détails Mobile Money manquants');
        alert('Veuillez remplir les détails du paiement Mobile Money');
        setProcessing(false);
        return;
      }

      if (!paymentData.fraisScolarite || paymentData.fraisScolarite <= 0) {
        console.error('ERREUR: Frais de scolarité invalides');
        alert('Veuillez spécifier un montant pour les frais de scolarité');
        setProcessing(false);
        return;
      }

      if (!paymentData.methodeFraisScolarite) {
        console.error('ERREUR: Méthode de paiement des frais non sélectionnée');
        alert('Veuillez sélectionner une méthode de paiement pour les frais de scolarité');
        setProcessing(false);
        return;
      }

      // Inscription à la formation
      const inscriptionData = {
        ...formData,
        formationId: formation.id,
        montant: (formation.prix || 0) + (paymentData.fraisScolarite || 0),
        fraisScolarite: paymentData.fraisScolarite,
        methodePaiement: paymentMethod,
        methodeFraisScolarite: paymentData.methodeFraisScolarite,
        statutPaiement: 'en_attente'
      };

      console.log('Données d\'inscription à envoyer:', inscriptionData);

      // VRAI APPEL API pour enregistrer dans la base de données
      console.log('Envoi de l\'inscription à l\'API...');
      const inscription = await API.post('/inscriptions', inscriptionData);
      console.log('Réponse de l\'API inscription:', inscription);
      
      // Si paiement mobile, créer la transaction
      if (paymentMethod === 'mobile') {
        console.log('Création de la transaction Mobile Money...');
        
        const paymentTransactionData = {
          inscriptionId: inscription.data.id,
          phoneNumber: paymentData.phoneNumber,
          operator: paymentData.operator,
          transactionId: paymentData.transactionId,
          montant: (formation.prix || 0) + (paymentData.fraisScolarite || 0),
          fraisScolarite: paymentData.fraisScolarite,
          devise: 'MGA',
          methodePaiement: paymentData.methodeFraisScolarite,
          statut: 'en_attente'
        };

        console.log('Données de transaction:', paymentTransactionData);
        
        // VRAI APPEL API pour enregistrer le paiement
        const paymentTransaction = await API.post('/paiements/mobile', paymentTransactionData);
        console.log('Réponse de l\'API paiement:', paymentTransaction);
        
        // Rediriger vers la page de confirmation
        console.log('Redirection vers la page de confirmation...');
        navigate('/inscription/confirmation', {
          state: {
            inscription: inscription.data,
            payment: paymentTransaction.data,
            formation
          }
        });
      } else {
        // Pour le paiement classique, enregistrer aussi dans la base
        console.log('Enregistrement du paiement classique...');
        
        const paiementClassiqueData = {
          inscriptionId: inscription.data.id,
          montant: (formation.prix || 0) + (paymentData.fraisScolarite || 0),
          fraisScolarite: paymentData.fraisScolarite,
          methodePaiement: 'classique',
          methodeFraisScolarite: paymentData.methodeFraisScolarite,
          devise: 'MGA',
          statut: 'en_attente'
        };

        console.log('Données de paiement classique:', paiementClassiqueData);
        
        // VRAI APPEL API pour enregistrer le paiement classique
        const paiementClassique = await API.post('/paiements/classique', paiementClassiqueData);
        console.log('Réponse de l\'API paiement classique:', paiementClassique);
        
        // Rediriger vers la page de confirmation (paiement classique enregistré)
        console.log('Redirection vers la page de confirmation (paiement classique)...');
        navigate('/inscription/confirmation', {
          state: {
            inscription: inscription.data,
            payment: paiementClassique.data,
            formation
          }
        });
      }
    } catch (error) {
      console.error('ERREUR LORS DE L\'INSCRIPTION:', error);
      console.error('Détails de l\'erreur:', error.message);
      console.error('Stack trace:', error.stack);
      
      // Afficher un message d'erreur plus détaillé
      const errorMessage = error.response?.data?.message || error.message || 'Une erreur est survenue lors de l\'inscription. Veuillez réessayer.';
      alert(errorMessage);
    } finally {
      setProcessing(false);
      console.log('=== FIN DE L\'INSCRIPTION ===');
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
        className="bg-gradient-to-r from-white to-blue-50 shadow-sm border-b border-blue-100"
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <button
                onClick={() => navigate('/dashboard')}
                className="p-2 rounded-lg border border-gray-200 text-gray-700 hover:text-blue-600 hover:border-blue-300 transition-colors"
                aria-label="Retour au dashboard"
              >
                <FiArrowLeft className="w-5 h-5" />
              </button>
              <div className="p-2 bg-blue-600 rounded-lg shadow-md">
                <FiBook className="text-white text-xl" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">Inscription</h1>
                <p className="text-sm text-gray-600">
                  {formation ? formation.titre : 'Choisissez une formation'}
                </p>
              </div>
            </div>
            {/* Progress indicator */}
            <div className="flex items-center space-x-2">
              {[1, 2, 3].map((s) => (
                <div
                  key={s}
                  className={`w-8 h-8 rounded-full flex items-center justify-center font-semibold ${
                    s <= step ? 'bg-gradient-to-br from-blue-600 to-indigo-600 text-white shadow-md' : 'bg-gray-200 text-gray-600'
                  }`}
                >
                  {s}
                </div>
              ))}
            </div>
          </div>
        </div>
      </motion.div>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Formation sélectionnée */}
        {formation && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white rounded-2xl shadow-md border border-blue-100 p-6 mb-8"
          >
            <div className="flex items-start justify-between">
              <div>
                <h2 className="text-xl font-bold text-gray-900 mb-2">{formation.titre}</h2>
                <p className="text-gray-600 mb-4">{formation.description}</p>
                <div className="flex items-center space-x-4 text-sm text-gray-500">
                  <span>Durée: {formation.duree}</span>
                  <span>Niveau: {formation.niveau}</span>
                </div>
              </div>
              <div className="text-right">
                <p className="text-sm text-gray-500">Prix</p>
                <p className="text-2xl font-bold text-blue-600">
                  {new Intl.NumberFormat('fr-MG', {
                    style: 'currency',
                    currency: 'MGA',
                    currencyDisplay: 'symbol'
                  }).format(formation.prix || 250000)}
                </p>
              </div>
            </div>
          </motion.div>
        )}

        {/* Étape 1: Informations personnelles */}
        {step === 1 && (
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="bg-white rounded-2xl shadow-md border border-blue-100 p-6"
          >
            <h3 className="text-lg font-semibold text-gray-900 mb-6">Informations personnelles</h3>
            <form onSubmit={(e) => { e.preventDefault(); setStep(2); }} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    <FiUser className="inline mr-2" />
                    Nom *
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.nom}
                    onChange={(e) => setFormData({...formData, nom: e.target.value})}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Prénom *
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.prenom}
                    onChange={(e) => setFormData({...formData, prenom: e.target.value})}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    <FiMail className="inline mr-2" />
                    Email *
                  </label>
                  <input
                    type="email"
                    required
                    value={formData.email}
                    onChange={(e) => setFormData({...formData, email: e.target.value})}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    <FiPhone className="inline mr-2" />
                    Téléphone *
                  </label>
                  <input
                    type="tel"
                    required
                    placeholder="034 XX XXX XX ou 032 XX XXX XX"
                    value={formData.telephone}
                    onChange={(e) => setFormData({...formData, telephone: e.target.value})}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
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

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
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
                    Niveau d'études
                  </label>
                  <select
                    value={formData.niveauEtude}
                    onChange={(e) => setFormData({...formData, niveauEtude: e.target.value})}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value="">Sélectionnez...</option>
                    <option value="bacc">Baccalauréat</option>
                    <option value="licence">Licence</option>
                    <option value="master">Master</option>
                    <option value="autre">Autre</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Motivation
                </label>
                <textarea
                  rows={4}
                  value={formData.motivation}
                  onChange={(e) => setFormData({...formData, motivation: e.target.value})}
                  placeholder="Pourquoi souhaitez-vous vous inscrire à cette formation ?"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>

              <div className="flex justify-end">
                <button
                  type="submit"
                  className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center space-x-2"
                >
                  <span>Continuer vers le paiement</span>
                  <FiArrowRight />
                </button>
              </div>
            </form>
          </motion.div>
        )}

        {/* Étape 2: Méthode de paiement */}
        {step === 2 && (
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            className="bg-white rounded-2xl shadow-md border border-blue-100 p-6"
          >
            <h3 className="text-lg font-semibold text-gray-900 mb-6">Choisissez votre méthode de paiement</h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
              {/* Paiement Mobile Money */}
              <motion.div
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => setPaymentMethod('mobile')}
                className={`border-2 rounded-xl p-6 cursor-pointer transition-all ${
                  paymentMethod === 'mobile' 
                    ? 'border-blue-500 bg-blue-50 shadow-sm' 
                    : 'border-gray-200 hover:border-gray-300'
                }`}
              >
                <div className="flex items-center justify-between mb-4">
                  <h4 className="font-semibold text-gray-900">Mobile Money</h4>
                  {paymentMethod === 'mobile' && (
                    <FiCheck className="w-5 h-5 text-blue-600" />
                  )}
                </div>
                <div className="flex items-center space-x-4 mb-4">
                  <OrangeMoneyLogo />
                  <MvolaLogo />
                  <AirtelMoneyLogo />
                </div>
                <p className="text-sm text-gray-600">
                  Paiement instantané via Orange Money (032), MVola (034) ou Airtel Money
                </p>
              </motion.div>

              {/* Paiement Classique */}
              <motion.div
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => setPaymentMethod('classic')}
                className={`border-2 rounded-xl p-6 cursor-pointer transition-all ${
                  paymentMethod === 'classic' 
                    ? 'border-blue-500 bg-blue-50 shadow-sm' 
                    : 'border-gray-200 hover:border-gray-300'
                }`}
              >
                <div className="flex items-center justify-between mb-4">
                  <h4 className="font-semibold text-gray-900">Paiement classique</h4>
                  {paymentMethod === 'classic' && (
                    <FiCheck className="w-5 h-5 text-blue-600" />
                  )}
                </div>
                <div className="flex items-center space-x-2 mb-4">
                  <FiCreditCard className="w-8 h-8 text-gray-600" />
                </div>
                <p className="text-sm text-gray-600">
                  Paiement par carte bancaire, virement bancaire ou espèces
                </p>
              </motion.div>
            </div>

            {/* Détails du paiement mobile */}
            {paymentMethod === 'mobile' && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="border-t pt-6"
              >
                <h4 className="font-semibold text-gray-900 mb-4">Détails du paiement Mobile Money</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Opérateur *
                      </label>
                      <select
                        required
                        value={paymentData.operator}
                        onChange={(e) => setPaymentData({...paymentData, operator: e.target.value})}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      >
                        <option value="">Sélectionnez...</option>
                        <option value="orange">Orange Money (032)</option>
                        <option value="mvola">MVola (034)</option>
                        <option value="airtel">Airtel Money</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Numéro de téléphone *
                      </label>
                      <input
                        type="tel"
                        required
                        placeholder="032 XX XXX XX"
                        value={paymentData.phoneNumber}
                        onChange={(e) => setPaymentData({...paymentData, phoneNumber: e.target.value})}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Référence transaction
                      </label>
                      <input
                        type="text"
                        value={paymentData.transactionId}
                        onChange={(e) => setPaymentData({...paymentData, transactionId: e.target.value})}
                        placeholder="Numéro de référence"
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      />
                    </div>
                  </div>
                  <div className="space-y-4 border-t pt-4">
                    <h5 className="font-semibold text-gray-900 mb-3">Frais de scolarité</h5>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Montant des frais *
                      </label>
                      <input
                        type="number"
                        required
                        min="0"
                        value={paymentData.fraisScolarite}
                        onChange={(e) => setPaymentData({...paymentData, fraisScolarite: parseFloat(e.target.value) || 0})}
                        placeholder="Ex: 25000"
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Méthode de paiement des frais
                      </label>
                      <select
                        value={paymentData.methodeFraisScolarite}
                        onChange={(e) => setPaymentData({...paymentData, methodeFraisScolarite: e.target.value})}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      >
                        <option value="">Sélectionnez...</option>
                        <option value="mobile">Mobile Money</option>
                        <option value="orange">Orange Money</option>
                        <option value="mvola">MVola</option>
                        <option value="airtel">Airtel Money</option>
                        <option value="virement">Virement bancaire</option>
                        <option value="especes">Espèces</option>
                      </select>
                    </div>
                  </div>
                </div>
              </motion.div>
            )}

            {/* Détails du paiement classique */}
            {paymentMethod === 'classic' && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="border-t pt-6"
              >
                <h4 className="font-semibold text-gray-900 mb-4">Détails du paiement classique</h4>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Montant de la formation
                    </label>
                    <div className="text-2xl font-bold text-blue-600">
                      {new Intl.NumberFormat('fr-MG', {
                        style: 'currency',
                        currency: 'MGA',
                        currencyDisplay: 'symbol'
                      }).format(formation.prix || 0)}
                    </div>
                  </div>
                  <div className="space-y-4 border-t pt-4">
                    <h5 className="font-semibold text-gray-900 mb-3">Frais de scolarité</h5>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Montant des frais *
                      </label>
                      <input
                        type="number"
                        required
                        min="0"
                        value={paymentData.fraisScolarite}
                        onChange={(e) => setPaymentData({...paymentData, fraisScolarite: parseFloat(e.target.value) || 0})}
                        placeholder="Ex: 25000"
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Méthode de paiement des frais
                      </label>
                      <select
                        value={paymentData.methodeFraisScolarite}
                        onChange={(e) => setPaymentData({...paymentData, methodeFraisScolarite: e.target.value})}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      >
                        <option value="">Sélectionnez...</option>
                        <option value="virement">Virement bancaire</option>
                        <option value="especes">Espèces</option>
                        <option value="cheque">Chèque bancaire</option>
                      </select>
                    </div>
                  </div>
                </div>
              </motion.div>
            )}

            <div className="flex justify-between mt-8">
              <button
                onClick={() => setStep(1)}
                className="px-6 py-3 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors"
              >
                Retour
              </button>
              <button
                onClick={() => setStep(3)}
                disabled={!paymentMethod}
                className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2"
              >
                <span>Confirmer l'inscription</span>
                <FiArrowRight />
              </button>
            </div>
          </motion.div>
        )}

        {/* Étape 3: Confirmation */}
        {step === 3 && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white rounded-xl shadow-sm border border-blue-100 p-6"
          >
            <div className="text-center mb-8">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <FiCheck className="w-8 h-8 text-green-600" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-2">Récapitulatif de l'inscription</h3>
              <p className="text-gray-600">Vérifiez vos informations avant de confirmer</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
              <div>
                <h4 className="font-semibold text-gray-900 mb-4">Informations personnelles</h4>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Nom:</span>
                    <span className="font-medium">{formData.nom} {formData.prenom}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Email:</span>
                    <span className="font-medium">{formData.email}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Téléphone:</span>
                    <span className="font-medium">{formData.telephone}</span>
                  </div>
                  {formData.adresse && (
                    <div className="flex justify-between">
                      <span className="text-gray-600">Adresse:</span>
                      <span className="font-medium">{formData.adresse}</span>
                    </div>
                  )}
                </div>
              </div>

              <div>
                <h4 className="font-semibold text-gray-900 mb-4">Détails du paiement</h4>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Formation:</span>
                    <span className="font-medium">{formation?.titre}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Montant formation:</span>
                    <span className="font-bold text-blue-600">
                      {formation && new Intl.NumberFormat('fr-MG', {
                        style: 'currency',
                        currency: 'MGA',
                        currencyDisplay: 'symbol'
                      }).format(formation.prix || 0)}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Frais de scolarité:</span>
                    <span className="font-bold text-orange-600">
                      {paymentData.fraisScolarite > 0 && new Intl.NumberFormat('fr-MG', {
                        style: 'currency',
                        currency: 'MGA',
                        currencyDisplay: 'symbol'
                      }).format(paymentData.fraisScolarite)}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Total à payer:</span>
                    <span className="font-bold text-green-600">
                      {formation && new Intl.NumberFormat('fr-MG', {
                        style: 'currency',
                        currency: 'MGA',
                        currencyDisplay: 'symbol'
                      }).format((formation.prix || 0) + (paymentData.fraisScolarite || 0))}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Méthode:</span>
                    <span className="font-medium">
                      {paymentMethod === 'mobile' ? 'Mobile Money' : 'Paiement classique'}
                    </span>
                  </div>
                  {paymentMethod === 'mobile' && paymentData.operator && (
                    <div className="flex justify-between">
                      <span className="text-gray-600">Opérateur:</span>
                      <span className="font-medium uppercase">{paymentData.operator}</span>
                    </div>
                  )}
                </div>
              </div>
            </div>

            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-8">
              <div className="flex items-start space-x-3">
                <FiAlertCircle className="w-5 h-5 text-blue-600 mt-0.5" />
                <div className="text-sm text-blue-800">
                  <p className="font-medium mb-1">Important:</p>
                  <ul className="list-disc list-inside space-y-1">
                    <li>L'inscription ne sera validée qu'après confirmation du paiement</li>
                    <li>Vous recevrez un email de confirmation dans les prochaines 24 heures</li>
                    <li>Pour le Mobile Money, assurez-vous d'avoir les fonds nécessaires</li>
                  </ul>
                </div>
              </div>
            </div>

            <form onSubmit={handleSubmit} className="flex justify-between">
              <button
                type="button"
                onClick={() => setStep(2)}
                className="px-6 py-3 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors"
              >
                Retour
              </button>
              <button
                type="submit"
                disabled={processing}
                className="px-8 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2"
              >
                {processing ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    <span>Traitement...</span>
                  </>
                ) : (
                  <>
                    <span>Confirmer et payer</span>
                    <FiArrowRight />
                  </>
                )}
              </button>
            </form>
          </motion.div>
        )}
      </div>
    </div>
  );
}
