import React, { useContext, useEffect, useState } from 'react';
import { Navigate } from 'react-router-dom';
import axios from 'axios';
import { AuthContext } from '../context/AuthContext';
import Sidebar from '../components/Sidebar';

const Dashboard = () => {
  const { user, loading } = useContext(AuthContext);
  const [history, setHistory] = useState([]);
  const [historyLoading, setHistoryLoading] = useState(true);

  useEffect(() => {
    if (user) {
      const fetchHistory = async () => {
        try {
          const token = localStorage.getItem('token');
          const res = await axios.get('http://localhost:5000/api/user/history', {
            headers: { Authorization: `Bearer ${token}` }
          });
          setHistory(res.data.data);
        } catch (error) {
          console.error("Failed to fetch history", error);
        } finally {
          setHistoryLoading(false);
        }
      };
      fetchHistory();
    }
  }, [user]);

  if (loading) return <div className="flex justify-center items-center h-[80vh]">Loading...</div>;
  if (!user) return <Navigate to="/login" />;

  return (
    <div className="flex flex-1 bg-slate-50 min-h-[calc(100vh-140px)]">
      <Sidebar />
      <div className="flex-1 p-8 overflow-auto">
        <h1 className="text-3xl font-bold text-slate-800 mb-6">Dashboard</h1>
        <div className="card bg-gradient-to-r from-healthcare-500 to-healthcare-700 text-white mb-8 border-none">
          <h2 className="text-2xl font-semibold mb-2">Welcome, {user.name}!</h2>
          <p className="text-healthcare-50">Manage your health profile and access smart predictive tools from your dashboard.</p>
        </div>
        
        <div className="grid md:grid-cols-2 gap-6">
          <div className="card col-span-2">
            <h3 className="text-lg font-bold text-slate-700 mb-4">Recent Predictions & Risk Analysis</h3>
            {historyLoading ? (
                <p className="text-sm text-slate-500 italic">Loading history...</p>
            ) : history.length === 0 ? (
                <p className="text-sm text-slate-500 italic">No recent prediction history available. Go to the prediction tools to get started!</p>
            ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse">
                    <thead>
                      <tr className="border-b text-slate-600">
                        <th className="py-2 px-4">Date</th>
                        <th className="py-2 px-4">Type</th>
                        <th className="py-2 px-4">Result</th>
                      </tr>
                    </thead>
                    <tbody>
                      {history.map((item) => (
                        <tr key={item._id} className="border-b hover:bg-slate-50">
                          <td className="py-3 px-4 whitespace-nowrap text-sm text-slate-500">
                            {new Date(item.date).toLocaleDateString()} {new Date(item.date).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                          </td>
                          <td className="py-3 px-4 font-medium text-slate-700">
                            {item.type}
                          </td>
                          <td className="py-3 px-4 text-sm font-semibold text-healthcare-600">
                            {item.resultData?.prediction || item.resultData?.disease || item.resultData?.risk_level || 'Check Details'}
                            {item.resultData?.probability ? ` (${(item.resultData.probability * 100).toFixed(1)}%)` : ''}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
