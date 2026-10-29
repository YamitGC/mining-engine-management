import React from 'react';
import { Outlet } from 'react-router-dom';
import { Sidebar } from './Sidebar';
import { Navbar } from './Navbar';

export const Layout: React.FC = () => {
  return (
    <div className="flex h-screen overflow-hidden bg-[#070a12] text-slate-100">
      <Sidebar />
      <div className="flex-1 flex flex-col overflow-hidden relative">
        <Navbar />
        <main className="flex-1 overflow-y-auto p-6 md:p-8 bg-[#070a12]/60 relative">
          {/* Subtle Ambient Top Center Glow */}
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-3/4 h-32 bg-amber-500/[0.03] blur-3xl pointer-events-none -z-10" />
          <Outlet />
        </main>
      </div>
    </div>
  );
};
