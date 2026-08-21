import React from 'react';

const StatCard = ({ title, value, icon: Icon, description, color = 'brand' }) => {
  const colorMaps = {
    brand: {
      bg: 'bg-brand-50/60',
      text: 'text-brand-600',
      border: 'border-brand-100',
      hoverBorder: 'hover:border-brand-300'
    },
    green: {
      bg: 'bg-emerald-50/60',
      text: 'text-emerald-650',
      border: 'border-emerald-100',
      hoverBorder: 'hover:border-emerald-300'
    },
    amber: {
      bg: 'bg-amber-50/60',
      text: 'text-amber-600',
      border: 'border-amber-100',
      hoverBorder: 'hover:border-amber-300'
    },
    red: {
      bg: 'bg-red-50/60',
      text: 'text-red-600',
      border: 'border-red-100',
      hoverBorder: 'hover:border-red-300'
    },
    purple: {
      bg: 'bg-purple-50/60',
      text: 'text-purple-600',
      border: 'border-purple-100',
      hoverBorder: 'hover:border-purple-300'
    },
    slate: {
      bg: 'bg-slate-50/60',
      text: 'text-slate-600',
      border: 'border-slate-150',
      hoverBorder: 'hover:border-slate-350'
    }
  };

  const scheme = colorMaps[color] || colorMaps.brand;

  return (
    <div className={`bg-white rounded-2xl border border-primary-200/80 p-6 flex items-start justify-between shadow-sm hover:shadow-md transition-all duration-200 ${scheme.hoverBorder}`}>
      <div className="space-y-2">
        <span className="text-[10px] font-extrabold text-primary-400 uppercase tracking-widest block">{title}</span>
        <h3 className="text-3xl font-extrabold text-primary-900 leading-none">{value}</h3>
        {description && <p className="text-[11px] text-primary-405 font-semibold mt-1 block">{description}</p>}
      </div>
      <div className={`p-3 rounded-xl ${scheme.bg} ${scheme.text} border ${scheme.border} flex-shrink-0 transition-transform duration-200 hover:scale-105`}>
        {Icon && <Icon className="h-5 w-5 stroke-[2.25]" />}
      </div>
    </div>
  );
};

export default StatCard;
