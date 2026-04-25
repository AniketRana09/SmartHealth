import React, { useState, useEffect } from 'react';
import Sidebar from '../components/Sidebar';
import axios from 'axios';

const RiskAnalysis = () => {
  const [features, setFeatures] = useState([]);
  const [formData, setFormData] = useState({});
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [loadingInfo, setLoadingInfo] = useState(true);

  useEffect(() => {
    const fetchInfo = async () => {
      try {
        const token = localStorage.getItem('token');
        const res = await axios.get('http://localhost:5000/api/risk/info', {
          headers: { Authorization: `Bearer ${token}` }
        });
        if (res.data && res.data.data && res.data.data.features) {
          setFeatures(res.data.data.features);
          const initialData = {};
          res.data.data.features.forEach(f => {
            initialData[f] = '';
          });
          setFormData(initialData);
        }
      } catch (err) {
        console.error("Failed to fetch risk model info:", err);
      } finally {
        setLoadingInfo(false);
      }
    };
    fetchInfo();
  }, []);

  const handleChange = (feature, value) => {
    setFormData(prev => ({ ...prev, [feature]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setResult(null);

    try {
      const token = localStorage.getItem('token');
      // Parse to float if possible for the backend
      const parsedData = {};
      Object.keys(formData).forEach(k => {
        const val = parseFloat(formData[k]);
        parsedData[k] = isNaN(val) ? formData[k] : val;
      });

      const res = await axios.post(
        'http://localhost:5000/api/risk',
        parsedData,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setResult(res.data.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-1 bg-slate-50 min-h-[calc(100vh-140px)]">
      <Sidebar />
      <div className="flex-1 p-8">
        <h1 className="text-3xl font-bold text-slate-800 mb-6">Risk Analysis</h1>

        <div className="grid lg:grid-cols-2 gap-8">
          <div className="card">
            <h2 className="text-xl font-semibold text-slate-700 mb-4">Input Health Metrics</h2>

            {loadingInfo ? (
              <div className="flex items-center justify-center h-32 text-slate-500">
                Loading model configuration...
              </div>
            ) : features.length > 0 ? (
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  {features.map((feature, idx) => {
                    // Define categorical options. Adjust these to match your model's exact training data values!
                    const optionsMap = {
                      smoking: ['no', 'yes'],
                      alcohol: ['no', 'yes'],
                      married: ['no', 'yes'],
                      exercise: ['none', 'low', 'medium', 'high'],
                      sugar_intake: ['low', 'medium', 'high'],
                      profession: ['artist', 'doctor', 'driver', 'engineer', 'farmer', 'office_worker', 'student', 'teacher']
                    };

                    const isDropdown = optionsMap.hasOwnProperty(feature);

                    return (
                      <div key={idx}>
                        <label className="block text-sm font-medium text-slate-700 mb-1 capitalize">
                          {feature.replace(/_/g, ' ')}
                        </label>
                        {isDropdown ? (
                          <select
                            className="input-field w-full bg-white"
                            value={formData[feature] !== undefined ? formData[feature] : ''}
                            onChange={(e) => handleChange(feature, e.target.value)}
                            required
                          >
                            <option value="" disabled>Select {feature.replace(/_/g, ' ')}</option>
                            {optionsMap[feature].map(opt => (
                              <option key={opt} value={opt}>{opt}</option>
                            ))}
                          </select>
                        ) : (
                          <input
                            type={['age', 'weight', 'height', 'bmi', 'sleep', 'ap_hi', 'ap_lo', 'heart_rate'].includes(feature) ? 'number' : 'text'}
                            step="any"
                            className="input-field w-full"
                            value={formData[feature] !== undefined ? formData[feature] : ''}
                            onChange={(e) => handleChange(feature, e.target.value)}
                            required
                            placeholder={`Enter ${feature.replace(/_/g, ' ')}`}
                          />
                        )}
                      </div>
                    );
                  })}
                </div>
                <button
                  type="submit"
                  className="btn-primary w-full flex justify-center items-center mt-6"
                  disabled={loading}
                >
                  {loading ? 'Analyzing...' : 'Calculate Risk Score'}
                </button>
              </form>
            ) : (
              <div className="text-red-500 bg-red-50 p-4 rounded-lg">
                Could not load model features. Please ensure the backend is running and the risk model is configured.
              </div>
            )}
          </div>

          <div className="card bg-slate-100 border-none">
            <h2 className="text-xl font-semibold text-slate-700 mb-4">Risk Evaluation</h2>
            {!result && !loading && (
              <div className="text-slate-500 italic flex items-center justify-center h-48 border-2 border-dashed border-slate-300 rounded-lg bg-white">
                Submit metrics to view risk analysis.
              </div>
            )}

            {loading && (
              <div className="text-blue-500 italic flex items-center justify-center h-48 border-2 border-dashed border-blue-200 bg-blue-50 rounded-lg">
                Processing your data...
              </div>
            )}

            {result && (
              <div className="bg-white p-6 rounded-lg shadow-sm border border-slate-200">
                <div className="mb-6">
                  <h4 className="text-sm font-semibold text-slate-500 uppercase tracking-wide mb-2">Overall Risk Level</h4>
                  <div className={`inline-block px-4 py-2 rounded-lg text-lg font-bold border ${result.overall_risk === 'Low' || result.overall_risk === '0' ? 'bg-green-100 text-green-800 border-green-200' :
                    result.overall_risk === 'Moderate' ? 'bg-yellow-100 text-yellow-800 border-yellow-200' :
                      'bg-red-100 text-red-800 border-red-200'
                    }`}>
                    {result.overall_risk} Risk
                  </div>
                </div>

                <h4 className="font-semibold text-slate-700 mb-2">Analysis Details:</h4>
                <ul className="list-disc pl-5 space-y-1 mb-6 text-slate-600 border-b border-slate-100 pb-4">
                  {result.factors && result.factors.map((factor, index) => (
                    <li key={index}>{factor}</li>
                  ))}
                  {result.probability && (
                    <li className="mt-2 text-slate-800">Calculated Probability: <span className="font-semibold">{result.probability}</span></li>
                  )}
                </ul>

                <div className="p-3 bg-blue-50 border border-blue-100 text-blue-800 text-sm rounded-lg italic">
                  Note: {result.note || 'AI prediction based on clinical dataset.'}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default RiskAnalysis;
