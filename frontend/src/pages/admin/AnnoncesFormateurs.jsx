import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import API from '../../services/api';
import { FiSend, FiList, FiType, FiFileText } from 'react-icons/fi';
import { toast } from 'react-toastify';

export default function AnnoncesFormateurs() {
  const [titre, setTitre] = useState('');
  const [contenu, setContenu] = useState('');
  const [loading, setLoading] = useState(false);
  const [annonces, setAnnonces] = useState([]);

  useEffect(() => {
    fetchAnnonces();
  }, []);

  const fetchAnnonces = async () => {
    try {
      const res = await API.get('/admin/annonces/formateurs');
      setAnnonces(res.data || []);
    } catch (e) {
      console.error(e);
      toast.error("Erreur lors du chargement des annonces");
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!titre.trim() || !contenu.trim()) {
      toast.warn('Veuillez renseigner le titre et le contenu');
      return;
    }
    try {
      setLoading(true);
      await API.post('/admin/annonces/formateurs', { titre, contenu });
      toast.success('Annonce envoyée aux formateurs');
      setTitre('');
      setContenu('');
      fetchAnnonces();
    } catch (e) {
      console.error(e);
      toast.error("Erreur lors de l'envoi de l'annonce");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-8">
      <div className="max-w-5xl mx-auto space-y-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Annonces Formateurs</h1>
          <p className="text-gray-600">Rédigez et envoyez une annonce à tous les formateurs.</p>
        </div>

        <form onSubmit={handleSubmit} className="bg-white rounded-2xl border border-gray-200 shadow-sm p-6 space-y-4">
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">Titre</label>
            <div className="relative">
              <FiType className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                value={titre}
                onChange={(e) => setTitre(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Sujet de l'annonce"
              />
            </div>
          </div>
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">Contenu</label>
            <div className="relative">
              <FiFileText className="absolute left-3 top-3 text-gray-400" />
              <textarea
                value={contenu}
                onChange={(e) => setContenu(e.target.value)}
                rows={6}
                className="w-full pl-10 pr-4 py-2.5 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Rédigez votre message..."
              />
            </div>
          </div>
          <div className="flex justify-end">
            <motion.button
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.97 }}
              disabled={loading}
              type="submit"
              className="inline-flex items-center gap-2 px-6 py-2.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-60"
            >
              <FiSend />
              Envoyer
            </motion.button>
          </div>
        </form>

        <div className="bg-white rounded-2xl border border-gray-200 shadow-sm">
          <div className="px-6 py-4 border-b border-gray-100 flex items-center gap-2">
            <FiList className="text-gray-500" />
            <h2 className="text-lg font-semibold text-gray-800">Annonces envoyées</h2>
          </div>
          <div className="divide-y divide-gray-100">
            {annonces.length === 0 ? (
              <div className="p-6 text-gray-500">Aucune annonce pour le moment</div>
            ) : annonces.map(a => (
              <div key={a.id} className="p-6">
                <div className="flex items-center justify-between">
                  <h3 className="text-xl font-semibold text-gray-900">{a.titre}</h3>
                  <span className="text-sm text-gray-500">{new Date(a.createdAt).toLocaleString('fr-FR')}</span>
                </div>
                <p className="text-gray-700 mt-2 whitespace-pre-line">{a.contenu}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

