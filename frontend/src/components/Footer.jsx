import React from 'react';

const Footer = () => {
  return (
    <footer className="bg-slate-900 text-slate-300 py-8 text-center">
      <div className="container mx-auto px-6">
        <p className="mb-2">&copy; {new Date().getFullYear()} Smart Healthcare System. All rights reserved.</p>
        <p className="text-sm">This is a demo application. ML features are placeholders.</p>
      </div>
    </footer>
  );
};

export default Footer;
