import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';

const fadeInUp = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.6,
      ease: [0.6, -0.05, 0.01, 0.99]
    }
  }
};
import { 
  ShipWheel, 
  Hammer, 
  Award, 
  BookOpen,
  PaintRoller
} from 'lucide-react';

const Home = () => {
  const formations = [
    {
      id: 1,
      titre: "Charpenterie Marine – Construction Navale",
      description: "Formation complète en construction navale traditionnelle",
      duree: "6 mois",
      niveau: "Tous niveaux"
    },
    {
      id: 2,
      titre: "Techniques de Réparation Navale",
      description: "Apprenez les techniques de réparation des coques et structures navales",
      duree: "4 mois",
      niveau: "Intermédiaire"
    }
  ];

  const ateliers = [
    {
      id: 1,
      titre: "Construction de Pirogue",
      description: "Atelier pratique de construction de pirogue traditionnelle",
      duree: "2 jours",
      icon: <ShipWheel className="w-12 h-12 text-blue-600" />
    },
    {
      id: 2,
      titre: "Réparation de Coque",
      description: "Techniques de réparation des coques endommagées",
      duree: "1 jour",
      icon: <Hammer className="w-12 h-12 text-blue-600" />
    },
    {
      id: 3,
      titre: "Vernissage et Finition",
      description: "Maîtrise des techniques de finition marine",
      duree: "1 jour",
      icon: <PaintRoller className="w-12 h-12 text-blue-600" />
    }
  ];

  const realisations = [
    {
      id: 1,
      titre: "Pirogue Traditionnelle 2024",
      description: "Construction d'une pirogue traditionnelle de 8 mètres",
      image: "https://images.unsplash.com/photo-1588704488646-eef1910a551a?ixlib=rb-4.0.3&auto=format&fit=crop&w=500&q=60"
    },
    {
      id: 2,
      titre: "Restauration de Bateau Ancien",
      description: "Restauration complète d'un bateau de pêche traditionnel",
      image: "https://images.unsplash.com/photo-1566054299481-41c4b4a1ab4e?ixlib=rb-4.0.3&auto=format&fit=crop&w=500&q=60"
    }
  ];

  return (
    <div className="min-h-screen bg-cover bg-center" style={{ backgroundImage: 'url(/bateau.jpg)' }}>
      <div className="absolute inset-0 bg-black/30"></div>
      <div className="relative z-10 min-h-screen">
        {/* Hero Section */}
        <div className="relative bg-blue-900/80 text-white overflow-hidden">
          <div className="max-w-7xl mx-auto">
            <div className="relative z-10 pb-8 bg-blue-900 sm:pb-16 md:pb-20 lg:max-w-2xl lg:w-full lg:pb-28 xl:pb-32">
              <main className="mt-10 mx-auto max-w-7xl px-4 sm:mt-12 sm:px-6 lg:mt-16 lg:px-8 xl:mt-20">
                <div className="sm:text-center lg:text-left">
                  <h1 className="text-4xl tracking-tight font-extrabold text-white sm:text-5xl md:text-6xl">
                    <span className="block">CFP Charpenterie</span>
                    <span className="block text-blue-300">Marine</span>
                  </h1>
                  <p className="mt-3 text-base text-blue-100 sm:mt-5 sm:text-lg sm:max-w-xl sm:mx-auto md:mt-5 md:text-xl lg:mx-0">
                    Centre de Formation Professionnelle spécialisé dans la charpenterie marine et la construction navale traditionnelle.
                  </p>
                  <div className="mt-5 sm:mt-8 sm:flex sm:justify-center lg:justify-start">
                    <div className="rounded-md shadow">
                      <Link
                        to="/formations"
                        className="w-full flex items-center justify-center px-8 py-3 border border-transparent text-base font-medium rounded-md text-blue-700 bg-white hover:bg-blue-50 md:py-4 md:text-lg md:px-10"
                      >
                        Nos Formations
                      </Link>
                    </div>
                    <div className="mt-3 sm:mt-0 sm:ml-3">
                      <Link
                        to="/ateliers"
                        className="w-full flex items-center justify-center px-8 py-3 border border-transparent text-base font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 md:py-4 md:text-lg md:px-10"
                      >
                        Nos Ateliers
                      </Link>
                    </div>
                  </div>
                </div>
              </main>
            </div>
            <div className="lg:absolute lg:inset-y-0 lg:right-0 lg:w-1/2 p-6 flex items-center">
              <div className="relative z-10 rounded-2xl overflow-hidden shadow-2xl w-3/4 mx-auto bg-blue-50/30 backdrop-blur-sm p-2">
                <img
                  src="/cfpmarine.jpeg"
                  alt="CFP Charpenterie Marine"
                  className="w-full h-auto max-h-[60vh] object-contain rounded-2xl"
                />
              </div>
            </div>
          </div>
        </div>

        {/* À propos Section */}
        <div className="relative bg-white overflow-hidden">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
            <div className="text-center">
              <h2 className="text-base text-blue-600 font-semibold tracking-wide uppercase">À propos de nous</h2>
              <p className="mt-2 text-3xl leading-8 font-extrabold tracking-tight text-gray-900 sm:text-4xl">
                Le Centre de Formation Professionnelle en Charpenterie Marine
              </p>
              <p className="mt-4 max-w-2xl text-xl text-gray-500 mx-auto">
                Depuis notre création, nous formons les professionnels de la construction navale de demain avec des méthodes traditionnelles et innovantes.
              </p>
            </div>

            <div className="mt-10">
            <div className="space-y-10 md:space-y-0 md:grid md:grid-cols-2 md:gap-x-8 md:gap-y-10">
              <div className="relative">
                <div className="absolute flex items-center justify-center h-12 w-12 rounded-md bg-blue-500 text-white">
                  <ShipWheel className="h-6 w-6" />
                </div>
                <div className="ml-16">
                  <h3 className="text-lg leading-6 font-medium text-gray-900">Notre Mission</h3>
                  <p className="mt-2 text-base text-gray-500">
                    Former des charpentiers marins qualifiés en alliant savoir-faire traditionnel et techniques modernes de construction navale.
                  </p>
                </div>
              </div>

              <div className="relative">
                <div className="absolute flex items-center justify-center h-12 w-12 rounded-md bg-blue-500 text-white">
                  <Award className="h-6 w-6" />
                </div>
                <div className="ml-16">
                  <h3 className="text-lg leading-6 font-medium text-gray-900">Nos Valeurs</h3>
                  <p className="mt-2 text-base text-gray-500">
                    Excellence, passion pour le métier, respect des traditions et innovation sont au cœur de notre pédagogie.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Nos Réalisations */}
      <div className="bg-gray-50 py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h2 className="text-base text-blue-600 font-semibold tracking-wide uppercase">Nos Réalisations</h2>
            <p className="mt-2 text-3xl leading-8 font-extrabold tracking-tight text-gray-900 sm:text-4xl">
              Ce que nous avons accompli
            </p>
            <p className="mt-4 max-w-2xl text-xl text-gray-500 mx-auto">
              Découvrez quelques-uns de nos projets de construction et de rénovation navale.
            </p>
          </div>

          <div className="mt-12 grid gap-8 lg:grid-cols-2">
            {realisations.map((realisation) => (
              <motion.div
                key={realisation.id}
                className="bg-white overflow-hidden shadow rounded-lg"
                whileHover={{ y: -5 }}
                transition={{ duration: 0.3 }}
              >
                <img
                  className="h-56 w-full object-cover"
                  src={realisation.image}
                  alt={realisation.titre}
                />
                <div className="p-6">
                  <h3 className="text-xl font-semibold text-gray-900">{realisation.titre}</h3>
                  <p className="mt-2 text-gray-600">{realisation.description}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </div>

      {/* Nos Formations */}
      <div className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h2 className="text-base text-blue-600 font-semibold tracking-wide uppercase">Nos Formations</h2>
            <p className="mt-2 text-3xl leading-8 font-extrabold tracking-tight text-gray-900 sm:text-4xl">
              Des formations complètes et professionnelles
            </p>
            <p className="mt-4 max-w-2xl text-xl text-gray-500 mx-auto">
              Découvrez nos programmes de formation conçus pour vous donner toutes les compétences nécessaires.
            </p>
          </div>

          <div className="mt-12 grid gap-8 md:grid-cols-2">
            {formations.map((formation) => (
              <motion.div
                key={formation.id}
                className="bg-white border border-gray-200 rounded-lg shadow-sm overflow-hidden hover:shadow-md transition-shadow duration-300"
                whileHover={{ y: -5 }}
              >
                <div className="p-6">
                  <div className="flex items-center">
                    <div className="flex-shrink-0 bg-blue-500 rounded-md p-3">
                      <BookOpen className="h-6 w-6 text-white" />
                    </div>
                    <div className="ml-5">
                      <h3 className="text-lg font-medium text-gray-900">{formation.titre}</h3>
                      <p className="mt-1 text-sm text-gray-500">{formation.duree} • {formation.niveau}</p>
                    </div>
                  </div>
                  <p className="mt-4 text-base text-gray-600">{formation.description}</p>
                  <div className="mt-6">
                    <Link
                      to="/formations"
                      className="inline-flex items-center text-blue-600 hover:text-blue-800"
                    >
                      En savoir plus
                      <svg className="ml-2 h-4 w-4" fill="currentColor" viewBox="0 0 20 20">
                        <path
                          fillRule="evenodd"
                          d="M10.293 5.293a1 1 0 011.414 0l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414-1.414L12.586 11H5a1 1 0 110-2h7.586l-2.293-2.293a1 1 0 010-1.414z"
                          clipRule="evenodd"
                        />
                      </svg>
                    </Link>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>

          <div className="mt-10 text-center">
            <Link
              to="/formations"
              className="inline-flex items-center px-6 py-3 border border-transparent text-base font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700"
            >
              Voir toutes les formations
            </Link>
          </div>
        </div>
      </div>

      {/* Ateliers Pratiques */}
      <div className="bg-gray-50 py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h2 className="text-base text-blue-600 font-semibold tracking-wide uppercase">Ateliers Pratiques</h2>
            <p className="mt-2 text-3xl leading-8 font-extrabold tracking-tight text-gray-900 sm:text-4xl">
              Découvrez nos ateliers pratiques
            </p>
            <p className="mt-4 max-w-2xl text-xl text-gray-500 mx-auto">
              Des sessions courtes et intensives pour apprendre des techniques spécifiques.
            </p>
          </div>

          <div className="mt-12 grid gap-8 md:grid-cols-2 lg:grid-cols-3">
            {ateliers.map((atelier) => (
              <motion.div
                key={atelier.id}
                className="bg-white p-6 rounded-lg shadow-md hover:shadow-lg transition-shadow duration-300"
                whileHover={{ y: -5 }}
              >
                <div className="flex items-center justify-center h-20 w-20 rounded-md bg-blue-100 text-blue-600 mx-auto">
                  {atelier.icon}
                </div>
                <h3 className="mt-4 text-lg font-medium text-center text-gray-900">{atelier.titre}</h3>
                <p className="mt-2 text-base text-center text-gray-600">{atelier.description}</p>
                <div className="mt-4 text-center">
                  <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-blue-100 text-blue-800">
                    {atelier.duree}
                  </span>
                </div>
              </motion.div>
            ))}
          </div>

          <div className="mt-10 text-center">
            <Link
              to="/ateliers"
              className="inline-flex items-center px-6 py-3 border border-transparent text-base font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700"
            >
              Découvrir tous les ateliers
            </Link>
          </div>
        </div>
      </div>

      {/* CTA Section */}
      <div className="bg-blue-700">
        <div className="max-w-2xl mx-auto text-center py-16 px-4 sm:py-20 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-extrabold text-white sm:text-4xl">
            <span className="block">Prêt à commencer votre aventure ?</span>
            <span className="block">Rejoignez-nous dès maintenant</span>
          </h2>
          <p className="mt-4 text-lg leading-6 text-blue-200">
            Inscrivez-vous à nos formations ou ateliers et développez vos compétences en charpenterie marine.
          </p>
          <Link
            to="/contact"
            className="mt-8 w-full inline-flex items-center justify-center px-5 py-3 border border-transparent text-base font-medium rounded-md text-blue-700 bg-white hover:bg-blue-50 sm:w-auto"
          >
            Nous contacter
          </Link>
        </div>
              {/* Footer */}
      <footer className="bg-gray-900 text-white py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div>
              <div className="flex items-center mb-4">
                <img
                  src="/cfpmarine.jpeg"
                  alt="CFP Charpenterie Marine"
                  className="h-12"
                />
                <span className="ml-3 text-xl font-bold">CFP Charpenterie Marine</span>
              </div>
              <p className="text-gray-400 text-sm">
                Centre de Formation Professionnelle spécialisé dans la charpenterie marine et la construction navale traditionnelle.
              </p>
            </div>
            <div>
              <h4 className="text-lg font-semibold mb-4">Liens rapides</h4>
              <ul className="space-y-2">
                <li><Link to="/" className="text-gray-400 hover:text-white transition-colors">Accueil</Link></li>
                <li><Link to="/formations" className="text-gray-400 hover:text-white transition-colors">Formations</Link></li>
                <li><Link to="/ateliers" className="text-gray-400 hover:text-white transition-colors">Ateliers</Link></li>
                <li><Link to="/contact" className="text-gray-400 hover:text-white transition-colors">Contact</Link></li>
              </ul>
            </div>
            <div>
              <h4 className="text-lg font-semibold mb-4">Contact</h4>
              <ul className="space-y-2 text-gray-400">
                <li className="flex items-start">
                  <svg className="w-5 h-5 mr-2 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                  Adresse du CFP Marine, Madagascar
                </li>
                <li className="flex items-center">
                  <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                  </svg>
                  +261 XX XX XXX XX
                </li>
                <li className="flex items-center">
                  <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                  </svg>
                  contact@cfpmarine.mg
                </li>
              </ul>
            </div>
            <div>
              <h4 className="text-lg font-semibold mb-4">Suivez-nous</h4>
              <div className="flex space-x-4">
                <a href="#" className="text-gray-400 hover:text-white transition-colors">
                  <span className="sr-only">Facebook</span>
                  <svg className="h-6 w-6" fill="currentColor" viewBox="0 0 24 24">
                    <path fillRule="evenodd" d="M22 12c0-5.523-4.477-10-10-10S2 6.477 2 12c0 4.991 3.657 9.128 8.438 9.878v-6.987h-2.54V12h2.54V9.797c0-2.506 1.492-3.89 3.777-3.89 1.094 0 2.238.195 2.238.195v2.46h-1.26c-1.243 0-1.63.771-1.63 1.562V12h2.773l-.443 2.89h-2.33v6.988C18.343 21.128 22 16.991 22 12z" clipRule="evenodd" />
                  </svg>
                </a>
                <a href="#" className="text-gray-400 hover:text-white transition-colors">
                  <span className="sr-only">Instagram</span>
                  <svg className="h-6 w-6" fill="currentColor" viewBox="0 0 24 24">
                    <path fillRule="evenodd" d="M12.315 2c2.43 0 2.784.013 3.808.06 1.064.049 1.791.218 2.427.465a4.902 4.902 0 011.772 1.153 4.902 4.902 0 011.153 1.772c.247.636.416 1.363.465 2.427.048 1.067.06 1.407.06 4.123v.08c0 2.643-.012 2.987-.06 4.043-.049 1.064-.218 1.791-.465 2.427a4.902 4.902 0 01-1.153 1.772 4.902 4.902 0 01-1.772 1.153c-.636.247-1.363.416-2.427.465-1.067.048-1.407.06-4.123.06h-.08c-2.643 0-2.987-.012-4.043-.06-1.064-.049-1.791-.218-2.427-.465a4.902 4.902 0 01-1.772-1.153 4.902 4.902 0 01-1.153-1.772c-.247-.636-.416-1.363-.465-2.427-.047-1.024-.06-1.379-.06-3.808v-.63c0-2.43.013-2.784.06-3.808.049-1.064.218-1.791.465-2.427a4.902 4.902 0 011.153-1.772A4.902 4.902 0 015.45 2.525c.636-.247 1.363-.416 2.427-.465C8.901 2.013 9.256 2 11.685 2h.63zm-.081 1.802h-.468c-2.456 0-2.784.011-3.807.058-.975.045-1.504.207-1.857.344-.467.182-.8.398-1.15.748-.35.35-.566.683-.748 1.15-.137.353-.3.882-.344 1.857-.047 1.023-.058 1.351-.058 3.807v.468c0 2.456.011 2.784.058 3.807.045.975.207 1.504.344 1.857.182.466.399.8.748 1.15.35.35.683.566 1.15.748.353.137.882.3 1.857.344 1.054.048 1.37.058 4.041.058h.08c2.597 0 2.917-.01 3.96-.058.976-.045 1.505-.207 1.858-.344.466-.182.8-.398 1.15-.748.35-.35.566-.683.748-1.15.137-.353.3-.882.344-1.857.048-1.055.058-1.37.058-4.041v-.08c0-2.597-.01-2.917-.058-3.96-.045-.976-.207-1.505-.344-1.858a3.097 3.097 0 00-.748-1.15 3.098 3.098 0 00-1.15-.748c-.353-.137-.882-.3-1.857-.344-1.023-.047-1.351-.058-3.807-.058zM12 6.865a5.135 5.135 0 110 10.27 5.135 5.135 0 010-10.27zm0 1.802a3.333 3.333 0 100 6.666 3.333 3.333 0 000-6.666z" clipRule="evenodd" />
                  </svg>
                </a>
              </div>
            </div>
          </div>
          <div className="mt-12 pt-8 border-t border-gray-800 text-center">
            <p className="text-gray-400 text-sm">
              &copy; {new Date().getFullYear()} CFP Charpenterie Marine. Tous droits réservés.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Home;