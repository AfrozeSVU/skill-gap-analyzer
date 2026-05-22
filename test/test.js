import { loadProfile, extractSkills, validateSkill, normalizeSkill } from '../src/utils.js';
import { initCache, getCache, setCache, clearCache } from '../src/cache.js';

console.log('🧪 Running tests...\n');

// Test 1: Profile loading
console.log('Test 1: Profile loading');
const profile = loadProfile('./profile.example.yml');
if (profile && profile.candidate.full_name === 'Afroze Mohammad') {
  console.log('✅ Profile loaded correctly\n');
} else {
  console.log('❌ Profile loading failed\n');
}

// Test 2: Skill extraction
console.log('Test 2: Skill extraction');
const skills = extractSkills(profile);
if (skills.languages.includes('Python') && skills.frameworks.includes('PyTorch')) {
  console.log('✅ Skills extracted correctly\n');
} else {
  console.log('❌ Skill extraction failed\n');
}

// Test 3: Skill validation
console.log('Test 3: Skill validation');
const validSkills = [
  { skill: 'Python', expected: true },
  { skill: 'C++', expected: true },
  { skill: 'a', expected: false },
  { skill: 'a'.repeat(51), expected: false },
  { skill: 'Python@#$', expected: false }
];

let validationPassed = true;
validSkills.forEach(test => {
  const result = validateSkill(test.skill);
  if (result !== test.expected) {
    console.log(`  ❌ "${test.skill}" should be ${test.expected}, got ${result}`);
    validationPassed = false;
  }
});

if (validationPassed) {
  console.log('✅ Skill validation working correctly\n');
} else {
  console.log('❌ Skill validation failed\n');
}

// Test 4: Skill normalization
console.log('Test 4: Skill normalization');
const normalizations = [
  { input: 'Python', expected: 'python' },
  { input: 'C++', expected: 'c++' },
  { input: '  Machine Learning  ', expected: 'machine-learning' }
];

let normalizationPassed = true;
normalizations.forEach(test => {
  const result = normalizeSkill(test.input);
  if (result !== test.expected) {
    console.log(`  ❌ "${test.input}" should normalize to "${test.expected}", got "${result}"`);
    normalizationPassed = false;
  }
});

if (normalizationPassed) {
  console.log('✅ Skill normalization working correctly\n');
} else {
  console.log('❌ Skill normalization failed\n');
}

// Test 5: Cache operations
console.log('Test 5: Cache operations');
initCache();
setCache('test_key', { data: 'test_value' });
const cached = getCache('test_key');

if (cached && cached.data === 'test_value') {
  console.log('✅ Cache operations working correctly\n');
} else {
  console.log('❌ Cache operations failed\n');
}

clearCache();

console.log('✅ All tests completed!\n');
