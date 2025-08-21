import React, { useState, useEffect } from 'react';
import Sidebar from './Sidebar';
import { Outlet } from 'react-router-dom';

export default function Layout() {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className="flex flex-col lg:flex-row h-screen overflow-hidden">
      {/* Mobile Toggle */}
      {
        !sidebarOpen &&
        <button
          className="lg:hidden fixed top-4 left-4 z-40 bg-blue-900 text-white w-[30px] h-[30px] rounded-lg shadow-lg hover:bg-blue-800"
          onClick={() => setSidebarOpen(!sidebarOpen)}
        >
          {!sidebarOpen && '☰'}
        </button>
      }

      {sidebarOpen && (
        <div
          className="lg:hidden fixed inset-0 bg-black bg-opacity-50 z-30"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <Sidebar sidebarOpen={sidebarOpen} setSidebarOpen={setSidebarOpen} />

      {/* Main Content */}
      <main className="flex-1 overflow-y-auto bg-gradient-to-br from-blue-50 via-white to-gray-100">
        <div className="bg-gradient-to-r from-blue-100 via-white to-blue-50 py-2 mb-1 shadow fixed w-full	 z-10">
          <div className='pl-14 items-start'>

            <h1 className="text-lg md:text-xl font-semibold text-blue-900 tracking-wide mb-0">
              Staycation CRM Platform
            </h1>
            <p className="text-blue-700 text-xs md:text-sm font-normal">
              Streamline your lead generation and management.
            </p>
          </div>
        </div>
        <div className="p-8 pt-24">
          <Outlet />
        </div>
      </main>
    </div>
  );
}
