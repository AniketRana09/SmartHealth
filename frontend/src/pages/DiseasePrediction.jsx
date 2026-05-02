import React, { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import Sidebar from '../components/Sidebar';
import axios from 'axios';
import { Activity, HeartPulse, ShieldAlert, ArrowLeft, Search } from 'lucide-react';


const DiseasePrediction = () => {
  const [activePrediction, setActivePrediction] = useState(null);
  const location = useLocation();

  useEffect(() => {
    // Reset to show cards when navigating to this page or clicking the sidebar link again
    setActivePrediction(null);
  }, [location.key]);

  const [formData, setFormData] = useState({
    gender: '0',
    age: '',
    hypertension: '0',
    heart_disease: '0',
    bmi: '',
    HbA1c_level: '',
    blood_glucose_level: '',
    smoking_history: 'No Info'
  });

  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const [generalSymptomsList, setGeneralSymptomsList] = useState([]);
  const [selectedGeneralSymptoms, setSelectedGeneralSymptoms] = useState([]);
  const [symptomsLoading, setSymptomsLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');

  const [heartFeatures, setHeartFeatures] = useState([]);
  const [heartFormData, setHeartFormData] = useState({});
  const [heartInfoLoading, setHeartInfoLoading] = useState(false);

  const fetchHeartFeatures = async () => {
    setHeartInfoLoading(true);
    try {
      const token = localStorage.getItem('token');
      const res = await axios.get('http://localhost:5000/api/predict-heart/info', {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (res.data && res.data.data && res.data.data.features) {
        setHeartFeatures(res.data.data.features);
        const initialData = {};
        res.data.data.features.forEach(f => {
          initialData[f] = '';
        });
        setHeartFormData(initialData);
      }
    } catch (err) {
      console.error(err);
      setError('Failed to fetch heart model info.');
    } finally {
      setHeartInfoLoading(false);
    }
  };

  const handleHeartChange = (feature, value) => {
    setHeartFormData(prev => ({ ...prev, [feature]: value }));
  };

  const handleHeartSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setResult(null);

    try {
      const token = localStorage.getItem('token');
      const parsedData = {};
      Object.keys(heartFormData).forEach(k => {
        const val = parseFloat(heartFormData[k]);
        parsedData[k] = isNaN(val) ? heartFormData[k] : val;
      });

      const res = await axios.post(
        'http://localhost:5000/api/predict-heart',
        parsedData,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setResult(res.data.data);
    } catch (err) {
      if (err.response && err.response.data && err.response.data.error) {
        setError(`Backend Error: ${err.response.data.error}`);
      } else if (err.response && err.response.data && err.response.data.message) {
        setError(`Backend Error: ${err.response.data.message}`);
      } else {
        setError('Error: ' + err.message);
      }
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (activePrediction === 'general' && generalSymptomsList.length === 0) {
      fetchGeneralSymptoms();
    }
    if (activePrediction === 'heart' && heartFeatures.length === 0) {
      fetchHeartFeatures();
    }
  }, [activePrediction]);

  const fetchGeneralSymptoms = async () => {
    setSymptomsLoading(true);
    try {
      const token = localStorage.getItem('token');
      const res = await axios.get('http://localhost:5000/api/predict-general/symptoms', {
        headers: { Authorization: `Bearer ${token}` }
      });
      setGeneralSymptomsList(res.data.data || []);
    } catch (err) {
      console.error(err);
      setError('Failed to fetch symptom list.');
    } finally {
      setSymptomsLoading(false);
    }
  };

  const handleGeneralSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setResult(null);

    try {
      const token = localStorage.getItem('token');
      const res = await axios.post(
        'http://localhost:5000/api/predict-general',
        { symptoms: selectedGeneralSymptoms },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setResult(res.data.data);
    } catch (err) {
      if (err.response && err.response.data && err.response.data.error) {
        setError(`Backend Error: ${err.response.data.error}`);
      } else if (err.response && err.response.data && err.response.data.message) {
        setError(`Backend Error: ${err.response.data.message}`);
      } else {
        setError('Error: ' + err.message);
      }
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const toggleSymptom = (sym) => {
    if (selectedGeneralSymptoms.includes(sym)) {
      setSelectedGeneralSymptoms(selectedGeneralSymptoms.filter((s) => s !== sym));
    } else {
      setSelectedGeneralSymptoms([...selectedGeneralSymptoms, sym]);
    }
  }; const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setResult(null);

    // Convert string inputs to correct types
    const payload = {
      gender: parseInt(formData.gender),
      age: parseFloat(formData.age),
      hypertension: parseInt(formData.hypertension),
      heart_disease: parseInt(formData.heart_disease),
      bmi: parseFloat(formData.bmi),
      HbA1c_level: parseFloat(formData.HbA1c_level),
      blood_glucose_level: parseFloat(formData.blood_glucose_level),
      smoking_history: formData.smoking_history
    };

    try {
      const token = localStorage.getItem('token');
      const res = await axios.post(
        'http://localhost:5000/api/predict',
        payload,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setResult(res.data.data);
    } catch (err) {
      setError('An error occurred while fetching the prediction. Ensure backend is running.');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const renderSelectionCards = () => (
    <>
      <h1 className="text-3xl font-bold text-slate-800 mb-6">Choose a Prediction Model</h1>
      <div className="grid md:grid-cols-3 gap-6">
        <div
          onClick={() => setActivePrediction('diabetes')}
          className="card cursor-pointer hover:shadow-lg hover:-translate-y-1 transition transform duration-300 flex flex-col items-center p-8 text-center border-t-4 border-t-healthcare-500"
        >
          <div className="w-16 h-16 bg-healthcare-100 text-healthcare-600 rounded-full flex items-center justify-center mb-4">
            <Activity size={32} />
          </div>
          <h2 className="text-xl font-bold text-slate-700 mb-2">Diabetes Risk</h2>
          <p className="text-slate-500 text-sm">Analyze clinical metrics to predict the probability of diabetes.</p>
        </div>

        <div
          onClick={() => setActivePrediction('heart')}
          className="card cursor-pointer hover:shadow-lg hover:-translate-y-1 transition transform duration-300 flex flex-col items-center p-8 text-center border-t-4 border-t-red-500"
        >
          <div className="w-16 h-16 bg-red-100 text-red-600 rounded-full flex items-center justify-center mb-4">
            <HeartPulse size={32} />
          </div>
          <h2 className="text-xl font-bold text-slate-700 mb-2">Heart Disease</h2>
          <p className="text-slate-500 text-sm">Evaluate cardiovascular risk factors to predict heart disease.</p>
        </div>

        <div
          onClick={() => setActivePrediction('general')}
          className="card cursor-pointer hover:shadow-lg hover:-translate-y-1 transition transform duration-300 flex flex-col items-center p-8 text-center border-t-4 border-t-purple-500"
        >
          <div className="w-16 h-16 bg-purple-100 text-purple-600 rounded-full flex items-center justify-center mb-4">
            <ShieldAlert size={32} />
          </div>
          <h2 className="text-xl font-bold text-slate-700 mb-2">General Diagnosis</h2>
          <p className="text-slate-500 text-sm">Input generalized symptoms for a preliminary health assessment.</p>
        </div>
      </div>
    </>
  );

  const renderDiabetesForm = () => (
    <>
      <button
        onClick={() => { setActivePrediction(null); setResult(null); setError(''); }}
        className="flex items-center text-slate-500 hover:text-healthcare-600 mb-6 transition"
      >
        <ArrowLeft size={20} className="mr-2" /> Back to Models
      </button>
      <h1 className="text-3xl font-bold text-slate-800 mb-6">Diabetes Risk Prediction</h1>

      <div className="grid lg:grid-cols-2 gap-8">
        <div className="card">
          <h2 className="text-xl font-semibold text-slate-700 mb-4">Clinical Metrics</h2>
          <form onSubmit={handleSubmit} className="space-y-4">

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Gender</label>
                <select name="gender" value={formData.gender} onChange={handleChange} className="input-field">
                  <option value="0">Female</option>
                  <option value="1">Male</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Age</label>
                <input type="number" name="age" value={formData.age} onChange={handleChange} step="0.1" required className="input-field" placeholder="e.g. 45" />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Hypertension</label>
                <select name="hypertension" value={formData.hypertension} onChange={handleChange} className="input-field">
                  <option value="0">No</option>
                  <option value="1">Yes</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Heart Disease</label>
                <select name="heart_disease" value={formData.heart_disease} onChange={handleChange} className="input-field">
                  <option value="0">No</option>
                  <option value="1">Yes</option>
                </select>
              </div>
            </div>

            <div className="grid grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">BMI</label>
                <input type="number" name="bmi" value={formData.bmi} onChange={handleChange} step="0.1" required className="input-field" placeholder="e.g. 24.5" />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">HbA1c Level</label>
                <input type="number" name="HbA1c_level" value={formData.HbA1c_level} onChange={handleChange} step="0.1" required className="input-field" placeholder="e.g. 5.5" />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Blood Glucose</label>
                <input type="number" name="blood_glucose_level" value={formData.blood_glucose_level} onChange={handleChange} step="0.1" required className="input-field" placeholder="e.g. 140" />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Smoking History</label>
              <select name="smoking_history" value={formData.smoking_history} onChange={handleChange} className="input-field">
                <option value="No Info">No Info</option>
                <option value="current">Current</option>
                <option value="ever">Ever (Tried/Occasional)</option>
                <option value="former">Former</option>
                <option value="never">Never</option>
                <option value="not current">Not Current</option>
              </select>
            </div>

            <button
              type="submit"
              className="btn-primary w-full flex justify-center items-center mt-6"
              disabled={loading}
            >
              {loading ? (
                <span className="animate-spin h-5 w-5 border-2 border-white border-t-transparent rounded-full mr-2"></span>
              ) : null}
              {loading ? 'Analyzing Patient Data...' : 'Predict Diabetes Risk'}
            </button>
          </form>
        </div>

        <div className="card bg-slate-100 border-none">
          <h2 className="text-xl font-semibold text-slate-700 mb-4">Analysis Result</h2>
          {error && <div className="text-red-500 mb-4 bg-red-50 p-3 rounded">{error}</div>}

          {!result && !loading && !error && (
            <div className="text-slate-500 italic flex items-center justify-center h-48 border-2 border-dashed border-slate-300 rounded-lg">
              Submit patient metrics to see predictions.
            </div>
          )}

          {result && (
            <div className="space-y-4 bg-white p-6 rounded-lg shadow-sm border border-healthcare-100">
              <div>
                <h4 className="text-sm font-semibold text-healthcare-600 uppercase tracking-wide">Predicted Condition</h4>
                <p className="text-2xl font-bold text-slate-800">{result.prediction}</p>
              </div>
              <div className="grid grid-cols-2 gap-4 border-t border-b border-slate-100 py-4">
                <div>
                  <h4 className="text-sm font-medium text-slate-500 mb-1">Probability of Diabetes</h4>
                  <p className="text-lg font-semibold text-slate-700">{result.probability}</p>
                </div>
                <div>
                  <h4 className="text-sm font-medium text-slate-500 mb-1">Risk Level</h4>
                  <span className={`px-3 py-1 rounded-full text-sm font-medium ${result.risk_level === 'Low' ? 'bg-green-100 text-green-700' :
                      result.risk_level === 'Moderate' ? 'bg-yellow-100 text-yellow-700' :
                        'bg-red-100 text-red-700'
                    }`}>
                    {result.risk_level}
                  </span>
                </div>
              </div>
              <div>
                <h4 className="text-sm font-semibold text-slate-700 mb-1">Recommendation</h4>
                <p className="text-slate-600">{result.recommendation}</p>
              </div>
              <div className="mt-4 p-3 bg-blue-50 border border-blue-100 text-blue-800 text-sm rounded-lg italic">
                Note: {result.note}
              </div>
            </div>
          )}
        </div>
      </div>
    </>
  );


  const renderHeartForm = () => (
    <>
      <button
        onClick={() => { setActivePrediction(null); setResult(null); setError(''); }}
        className="flex items-center text-slate-500 hover:text-red-600 mb-6 transition"
      >
        <ArrowLeft size={20} className="mr-2" /> Back to Models
      </button>
      <h1 className="text-3xl font-bold text-slate-800 mb-6">Heart Disease Prediction</h1>

      <div className="grid lg:grid-cols-2 gap-8">
        <div className="card border-t-4 border-t-red-500">
          <h2 className="text-xl font-semibold text-slate-700 mb-4">Patient Metrics</h2>
          {heartInfoLoading ? (
            <div className="flex justify-center py-8">
              <span className="animate-spin h-8 w-8 border-4 border-red-500 border-t-transparent rounded-full"></span>
            </div>
          ) : heartFeatures.length > 0 ? (
            <form onSubmit={handleHeartSubmit} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                {heartFeatures.map((feature, idx) => {
                  const dropdownOptions = {
                    sex: [{label: 'Female', value: 0}, {label: 'Male', value: 1}],
                    cp: [{label: 'Typical Angina', value: 0}, {label: 'Atypical Angina', value: 1}, {label: 'Non-anginal Pain', value: 2}, {label: 'Asymptomatic', value: 3}],
                    chestpaintype: [{label: 'Typical Angina', value: 0}, {label: 'Atypical Angina', value: 1}, {label: 'Non-anginal Pain', value: 2}, {label: 'Asymptomatic', value: 3}],
                    fbs: [{label: 'False (< 120 mg/dl)', value: 0}, {label: 'True (> 120 mg/dl)', value: 1}],
                    fastingbs: [{label: 'False (< 120 mg/dl)', value: 0}, {label: 'True (> 120 mg/dl)', value: 1}],
                    restecg: [{label: 'Normal', value: 0}, {label: 'ST-T Wave Abnormality', value: 1}, {label: 'Left Ventricular Hypertrophy', value: 2}],
                    restingecg: [{label: 'Normal', value: 0}, {label: 'ST-T Wave Abnormality', value: 1}, {label: 'Left Ventricular Hypertrophy', value: 2}],
                    exang: [{label: 'No', value: 0}, {label: 'Yes', value: 1}],
                    exerciseangina: [{label: 'No', value: 0}, {label: 'Yes', value: 1}],
                    slope: [{label: 'Upsloping', value: 0}, {label: 'Flat', value: 1}, {label: 'Downsloping', value: 2}],
                    st_slope: [{label: 'Upsloping', value: 0}, {label: 'Flat', value: 1}, {label: 'Downsloping', value: 2}],
                    ca: [{label: '0', value: 0}, {label: '1', value: 1}, {label: '2', value: 2}, {label: '3', value: 3}],
                    thal: [{label: 'Normal', value: 1}, {label: 'Fixed Defect', value: 2}, {label: 'Reversable Defect', value: 3}],
                  };

                  const featLower = feature.toLowerCase();
                  const isDropdown = Object.keys(dropdownOptions).includes(featLower);
                  const options = isDropdown ? dropdownOptions[featLower] : [];
                  
                  return (
                    <div key={idx}>
                      <label className="block text-sm font-medium text-slate-700 mb-1 capitalize">
                        {feature.replace(/_/g, ' ')}
                      </label>
                      {isDropdown ? (
                         <select
                           className="input-field w-full bg-white"
                           value={heartFormData[feature] !== undefined ? heartFormData[feature] : ''}
                           onChange={(e) => handleHeartChange(feature, e.target.value)}
                           required
                         >
                           <option value="" disabled>Select {feature.replace(/_/g, ' ')}</option>
                           {options.map(opt => (
                             <option key={opt.value} value={opt.value}>{opt.label}</option>
                           ))}
                         </select>
                      ) : (
                        <input
                          type="number"
                          step="any"
                          className="input-field w-full"
                          value={heartFormData[feature] !== undefined ? heartFormData[feature] : ''}
                          onChange={(e) => handleHeartChange(feature, e.target.value)}
                          required
                          placeholder={`Enter ${feature}`}
                        />
                      )}
                    </div>
                  );
                })}
              </div>
              <button
                type="submit"
                className="btn-primary bg-red-600 hover:bg-red-700 w-full flex justify-center items-center mt-6 shadow-md"
                disabled={loading}
              >
                {loading ? (
                  <span className="animate-spin h-5 w-5 border-2 border-white border-t-transparent rounded-full mr-2"></span>
                ) : null}
                {loading ? 'Analyzing...' : 'Predict Heart Risk'}
              </button>
            </form>
          ) : (
            <div className="text-red-500 bg-red-50 p-4 rounded-lg">
              Could not load model features. Please ensure the backend is running.
            </div>
          )}
        </div>

        <div className="card bg-slate-100 border-none">
          <h2 className="text-xl font-semibold text-slate-700 mb-4">Analysis Result</h2>
          {error && <div className="text-red-500 mb-4 bg-red-50 p-3 rounded">{error}</div>}

          {!result && !loading && !error && (
            <div className="text-slate-500 italic flex items-center justify-center h-48 border-2 border-dashed border-slate-300 rounded-lg">
              Submit patient metrics to see predictions.
            </div>
          )}

          {result && (
            <div className="space-y-4 bg-white p-6 rounded-lg shadow-sm border border-red-100">
              <div>
                <h4 className="text-sm font-semibold text-red-600 uppercase tracking-wide">Predicted Condition</h4>
                <p className="text-2xl font-bold text-slate-800">{result.prediction}</p>
              </div>
              <div className="grid grid-cols-2 gap-4 border-t border-b border-slate-100 py-4">
                <div>
                  <h4 className="text-sm font-medium text-slate-500 mb-1">Risk Level</h4>
                  <span className={`px-3 py-1 rounded-full text-sm font-medium ${result.risk_level === 'Low' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                    {result.risk_level}
                  </span>
                </div>
                {result.probability && (
                  <div>
                    <h4 className="text-sm font-medium text-slate-500 mb-1">Probability</h4>
                    <p className="text-lg font-semibold text-slate-700">{result.probability}</p>
                  </div>
                )}
              </div>
              <div>
                <h4 className="text-sm font-semibold text-slate-700 mb-1">Recommendation</h4>
                <p className="text-slate-600">{result.recommendation}</p>
              </div>
              <div className="mt-4 p-3 bg-red-50 border border-red-100 text-red-800 text-sm rounded-lg italic">
                Note: {result.note}
              </div>
            </div>
          )}
        </div>
      </div>
    </>
  );

  const renderPlaceholder = (title) => (
    <>
      <button
        onClick={() => setActivePrediction(null)}
        className="flex items-center text-slate-500 hover:text-healthcare-600 mb-6 transition"
      >
        <ArrowLeft size={20} className="mr-2" /> Back to Models
      </button>
      <h1 className="text-3xl font-bold text-slate-800 mb-6">{title} Prediction</h1>
      <div className="card text-center p-12">
        <div className="w-20 h-20 bg-slate-100 text-slate-400 rounded-full flex items-center justify-center mx-auto mb-4">
          <ShieldAlert size={40} />
        </div>
        <h2 className="text-2xl font-semibold text-slate-700 mb-2">Coming Soon</h2>
        <p className="text-slate-500 max-w-md mx-auto">
        </p>
      </div>
    </>
  );

  const renderGeneralForm = () => (
    <>
      <button
        onClick={() => { setActivePrediction(null); setResult(null); setError(''); setSelectedGeneralSymptoms([]); }}
        className="flex items-center text-slate-500 hover:text-purple-600 mb-6 transition"
      >
        <ArrowLeft size={20} className="mr-2" /> Back to Models
      </button>
      <h1 className="text-3xl font-bold text-slate-800 mb-6">General Health Diagnosis</h1>

      <div className="grid lg:grid-cols-2 gap-8">
        <div className="card">
          <h2 className="text-xl font-semibold text-slate-700 mb-4">Symptom Selection</h2>

          {symptomsLoading ? (
            <div className="flex justify-center py-8">
              <span className="animate-spin h-8 w-8 border-4 border-purple-500 border-t-transparent rounded-full"></span>
            </div>
          ) : (
            <div className="space-y-4">
              <div className="relative">
                <Search size={20} className="absolute left-3 top-3 text-slate-400" />
                <input
                  type="text"
                  placeholder="Search symptoms..."
                  className="input-field pl-10"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>

              <div className="max-h-[300px] overflow-y-auto border border-slate-200 rounded-lg p-3 bg-slate-50 grid grid-cols-2 gap-2">
                {generalSymptomsList
                  .filter((sym) => sym.toLowerCase().includes(searchTerm.toLowerCase()))
                  .map((sym, idx) => {
                    const isSelected = selectedGeneralSymptoms.includes(sym);
                    const displayName = sym.replace(/_/g, ' ');

                    return (
                      <button
                        key={idx}
                        type="button"
                        onClick={() => toggleSymptom(sym)}
                        className={`text-left px-3 py-2 rounded text-sm transition font-medium border ${isSelected
                            ? 'bg-purple-100 border-purple-300 text-purple-700'
                            : 'bg-white border-slate-200 text-slate-600 hover:border-purple-200 hover:bg-purple-50'
                          }`}
                      >
                        {displayName.charAt(0).toUpperCase() + displayName.slice(1)}
                      </button>
                    );
                  })}
                {generalSymptomsList.filter((sym) => sym.toLowerCase().includes(searchTerm.toLowerCase())).length === 0 && (
                  <div className="col-span-2 text-center text-slate-500 py-4 text-sm">No symptoms found matching your search.</div>
                )}
              </div>

              {selectedGeneralSymptoms.length > 0 && (
                <div className="p-3 bg-purple-50 rounded-lg border border-purple-100">
                  <h4 className="text-sm font-semibold text-purple-700 mb-2">Selected ({selectedGeneralSymptoms.length})</h4>
                  <div className="flex flex-wrap gap-2">
                    {selectedGeneralSymptoms.map((sym, idx) => (
                      <span key={idx} className="inline-flex items-center bg-white px-2 py-1 rounded text-xs font-medium text-purple-600 border border-purple-200">
                        {sym.replace(/_/g, ' ')}
                        <button onClick={() => toggleSymptom(sym)} className="ml-1 text-purple-400 hover:text-purple-600">×</button>
                      </span>
                    ))}
                  </div>
                </div>
              )}

              <button
                onClick={handleGeneralSubmit}
                className="btn-primary bg-purple-600 hover:bg-purple-700 w-full flex justify-center items-center mt-6 shadow-md"
                disabled={loading || selectedGeneralSymptoms.length === 0}
              >
                {loading ? (
                  <span className="animate-spin h-5 w-5 border-2 border-white border-t-transparent rounded-full mr-2"></span>
                ) : null}
                {loading ? 'Analyzing Symptoms...' : 'Get Diagnosis'}
              </button>
            </div>
          )}
        </div>

        <div className="card bg-slate-100 border-none">
          <h2 className="text-xl font-semibold text-slate-700 mb-4">Diagnosis Result</h2>
          {error && <div className="text-red-500 mb-4 bg-red-50 p-3 rounded">{error}</div>}

          {!result && !loading && !error && (
            <div className="text-slate-500 italic flex items-center justify-center h-48 border-2 border-dashed border-slate-300 rounded-lg">
              Select symptoms and get diagnosis to see results.
            </div>
          )}

          {result && (
            <div className="space-y-4 bg-white p-6 rounded-lg shadow-sm border border-purple-100">
              <div>
                <h4 className="text-sm font-semibold text-purple-600 tracking-wide uppercase">Predicted Condition</h4>
                <p className="text-2xl font-bold text-slate-800 capitalize">{result.prediction.replace(/_/g, ' ')}</p>
              </div>
              <div className="grid grid-cols-2 gap-4 border-t border-b border-slate-100 py-4">
                <div>
                  <h4 className="text-sm font-medium text-slate-500 mb-1">Confidence</h4>
                  <p className="text-lg font-semibold text-slate-700">{result.probability}</p>
                </div>
              </div>
              <div>
                <h4 className="text-sm font-semibold text-slate-700 mb-1">Description</h4>
                <p className="text-slate-600 text-sm leading-relaxed">{result.description || result.recommendation}</p>
              </div>
              {result.precautions && result.precautions.length > 0 && (
                <div className="mt-4 p-4 bg-purple-50 rounded-lg border border-purple-100">
                  <h4 className="text-sm font-semibold text-purple-700 mb-2">Precautions</h4>
                  <ul className="list-disc pl-5 space-y-1">
                    {result.precautions.map((p, idx) => (
                      <li key={idx} className="text-sm text-purple-800 capitalize">{p.replace(/_/g, ' ')}</li>
                    ))}
                  </ul>
                </div>
              )}
              {result.note && (
                <div className="mt-4 p-3 bg-blue-50 border border-blue-100 text-blue-800 text-xs rounded-lg italic">
                  Note: {result.note}
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </>
  );

  return (
    <div className="flex flex-1 bg-slate-50 min-h-[calc(100vh-140px)]">
      <Sidebar />
      <div className="flex-1 p-8">
        {!activePrediction && renderSelectionCards()}
        {activePrediction === 'diabetes' && renderDiabetesForm()}
        {activePrediction === 'heart' && renderHeartForm()}
        {activePrediction === 'general' && renderGeneralForm()}
      </div>
    </div>
  );
};

export default DiseasePrediction;
