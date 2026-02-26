import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { FaShip, FaTools, FaHammer, FaDraftingCompass, FaPaintBrush, FaHardHat } from 'react-icons/fa';
import API from '../services/api';

// Données des formations pour le CFP Charpenterie Marine
const formations = [
  {
    id: 1,
    titre: 'Charpenterie Marine – Construction Navale',
    objectif: 'Former des techniciens capables de construire des embarcations en bois.',
    contenu: [
      'Lecture de plans maritimes',
      'Traçage et découpe du bois',
      'Assemblage de coques',
      'Techniques traditionnelles et modernes',
      'Sécurité en atelier'
    ],
    duree: '6 mois',
    niveau: 'Débutant',
    places: 15,
    image: 'https://images.unsplash.com/photo-1602143407153-3a5dba70d6b9?ixlib=rb-4.0.3&auto=format&fit=crop&w=500&q=60'
  },
  {
    id: 2,
    titre: 'Réparation et Maintenance des Bateaux',
    objectif: 'Assurer l\'entretien et la réparation des bateaux en bois.',
    contenu: [
      'Diagnostic des dégâts',
      'Remplacement des pièces en bois',
      'Étanchéité et calfatage',
      'Entretien de la coque',
      'Maintenance préventive'
    ],
    duree: '5 mois',
    niveau: 'Intermédiaire',
    places: 12,
    image: 'https://images.unsplash.com/photo-1566054299481-41c4b4a1ab4e?ixlib=rb-4.0.3&auto=format&fit=crop&w=500&q=60'
  },
  {
    id: 3,
    titre: 'Menuiserie Navale',
    objectif: 'Former à la fabrication d\'éléments en bois pour bateaux.',
    contenu: [
      'Aménagement intérieur (cabines, bancs)',
      'Portes, coffres, ponts',
      'Finition et vernissage',
      'Travail du bois marin'
    ],
    duree: '4 mois',
    niveau: 'Intermédiaire',
    places: 10,
    image: 'https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?ixlib=rb-4.0.3&auto=format&fit=crop&w=500&q=60'
  },
  {
    id: 4,
    titre: 'Dessin Technique et Lecture de Plans',
    objectif: 'Comprendre et réaliser des plans de construction navale.',
    contenu: [
      'Dessin technique manuel',
      'Introduction aux logiciels de dessin',
      'Lecture de plans de bateaux',
      'Cotation et échelles'
    ],
    duree: '3 mois',
    niveau: 'Débutant',
    places: 15,
    image: 'https://images.unsplash.com/photo-1542744173-8e7e53415bb0?ixlib=rb-4.0.3&auto=format&fit=crop&w=500&q=60'
  },
  {
    id: 5,
    titre: 'Traitement et Protection du Bois Marin',
    objectif: 'Protéger le bois contre l\'eau, les insectes et le vieillissement.',
    contenu: [
      'Types de bois marins',
      'Produits de traitement',
      'Vernis et peintures marines',
      'Techniques de conservation'
    ],
    duree: '2 mois',
    niveau: 'Tous niveaux',
    places: 20,
    image: 'https://images.unsplash.com/photo-1593111774244-6bf5ffe10fb3?ixlib=rb-4.0.3&auto=format&fit=crop&w=500&q=60'
  },
  {
    id: 6,
    titre: 'Sécurité et Hygiène en Atelier Naval',
    objectif: 'Réduire les risques professionnels.',
    contenu: [
      'Utilisation sécurisée des outils',
      'Équipements de protection individuelle',
      'Prévention des accidents',
      'Normes de sécurité maritime'
    ],
    duree: '1 mois',
    niveau: 'Obligatoire',
    places: 25,
    image: 'https://images.unsplash.com/photo-1581093196270-5a1f8ac5570b?ixlib=rb-4.0.3&auto=format&fit=crop&w=500&q=60'
  }
];

const iconFor = (titre) => {
  const t = (titre || '').toLowerCase();
  if (t.includes('charpenterie') || t.includes('construction navale')) return <FaShip className="w-16 h-16 text-white" />;
  if (t.includes('réparation') || t.includes('maintenance')) return <FaTools className="w-16 h-16 text-white" />;
  if (t.includes('menuiserie')) return <FaHammer className="w-16 h-16 text-white" />;
  if (t.includes('dessin') || t.includes('plans')) return <FaDraftingCompass className="w-16 h-16 text-white" />;
  if (t.includes('traitement') || t.includes('protection')) return <FaPaintBrush className="w-16 h-16 text-white" />;
  if (t.includes('sécurité') || t.includes('hygiène')) return <FaHardHat className="w-16 h-16 text-white" />;
  return <FaShip className="w-16 h-16 text-white" />;
};

const FormationCard = ({ formation }) => (
  <motion.div
    className="bg-white rounded-xl shadow-lg overflow-hidden hover:shadow-xl transition-shadow duration-300 border border-gray-100"
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    whileHover={{ y: -5 }}
  >
    <div className="h-48 overflow-hidden bg-gradient-to-r from-blue-600 to-indigo-700 flex items-center justify-center">
      {iconFor(formation.titre)}
    </div>
    <div className="p-6">
      <div className="flex justify-between items-start">
        <h3 className="text-xl font-bold text-gray-800 mb-2">{formation.titre}</h3>
        <span className={`px-3 py-1 rounded-full text-xs font-medium ${
          formation.niveau === 'Débutant' ? 'bg-blue-100 text-blue-800' :
          formation.niveau === 'Intermédiaire' ? 'bg-yellow-100 text-yellow-800' :
          formation.niveau === 'Obligatoire' ? 'bg-red-100 text-red-800' :
          'bg-green-100 text-green-800'
        }`}>
          {formation.niveau}
        </span>
      </div>
      
      <div className="mt-3">
        <p className="text-blue-600 font-medium mb-2">Description :</p>
        <p className="text-gray-700 mb-4">{formation.description || formation.objectif || 'Aucune description disponible.'}</p>
        <div className="text-sm text-gray-500 flex items-center space-x-4">
          <span>Durée: {formation.duree || '—'}</span>
          {(typeof formation.places !== 'undefined' || typeof formation.placesDisponibles !== 'undefined') && (
            <span>Places: {formation.placesDisponibles ?? formation.places}</span>
          )}
        </div>
      </div>
      
      <div className="mt-4 pt-4 border-t border-gray-100 flex justify-between items-center">
        <div className="flex items-center text-sm text-gray-500">
          <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          {formation.duree}
        </div>
        <div className="flex items-center text-sm text-gray-500">
          <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
          </svg>
          {(formation.placesDisponibles ?? formation.places) ? `${formation.placesDisponibles ?? formation.places} places disponibles` : ''}
        </div>
      </div>
      
      <Link 
        to={`/formation/${formation.id}`}
        className="mt-4 w-full bg-blue-600 hover:bg-blue-700 text-white text-center py-2 px-4 rounded-md transition-colors duration-200 block"
      >
        En savoir plus
      </Link>
    </div>
  </motion.div>
);

export default function Formations() {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedLevel, setSelectedLevel] = useState('Tous');
  const [items, setItems] = useState(formations);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const load = async () => {
      try {
        setLoading(true);
        const res = await API.get('/formations');
        const list = Array.isArray(res.data) ? res.data : [];
        setItems(list.length ? list : formations);
      } catch {
        setItems(formations);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  const filteredFormations = items.filter(formation => {
    const matchesSearch = formation.titre.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         (formation.objectif || formation.description || '').toLowerCase().includes(searchTerm.toLowerCase());
    const matchesLevel = selectedLevel === 'Tous' || formation.niveau === selectedLevel;
    return matchesSearch && matchesLevel;
  });

  const levels = ['Tous', 'Débutant', 'Intermédiaire', 'Avancé', 'Tous niveaux', 'Obligatoire'];

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="text-center mb-12"
        >
          <h1 className="text-4xl font-extrabold text-gray-900 sm:text-5xl sm:tracking-tight lg:text-6xl mb-4">
            Nos Formations
          </h1>
          <div className="w-24 h-1.5 bg-blue-600 mx-auto mb-6"></div>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Découvrez notre gamme de formations professionnelles en charpenterie marine
          </p>
        </motion.div>

        {/* Filtres */}
        <div className="mb-12 bg-white p-6 rounded-xl shadow-md">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label htmlFor="search" className="block text-sm font-medium text-gray-700 mb-1">
                Rechercher une formation
              </label>
              <input
                type="text"
                id="search"
                placeholder="Rechercher par nom ou description..."
                className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <div>
              <label htmlFor="level" className="block text-sm font-medium text-gray-700 mb-1">
                Niveau
              </label>
              <select
                id="level"
                className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                value={selectedLevel}
                onChange={(e) => setSelectedLevel(e.target.value)}
              >
                {levels.map(level => (
                  <option key={level} value={level}>
                    {level === 'Tous' ? 'Tous les niveaux' : level}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {loading ? (
          <div className="bg-white p-8 rounded-xl shadow-sm text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-4 border-blue-600 border-t-transparent mx-auto mb-4"></div>
            <p className="text-gray-600">Chargement des formations...</p>
          </div>
        ) : filteredFormations.length === 0 ? (
          <div className="bg-white p-8 rounded-xl shadow-sm text-center">
            <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <h3 className="mt-2 text-lg font-medium text-gray-900">Aucune formation trouvée</h3>
            <p className="mt-1 text-gray-500">Aucune formation ne correspond à vos critères de recherche.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-8">
            {filteredFormations.map((formation, index) => (
              <motion.div
                key={formation.id}
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, delay: index * 0.1 }}
              >
                <FormationCard formation={formation} />
              </motion.div>
            ))}
          </div>
        )}

        {/* Section d'appel à l'action */}
        <motion.div 
          className="mt-16 bg-blue-700 rounded-xl p-8 text-white"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
        >
          <div className="max-w-3xl mx-auto text-center">
            <h2 className="text-2xl font-bold mb-4">Vous ne trouvez pas la formation idéale ?</h2>
            <p className="mb-6 text-blue-100">Notre équipe est à votre disposition pour vous conseiller et créer un programme sur mesure adapté à vos besoins.</p>
            <Link
              to="/contact"
              className="inline-flex items-center px-6 py-3 border border-transparent text-base font-medium rounded-md text-blue-700 bg-white hover:bg-blue-50 transition-colors duration-300"
            >
              Nous contacter
              <svg className="ml-2 -mr-1 w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10.293 5.293a1 1 0 011.414 0l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414-1.414L12.586 11H5a1 1 0 110-2h7.586l-2.293-2.293a1 1 0 010-1.414z" clipRule="evenodd" />
              </svg>
            </Link>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
