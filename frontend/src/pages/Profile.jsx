import React, { useState, useContext, useEffect } from 'react';
import { Navigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import Sidebar from '../components/Sidebar';
import axios from 'axios';

const Profile = () => {
  const { user, loading, setUser } = useContext(AuthContext);
  const [formData, setFormData] = useState({
    name: '',
    age: '',
    gender: 'Male',
    weight: '',
    height: '',
    bloodGroup: 'Unknown'
  });
  const [message, setMessage] = useState('');

  useEffect(() => {
    if (user) {
      setFormData({
        name: user.name || '',
        age: user.age || '',
        gender: user.gender || 'Male',
        weight: user.weight || '',
        height: user.height || '',
        bloodGroup: user.bloodGroup || 'Unknown'
      });
    }
  }, [user]);

  if (loading) return <div className="flex justify-center items-center h-[80vh]">Loading...</div>;
  if (!user) return <Navigate to="/login" />;

  const calculatedBmi = formData.weight && formData.height 
    ? (formData.weight / ((formData.height / 100) * (formData.height / 100))).toFixed(1) 
    : '--';

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const payload = {
        ...formData,
        bmi: calculatedBmi !== '--' ? parseFloat(calculatedBmi) : null
      };

      const token = localStorage.getItem('token');
      const res = await axios.put('http://localhost:5000/api/user/profile', payload, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setUser(res.data);
      setMessage('Profile updated successfully!');
      setTimeout(() => setMessage(''), 3000);
    } catch (err) {
      setMessage('Failed to update profile.');
    }
  };

  return (
    <div className="flex flex-1 bg-slate-50 min-h-[calc(100vh-140px)]">
      <Sidebar />
      <div className="flex-1 p-8 overflow-auto">
        <h1 className="text-3xl font-bold text-slate-800 mb-6">My Profile</h1>
        <div className="card max-w-3xl">
          {message && <div className="bg-green-100 text-green-700 p-3 rounded mb-4">{message}</div>}
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              
              <div className="space-y-4">
                <h3 className="font-semibold text-slate-700 border-b pb-2">Basic Info</h3>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Email (Cannot be changed)</label>
                  <input type="email" className="input-field bg-slate-100 text-slate-500" value={user.email} disabled />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Full Name</label>
                  <input 
                    type="text" 
                    className="input-field" 
                    value={formData.name}
                    onChange={(e) => setFormData({...formData, name: e.target.value})}
                    required 
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">Age</label>
                    <input 
                      type="number" 
                      className="input-field" 
                      value={formData.age}
                      onChange={(e) => setFormData({...formData, age: e.target.value})}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">Gender</label>
                    <select 
                      className="input-field"
                      value={formData.gender}
                      onChange={(e) => setFormData({...formData, gender: e.target.value})}
                    >
                      <option value="Male">Male</option>
                      <option value="Female">Female</option>
                      <option value="Other">Other</option>
                    </select>
                  </div>
                </div>
              </div>

              <div className="space-y-4">
                <h3 className="font-semibold text-slate-700 border-b pb-2">Health Metrics</h3>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Blood Group</label>
                  <select 
                    className="input-field"
                    value={formData.bloodGroup}
                    onChange={(e) => setFormData({...formData, bloodGroup: e.target.value})}
                  >
                    <option value="Unknown">Unknown</option>
                    <option value="A+">A+</option>
                    <option value="A-">A-</option>
                    <option value="B+">B+</option>
                    <option value="B-">B-</option>
                    <option value="AB+">AB+</option>
                    <option value="AB-">AB-</option>
                    <option value="O+">O+</option>
                    <option value="O-">O-</option>
                  </select>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">Weight (kg)</label>
                    <input 
                      type="number" 
                      step="0.1"
                      className="input-field" 
                      value={formData.weight}
                      onChange={(e) => setFormData({...formData, weight: e.target.value})}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">Height (cm)</label>
                    <input 
                      type="number" 
                      step="0.1"
                      className="input-field" 
                      value={formData.height}
                      onChange={(e) => setFormData({...formData, height: e.target.value})}
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Calculated BMI</label>
                  <div className="p-3 bg-slate-50 border border-slate-200 rounded text-slate-700 font-semibold flex items-center justify-between">
                    <span>{calculatedBmi}</span>
                    {calculatedBmi !== '--' && (
                      <span className={`text-xs px-2 py-1 rounded-full ${
                        calculatedBmi < 18.5 ? 'bg-blue-100 text-blue-700' :
                        calculatedBmi < 25 ? 'bg-green-100 text-green-700' :
                        calculatedBmi < 30 ? 'bg-orange-100 text-orange-700' :
                        'bg-red-100 text-red-700'
                      }`}>
                        {calculatedBmi < 18.5 ? 'Underweight' :
                         calculatedBmi < 25 ? 'Normal' :
                         calculatedBmi < 30 ? 'Overweight' : 'Obese'}
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-slate-400 mt-1">Automatically calculated from height and weight.</p>
                </div>
              </div>

            </div>
            
            <div className="pt-4 border-t">
              <button type="submit" className="btn-primary w-full md:w-auto">Save Profile</button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default Profile;
