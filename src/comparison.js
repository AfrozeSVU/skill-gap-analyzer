export function compareSkillSets(userSkills, marketSkills) {
  const comparison = {
    match: 0,
    gaps: 0,
    surplus: 0,
    matchPercentage: 0,
    details: {
      matched: [],
      missing: [],
      surplus: []
    }
  };

  // Normalize for comparison
  const userNormalized = userSkills.map(s => s.toLowerCase().trim());
  const marketNormalized = marketSkills.map(s => s.toLowerCase().trim());

  // Find matches
  userNormalized.forEach(skill => {
    if (marketNormalized.some(m => m.includes(skill) || skill.includes(m))) {
      comparison.match++;
      comparison.details.matched.push(skill);
    } else {
      comparison.details.surplus.push(skill);
      comparison.surplus++;
    }
  });

  // Find gaps
  marketNormalized.forEach(skill => {
    if (!userNormalized.some(u => u.includes(skill) || skill.includes(u))) {
      comparison.gaps++;
      comparison.details.missing.push(skill);
    }
  });

  comparison.matchPercentage = Math.round(
    (comparison.match / marketNormalized.length) * 100
  );

  return comparison;
}

export function benchmarkProfile(userSkills, targetRole, marketData) {
  const benchmark = {
    role: targetRole,
    userSkillCount: userSkills.length,
    marketAverage: marketData.avgSkillCount || 12,
    percentile: 0,
    assessment: '',
    recommendations: []
  };

  const skillRatio = userSkills.length / benchmark.marketAverage;

  if (skillRatio >= 1.2) {
    benchmark.percentile = 75;
    benchmark.assessment = 'Above average — strong foundation';
    benchmark.recommendations.push('Focus on depth over breadth');
    benchmark.recommendations.push('Specialize in 2-3 core areas');
  } else if (skillRatio >= 0.8) {
    benchmark.percentile = 50;
    benchmark.assessment = 'Average — competitive profile';
    benchmark.recommendations.push('Add 2-3 high-demand skills');
    benchmark.recommendations.push('Build projects to demonstrate skills');
  } else {
    benchmark.percentile = 25;
    benchmark.assessment = 'Below average — needs development';
    benchmark.recommendations.push('Prioritize learning foundational skills');
    benchmark.recommendations.push('Focus on top 5 gaps first');
  }

  return benchmark;
}

export function getSkillClusters(skills) {
  const clusters = {
    backend: ['fastapi', 'flask', 'django', 'nodejs', 'express', 'spring'],
    frontend: ['react', 'vue', 'angular', 'svelte', 'nextjs'],
    data: ['pandas', 'numpy', 'sql', 'postgresql', 'mongodb'],
    ml: ['pytorch', 'tensorflow', 'scikit-learn', 'keras', 'xgboost'],
    devops: ['docker', 'kubernetes', 'aws', 'gcp', 'azure', 'terraform'],
    languages: ['python', 'javascript', 'java', 'go', 'rust', 'c++'],
    tools: ['git', 'linux', 'docker', 'jupyter', 'vscode']
  };

  const userClusters = {};
  const normalized = skills.map(s => s.toLowerCase());

  Object.entries(clusters).forEach(([cluster, items]) => {
    const count = normalized.filter(skill =>
      items.some(item => skill.includes(item) || item.includes(skill))
    ).length;
    if (count > 0) {
      userClusters[cluster] = count;
    }
  });

  return userClusters;
}

export function identifyStrengths(skills) {
  const clusters = getSkillClusters(skills);
  const strengths = Object.entries(clusters)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 3)
    .map(([cluster, count]) => ({
      area: cluster,
      skillCount: count,
      strength: count >= 3 ? 'Expert' : count === 2 ? 'Intermediate' : 'Beginner'
    }));

  return strengths;
}

export function identifyWeaknesses(allSkills, userSkills) {
  const userNormalized = userSkills.map(s => s.toLowerCase());
  const clusters = getSkillClusters(allSkills);

  const weaknesses = Object.entries(clusters)
    .filter(([_, items]) =>
      !items.some(item =>
        userNormalized.some(skill => skill.includes(item) || item.includes(skill))
      )
    )
    .map(([cluster, _]) => cluster);

  return weaknesses;
}

export function generateComparisonReport(userSkills, marketSkills, targetRole) {
  const comparison = compareSkillSets(userSkills, marketSkills);
  const benchmark = benchmarkProfile(userSkills, targetRole, {});
  const strengths = identifyStrengths(userSkills);
  const weaknesses = identifyWeaknesses(marketSkills, userSkills);

  return {
    summary: {
      matchPercentage: comparison.matchPercentage,
      assessment: benchmark.assessment,
      percentile: benchmark.percentile
    },
    comparison,
    benchmark,
    strengths,
    weaknesses,
    actionItems: benchmark.recommendations
  };
}
