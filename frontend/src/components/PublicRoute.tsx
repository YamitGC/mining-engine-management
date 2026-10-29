import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

interface PublicRouteProps {
  children: React.ReactNode;
}

/**
 * PublicRoute protege rutas públicas (como /login).
 * Si el usuario ya tiene una sesión iniciada (token y user válidos),
 * lo redirige automáticamente a /dashboard para evitar que acceda al login.
 */
export const PublicRoute: React.FC<PublicRouteProps> = ({ children }) => {
  const { user, token, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#0B0F19] flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-slate-600 border-t-amber-500 rounded-full animate-spin"></div>
      </div>
    );
  }

  if (token && user) {
    return <Navigate to="/dashboard" replace />;
  }

  return <>{children}</>;
};

