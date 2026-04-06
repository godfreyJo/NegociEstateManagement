import React from 'react';
import { Outlet } from 'react-router-dom';

const AuthLayout: React.FC = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-nagocis-primary to-blue-900 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Logo */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-white mb-2">Nagocis</h1>
          <p className="text-blue-200">Smart Estate & Property Management</p>
        </div>
        
        {/* Content */}
        <div className="bg-white rounded-2xl shadow-2xl p-8">
          <Outlet />
        </div>
        
        {/* Footer */}
        <p className="text-center text-blue-200 text-sm mt-8">
          © {new Date().getFullYear()} Nagocis. All rights reserved.
        </p>
      </div>
    </div>
  );
};

export default AuthLayout;