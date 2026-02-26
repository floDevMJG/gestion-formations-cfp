import React, { useEffect, useState } from "react";
import API from "../services/api";

const AdminAteliers = () => {
  const [ateliers, setAteliers] = useState([]);
  const [titre, setTitre] = useState("");
  const [description, setDescription] = useState("");
  const [date, setDate] = useState("");
  const [formateur, setFormateur] = useState("");

  useEffect(() => {
    fetchAteliers();
  }, []);

  const fetchAteliers = async () => {
    try {
      const res = await API.get("/admin/ateliers");
      setAteliers(res.data);
    } catch (error) {
      console.error("Erreur lors de la récupération des ateliers:", error);
      alert("Erreur lors du chargement des ateliers");
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await API.post("/admin/ateliers", {
        titre,
        description,
        date,
        heureDebut: "09:00",
        heureFin: "12:00",
        salle: "Salle Admin",
        capacite: 20,
        type: "pratique",
        statut: "actif",
        formateur_id: 1
      });
      setTitre("");
      setDescription("");
      setDate("");
      setFormateur("");
      fetchAteliers();
      alert("Atelier créé avec succès !");
    } catch (error) {
      console.error("Erreur lors de la création de l'atelier:", error);
      alert("Erreur lors de la création de l'atelier");
    }
  };

  const deleteAtelier = async (id) => {
    if (window.confirm("Supprimer cet atelier ?")) {
      try {
        await API.delete(`/admin/ateliers/${id}`);
        fetchAteliers();
        alert("Atelier supprimé avec succès !");
      } catch (error) {
        console.error("Erreur lors de la suppression de l'atelier:", error);
        alert("Erreur lors de la suppression de l'atelier");
      }
    }
  };

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold text-green-600 mb-4">
        Gestion des ateliers
      </h1>

      <form onSubmit={handleSubmit} className="bg-white p-4 shadow rounded mb-6">
        <input
          type="text"
          placeholder="Titre"
          className="w-full mb-2 p-2 border"
          value={titre}
          onChange={(e) => setTitre(e.target.value)}
          required
        />
        <textarea
          placeholder="Description"
          className="w-full mb-2 p-2 border"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          required
        />
        <input
          type="date"
          className="w-full mb-2 p-2 border"
          value={date}
          onChange={(e) => setDate(e.target.value)}
          required
        />
        <input
          type="text"
          placeholder="Formateur"
          className="w-full mb-2 p-2 border"
          value={formateur}
          onChange={(e) => setFormateur(e.target.value)}
          required
        />
        <button className="bg-green-600 text-white px-4 py-2 rounded">
          Ajouter
        </button>
      </form>

      <table className="w-full bg-white shadow">
        <thead className="bg-black text-white">
          <tr>
            <th className="p-2">Titre</th>
            <th>Description</th>
            <th>Date</th>
            <th>Horaires</th>
            <th>Salle</th>
            <th>Capacité</th>
            <th>Type</th>
            <th>Statut</th>
            <th>Formateur</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {ateliers.map((a) => (
            <tr key={a.id} className="border-t">
              <td className="p-2 font-medium">{a.titre}</td>
              <td className="p-2 max-w-xs truncate">{a.description}</td>
              <td className="p-2">{a.date}</td>
              <td className="p-2">{a.heureDebut} - {a.heureFin}</td>
              <td className="p-2">{a.salle}</td>
              <td className="p-2">{a.inscrits}/{a.capacite}</td>
              <td className="p-2">
                <span className={`px-2 py-1 text-xs rounded ${
                  a.type === 'pratique' ? 'bg-blue-100 text-blue-800' : 
                  a.type === 'theorique' ? 'bg-green-100 text-green-800' : 
                  'bg-purple-100 text-purple-800'
                }`}>
                  {a.type}
                </span>
              </td>
              <td className="p-2">
                <span className={`px-2 py-1 text-xs rounded ${
                  a.statut === 'actif' ? 'bg-green-100 text-green-800' : 
                  a.statut === 'annulé' ? 'bg-red-100 text-red-800' : 
                  'bg-gray-100 text-gray-800'
                }`}>
                  {a.statut}
                </span>
              </td>
              <td className="p-2">{a.formateur || 'Non assigné'}</td>
              <td className="p-2">
                <button
                  onClick={() => deleteAtelier(a.id)}
                  className="bg-red-600 text-white px-3 py-1 rounded hover:bg-red-700 transition-colors"
                >
                  Supprimer
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
      
      {ateliers.length === 0 && (
        <div className="text-center py-8 bg-white shadow rounded">
          <p className="text-gray-500">Aucun atelier trouvé</p>
        </div>
      )}
    </div>
  );
};

export default AdminAteliers;
