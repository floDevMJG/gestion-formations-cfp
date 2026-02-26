import React, { useState, useEffect, useRef } from 'react';
import { useAuth } from '../contexts/AuthContext';
import API from '../services/api';
import { toast } from 'react-toastify';
import {
  FiMessageSquare,
  FiSend,
  FiChevronDown,
  FiX,
  FiSearch,
  FiUsers,
  FiUser
} from 'react-icons/fi';

const ChatPanel = ({
  showChat,
  onClose
}) => {
  const { user } = useAuth();
  const [users, setUsers] = useState([]); // Liste des formateurs et apprenants
  const [selectedRecipient, setSelectedRecipient] = useState(null);
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [loadingUsers, setLoadingUsers] = useState(true);
  const [loadingMessages, setLoadingMessages] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const messagesEndRef = useRef(null);
  const [isPanelExpanded, setIsPanelExpanded] = useState(false); // État pour gérer l'expansion du panneau

  // Charger tous les formateurs et apprenants (pour l'admin) ou seulement l'admin (pour les formateurs)
  useEffect(() => {
    const fetchUsers = async () => {
      try {
        setLoadingUsers(true);
        const token = localStorage.getItem('token');
        if (!token) {
          setUsers([]);
          return;
        }
        
        if (user?.role === 'admin') {
          // Pour l'admin : charger tous les formateurs et apprenants
          const response = await API.get('/admin/users');
          // Filtrer pour n'obtenir que les formateurs et apprenants validés
          const filteredUsers = response.data.filter(
            u => (u.role === 'formateur' || u.role === 'apprenant') && u.statut === 'valide'
          );
          setUsers(filteredUsers);
        } else if (user?.role === 'formateur') {
          // Pour le formateur : charger seulement l'admin et les autres formateurs
          const response = await API.get('/admin/users');
          const filteredUsers = response.data.filter(
            u => u.role === 'admin' || (u.role === 'formateur' && u.id !== user.id)
          );
          setUsers(filteredUsers);
        }
      } catch (error) {
        // Silence en cas de non-autorisation/non connecté
      } finally {
        setLoadingUsers(false);
      }
    };

    if (user) {
      fetchUsers();
    }
  }, [user]);

  // Charger les messages lorsque le destinataire sélectionné change
  useEffect(() => {
    console.log('Selected recipient changed:', selectedRecipient);
    const fetchMessages = async () => {
      if (selectedRecipient) {
        try {
          setLoadingMessages(true);
          const response = await API.get(`/messages/conversation/${selectedRecipient.id}`);
          setMessages(response.data);

          // Marquer les messages reçus comme lus
          const unreadMessages = response.data.filter(
            msg => msg.receiverId === user.id && !msg.read
          );
          for (const msg of unreadMessages) {
            try {
              await API.put(`/messages/${msg.id}/read`);
              // Mettre à jour l'état local pour marquer le message comme lu
              setMessages(prevMessages =>
                prevMessages.map(m => (m.id === msg.id ? { ...m, read: true } : m))
              );
            } catch (readError) {
              console.error(`Erreur lors du marquage du message ${msg.id} comme lu:`, readError);
            }
          }
        } catch (error) {
          console.error('Erreur lors du chargement des messages:', error);
          toast.error('Erreur lors du chargement des messages.');
        } finally {
          setLoadingMessages(false);
        }
      }
    };
    fetchMessages();
  }, [selectedRecipient]);

  // Faire défiler vers le bas des messages
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSendMessage = async (e) => {
    e.preventDefault();
    console.log('Attempting to send message from:', user.id, 'to:', selectedRecipient.id, 'content:', newMessage);
    if (!newMessage.trim() || !selectedRecipient) {
      console.log('Message or recipient is missing. Aborting send.');
      return;
    }

    try {
      console.log('Sending payload:', { receiverId: selectedRecipient.id, content: newMessage });
      const response = await API.post('/messages', {
        receiverId: selectedRecipient.id,
        content: newMessage
      });
      console.log('Message sent successfully. API response:', response.data);
      setMessages(prev => [...prev, response.data.data]);
      setNewMessage('');
      toast.success('Message envoyé avec succès !');
    } catch (error) {
      console.error('Erreur lors de l\'envoi du message:', error);
      console.error('Error response data:', error.response?.data);
      toast.error(error.response?.data?.message || 'Échec de l\'envoi du message.');
    }
  };

  const filteredUsers = users.filter(u =>
    u.nom.toLowerCase().includes(searchTerm.toLowerCase()) ||
    u.prenom.toLowerCase().includes(searchTerm.toLowerCase()) ||
    u.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (!showChat) return null;

  return (
    <div
      className={`fixed right-0 top-0 h-full bg-white shadow-lg z-[9999] transition-all duration-300 ease-in-out
        ${isPanelExpanded ? 'w-full md:w-1/2 lg:w-1/3' : 'w-80'}`}
      style={{ top: 0 }}
    >
      <div className="flex flex-col h-full">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-blue-700/30 bg-gradient-to-r from-blue-600 to-indigo-600 text-white">
          <h2 className="text-lg font-semibold flex items-center tracking-wide">
            <FiMessageSquare className="mr-2" />
            {user?.role === 'admin' ? 'Chat Admin' : 'Messagerie'}
          </h2>
          <div className="flex items-center">
            <button
              onClick={() => setIsPanelExpanded(!isPanelExpanded)}
              className="p-2 rounded-full hover:bg-blue-700/60 focus:outline-none focus:ring-2 focus:ring-white/40 mr-2"
              title={isPanelExpanded ? 'Réduire' : 'Agrandir'}
            >
              {isPanelExpanded ? <FiChevronDown className="transform rotate-90" /> : <FiChevronDown />}
            </button>
            <button
              onClick={onClose}
              className="p-2 rounded-full hover:bg-blue-700/60 focus:outline-none focus:ring-2 focus:ring-white/40"
              title="Fermer"
            >
              <FiX />
            </button>
          </div>
        </div>

        {/* Sélection du destinataire */}
        <div className="p-4 border-b border-gray-200">
          <div className="relative mb-3">
            <input
              type="text"
              placeholder={user?.role === 'admin' ? "Rechercher formateur ou apprenant..." : "Rechercher l'administration..."}
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full p-2 pl-10 border border-gray-300 rounded-full bg-gray-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 shadow-sm"
            />
            <FiSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
          </div>
          <div className="max-h-40 overflow-y-auto bg-gray-50 rounded-xl border border-gray-100">
            {loadingUsers ? (
              <p className="p-2 text-gray-600">Chargement des utilisateurs...</p>
            ) : filteredUsers.length === 0 ? (
              <p className="p-2 text-gray-600">Aucun utilisateur trouvé.</p>
            ) : (
              <ul className="divide-y divide-gray-200">
                {filteredUsers.map(u => (
                  <li
                    key={u.id}
                    onClick={() => {
                      setSelectedRecipient(u);
                      setSearchTerm(''); // Effacer la recherche après sélection
                    }}
                    className={`flex items-center p-3 cursor-pointer hover:bg-blue-50 transition-colors ${selectedRecipient?.id === u.id ? 'bg-blue-50' : 'bg-white'}`}
                  >
                    <FiUser className="mr-2 text-gray-500" />
                    <span className="font-medium text-gray-800">{u.nom} {u.prenom}</span>
                    <span className="text-sm text-gray-500 ml-2">({u.role})</span>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>

        {/* Zone de conversation */}
        <div className="flex-1 overflow-y-auto p-4 bg-gradient-to-br from-gray-50 to-white">
          {!selectedRecipient ? (
            <div className="flex flex-col items-center justify-center h-full text-gray-500">
              <FiUsers className="text-4xl mb-3" />
              <p>Sélectionnez un utilisateur pour commencer à discuter.</p>
            </div>
          ) : loadingMessages ? (
            <div className="flex items-center justify-center h-full">
              <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-blue-500"></div>
            </div>
          ) : (messages.length === 0 ? (
            <div className="flex items-center justify-center h-full text-gray-500">
                <p>Aucun message avec {selectedRecipient.nom} {selectedRecipient.prenom}. Soyez le premier à envoyer un message !</p>
            </div>
          ) : (
            <div className="space-y-4">
              {messages.map((msg, index) => {
                const showDate = index === 0 || new Date(msg.createdAt).toDateString() !== new Date(messages[index - 1].createdAt).toDateString();
                return (
                <div
                  key={msg.id}
                  className={`flex ${msg.senderId === user.id ? 'justify-end' : 'justify-start'} items-end gap-2`}
                >
                  {showDate && (
                    <div className="w-full flex justify-center my-2">
                      <span className="text-xs text-gray-500 bg-gray-200/60 px-3 py-1 rounded-full">
                        {new Date(msg.createdAt).toLocaleDateString('fr-FR', { day: '2-digit', month: 'short', year: 'numeric' })}
                      </span>
                    </div>
                  )}
                  {msg.senderId !== user.id && (
                    <div className="w-7 h-7 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center text-xs font-semibold">
                      {selectedRecipient?.prenom?.[0]}{selectedRecipient?.nom?.[0]}
                    </div>
                  )}
                  <div
                    className={`max-w-[70%] px-4 py-2 rounded-2xl shadow-md ${msg.senderId === user.id
                      ? 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-tr-none'
                      : 'bg-white text-gray-800 border border-gray-100 rounded-tl-none'
                      }`}
                  >
                    <p className="text-sm leading-relaxed">{msg.content}</p>
                    <div className="flex justify-end">
                      <span className={`text-[10px] mt-1 ${msg.senderId === user.id ? 'text-blue-100' : 'text-gray-400'}`}>
                        {new Date(msg.createdAt).toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })}
                      </span>
                    </div>
                  </div>
                  {msg.senderId === user.id && (
                    <div className="w-7 h-7 rounded-full bg-blue-600 text-white flex items-center justify-center text-xs font-semibold">
                      {user?.prenom?.[0]}{user?.nom?.[0]}
                    </div>
                  )}
                </div>
                );
              })}
              <div ref={messagesEndRef} />
            </div>
          ))}
        </div>

        {/* Zone de saisie du message */}
        <form onSubmit={handleSendMessage} className="p-4 border-t border-gray-200 bg-white">
          <div className="flex items-center bg-gray-50 border border-gray-200 rounded-full px-3 py-2">
            <input
              type="text"
              value={newMessage}
              onChange={(e) => setNewMessage(e.target.value)}
              placeholder={selectedRecipient ? `Écrire un message à ${selectedRecipient.prenom}...` : 'Sélectionnez un destinataire'}
              className="flex-1 bg-transparent border-none focus:outline-none focus:ring-0 px-2 text-sm"
              disabled={!selectedRecipient}
            />
            <button
              type="submit"
              className={`p-2 rounded-full ${selectedRecipient ? 'bg-blue-600 hover:bg-blue-700' : 'bg-gray-400 cursor-not-allowed'} text-white transition-colors ml-2`}
              disabled={!selectedRecipient}
            >
              <FiSend className="text-xl" />
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ChatPanel;
