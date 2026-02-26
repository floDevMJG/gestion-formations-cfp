import React, { useState, useEffect } from 'react';
import { Card, Progress, Button, Spin, message } from 'antd';
import { FilePdfOutlined, CheckCircleOutlined, ClockCircleOutlined } from '@ant-design/icons';
import API from '../../services/api';
import { useAuth } from '../../contexts/AuthContext';
import dayjs from 'dayjs';
import duration from 'dayjs/plugin/duration';
import relativeTime from 'dayjs/plugin/relativeTime';
import 'dayjs/locale/fr';
import { jsPDF } from 'jspdf';
import 'jspdf-autotable';

dayjs.extend(duration);
dayjs.extend(relativeTime);
dayjs.locale('fr');

const CertificationsApprenant = () => {
  const [loading, setLoading] = useState(true);
  const [formations, setFormations] = useState([]);
  const [generatingPdf, setGeneratingPdf] = useState(false);
  const { user } = useAuth();

  useEffect(() => {
    if (user?.id) {
      fetchFormations();
    }
  }, [user]);

  const fetchFormations = async () => {
    try {
      const { data } = await API.get(`/etudiants/${user.id}/inscriptions`);
      const now = dayjs();
      const formationsAvecProgression = (data || []).map((insc) => {
        const dateDebut = dayjs(insc.dateDebut || now.subtract(Math.floor(Math.random() * 30) + 1, 'day'));
        const dateFin = dayjs(insc.dateFin || now.add(Math.floor(Math.random() * 60) + 30, 'day'));
        const progression = Math.min(
          100,
          Math.max(
            0,
            Math.round(((Date.now() - dateDebut.valueOf()) / (dateFin.valueOf() - dateDebut.valueOf())) * 100)
          )
        );
        return {
          id: insc.id,
          nomFormation: insc.titre || insc.Formation?.titre || 'Formation',
          description: insc.description || insc.Formation?.description || '',
          dateDebut,
          dateFin,
          progression: Number.isFinite(progression) ? progression : 0,
          modulesCompletes: Math.floor(Math.random() * 10) + 1,
          totalModules: 15,
          derniereActivite: dayjs().subtract(Math.floor(Math.random() * 5), 'day').toDate(),
          nomApprenant: `${user.prenom || ''} ${user.nom || ''}`.trim()
        };
      });

      setFormations(formationsAvecProgression);
      setLoading(false);
    } catch (error) {
      console.error('Erreur lors de la récupération des formations:', error);
      message.error('Erreur lors du chargement des formations');
      setLoading(false);
    }
  };

  const calculerTempsRestant = (dateDebut, dateFin) => {
    const maintenant = dayjs();
    const dureeTotale = dateFin.diff(dateDebut);
    const tempsEcoule = maintenant.diff(dateDebut);
    const tempsRestant = dayjs.duration(dureeTotale - tempsEcoule);
    
    const annees = Math.floor(tempsRestant.asYears());
    const mois = Math.floor(tempsRestant.asMonths() % 12);
    const jours = Math.floor(tempsRestant.asDays() % 30);
    
    return { annees, mois, jours };
  };

  const genererCertificat = (formation) => {
    setGeneratingPdf(true);
    
    try {
      const doc = new jsPDF();
      
      // En-tête du certificat
      doc.setFontSize(22);
      doc.setTextColor(30, 64, 175);
      doc.text('CERTIFICAT DE RÉUSSITE', 105, 30, { align: 'center' });
      
      // Logo et informations du centre
      doc.setFontSize(12);
      doc.setTextColor(0, 0, 0);
      doc.text('Centre de Formation Professionnelle', 105, 50, { align: 'center' });
      doc.text('123 Rue de la Formation, 75000 Paris', 105, 60, { align: 'center' });
      
      // Titre du certificat
      doc.setFontSize(18);
      doc.text('ATTESTE QUE', 105, 90, { align: 'center' });
      
      // Nom de l'apprenant
      doc.setFontSize(16);
      doc.text(formation.nomApprenant || 'NOM PRÉNOM', 105, 110, { align: 'center' });
      
      // Détails de la formation
      doc.setFontSize(14);
      doc.text(`a suivi avec succès la formation :`, 105, 125, { align: 'center' });
      doc.setFont('helvetica', 'bold');
      doc.text(`"${formation.nomFormation || 'Nom de la formation'}"`, 105, 135, { align: 'center' });
      doc.setFont('helvetica', 'normal');
      
      // Période de formation
      doc.text(`du ${formation.dateDebut.format('DD/MM/YYYY')} au ${formation.dateFin.format('DD/MM/YYYY')}`, 105, 150, { align: 'center' });
      
      // Signature
      doc.text('Fait à Paris, le ' + dayjs().format('DD/MM/YYYY'), 105, 200, { align: 'center' });
      doc.text('Le Directeur', 105, 240, { align: 'center' });
      
      // Numéro de certificat
      doc.setFontSize(10);
      doc.setTextColor(100);
      doc.text(`Certificat n°${Math.random().toString(36).substr(2, 9).toUpperCase()}`, 105, 280, { align: 'center' });
      
      // Sauvegarder le PDF
      doc.save(`certificat-${formation.nomFormation || 'formation'}.pdf`);
      message.success('Certificat généré avec succès');
    } catch (error) {
      console.error('Erreur lors de la génération du PDF:', error);
      message.error('Erreur lors de la génération du certificat');
    } finally {
      setGeneratingPdf(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Spin size="large" />
      </div>
    );
  }

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold text-gray-800 mb-6">Mes Certifications</h1>
      
      {formations.length === 0 ? (
        <Card className="text-center py-10">
          <p className="text-gray-500">Aucune formation en cours ou terminée</p>
        </Card>
      ) : (
        <div className="grid grid-cols-1 gap-6">
          {formations.map((formation) => {
            const tempsRestant = calculerTempsRestant(formation.dateDebut, formation.dateFin);
            const estTerminee = formation.progression >= 100;
            
            return (
              <Card key={formation.id} className="shadow-md hover:shadow-lg transition-shadow">
                <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-6">
                  <div className="flex-1">
                    <div className="flex justify-between items-start">
                      <h2 className="text-xl font-bold text-gray-800">{formation.nomFormation}</h2>
                      {estTerminee ? (
                        <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-green-100 text-green-800">
                          <CheckCircleOutlined className="mr-1" /> Terminée
                        </span>
                      ) : (
                        <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-blue-100 text-blue-800">
                          <ClockCircleOutlined className="mr-1" /> En cours
                        </span>
                      )}
                    </div>
                    
                    <p className="text-gray-600 mt-2">{formation.description || 'Aucune description disponible'}</p>
                    
                    <div className="mt-4">
                      <div className="flex justify-between text-sm text-gray-600 mb-1">
                        <span>Progression</span>
                        <span>{formation.progression}%</span>
                      </div>
                      <Progress 
                        percent={formation.progression} 
                        status={estTerminee ? 'success' : 'active'}
                        strokeColor={estTerminee ? '#10B981' : '#3B82F6'}
                      />
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-4">
                      <div className="bg-gray-50 p-3 rounded-lg">
                        <p className="text-sm text-gray-500">Modules complétés</p>
                        <p className="text-lg font-semibold">
                          {formation.modulesCompletes} / {formation.totalModules}
                        </p>
                      </div>
                      
                      <div className="bg-gray-50 p-3 rounded-lg">
                        <p className="text-sm text-gray-500">Dernière activité</p>
                        <p className="text-lg font-semibold">
                          {dayjs(formation.derniereActivite).fromNow()}
                        </p>
                      </div>
                      
                      {!estTerminee ? (
                        <div className="bg-blue-50 p-3 rounded-lg border border-blue-100">
                          <p className="text-sm text-blue-600">Temps restant</p>
                          <p className="text-lg font-semibold text-blue-700">
                            {tempsRestant.annees > 0 && `${tempsRestant.annees} an${tempsRestant.annees > 1 ? 's' : ''} `}
                            {tempsRestant.mois > 0 && `${tempsRestant.mois} mois `}
                            {tempsRestant.jours > 0 && `${tempsRestant.jours} jour${tempsRestant.jours > 1 ? 's' : ''}`}
                          </p>
                        </div>
                      ) : (
                        <div className="bg-green-50 p-3 rounded-lg border border-green-100">
                          <p className="text-sm text-green-600">Formation terminée le</p>
                          <p className="text-lg font-semibold text-green-700">
                            {formation.dateFin.format('DD/MM/YYYY')}
                          </p>
                        </div>
                      )}
                    </div>
                  </div>
                  
                  <div className="flex flex-col gap-2 w-full md:w-auto">
                    <Button 
                      type="primary" 
                      icon={<FilePdfOutlined />}
                      onClick={() => genererCertificat(formation)}
                      loading={generatingPdf}
                      disabled={!estTerminee}
                      className={!estTerminee ? 'opacity-50 cursor-not-allowed' : ''}
                    >
                      Télécharger le certificat
                    </Button>
                    <Button>
                      Voir les détails
                    </Button>
                  </div>
                </div>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default CertificationsApprenant;
