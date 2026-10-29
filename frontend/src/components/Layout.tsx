import React from 'react';
import { Outlet } from 'react-router-dom';
import { Sidebar } from './Sidebar';
import { Navbar } from './Navbar';

export const Layout: React.FC = () => {
  return (
    <div className="flex h-screen overflow-hidden bg-[#0B0F19] text-slate-100">
      <Sidebar />
      <div className="flex-1 flex flex-col overflow-hidden relative">
        <Navbar />
        <main className="flex-1 overflow-y-auto p-5 sm:p-6 bg-[#0B0F19]">
          <Outlet />
        </main>
      </div>
    </div>
  );
};
