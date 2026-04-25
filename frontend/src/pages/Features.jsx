import React from 'react';
import { Activity, Stethoscope, HeartPulse } from 'lucide-react';

const Features = () => {
  return (
    <div className="bg-slate-50 pb-24">
      {/* Hero Header Section */}
      <div className="relative overflow-hidden bg-slate-900 text-white py-24 mb-16 px-6">
        <img 
          src="/images/features_dashboard_1775645042364.png" 
          alt="Medical AI Dashboard" 
          className="absolute inset-0 w-full h-full object-cover opacity-20 mix-blend-overlay"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-slate-900 via-slate-900/60 to-transparent"></div>
        <div className="container relative z-10 mx-auto max-w-5xl text-center flex flex-col items-center">
          <span className="inline-block py-1 px-3 rounded-full text-xs font-semibold uppercase tracking-wider text-healthcare-200 bg-healthcare-900/50 border border-healthcare-500/30 mb-6 backdrop-blur-md">
            Platform Capabilities
          </span>
          <h1 className="text-5xl md:text-6xl font-bold mb-6 tracking-tight text-white drop-shadow-md">
            Intelligent Health <span className="text-transparent bg-clip-text bg-gradient-to-r from-healthcare-300 to-healthcare-500">Features</span>
          </h1>
          <p className="text-lg md:text-xl text-slate-300 max-w-2xl text-center leading-relaxed font-light">
            Explore the mock architectural capabilities of our platform, designed from the ground up to integrate deeply with cutting-edge medical prediction models.
          </p>
        </div>
      </div>

      <div className="container mx-auto px-6 max-w-6xl">
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          
          <div className="bg-white rounded-3xl p-8 shadow-sm border border-slate-100 hover:shadow-xl hover:-translate-y-1 transition duration-300 group">
            <div className="w-16 h-16 bg-gradient-to-br from-healthcare-50 to-blue-50 rounded-2xl flex items-center justify-center mb-6 border border-healthcare-100 group-hover:scale-110 transition-transform">
              <Stethoscope size={32} className="text-healthcare-600" />
            </div>
            <h3 className="text-xl font-bold text-slate-800 mb-3">Symptom Prediction</h3>
            <p className="text-slate-600 leading-relaxed text-sm">
              Input current symptoms into an intuitive form. Receive structured mock responses representing possible conditions, probability percentages, and medical recommendations.
            </p>
          </div>

          <div className="bg-white rounded-3xl p-8 shadow-sm border border-slate-100 hover:shadow-xl hover:-translate-y-1 transition duration-300 group">
            <div className="w-16 h-16 bg-gradient-to-br from-healthcare-50 to-blue-50 rounded-2xl flex items-center justify-center mb-6 border border-healthcare-100 group-hover:scale-110 transition-transform">
              <HeartPulse size={32} className="text-healthcare-600" />
            </div>
            <h3 className="text-xl font-bold text-slate-800 mb-3">Risk Analysis</h3>
            <p className="text-slate-600 leading-relaxed text-sm">
              Collect metrics like age, BMI, and vitals. The platform calculates an overall risk level score, visualizing the necessity of preventative health actions.
            </p>
          </div>

          <div className="bg-white rounded-3xl p-8 shadow-sm border border-slate-100 hover:shadow-xl hover:-translate-y-1 transition duration-300 group">
            <div className="w-16 h-16 bg-gradient-to-br from-healthcare-50 to-blue-50 rounded-2xl flex items-center justify-center mb-6 border border-healthcare-100 group-hover:scale-110 transition-transform">
              <Activity size={32} className="text-healthcare-600" />
            </div>
            <h3 className="text-xl font-bold text-slate-800 mb-3">Interactive Chatbot</h3>
            <p className="text-slate-600 leading-relaxed text-sm">
              A conversational chat interface where users describe issues naturally. Architecturally ready to hook into expansive NLP health models via REST API.
            </p>
          </div>


        </div>
      </div>
    </div>
  );
};

export default Features;
