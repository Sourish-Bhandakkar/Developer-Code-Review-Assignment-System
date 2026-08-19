import assert from 'assert';
import { calculateDeveloperScore, findBestReviewers } from '../services/assignmentService.js';

// Setup Mock Data for Testing
const mockDevelopers = [
  {
    id: 'dev-a',
    name: 'Developer A (Java)',
    status: 'Active',
    experience_years: 4,
    availability: 'Available',
    max_workload: 4,
    current_workload: 1,
    expertises: [
      { name: 'Java', skill_level: 3 },
      { name: 'Spring Boot', skill_level: 3 },
      { name: 'PostgreSQL', skill_level: 3 }
    ]
  },
  {
    id: 'dev-b',
    name: 'Developer B (React)',
    status: 'Active',
    experience_years: 5,
    availability: 'Available',
    max_workload: 4,
    current_workload: 0,
    expertises: [
      { name: 'JavaScript', skill_level: 3 },
      { name: 'React', skill_level: 3 },
      { name: 'Node.js', skill_level: 3 }
    ]
  },
  {
    id: 'dev-c',
    name: 'Developer C (Unavailable Java)',
    status: 'Active',
    experience_years: 4,
    availability: 'Unavailable',
    max_workload: 4,
    current_workload: 0,
    expertises: [
      { name: 'Java', skill_level: 3 },
      { name: 'Spring Boot', skill_level: 3 },
      { name: 'PostgreSQL', skill_level: 3 }
    ]
  },
  {
    id: 'dev-d-overloaded',
    name: 'Developer D (Overloaded Java)',
    status: 'Active',
    experience_years: 6,
    availability: 'Available',
    max_workload: 2,
    current_workload: 2, // Maxed out workload
    expertises: [
      { name: 'Java', skill_level: 2 }
    ]
  },
  {
    id: 'dev-e-inactive',
    name: 'Developer E (Inactive Java)',
    status: 'Inactive',
    experience_years: 8,
    availability: 'Available',
    max_workload: 4,
    current_workload: 0,
    expertises: [
      { name: 'Java', skill_level: 3 }
    ]
  }
];

// Test Cases Runner
const tests = {
  // Test 1: Exclude Unavailable Developers
  testExcludeUnavailable() {
    const review = {
      technologies: ['Java', 'Spring Boot', 'PostgreSQL'],
      priority: 'High',
      complexity: 'Medium'
    };
    const result = findBestReviewers(mockDevelopers, review);
    
    // Developer C should be excluded
    const isDevCExcluded = result.excluded.some(d => d.developer.id === 'dev-c');
    assert.strictEqual(isDevCExcluded, true, 'Developer C (Unavailable) must be excluded from assignment');
    
    const isDevCEligible = result.eligible.some(d => d.developer.id === 'dev-c');
    assert.strictEqual(isDevCEligible, false, 'Developer C must not be in eligible list');
  },

  // Test 2: Exclude Overloaded Developers
  testExcludeOverloaded() {
    const review = {
      technologies: ['Java'],
      priority: 'Low',
      complexity: 'Low'
    };
    const result = findBestReviewers(mockDevelopers, review);

    // Developer D has current_workload: 2, max_workload: 2 -> Overloaded!
    const isDevDExcluded = result.excluded.some(d => d.developer.id === 'dev-d-overloaded');
    assert.strictEqual(isDevDExcluded, true, 'Overloaded developer must be excluded');

    const isDevDEligible = result.eligible.some(d => d.developer.id === 'dev-d-overloaded');
    assert.strictEqual(isDevDEligible, false, 'Overloaded developer must not be eligible');
  },

  // Test 3: Exclude Inactive Developers
  testExcludeInactive() {
    const review = {
      technologies: ['Java'],
      priority: 'Low',
      complexity: 'Low'
    };
    const result = findBestReviewers(mockDevelopers, review);
    const isDevEExcluded = result.excluded.some(d => d.developer.id === 'dev-e-inactive');
    assert.strictEqual(isDevEExcluded, true, 'Inactive developer must be excluded');
  },

  // Test 4: Correct Expertise Matching & Exclude Non-matching
  testExpertiseMatching() {
    const review = {
      technologies: ['Java', 'Spring Boot', 'PostgreSQL'],
      priority: 'High',
      complexity: 'Medium'
    };
    const result = findBestReviewers(mockDevelopers, review);

    // Developer B (React/JS) should be excluded due to expertise mismatch
    const isDevBExcluded = result.excluded.some(d => d.developer.id === 'dev-b');
    assert.strictEqual(isDevBExcluded, true, 'Developer B (JavaScript/React) must be excluded for Java review');

    // Developer A (Java) should be eligible
    const isDevAEligible = result.eligible.some(d => d.developer.id === 'dev-a');
    assert.strictEqual(isDevAEligible, true, 'Developer A (Java) must be eligible for Java review');
  },

  // Test 5: Experience Level affects scoring
  testExperienceScoring() {
    const devLowExp = {
      availability: 'Available',
      experience_years: 2, // 20 points
      max_workload: 4,
      current_workload: 0,
      expertises: [{ name: 'Java', skill_level: 3 }]
    };
    const devHighExp = {
      availability: 'Available',
      experience_years: 8, // 80 points
      max_workload: 4,
      current_workload: 0,
      expertises: [{ name: 'Java', skill_level: 3 }]
    };
    const review = { technologies: ['Java'], priority: 'Low', complexity: 'Medium' };

    const scoreLow = calculateDeveloperScore(devLowExp, review);
    const scoreHigh = calculateDeveloperScore(devHighExp, review);

    assert.strictEqual(scoreHigh.experienceScore > scoreLow.experienceScore, true, 'Higher experience must yield higher experience score');
    assert.strictEqual(scoreHigh.finalScore > scoreLow.finalScore, true, 'Higher experience must yield higher final score');
  },

  // Test 6: Workload level affects scoring (preferring lower workload)
  testWorkloadScoring() {
    const devBusy = {
      availability: 'Available',
      experience_years: 5,
      max_workload: 4,
      current_workload: 2, // Workload score = 50
      expertises: [{ name: 'Java', skill_level: 3 }]
    };
    const devFree = {
      availability: 'Available',
      experience_years: 5,
      max_workload: 4,
      current_workload: 0, // Workload score = 100
      expertises: [{ name: 'Java', skill_level: 3 }]
    };
    const review = { technologies: ['Java'], priority: 'Low', complexity: 'Medium' };

    const scoreBusy = calculateDeveloperScore(devBusy, review);
    const scoreFree = calculateDeveloperScore(devFree, review);

    assert.strictEqual(scoreFree.workloadScore > scoreBusy.workloadScore, true, 'Fewer active reviews must yield higher workload score');
    assert.strictEqual(scoreFree.finalScore > scoreBusy.finalScore, true, 'Fewer active reviews must yield higher final score');
  },

  // Test 7: Selection Quality - Verify Highest scoring eligible developer is first
  testHighestScoringSelected() {
    const review = {
      technologies: ['Java', 'Spring Boot', 'PostgreSQL'],
      priority: 'High',
      complexity: 'Medium'
    };
    const result = findBestReviewers(mockDevelopers, review);

    assert.strictEqual(result.eligible.length > 0, true, 'Should have at least one eligible developer');
    assert.strictEqual(result.eligible[0].developer.id, 'dev-a', 'Developer A should be the highest-scoring candidate');
  },

  // Test 8: Empty pool handling (No reviewer available scenario)
  testNoReviewersAvailable() {
    const review = {
      technologies: ['C++'],
      priority: 'Low',
      complexity: 'Low'
    };
    // No mockDeveloper matches C++ (except John Doe who is Busy, but let's test a technology none of them have, e.g. Python - only Sara Connor has Python, but she's not in mockDevelopers list)
    // Wait, let's verify if anyone has Python. No one in mockDevelopers has Python. Let's request 'Python'.
    const reviewPython = {
      technologies: ['Python'],
      priority: 'Low',
      complexity: 'Low'
    };
    const result = findBestReviewers(mockDevelopers, reviewPython);

    assert.strictEqual(result.eligible.length, 0, 'No eligible reviewers should be found for Python');
    assert.strictEqual(result.excluded.length, mockDevelopers.length, 'All developers should be in the excluded list');
    
    // Check exclusion reasons
    result.excluded.forEach(ex => {
      assert.strictEqual(ex.reasons.includes('No matching technology expertise'), true, 'Exclusion reason should state no matching expertise');
    });
  }
};

// Run All Tests
let failed = false;
console.log('--- RUNNING SCORING ENGINE TESTS ---');
for (const [name, fn] of Object.entries(tests)) {
  try {
    fn();
    console.log(`✅ Pass: ${name}`);
  } catch (err) {
    console.error(`❌ Fail: ${name}`);
    console.error(err);
    failed = true;
  }
}
console.log('------------------------------------');

if (failed) {
  process.exit(1);
} else {
  console.log('All tests passed successfully!');
  process.exit(0);
}
