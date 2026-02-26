import React, { useState } from 'react';

const Settings = () => {
  const [settings, setSettings] = useState({
    siteTitle: 'CFP Charpenterie Marine',
    siteDescription: 'Centre de Formation Professionnelle en Charpenterie Marine',
    contactEmail: 'contact@cfp-charpenterie-marine.fr',
    maintenanceMode: false,
    registrationEnabled: true,
    maxUsers: 1000,
    logo: null,
    primaryColor: '#2563eb', // blue-600
    secondaryColor: '#1e40af', // blue-700
  });

  const [activeTab, setActiveTab] = useState('general');
  const [isSaving, setIsSaving] = useState(false);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setSettings(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    setIsSaving(true);
    
    // Simuler une sauvegarde
    setTimeout(() => {
      setIsSaving(false);
      // Ici, vous ajouteriez la logique pour sauvegarder les paramètres
      alert('Paramètres enregistrés avec succès !');
    }, 1000);
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        setSettings(prev => ({
          ...prev,
          logo: e.target.result
        }));
      };
      reader.readAsDataURL(file);
    }
  };

  const renderGeneralTab = () => (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-medium text-gray-900">Informations générales</h3>
        <p className="mt-1 text-sm text-gray-500">Personnalisez les informations de base de votre site.</p>
      </div>
      
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-6">
        <div className="sm:col-span-4">
          <label htmlFor="siteTitle" className="block text-sm font-medium text-gray-700">
            Nom du site
          </label>
          <input
            type="text"
            name="siteTitle"
            id="siteTitle"
            value={settings.siteTitle}
            onChange={handleChange}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
          />
        </div>

        <div className="sm:col-span-6">
          <label htmlFor="siteDescription" className="block text-sm font-medium text-gray-700">
            Description du site
          </label>
          <div className="mt-1">
            <textarea
              id="siteDescription"
              name="siteDescription"
              rows={3}
              className="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
              value={settings.siteDescription}
              onChange={handleChange}
            />
          </div>
          <p className="mt-2 text-sm text-gray-500">Une brève description de votre centre de formation.</p>
        </div>

        <div className="sm:col-span-4">
          <label htmlFor="contactEmail" className="block text-sm font-medium text-gray-700">
            Email de contact
          </label>
          <input
            type="email"
            name="contactEmail"
            id="contactEmail"
            value={settings.contactEmail}
            onChange={handleChange}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
          />
        </div>

        <div className="sm:col-span-6">
          <label className="block text-sm font-medium text-gray-700">Logo</label>
          <div className="mt-1 flex items-center">
            <span className="inline-block h-12 w-12 overflow-hidden rounded-full bg-gray-100">
              {settings.logo ? (
                <img src={settings.logo} alt="Logo" className="h-full w-full object-cover" />
              ) : (
                <svg className="h-full w-full text-gray-300" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M24 20.993V24H0v-2.996A14.977 14.977 0 0112.004 15c4.904 0 9.26 2.354 11.996 5.993zM16.002 8.999a4 4 0 11-8 0 4 4 0 018 0z" />
                </svg>
              )}
            </span>
            <label className="ml-5 rounded-md border border-gray-300 bg-white py-2 px-3 text-sm font-medium leading-4 text-gray-700 shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 cursor-pointer">
              <span>Changer</span>
              <input type="file" className="sr-only" onChange={handleFileChange} accept="image/*" />
            </label>
          </div>
        </div>
      </div>
    </div>
  );

  const renderAppearanceTab = () => (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-medium text-gray-900">Apparence</h3>
        <p className="mt-1 text-sm text-gray-500">Personnalisez l'apparence de votre site.</p>
      </div>

      <div className="grid grid-cols-1 gap-6 sm:grid-cols-6">
        <div className="sm:col-span-3">
          <label htmlFor="primaryColor" className="block text-sm font-medium text-gray-700">
            Couleur principale
          </label>
          <div className="mt-1 flex rounded-md shadow-sm">
            <div className="relative flex-grow focus-within:z-10">
              <input
                type="color"
                name="primaryColor"
                id="primaryColor"
                value={settings.primaryColor}
                onChange={handleChange}
                className="block w-full h-10 rounded-md border-gray-300 focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
              />
            </div>
            <span className="inline-flex items-center px-3 rounded-r-md border border-l-0 border-gray-300 bg-gray-50 text-gray-500 sm:text-sm">
              {settings.primaryColor}
            </span>
          </div>
        </div>

        <div className="sm:col-span-3">
          <label htmlFor="secondaryColor" className="block text-sm font-medium text-gray-700">
            Couleur secondaire
          </label>
          <div className="mt-1 flex rounded-md shadow-sm">
            <div className="relative flex-grow focus-within:z-10">
              <input
                type="color"
                name="secondaryColor"
                id="secondaryColor"
                value={settings.secondaryColor}
                onChange={handleChange}
                className="block w-full h-10 rounded-md border-gray-300 focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
              />
            </div>
            <span className="inline-flex items-center px-3 rounded-r-md border border-l-0 border-gray-300 bg-gray-50 text-gray-500 sm:text-sm">
              {settings.secondaryColor}
            </span>
          </div>
        </div>
      </div>
    </div>
  );

  const renderUsersTab = () => (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-medium text-gray-900">Paramètres utilisateurs</h3>
        <p className="mt-1 text-sm text-gray-500">Configurez les paramètres liés aux utilisateurs.</p>
      </div>

      <div className="space-y-4">
        <div className="relative flex items-start">
          <div className="flex h-5 items-center">
            <input
              id="registrationEnabled"
              name="registrationEnabled"
              type="checkbox"
              checked={settings.registrationEnabled}
              onChange={handleChange}
              className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
            />
          </div>
          <div className="ml-3 text-sm">
            <label htmlFor="registrationEnabled" className="font-medium text-gray-700">
              Activer les inscriptions
            </label>
            <p className="text-gray-500">Permettre aux nouveaux utilisateurs de s'inscrire.</p>
          </div>
        </div>

        <div className="relative flex items-start">
          <div className="flex h-5 items-center">
            <input
              id="maintenanceMode"
              name="maintenanceMode"
              type="checkbox"
              checked={settings.maintenanceMode}
              onChange={handleChange}
              className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
            />
          </div>
          <div className="ml-3 text-sm">
            <label htmlFor="maintenanceMode" className="font-medium text-gray-700">
              Mode maintenance
            </label>
            <p className="text-gray-500">Le site sera accessible uniquement aux administrateurs.</p>
          </div>
        </div>

        <div className="mt-4">
          <label htmlFor="maxUsers" className="block text-sm font-medium text-gray-700">
            Nombre maximum d'utilisateurs
          </label>
          <div className="mt-1">
            <input
              type="number"
              name="maxUsers"
              id="maxUsers"
              value={settings.maxUsers}
              onChange={handleChange}
              min="1"
              className="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
            />
          </div>
          <p className="mt-2 text-sm text-gray-500">
            Nombre maximum d'utilisateurs pouvant s'inscrire sur la plateforme.
          </p>
        </div>
      </div>
    </div>
  );

  return (
    <div className="container mx-auto">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-800">Paramètres</h1>
        <p className="text-gray-600">Gérez les paramètres de votre plateforme</p>
      </div>

      <div className="bg-white shadow overflow-hidden sm:rounded-lg">
        {/* Navigation par onglets */}
        <div className="border-b border-gray-200">
          <nav className="-mb-px flex space-x-8 px-6">
            <button
              onClick={() => setActiveTab('general')}
              className={`whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'general'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              Général
            </button>
            <button
              onClick={() => setActiveTab('appearance')}
              className={`whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'appearance'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              Apparence
            </button>
            <button
              onClick={() => setActiveTab('users')}
              className={`whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'users'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              Utilisateurs
            </button>
          </nav>
        </div>

        {/* Contenu du formulaire */}
        <form onSubmit={handleSubmit} className="p-6">
          {activeTab === 'general' && renderGeneralTab()}
          {activeTab === 'appearance' && renderAppearanceTab()}
          {activeTab === 'users' && renderUsersTab()}

          <div className="pt-5 mt-8 border-t border-gray-200">
            <div className="flex justify-end">
              <button
                type="button"
                className="bg-white py-2 px-4 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              >
                Annuler
              </button>
              <button
                type="submit"
                disabled={isSaving}
                className={`ml-3 inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 ${
                  isSaving ? 'opacity-75 cursor-not-allowed' : ''
                }`}
              >
                {isSaving ? 'Enregistrement...' : 'Enregistrer les modifications'}
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};

export default Settings;
