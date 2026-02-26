import React from 'react';
import { motion } from 'framer-motion';
import { useInView } from 'react-intersection-observer';
import { FiClock, FiUsers, FiArrowRight } from 'react-icons/fi';
import { Link } from 'react-router-dom';

const AtelierCard = React.memo(({ atelier, index, onSelect }) => {
  const [ref, inView] = useInView({ triggerOnce: true, threshold: 0.1 });
  
  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 30 }}
      animate={inView ? { opacity: 1, y: 0 } : {}}
      transition={{ duration: 0.5, delay: index * 0.1 }}
      whileHover={{ y: -8, scale: 1.02 }}
      className="group bg-white rounded-xl overflow-hidden shadow-lg hover:shadow-2xl transition-all duration-300 border border-gray-100 cursor-pointer"
      onClick={() => onSelect(atelier)}
    >
      <div className="h-48 bg-gradient-to-br from-blue-50 to-blue-100 flex items-center justify-center relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-t from-black/30 to-transparent z-10"></div>
        <div className="relative z-20 text-blue-600 group-hover:scale-110 transition-transform duration-300">
          {atelier.icon}
        </div>
        <div className="absolute top-4 right-4 z-20">
          <span className="bg-yellow-400 text-yellow-900 text-xs font-bold px-3 py-1 rounded-full">
            {atelier.categorie}
          </span>
        </div>
        <div className="absolute bottom-0 left-0 right-0 p-4 z-20 flex justify-between items-center">
          <div className="bg-white/90 text-blue-900 text-xs font-medium px-2 py-1 rounded">
            {atelier.placesDisponibles}/{atelier.places} places
          </div>
          <div className="text-white text-xs font-medium">
            {atelier.prix}
          </div>
        </div>
      </div>
      
      <div className="p-6">
        <div className="flex items-center mb-4">
          <div className="h-10 w-1 bg-gradient-to-b from-blue-500 to-blue-700 rounded-full mr-3"></div>
          <h3 className="text-xl font-bold text-gray-900">{atelier.titre}</h3>
        </div>
        
        <p className="text-gray-600 mb-6 line-clamp-2">{atelier.description}</p>
        
        <div className="flex flex-wrap gap-2 mb-4">
          <span className={`text-xs px-2 py-1 rounded ${
            atelier.niveau === 'Débutant' ? 'bg-blue-50 text-blue-700' :
            atelier.niveau === 'Intermédiaire' ? 'bg-yellow-50 text-yellow-700' :
            'bg-green-50 text-green-700'
          }`}>
            {atelier.niveau}
          </span>
          <span className="text-xs bg-gray-50 text-gray-700 px-2 py-1 rounded flex items-center gap-1">
            <FiClock className="text-xs" /> {atelier.duree}
          </span>
        </div>
        
        <div className="flex justify-between items-center pt-4 border-t border-gray-100">
          <Link 
            to={`/inscription?atelier=${encodeURIComponent(atelier.titre)}`}
            className="text-blue-600 font-medium flex items-center group-hover:text-blue-700 transition-colors"
            onClick={(e) => e.stopPropagation()}
          >
            En savoir plus
            <FiArrowRight className="ml-2 transition-transform group-hover:translate-x-1" />
          </Link>
          <span className="text-sm text-gray-500 flex items-center">
            <FiUsers className="mr-1" /> {atelier.formateur}
          </span>
        </div>
      </div>
    </motion.div>
  );
});

export default AtelierCard;
