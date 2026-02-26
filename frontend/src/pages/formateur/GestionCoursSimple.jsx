import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import API from '../../services/api';
import { useAuth } from '../../contexts/AuthContext';

export default function GestionCoursSimple() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [cours, setCours] = useState([]);
  const [formations, setFormations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    console.log('🚀 Composant GestionCoursSimple monté');
    console.log('👤 Utilisateur:', user);
    
    if (user?.role !== 'formateur' && user?.role !== 'admin') {
      console.log('❌ Utilisateur non autorisé, redirection');
      navigate('/dashboard');
      return;
    }
    
    fetchData();
  }, [user, navigate]);

  const fetchData = async () => {
    try {
      console.log('🔄 Chargement des données...');
      
      // Récupérer les cours
      const coursRes = await API.get('/cours');
      console.log('✅ Cours récupérés:', coursRes.data.length);
      setCours(coursRes.data);
      
      // Récupérer les formations
      const formationsRes = await API.get('/formations');
      console.log('✅ Formations récupérées:', formationsRes.data.length);
      setFormations(formationsRes.data);
      
    } catch (error) {
      console.error('❌ Erreur lors du chargement:', error);
      setError(error.message || 'Erreur de chargement');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
          <p className="text-gray-600">Chargement des cours...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <div className="bg-white p-8 rounded-lg shadow-lg max-w-md">
          <h2 className="text-red-600 text-xl font-bold mb-4">Erreur de chargement</h2>
          <p className="text-gray-600 mb-4">{error}</p>
          <button 
            onClick={() => window.location.reload()}
            className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
          >
            Réessayer
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="bg-white rounded-lg shadow p-6">
          <h1 className="text-2xl font-bold text-gray-800 mb-6">Gestion des Cours</h1>
          
          <div className="mb-6">
            <button
              onClick={() => navigate('/formateur/ajout-cours')}
              className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
            >
              Ajouter un cours
            </button>
          </div>

          <div className="mb-4">
            <p className="text-gray-600">
              {cours.length} cours trouvés - {formations.length} formations disponibles
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {cours.map((cour) => (
              <div key={cour.id} className="border rounded-lg p-4 hover:shadow-lg transition-shadow">
                <h3 className="font-semibold text-lg mb-2">{cour.titre}</h3>
                <p className="text-gray-600 text-sm mb-2">{cour.description}</p>
                <div className="text-sm text-gray-500">
                  <p>Formation: {cour.formation?.titre || 'N/A'}</p>
                  <p>Formateur: {cour.Formateur?.nom} {cour.Formateur?.prenom}</p>
                  <p>Type: {cour.type}</p>
                  {cour.fichierNom && <p>Fichier: {cour.fichierNom}</p>}
                </div>
                <div className="mt-4 flex space-x-2">
                  {cour.fichierUrl && (
                    <button
                      onClick={() => {
                        const apiBase = (API.defaults?.baseURL || '').replace(/\/api\/?$/, '');
                        const cleanPath = String(cour.fichierUrl).replace(/^\/+/, '');
                        window.open(`${apiBase}/${cleanPath}`, '_blank');
                      }}
                      className="bg-green-500 text-white px-3 py-1 rounded text-sm hover:bg-green-600"
                    >
                      Télécharger
                    </button>
                  )}
                  <button
                    onClick={() => navigate(`/formateur/ajout-cours?id=${cour.id}`)}
                    className="bg-yellow-500 text-white px-3 py-1 rounded text-sm hover:bg-yellow-600"
                  >
                    Modifier
                  </button>
                  <button
                    onClick={() => {
                      if (window.confirm('Supprimer ce cours ?')) {
                        API.delete(`/cours/${cour.id}`).then(() => {
                          setCours(cours.filter(c => c.id !== cour.id));
                        }).catch(err => console.error('Erreur suppression:', err));
                      }
                    }}
                    className="bg-red-500 text-white px-3 py-1 rounded text-sm hover:bg-red-600"
                  >
                    Supprimer
                  </button>
                </div>
              </div>
            ))}
          </div>

          {cours.length === 0 && (
            <div className="text-center py-12">
              <p className="text-gray-500">Aucun cours trouvé</p>
              <button
                onClick={() => navigate('/formateur/ajout-cours')}
                className="mt-4 bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
              >
                Ajouter votre premier cours
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
