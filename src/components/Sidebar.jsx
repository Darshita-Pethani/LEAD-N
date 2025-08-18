import React, { useState } from 'react';
import { MenuItems } from './MenuItems';
import { Link, NavLink, useNavigate } from 'react-router-dom';
import { User, Lock, LogOut } from 'lucide-react';
import { toast } from "react-toastify";

const Sidebar = ({ sidebarOpen, setSidebarOpen }) => {
    const [openDropdowns, setOpenDropdowns] = useState({});
    const navigate = useNavigate();

    const toggleDropdown = key => {
        setOpenDropdowns(prev => ({ ...prev, [key]: !prev[key] }));
    };

    const handleLogout = () => {
        localStorage.removeItem('token');
        localStorage.removeItem('forceChangePwd');
        toast.success("Logout successfull");
        window.location.reload();
    };

    return (
        <>
            <aside className={`
                z-30 lg:z-10 bg-gradient-to-b from-blue-900 to-blue-700 text-white
                flex flex-col shadow-2xl border-r border-blue-800 transition-transform duration-300 ease-in-out
                ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'}
                fixed lg:static top-0 left-0 h-full w-64 xl:w-72
                lg:translate-x-0
            `}>
                <div className="flex flex-col h-full">
                    <div className="border-b-[1px] flex-shrink-0 p-4 lg:p-6 flex justify-start">
                        <NavLink
                            to='/leads'
                            className="text-xl lg:text-2xl font-bold tracking-wide flex items-center gap-3"
                        >
                            <span className="inline-flex items-center justify-center w-7 h-7 lg:w-8 lg:h-8 bg-blue-500 rounded-full">
                                <User className="w-4 h-4" />
                            </span>
                            <span>LeadGen Admin</span>
                        </NavLink>
                    </div>

                    {sidebarOpen && (
                        <button
                            className="lg:hidden fixed top-4 right-1 z-40 text-white w-[30px] h-[30px] rounded-lg hover:bg-blue-800"
                            onClick={() => setSidebarOpen(!sidebarOpen)}
                        >
                            {sidebarOpen && '✕'}
                        </button>
                    )}

                    {/* Navigation */}
                    <nav className="mt-6 flex flex-col gap-2 flex-1 px-4 pb-4 overflow-y-auto">
                        {MenuItems.map(item => (
                            item.children ? (
                                <div key={item.key} className="flex flex-col">
                                    <button
                                        className="text-left px-4 py-3 rounded-lg hover:bg-blue-800 w-full flex justify-between items-center font-semibold transition-all"
                                        onClick={() => toggleDropdown(item.key)}
                                    >
                                        <span className="flex items-center gap-3">
                                            <item.icon size={18} /> <span>{item.label}</span>
                                        </span>
                                        <span className="text-lg">{openDropdowns[item.key] ? '▲' : '▼'}</span>
                                    </button>

                                    {openDropdowns[item.key] && (
                                        <div className="ml-4 mt-2 flex flex-col gap-2 animate-fade-in">
                                            {item.children.map(child => (
                                                <NavLink
                                                    key={child.key}
                                                    to={child.path || '#'}
                                                    onClick={() => setSidebarOpen(false)}
                                                    className={({ isActive }) =>
                                                        `text-left px-4 py-2 rounded-lg text-sm flex items-center gap-2 ${isActive ? 'bg-blue-800 font-bold shadow-md' : 'hover:bg-blue-800'
                                                        }`
                                                    }
                                                >
                                                    <child.icon size={16} /> {child.label}
                                                </NavLink>
                                            ))}
                                        </div>
                                    )}
                                </div>
                            ) : (
                                <NavLink
                                    key={item.key}
                                    to={item.path || '#'}
                                    onClick={() => setSidebarOpen(false)}
                                    className={({ isActive }) =>
                                        `text-left px-4 py-3 rounded-lg transition-all font-semibold flex items-center gap-3 ${isActive ? 'bg-blue-800 shadow-md' : 'hover:bg-blue-800'
                                        }`
                                    }
                                >
                                    <item.icon size={18} /> <span>{item.label}</span>
                                </NavLink>
                            )
                        ))}
                    </nav>

                    <div className="p-4 flex flex-col gap-2">
                        <NavLink
                            to="/change-password"
                            onClick={() => setSidebarOpen(false)}
                            className="w-full flex items-center gap-3 px-4 py-3 bg-blue-800 rounded-lg hover:bg-blue-900 transition-all text-sm font-semibold"
                        >
                            <Lock size={16} /> Change Password
                        </NavLink>

                        <button
                            type="button"
                            onClick={handleLogout}
                            className="w-full flex items-center gap-3 px-4 py-3 bg-red-600 rounded-lg hover:bg-red-700 transition-all text-sm font-bold"
                        >
                            <LogOut size={16} /> Logout
                        </button>
                    </div>
                </div>
            </aside>
        </>
    );
};

export default Sidebar;
