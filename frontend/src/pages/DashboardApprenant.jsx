import React, { useEffect, useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../contexts/AuthContext';
import API from '../services/api';
import { 
  FiBook,
  FiClock,
  FiCheckCircle,
  FiTrendingUp,
  FiUser,
  FiAward,
  FiCalendar,
  FiStar,
  FiPlay,
  FiTarget,
  FiDownload,
  FiHome,
  FiMenu,
  FiBell,
  FiChevronDown,
  FiPlus,
  FiLogOut,
  FiMessageSquare,
  FiSettings,
  FiHelpCircle,
  FiBarChart2,
  FiCalendar as FiCalendarIcon,
  FiBookOpen,
  FiLayers,
  FiCheck,
  FiAlertTriangle,
  FiChevronRight,
  FiX,
  FiChevronDown as FiChevronDownIcon,
  FiDollarSign,
  FiCreditCard
} from 'react-icons/fi';
import { FaShip, FaGraduationCap, FaFilePdf, FaRegCalendarAlt } from 'react-icons/fa';

// Composant de navigation dans le menu
const NavItem = ({ icon, text, active, onClick, badge, className = '' }) => {
  return (
    <button
      onClick={onClick}
      className={`flex items-center justify-between w-full px-4 py-3 text-sm font-medium rounded-lg transition-colors duration-200 ${
        active 
          ? 'bg-blue-100 text-blue-700 font-semibold' 
          : 'text-gray-700 hover:bg-gray-100'
      } ${className}`}
    >
      <div className="flex items-center">
        <span className="mr-3 text-lg">{icon}</span>
        <span>{text}</span>
      </div>
      {badge && (
        <span className="bg-blue-100 text-blue-800 text-xs font-semibold px-2 py-0.5 rounded-full">
          {badge}
        </span>
      )}
    </button>
  );
};

// Composant de carte de statistiques
const StatsCard = ({ title, value, icon, color, subtitle, trend, trendValue }) => {
  const trendColor = trend === 'up' ? 'text-green-500' : trend === 'down' ? 'text-red-500' : 'text-gray-500';
  const trendIcon = trend === 'up' ? '↑' : trend === 'down' ? '↓' : '→';
  
  return (
    <motion.div 
      className="p-6 rounded-2xl shadow-lg bg-white/60 backdrop-blur border border-white/30 hover:shadow-xl transition-all duration-300"
      whileHover={{ y: -4 }}
    >
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <h3 className="text-xs font-semibold text-gray-600 tracking-wide">{title}</h3>
          <p className="mt-1 text-3xl font-extrabold text-gray-900">{value}</p>
          <div className="flex items-center mt-2">
            {trend && (
              <span className={`text-xs font-medium ${trendColor} flex items-center mr-2`}>
                {trendIcon} {trendValue}
              </span>
            )}
            <p className="text-xs text-gray-500">{subtitle}</p>
          </div>
        </div>
        <div className={`p-3 rounded-xl ${color} ring-1 ring-white/50`}>
          {icon}
        </div>
      </div>
    </motion.div>
  );
};

// Composant de carte de formation
const FormationCard = ({ formation, type = 'default' }) => {
  const getStatusBadge = (status) => {
    switch(status) {
      case 'en_cours':
        return <span className="bg-blue-100 text-blue-800 text-xs font-semibold px-2.5 py-0.5 rounded-full">En cours</span>;
      case 'termine':
        return <span className="bg-green-100 text-green-800 text-xs font-semibold px-2.5 py-0.5 rounded-full">Terminé</span>;
      case 'en_attente':
        return <span className="bg-yellow-100 text-yellow-800 text-xs font-semibold px-2.5 py-0.5 rounded-full">En attente</span>;
      default:
        return <span className="bg-gray-100 text-gray-800 text-xs font-semibold px-2.5 py-0.5 rounded-full">Inscrit</span>;
    }
  };

  const getTypeBadge = (type) => {
    switch(type) {
      case 'recommandee':
        return <span className="bg-purple-100 text-purple-800 text-xs font-semibold px-2 py-0.5 rounded-full flex items-center">
          <FiStar className="mr-1 w-3 h-3" /> Recommandée
        </span>;
      case 'nouvelle':
        return <span className="bg-green-100 text-green-800 text-xs font-semibold px-2 py-0.5 rounded-full">Nouvelle</span>;
      default:
        return null;
    }
  };

  return (
    <motion.div 
      className="bg-white rounded-xl shadow-sm overflow-hidden border border-gray-100 hover:shadow-md transition-all duration-300 h-full flex flex-col"
      whileHover={{ y: -5 }}
    >
      <div className="h-40 bg-gray-100 relative overflow-hidden">
        {formation.image ? (
          <img 
            src={formation.image} 
            alt={formation.titre} 
            className="w-full h-full object-cover transform hover:scale-105 transition-transform duration-500"
          />
        ) : (
          <div className="w-full h-full bg-gradient-to-r from-blue-500 to-purple-600 flex items-center justify-center">
            <FaGraduationCap className="w-12 h-12 text-white opacity-90" />
          </div>
        )}
        {type === 'recommandee' && (
          <div className="absolute top-2 right-2">
            {getTypeBadge('recommandee')}
          </div>
        )}
        {type === 'nouvelle' && (
          <div className="absolute top-2 right-2">
            {getTypeBadge('nouvelle')}
          </div>
        )}
      </div>
      
      <div className="p-5 flex-1 flex flex-col">
        <div className="flex justify-between items-start mb-2">
          <h4 className="font-bold text-gray-800 line-clamp-2">{formation.titre}</h4>
          {formation.status && getStatusBadge(formation.status)}
        </div>
        
        <p className="text-sm text-gray-600 mb-4 line-clamp-2 flex-1">
          {formation.description || 'Aucune description disponible pour cette formation.'}
        </p>
        
        {formation.progress !== undefined && (
          <div className="mb-3">
            <div className="flex justify-between text-xs text-gray-500 mb-1">
              <span>Progression</span>
              <span>{formation.progress}%</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div 
                className="bg-blue-600 h-2 rounded-full transition-all duration-500 ease-out"
                style={{ width: `${formation.progress}%` }}
              ></div>
            </div>
          </div>
        )}
        
        <div className="flex justify-between items-center mt-auto pt-3 border-t border-gray-100">
          <div className="flex items-center text-xs text-gray-500">
            <FiClock className="mr-1" />
            <span>{formation.duree || 0}h</span>
            {formation.niveau && (
              <span className="ml-2 px-2 py-0.5 bg-gray-100 rounded-full text-gray-600">
                {formation.niveau}
              </span>
            )}
          </div>
          
          <Link 
            to={`/formation/${formation.id}`}
            className="inline-flex items-center px-3 py-1.5 bg-blue-50 text-blue-700 text-sm font-medium rounded-lg hover:bg-blue-100 transition-colors duration-200"
          >
            {formation.status ? 'Continuer' : 'Découvrir'}
            <FiChevronRight className="ml-1 w-4 h-4" />
          </Link>
        </div>
      </div>
    </motion.div>
  );
};

// Composant de notification
const NotificationItem = ({ icon, title, description, time, isRead = false, onClick }) => {
  return (
    <div 
      className={`p-3 rounded-lg ${!isRead ? 'bg-blue-50' : 'bg-white'} hover:bg-gray-50 transition-colors duration-200 cursor-pointer`}
      onClick={onClick}
    >
      <div className="flex">
        <div className="flex-shrink-0 mr-3">
          <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center text-blue-600">
            {icon}
          </div>
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-sm font-medium text-gray-900 truncate">{title}</p>
          <p className="text-sm text-gray-500 line-clamp-2">{description}</p>
          <div className="mt-1 flex items-center text-xs text-gray-400">
            <FiClock className="mr-1 w-3 h-3" />
            {time}
          </div>
        </div>
        {!isRead && (
          <div className="ml-2 flex-shrink-0">
            <div className="w-2 h-2 bg-blue-600 rounded-full"></div>
          </div>
        )}
      </div>
    </div>
  );
};

// Composant d'échéance
const EcheanceItem = ({ titre, type, date, formation, reste, urgent }) => {
  const getTypeIcon = (type) => {
    switch(type) {
      case 'devoir':
        return <FiBook className="text-blue-500" />;
      case 'examen':
        return <FiAward className="text-red-500" />;
      case 'projet':
        return <FiTarget className="text-purple-500" />;
      default:
        return <FiCalendar className="text-gray-500" />;
    }
  };

  return (
    <div className="p-3 bg-white rounded-lg border border-gray-100 hover:shadow-sm transition-shadow duration-200">
      <div className="flex items-start">
        <div className="flex-shrink-0 mr-3 mt-0.5">
          <div className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center">
            {getTypeIcon(type)}
          </div>
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-sm font-medium text-gray-900 truncate">{titre}</p>
          <p className="text-xs text-gray-500">{formation}</p>
          <div className="mt-1 flex items-center justify-between">
            <span className="text-xs text-gray-500">
              <FiCalendar className="inline mr-1 w-3 h-3" />
              {date}
            </span>
            <span className={`text-xs font-medium ${urgent ? 'text-red-500' : 'text-gray-500'}`}>
              {urgent ? 'Urgent' : `Échéance dans ${reste}`}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default function DashboardApprenant() {
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const [formations, setFormations] = useState([]);
  const [formationsInscrites, setFormationsInscrites] = useState([]);
  const [toutesLesFormations, setToutesLesFormations] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [activeTab, setActiveTab] = useState('dashboard');
  const [showNotifications, setShowNotifications] = useState(false);
  const [showUserMenu, setShowUserMenu] = useState(false);
  
  // États pour les notifications
  const [notifications, setNotifications] = useState([
    {
      id: 1,
      title: 'Nouveau cours disponible',
      description: 'Le cours "Navigation avancée" est maintenant disponible dans votre espace de formation.',
      time: 'Il y a 2h',
      icon: <FiBookOpen className="w-4 h-4" />,
      isRead: false
    },
    {
      id: 2,
      title: 'Rappel de formation',
      description: 'Votre prochaine session de formation commence demain à 10h00.',
      time: 'Il y a 1 jour',
      icon: <FiCalendarIcon className="w-4 h-4" />,
      isRead: true
    },
    {
      id: 3,
      title: 'Mise à jour du contenu',
      description: 'De nouvelles ressources ont été ajoutées à votre formation en cours.',
      time: 'Il y a 3 jours',
      icon: <FiLayers className="w-4 h-4" />,
      isRead: true
    }
  ]);

  // Statistiques du tableau de bord
  const [stats, setStats] = useState({
    totalFormations: 0,
    formationsEnCours: 0,
    formationsTerminees: 0,
    progressionMoyenne: 0,
    heuresFormation: 0,
    objectifsAtteints: 0,
    badgesObtenus: 0,
    prochainCours: 'Aucun cours prévu'
  });
  const [inscriptionsRaw, setInscriptionsRaw] = useState([]);
  const [paiements, setPaiements] = useState([]);
  const [loadingPaiements, setLoadingPaiements] = useState(true);
  
  // Formations recommandées avec des données plus détaillées
  const formationsRecommandees = [
    ...toutesLesFormations.slice(0, 2).map(f => ({ ...f, type: 'recommandee' })),
    ...toutesLesFormations.slice(2, 3).map(f => ({ ...f, type: 'nouvelle' }))
  ];
  
  // Prochaines échéances
  const prochainesEcheances = [
    {
      id: 1,
      titre: 'Devoir de navigation',
      type: 'devoir',
      date: '15/06/2023',
      formation: 'Navigation avancée',
      reste: '3 jours',
      urgent: true
    },
    {
      id: 2,
      titre: 'Examen final',
      type: 'examen',
      date: '20/06/2023',
      formation: 'Mécanique navale',
      reste: '8 jours',
      urgent: false
    },
    {
      id: 3,
      titre: 'Rendu de projet',
      type: 'projet',
      date: '25/06/2023',
      formation: 'Conception navale',
      reste: '13 jours',
      urgent: false
    }
  ];
  
  // Objectifs d'apprentissage
  const objectifsApprentissage = [
    { id: 1, libelle: 'Maîtriser les bases de la navigation', progression: 85 },
    { id: 2, libelle: 'Connaître les règles de sécurité en mer', progression: 65 },
    { id: 3, libelle: 'Apprendre la mécanique des moteurs marins', progression: 45 },
    { id: 4, libelle: 'Gérer les situations d\'urgence', progression: 30 }
  ];
  
  // Dernières activités
  const dernieresActivites = [
    { id: 1, action: 'A terminé le chapitre "Navigation de nuit"', date: 'Il y a 2 heures', formation: 'Navigation avancée' },
    { id: 2, action: 'A soumis le devoir "Météorologie de base"', date: 'Il y a 1 jour', formation: 'Météorologie marine' },
    { id: 3, action: 'A commencé le cours "Moteurs marins"', date: 'Il y a 2 jours', formation: 'Mécanique navale' },
    { id: 4, action: 'A obtenu le badge "Navigateur confirmé"', date: 'Il y a 3 jours', formation: 'Navigation avancée' }
  ];
  
  // Badges obtenus
  const badgesObtenus = [
    { id: 1, nom: 'Navigateur débutant', description: 'A complété les bases de la navigation', icone: '🏆', date: '10/06/2023' },
    { id: 2, nom: 'Mécanicien en herbe', description: 'A réussi le module mécanique de base', icone: '🔧', date: '05/06/2023' },
    { id: 3, nom: 'Étudiant assidu', description: 'A suivi 10h de formation en une semaine', icone: '📚', date: '01/06/2023' }
  ];
  
  // Calendrier des événements
  const evenementsCalendrier = [
    { id: 1, titre: 'Session en direct: Navigation de nuit', date: '15/06/2023', heure: '18:00', type: 'live' },
    { id: 2, titre: 'Atelier pratique: Entretien moteur', date: '18/06/2023', heure: '14:00', type: 'atelier' },
    { id: 3, titre: 'Examen final', date: '25/06/2023', heure: '09:00', type: 'examen' }
  ];
  
  const unreadNotifications = notifications.filter(n => !n.isRead).length;

  useEffect(() => {
    if (user?.id) {
      fetchData();
    } else {
      setIsLoading(false);
      setLoadingPaiements(false);
    }
  }, [user?.id]);

  const fetchData = async () => {
    if (!user?.id) return;
    
    setIsLoading(true);
    setLoadingPaiements(true);
    let inscriptionsEtudiantLocal = [];
    try {
      const [formationsResponse, inscriptionsResponse] = await Promise.all([
        API.get(`/formations?userId=${user.id}`),
        API.get(`/etudiants/${user.id}/inscriptions`)
      ]);

      const toutesLesFormations = Array.isArray(formationsResponse.data) ? formationsResponse.data : [];
      const inscriptionsEtudiant = Array.isArray(inscriptionsResponse.data) ? inscriptionsResponse.data : [];
      inscriptionsEtudiantLocal = inscriptionsEtudiant;
      setInscriptionsRaw(inscriptionsEtudiant);

      const formationsDisponibles = toutesLesFormations.filter(f => !f.estInscrit);
      setFormations(formationsDisponibles);
      setToutesLesFormations(toutesLesFormations);
      
      const formationsAvecDetails = inscriptionsEtudiant.map(inscription => ({
        id: inscription.formationId || inscription.id,
        titre: inscription.titre || 'Formation inconnue',
        description: inscription.description || '',
        duree: inscription.duree ?? '0',
        niveau: inscription.niveau || 'Non spécifié',
        image: inscription.image || null,
        progress: Number(inscription.progression) || 0,
        status: inscription.statut || inscription.statutPaiement || 'en_attente',
        dateInscription: inscription.dateInscription
      }));
      
      setFormationsInscrites(formationsAvecDetails);

      const enCours = inscriptionsEtudiant.filter(i => 
        (i.statutPaiement === 'paye' || i.statut === 'validee' || i.statut === 'en_cours') && i.statut !== 'termine'
      ).length;
      const terminees = inscriptionsEtudiant.filter(i => i.statut === 'termine').length;
      const progressionMoyenne = inscriptionsEtudiant.length > 0
        ? Math.round(inscriptionsEtudiant.reduce((acc, i) => acc + (Number(i.progression) || 0), 0) / inscriptionsEtudiant.length)
        : 0;

      setStats({
        totalFormations: toutesLesFormations.length,
        formationsEnCours: enCours || inscriptionsEtudiant.length,
        formationsTerminees: terminees,
        progressionMoyenne
      });
    } catch (error) {
      console.error('Erreur lors du chargement des données:', error.response?.data || error.message);
      
      const mockInscriptions = [
        { id: 1, titre: "Formation Charpentier de Marine", description: "Apprenez les techniques de base de la charpenterie navale", duree: "40", progress: 75, status: 'en_cours' },
        { id: 2, titre: "Électronique Maritime", description: "Maîtrisez les systèmes électroniques des bateaux", duree: "30", progress: 100, status: 'termine' }
      ];
      
      setFormationsInscrites(mockInscriptions);
      setStats({
        totalFormations: 0,
        formationsEnCours: mockInscriptions.filter(f => f.status === 'en_cours').length,
        formationsTerminees: mockInscriptions.filter(f => f.status === 'termine').length,
        progressionMoyenne: 58
      });
    }
    try {
      const p = await API.get('/paiements/historique');
      const data = p.data?.data || [];
      let list = data.slice(0, 5);
      if (list.length === 0 && Array.isArray(inscriptionsEtudiantLocal) && inscriptionsEtudiantLocal.length > 0) {
        const fallback = inscriptionsEtudiantLocal
          .filter(i => i.statutPaiement === 'paye' || i.statut === 'validee' || i.statut === 'en_cours')
          .map(i => ({
            id: `ins-${i.id}`,
            methode: (i.methodePaiement || '').toLowerCase() === 'especes' ? 'especes' : 'mobile',
            montant: i.montant || 0,
            createdAt: i.dateInscription
          }));
        list = fallback.slice(0, 5);
      }
      setPaiements(list);
    } catch {
      setPaiements([]);
    } finally {
      setLoadingPaiements(false);
    }
    setIsLoading(false);
  };

  // Fonction pour gérer la déconnexion
  const handleLogout = async () => {
    try {
      await logout();
      navigate('/login');
    } catch (error) {
      console.error('Erreur lors de la déconnexion:', error);
    }
  };

  return (
    <div className="min-h-screen w-full bg-white">

      {/* Main content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Page content */}
        <main className="flex-1 overflow-y-auto p-6 md:p-10">
          <div className="space-y-8">
            <div className="relative overflow-hidden rounded-3xl p-6 md:p-8 bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 text-white shadow-xl">
              <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-2xl bg-white/20 backdrop-blur flex items-center justify-center">
                    <FiUser className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <h2 className="text-2xl md:text-3xl font-extrabold">Bonjour, {user?.prenom}</h2>
                    <p className="text-white/80 text-sm mt-1">
                      {new Date().toLocaleDateString('fr-FR', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => navigate('/formations')}
                  className="inline-flex items-center px-5 py-2.5 bg-white text-blue-700 rounded-xl hover:bg-blue-50 transition-all shadow-lg"
                >
                  <FiPlus className="w-4 h-4 mr-2" />
                  <span>Nouvelle formation</span>
                </button>
              </div>
              <div className="absolute -top-10 -right-10 w-48 h-48 bg-white/10 rounded-full blur-2xl" />
              <div className="absolute -bottom-12 -left-12 w-56 h-56 bg-white/10 rounded-full blur-3xl" />
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <StatsCard 
                title="Formations en cours" 
                value={stats.formationsEnCours}
                subtitle="En apprentissage"
                icon={<FiBook className="w-6 h-6 text-blue-600" />}
                color="bg-blue-100"
              />
              <StatsCard 
                title="Formations terminées" 
                value={stats.formationsTerminees}
                subtitle="Achevées avec succès"
                icon={<FiCheckCircle className="w-6 h-6 text-green-600" />}
                color="bg-green-100"
              />
              <StatsCard 
                title="Progression moyenne" 
                value={`${stats.progressionMoyenne}%`}
                subtitle="Taux d'avancement"
                icon={<FiTrendingUp className="w-6 h-6 text-purple-600" />}
                color="bg-purple-100"
              />
              <StatsCard
                title="Total formations"
                value={stats.totalFormations}
                subtitle="Disponibles"
                icon={<FiBook className="w-6 h-6 text-orange-600" />}
                color="bg-orange-100"
              />
            </div>

            {/* Formations en cours */}
            <div className="mb-8">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-xl font-bold text-gray-800">Mes formations en cours</h3>
                <button 
                  onClick={() => navigate('/formations')}
                  className="text-sm text-blue-700 hover:text-blue-900 font-semibold"
                >
                  Voir tout
                </button>
              </div>
              
              {isLoading ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {[1, 2, 3].map(i => (
                    <div key={i} className="bg-white/60 backdrop-blur rounded-2xl shadow-lg p-6 border border-white/30 animate-pulse">
                      <div className="h-6 bg-gray-200 rounded w-3/4 mb-4"></div>
                      <div className="h-4 bg-gray-100 rounded w-full mb-2"></div>
                      <div className="h-4 bg-gray-100 rounded w-5/6 mb-4"></div>
                      <div className="h-2 bg-gray-100 rounded-full w-full mb-2"></div>
                      <div className="flex justify-between text-sm mt-4">
                        <div className="h-4 bg-gray-100 rounded w-1/4"></div>
                        <div className="h-4 bg-gray-100 rounded w-1/4"></div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : formationsInscrites.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {formationsInscrites.slice(0, 3).map(formation => (
                    <FormationCard 
                      key={formation.id} 
                      formation={formation} 
                    />
                  ))}
                </div>
              ) : (
                <div className="bg-white/70 backdrop-blur rounded-2xl shadow-lg p-10 text-center border border-white/30">
                  <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <FiBook className="w-8 h-8 text-blue-600" />
                  </div>
                  <h4 className="text-lg font-medium text-gray-800 mb-2">Aucune formation en cours</h4>
                  <p className="text-gray-600 mb-6">Commencez une nouvelle formation pour démarrer votre apprentissage</p>
                  <button
                    onClick={() => navigate('/formations')}
                    className="px-6 py-2 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-all shadow-md"
                  >
                    Explorer les formations
                  </button>
                </div>
              )}
            </div>

            {/* Toutes les formations */}
            <div>
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-xl font-bold text-gray-800">Toutes les formations</h3>
                <button 
                  onClick={() => navigate('/formations')}
                  className="text-sm text-blue-700 hover:text-blue-900 font-semibold"
                >
                  Voir tout
                </button>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {formationsRecommandees.length === 0 ? (
                  <div className="col-span-full bg-white/70 backdrop-blur rounded-2xl shadow-lg p-10 text-center border border-white/30">
                    <p className="text-gray-600">Aucune formation disponible pour le moment.</p>
                  </div>
                ) : formationsRecommandees.map(formation => (
                  <div 
                    key={formation.id || formation.titre}
                    className="bg-white/70 backdrop-blur rounded-2xl shadow-lg overflow-hidden border border-white/30 hover:shadow-xl transition-all duration-300"
                  >
                    <div className="h-40 bg-gray-100 relative overflow-hidden">
                      <div className="absolute inset-0 bg-gradient-to-r from-blue-500 to-purple-600 opacity-70"></div>
                      <div className="absolute bottom-4 left-4">
                        <span className="bg-white text-blue-600 text-xs font-semibold px-3 py-1 rounded-full">
                          {formation.niveau}
                        </span>
                      </div>
                    </div>
                    <div className="p-5">
                      <h4 className="font-bold text-gray-800 mb-2">{formation.titre}</h4>
                      <p className="text-sm text-gray-600 mb-4 line-clamp-2">{formation.description}</p>
                      <div className="flex justify-between items-center">
                        <span className="text-sm text-gray-500">
                          <FiClock className="inline mr-1" /> {formation.duree || 0}h
                        </span>
                        <button 
                          onClick={() => navigate(`/formation/${formation.id}`, { state: { fromDashboard: true } })}
                          className="text-sm font-semibold text-blue-700 hover:text-blue-900"
                        >
                          En savoir plus
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="mt-8">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-xl font-bold text-gray-800 flex items-center">
                <FiDollarSign className="mr-2 text-green-600" /> Historique des paiements
              </h3>
              <Link to="/profile-apprenant" className="text-sm text-blue-600 hover:text-blue-700 font-medium">
                Voir mon profil
              </Link>
            </div>
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <div className="lg:col-span-2 rounded-2xl shadow-lg border border-white/30 p-6 bg-white/70 backdrop-blur">
                {loadingPaiements ? (
                  <div className="flex items-center justify-center py-8">
                    <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-green-600"></div>
                  </div>
                ) : paiements.length === 0 ? (
                  <div className="text-center py-8">
                    <FiCreditCard className="text-4xl text-gray-300 mx-auto mb-3" />
                    <p className="text-gray-500">Aucun paiement trouvé</p>
                  </div>
                ) : (
                  <ul className="divide-y divide-gray-100">
                    {paiements.map((p) => (
                      <li key={p.id} className="py-3 flex items-center justify-between hover:bg-gray-50 px-2 rounded-lg hover-lift">
                        <div className="flex items-center">
                          <div className="w-9 h-9 rounded-full bg-green-100 flex items-center justify-center text-green-600 mr-3">
                            <FiDollarSign />
                          </div>
                          <div>
                            <p className="font-medium text-gray-900">
                              {p.methode === 'especes' ? 'Paiement classique' : 'Mobile Money'}
                            </p>
                            <p className="text-xs text-gray-500">
                              {new Date(p.createdAt || p.date).toLocaleDateString('fr-FR')}
                            </p>
                          </div>
                        </div>
                        <span className="font-bold text-green-600">
                          {p.montant ? `${p.montant} Ar` : '—'}
                        </span>
                      </li>
                    ))}
                  </ul>
                )}
              </div>
              <div className="rounded-2xl shadow-lg border border-white/30 p-6 bg-white/70 backdrop-blur">
                <h4 className="font-semibold text-gray-800 mb-3">Statut actuel</h4>
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-green-100 rounded-lg">
                    <FiDollarSign className="w-5 h-5 text-green-600" />
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Total paiements</p>
                    <p className="font-bold">
                      {paiements.reduce((acc, cur) => acc + (cur.montant || 0), 0)} Ar
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
};
