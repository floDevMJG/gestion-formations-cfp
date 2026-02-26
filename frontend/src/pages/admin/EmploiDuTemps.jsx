// 1. Ajout des imports nécessaires
import { DragDropContext, Droppable, Draggable } from 'react-beautiful-dnd';
import { toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import FullCalendar from '@fullcalendar/react';
import dayGridPlugin from '@fullcalendar/daygrid';
import timeGridPlugin from '@fullcalendar/timegrid';
import interactionPlugin from '@fullcalendar/interaction';
import frLocale from '@fullcalendar/core/locales/fr';
import { useAuth } from '../../services/AuthContext'; // À créer
import api from '../../services/api'; // Service API

const EmploiDuTemps = () => {
  // 2. Utilisation du contexte d'authentification
  const { user, hasRole } = useAuth();
  const [view, setView] = useState('semaine'); // 'semaine', 'mois', 'annee'
  
  // 3. État pour les notifications
  const [notifications, setNotifications] = useState([]);
  
  // 4. Chargement initial des données
  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await api.get('/api/emploi-du-temps');
        setCours(response.data);
      } catch (error) {
        toast.error('Erreur lors du chargement des données');
      }
    };
    
    if (hasRole(['admin', 'formateur'])) {
      fetchData();
    }
  }, [hasRole]);

  // 5. Gestion du glisser-déposer
  const onDragEnd = async (result) => {
    if (!result.destination) return;
    
    const { source, destination, draggableId } = result;
    
    // Mise à jour locale
    const updatedCours = Array.from(cours);
    const [movedCours] = updatedCours.splice(source.index, 1);
    updatedCours.splice(destination.index, 0, movedCours);
    setCours(updatedCours);
    
    // Mise à jour serveur
    try {
      await api.put(`/api/emploi-du-temps/${draggableId}`, {
        ...movedCours,
        date: destination.droppableId, // Mise à jour de la date
        creneau: destination.droppableTime // Mise à jour du créneau
      });
      toast.success('Emploi du temps mis à jour avec succès');
    } catch (error) {
      toast.error('Erreur lors de la mise à jour');
      // Revert en cas d'erreur
      setCours(cours);
    }
  };

  // 6. Vérification des conflits
  const checkConflit = (newCours) => {
    return cours.some(c => 
      c.id !== newCours.id &&
      c.date === newCours.date &&
      c.creneau === newCours.creneau &&
      (c.salle === newCours.salle || c.formateur === newCours.formateur)
    );
  };

  // 7. Gestion de la soumission avec vérification de conflit
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (checkConflit(formData)) {
      toast.warning('Conflit détecté ! Vérifiez les créneaux et les salles.');
      return;
    }
    
    try {
      if (formData.id) {
        await api.put(`/api/emploi-du-temps/${formData.id}`, formData);
        toast.success('Cours mis à jour avec succès');
      } else {
        await api.post('/api/emploi-du-temps', formData);
        toast.success('Cours ajouté avec succès');
      }
      // Recharger les données
      const response = await api.get('/api/emploi-du-temps');
      setCours(response.data);
      setShowForm(false);
      resetForm();
    } catch (error) {
      toast.error('Erreur lors de la sauvegarde');
    }
  };

  // 8. Nouveau rendu pour la vue calendrier
  const renderCalendarView = () => {
    const events = cours.map(cours => ({
      id: cours.id,
      title: cours.titre,
      start: `${cours.date}T${cours.creneau.split(' - ')[0]}`,
      end: `${cours.date}T${cours.creneau.split(' - ')[1]}`,
      color: cours.couleur,
      extendedProps: {
        formateur: cours.formateur,
        salle: cours.salle
      }
    }));

    return (
      <div className="mt-4">
        <FullCalendar
          plugins={[dayGridPlugin, timeGridPlugin, interactionPlugin]}
          initialView={view === 'mois' ? 'dayGridMonth' : 'timeGridWeek'}
          locale={frLocale}
          headerToolbar={{
            left: 'prev,next today',
            center: 'title',
            right: 'dayGridMonth,timeGridWeek,timeGridDay'
          }}
          events={events}
          eventContent={renderEventContent}
          editable={hasRole(['admin', 'formateur'])}
          eventDrop={handleEventDrop}
          eventClick={handleEventClick}
          height="auto"
        />
      </div>
    );
  };

  // 9. Gestion du glisser-déposer dans le calendrier
  const handleEventDrop = async (info) => {
    try {
      await api.put(`/api/emploi-du-temps/${info.event.id}`, {
        date: format(info.event.start, 'yyyy-MM-dd'),
        creneau: `${format(info.event.start, 'HH:mm')} - ${format(info.event.end, 'HH:mm')}`
      });
      toast.success('Cours déplacé avec succès');
    } catch (error) {
      toast.error('Erreur lors du déplacement du cours');
      info.revert();
    }
  };

  // 10. Gestion du clic sur un événement
  const handleEventClick = (info) => {
    const event = info.event;
    setFormData({
      id: event.id,
      titre: event.title,
      date: format(event.start, 'yyyy-MM-dd'),
      creneau: `${format(event.start, 'HH:mm')} - ${format(event.end, 'HH:mm')}`,
      formateur: event.extendedProps.formateur,
      salle: event.extendedProps.salle,
      couleur: event.backgroundColor,
      description: event.extendedProps.description || ''
    });
    setShowForm(true);
  };

  // 11. Rendu conditionnel selon la vue
  return (
    <div className="container mx-auto p-4">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold">Gestion des emplois du temps</h2>
        <div className="flex space-x-2">
          <select
            value={view}
            onChange={(e) => setView(e.target.value)}
            className="rounded-lg border-gray-300 shadow-sm"
          >
            <option value="semaine">Vue Semaine</option>
            <option value="mois">Vue Mois</option>
            <option value="annee">Vue Année</option>
          </select>
          {/* ... autres boutons ... */}
        </div>
      </div>

      {view === 'semaine' ? (
        <DragDropContext onDragEnd={onDragEnd}>
          {/* Tableau existant avec glisser-déposer */}
        </DragDropContext>
      ) : (
        renderCalendarView()
      )}

      {/* Composant de notification */}
      <ToastContainer position="top-right" autoClose={5000} />
    </div>
  );
};

export default EmploiDuTemps;