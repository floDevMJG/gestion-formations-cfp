import React from 'react';
export default function FormationCard({f}){
  return (
    <div className="border p-4 rounded shadow-sm flex justify-between items-center">
      <div>
        <div className="font-semibold">{f.titre}</div>
        <div className="text-sm text-gray-600">{f.duree}</div>
      </div>
      <button className="bg-[#004080] text-white px-3 py-1 rounded">S'inscrire</button>
    </div>
  );
}
