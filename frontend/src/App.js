// src/App.js
import { Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { useAuth } from './contexts/AuthContext';
import Home from './pages/Home';
import Login from './pages/Login';
import Inscription from './pages/Inscription';
import InscriptionFormateur from './pages/InscriptionFormateur';
import DashboardApprenant from './pages/DashboardApprenant';
import CoursApprenant from './pages/apprenant/CoursApprenant';
import ProfileApprenant from './pages/apprenant/ProfileApprenant';
import EmploiDuTempsApprenant from './pages/apprenant/EmploiDuTempsApprenant';
import CreateFormation from './pages/CreateFormation';
import FormationDetails from './pages/FormationDetails';
import InscriptionFormation from './pages/InscriptionFormation';
import InscriptionConfirmation from './pages/InscriptionConfirmation';
import GoogleAuthCallback from './pages/GoogleAuthCallback';
import AdminLayout from './pages/admin/AdminLayout';
import DashboardAdmin from './pages/admin/DashboardAdmin';
import GestionFormations from './pages/admin/GestionFormations';
import GestionUsers from './pages/admin/GestionUsers';
import GestionInscriptions from './pages/admin/GestionInscriptions';
import AnnoncesFormateurs from './pages/admin/AnnoncesFormateurs';
import AnnoncesApprenants from './pages/admin/AnnoncesApprenants';
import AdminRoute from './components/AdminRoute';
import FormateurLayout from './pages/formateur/FormateurLayout';
import DashboardFormateur from './pages/formateur/DashboardFormateur';
import VerifyEmail from './pages/VerifyEmail';
import AjoutCoursFormateur from './pages/formateur/AjoutCoursFormateur';
import EmploiDuTemps from './pages/formateur/EmploiDuTemps';
import MesCours from './pages/formateur/MesCours';
import MarquagePresence from './pages/formateur/MarquagePresence';
import ProfilFormateur from './pages/formateur/ProfilFormateur';
import ConsulterAnnonces from './pages/formateur/ConsulterAnnonces';
import DetailCours from './pages/formateur/DetailCours';
import FormateurAteliers from './pages/formateur/FormateurAteliers';
import GestionCours from './pages/formateur/GestionCours';
import FormateurRoute from './components/FormateurRoute';
import EnAttenteValidation from './pages/EnAttenteValidation';
import EnAttenteValidationPage from './pages/EnAttenteValidationPage';
import ApprenantRoute from './components/ApprenantRoute';
import FormateurCodeVerification from './pages/FormateurCodeVerification';
import AteliersApprenant from './pages/AteliersApprenant';
import CertificationsApprenant from './pages/apprenant/CertificationsApprenant';
import GestionAteliers from './pages/admin/GestionAteliers';
import ApprenantLayout from './pages/apprenant/ApprenantLayout';
import MessagerieAdmin from './components/MessagerieAdmin';
import AnnoncesApprenant from './pages/apprenant/AnnoncesApprenant';
import Formations from './pages/Formations';

function App() {
  const { isAuthenticated, loading, user } = useAuth();
  const location = useLocation();

  // Afficher un indicateur de chargement pendant la vérification de l'authentification
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  // Ne pas afficher la Navbar normale pour les routes admin, formateur et étudiant (ils ont leur propre navigation)
  const isAdminRoute = location.pathname.startsWith('/admin');
  const isFormateurRoute = location.pathname.startsWith('/formateur');
  const isEtudiantRoute = location.pathname.startsWith('/etudiant');
  const isLoginRoute = location.pathname === '/login';

  return (
    <div className="min-h-screen bg-gray-100">
      <main className={isAuthenticated && !isAdminRoute && !isFormateurRoute && !isEtudiantRoute ? "container mx-auto px-4 py-8" : ""}>
        <Routes>
          {/* Route racine - Toujours afficher la page d'accueil */}
          <Route path="/" element={<Home />} />
          <Route 
            path="/login" 
            element={
              isAuthenticated ? (
                <Navigate 
                  to={
                    user?.role === 'admin' ? '/admin' :
                    user?.role === 'formateur' ? '/formateur/code' :
                    user?.role === 'apprenant' ? '/dashboard' : '/dashboard'
                  } 
                  replace 
                />
              ) : (
                <Login />
              )
            } 
          />
          <Route 
            path="/inscription" 
            element={
              !isAuthenticated ? (
                <Inscription />
              ) : (
                <Navigate 
                  to={
                    user?.role === 'admin' ? '/admin' :
                    user?.role === 'formateur' ? '/formateur/code' :
                    user?.role === 'apprenant' ? '/dashboard' : '/dashboard'
                  } 
                  replace 
                />
              )
            } 
          />
          <Route 
            path="/inscription-formateur" 
            element={
              !isAuthenticated ? (
                <InscriptionFormateur />
              ) : (
                <Navigate 
                  to={
                    user?.role === 'admin' ? '/admin' :
                    user?.role === 'formateur' ? '/formateur/code' :
                    user?.role === 'apprenant' ? '/dashboard' : '/dashboard'
                  } 
                  replace 
                />
              )
            } 
          />
          <Route 
            path="/en-attente" 
            element={<EnAttenteValidation />} 
          />
          <Route 
            path="/en-attente-validation" 
            element={<EnAttenteValidationPage />} 
          />
          <Route 
            path="/formateur/code" 
            element={<FormateurCodeVerification />} 
          />
          <Route 
            path="/verify-email" 
            element={<VerifyEmail />} 
          />
          <Route 
            path="/auth/google/success" 
            element={<GoogleAuthCallback />} 
          />
          {/* Routes publiques */}
          {/* Routes Apprenant */}
          <Route 
            element={
              <ApprenantRoute>
                <ApprenantLayout />
              </ApprenantRoute>
            }
          >
            <Route path="/dashboard" element={<DashboardApprenant />} />
            <Route path="/cours-apprenant" element={<CoursApprenant />} />
            <Route path="/profile-apprenant" element={<ProfileApprenant />} />
            <Route path="/emploi-du-temps-apprenant" element={<EmploiDuTempsApprenant />} />
            <Route path="/formations" element={<Formations />} />
            <Route path="/ateliers" element={<AteliersApprenant />} />
            <Route path="/certifications" element={<CertificationsApprenant />} />
            <Route path="/annonces-apprenant" element={<AnnoncesApprenant />} />
          </Route>

          {/* Routes protégées par authentification */}
          <Route 
            path="/create-formation" 
            element={
              <ApprenantRoute>
                <CreateFormation />
              </ApprenantRoute>
            } 
          />
          <Route 
            path="/formation/:id" 
            element={<FormationDetails />} 
          />
          <Route 
            path="/inscription/:id" 
            element={
              <ApprenantRoute>
                <InscriptionFormation />
              </ApprenantRoute>
            } 
          />
          <Route 
            path="/inscription" 
            element={
              <ApprenantRoute>
                <InscriptionFormation />
              </ApprenantRoute>
            } 
          />
          <Route 
            path="/inscription/confirmation" 
            element={
              <ApprenantRoute>
                <InscriptionConfirmation />
              </ApprenantRoute>
            } 
          />
          {/* Routes Admin */}
          <Route 
            path="/admin" 
            element={
              <AdminRoute>
                <AdminLayout />
              </AdminRoute>
            }
          >
            <Route index element={<DashboardAdmin />} />
            <Route path="formations" element={<GestionFormations />} />
            <Route path="users" element={<GestionUsers />} />
            <Route path="inscriptions" element={<GestionInscriptions />} />
            <Route path="ateliers" element={<GestionAteliers />} />
            <Route path="messagerie" element={<MessagerieAdmin />} />
            <Route path="annonces-formateurs" element={<AnnoncesFormateurs />} />
            <Route path="annonces-apprenants" element={<AnnoncesApprenants />} />
          </Route>
          {/* Routes Formateur */}
          <Route 
            path="/formateur" 
            element={
              <FormateurRoute>
                <FormateurLayout />
              </FormateurRoute>
            }
          >
            <Route index element={<DashboardFormateur />} />
            <Route path="ajout-cours" element={<AjoutCoursFormateur />} />
            <Route path="gestion-cours" element={<GestionCours />} />
            <Route path="emploi-du-temps" element={<EmploiDuTemps />} />
            <Route path="cours" element={<MesCours />} />
            <Route path="cours/:id" element={<DetailCours />} />
            <Route path="presence" element={<MarquagePresence />} />
            <Route path="presence/:id" element={<MarquagePresence />} />
            <Route path="cours/:id/presence" element={<MarquagePresence />} />
            <Route path="ateliers" element={<FormateurAteliers />} />
            <Route path="ateliers/:id" element={<FormateurAteliers />} />
            <Route path="annonces" element={<ConsulterAnnonces />} />
            <Route path="profil" element={<ProfilFormateur />} />
          </Route>
          <Route
            path="/"
            element={
              <Home />
            } 
          />
          <Route 
            path="*" 
            element={
              <Navigate 
                 to={
                 user?.role === 'admin' ? '/admin' :
                 user?.role === 'formateur' ? '/formateur/code' :
                 user?.role === 'apprenant' ? '/dashboard' : '/dashboard'
                  } 
               replace 
               />
            } 
          />
        </Routes>
      </main>
    </div>
  );
}

export default App;
