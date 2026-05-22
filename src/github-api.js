import axios from 'axios';
import { getCache, setCache } from './cache.js';

const GITHUB_API = 'https://api.github.com';
const TIMEOUT = 5000;

const headers = {
  'Accept': 'application/vnd.github.v3+json',
  ...(process.env.GITHUB_TOKEN && { 'Authorization': `token ${process.env.GITHUB_TOKEN}` })
};

export async function getTrendingSkills(topic, days = 30) {
  const cacheKey = `github_trending_${topic}_${days}d`;
  const cached = getCache(cacheKey);
  if (cached) return cached;

  try {
    const date = new Date();
    date.setDate(date.getDate() - days);
    const dateStr = date.toISOString().split('T')[0];

    const response = await axios.get(`${GITHUB_API}/search/repositories`, {
      params: {
        q: `${topic} language:python created:>${dateStr}`,
        sort: 'stars',
        order: 'desc',
        per_page: 100
      },
      headers,
      timeout: TIMEOUT
    });

    const skills = response.data.items.map(repo => ({
      name: repo.name,
      stars: repo.stargazers_count,
      language: repo.language,
      url: repo.html_url,
      description: repo.description
    }));

    setCache(cacheKey, skills);
    return skills;
  } catch (err) {
    console.error(`⚠ GitHub API error (${topic}):`, err.message);
    return [];
  }
}

export async function getSkillFrequency(skills) {
  const cacheKey = `github_skill_frequency_${skills.join('_')}`;
  const cached = getCache(cacheKey);
  if (cached) return cached;

  const frequency = {};

  for (const skill of skills) {
    try {
      const response = await axios.get(`${GITHUB_API}/search/repositories`, {
        params: {
          q: `${skill} stars:>100`,
          sort: 'stars',
          per_page: 1
        },
        headers,
        timeout: TIMEOUT
      });

      frequency[skill] = response.data.total_count || 0;
    } catch (err) {
      frequency[skill] = 0;
    }
  }

  setCache(cacheKey, frequency);
  return frequency;
}

export async function getLanguageStats(language) {
  const cacheKey = `github_lang_stats_${language}`;
  const cached = getCache(cacheKey);
  if (cached) return cached;

  try {
    const response = await axios.get(`${GITHUB_API}/search/repositories`, {
      params: {
        q: `language:${language} stars:>1000`,
        sort: 'stars',
        per_page: 50
      },
      headers,
      timeout: TIMEOUT
    });

    const stats = {
      total: response.data.total_count,
      topRepos: response.data.items.slice(0, 10).map(r => ({
        name: r.name,
        stars: r.stargazers_count,
        url: r.html_url
      }))
    };

    setCache(cacheKey, stats);
    return stats;
  } catch (err) {
    console.error(`⚠ GitHub language stats error (${language}):`, err.message);
    return { total: 0, topRepos: [] };
  }
}
