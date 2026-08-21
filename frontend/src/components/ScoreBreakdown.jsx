import React from 'react';
import { CheckCircle2, AlertCircle } from 'lucide-react';

const ScoreBreakdown = ({ scoreDetails }) => {
  if (!scoreDetails) return null;

  const factors = [
    {
      name: 'Expertise Match',
      weight: 40,
      rawScore: scoreDetails.expertise_score !== undefined ? scoreDetails.expertise_score : scoreDetails.breakdown?.expertise || 0,
      description: 'Aligns requested technologies with developer skill levels.'
    },
    {
      name: 'Availability Status',
      weight: 20,
      rawScore: scoreDetails.availability_score !== undefined ? scoreDetails.availability_score : scoreDetails.breakdown?.availability || 0,
      description: 'Favors Available developers over Busy ones.'
    },
    {
      name: 'Workload Balance',
      weight: 20,
      rawScore: scoreDetails.workload_score !== undefined ? scoreDetails.workload_score : scoreDetails.breakdown?.workload || 0,
      description: 'Prefers developers with fewer currently active reviews.'
    },
    {
      name: 'Professional Experience',
      weight: 10,
      rawScore: scoreDetails.experience_score !== undefined ? scoreDetails.experience_score : scoreDetails.breakdown?.experience || 0,
      description: 'Increments points based on years of development experience.'
    },
    {
      name: 'Priority & Deadline Fit',
      weight: 10,
      rawScore: scoreDetails.priority_score !== undefined ? scoreDetails.priority_score : scoreDetails.breakdown?.priority || 0,
      description: 'Channels urgent requests to low-workload, available reviewers.'
    }
  ];

  const finalScore = scoreDetails.score !== undefined ? scoreDetails.score : scoreDetails.finalScore || 0;

  // Generate explanatory explanation
  let explanationText = "";
  if (finalScore >= 80) {
    explanationText = "Highest overall suitability score among available developers with matching skillsets.";
  } else if (finalScore >= 60) {
    explanationText = "Moderate suitability; selected as the best available reviewer despite minor workload or experience tradeoffs.";
  } else {
    explanationText = "Assigned as the sole matching candidate meeting minimum eligibility criteria.";
  }

  return (
    <div className="bg-white rounded-2xl border border-primary-200/80 p-6 shadow-sm space-y-6">
      <div className="flex items-center justify-between border-b border-primary-100 pb-4">
        <div>
          <h3 className="text-sm font-extrabold text-primary-850">Scoring Engine Explanation</h3>
          <p className="text-[10px] text-primary-400 font-bold uppercase tracking-wider mt-0.5">Auto-generated weighted assignment scores</p>
        </div>
        <div className="text-right">
          <div className="text-3xl font-black text-brand-600 leading-none">
            {finalScore} <span className="text-xs font-semibold text-primary-400">/ 100</span>
          </div>
          <span className="text-[9px] uppercase font-extrabold tracking-widest text-emerald-700 bg-emerald-50 border border-emerald-200/50 px-2.5 py-0.5 rounded-full mt-1.5 inline-block">
            Match Score
          </span>
        </div>
      </div>

      <div className="space-y-5">
        {factors.map((factor, index) => {
          const weightedContribution = Math.round((factor.rawScore * factor.weight) / 100);
          
          return (
            <div key={index} className="space-y-2">
              <div className="flex items-center justify-between text-xs">
                <div className="flex items-center gap-2">
                  <span className="font-bold text-primary-750">{factor.name}</span>
                  <span className="text-[9px] text-primary-500 font-bold bg-primary-55 px-1.5 py-0.25 rounded border border-primary-200/40">
                    Weight: {factor.weight}%
                  </span>
                </div>
                <div className="font-mono text-primary-500 text-[10px] font-semibold">
                  Raw: <span className="font-bold text-primary-800">{factor.rawScore}</span> | 
                  Contrib: <span className="font-bold text-brand-600">+{weightedContribution}</span>
                </div>
              </div>
              
              {/* Progress bar */}
              <div className="h-2 w-full bg-primary-100/70 rounded-full overflow-hidden">
                <div 
                  className={`h-full rounded-full transition-all duration-500 ${
                    factor.rawScore >= 80 ? 'bg-emerald-500' : factor.rawScore >= 50 ? 'bg-brand-500' : 'bg-amber-500'
                  }`}
                  style={{ width: `${factor.rawScore}%` }}
                ></div>
              </div>
              <p className="text-[10px] text-primary-400 font-medium leading-relaxed">{factor.description}</p>
            </div>
          );
        })}
      </div>

      {/* Decision Summary Info Box */}
      <div className="bg-brand-50/40 border border-brand-100/80 rounded-xl p-4 flex items-start gap-3">
        <CheckCircle2 className="h-5 w-5 text-brand-600 mt-0.5 flex-shrink-0" />
        <div>
          <h5 className="text-[10px] font-extrabold text-brand-900 uppercase tracking-widest">Assignment Decision</h5>
          <p className="text-xs text-brand-850 mt-1 font-semibold leading-relaxed">
            {explanationText}
          </p>
        </div>
      </div>
    </div>
  );
};

export default ScoreBreakdown;
