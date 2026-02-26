import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence, useAnimation } from 'framer-motion';
import { useInView } from 'react-intersection-observer';
import { 
  FiArrowRight, 
  FiChevronRight, 
  FiPhone, 
  FiMail, 
  FiMapPin, 
  FiClock, 
  FiAward, 
  FiUsers, 
  FiTool,
  FiAnchor,
  FiHome,
  FiMessageSquare,
  FiLogIn,
  FiCheckCircle,
  FiUser
} from 'react-icons/fi';
import { FaShip, FaTools, FaUserGraduate, FaWater, FaQuoteLeft } from 'react-icons/fa';

const formations = [
  {
    id: 1,
    title: 'FPI',
    description: 'Formation Professionnelle Intial',
    icon: <FaShip className="text-4xl text-blue-600" />,
    link: '/formation/1',
    duration: '3 ans ',
    level: 'Niveau BEPC',
    places: '12 places'
  },
  {
    id: 2,
    title: 'FPQ',
    description: 'Formation ¨Professionnelle Qualifiante',
    icon: <FaTools className="text-4xl text-blue-600" />,
    link: '/formation/2',
    duration: '6 mois',
    level: 'Pas de niveau',
    places: '10 places'
  },
  {
    id: 3,
    title: 'AMB',
    description: 'Apprentissage et Métiers de Base',
    icon: <FaWater className="text-4xl text-blue-600" />,
    link: '/formation/3',
    duration: '7 semaines',
    level: 'Pas de niveau',
    places: '15 places'
  },
  {
    id: 4,
    title: 'CN',
    description: 'Construction Navale',
    icon: <FiTool className="text-4xl text-blue-600" />,
    link: '/formation/4',
    duration: '3 ans',
    level: 'Niveau BEPC',
    places: '10 places'
  }
];

const testimonials = [
  {
    id: 1,
    name: 'Jean Rakoto',
    role: 'Ancien élève - Charpente Navale',
    content: 'La formation en charpente navale m\'a offert des compétences pratiques exceptionnelles. Les formateurs sont des experts passionnés qui partagent leur savoir-faire avec bienveillance.',
    avatar: '/images/avatar1.jpg',
    rating: 5
  },
  {
    id: 2,
    name: 'Marie Rasoanirina',
    role: 'Étudiante en mécanique marine',
    content: 'Une formation de qualité avec un excellent équipement. Les stages en entreprise m\'ont permis de mettre en pratique mes connaissances et de me constituer un réseau professionnel.',
    avatar: '/images/avatar2.jpg',
    rating: 5
  },
  {
    id: 3,
    name: 'Thomas Andriamaro',
    role: 'Diplômé en électricité marine',
    content: 'Le CFP Charpentier Marine m\'a ouvert les portes d\'un métier passionnant. L\'accompagnement personnalisé et les projets concrets m\'ont permis de trouver un emploi rapidement après ma formation.',
    avatar: '/images/avatar3.jpg',
    rating: 5
  }
];

const Home = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [currentTestimonial, setCurrentTestimonial] = useState(0);
  const controls = useAnimation();
  const [ref, inView] = useInView({ triggerOnce: true, threshold: 0.1 });

  useEffect(() => {
    if (inView) {
      controls.start('visible');
    }
  }, [controls, inView]);

  // Auto-rotate testimonials
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentTestimonial((prev) => (prev + 1) % testimonials.length);
    }, 8000);
    return () => clearInterval(interval);
  }, []);

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { staggerChildren: 0.1 }
    }
  };

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
      transition: { type: 'spring', stiffness: 100, damping: 10 }
    }
  };

  return (
    <div className="min-h-screen bg-white">
      {/* Top Bar */}
      <div className="bg-gradient-to-r from-blue-900 to-blue-700 text-white text-sm py-2 shadow-md">
        <div className="container mx-auto px-4 flex flex-col md:flex-row justify-between items-center">
          <div className="flex flex-wrap justify-center md:justify-start gap-x-6 gap-y-2 mb-2 md:mb-0">
            <a 
              href="tel:+261XXXXXXXXX" 
              className="flex items-center hover:text-blue-200 transition-colors duration-300 text-xs sm:text-sm"
            >
              <FiPhone className="mr-1.5" /> +261 XX XXX XX XX
            </a>
            <a 
              href="mailto:contact@cfp-charpentier-marine.mg" 
              className="flex items-center hover:text-blue-200 transition-colors duration-300 text-xs sm:text-sm"
            >
              <FiMail className="mr-1.5" /> contact@cfp-charpentier-marine.mg
            </a>
            <div className="hidden lg:flex items-center text-xs sm:text-sm">
              <FiMapPin className="mr-1.5 flex-shrink-0" /> 
              <span className="truncate"> Mahajanga 401, Madagascar</span>
            </div>
          </div>
          <div className="flex items-center space-x-4">
            <a 
              href="#" 
              className="hidden md:flex items-center hover:text-blue-200 transition-colors duration-300 text-xs sm:text-sm"
            >
              <FiUser className="mr-1.5" /> Espace de Connexion
            </a>
            <span className="hidden md:inline-block h-4 w-px bg-blue-600"></span>
            <div className="flex items-center space-x-2">
              <a 
                href="#" 
                className="hover:text-blue-200 transition-colors duration-300 text-xs sm:text-sm px-2 py-1 rounded hover:bg-white/10"
              >
                FR
              </a>
              <span className="text-blue-300">|</span>
              <a 
                href="#" 
                className="hover:text-blue-200 transition-colors duration-300 text-xs sm:text-sm px-2 py-1 rounded hover:bg-white/10"
              >
                EN
              </a>
            </div>
          </div>
        </div>
      </div>

      {/* Header */}
      <header className="bg-white shadow-lg sticky top-0 z-50">
        <div className="container mx-auto px-4 py-3">
          <div className="flex justify-between items-center">
            <div className="flex items-center">
              <Link to="/" className="flex items-center group">
                <div className="relative">
                  <img 
                    src="/cfpmarine.jpeg" 
                    alt="CFP Charpentier Marine Logo" 
                    className="h-16 w-16 rounded-full border-2 border-blue-100 shadow-md group-hover:shadow-lg transition-all duration-300"
                  />
                  <div className="absolute -bottom-1 -right-1 bg-yellow-400 rounded-full p-1">
                    <FiAnchor className="text-blue-800 text-xs" />
                  </div>
                </div>
                <div className="ml-4">
                  <h1 className="text-xl md:text-2xl font-bold text-blue-900 group-hover:text-blue-800 transition-colors">
                    CFP Charpentier Marine Mahajanga
                  </h1>
                  <p className="text-xs text-blue-600 font-medium hidden sm:block">
                    Formation Professionnelle Maritime d'Excellence
                  </p>
                </div>
              </Link>
            </div>
            
            {/* Desktop Navigation */}
            <nav className="hidden lg:flex items-center space-x-1">
              <a 
                href="#" 
                className="px-4 py-3 text-blue-900 font-medium hover:bg-blue-50 rounded-lg transition-colors duration-300 flex items-center group"
              >
                <FiHome className="mr-2 text-blue-600 group-hover:text-blue-700" /> 
                Accueil
              </a>
              <a 
                href="#formations" 
                className="px-4 py-3 text-blue-900 font-medium hover:bg-blue-50 rounded-lg transition-colors duration-300 flex items-center group"
              >
                <FiAward className="mr-2 text-blue-600 group-hover:text-blue-700" /> 
                Formations
              </a>
              <a 
                href="#a-propos" 
                className="px-4 py-3 text-blue-900 font-medium hover:bg-blue-50 rounded-lg transition-colors duration-300 flex items-center group"
              >
                <FiUsers className="mr-2 text-blue-600 group-hover:text-blue-700" /> 
                Àpropos
              </a>
              <a 
                href="#temoignages" 
                className="px-4 py-3 text-blue-900 font-medium hover:bg-blue-50 rounded-lg transition-colors duration-300 flex items-center group"
              >
                <FiMessageSquare className="mr-2 text-blue-600 group-hover:text-blue-700" /> 
                Témoignages
              </a>
              <a 
                href="#contact" 
                className="px-4 py-3 text-blue-900 font-medium hover:bg-blue-50 rounded-lg transition-colors duration-300 flex items-center group"
              >
                <FiMail className="mr-2 text-blue-600 group-hover:text-blue-700" /> 
                Contact
              </a>
              <div className="ml-4 h-8 w-px bg-gray-200"></div>
              <Link 
                to="/login" 
                className="ml-4 bg-gradient-to-r from-blue-600 to-blue-800 text-white px-6 py-3 rounded-lg hover:from-blue-700 hover:to-blue-900 transition-all duration-300 shadow-md hover:shadow-lg transform hover:-translate-y-0.5 flex items-center group"
              >
                <span className="font-medium">Connecter</span>
                <FiLogIn className="ml-2 transition-transform group-hover:translate-x-1" />
              </Link>
            </nav>
            
            {/* Mobile menu button */}
            <div className="lg:hidden">
              <button 
                onClick={() => setIsMenuOpen(!isMenuOpen)}
                className="text-blue-900 hover:text-blue-700 focus:outline-none p-2 rounded-full hover:bg-blue-50 transition-colors duration-300"
                aria-label="Menu"
              >
                <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  {isMenuOpen ? (
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  ) : (
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                  )}
                </svg>
              </button>
            </div>
          </div>
          
          {/* Mobile Navigation */}
          <AnimatePresence>
            {isMenuOpen && (
              <motion.div 
                initial={{ opacity: 0, height: 0, overflow: 'hidden' }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className="lg:hidden bg-white overflow-hidden shadow-inner mt-2 rounded-lg"
                transition={{ duration: 0.3, ease: 'easeInOut' }}
              >
                <div className="px-2 py-3 space-y-1">
                  <a 
                    href="#" 
                    className="flex items-center p-3 text-blue-900 hover:bg-blue-50 rounded-lg transition-colors duration-300"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    <FiHome className="mr-3 text-blue-600" /> 
                    Accueil
                  </a>
                  <a 
                    href="#formations" 
                    className="flex items-center p-3 text-blue-900 hover:bg-blue-50 rounded-lg transition-colors duration-300"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    <FiAward className="mr-3 text-blue-600" /> 
                    Formations
                  </a>
                  <a 
                    href="#a-propos" 
                    className="flex items-center p-3 text-blue-900 hover:bg-blue-50 rounded-lg transition-colors duration-300"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    <FiUsers className="mr-3 text-blue-600" /> 
                    À propos
                  </a>
                  <a 
                    href="#temoignages" 
                    className="flex items-center p-3 text-blue-900 hover:bg-blue-50 rounded-lg transition-colors duration-300"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    <FiMessageSquare className="mr-3 text-blue-600" /> 
                    Témoignages
                  </a>
                  <a 
                    href="#contact" 
                    className="flex items-center p-3 text-blue-900 hover:bg-blue-50 rounded-lg transition-colors duration-300"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    <FiMail className="mr-3 text-blue-600" /> 
                    Contact
                  </a>
                  <div className="pt-2 mt-2 border-t border-gray-100">
                    <Link 
                      to="/login" 
                      className="flex items-center justify-center p-3 mt-2 bg-gradient-to-r from-blue-600 to-blue-800 text-white rounded-lg hover:from-blue-700 hover:to-blue-900 transition-all duration-300"
                      onClick={() => setIsMenuOpen(false)}
                    >
                      <FiLogIn className="mr-2" />
                      Se Connecter
                    </Link>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative bg-blue-900 text-white py-24 md:py-36 lg:py-40 overflow-hidden">
        {/* Background image with overlay - Marine Carpentry Workshop */}
        <div 
          className="absolute inset-0 bg-cover bg-center"
          style={{
            backgroundImage: 'linear-gradient(rgba(30, 58, 138, 0.85), rgba(29, 78, 216, 0.75)), url(https://images.unsplash.com/photo-1581092160562-40aa08e78837?w=1920)',
            backgroundSize: 'cover',
            backgroundPosition: 'center',
            backgroundAttachment: 'fixed'
          }}
        >
          <div className="absolute inset-0 bg-gradient-to-r from-blue-900/90 to-blue-800/80"></div>
          <div className="absolute inset-0" style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='0.05'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
            opacity: 0.1
          }}></div>
        </div>
        
        <div className="container mx-auto px-4 relative z-10">
          <motion.div 
            className="max-w-4xl"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, ease: "easeOut" }}
          >
            <div className="inline-flex items-center px-4 py-1.5 rounded-full bg-white/10 backdrop-blur-sm mb-6">
              <span className="h-2 w-2 rounded-full bg-yellow-400 mr-2 animate-pulse"></span>
              <span className="text-sm font-medium text-yellow-200">Inscriptions 2025-2026 en cours</span>
            </div>
            
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-6 leading-tight">
              Devenez Artisan <span className="text-yellow-400">Maritime</span> d'Excellence
            </h1>
            
            <p className="text-xl mb-8 text-blue-100 max-w-2xl leading-relaxed">
              Formations qualifiantes en charpente navale, mécanique marine et navigation. 
              Rejoignez le CFP Charpentier Marine et donnez vie à votre passion pour la mer.
            </p>
            
            <div className="flex flex-col sm:flex-row space-y-4 sm:space-y-0 sm:space-x-6">
              <motion.div whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.98 }}>
                <a 
                  href="#formations" 
                  className="inline-flex items-center justify-center bg-gradient-to-r from-yellow-500 to-yellow-600 hover:from-yellow-600 hover:to-yellow-700 text-white px-8 py-4 rounded-lg font-semibold text-lg shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-0.5"
                >
                  Découvrir nos formations
                  <FiArrowRight className="ml-2" />
                </a>
              </motion.div>
              
              <motion.div whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.98 }}>
                <a 
                  href="#contact" 
                  className="inline-flex items-center justify-center bg-white/10 backdrop-blur-sm border-2 border-white/20 text-white px-8 py-4 rounded-lg font-semibold text-lg hover:bg-white/20 transition-all duration-300"
                >
                  <FiPhone className="mr-2" />
                  Nous contacter
                </a>
              </motion.div>
            </div>
            
            <div className="mt-12 flex flex-wrap gap-6">
              <div className="flex items-center bg-white/10 backdrop-blur-sm p-3 rounded-lg">
                <div className="flex -space-x-2 mr-4">
                  <div className="h-10 w-10 rounded-full border-2 border-white bg-blue-600"></div>
                  <div className="h-10 w-10 rounded-full border-2 border-white bg-blue-600 -ml-3"></div>
                  <div className="h-10 w-10 rounded-full border-2 border-white bg-blue-600 -ml-3 flex items-center justify-center text-xs font-bold">+15</div>
                </div>
                <div>
                  <div className="font-bold text-lg">+200</div>
                  <div className="text-sm text-blue-200">Étudiants formés</div>
                </div>
              </div>
              
              <div className="flex items-center bg-white/10 backdrop-blur-sm p-3 rounded-lg">
                <div className="h-12 w-12 rounded-lg bg-yellow-400/20 flex items-center justify-center mr-4">
                  <FiAward className="text-yellow-400 text-xl" />
                </div>
                <div>
                  <div className="font-bold text-lg">95%</div>
                  <div className="text-sm text-blue-200">Taux de réussite</div>
                </div>
              </div>
              
              <div className="flex items-center bg-white/10 backdrop-blur-sm p-3 rounded-lg">
                <div className="h-12 w-12 rounded-lg bg-blue-400/20 flex items-center justify-center mr-4">
                  <FiUsers className="text-blue-300 text-xl" />
                </div>
                <div>
                  <div className="font-bold text-lg">100%</div>
                  <div className="text-sm text-blue-200">Taux d'insertion</div>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
        
        <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-blue-900 to-transparent"></div>
        
        <div className="absolute bottom-6 left-1/2 transform -translate-x-1/2">
          <a 
            href="#formations" 
            className="animate-bounce w-10 h-16 rounded-full border-2 border-white/30 flex items-start justify-center p-2 hover:border-white/60 transition-colors"
          >
            <div className="w-1 h-4 bg-white/70 rounded-full"></div>
          </a>
        </div>
      </section>

      {/* Formations Section */}
      <section id="formations" className="py-20 bg-white">
        <div className="container mx-auto px-4">
          <motion.div 
            className="text-center mb-16 max-w-3xl mx-auto"
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            <span className="inline-block text-blue-600 font-semibold mb-3">NOS FORMATIONS</span>
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-6">Découvrez nos parcours de formation</h2>
            <div className="w-24 h-1 bg-gradient-to-r from-blue-500 to-blue-700 mx-auto rounded-full"></div>
            <p className="mt-6 text-gray-600 text-lg">
              Des formations professionnelles complètes pour vous former aux métiers de la construction et de la réparation navale.
            </p>
          </motion.div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {formations.map((formation, index) => (
              <motion.div 
                key={formation.id}
                className="group bg-white rounded-xl overflow-hidden shadow-lg hover:shadow-2xl transition-all duration-500 border border-gray-100"
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                whileHover={{ y: -10 }}
              >
                <div className="h-48 bg-gradient-to-br from-blue-50 to-blue-100 flex items-center justify-center relative overflow-hidden">
                  <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent z-10"></div>
                  {formation.icon}
                  <div className="absolute bottom-0 left-0 right-0 p-4 z-20 flex justify-between items-center">
                    <div className="bg-yellow-400 text-yellow-900 text-xs font-bold px-3 py-1 rounded-full">
                      {index === 0 ? 'Populaire' : 'Disponible'}
                    </div>
                    <div className="text-xs bg-white/90 text-blue-900 font-medium px-2 py-1 rounded">
                      {formation.places}
                    </div>
                  </div>
                </div>
                <div className="p-6">
                  <div className="flex items-center mb-4">
                    <div className="h-10 w-1 bg-gradient-to-b from-blue-500 to-blue-700 rounded-full mr-3"></div>
                    <h3 className="text-xl font-bold text-gray-900">{formation.title}</h3>
                  </div>
                  <p className="text-gray-600 mb-6">{formation.description}</p>
                  <div className="flex flex-wrap gap-2 mb-4">
                    <span className="text-xs bg-blue-50 text-blue-700 px-2 py-1 rounded">
                      {formation.duration}
                    </span>
                    <span className="text-xs bg-green-50 text-green-700 px-2 py-1 rounded">
                      {formation.level}
                    </span>
                  </div>
                  <div className="flex justify-between items-center pt-4 border-t border-gray-100">
                    <Link 
                      to={formation.link}
                      className="text-blue-600 font-medium flex items-center group-hover:text-blue-700 transition-colors"
                    >
                      En savoir plus
                      <FiArrowRight className="ml-2 transition-transform group-hover:translate-x-1" />
                    </Link>
                    <span className="text-sm text-gray-500 flex items-center">
                      <FiClock className="mr-1" /> {formation.duration}
                    </span>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* About Section */}
      <section id="a-propos" className="py-20 bg-white relative overflow-hidden">
        {/* Decorative elements */}
        <div className="absolute top-0 right-0 w-1/3 h-full bg-gradient-to-bl from-blue-50 to-transparent -z-10"></div>
        <div className="absolute -bottom-20 -left-20 w-64 h-64 bg-yellow-400 rounded-full mix-blend-multiply filter blur-xl opacity-20"></div>
        
        <div className="container mx-auto px-4">
          <motion.div 
            className="flex flex-col lg:flex-row items-center"
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
          >
            {/* Image Section */}
            <div className="lg:w-1/2 lg:pr-12 mb-12 lg:mb-0 relative">
              <div className="relative rounded-2xl overflow-hidden shadow-2xl">
                <div className="aspect-w-16 aspect-h-9">
                  <img 
                    src="https://images.unsplash.com/photo-1504196606672-aef5c9cefc92?w=800" 
                    alt="Atelier de charpente marine - Étudiants en formation" 
                    className="w-full h-full object-cover"
                    loading="lazy"
                  />
                </div>
                <div className="absolute -bottom-6 -right-6 bg-white p-1 rounded-lg shadow-lg z-10">
                  <div className="bg-blue-100 p-4 rounded-lg">
                    <div className="text-3xl font-bold text-blue-700">70+</div>
                    <div className="text-sm text-blue-600 font-medium">Ans d'expérience</div>
                  </div>
                </div>
              </div>
              
              {/* Experience badge */}
              <div className="absolute -top-4 -left-4 bg-yellow-400 text-yellow-900 font-bold text-sm px-4 py-2 rounded-full shadow-md z-10">
                Depuis 1960
              </div>
            </div>
            
            {/* Content Section */}
            <div className="lg:w-1/2">
              <div className="max-w-lg mx-auto lg:mx-0">
                <span className="inline-block text-blue-600 font-semibold mb-3">À PROPOS DE NOUS</span>
                <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-6">
                  Centre de Formation Professionnelle <span className="text-blue-700">Maritime</span>
                </h2>
                
                <p className="text-gray-600 mb-6 leading-relaxed">
                  Fondé en 1960, le <span className="font-semibold text-gray-800">CFP Charpentier Marine</span> s'est imposé comme une référence dans la formation aux métiers de la mer. 
                  Notre centre allie tradition maritime et technologies modernes pour offrir des formations d'excellence.
                </p>
                
                <div className="space-y-4 mb-8">
                  <div className="flex items-start">
                    <div className="flex-shrink-0 mt-1">
                      <div className="flex items-center justify-center h-6 w-6 rounded-full bg-green-100 text-green-600">
                        <FiCheckCircle className="h-4 w-4" />
                      </div>
                    </div>
                    <p className="ml-3 text-gray-700">
                      <span className="font-medium">Formateurs experts</span> - Des professionnels en activité partageant leur savoir-faire
                    </p>
                  </div>
                  
                  <div className="flex items-start">
                    <div className="flex-shrink-0 mt-1">
                      <div className="flex items-center justify-center h-6 w-6 rounded-full bg-blue-100 text-blue-600">
                        <FiCheckCircle className="h-4 w-4" />
                      </div>
                    </div>
                    <p className="ml-3 text-gray-700">
                      <span className="font-medium">Pédagogie active</span> - 70% de pratique en atelier et en situation réelle
                    </p>
                  </div>
                  
                  <div className="flex items-start">
                    <div className="flex-shrink-0 mt-1">
                      <div className="flex items-center justify-center h-6 w-6 rounded-full bg-purple-100 text-purple-600">
                        <FiCheckCircle className="h-4 w-4" />
                      </div>
                    </div>
                    <p className="ml-3 text-gray-700">
                      <span className="font-medium">Réseau professionnel</span> - Partenariats avec les chantiers navals et entreprises du secteur
                    </p>
                  </div>
                </div>
                  
                <div className="flex flex-col sm:flex-row gap-4">
                  <Link 
                    to="/a-propos" 
                    className="inline-flex items-center justify-center bg-gradient-to-r from-blue-600 to-blue-800 text-white px-6 py-3 rounded-lg font-medium hover:from-blue-700 hover:to-blue-900 transition-all duration-300 shadow-md hover:shadow-lg transform hover:-translate-y-0.5"
                  >
                    En savoir plus sur nous
                  </Link>
                  <a 
                    href="#contact" 
                    className="inline-flex items-center justify-center bg-white text-blue-700 border-2 border-blue-100 px-6 py-3 rounded-lg font-medium hover:bg-blue-50 transition-all duration-300"
                  >
                    <FiMapPin className="mr-2" />
                    Nous rendre visite
                  </a>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section id="temoignages" className="py-20 bg-white">
        <div className="container mx-auto px-4">
          <motion.div 
            className="text-center mb-16 max-w-3xl mx-auto"
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            <span className="inline-block text-blue-600 font-semibold mb-3">TÉMOIGNAGES</span>
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-6">Ce que disent nos étudiants</h2>
            <div className="w-24 h-1 bg-gradient-to-r from-blue-500 to-blue-700 mx-auto rounded-full"></div>
          </motion.div>

          <div className="max-w-4xl mx-auto relative">
            <AnimatePresence mode="wait">
              <motion.div
                key={currentTestimonial}
                initial={{ opacity: 0, x: 100 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -100 }}
                transition={{ duration: 0.5 }}
                className="bg-white rounded-2xl shadow-xl p-8 md:p-12"
              >
                <div className="flex flex-col md:flex-row items-center md:items-start">
                  <div className="flex-shrink-0 mb-6 md:mb-0 md:mr-8">
                    <div className="relative">
                      <div className="w-24 h-24 rounded-full bg-gradient-to-br from-blue-400 to-blue-600 flex items-center justify-center text-white text-3xl font-bold">
                        {testimonials[currentTestimonial].name.charAt(0)}
                      </div>
                      <div className="absolute -bottom-2 -right-2 bg-yellow-400 rounded-full p-2">
                        <FaQuoteLeft className="text-blue-900 text-sm" />
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex-1 text-center md:text-left">
                    <div className="flex justify-center md:justify-start mb-4">
                      {[...Array(testimonials[currentTestimonial].rating)].map((_, i) => (
                        <svg key={i} className="w-5 h-5 text-yellow-400 fill-current" viewBox="0 0 20 20">
                          <path d="M10 15l-5.878 3.09 1.123-6.545L.489 6.91l6.572-.955L10 0l2.939 5.955 6.572.955-4.756 4.635 1.123 6.545z" />
                        </svg>
                      ))}
                    </div>
                    
                    <p className="text-gray-700 text-lg mb-6 italic">
                      "{testimonials[currentTestimonial].content}"
                    </p>
                    
                    <div>
                      <h4 className="font-bold text-gray-900 text-lg">
                        {testimonials[currentTestimonial].name}
                      </h4>
                      <p className="text-blue-600 text-sm">
                        {testimonials[currentTestimonial].role}
                      </p>
                    </div>
                  </div>
                </div>
              </motion.div>
            </AnimatePresence>
            
            {/* Navigation dots */}
            <div className="flex justify-center mt-8 space-x-2">
              {testimonials.map((_, index) => (
                <button
                  key={index}
                  onClick={() => setCurrentTestimonial(index)}
                  className={`h-3 rounded-full transition-all duration-300 ${
                    index === currentTestimonial 
                      ? 'w-8 bg-blue-600' 
                      : 'w-3 bg-gray-300 hover:bg-blue-400'
                  }`}
                  aria-label={`Testimonial ${index + 1}`}
                />
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section id="contact" className="bg-gradient-to-r from-blue-900 via-blue-800 to-blue-900 text-white py-20 relative overflow-hidden">
        <div className="absolute inset-0 opacity-10">
          <div className="absolute transform rotate-45 -left-20 top-20 w-64 h-64 bg-yellow-400 rounded-full mix-blend-multiply filter blur-xl"></div>
          <div className="absolute transform -rotate-45 -right-20 bottom-20 w-64 h-64 bg-blue-600 rounded-full mix-blend-multiply filter blur-xl"></div>
        </div>
        
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            <h2 className="text-3xl md:text-4xl font-bold mb-6">Prêt à vous lancer dans une carrière maritime ?</h2>
            <p className="text-xl mb-10 max-w-3xl mx-auto text-blue-100">
              Rejoignez notre centre formation professionnelle en charpente marine et développez des compétences recherchées dans le secteur naval.
            </p>
            <div className="flex flex-col sm:flex-row justify-center space-y-4 sm:space-y-0 sm:space-x-6">
              <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                <Link 
                  to="/inscription" 
                  className="inline-flex items-center bg-gradient-to-r from-yellow-500 to-yellow-600 hover:from-yellow-600 hover:to-yellow-700 text-white px-8 py-4 rounded-lg text-lg font-semibold transition-all duration-300 shadow-xl hover:shadow-2xl"
                >
                  <FiCheckCircle className="mr-2" />
                  Apropos du formation
                </Link>
              </motion.div>
              <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                <Link 
                  to="/contact" 
                  className="inline-flex items-center border-2 border-white/30 backdrop-blur-sm bg-white/10 text-white hover:bg-white/20 px-8 py-4 rounded-lg text-lg font-semibold transition-all duration-300"
                >
                  <FiMail className="mr-2" />
                  Demander des informations
                </Link>
              </motion.div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-white pt-16 pb-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-12">
            <div>
              <div className="flex items-center mb-4">
                <img 
                  src="/cfpmarine.jpeg" 
                  alt="Logo CFP Charpentier Marine" 
                  className="h-12 w-12 rounded-full mr-3"
                />
                <span className="text-xl font-bold">CFP Charpentier Marine</span>
              </div>
              <p className="text-gray-400 mb-4">
                Centre de Formation Professionnelle spécialisé dans les métiers de la construction et de la réparation navale.
              </p>
              <div className="flex space-x-4">
                <a href="#" className="text-gray-400 hover:text-white transition">
                  <span className="sr-only">Facebook</span>
                  <svg className="h-6 w-6" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                    <path fillRule="evenodd" d="M22 12c0-5.523-4.477-10-10-10S2 6.477 2 12c0 4.991 3.657 9.128 8.438 9.878v-6.987h-2.54V12h2.54V9.797c0-2.506 1.492-3.89 3.777-3.89 1.094 0 2.238.195 2.238.195v2.46h-1.26c-1.243 0-1.63.771-1.63 1.562V12h2.773l-.443 2.89h-2.33v6.988C18.343 21.128 22 16.991 22 12z" clipRule="evenodd" />
                  </svg>
                </a>
              </div>
            </div>
            
            <div>
              <h3 className="text-lg font-semibold mb-4">Liens rapides</h3>
              <ul className="space-y-2">
                <li><Link to="/formations" className="text-gray-400 hover:text-white transition">Nos formations</Link></li>
                <li><Link to="/metiers" className="text-gray-400 hover:text-white transition">Métiers</Link></li>
                <li><Link to="/actualites" className="text-gray-400 hover:text-white transition">Actualités</Link></li>
                <li><Link to="/galerie" className="text-gray-400 hover:text-white transition">Galerie</Link></li>
                <li><Link to="/contact" className="text-gray-400 hover:text-white transition">Contact</Link></li>
              </ul>
            </div>
            
            <div>
              <h3 className="text-lg font-semibold mb-4">Nos formations</h3>
              <ul className="space-y-2">
                <li><Link to="/formations/charpente-navale" className="text-gray-400 hover:text-white transition">FPI</Link></li>
                <li><Link to="/formations/mecanique-marine" className="text-gray-400 hover:text-white transition">FPQ</Link></li>
                <li><Link to="/formations/navigation" className="text-gray-400 hover:text-white transition">AMB</Link></li>
                <li><Link to="/formations/electricite-bateau" className="text-gray-400 hover:text-white transition">CN</Link></li>
              </ul>
            </div>
            
            <div>
              <h3 className="text-lg font-semibold mb-4">Contactez-nous</h3>
              <address className="not-italic text-gray-400 space-y-3">
                <div className="flex items-start">
                  <FiMapPin className="mt-1 mr-3 flex-shrink-0" />
                  <span>Mahajanga 401, Madagascar</span>
                </div>
                <div className="flex items-center">
                  <FiPhone className="mr-3 flex-shrink-0" />
                  <span>+261 32 90 462 70</span>
                </div>
                <div className="flex items-center">
                  <FiMail className="mr-3 flex-shrink-0" />
                  <span>contact@cfp-charpentier-marine.mg</span>
                </div>
                <div className="flex items-center">
                  <FiClock className="mr-3 flex-shrink-0" />
                  <span>Lun-Ven: 8h00 - 17h00</span>
                </div>
              </address>
            </div>
          </div>
          
          <div className="border-t border-gray-800 pt-8 flex flex-col md:flex-row justify-between items-center">
            <p className="text-gray-400 text-sm">
              &copy; {new Date().getFullYear()} CFP Charpentier Marine. Tous droits réservés.
            </p>
            <div className="mt-4 md:mt-0">
              <Link to="/mentions-legales" className="text-gray-400 hover:text-white text-sm mr-4">Mentions légales</Link>
              <Link to="/confidentialite" className="text-gray-400 hover:text-white text-sm">Politique de confidentialité</Link>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Home;