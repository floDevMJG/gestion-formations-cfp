import React, { useEffect, useState } from "react";
import API from "../services/api";

const AdminFormations = () => {
  const [formations, setFormations] = useState([]);
  const [titre, setTitre] = useState("");
  const [description, setDescription] = useState("");
  const [duree, setDuree] = useState("");

  // Charger les formations
  useEffect(() => {
    fetchFormations();
  }, []);

  const fetchFormations = async () => {
    try {
      const res = await API.get("/formations");
      setFormations(res.data);
    } catch (error) {
      console.error("Erreur chargement formations", error);
    }
  };

  // Ajouter une formation
  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await API.post("/formations", {
        titre,
        description,
        duree,
      });
      setTitre("");
      setDescription("");
      setDuree("");
      fetchFormations();
    } catch (error) {
      alert("Erreur lors de l'ajout");
    }
  };

  // Supprimer une formation
  const deleteFormation = async (id) => {
    if (window.confirm("Supprimer cette formation ?")) {
      try {
        await API.delete(`/formations/${id}`);
        fetchFormations();
      } catch (error) {
        alert("Erreur suppression");
      }
    }
  };

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold text-green-600 mb-4">
        Gestion des formations
      </h1>

      {/* Formulaire */}
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
          type="text"
          placeholder="Durée"
          className="w-full mb-2 p-2 border"
          value={duree}
          onChange={(e) => setDuree(e.target.value)}
          required
        />
        <button className="bg-green-600 text-white px-4 py-2 rounded">
          Ajouter
        </button>
      </form>

      {/* Liste */}
      <table className="w-full bg-white shadow">
        <thead className="bg-black text-white">
          <tr>
            <th className="p-2">Titre</th>
            <th>Description</th>
            <th>Durée</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {formations.map((f) => (
            <tr key={f.id} className="border-t">
              <td className="p-2">{f.titre}</td>
              <td>{f.description}</td>
              <td>{f.duree}</td>
              <td>
                <button
                  onClick={() => deleteFormation(f.id)}
                  className="bg-red-600 text-white px-3 py-1 rounded"
                >
                  Supprimer
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default AdminFormations;
