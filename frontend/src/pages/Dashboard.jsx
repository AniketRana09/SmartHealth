import React, { useContext } from 'react';
import { Navigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import Sidebar from '../components/Sidebar';

const Dashboard = () => {
  const { user, loading } = useContext(AuthContext);

  if (loading) return <div className="flex justify-center items-center h-[80vh]">Loading...</div>;
  if (!user) return <Navigate to="/login" />;

  return (
    <div className="flex flex-1 bg-slate-50 min-h-[calc(100vh-140px)]">
      <Sidebar />
      <div className="flex-1 p-8">
        <h1 className="text-3xl font-bold text-slate-800 mb-6">Dashboard</h1>
        <div className="card bg-gradient-to-r from-healthcare-500 to-healthcare-700 text-white mb-8 border-none">
          <h2 className="text-2xl font-semibold mb-2">Welcome, {user.name}!</h2>
          <p className="text-healthcare-50">Manage your health profile and access smart predictive tools from your dashboard.</p>
        </div>
        
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          <div className="card">
            <h3 className="text-lg font-bold text-slate-700 mb-2">Recent Predictions</h3>
            <p className="text-sm text-slate-500 italic">No recent prediction history available.</p>
          </div>
          <div className="card">
            <h3 className="text-lg font-bold text-slate-700 mb-2">Risk Status</h3>
            <p className="text-sm text-slate-500 italic">Complete a risk analysis to see your status.</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
