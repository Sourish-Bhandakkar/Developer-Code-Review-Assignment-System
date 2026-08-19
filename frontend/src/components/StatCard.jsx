import React from 'react';

const StatCard = ({ title, value, icon: Icon, description, color = 'brand' }) => {
  const colorMaps = {
    brand: {
      bg: 'bg-brand-50',
      text: 'text-brand-600',
      border: 'border-brand-100',
    },
    green: {
      bg: 'bg-green-50',
      text: 'text-green-600',
      border: 'border-green-100',
    },
    amber: {
      bg: 'bg-amber-50',
      text: 'text-amber-600',
      border: 'border-amber-100',
    },
    red: {
      bg: 'bg-red-50',
      text: 'text-red-600',
      border: 'border-red-100',
    },
    purple: {
      bg: 'bg-purple-50',
      text: 'text-purple-600',
      border: 'border-purple-100',
    },
    slate: {
      bg: 'bg-slate-50',
      text: 'text-slate-600',
      border: 'border-slate-100',
    }
  };

  const scheme = colorMaps[color] || colorMaps.brand;

  return (
    <div className="bg-white rounded-xl border border-primary-200 p-6 flex items-start justify-between shadow-sm hover:shadow-md transition-shadow duration-200">
      <div className="space-y-2">
        <span className="text-xs font-semibold text-primary-500 uppercase tracking-wider">{title}</span>
        <h3 className="text-3xl font-bold text-primary-800 leading-none">{value}</h3>
        {description && <p className="text-xs text-primary-400 font-medium">{description}</p>}
      </div>
      <div className={`p-3 rounded-lg ${scheme.bg} ${scheme.text} border ${scheme.border}`}>
        {Icon && <Icon className="h-6 w-6 stroke-[2]" />}
      </div>
    </div>
  );
};

export default StatCard;
