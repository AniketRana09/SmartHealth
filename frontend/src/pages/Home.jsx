import React, { useContext } from 'react';
import { Link } from 'react-router-dom';
import { Shield, Brain, MessageSquare } from 'lucide-react';
import { AuthContext } from '../context/AuthContext';

const Home = () => {
  const { user } = useContext(AuthContext);
  return (
    <div className="relative flex flex-col items-center justify-center min-h-[90vh] bg-slate-50 text-center px-4 overflow-hidden pt-20 pb-24">
      {/* Subtle Background Gradients */}
      <div className="absolute top-[-10%] left-[-10%] w-96 h-96 bg-healthcare-200/40 rounded-full mix-blend-multiply blur-3xl opacity-70"></div>
      <div className="absolute bottom-[-10%] right-[-10%] w-[40rem] h-[40rem] bg-indigo-100/50 rounded-full mix-blend-multiply blur-3xl opacity-60"></div>

      <div className="relative z-10 w-full flex flex-col items-center">
        <h1 className="text-6xl md:text-7xl lg:text-8xl font-extrabold text-slate-800 mb-8 tracking-tighter drop-shadow-sm">
          Future of <span className="text-transparent bg-clip-text bg-gradient-to-r from-healthcare-500 via-blue-500 to-indigo-600">Healthcare</span>
        </h1>
        <p className="text-xl md:text-2xl text-slate-600 mb-12 max-w-3xl leading-relaxed font-light">
          Empowering early risk detection and accurate disease prediction with intelligent mock models and conversational chatbots.
        </p>

        <div className="flex flex-col sm:flex-row gap-5 mb-24 w-full sm:w-auto">
          <Link to={user ? "/dashboard" : "/register"} className="bg-healthcare-600 hover:bg-healthcare-700 text-white font-semibold text-lg px-10 py-4 rounded-full shadow-[0_8px_30px_rgb(20,184,166,0.3)] transition-all hover:-translate-y-1 hover:shadow-[0_8px_40px_rgb(20,184,166,0.5)]">
            {user ? "Go to Dashboard" : "Explore Platform"}
          </Link>
          <Link to="/about" className="bg-white hover:bg-slate-50 text-slate-700 border border-slate-200 font-semibold text-lg px-10 py-4 rounded-full shadow-sm transition-all hover:shadow-md hover:-translate-y-0.5">
            Learn More
          </Link>
        </div>

        <div className="grid md:grid-cols-3 gap-8 max-w-6xl w-full">
          <div className="bg-white/80 backdrop-blur-xl text-center p-10 rounded-3xl border border-slate-100 shadow-lg hover:shadow-2xl hover:shadow-healthcare-200/50 hover:-translate-y-2 transform transition duration-500 group">
            <div className="bg-gradient-to-br from-healthcare-50 to-blue-50 w-20 h-20 rounded-2xl flex items-center justify-center mx-auto mb-6 group-hover:scale-110 transition-transform duration-300 shadow-sm border border-healthcare-100">
              <Shield className="text-healthcare-600" size={36} />
            </div>
            <h3 className="text-2xl font-bold mb-4 text-slate-800">Early Risk Detection</h3>
            <p className="text-slate-600 leading-relaxed font-medium">Analyze vital signs and medical history to identify potential health risks early.</p>
          </div>
          <div className="bg-white/80 backdrop-blur-xl text-center p-10 rounded-3xl border border-slate-100 shadow-lg hover:shadow-2xl hover:shadow-blue-200/50 hover:-translate-y-2 transform transition duration-500 group">
            <div className="bg-gradient-to-br from-blue-50 to-indigo-50 w-20 h-20 rounded-2xl flex items-center justify-center mx-auto mb-6 group-hover:scale-110 transition-transform duration-300 shadow-sm border border-blue-100">
              <Brain className="text-blue-600" size={36} />
            </div>
            <h3 className="text-2xl font-bold mb-4 text-slate-800">Disease Prediction</h3>
            <p className="text-slate-600 leading-relaxed font-medium">Provide symptoms and get intelligent mock predictions for potential conditions.</p>
          </div>
          <div className="bg-white/80 backdrop-blur-xl text-center p-10 rounded-3xl border border-slate-100 shadow-lg hover:shadow-2xl hover:shadow-indigo-200/50 hover:-translate-y-2 transform transition duration-500 group">
            <div className="bg-gradient-to-br from-indigo-50 to-purple-50 w-20 h-20 rounded-2xl flex items-center justify-center mx-auto mb-6 group-hover:scale-110 transition-transform duration-300 shadow-sm border border-indigo-100">
              <MessageSquare className="text-indigo-600" size={36} />
            </div>
            <h3 className="text-2xl font-bold mb-4 text-slate-800">AI Chatbot</h3>
            <p className="text-slate-600 leading-relaxed font-medium">Conversational interface designed to answer preliminary health queries instantly.</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Home;
