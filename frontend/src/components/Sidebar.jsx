import React, { useContext } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { User, Activity, Stethoscope, HeartPulse, MessageSquare, LogOut } from 'lucide-react';
import { AuthContext } from '../context/AuthContext';

const Sidebar = () => {
  const { logout } = useContext(AuthContext);
  const location = useLocation();

  const navItems = [
    { path: '/dashboard', name: 'Dashboard', icon: Activity },
    { path: '/profile', name: 'Profile', icon: User },
    { path: '/predict', name: 'Disease Prediction', icon: Stethoscope },
    { path: '/risk', name: 'Risk Analysis', icon: HeartPulse },
    { path: '/chatbot', name: 'Medical Chatbot', icon: MessageSquare },
  ];

  return (
    <aside className="w-64 bg-white shadow-md min-h-full hidden md:block border-r border-slate-100">
      <div className="p-6">
        <h2 className="text-xl font-bold text-slate-800 tracking-wide">User Panel</h2>
      </div>
      <nav className="mt-4 flex flex-col h-[calc(100%-80px)] justify-between">
        <ul className="space-y-2 px-4">
          {navItems.map((item) => {
            const isActive = location.pathname === item.path;
            const Icon = item.icon;
            return (
              <li key={item.path}>
                <Link
                  to={item.path}
                  className={`flex items-center space-x-3 px-4 py-3 rounded-lg transition-colors ${
                    isActive 
                    ? 'bg-healthcare-50 text-healthcare-700 font-medium' 
                    : 'text-slate-600 hover:bg-slate-50 hover:text-healthcare-600'
                  }`}
                >
                  <Icon size={20} className={isActive ? 'text-healthcare-600' : 'text-slate-400'} />
                  <span>{item.name}</span>
                </Link>
              </li>
            );
          })}
        </ul>
        <div className="p-4 border-t border-slate-100">
          <button 
            onClick={logout}
            className="flex items-center space-x-3 text-red-500 hover:text-red-700 hover:bg-red-50 w-full px-4 py-3 rounded-lg transition"
          >
            <LogOut size={20} />
            <span>Logout</span>
          </button>
        </div>
      </nav>
    </aside>
  );
};

export default Sidebar;
