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
    <div className="bg-white rounded-xl border border-primary-200 p-6 shadow-sm space-y-6">
      <div className="flex items-center justify-between border-b border-primary-100 pb-4">
        <div>
          <h3 className="text-lg font-bold text-primary-800">Scoring Engine Explanation</h3>
          <p className="text-xs text-primary-400 font-medium">Auto-generated weighted assignment scores</p>
        </div>
        <div className="text-right">
          <div className="text-3xl font-extrabold text-brand-600 leading-none">
            {finalScore} <span className="text-sm font-semibold text-primary-400">/ 100</span>
          </div>
          <span className="text-[10px] uppercase font-bold tracking-wider text-green-600 bg-green-50 px-2 py-0.5 rounded-full mt-1 inline-block">
            Match Score
          </span>
        </div>
      </div>

      <div className="space-y-4">
        {factors.map((factor, index) => {
          const weightedContribution = Math.round((factor.rawScore * factor.weight) / 100);
          
          return (
            <div key={index} className="space-y-1.5">
              <div className="flex items-center justify-between text-sm">
                <div className="flex items-center gap-2">
                  <span className="font-semibold text-primary-700">{factor.name}</span>
                  <span className="text-[10px] text-primary-400 font-bold bg-primary-100 px-1.5 py-0.5 rounded">
                    Weight: {factor.weight}%
                  </span>
                </div>
                <div className="font-mono text-primary-600">
                  Raw: <span className="font-bold text-primary-800">{factor.rawScore}</span> | 
                  Contrib: <span className="font-bold text-brand-600">+{weightedContribution}</span>
                </div>
              </div>
              
              {/* Progress bar */}
              <div className="h-2 w-full bg-primary-100 rounded-full overflow-hidden">
                <div 
                  className={`h-full rounded-full transition-all duration-300 ${
                    factor.rawScore >= 80 ? 'bg-green-500' : factor.rawScore >= 50 ? 'bg-brand-500' : 'bg-amber-500'
                  }`}
                  style={{ width: `${factor.rawScore}%` }}
                ></div>
              </div>
              <p className="text-[11px] text-primary-400">{factor.description}</p>
            </div>
          );
        })}
      </div>

      {/* Decision Summary Info Box */}
      <div className="bg-brand-50/50 border border-brand-100 rounded-lg p-4 flex items-start gap-3">
        <CheckCircle2 className="h-5 w-5 text-brand-600 mt-0.5 flex-shrink-0" />
        <div>
          <h5 className="text-xs font-bold text-brand-900 uppercase tracking-wider">Assignment Decision</h5>
          <p className="text-xs text-brand-800 mt-1 font-medium leading-relaxed">
            {explanationText}
          </p>
        </div>
      </div>
    </div>
  );
};

export default ScoreBreakdown;
