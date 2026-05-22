#!/usr/bin/env node

import { Command } from 'commander';
import dotenv from 'dotenv';
import { initCache, clearCache } from './cache.js';
import { loadProfile, getTargetRole, validateSkill, extractSkills } from './utils.js';
import { analyzeSkillGaps, formatAnalysisReport } from './analyzer.js';
import { generateLearningPlan, prioritizeSkills } from './learning-paths.js';
import { generateComparisonReport } from './comparison.js';
import { exportToJSON, exportToCSV, exportToMarkdown, exportToHTML, listExports } from './export.js';

dotenv.config();
initCache();

const program = new Command();

program
  .name('skill-gap-analyzer')
  .description('Analyze skill gaps between your profile and target roles')
  .version('1.0.0');

program
  .command('analyze')
  .description('Analyze skill gaps for your target role')
  .option('-p, --profile <path>', 'Path to profile.yml', './profile.yml')
  .option('-r, --role <role>', 'Target role (overrides profile)')
  .option('-e, --export <format>', 'Export format (json, csv, md, html)')
  .action(async (options) => {
    try {
      const profile = loadProfile(options.profile);
      if (!profile) {
        console.error('✗ Failed to load profile');
        process.exit(1);
      }

      const targetRole = options.role || getTargetRole(profile);
      const analysis = await analyzeSkillGaps(profile);
      const report = formatAnalysisReport(analysis, targetRole);
      console.log(report);
      
      if (options.export) {
        let result;
        switch (options.export.toLowerCase()) {
          case 'json':
            result = exportToJSON(analysis);
            break;
          case 'csv':
            result = exportToCSV(analysis);
            break;
          case 'md':
            result = exportToMarkdown(analysis, targetRole);
            break;
          case 'html':
            result = exportToHTML(analysis, targetRole);
            break;
          default:
            console.error('✗ Unknown export format');
            return;
        }
        
        if (result.success) {
          console.log(`\n✓ Report exported to: ${result.filepath}`);
        } else {
          console.error(`✗ Export failed: ${result.error}`);
        }
      }
    } catch (err) {
      console.error('✗ Analysis failed:', err.message);
      process.exit(1);
    }
  });

program
  .command('learning-path')
  .description('Generate personalized learning path')
  .option('-p, --profile <path>', 'Path to profile.yml', './profile.yml')
  .option('-r, --role <role>', 'Target role')
  .action(async (options) => {
    try {
      const profile = loadProfile(options.profile);
      if (!profile) {
        console.error('✗ Failed to load profile');
        process.exit(1);
      }

      const targetRole = options.role || getTargetRole(profile);
      const analysis = await analyzeSkillGaps(profile);
      const plan = generateLearningPlan(analysis.gaps, targetRole);
      
      console.log(`\n📚 Learning Path for ${targetRole}`);
      console.log(`Timeline: ${plan.timeline}\n`);
      
      plan.phases.forEach((phase, idx) => {
        console.log(`${phase.phase}`);
        console.log(`Duration: ${phase.duration}`);
        console.log(`Skills: ${phase.skills.join(', ')}`);
        console.log(`Resources: ${phase.resources}\n`);
      });
    } catch (err) {
      console.error('✗ Failed to generate learning path:', err.message);
      process.exit(1);
    }
  });

program
  .command('compare')
  .description('Compare your skills against market demand')
  .option('-p, --profile <path>', 'Path to profile.yml', './profile.yml')
  .option('-r, --role <role>', 'Target role')
  .action(async (options) => {
    try {
      const profile = loadProfile(options.profile);
      if (!profile) {
        console.error('✗ Failed to load profile');
        process.exit(1);
      }

      const targetRole = options.role || getTargetRole(profile);
      const userSkills = extractSkills(profile);
      const allSkills = Object.values(userSkills).flat();
      const analysis = await analyzeSkillGaps(profile);
      
      const marketSkills = [
        ...analysis.strong.map(s => s.skill),
        ...analysis.gaps.map(s => s.skill)
      ];
      
      const comparison = generateComparisonReport(allSkills, marketSkills, targetRole);
      
      console.log(`\n📊 Skill Comparison Report`);
      console.log(`Target Role: ${targetRole}\n`);
      console.log(`Match: ${comparison.summary.matchPercentage}%`);
      console.log(`Assessment: ${comparison.summary.assessment}`);
      console.log(`Percentile: ${comparison.summary.percentile}th\n`);
      
      if (comparison.strengths.length > 0) {
        console.log('💪 Strengths:');
        comparison.strengths.forEach(s => {
          console.log(`  • ${s.area} (${s.strength})`);
        });
        console.log('');
      }
      
      if (comparison.weaknesses.length > 0) {
        console.log('📈 Areas to Develop:');
        comparison.weaknesses.forEach(w => {
          console.log(`  • ${w}`);
        });
        console.log('');
      }
      
      if (comparison.actionItems.length > 0) {
        console.log('🎯 Recommendations:');
        comparison.actionItems.forEach(item => {
          console.log(`  • ${item}`);
        });
      }
    } catch (err) {
      console.error('✗ Comparison failed:', err.message);
      process.exit(1);
    }
  });

program
  .command('cache')
  .description('Manage cache')
  .option('--clear', 'Clear all cached data')
  .action((options) => {
    if (options.clear) {
      clearCache();
    } else {
      console.log('Cache management options:');
      console.log('  --clear    Clear all cached data');
    }
  });

program
  .command('exports')
  .description('List exported reports')
  .action(() => {
    const exports = listExports();
    if (exports.length === 0) {
      console.log('No exported reports found.');
      return;
    }
    
    console.log('\n📄 Exported Reports:\n');
    exports.forEach(exp => {
      console.log(`  • ${exp.name} (${(exp.size / 1024).toFixed(2)} KB)`);
    });
  });

program
  .command('help')
  .description('Show help')
  .action(() => {
    program.outputHelp();
  });

program.parse(process.argv);

if (!process.argv.slice(2).length) {
  program.outputHelp();
}
