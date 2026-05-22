import fs from 'fs';
import yaml from 'yaml';

export function loadProfile(profilePath) {
  try {
    if (!fs.existsSync(profilePath)) {
      console.error(`✗ Profile not found: ${profilePath}`);
      return null;
    }

    const content = fs.readFileSync(profilePath, 'utf8');
    const profile = yaml.parse(content);
    return profile;
  } catch (err) {
    console.error(`✗ Error parsing profile: ${err.message}`);
    return null;
  }
}

export function extractSkills(profile) {
  if (!profile || !profile.skills) {
    return {
      languages: [],
      frameworks: [],
      domains: [],
      tools: []
    };
  }

  return {
    languages: profile.skills.languages || [],
    frameworks: profile.skills.ml_frameworks || [],
    domains: profile.skills.ai_domains || [],
    tools: profile.skills.tools || [],
    backend: profile.skills.backend || [],
    cloud: profile.skills.cloud_infra || []
  };
}

export function validateSkill(skill) {
  if (!skill || typeof skill !== 'string') return false;
  if (skill.length < 2 || skill.length > 50) return false;
  if (!/^[a-zA-Z0-9\s\+\#\-\.]+$/.test(skill)) return false;
  return true;
}

export function normalizeSkill(skill) {
  return skill.trim().toLowerCase().replace(/\s+/g, '-');
}

export function getTargetRole(profile) {
  if (!profile || !profile.target_roles) {
    return 'AI/ML Engineer';
  }
  return profile.target_roles.primary?.[0] || 'AI/ML Engineer';
}

export function formatSkillList(skills) {
  return skills.filter(s => s && s.length > 0).map(s => s.trim());
}
