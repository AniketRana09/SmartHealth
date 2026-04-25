import React, { useState, useRef, useEffect } from 'react';
import Sidebar from '../components/Sidebar';
import { Send, User, Bot, Activity } from 'lucide-react';
import axios from 'axios';

const Chatbot = () => {
  const [messages, setMessages] = useState([
    { text: "Hello! I am your AI Health Assistant placeholder. How can I help you today?", isBot: true }
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSend = async (e) => {
    e.preventDefault();
    if (!input.trim()) return;

    const userMsg = input.trim();
    setMessages(prev => [...prev, { text: userMsg, isBot: false }]);
    setInput('');
    setLoading(true);

    try {
      const token = localStorage.getItem('token');
      const res = await axios.post(
        'http://localhost:5000/api/chatbot',
        { message: userMsg },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      
      setMessages(prev => [...prev, { text: res.data.data.reply, isBot: true }]);
    } catch (error) {
      setMessages(prev => [...prev, { text: "Sorry, I am facing connectivity issues at the moment.", isBot: true }]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-1 bg-slate-50 min-h-[calc(100vh-140px)]">
      <Sidebar />
      <div className="flex-1 p-4 md:p-8 flex flex-col items-center">
        <h1 className="text-3xl font-bold text-slate-800 mb-6 self-start w-full max-w-4xl">Medical Chatbot</h1>
        
        <div className="card w-full max-w-4xl flex flex-col h-[600px] p-0 overflow-hidden border border-slate-200">
          {/* Header */}
          <div className="bg-healthcare-600 text-white p-4 flex items-center space-x-3">
            <Activity className="h-6 w-6" />
            <span className="font-semibold text-lg">SmartHealth AI Placeholder</span>
            <span className="text-xs bg-healthcare-500 border border-healthcare-400 font-medium px-2 py-1 rounded ml-auto tracking-wide">MOCK MODE</span>
          </div>

          {/* Chat Area */}
          <div className="flex-1 overflow-y-auto chat-scroll p-4 bg-slate-100/50 space-y-4">
            {messages.map((msg, index) => (
              <div key={index} className={`flex ${msg.isBot ? 'justify-start' : 'justify-end'}`}>
                <div className={`flex max-w-[80%] ${msg.isBot ? 'flex-row' : 'flex-row-reverse'}`}>
                  <div className={`flex-shrink-0 h-8 w-8 rounded-full flex items-center justify-center ${msg.isBot ? 'bg-healthcare-100 mr-2 border border-healthcare-200' : 'bg-slate-200 ml-2 border border-slate-300'}`}>
                    {msg.isBot ? <Bot size={18} className="text-healthcare-600" /> : <User size={18} className="text-slate-600" />}
                  </div>
                  <div className={`px-4 py-2 rounded-2xl shadow-sm leading-relaxed ${
                    msg.isBot 
                      ? 'bg-white border border-slate-200 text-slate-700 rounded-tl-none' 
                      : 'bg-healthcare-600 text-white rounded-tr-none shadow-md'
                  }`}>
                    {msg.text}
                  </div>
                </div>
              </div>
            ))}
            {loading && (
              <div className="flex justify-start">
                <div className="bg-white border border-slate-200 rounded-2xl rounded-tl-none px-4 py-3 shadow-sm flex items-center space-x-2">
                  <div className="w-2 h-2 bg-slate-400 rounded-full animate-pulse"></div>
                  <div className="w-2 h-2 bg-slate-400 rounded-full animate-pulse delay-75"></div>
                  <div className="w-2 h-2 bg-slate-400 rounded-full animate-pulse delay-150"></div>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Call to action notice */}
          <div className="bg-blue-50 text-blue-700 text-xs px-4 py-2 border-t border-b border-blue-100 flex justify-center uppercase tracking-wide font-semibold">
            // TODO: Replace this Logic with Python AI Model
          </div>

          {/* Input Area */}
          <div className="p-4 bg-white border-t border-slate-100">
            <form onSubmit={handleSend} className="flex space-x-2">
              <input 
                type="text" 
                className="input-field flex-1"
                placeholder="Type your message... (e.g., I have a headache)"
                value={input}
                onChange={(e) => setInput(e.target.value)}
              />
              <button 
                type="submit" 
                className="btn-primary rounded-lg px-6 flex items-center justify-center hover:bg-healthcare-700"
                disabled={loading}
              >
                <Send size={18} />
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Chatbot;
