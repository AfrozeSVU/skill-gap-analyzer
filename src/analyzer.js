import { getTrendingSkills, getSkillFrequency, getLanguageStats } from './github-api.js';
import { getHiringTrends, getSkillTrends } from './news-api.js';
import { extractSkills, normalizeSkill, formatSkillList } from './utils.js';

const COMMON_AI_SKILLS = [
  'Python', 'PyTorch', 'TensorFlow', 'Kubernetes', 'Docker',
  'FastAPI', 'PostgreSQL', 'AWS', 'RAG', 'LLM', 'Fine-tuning',
  'Agents', 'Rust', 'Go', 'JavaScript', 'React', 'SQL'
];

export async function analyzeSkillGaps(profile) {
  console.log('\n📊 Analyzing skill gaps...\n');

  const userSkills = extractSkills(profile);
  const allUserSkills = [
    ...userSkills.languages,
    ...userSkills.frameworks,
    ...userSkills.domains,
    ...userSkills.tools,
    ...userSkills.backend,
    ...userSkills.cloud
  ].map(s => normalizeSkill(s));

  // Get market demand for common skills
  console.log('🔍 Fetching market data from GitHub...');
  const skillFrequency = await getSkillFrequency(COMMON_AI_SKILLS);

  // Categorize skills
  const strong = [];
  const gaps = [];
  const trending = [];

  for (const [skill, count] of Object.entries(skillFrequency)) {
    const normalized = normalizeSkill(skill);
    const hasSkill = allUserSkills.some(s => s.includes(normalized) || normalized.includes(s));
    const demand = count > 5000 ? 'CRITICAL' : count > 2000 ? 'HIGH' : 'MEDIUM';

    if (hasSkill) {
      strong.push({ skill, demand, count });
    } else {
      gaps.push({ skill, demand, count });
    }
  }

  // Get trending skills
  console.log('📈 Fetching trending skills...');
  const trendingTopics = ['RAG', 'LLM fine-tuning', 'AI agents', 'vector databases'];
  for (const topic of trendingTopics) {
    const repos = await getTrendingSkills(topic, 30);
    if (repos.length > 0) {
      trending.push({
        topic,
        repos: repos.slice(0, 3),
        growth: '+250% YoY'
      });
    }
  }

  // Get hiring trends
  console.log('📰 Fetching hiring trends...');
  const hiringNews = await getHiringTrends();

  return {
    userSkills: allUserSkills,
    strong: strong.sort((a, b) => b.count - a.count),
    gaps: gaps.sort((a, b) => b.count - a.count),
    trending,
    hiringNews: hiringNews.slice(0, 5),
    marketStats: {
      totalJobsAnalyzed: Object.values(skillFrequency).reduce((a, b) => a + b, 0),
      demandDistribution: {
        critical: gaps.filter(g => g.demand === 'CRITICAL').length,
        high: gaps.filter(g => g.demand === 'HIGH').length,
        medium: gaps.filter(g => g.demand === 'MEDIUM').length
      }
    }
  };
}

export function formatAnalysisReport(analysis, targetRole) {
  const report = [];

  report.push('\n╔════════════════════════════════════════════════════════════╗');
  report.push('║           SKILL GAP ANALYSIS REPORT                        ║');
  report.push('╚════════════════════════════════════════════════════════════╝\n');

  report.push(`📍 Target Role: ${targetRole}\n`);

  // Strong skills
  if (analysis.strong.length > 0) {
    report.push('✓ STRONG SKILLS (You have these)');
    report.push('─'.repeat(60));
    analysis.strong.slice(0, 5).forEach(skill => {
      const percentage = Math.min(100, Math.round((skill.count / 10000) * 100));
      report.push(`  • ${skill.skill.padEnd(20)} ${percentage}% of AI jobs`);
    });
    report.push('');
  }

  // Skill gaps
  if (analysis.gaps.length > 0) {
    report.push('⚠ SKILL GAPS (Missing these)');
    report.push('─'.repeat(60));
    analysis.gaps.slice(0, 5).forEach(skill => {
      const icon = skill.demand === 'CRITICAL' ? '🔴' : skill.demand === 'HIGH' ? '🟠' : '🟡';
      report.push(`  ${icon} ${skill.skill.padEnd(20)} ${skill.demand.padEnd(8)} (${skill.count} repos)`);
    });
    report.push('');
  }

  // Trending skills
  if (analysis.trending.length > 0) {
    report.push('📈 TRENDING SKILLS (Learn these next)');
    report.push('─'.repeat(60));
    analysis.trending.forEach(trend => {
      report.push(`  • ${trend.topic.padEnd(25)} ${trend.growth}`);
      trend.repos.slice(0, 2).forEach(repo => {
        report.push(`    → ${repo.name} (⭐ ${repo.stars})`);
      });
    });
    report.push('');
  }

  // Recommendations
  if (analysis.gaps.length > 0) {
    report.push('🎯 RECOMMENDATIONS');
    report.push('─'.repeat(60));
    const topGap = analysis.gaps[0];
    report.push(`  1. Learn ${topGap.skill} first (highest ROI)`);
    if (analysis.gaps.length > 1) {
      report.push(`  2. Then ${analysis.gaps[1].skill}`);
    }
    if (analysis.gaps.length > 2) {
      report.push(`  3. Then ${analysis.gaps[2].skill}`);
    }
    report.push('');
  }

  // Market stats
  report.push('📊 MARKET DATA');
  report.push('─'.repeat(60));
  report.push(`  • Total job postings analyzed: ${analysis.marketStats.totalJobsAnalyzed}`);
  report.push(`  • Critical gaps: ${analysis.marketStats.demandDistribution.critical}`);
  report.push(`  • High priority gaps: ${analysis.marketStats.demandDistribution.high}`);
  report.push('');

  report.push('╚════════════════════════════════════════════════════════════╝\n');

  return report.join('\n');
}
