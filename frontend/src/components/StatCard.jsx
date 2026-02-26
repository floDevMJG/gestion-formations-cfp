import React from 'react';
import { motion } from 'framer-motion';
import { useInView } from 'react-intersection-observer';
import { useNavigate } from 'react-router-dom';
import { FiTrendingUp } from 'react-icons/fi';

const StatCard = ({ stat, index }) => {
  const navigate = useNavigate();
  const [ref, inView] = useInView({ triggerOnce: true, threshold: 0.1 });

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 30 }}
      animate={inView ? { opacity: 1, y: 0 } : {}}
      transition={{ duration: 0.5, delay: index * 0.1 }}
      whileHover={{ y: -8, scale: 1.02 }}
      onClick={() => navigate(stat.link)}
      className={`relative bg-white rounded-xl shadow-lg hover:shadow-2xl transition-all duration-300 cursor-pointer overflow-hidden group ${
        stat.urgent ? 'ring-2 ring-yellow-400' : ''
      }`}
    >
      {/* Gradient overlay on hover */}
      <div className={`absolute inset-0 bg-gradient-to-br ${stat.gradient} opacity-0 group-hover:opacity-10 transition-opacity duration-300`}></div>

      {/* Decorative corner */}
      <div className={`absolute top-0 right-0 w-24 h-24 bg-gradient-to-br ${stat.gradient} opacity-5 rounded-bl-full`}></div>

      <div className="relative p-6">
        <div className="flex items-center justify-between mb-4">
          <div className={`p-3 rounded-xl bg-gradient-to-br ${stat.bgGradient} group-hover:scale-110 transition-transform duration-300`}>
            <div className={stat.color}>
              {stat.icon}
            </div>
          </div>
          {stat.urgent && (
            <span className="px-2 py-1 bg-yellow-400 text-yellow-900 text-xs font-bold rounded-full animate-pulse">
              Urgent
            </span>
          )}
        </div>
        <p className="text-gray-600 text-sm font-medium mb-2">{stat.title}</p>
        <p className={`text-4xl font-bold ${stat.color} mb-1`}>{stat.value}</p>
        <div className="flex items-center text-xs text-gray-500 mt-2">
          <span>Cliquez pour voir</span>
          <FiTrendingUp className="ml-1 group-hover:translate-x-1 transition-transform" />
        </div>
      </div>
    </motion.div>
  );
};

export default StatCard;