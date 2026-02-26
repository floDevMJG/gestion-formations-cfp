import React, { useState, useEffect } from 'react';
import { Calendar, Badge, Card, Button, Modal, Form, Input, Select, message } from 'antd';
import { PlusOutlined, ClockCircleOutlined, UserOutlined, TeamOutlined } from '@ant-design/icons';
import API from '../../services/api';
import dayjs from 'dayjs';

const { Option } = Select;

const AteliersApprenant = () => {
  const [ateliers, setAteliers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [form] = Form.useForm();

  useEffect(() => {
    fetchAteliers();
  }, []);

  const fetchAteliers = async () => {
    try {
      const response = await API.get('/ateliers');
      const raw = Array.isArray(response.data) ? response.data : (response.data?.data || []);
      const normalized = raw.map(a => {
        const capacite = Number(a.capacite ?? a.capacité ?? 0) || 0;
        const inscrits = Number(a.inscrits ?? 0) || 0;
        const placesDisponibles =
          Number(a.places_disponibles ?? a.placesDisponibles ?? (capacite > 0 ? Math.max(0, capacite - inscrits) : 0)) || 0;
        return {
          id: a.id,
          nom: a.nom || a.titre || 'Atelier',
          description: a.description || '',
          date: a.date || a.date_debut || a.dateDebut || a.createdAt || null,
          animateur: a.animateur || a.formateur || 'À confirmer',
          placesDisponibles,
          estInscrit: Boolean(a.estInscrit)
        };
      });
      setAteliers(normalized);
      setLoading(false);
    } catch (error) {
      console.error('Erreur lors de la récupération des ateliers:', error);
      message.error('Erreur lors du chargement des ateliers');
      setLoading(false);
    }
  };

  const handleInscriptionAtelier = async (atelierId) => {
    try {
      await API.post(`/ateliers/${atelierId}/inscription`, {});
      message.success('Inscription à l\'atelier réussie !');
      fetchAteliers();
    } catch (error) {
      console.error('Erreur lors de l\'inscription:', error);
      message.error('Erreur lors de l\'inscription à l\'atelier');
    }
  };

  const getListData = (value) => {
    return ateliers.filter(atelier => {
      const atelierDate = dayjs(atelier.date);
      return atelierDate.isSame(value, 'day');
    });
  };

  const dateCellRender = (value) => {
    const listData = getListData(value);
    return (
      <ul className="events">
        {listData.map((item) => (
          <li key={item.id}>
            <Badge status="success" text={item.nom} />
          </li>
        ))}
      </ul>
    );
  };

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-800">Ateliers Disponibles</h1>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="md:col-span-2">
          <Card 
            title="Calendrier des Ateliers" 
            className="shadow-lg rounded-lg overflow-hidden"
            loading={loading}
          >
            <Calendar 
              dateCellRender={dateCellRender} 
              className="border rounded-lg p-4"
            />
          </Card>
        </div>

        <div className="space-y-6">
          <Card 
            title="Prochains Ateliers" 
            className="shadow-lg rounded-lg overflow-hidden"
            loading={loading}
          >
            <div className="space-y-4">
              {ateliers
                .filter(atelier => atelier.date && dayjs(atelier.date).isAfter(dayjs()))
                .sort((a, b) => new Date(a.date) - new Date(b.date))
                .slice(0, 3)
                .map(atelier => (
                  <div 
                    key={atelier.id} 
                    className="p-4 border rounded-lg hover:shadow-md transition-shadow"
                  >
                    <div className="flex justify-between items-start">
                      <div>
                        <h3 className="font-semibold text-lg">{atelier.nom}</h3>
                        <p className="text-gray-600">{atelier.description}</p>
                        <div className="flex items-center mt-2 text-sm text-gray-500">
                          <ClockCircleOutlined className="mr-1" />
                          {atelier.date ? dayjs(atelier.date).format('DD/MM/YYYY HH:mm') : 'Date à préciser'}
                        </div>
                        <div className="flex items-center text-sm text-gray-500 mt-1">
                          <UserOutlined className="mr-1" />
                          {atelier.animateur}
                        </div>
                        <div className="flex items-center text-sm text-gray-500 mt-1">
                          <TeamOutlined className="mr-1" />
                          {(Number(atelier.placesDisponibles) || 0)} places disponibles
                        </div>
                      </div>
                      {(Number(atelier.placesDisponibles) || 0) > 0 ? (
                        <Button 
                          type="primary" 
                          size="small"
                          onClick={() => handleInscriptionAtelier(atelier.id)}
                        >
                          S'inscrire
                        </Button>
                      ) : (
                        <span className="text-red-500 text-sm font-medium">Complet</span>
                      )}
                    </div>
                  </div>
                ))}
            </div>
          </Card>

          <Card 
            title="Mes Inscriptions" 
            className="shadow-lg rounded-lg overflow-hidden"
          >
            <div className="space-y-4">
              {ateliers
                .filter(atelier => atelier.estInscrit)
                .map(atelier => (
                  <div key={atelier.id} className="p-3 border rounded-lg bg-blue-50">
                    <div className="font-medium">{atelier.nom}</div>
                    <div className="text-sm text-gray-600">
                      {dayjs(atelier.date).format('DD/MM/YYYY HH:mm')}
                    </div>
                  </div>
                ))}
              {!ateliers.some(a => a.estInscrit) && (
                <p className="text-gray-500 text-center py-4">Aucune inscription pour le moment</p>
              )}
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default AteliersApprenant;
