import React from 'react';
import { Users, Briefcase, FileText } from 'lucide-react';

const Loader = ({ text = "Loading..." }) => {
  return (
    <div className="d-flex flex-column justify-content-center align-items-center w-100 h-100" style={{ minHeight: '50vh' }}>
      <div className="loader-icon-container d-flex gap-4 mb-4">
        <div className="loader-icon-wrapper" style={{ animationDelay: '0s' }}>
          <Users size={36} className="text-primary" />
        </div>
        <div className="loader-icon-wrapper" style={{ animationDelay: '0.2s' }}>
          <Briefcase size={36} className="text-primary" />
        </div>
        <div className="loader-icon-wrapper" style={{ animationDelay: '0.4s' }}>
          <FileText size={36} className="text-primary" />
        </div>
      </div>
      <p className="fw-bold loader-text" style={{ letterSpacing: '1px', fontSize: '15px', color: '#4f46e5' }}>{text}</p>
    </div>
  );
};

export default Loader;
