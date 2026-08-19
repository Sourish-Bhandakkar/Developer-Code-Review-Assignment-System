import { weights, availabilityScores } from '../config/weights.js';

/**
 * Calculates the suitability score for a developer against a review request.
 * 
 * @param {Object} developer - Developer details with expertise list
 * @param {Object} review - Pull request details (priority, complexity, technologies)
 * @returns {Object} Score breakdown and final score
 */
export function calculateDeveloperScore(developer, review) {
  const { expertise, availability, workload, experience, priority: priorityWeight } = weights;

  // 1. Expertise Match Score (40%)
  const requestedTechs = review.technologies.map(t => t.toLowerCase().trim());
  const devExpertiseMap = new Map();
  
  if (developer.expertises && Array.isArray(developer.expertises)) {
    developer.expertises.forEach(exp => {
      if (exp && exp.name) {
        devExpertiseMap.set(exp.name.toLowerCase().trim(), exp.skill_level || 2);
      }
    });
  }

  let matchCount = 0;
  let totalSkillOfMatches = 0;

  requestedTechs.forEach(tech => {
    if (devExpertiseMap.has(tech)) {
      matchCount++;
      totalSkillOfMatches += devExpertiseMap.get(tech);
    }
  });

  let expertiseScore = 0;
  if (requestedTechs.length > 0) {
    const coverageFraction = matchCount / requestedTechs.length;
    const avgSkillLevel = matchCount > 0 ? (totalSkillOfMatches / matchCount) : 0;
    // 60% for match coverage, 40% for the average skill level (max level is 3)
    expertiseScore = Math.round((coverageFraction * 60) + ((avgSkillLevel / 3) * 40));
  }

  // 2. Availability Score (20%)
  const availabilityScore = availabilityScores[developer.availability] || 0;

  // 3. Workload Score (20%)
  const maxW = developer.max_workload || 3;
  const currW = developer.current_workload || 0;
  const workloadScore = Math.max(0, Math.round((1 - (currW / maxW)) * 100));

  // 4. Experience Score (10%)
  const expYears = developer.experience_years || 0;
  const experienceScore = Math.min(100, expYears * 10);

  // 5. Priority/Deadline Suitability Score (10%)
  let priorityScore = 100;
  if (review.priority === 'High' || review.priority === 'Critical') {
    // For urgent reviews, prefer developers who are available and have lower workloads
    priorityScore = Math.round((availabilityScore * 0.6) + (workloadScore * 0.4));
  }

  // Calculate Weighted Final Score
  const finalScore = Math.round(
    (expertiseScore * expertise) +
    (availabilityScore * availability) +
    (workloadScore * workload) +
    (experienceScore * experience) +
    (priorityScore * priorityWeight)
  );

  return {
    expertiseScore,
    availabilityScore,
    workloadScore,
    experienceScore,
    priorityScore,
    finalScore
  };
}

/**
 * Evaluates all developers and returns eligible developers sorted by suitability score.
 * 
 * @param {Array} developers - List of developers with user and expertise information
 * @param {Object} review - The review request data
 * @returns {Object} List of eligible developers with scores, and excluded developers with reasons
 */
export function findBestReviewers(developers, review) {
  const eligible = [];
  const excluded = [];

  const requestedTechs = review.technologies.map(t => t.toLowerCase().trim());

  developers.forEach(dev => {
    // Collect reasons for exclusion if they fail any constraint
    const reasons = [];

    // Rule 1: Account must be Active
    if (dev.status !== 'Active') {
      reasons.push('Account is Inactive');
    }

    // Rule 2: Availability cannot be Unavailable
    if (dev.availability === 'Unavailable') {
      reasons.push('Availability is set to Unavailable');
    }

    // Rule 3: Current workload must be strictly less than maximum workload
    if (dev.current_workload >= dev.max_workload) {
      reasons.push(`Workload limit reached (${dev.current_workload}/${dev.max_workload} reviews)`);
    }

    // Rule 4: Must have at least one matching expertise
    const devTechs = (dev.expertises || []).map(exp => exp.name.toLowerCase().trim());
    const hasExpertiseMatch = requestedTechs.some(tech => devTechs.includes(tech));
    if (!hasExpertiseMatch) {
      reasons.push('No matching technology expertise');
    }

    if (reasons.length === 0) {
      const scores = calculateDeveloperScore(dev, review);
      eligible.push({
        developer: {
          id: dev.id,
          name: dev.name,
          email: dev.email,
          experience_years: dev.experience_years,
          availability: dev.availability,
          max_workload: dev.max_workload,
          current_workload: dev.current_workload,
          expertises: dev.expertises
        },
        ...scores
      });
    } else {
      excluded.push({
        developer: {
          id: dev.id,
          name: dev.name,
          email: dev.email
        },
        reasons
      });
    }
  });

  // Sort eligible reviewers by final score descending
  eligible.sort((a, b) => b.finalScore - a.finalScore);

  return {
    eligible,
    excluded
  };
}
