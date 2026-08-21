import React from 'react';

const BackgroundEffects = () => {
  return (
    <div className="fixed inset-0 w-full h-full pointer-events-none overflow-hidden z-0">
      {/* 1. Ambient Glows */}
      <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] rounded-full bg-blue-500/5 blur-[120px] animate-blob-1"></div>
      <div className="absolute top-[-10%] right-[-10%] w-[50%] h-[50%] rounded-full bg-purple-500/5 blur-[120px] animate-blob-2"></div>
      <div className="absolute bottom-[-10%] left-[25%] w-[50%] h-[50%] rounded-full bg-brand-500/4 blur-[120px] animate-blob-1"></div>

      {/* 2. Thin Technical Grid */}
      <div className="absolute inset-0 opacity-15 bg-transparent" style={{
        backgroundImage: `
          linear-gradient(rgba(148, 163, 184, 0.08) 1px, transparent 1px),
          linear-gradient(90deg, rgba(148, 163, 184, 0.08) 1px, transparent 1px)
        `,
        backgroundSize: '100px 100px'
      }}></div>

      {/* 3. Floating Particles & SVG Network Nodes */}
      <svg className="absolute inset-0 w-full h-full opacity-20" xmlns="http://www.w3.org/2000/svg">
        <defs>
          <linearGradient id="lineGrad" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#0ea5e9" stopOpacity="0.2" />
            <stop offset="100%" stopColor="#7c3aed" stopOpacity="0" />
          </linearGradient>
        </defs>

        {/* Diagonal connection line */}
        <line x1="5%" y1="20%" x2="25%" y2="35%" stroke="url(#lineGrad)" strokeWidth="1.5" />
        <line x1="85%" y1="15%" x2="70%" y2="40%" stroke="url(#lineGrad)" strokeWidth="1" strokeDasharray="4 4" />
        <line x1="15%" y1="75%" x2="35%" y2="90%" stroke="url(#lineGrad)" strokeWidth="1.5" />
        <line x1="80%" y1="80%" x2="90%" y2="60%" stroke="url(#lineGrad)" strokeWidth="1" />

        {/* Small floating node circles */}
        <circle cx="5%" cy="20%" r="3" fill="#0ea5e9" className="animate-pulse" />
        <circle cx="25%" cy="35%" r="4.5" fill="#7c3aed" />
        <circle cx="85%" cy="15%" r="3.5" fill="#06b6d4" />
        <circle cx="70%" cy="40%" r="4" fill="#0ea5e9" className="animate-pulse" />
        <circle cx="15%" cy="75%" r="3" fill="#7c3aed" />
        <circle cx="35%" cy="90%" r="5" fill="#0ea5e9" />
        <circle cx="80%" cy="80%" r="4" fill="#06b6d4" />
        <circle cx="90%" cy="60%" r="3" fill="#7c3aed" className="animate-pulse" />
      </svg>
    </div>
  );
};

export default BackgroundEffects;
