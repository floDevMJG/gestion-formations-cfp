import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Calendar, CheckCircle, DollarSign, Clock, BookOpen, UserCheck } from 'lucide-react';
import API from '../../services/api';

// Composant de carte de statistiques
const StatCard = ({ title, value, icon, color }) => (
  <div className="bg-white p-6 rounded-xl shadow-lg hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-1 border-l-4 border-blue-500">
    <div className="flex items-center justify-between">
      <div>
        <p className="text-sm font-medium text-gray-500">{title}</p>
        <p className="text-2xl font-bold text-gray-800">{value}</p>
      </div>
      <div className={`p-3 rounded-full ${color} bg-opacity-20`}>
        {React.cloneElement(icon, { className: 'w-6 h-6 text-blue-600' })}
      </div>
    </div>
  </div>
);

// Composant de la prochaine session
const ProchaineSession = ({ session }) => {
  if (!session) return null;
  
  return (
    <div className="bg-white p-6 rounded-xl shadow-lg">
      <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center">
        <Clock className="w-5 h-5 mr-2 text-blue-600" />
        Prochaine session
      </h3>
      <div className="space-y-3">
        <div className="flex items-center">
          <BookOpen className="w-4 h-4 text-gray-500 mr-2" />
          <span className="text-gray-700">{session.formation?.titre || 'Formation'}</span>
        </div>
        <div className="flex items-center">
          <Calendar className="w-4 h-4 text-gray-500 mr-2" />
          <span className="text-gray-700">
            {new Date(session.dateDebut).toLocaleDateString('fr-FR', {
              weekday: 'long',
              year: 'numeric',
              month: 'long',
              day: 'numeric',
              hour: '2-digit',
              minute: '2-digit'
            })}
          </span>
        </div>
        <div className="flex items-center">
          <UserCheck className="w-4 h-4 text-gray-500 mr-2" />
          <span className="text-gray-700">Avec {session.formateur?.nom || 'le formateur'}</span>
        </div>
      </div>
    </div>
  );
};

// Composant de la liste des formations disponibles
const FormationsDisponibles = ({ formations, onInscription }) => (
  <div className="bg-white p-6 rounded-xl shadow-lg">
    <h3 className="text-lg font-semibold text-gray-800 mb-4">Formations disponibles</h3>
    <div className="space-y-4">
      {formations.map((formation) => (
        <div key={formation.id} className="border-b pb-4 last:border-0">
          <div className="flex justify-between items-center">
            <div>
              <h4 className="font-medium text-gray-800">{formation.titre}</h4>
              <p className="text-sm text-gray-500">{formation.description?.substring(0, 100)}...</p>
            </div>
            <button
              onClick={() => onInscription(formation.id)}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              S'inscrire
            </button>
          </div>
        </div>
      ))}
    </div>
  </div>
);

const DashboardEtudiant = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    formationsInscrites: 0,
    presence: 0,
    paiements: 0,
    prochaineSession: null,
    formationsDisponibles: []
  });

  // Charger les données de l'étudiant
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        // Récupérer les inscriptions de l'étudiant
        const inscriptions = await API.get('/etudiant/inscriptions');
        // Récupérer les formations disponibles
        const formations = await API.get('/formations/disponibles');
        // Récupérer la prochaine session
        const prochaineSession = await API.get('/etudiant/prochaine-session');
        // Calculer les statistiques
        const presence = inscriptions.data.reduce((acc, curr) => acc + (curr.presence || 0), 0);
        const paiements = inscriptions.data.reduce((acc, curr) => acc + (curr.montantPaye || 0), 0);

        setStats({
          formationsInscrites: inscriptions.data.length,
          presence: Math.round((presence / (inscriptions.data.length * 10)) * 100) || 0,
          paiements,
          prochaineSession: prochaineSession.data,
          formationsDisponibles: formations.data
        });
      } catch (error) {
        console.error('Erreur lors du chargement des données:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  // Gérer l'inscription à une formation
  const handleInscription = async (formationId) => {
    try {
      await API.post('/etudiant/inscription', { formationId });
      // Recharger les données
      navigate(0);
    } catch (error) {
      console.error("Erreur lors de l'inscription:", error);
      alert("Une erreur est survenue lors de l'inscription");
    }
  };

  // Gérer la présence
  const handlePresence = async (sessionId) => {
    try {
      await API.post('/etudiant/marquer-presence', { sessionId });
      // Recharger les données
      navigate(0);
    } catch (error) {
      console.error("Erreur lors de la mise à jour de la présence:", error);
      alert("Une erreur est survenue lors de la mise à jour de votre présence");
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        <h1 className="text-2xl font-bold text-gray-800 mb-8">Tableau de bord étudiant</h1>
        
        {/* Cartes de statistiques */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <StatCard 
            title="Formations suivies" 
            value={stats.formationsInscrites} 
            icon={<BookOpen />} 
            color="bg-blue-100"
          />
          <StatCard 
            title="Taux de présence" 
            value={`${stats.presence}%`} 
            icon={<CheckCircle />} 
            color="bg-green-100"
          />
          <StatCard 
            title="Total payé" 
            value={`${stats.paiements} €`} 
            icon={<DollarSign />} 
            color="bg-purple-100"
          />
          <StatCard 
            title="Prochaine séance" 
            value={stats.prochaineSession ? 'Aujourd\'hui' : 'Aucune'} 
            icon={<Calendar />} 
            color="bg-yellow-100"
          />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Colonne de gauche */}
          <div className="lg:col-span-2 space-y-6">
            {/* Prochaine session */}
            <ProchaineSession session={stats.prochaineSession} />
            
            {/* Liste des formations disponibles */}
            <FormationsDisponibles 
              formations={stats.formationsDisponibles} 
              onInscription={handleInscription}
            />
          </div>

          {/* Colonne de droite */}
          <div className="space-y-6">
            {/* Carte de présence */}
            <div className="bg-white p-6 rounded-xl shadow-lg">
              <h3 className="text-lg font-semibold text-gray-800 mb-4">Marquer ma présence</h3>
              {stats.prochaineSession ? (
                <div className="space-y-4">
                  <p className="text-gray-600">Séance de {stats.prochaineSession.formation?.titre}</p>
                  <button
                    onClick={() => handlePresence(stats.prochaineSession.id)}
                    className="w-full py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
                  >
                    Je suis présent(e)
                  </button>
                </div>
              ) : (
                <p className="text-gray-500">Aucune séance à venir</p>
              )}
            </div>

            {/* Derniers paiements */}
            <div className="bg-white p-6 rounded-xl shadow-lg">
              <h3 className="text-lg font-semibold text-gray-800 mb-4">Derniers paiements</h3>
              <div className="space-y-3">
                <div className="flex justify-between items-center p-2 hover:bg-gray-50 rounded">
                  <div>
                    <p className="font-medium">Formation Développement Web</p>
                    <p className="text-sm text-gray-500">12/01/2024</p>
                  </div>
                  <span className="font-bold text-green-600">500 €</span>
                </div>
                <div className="flex justify-between items-center p-2 hover:bg-gray-50 rounded">
                  <div>
                    <p className="font-medium">Frais d'inscription</p>
                    <p className="text-sm text-gray-500">05/01/2024</p>
                  </div>
                  <span className="font-bold text-green-600">100 €</span>
                </div>
              </div>
              <button className="mt-4 w-full py-2 border border-blue-600 text-blue-600 rounded-lg hover:bg-blue-50 transition-colors">
                Voir tous les paiements
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DashboardEtudiant;
