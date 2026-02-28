import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  FiUsers, FiUserPlus, FiEdit2, FiTrash2, FiSearch, 
  FiFilter, FiCheck, FiX, FiMail, FiLock, FiUser, 
  FiUserCheck, FiUserX, FiCopy, FiSend, FiChevronDown, 
  FiChevronUp, FiClock, FiMoreVertical 
} from 'react-icons/fi';
import API from '../../services/api';
import { toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

/* ======================= ANIMATIONS ======================= */
const pageVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { 
    opacity: 1, 
    y: 0,
    transition: { duration: 0.6, ease: [0.22, 1, 0.36, 1] }
  }
};

const staggerContainer = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.08,
      delayChildren: 0.2
    }
  }
};

const cardVariants = {
  hidden: { opacity: 0, y: 20, scale: 0.95 },
  visible: { 
    opacity: 1, 
    y: 0, 
    scale: 1,
    transition: { duration: 0.5, ease: [0.22, 1, 0.36, 1] }
  }
};

const modalVariants = {
  hidden: { opacity: 0, scale: 0.9 },
  visible: { 
    opacity: 1, 
    scale: 1,
    transition: { duration: 0.3, ease: [0.22, 1, 0.36, 1] }
  },
  exit: { 
    opacity: 0, 
    scale: 0.9,
    transition: { duration: 0.2 }
  }
};

/* ======================= LOADING SPINNER ======================= */
const LoadingSpinner = () => (
  <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50">
    <div className="relative">
      <motion.div
        className="w-16 h-16 border-4 border-blue-200 border-t-blue-600 rounded-full"
        animate={{ rotate: 360 }}
        transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
      />
      <motion.div
        className="absolute inset-0 w-16 h-16 border-4 border-transparent border-b-indigo-400 rounded-full"
        animate={{ rotate: -360 }}
        transition={{ duration: 1.5, repeat: Infinity, ease: "linear" }}
      />
    </div>
  </div>
);

/* ======================= STAT CARD ======================= */
const StatCard = ({ icon: Icon, label, value, color, gradient }) => (
  <motion.div
    variants={cardVariants}
    whileHover={{ y: -4, scale: 1.02 }}
    className="relative overflow-hidden rounded-2xl bg-white/80 backdrop-blur-xl border border-gray-200/50 shadow-lg shadow-gray-200/50 p-6 group"
  >
    <div className={`absolute inset-0 bg-gradient-to-br ${gradient} opacity-0 group-hover:opacity-5 transition-opacity duration-500`} />
    <div className="relative z-10">
      <div className={`inline-flex p-3 rounded-xl bg-gradient-to-br ${gradient} mb-4`}>
        <Icon className="w-6 h-6 text-white" />
      </div>
      <div className="space-y-1">
        <p className="text-sm font-medium text-gray-600">{label}</p>
        <p className="text-3xl font-bold bg-gradient-to-r from-gray-900 to-gray-700 bg-clip-text text-transparent">
          {value}
        </p>
      </div>
    </div>
    <div className="absolute -right-8 -bottom-8 w-32 h-32 bg-gradient-to-br from-gray-100 to-transparent rounded-full blur-2xl opacity-50" />
  </motion.div>
);

/* ======================= USER ROW ======================= */
const UserRow = ({ user, onEdit, onDelete, onValidate, onReject, onPending, index }) => {
  const [menuOpen, setMenuOpen] = useState(false);
  
  const getRoleBadge = (role) => {
    const styles = {
      admin: 'bg-gradient-to-r from-purple-500 to-pink-500 text-white',
      formateur: 'bg-gradient-to-r from-blue-500 to-cyan-500 text-white',
      apprenant: 'bg-gradient-to-r from-green-500 to-emerald-500 text-white'
    };
    return styles[role] || 'bg-gray-200 text-gray-700';
  };

  const getStatutBadge = (statut) => {
    const styles = {
      actif: 'bg-green-100 text-green-700 border-green-200',
      valide: 'bg-green-100 text-green-700 border-green-200',
      en_attente: 'bg-amber-100 text-amber-700 border-amber-200',
      inactif: 'bg-gray-100 text-gray-700 border-gray-200',
      rejete: 'bg-red-100 text-red-700 border-red-200'
    };
    return styles[statut] || 'bg-gray-100 text-gray-700';
  };

  return (
    <motion.tr
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay: index * 0.05 }}
      className="group hover:bg-blue-50/50 transition-colors duration-200 border-b border-gray-100 last:border-0"
    >
      <td className="px-6 py-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center text-white font-semibold shadow-lg shadow-blue-200">
            {user.nom?.charAt(0)}{user.prenom?.charAt(0)}
          </div>
          <div>
            <p className="font-semibold text-gray-900">{user.nom}</p>
            <p className="text-sm text-gray-500">{user.prenom}</p>
          </div>
        </div>
      </td>
      <td className="px-6 py-4">
        <div className="flex items-center gap-2 text-gray-700">
          <FiMail className="w-4 h-4 text-gray-400" />
          <span className="text-sm">{user.email}</span>
        </div>
      </td>
      <td className="px-6 py-4">
        <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold ${getRoleBadge(user.role)} shadow-sm`}>
          {user.role}
        </span>
      </td>
      <td className="px-6 py-4">
        <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium border ${getStatutBadge(user.statut)}`}>
          <span className="w-1.5 h-1.5 rounded-full bg-current" />
          {user.statut === 'valide' ? 'Déjà validé' : user.statut}
        </span>
      </td>
      <td className="px-6 py-4">
        <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
          {user.statut === 'en_attente' && (
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => onValidate(user.id)}
              className="p-2 rounded-lg bg-green-100 text-green-600 hover:bg-green-200 transition-colors"
              title="Valider"
            >
              <FiUserCheck className="w-4 h-4" />
            </motion.button>
          )}
          {user.statut === 'valide' && user.role === 'formateur' && (
            <>
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => onValidate(user.id)}
                className="p-2 rounded-lg bg-green-100 text-green-600 hover:bg-green-200 transition-colors"
                title="Valider à nouveau (régénérer le code)"
              >
                <FiUserCheck className="w-4 h-4" />
              </motion.button>
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => window.dispatchEvent(new CustomEvent('resend-code', { detail: user.id }))}
                className="p-2 rounded-lg bg-indigo-100 text-indigo-600 hover:bg-indigo-200 transition-colors"
                title="Renvoyer le code par email"
              >
                <FiMail className="w-4 h-4" />
              </motion.button>
            </>
          )}
          {user.statut !== 'rejete' && (
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => onReject(user.id)}
              className="p-2 rounded-lg bg-rose-100 text-rose-600 hover:bg-rose-200 transition-colors"
              title="Rejeter"
            >
              <FiUserX className="w-4 h-4" />
            </motion.button>
          )}
          {user.statut !== 'en_attente' && (
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => onPending(user.id)}
              className="p-2 rounded-lg bg-amber-100 text-amber-700 hover:bg-amber-200 transition-colors"
              title="Remettre en attente"
            >
              <FiClock className="w-4 h-4" />
            </motion.button>
          )}
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => onEdit(user)}
            className="p-2 rounded-lg bg-blue-100 text-blue-600 hover:bg-blue-200 transition-colors"
            title="Modifier"
          >
            <FiEdit2 className="w-4 h-4" />
          </motion.button>
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => onDelete(user.id)}
            className="p-2 rounded-lg bg-red-100 text-red-600 hover:bg-red-200 transition-colors"
            title="Supprimer"
          >
            <FiTrash2 className="w-4 h-4" />
          </motion.button>
        </div>
      </td>
    </motion.tr>
  );
};

/* ======================= MAIN COMPONENT ======================= */
export default function GestionUsers() {
  const [searchParams, setSearchParams] = useSearchParams();
  const roleFilter = searchParams.get('role');
  const statutFilter = searchParams.get('statut');
  
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filtersOpen, setFiltersOpen] = useState(false);
  const [formData, setFormData] = useState({
    nom: '',
    prenom: '',
    email: '',
    password: '',
    role: 'apprenant',
    statut: 'actif'
  });

  const roles = [
    { value: 'apprenant', label: 'Apprenant', icon: FiUser },
    { value: 'formateur', label: 'Formateur', icon: FiUserCheck },
    { value: 'admin', label: 'Administrateur', icon: FiUsers }
  ];

  const statuts = [
    { value: 'en_attente', label: 'En attente', icon: FiClock },
    { value: 'actif', label: 'Actif', icon: FiCheck },
    { value: 'inactif', label: 'Inactif', icon: FiX },
    { value: 'rejete', label: 'Rejeté', icon: FiUserX }
  ];

  /* ======================= DATA FETCHING ======================= */
  useEffect(() => {
    fetchUsers();
  }, [roleFilter, statutFilter]);

  const fetchUsers = async () => {
    try {
      const res = await API.get('/admin/users');
      setUsers(res.data);
    } catch (e) {
      toast.error('Erreur lors du chargement des utilisateurs');
      console.error(e);
    } finally {
      setLoading(false);
    }
  };
  
  useEffect(() => {
    const handler = (e) => {
      const id = e.detail;
      if (id) {
        handleResendCode(id);
      }
    };
    window.addEventListener('resend-code', handler);
    return () => window.removeEventListener('resend-code', handler);
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editingId) {
        await API.put(`/admin/users/${editingId}`, formData);
        toast.success('Utilisateur modifié avec succès');
      } else {
        await API.post('/admin/users', formData);
        toast.success('Utilisateur créé avec succès');
      }
      fetchUsers();
      setShowForm(false);
      resetForm();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Une erreur est survenue');
    }
  };

  const handleEdit = (user) => {
    setFormData({
      nom: user.nom,
      prenom: user.prenom,
      email: user.email,
      password: '',
      role: user.role,
      statut: user.statut
    });
    setEditingId(user.id);
    setShowForm(true);
  };

  const handleDelete = async (id) => {
    if (window.confirm('Êtes-vous sûr de vouloir supprimer cet utilisateur ?')) {
    try {
      await API.delete(`/admin/users/${id}`);
        toast.success('Utilisateur supprimé');
      fetchUsers();
    } catch (error) {
        toast.error('Erreur lors de la suppression');
      }
    }
  };

  const handleValidate = async (id) => {
    try {
      console.log(`🔄 Validation de l'utilisateur ID: ${id}`);
      
      const message = window.prompt('Message à inclure dans l\'email de validation (optionnel):', '');
      console.log(`📧 Message admin: "${message}"`);
      
      console.log(`📡 Envoi requête API: PUT /admin/users/${id}/validate`);
      const res = await API.put(`/admin/users/${id}/validate`, { message });
      
      console.log('✅ Réponse API:', res.data);
      toast.success('Utilisateur validé avec succès');
      
      const code = res.data?.user?.codeFormateur || res.data?.codeFormateur;
      if (code) {
        console.log(`🔢 Code formateur généré: ${code}`);
        toast.info(`Code formateur: ${code}`, { autoClose: 7000 });
      }
      
      console.log('🔄 Rafraîchissement de la liste des utilisateurs...');
      fetchUsers();
      
    } catch (error) {
      console.error('❌ Erreur validation:', error);
      
      const errorMessage = error.response?.data?.message || error.message || 'Erreur lors de la validation';
      console.error(`📝 Message d'erreur: ${errorMessage}`);
      console.error(`📊 Status: ${error.response?.status}`);
      console.error(`📄 Response data:`, error.response?.data);
      
      toast.error(errorMessage);
      
      // Messages d'aide spécifiques
      if (error.response?.status === 401) {
        toast.error('Session expirée. Veuillez vous reconnecter.', { autoClose: 5000 });
        setTimeout(() => {
          window.location.href = '/login';
        }, 2000);
      }
      
      if (error.response?.status === 400) {
        toast.error('Cet utilisateur est déjà validé ou les données sont invalides.', { autoClose: 5000 });
      }
      
      if (error.response?.status === 404) {
        toast.error('Utilisateur non trouvé.', { autoClose: 5000 });
      }
    }
  };
  
  const handleResendCode = async (id) => {
    try {
      console.log(`🔄 Renvoi du code pour l'utilisateur ID: ${id}`);
      
      console.log(`📡 Envoi requête API: POST /admin/users/${id}/resend-code`);
      const res = await API.post(`/admin/users/${id}/resend-code`);
      const code = res.data?.codeFormateur;
      toast.success('Email de code renvoyé au formateur');
      if (code) {
        toast.info(`Code formateur: ${code}`, { autoClose: 7000 });
      }
    } catch (error) {
      toast.error(error.response?.data?.message || 'Erreur lors de l’envoi du code');
    }
  };

  const handleReject = async (id) => {
    try {
      await API.put(`/admin/users/${id}/reject`);
      toast.success('Utilisateur rejeté');
      fetchUsers();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Erreur lors du rejet');
    }
  };

  const handlePending = async (id) => {
    try {
      await API.put(`/admin/users/${id}/pending`);
      toast.success('Utilisateur remis en attente');
      fetchUsers();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Erreur lors de la mise en attente');
    }
  };

  const resetForm = () => {
    setFormData({
      nom: '',
      prenom: '',
      email: '',
      password: '',
      role: 'apprenant',
      statut: 'actif'
    });
    setEditingId(null);
  };

  /* ======================= FILTERING ======================= */
  const filteredUsers = users.filter(u =>
    (!roleFilter || u.role === roleFilter) &&
    (!statutFilter || u.statut === statutFilter) &&
    (
      u.nom?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      u.prenom?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      u.email?.toLowerCase().includes(searchTerm.toLowerCase())
    )
  );

  const userStats = users.reduce((acc, u) => {
    acc[u.statut] = (acc[u.statut] || 0) + 1;
    acc.total = (acc.total || 0) + 1;
    return acc;
  }, {});

  if (loading) return <LoadingSpinner />;

  /* ======================= RENDER ======================= */
  return (
    <motion.div
      initial="hidden"
      animate="visible"
      variants={pageVariants}
      className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 p-8"
    >
      <div className="max-w-7xl mx-auto space-y-8">
        {/* ===== HEADER ===== */}
        <motion.div 
          variants={cardVariants}
          className="flex flex-col md:flex-row md:items-center justify-between gap-6"
        >
          <div>
            <h1 className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-gray-900 via-blue-800 to-indigo-900 bg-clip-text text-transparent mb-2">
              Gestion des utilisateurs
          </h1>
            <p className="text-gray-600 text-lg">
              Gérez vos utilisateurs en toute simplicité
            </p>
        </div>
          <motion.button
            whileHover={{ scale: 1.05, boxShadow: "0 20px 40px rgba(59, 130, 246, 0.3)" }}
            whileTap={{ scale: 0.95 }}
            onClick={() => {
              resetForm();
              setShowForm(true);
            }}
            className="px-6 py-3.5 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-xl font-semibold flex items-center gap-2 shadow-lg shadow-blue-500/30 hover:shadow-xl hover:shadow-blue-500/40 transition-all duration-300"
          >
            <FiUserPlus className="w-5 h-5" />
            Nouvel utilisateur
          </motion.button>
        </motion.div>

        {/* ===== STATS CARDS ===== */}
        <motion.div
          variants={staggerContainer}
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6"
        >
          <StatCard
            icon={FiUsers}
            label="Total"
            value={userStats.total || 0}
            gradient="from-blue-500 to-indigo-600"
          />
          <StatCard
            icon={FiCheck}
            label="Actifs"
            value={userStats.actif || 0}
            gradient="from-green-500 to-emerald-600"
          />
          <StatCard
            icon={FiClock}
            label="En attente"
            value={userStats.en_attente || 0}
            gradient="from-amber-500 to-orange-600"
          />
          <StatCard
            icon={FiX}
            label="Inactifs"
            value={userStats.inactif || 0}
            gradient="from-gray-500 to-slate-600"
          />
          <StatCard
            icon={FiUserX}
            label="Rejetés"
            value={userStats.rejete || 0}
            gradient="from-red-500 to-rose-600"
          />
        </motion.div>

        {/* ===== SEARCH & FILTERS ===== */}
        <motion.div
          variants={cardVariants}
          className="bg-white/80 backdrop-blur-xl rounded-2xl border border-gray-200/50 shadow-lg shadow-gray-200/50 p-6"
        >
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1 relative">
              <FiSearch className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="text"
                placeholder="Rechercher par nom, prénom ou email..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-12 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
              />
        </div>
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => setFiltersOpen(!filtersOpen)}
              className="px-6 py-3 bg-gray-100 hover:bg-gray-200 rounded-xl font-medium flex items-center gap-2 transition-colors"
            >
              <FiFilter className="w-5 h-5" />
              Filtres
              {filtersOpen ? <FiChevronUp className="w-4 h-4" /> : <FiChevronDown className="w-4 h-4" />}
            </motion.button>
          </div>

          <AnimatePresence>
            {filtersOpen && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: 'auto', opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                transition={{ duration: 0.3 }}
                className="overflow-hidden"
              >
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-6 pt-6 border-t border-gray-200">
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">Rôle</label>
                    <select
                      value={roleFilter || ''}
                      onChange={(e) => setSearchParams(e.target.value ? { role: e.target.value } : {})}
                      className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    >
                      <option value="">Tous les rôles</option>
                      {roles.map(r => (
                        <option key={r.value} value={r.value}>{r.label}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">Statut</label>
                    <select
                      value={statutFilter || ''}
                      onChange={(e) => setSearchParams(e.target.value ? { statut: e.target.value } : {})}
                      className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    >
                      <option value="">Tous les statuts</option>
                      {statuts.map(s => (
                        <option key={s.value} value={s.value}>{s.label}</option>
                      ))}
                    </select>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>

        {/* ===== USERS TABLE ===== */}
        <motion.div
          variants={cardVariants}
          className="bg-white/80 backdrop-blur-xl rounded-2xl border border-gray-200/50 shadow-lg shadow-gray-200/50 overflow-hidden"
        >
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gradient-to-r from-gray-50 to-blue-50 border-b border-gray-200">
                <tr>
                  <th className="px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">
                    Utilisateur
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">
                    Email
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">
                    Rôle
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">
                    Statut
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {filteredUsers.length === 0 ? (
                  <tr>
                    <td colSpan="5" className="px-6 py-12 text-center">
                      <div className="flex flex-col items-center gap-3">
                        <div className="w-16 h-16 rounded-full bg-gray-100 flex items-center justify-center">
                          <FiUsers className="w-8 h-8 text-gray-400" />
                        </div>
                        <p className="text-gray-500 font-medium">Aucun utilisateur trouvé</p>
                      </div>
                    </td>
                  </tr>
                ) : (
                  filteredUsers.map((user, index) => (
                    <UserRow
                      key={user.id}
                      user={user}
                      index={index}
                      onEdit={handleEdit}
                      onDelete={handleDelete}
                      onValidate={handleValidate}
                      onReject={handleReject}
                      onPending={handlePending}
                    />
                  ))
                )}
              </tbody>
            </table>
          </div>
        </motion.div>
      </div>

      {/* ===== MODAL FORM ===== */}
      <AnimatePresence>
      {showForm && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 z-50"
            onClick={() => {
              setShowForm(false);
              resetForm();
            }}
          >
            <motion.div
              variants={modalVariants}
              initial="hidden"
              animate="visible"
              exit="exit"
              onClick={(e) => e.stopPropagation()}
              className="bg-white rounded-3xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto"
            >
              <div className="sticky top-0 bg-gradient-to-r from-blue-600 to-indigo-600 px-8 py-6 rounded-t-3xl">
                <div className="flex items-center justify-between">
                  <h2 className="text-2xl font-bold text-white">
                    {editingId ? 'Modifier' : 'Créer'} un utilisateur
          </h2>
                  <motion.button
                    whileHover={{ scale: 1.1, rotate: 90 }}
                    whileTap={{ scale: 0.9 }}
                    onClick={() => {
                      setShowForm(false);
                      resetForm();
                    }}
                    className="p-2 hover:bg-white/20 rounded-full transition-colors"
                  >
                    <FiX className="w-6 h-6 text-white" />
                  </motion.button>
                </div>
              </div>

              <form onSubmit={handleSubmit} className="p-8 space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Nom
                    </label>
                    <div className="relative">
                      <FiUser className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type="text"
                  value={formData.nom}
                  onChange={(e) => setFormData({ ...formData, nom: e.target.value })}
                  required
                        className="w-full pl-12 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                        placeholder="Entrez le nom"
                />
              </div>
                  </div>

              <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Prénom
                    </label>
                    <div className="relative">
                      <FiUser className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type="text"
                  value={formData.prenom}
                  onChange={(e) => setFormData({ ...formData, prenom: e.target.value })}
                  required
                        className="w-full pl-12 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                        placeholder="Entrez le prénom"
                />
              </div>
                  </div>
                </div>

              <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Email
                  </label>
                  <div className="relative">
                    <FiMail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  required
                      className="w-full pl-12 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                      placeholder="exemple@email.com"
                />
              </div>
                </div>

              <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Mot de passe {editingId && '(laisser vide pour ne pas changer)'}
                </label>
                  <div className="relative">
                    <FiLock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type="password"
                  value={formData.password}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                  required={!editingId}
                      className="w-full pl-12 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                      placeholder="••••••••"
                />
              </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Rôle
                    </label>
                <select
                  value={formData.role}
                  onChange={(e) => setFormData({ ...formData, role: e.target.value })}
                      className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                    >
                      {roles.map(r => (
                        <option key={r.value} value={r.value}>{r.label}</option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Statut
                    </label>
                    <select
                      value={formData.statut}
                      onChange={(e) => setFormData({ ...formData, statut: e.target.value })}
                      className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                    >
                      {statuts.map(s => (
                        <option key={s.value} value={s.value}>{s.label}</option>
                      ))}
                    </select>
                  </div>
      </div>

                <div className="flex gap-4 pt-6 border-t border-gray-200">
                  <motion.button
                    type="button"
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                onClick={() => {
                      setShowForm(false);
                      resetForm();
                }}
                    className="flex-1 px-6 py-3 bg-gray-100 hover:bg-gray-200 text-gray-700 font-semibold rounded-xl transition-colors"
              >
                Annuler
                  </motion.button>
                  <motion.button
                    type="submit"
                    whileHover={{ scale: 1.02, boxShadow: "0 20px 40px rgba(59, 130, 246, 0.3)" }}
                    whileTap={{ scale: 0.98 }}
                    className="flex-1 px-6 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-semibold rounded-xl shadow-lg shadow-blue-500/30 hover:shadow-xl hover:shadow-blue-500/40 transition-all"
                  >
                    {editingId ? 'Modifier' : 'Créer'}
                  </motion.button>
            </div>
              </form>
            </motion.div>
          </motion.div>
      )}
      </AnimatePresence>
    </motion.div>
  );
}
