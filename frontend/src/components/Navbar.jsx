import React, { useContext } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Activity } from 'lucide-react';
import { AuthContext } from '../context/AuthContext';

const Navbar = () => {
  const { user, logout } = useContext(AuthContext);
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  return (
    <nav className="bg-white shadow relative z-20">
      <div className="container mx-auto px-6 py-4 flex justify-between items-center">
        <Link to="/" className="flex items-center space-x-2 text-2xl font-bold text-healthcare-700 hover:text-healthcare-800 transition">
          <Activity size={32} className="text-healthcare-600" />
          <span>SmartHealth</span>
        </Link>
        <div className="hidden md:flex space-x-8 items-center">
          <Link to="/" className="text-slate-600 hover:text-healthcare-600 transition">Home</Link>
          <Link to="/about" className="text-slate-600 hover:text-healthcare-600 transition">About</Link>
          <Link to="/features" className="text-slate-600 hover:text-healthcare-600 transition">Features</Link>
          {user ? (
            <>
              <Link to="/dashboard" className="text-slate-600 hover:text-healthcare-600 transition">Dashboard</Link>
              <button onClick={handleLogout} className="text-healthcare-600 font-semibold hover:text-healthcare-700 transition">Logout</button>
            </>
          ) : (
            <>
              <Link to="/login" className="text-healthcare-600 font-semibold hover:text-healthcare-700 transition">Login</Link>
              <Link to="/register" className="btn-primary">Get Started</Link>
            </>
          )}
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
