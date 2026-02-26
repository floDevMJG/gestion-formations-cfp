// Mise à jour du composant PaiementModal.jsx
import React, { useState } from 'react';
import { X, CreditCard, Smartphone, CheckCircle } from 'lucide-react';

const PaiementModal = ({ isOpen, onClose, formation, onPaiementSuccess }) => {
  const [montant, setMontant] = useState(formation?.fraisInscription || 0);
  const [etape, setEtape] = useState(1);
  const [paiementReussi, setPaiementReussi] = useState(false);
  const [modePaiement, setModePaiement] = useState('mobile');
  const [operateur, setOperateur] = useState('orange');
  const [numeroTelephone, setNumeroTelephone] = useState('');
  const [codeConfirmation, setCodeConfirmation] = useState('');

  // États pour le suivi du processus de paiement
  const [envoiCode, setEnvoiCode] = useState(false);
  const [codeEnvoye, setCodeEnvoye] = useState(false);
  const [verificationCode, setVerificationCode] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Simulation d'envoi de code de confirmation
    if (!codeEnvoye) {
      setEnvoiCode(true);
      // Simuler l'envoi du code
      setTimeout(() => {
        setEnvoiCode(false);
        setCodeEnvoye(true);
      }, 2000);
      return;
    }

    // Vérification du code
    if (codeEnvoye && !verificationCode) {
      setVerificationCode(true);
      // Simuler la vérification du code
      setTimeout(() => {
        setPaiementReussi(true);
        setEtape(2);
        // Appeler la fonction de succès après un délai
        setTimeout(() => {
          onPaiementSuccess({
            formationId: formation.id,
            montant,
            date: new Date().toISOString(),
            reference: `PAY-${operateur.toUpperCase()}-${Date.now()}`,
            methode: operateur
          });
          onClose();
        }, 2000);
      }, 1500);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    
    if (name === 'numeroTelephone') {
      // Nettoyer le numéro et limiter aux chiffres
      const cleaned = value.replace(/\D/g, '').substring(0, 10);
      setNumeroTelephone(cleaned);
    } else if (name === 'codeConfirmation') {
      // Limiter à 6 chiffres pour le code de confirmation
      const cleaned = value.replace(/\D/g, '').substring(0, 6);
      setCodeConfirmation(cleaned);
    }
  };

  const formatNumeroTelephone = (numero) => {
    if (!numero) return '';
    // Formater le numéro selon l'opérateur
    if (operateur === 'orange') {
      return numero.replace(/(\d{2})(\d{2})(\d{2})(\d{2})/, '$1 $2 $33 $44');
    } else if (operateur === 'mvola') {
      return numero.replace(/(\d{2})(\d{2})(\d{3})(\d{2})/, '$1 $2 $33 $44');
    } else if (operateur === 'airtel') {
      return numero.replace(/(\d{2})(\d{2})(\d{2})(\d{2})/, '$1 $2 $33 $44');
    }
    return numero;
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-xl w-full max-w-md overflow-hidden">
        {/* En-tête */}
        <div className="flex justify-between items-center p-4 border-b">
          <h3 className="text-xl font-semibold text-gray-800">
            {etape === 1 ? 'Paiement mobile' : 'Paiement réussi'}
          </h3>
          <button 
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Contenu */}
        <div className="p-6">
          {etape === 1 ? (
            <form onSubmit={handleSubmit}>
              <div className="mb-6">
                <div className="flex justify-between items-center mb-4">
                  <h4 className="text-sm font-medium text-gray-700">Formation</h4>
                  <span className="text-sm font-medium">{formation?.titre}</span>
                </div>
                <div className="flex justify-between items-center mb-4">
                  <h4 className="text-sm font-medium text-gray-700">Montant à payer</h4>
                  <div className="flex items-center">
                    <input
                      type="number"
                      value={montant}
                      onChange={(e) => setMontant(parseFloat(e.target.value) || 0)}
                      className="w-24 px-2 py-1 border rounded text-right"
                      min="0"
                      step="100"
                    />
                    <span className="ml-2">MGA</span>
                  </div>
                </div>
                <div className="border-t my-4"></div>
                <div className="flex justify-between items-center font-semibold">
                  <span>Total</span>
                  <span>{montant.toLocaleString()} MGA</span>
                </div>
              </div>

              <div className="mb-6">
                <h4 className="text-sm font-medium text-gray-700 mb-3">Moyen de paiement</h4>
                
                {/* Sélecteur d'opérateur */}
                <div className="grid grid-cols-3 gap-3 mb-4">
                  <button
                    type="button"
                    className={`p-3 border rounded-lg flex flex-col items-center ${
                      operateur === 'orange' 
                        ? 'border-orange-500 bg-orange-50' 
                        : 'border-gray-200'
                    }`}
                    onClick={() => setOperateur('orange')}
                  >
                    <img 
                      src="/orange-money-logo.png" 
                      alt="Orange Money" 
                      className="h-8 mb-1"
                    />
                    <span className="text-xs mt-1">Orange Money</span>
                  </button>
                  
                  <button
                    type="button"
                    className={`p-3 border rounded-lg flex flex-col items-center ${
                      operateur === 'mvola' 
                        ? 'border-purple-500 bg-purple-50' 
                        : 'border-gray-200'
                    }`}
                    onClick={() => setOperateur('mvola')}
                  >
                    <img 
                      src="/mvola-logo.png" 
                      alt="Mvola" 
                      className="h-8 mb-1"
                    />
                    <span className="text-xs mt-1">Mvola</span>
                  </button>
                  
                  <button
                    type="button"
                    className={`p-3 border rounded-lg flex flex-col items-center ${
                      operateur === 'airtel' 
                        ? 'border-red-500 bg-red-50' 
                        : 'border-gray-200'
                    }`}
                    onClick={() => setOperateur('airtel')}
                  >
                    <img 
                      src="/airtel-money-logo.png" 
                      alt="Airtel Money" 
                      className="h-8 mb-1"
                    />
                    <span className="text-xs mt-1">Airtel Money</span>
                  </button>
                </div>

                {/* Formulaire de paiement mobile */}
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Numéro de téléphone
                    </label>
                    <div className="mt-1 relative rounded-md shadow-sm">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <span className="text-gray-500 sm:text-sm">
                          {operateur === 'orange' ? '034' : 
                           operateur === 'mvola' ? '032' : '033'}
                        </span>
                      </div>
                      <input
                        type="tel"
                        name="numeroTelephone"
                        value={formatNumeroTelephone(numeroTelephone)}
                        onChange={handleInputChange}
                        placeholder={operateur === 'orange' ? '34 12 345 67' : 
                                     operateur === 'mvola' ? '32 123 45 67' : '33 12 345 67'}
                        className="focus:ring-blue-500 focus:border-blue-500 block w-full pl-12 pr-12 sm:text-sm border-gray-300 rounded-md py-2"
                        required
                      />
                    </div>
                  </div>

                  {codeEnvoye && (
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Code de confirmation
                      </label>
                      <input
                        type="text"
                        name="codeConfirmation"
                        value={codeConfirmation}
                        onChange={handleInputChange}
                        placeholder="Entrez le code reçu"
                        className="mt-1 focus:ring-blue-500 focus:border-blue-500 block w-full shadow-sm sm:text-sm border-gray-300 rounded-md py-2 px-3"
                        required
                      />
                      <p className="mt-1 text-xs text-gray-500">
                        Un code de confirmation a été envoyé à votre numéro
                      </p>
                    </div>
                  )}
                </div>

                <div className="mt-6 bg-yellow-50 border-l-4 border-yellow-400 p-4">
                  <div className="flex">
                    <div className="flex-shrink-0">
                      <svg className="h-5 w-5 text-yellow-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                      </svg>
                    </div>
                    <div className="ml-3">
                      <p className="text-sm text-yellow-700">
                        Assurez-vous que votre compte {operateur === 'orange' ? 'Orange Money' : 
                                                      operateur === 'mvola' ? 'Mvola' : 'Airtel Money'} 
                        est suffisamment approvisionné pour effectuer ce paiement.
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              <div className="flex justify-end space-x-3">
                <button
                  type="button"
                  onClick={onClose}
                  className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                >
                  Annuler
                </button>
                <button
                  type="submit"
                  className={`px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white ${
                    envoiCode || verificationCode
                      ? 'bg-blue-400'
                      : 'bg-blue-600 hover:bg-blue-700'
                  } focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500`}
                  disabled={envoiCode || verificationCode}
                >
                  {envoiCode ? (
                    'Envoi en cours...'
                  ) : verificationCode ? (
                    'Vérification...'
                  ) : codeEnvoye ? (
                    'Confirmer le paiement'
                  ) : (
                    `Payer ${montant.toLocaleString()} MGA`
                  )}
                </button>
              </div>
            </form>
          ) : (
            <div className="text-center py-8">
              <div className="mx-auto flex items-center justify-center h-16 w-16 rounded-full bg-green-100 mb-4">
                <CheckCircle className="h-10 w-10 text-green-600" />
              </div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">Paiement effectué avec succès !</h3>
              <p className="text-sm text-gray-500 mb-6">
                Votre inscription à la formation a été confirmée. Vous recevrez une notification par SMS.
              </p>
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              >
                Retour au tableau de bord
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default PaiementModal;