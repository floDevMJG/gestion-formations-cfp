import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import API from '../../services/api';

export default function DetailCours() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [cours, setCours] = useState(null);
  const [eleves, setEleves] = useState([]);
  const [presences, setPresences] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchCoursDetails();
  }, [id]);

  const fetchCoursDetails = async () => {
    try {
      const [coursRes, elevesRes, presencesRes] = await Promise.all([
        API.get('/cours/formateur').then(res => res.data.find(c => c.id === parseInt(id))),
        API.get(`/formateur/cours/${id}/eleves`),
        API.get(`/formateur/cours/${id}/presences`)
      ]);
      
      setCours(coursRes);
      setEleves(elevesRes.data);
      setPresences(presencesRes.data);
    } catch (error) {
      console.error('Erreur:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <div className="p-6">Chargement...</div>;
  }

  if (!cours) {
    return (
      <div className="p-6">
        <p>Cours non trouvé</p>
        <button onClick={() => navigate('/formateur/cours')} className="mt-4 px-4 py-2 bg-purple-600 text-white rounded-lg">
          Retour
        </button>
      </div>
    );
  }

  const getStatutBadge = (statut) => {
    const styles = {
      'present': 'bg-green-100 text-green-800',
      'absent': 'bg-red-100 text-red-800',
      'retard': 'bg-yellow-100 text-yellow-800',
      'justifie': 'bg-blue-100 text-blue-800'
    };
    const labels = {
      'present': 'Présent',
      'absent': 'Absent',
      'retard': 'Retard',
      'justifie': 'Justifié'
    };
    return (
      <span className={`px-2 py-1 rounded text-xs ${styles[statut] || 'bg-gray-100'}`}>
        {labels[statut] || statut}
      </span>
    );
  };

  return (
    <div className="p-6">
      <button
        onClick={() => navigate('/formateur/cours')}
        className="mb-6 flex items-center text-purple-600 hover:text-purple-800"
      >
        <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
        </svg>
        Retour aux cours
      </button>

      <div className="bg-white rounded-lg shadow-md p-6 mb-6">
        <h1 className="text-3xl font-bold text-gray-800 mb-4">{cours.titre || cours.Formation?.titre}</h1>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div>
            <p className="text-sm text-gray-600">Formation</p>
            <p className="font-semibold">{cours.Formation?.titre}</p>
          </div>
          <div>
            <p className="text-sm text-gray-600">Date</p>
            <p className="font-semibold">{new Date(cours.date).toLocaleDateString('fr-FR')}</p>
          </div>
          <div>
            <p className="text-sm text-gray-600">Heure</p>
            <p className="font-semibold">
              {cours.heureDebut?.substring(0, 5)} - {cours.heureFin?.substring(0, 5)}
            </p>
          </div>
          <div>
            <p className="text-sm text-gray-600">Salle</p>
            <p className="font-semibold">{cours.salle || '-'}</p>
          </div>
        </div>
        {cours.description && (
          <div className="mt-4">
            <p className="text-sm text-gray-600">Description</p>
            <p className="mt-1">{cours.description}</p>
          </div>
        )}
      </div>

      <div className="bg-white rounded-lg shadow-md p-6">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-semibold">Liste des élèves et présences</h2>
          <button
            onClick={() => navigate(`/formateur/cours/${id}/presence`)}
            className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700"
          >
            Marquer présence
          </button>
        </div>
        
        <div className="space-y-3">
          {eleves.map((eleve) => {
            const presence = presences.find(p => p.userId === eleve.id);
            return (
              <div
                key={eleve.id}
                className="flex items-center justify-between p-4 border rounded-lg"
              >
                <div className="flex items-center">
                  <div className="w-10 h-10 rounded-full bg-purple-100 flex items-center justify-center mr-4">
                    <span className="text-purple-600 font-semibold">
                      {eleve.nom?.[0]}{eleve.prenom?.[0]}
                    </span>
                  </div>
                  <div>
                    <p className="font-semibold">{eleve.nom} {eleve.prenom}</p>
                    <p className="text-sm text-gray-600">{eleve.email}</p>
                  </div>
                </div>
                <div>
                  {presence ? (
                    getStatutBadge(presence.statut)
                  ) : (
                    <span className="px-2 py-1 rounded text-xs bg-gray-100 text-gray-800">
                      Non marqué
                    </span>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
