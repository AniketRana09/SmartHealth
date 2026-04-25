import React from 'react';
import { Activity } from 'lucide-react';

const About = () => {
  return (
    <div className="bg-slate-50 min-h-screen py-16 lg:py-24">
      <div className="container mx-auto px-6 max-w-7xl">
        <div className="grid lg:grid-cols-2 gap-16 items-center">
          
          {/* Left side: Content */}
          <div className="space-y-8">
            <h1 className="text-4xl lg:text-5xl font-extrabold text-slate-800 tracking-tight leading-snug">
              Pioneering the <span className="text-transparent bg-clip-text bg-gradient-to-r from-healthcare-500 to-healthcare-700">Future of Care</span>
            </h1>
            <p className="text-lg text-slate-600 leading-relaxed">
              SmartHealth is an innovative platform conceptualized to bridge the gap between people and early health intervention. 
              By combining beautiful, user-friendly interfaces with advanced AI-ready API structures, this system sets the foundation for a predictive, seamless healthcare experience.
            </p>
            
            <div className="bg-white p-8 rounded-2xl shadow-sm border border-slate-100 mt-6 relative overflow-hidden group">
              <div className="absolute top-0 left-0 w-1.5 h-full bg-healthcare-500 rounded-l-2xl transition-all duration-300 group-hover:w-full group-hover:opacity-10"></div>
              <h2 className="text-2xl font-bold text-slate-800 mb-3 flex items-center gap-3">
                <Activity className="text-healthcare-600" />
                Our Mission
              </h2>
              <p className="text-slate-600 leading-relaxed relative z-10">
                To provide you with a comprehensive view of your health trajectory by tracking vitals, analyzing symptoms in real-time, 
                and offering a secure foundation for mock-diagnostics and risk assessments.
              </p>
            </div>

            <div className="bg-blue-50/50 rounded-2xl p-6 border border-blue-100 flex gap-4 mt-8">
              <div className="w-1 bg-blue-500 rounded-full h-auto"></div>
              <div>
                <h4 className="font-semibold text-blue-900 mb-1">Architecture Notice</h4>
                <p className="text-sm text-blue-800/80 leading-relaxed">
                  Currently, the prediction and risk analysis features run on mock data. All responses are placeholder JSON formats designed to demonstrate the intelligent architectural flow.
                </p>
              </div>
            </div>
          </div>

          {/* Right side: Image showcase */}
          <div className="relative group perspective">
            <div className="absolute -inset-2 bg-gradient-to-r from-healthcare-400 to-healthcare-600 rounded-3xl blur opacity-20 group-hover:opacity-40 transition duration-1000"></div>
            <img 
              src="/images/about_us_hero_1775645025828.png" 
              alt="Advanced Healthcare Facility" 
              className="relative rounded-3xl shadow-2xl w-full object-cover aspect-[4/5] lg:aspect-square transform transition duration-500 group-hover:scale-[1.02]"
            />
          </div>

        </div>
      </div>
    </div>
  );
};

export default About;
