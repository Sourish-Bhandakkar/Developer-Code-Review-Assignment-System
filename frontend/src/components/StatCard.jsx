import React from 'react';

const StatCard = ({ title, value, icon: Icon, description, color = 'brand' }) => {
  const colorMaps = {
    brand: {
      bg: 'bg-brand-500/10',
      text: 'text-brand-400',
      border: 'border-brand-500/20',
      hoverBorder: 'hover:border-brand-500/40 shadow-[0_0_15px_rgba(14,165,233,0.02)]'
    },
    green: {
      bg: 'bg-emerald-500/10',
      text: 'text-emerald-400',
      border: 'border-emerald-500/20',
      hoverBorder: 'hover:border-emerald-500/40 shadow-[0_0_15px_rgba(34,197,94,0.02)]'
    },
    amber: {
      bg: 'bg-amber-500/10',
      text: 'text-amber-450',
      border: 'border-amber-500/20',
      hoverBorder: 'hover:border-amber-500/40 shadow-[0_0_15px_rgba(245,158,11,0.02)]'
    },
    red: {
      bg: 'bg-red-500/10',
      text: 'text-red-400',
      border: 'border-red-500/20',
      hoverBorder: 'hover:border-red-500/40 shadow-[0_0_15px_rgba(239,68,68,0.02)]'
    },
    purple: {
      bg: 'bg-purple-500/10',
      text: 'text-purple-400',
      border: 'border-purple-500/20',
      hoverBorder: 'hover:border-purple-500/40 shadow-[0_0_15px_rgba(124,58,237,0.02)]'
    },
    slate: {
      bg: 'bg-white/5',
      text: 'text-primary-300',
      border: 'border-white/10',
      hoverBorder: 'hover:border-white/20'
    }
  };

  const scheme = colorMaps[color] || colorMaps.brand;

  return (
    <div className={`bg-surface-200/90 border border-glass backdrop-blur-md rounded-2xl p-6 flex items-start justify-between shadow-lg transition-all duration-200 ${scheme.hoverBorder} hover:-translate-y-0.5`}>
      <div className="space-y-2">
        <span className="text-[10px] font-black text-primary-400 uppercase tracking-widest block">{title}</span>
        <h3 className="text-3xl font-black text-white leading-none">{value}</h3>
        {description && <p className="text-[11px] text-primary-400 font-semibold mt-1 block">{description}</p>}
      </div>
      <div className={`p-3 rounded-xl ${scheme.bg} ${scheme.text} border ${scheme.border} flex-shrink-0 transition-transform duration-250 hover:scale-105`}>
        {Icon && <Icon className="h-5 w-5 stroke-[2.25]" />}
      </div>
    </div>
  );
};

export default StatCard;
