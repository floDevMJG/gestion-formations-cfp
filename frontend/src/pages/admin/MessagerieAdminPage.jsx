import React from 'react';
import AdminLayout from './AdminLayout';
import MessagerieAdmin from '../../components/MessagerieAdmin';

const MessagerieAdminPage = () => {
  return (
    <AdminLayout>
      <div className="container mx-auto px-4 py-6">
        <h1 className="text-2xl font-bold text-gray-800 mb-6">
          Messagerie privée
        </h1>
        <MessagerieAdmin />
      </div>
    </AdminLayout>
  );
};

export default MessagerieAdminPage;
