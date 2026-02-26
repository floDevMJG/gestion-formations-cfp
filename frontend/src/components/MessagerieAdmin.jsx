import React, { useState, useEffect } from 'react';
import { FiSend, FiUser, FiMail, FiMessageSquare, FiChevronDown, FiSearch, FiClock } from 'react-icons/fi';
import API from '../services/api';
import { useAuth } from '../contexts/AuthContext';

const MessagerieAdmin = () => {
  const [conversations, setConversations] = useState([]);
  const [users, setUsers] = useState([]);
  const [filteredItems, setFilteredItems] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedUser, setSelectedUser] = useState(null);
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [loading, setLoading] = useState(true);
  const { user: currentUser } = useAuth();

  // Charger les conversations et les utilisateurs
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        // Charger les conversations récentes
        const conversationsResponse = await API.get('/messages/conversations');
        setConversations(conversationsResponse.data);

        // Charger tous les utilisateurs pour la recherche (via endpoints admin filtrés)
        const [formateursResponse, apprenantsResponse] = await Promise.all([
          API.get('/admin/users?role=formateur'),
          API.get('/admin/users?role=apprenant')
        ]);
        
        const allUsers = [
          ...formateursResponse.data.map(u => ({ ...u, type: 'formateur' })),
          ...apprenantsResponse.data.map(u => ({ ...u, type: 'apprenant' }))
        ];
        
        setUsers(allUsers);
        setFilteredItems(conversationsResponse.data); // Par défaut, afficher les conversations
        setLoading(false);
      } catch (error) {
        console.error('Erreur lors du chargement des données:', error);
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  // Filtrer les conversations ou utilisateurs
  useEffect(() => {
    if (!searchTerm.trim()) {
      setFilteredItems(conversations);
      return;
    }

    const term = searchTerm.toLowerCase();
    
    // Rechercher dans les conversations existantes
    const matchingConversations = conversations.filter(conv => 
      `${conv.user.prenom} ${conv.user.nom}`.toLowerCase().includes(term)
    );

    // Rechercher dans les autres utilisateurs (ceux qui n'ont pas de conversation active)
    const existingUserIds = new Set(conversations.map(c => c.user.id));
    const matchingUsers = users
      .filter(user => !existingUserIds.has(user.id))
      .filter(user => 
        `${user.prenom} ${user.nom}`.toLowerCase().includes(term)
      )
      .map(user => ({
        user,
        lastMessage: null,
        unreadCount: 0
      }));

    setFilteredItems([...matchingConversations, ...matchingUsers]);
  }, [searchTerm, conversations, users]);

  // Charger les messages avec un utilisateur sélectionné
  useEffect(() => {
    if (selectedUser) {
      loadMessages(selectedUser.id);
      // Marquer la conversation comme lue localement
      setConversations(prev => prev.map(conv => {
        if (conv.user.id === selectedUser.id) {
          return { ...conv, unreadCount: 0 };
        }
        return conv;
      }));
    }
  }, [selectedUser]);

  const loadMessages = async (userId) => {
    try {
      const response = await API.get(`/messages/conversation/${userId}`);
      setMessages(response.data);
    } catch (error) {
      console.error('Erreur lors du chargement des messages:', error);
    }
  };

  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!newMessage.trim() || !selectedUser) return;

    try {
      const response = await API.post('/messages', {
        receiverId: selectedUser.id,
        content: newMessage
      });
      
      setNewMessage('');
      loadMessages(selectedUser.id);
      
      // Mettre à jour la liste des conversations
      const updatedConversations = await API.get('/messages/conversations');
      setConversations(updatedConversations.data);
    } catch (error) {
      console.error('Erreur lors de l\'envoi du message:', error);
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    const now = new Date();
    const isToday = date.toDateString() === now.toDateString();
    
    if (isToday) {
      return date.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' });
    }
    return date.toLocaleDateString('fr-FR', { day: 'numeric', month: 'short' });
  };

  const formatMessageDate = (dateString) => {
    const options = { 
      year: 'numeric', 
      month: 'short', 
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    };
    return new Date(dateString).toLocaleDateString('fr-FR', options);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow-md overflow-hidden h-[600px] flex">
      {/* Liste des conversations (Sidebar) */}
      <div className="w-1/3 border-r flex flex-col bg-white">
        <div className="p-4 border-b bg-gray-50">
          <h2 className="text-xl font-bold text-gray-800 mb-4">Discussions</h2>
          <div className="relative">
            <FiSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="Rechercher une conversation..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border rounded-full bg-gray-100 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors text-sm"
            />
          </div>
        </div>
        
        <div className="overflow-y-auto flex-1">
          {filteredItems.length > 0 ? (
            filteredItems.map((item) => (
              <div
                key={item.user.id}
                onClick={() => setSelectedUser(item.user)}
                className={`p-3 border-b cursor-pointer hover:bg-gray-50 transition-colors ${
                  selectedUser?.id === item.user.id ? 'bg-blue-50 border-l-4 border-l-blue-600' : 'border-l-4 border-l-transparent'
                }`}
              >
                <div className="flex items-center">
                  <div className="relative">
                    <div className="w-12 h-12 rounded-full bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center text-white font-bold text-lg shadow-sm">
                      {item.user.prenom[0]}{item.user.nom[0]}
                    </div>
                    {item.user.role === 'formateur' || item.user.type === 'formateur' ? (
                      <div className="absolute -bottom-1 -right-1 bg-green-500 text-white text-[10px] px-1.5 py-0.5 rounded-full border-2 border-white">
                        Pro
                      </div>
                    ) : null}
                  </div>
                  
                  <div className="ml-3 flex-1 min-w-0">
                    <div className="flex justify-between items-baseline">
                      <h3 className={`font-semibold truncate ${item.unreadCount > 0 ? 'text-black' : 'text-gray-800'}`}>
                        {item.user.prenom} {item.user.nom}
                      </h3>
                      {item.lastMessage && (
                        <span className={`text-xs ${item.unreadCount > 0 ? 'text-blue-600 font-bold' : 'text-gray-500'}`}>
                          {formatDate(item.lastMessage.createdAt)}
                        </span>
                      )}
                    </div>
                    
                    <div className="flex justify-between items-center mt-1">
                      <p className={`text-sm truncate pr-2 ${item.unreadCount > 0 ? 'text-gray-900 font-medium' : 'text-gray-500'}`}>
                        {item.lastMessage ? (
                          <>
                            {item.lastMessage.senderId === currentUser.id && 'Vous: '}
                            {item.lastMessage.content}
                          </>
                        ) : (
                          <span className="italic text-gray-400">Nouvelle conversation</span>
                        )}
                      </p>
                      {item.unreadCount > 0 && (
                        <span className="bg-blue-600 text-white text-xs font-bold px-2 py-0.5 rounded-full min-w-[20px] text-center">
                          {item.unreadCount}
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            ))
          ) : (
            <div className="p-8 text-center text-gray-500">
              <p>Aucune conversation trouvée.</p>
            </div>
          )}
        </div>
      </div>

      {/* Zone de discussion */}
      <div className="flex-1 flex flex-col bg-gray-50">
        {selectedUser ? (
          <>
            {/* Header de la conversation */}
            <div className="p-4 bg-white border-b shadow-sm flex items-center justify-between z-10">
              <div className="flex items-center">
                <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 font-bold mr-3">
                  {selectedUser.prenom[0]}{selectedUser.nom[0]}
                </div>
                <div>
                  <h3 className="font-bold text-gray-800">
                    {selectedUser.prenom} {selectedUser.nom}
                  </h3>
                  <p className="text-xs text-blue-600 font-medium bg-blue-50 px-2 py-0.5 rounded-full inline-block">
                    {selectedUser.role === 'formateur' || selectedUser.type === 'formateur' ? 'Formateur' : 'Apprenant'}
                  </p>
                </div>
              </div>
            </div>

            {/* Liste des messages */}
            <div className="flex-1 p-4 overflow-y-auto">
              {messages.length > 0 ? (
                messages.map((message, index) => {
                  const isMe = message.senderId === currentUser.id;
                  const showDate = index === 0 || new Date(message.createdAt).toDateString() !== new Date(messages[index - 1].createdAt).toDateString();
                  
                  return (
                    <div key={message.id}>
                      {showDate && (
                        <div className="text-center my-4">
                          <span className="text-xs text-gray-500 bg-gray-200 px-3 py-1 rounded-full">
                            {formatMessageDate(message.createdAt)}
                          </span>
                        </div>
                      )}
                      <div className={`mb-2 flex ${isMe ? 'justify-end' : 'justify-start'}`}>
                        <div className={`max-w-[70%] px-4 py-2 rounded-2xl shadow-sm ${
                          isMe 
                            ? 'bg-blue-600 text-white rounded-tr-none' 
                            : 'bg-white text-gray-800 border border-gray-100 rounded-tl-none'
                        }`}>
                          <p className="text-sm">{message.content}</p>
                          <p className={`text-[10px] mt-1 text-right ${isMe ? 'text-blue-100' : 'text-gray-400'}`}>
                            {new Date(message.createdAt).toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })}
                          </p>
                        </div>
                      </div>
                    </div>
                  );
                })
              ) : (
                <div className="h-full flex flex-col items-center justify-center text-gray-400 opacity-60">
                  <FiMessageSquare className="text-6xl mb-4" />
                  <p className="text-lg">Commencez la discussion avec {selectedUser.prenom}</p>
                </div>
              )}
            </div>

            {/* Zone de saisie */}
            <form onSubmit={handleSendMessage} className="p-4 bg-white border-t">
              <div className="flex items-center bg-gray-100 rounded-full px-4 py-2">
                <input
                  type="text"
                  value={newMessage}
                  onChange={(e) => setNewMessage(e.target.value)}
                  placeholder="Écrivez votre message..."
                  className="flex-1 bg-transparent border-none focus:ring-0 text-sm focus:outline-none px-2"
                />
                <button
                  type="submit"
                  disabled={!newMessage.trim()}
                  className={`p-2 rounded-full transition-colors ${
                    newMessage.trim() 
                      ? 'text-blue-600 hover:bg-blue-100 cursor-pointer' 
                      : 'text-gray-400 cursor-default'
                  }`}
                >
                  <FiSend className="w-5 h-5" />
                </button>
              </div>
            </form>
          </>
        ) : (
          <div className="h-full flex flex-col items-center justify-center text-gray-400 bg-gray-50">
            <div className="w-20 h-20 bg-gray-200 rounded-full flex items-center justify-center mb-4">
              <FiMessageSquare className="text-3xl text-gray-400" />
            </div>
            <h3 className="text-xl font-semibold text-gray-700 mb-2">Vos messages</h3>
            <p className="text-gray-500 max-w-xs text-center">
              Sélectionnez une conversation existante ou recherchez un utilisateur pour démarrer une nouvelle discussion.
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default MessagerieAdmin;
