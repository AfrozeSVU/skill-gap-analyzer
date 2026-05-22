import { getSkillTrends } from './news-api.js';
import { getLanguageStats } from './github-api.js';

// Learning paths for different roles
const LEARNING_PATHS = {
  'Junior AI/ML Engineer': {
    foundational: ['Python', 'SQL', 'Statistics'],
    intermediate: ['PyTorch', 'TensorFlow', 'scikit-learn'],
    advanced: ['MLOps', 'Kubernetes', 'AWS SageMaker'],
    timeline: '6-12 months'
  },
  'Backend Engineer': {
    foundational: ['Python', 'JavaScript', 'SQL'],
    intermediate: ['FastAPI', 'PostgreSQL', 'REST APIs'],
    advanced: ['Kubernetes', 'Docker', 'Microservices'],
    timeline: '4-8 months'
  },
  'AI Solutions Architect': {
    foundational: ['Python', 'System Design', 'Cloud'],
    intermediate: ['AWS', 'Azure', 'GCP'],
    advanced: ['MLOps', 'Enterprise AI', 'Governance'],
    timeline: '12-18 months'
  }
};

// Skill prerequisites
const PREREQUISITES = {
  'Kubernetes': ['Docker', 'Linux', 'YAML'],
  'Docker': ['Linux', 'Git'],
  'AWS SageMaker': ['Python', 'AWS', 'ML basics'],
  'MLOps': ['Python', 'Git', 'Docker'],
  'Microservices': ['Backend framework', 'Docker', 'API design'],
  'RAG': ['Python', 'LLMs', 'Vector databases'],
  'Fine-tuning': ['Python', 'PyTorch', 'LLMs']
};

// Salary impact by skill (India market)
const SALARY_IMPACT = {
  'Kubernetes': { min: 15, max: 20, unit: '%' },
  'Docker': { min: 10, max: 15, unit: '%' },
  'AWS': { min: 12, max: 18, unit: '%' },
  'MLOps': { min: 18, max: 25, unit: '%' },
  'RAG': { min: 20, max: 30, unit: '%' },
  'LLM Fine-tuning': { min: 22, max: 32, unit: '%' },
  'Rust': { min: 15, max: 25, unit: '%' },
  'Go': { min: 12, max: 18, unit: '%' }
};

// Learning time estimates (weeks)
const LEARNING_TIME = {
  'Python': 4,
  'JavaScript': 3,
  'SQL': 2,
  'Docker': 2,
  'Git': 1,
  'Linux': 3,
  'FastAPI': 2,
  'PyTorch': 4,
  'TensorFlow': 4,
  'Kubernetes': 6,
  'AWS': 5,
  'MLOps': 6,
  'RAG': 4,
  'LLM Fine-tuning': 4,
  'Rust': 8,
  'Go': 5
};

export function getSkillPrerequisites(skill) {
  return PREREQUISITES[skill] || [];
}

export function getSalaryImpact(skill) {
  return SALARY_IMPACT[skill] || { min: 5, max: 10, unit: '%' };
}

export function getLearningTime(skill) {
  return LEARNING_TIME[skill] || 4;
}

export function getLearningPath(targetRole) {
  return LEARNING_PATHS[targetRole] || LEARNING_PATHS['Junior AI/ML Engineer'];
}

export function calculateROI(skill, marketDemand) {
  const learningWeeks = getLearningTime(skill);
  const salaryImpact = getSalaryImpact(skill);
  const avgImpact = (salaryImpact.min + salaryImpact.max) / 2;
  
  // ROI = (Market Demand × Salary Impact) / Learning Time
  const roi = (marketDemand * avgImpact) / learningWeeks;
  
  return {
    skill,
    roi: Math.round(roi * 100) / 100,
    learningWeeks,
    salaryImpact: `${salaryImpact.min}-${salaryImpact.max}%`,
    marketDemand: `${marketDemand}%`
  };
}

export function prioritizeSkills(gaps) {
  // Sort by ROI (market demand / learning time)
  return gaps
    .map(gap => ({
      ...gap,
      learningTime: getLearningTime(gap.skill),
      roi: calculateROI(gap.skill, Math.min(100, (gap.count / 100)))
    }))
    .sort((a, b) => b.roi.roi - a.roi.roi);
}

export function getPrerequisiteChain(skill) {
  const chain = [skill];
  const prerequisites = getSkillPrerequisites(skill);
  
  prerequisites.forEach(prereq => {
    if (!chain.includes(prereq)) {
      chain.unshift(prereq);
    }
  });
  
  return chain;
}

export function generateLearningPlan(gaps, targetRole) {
  const path = getLearningPath(targetRole);
  const prioritized = prioritizeSkills(gaps);
  
  const plan = {
    targetRole,
    timeline: path.timeline,
    phases: []
  };
  
  // Phase 1: Foundational (if missing)
  const missingFoundational = path.foundational.filter(skill =>
    prioritized.some(g => g.skill.toLowerCase().includes(skill.toLowerCase()))
  );
  
  if (missingFoundational.length > 0) {
    plan.phases.push({
      phase: 'Phase 1: Foundational',
      duration: '4-6 weeks',
      skills: missingFoundational,
      resources: 'Online courses, tutorials'
    });
  }
  
  // Phase 2: Intermediate
  const missingIntermediate = path.intermediate.filter(skill =>
    prioritized.some(g => g.skill.toLowerCase().includes(skill.toLowerCase()))
  );
  
  if (missingIntermediate.length > 0) {
    plan.phases.push({
      phase: 'Phase 2: Intermediate',
      duration: '6-8 weeks',
      skills: missingIntermediate,
      resources: 'Projects, open source'
    });
  }
  
  // Phase 3: Advanced
  const missingAdvanced = path.advanced.filter(skill =>
    prioritized.some(g => g.skill.toLowerCase().includes(skill.toLowerCase()))
  );
  
  if (missingAdvanced.length > 0) {
    plan.phases.push({
      phase: 'Phase 3: Advanced',
      duration: '8-12 weeks',
      skills: missingAdvanced,
      resources: 'Production systems, contributions'
    });
  }
  
  return plan;
}

export async function getSkillMarketData(skill) {
  const trend = await getSkillTrends(skill);
  const stats = await getLanguageStats(skill);
  
  return {
    skill,
    trend,
    stats,
    prerequisites: getSkillPrerequisites(skill),
    salaryImpact: getSalaryImpact(skill),
    learningTime: getLearningTime(skill),
    roi: calculateROI(skill, Math.min(100, (stats.total / 100)))
  };
}
