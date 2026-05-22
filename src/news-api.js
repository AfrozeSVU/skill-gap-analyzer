import axios from 'axios';
import { getCache, setCache } from './cache.js';

const NEWSAPI_URL = 'https://newsapi.org/v2/everything';
const TIMEOUT = 5000;

export async function getHiringTrends(keywords = ['AI hiring', 'ML jobs', 'tech hiring']) {
  const cacheKey = `news_hiring_trends_${keywords.join('_')}`;
  const cached = getCache(cacheKey);
  if (cached) return cached;

  if (!process.env.NEWSAPI_KEY) {
    console.warn('⚠ NEWSAPI_KEY not set. Skipping news trends.');
    return [];
  }

  try {
    const articles = [];

    for (const keyword of keywords) {
      try {
        const response = await axios.get(NEWSAPI_URL, {
          params: {
            q: keyword,
            sortBy: 'publishedAt',
            language: 'en',
            pageSize: 10,
            apiKey: process.env.NEWSAPI_KEY
          },
          timeout: TIMEOUT
        });

        articles.push(...response.data.articles.map(article => ({
          title: article.title,
          source: article.source.name,
          url: article.url,
          publishedAt: article.publishedAt,
          description: article.description
        })));
      } catch (err) {
        console.error(`⚠ NewsAPI error for "${keyword}":`, err.message);
      }
    }

    setCache(cacheKey, articles);
    return articles;
  } catch (err) {
    console.error('⚠ NewsAPI error:', err.message);
    return [];
  }
}

export async function getSkillTrends(skill) {
  const cacheKey = `news_skill_trend_${skill}`;
  const cached = getCache(cacheKey);
  if (cached) return cached;

  if (!process.env.NEWSAPI_KEY) {
    return { trend: 'unknown', articles: [] };
  }

  try {
    const response = await axios.get(NEWSAPI_URL, {
      params: {
        q: skill,
        sortBy: 'publishedAt',
        language: 'en',
        pageSize: 5,
        apiKey: process.env.NEWSAPI_KEY
      },
      timeout: TIMEOUT
    });

    const trend = {
      skill,
      articleCount: response.data.totalResults,
      articles: response.data.articles.slice(0, 5).map(a => ({
        title: a.title,
        source: a.source.name,
        url: a.url,
        publishedAt: a.publishedAt
      }))
    };

    setCache(cacheKey, trend);
    return trend;
  } catch (err) {
    console.error(`⚠ NewsAPI trend error for "${skill}":`, err.message);
    return { skill, articleCount: 0, articles: [] };
  }
}
