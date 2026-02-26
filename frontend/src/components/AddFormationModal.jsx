import React, { useState } from 'react';
import { createPortal } from 'react-dom';

export default function AddFormationModal(props) {
  const {
    showAddForm,
    newFormation,
    // Ancienne API (compatibilité)
    setNewFormation,
    handleAddFormation,
    handleCancelAdd,
    handleBackdropClick,
    // Nouvelle API (parent passe ces props)
    onInputChange,
    onSubmit,
    onCancel,
    onBackdropClick
  } = props;

  // Normaliser les handlers pour supporter les deux conventions
  const updateNewFormation = (field, value) => {
    if (typeof setNewFormation === 'function') {
      setNewFormation(prev => ({ ...prev, [field]: value }));
    } else if (typeof onInputChange === 'function') {
      onInputChange(field, value);
    } else {
      console.error('AddFormationModal: aucun setter fourni pour newFormation');
    }
  };

  const submitHandler = (e) => {
    if (typeof handleAddFormation === 'function') return handleAddFormation(e);
    if (typeof onSubmit === 'function') return onSubmit(e);
  };

  const cancelHandler = (e) => {
    if (typeof handleCancelAdd === 'function') return handleCancelAdd(e);
    if (typeof onCancel === 'function') return onCancel(e);
  };

  const backdropHandler = (e) => {
    if (typeof handleBackdropClick === 'function') return handleBackdropClick(e);
    if (typeof onBackdropClick === 'function') return onBackdropClick(e);
  };

  if (!showAddForm) return null;

  return createPortal(
    <div 
      className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-[9999]"
      onClick={backdropHandler}
    >
      <div 
        className="bg-white rounded-lg shadow-xl max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="p-6">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-2xl font-bold text-gray-800">Ajouter une nouvelle formation</h2>
            <button
              onClick={cancelHandler}
              className="text-gray-500 hover:text-gray-700 text-3xl leading-none"
              aria-label="Fermer"
            >
              ×
            </button>
          </div>
          
          <form onSubmit={submitHandler} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Titre de la formation <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={newFormation.titre}
                onChange={(e) => updateNewFormation('titre', e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Ex: Initiation à la charpente marine"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Description
              </label>
              <textarea
                value={newFormation.description}
                onChange={(e) => updateNewFormation('description', e.target.value)}
                rows="3"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Décrivez la formation en détail..."
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Durée (en heures) <span className="text-red-500">*</span>
                </label>
                <input
                  type="number"
                  value={newFormation.duree}
                  onChange={(e) => updateNewFormation('duree', e.target.value)}
                  min="1"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Ex: 20"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Niveau
                </label>
                <select
                  value={newFormation.niveau}
                  onChange={(e) => updateNewFormation('niveau', e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="Débutant">Débutant</option>
                  <option value="Intermédiaire">Intermédiaire</option>
                  <option value="Avancé">Avancé</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Nombre de places <span className="text-red-500">*</span>
                </label>
                <input
                  type="number"
                  value={newFormation.places}
                  onChange={(e) => updateNewFormation('places', parseInt(e.target.value) || '')}
                  min="1"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  required
                />
              </div>
            </div>

            <div className="flex justify-end space-x-3 pt-4">
              <button
                type="button"
                onClick={cancelHandler}
                className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 bg-white hover:bg-gray-50 transition-colors"
              >
                Annuler
              </button>
              <button
                type="submit"
                className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                Créer la formation
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>,
    document.body
  );
}
