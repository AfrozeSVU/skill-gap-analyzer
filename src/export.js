import fs from 'fs';
import path from 'path';

export function exportToJSON(data, filename = 'analysis-report.json') {
  try {
    const filepath = path.join('./output', filename);
    
    // Create output directory if it doesn't exist
    if (!fs.existsSync('./output')) {
      fs.mkdirSync('./output', { recursive: true });
    }
    
    fs.writeFileSync(filepath, JSON.stringify(data, null, 2));
    return { success: true, filepath };
  } catch (err) {
    return { success: false, error: err.message };
  }
}

export function exportToCSV(data, filename = 'analysis-report.csv') {
  try {
    const filepath = path.join('./output', filename);
    
    if (!fs.existsSync('./output')) {
      fs.mkdirSync('./output', { recursive: true });
    }
    
    let csv = 'Skill,Demand Level,Market Count,Your Status\n';
    
    if (data.strong) {
      data.strong.forEach(skill => {
        csv += `"${skill.skill}","Strong","${skill.count}","Have"\n`;
      });
    }
    
    if (data.gaps) {
      data.gaps.forEach(skill => {
        csv += `"${skill.skill}","${skill.demand}","${skill.count}","Missing"\n`;
      });
    }
    
    fs.writeFileSync(filepath, csv);
    return { success: true, filepath };
  } catch (err) {
    return { success: false, error: err.message };
  }
}

export function exportToMarkdown(analysis, targetRole, filename = 'analysis-report.md') {
  try {
    const filepath = path.join('./output', filename);
    
    if (!fs.existsSync('./output')) {
      fs.mkdirSync('./output', { recursive: true });
    }
    
    let md = `# Skill Gap Analysis Report\n\n`;
    md += `**Generated**: ${new Date().toISOString()}\n`;
    md += `**Target Role**: ${targetRole}\n\n`;
    
    // Strong skills
    if (analysis.strong && analysis.strong.length > 0) {
      md += `## ✓ Strong Skills\n\n`;
      md += `| Skill | Demand | Market Count |\n`;
      md += `|-------|--------|---------------|\n`;
      analysis.strong.slice(0, 10).forEach(skill => {
        md += `| ${skill.skill} | ${skill.demand} | ${skill.count} |\n`;
      });
      md += `\n`;
    }
    
    // Gaps
    if (analysis.gaps && analysis.gaps.length > 0) {
      md += `## ⚠ Skill Gaps\n\n`;
      md += `| Skill | Priority | Market Count |\n`;
      md += `|-------|----------|---------------|\n`;
      analysis.gaps.slice(0, 10).forEach(skill => {
        md += `| ${skill.skill} | ${skill.demand} | ${skill.count} |\n`;
      });
      md += `\n`;
    }
    
    // Trending
    if (analysis.trending && analysis.trending.length > 0) {
      md += `## 📈 Trending Skills\n\n`;
      analysis.trending.forEach(trend => {
        md += `### ${trend.topic}\n`;
        md += `Growth: ${trend.growth}\n\n`;
        if (trend.repos) {
          md += `Top Repositories:\n`;
          trend.repos.slice(0, 3).forEach(repo => {
            md += `- [${repo.name}](${repo.url}) (⭐ ${repo.stars})\n`;
          });
        }
        md += `\n`;
      });
    }
    
    // Market stats
    if (analysis.marketStats) {
      md += `## 📊 Market Statistics\n\n`;
      md += `- **Total Jobs Analyzed**: ${analysis.marketStats.totalJobsAnalyzed}\n`;
      md += `- **Critical Gaps**: ${analysis.marketStats.demandDistribution.critical}\n`;
      md += `- **High Priority Gaps**: ${analysis.marketStats.demandDistribution.high}\n`;
      md += `- **Medium Priority Gaps**: ${analysis.marketStats.demandDistribution.medium}\n`;
    }
    
    fs.writeFileSync(filepath, md);
    return { success: true, filepath };
  } catch (err) {
    return { success: false, error: err.message };
  }
}

export function exportToHTML(analysis, targetRole, filename = 'analysis-report.html') {
  try {
    const filepath = path.join('./output', filename);
    
    if (!fs.existsSync('./output')) {
      fs.mkdirSync('./output', { recursive: true });
    }
    
    let html = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Skill Gap Analysis Report</title>
  <style>
    body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; margin: 40px; background: #f5f5f5; }
    .container { max-width: 900px; margin: 0 auto; background: white; padding: 30px; border-radius: 8px; box-shadow: 0 2px 8px rgba(0,0,0,0.1); }
    h1 { color: #333; border-bottom: 3px solid #007bff; padding-bottom: 10px; }
    h2 { color: #555; margin-top: 30px; }
    table { width: 100%; border-collapse: collapse; margin: 20px 0; }
    th, td { padding: 12px; text-align: left; border-bottom: 1px solid #ddd; }
    th { background: #f8f9fa; font-weight: 600; }
    tr:hover { background: #f9f9f9; }
    .strong { color: #28a745; }
    .gap { color: #dc3545; }
    .trending { color: #ffc107; }
    .meta { color: #666; font-size: 14px; margin-bottom: 20px; }
  </style>
</head>
<body>
  <div class="container">
    <h1>Skill Gap Analysis Report</h1>
    <div class="meta">
      <p><strong>Generated</strong>: ${new Date().toLocaleString()}</p>
      <p><strong>Target Role</strong>: ${targetRole}</p>
    </div>
`;
    
    // Strong skills
    if (analysis.strong && analysis.strong.length > 0) {
      html += `<h2 class="strong">✓ Strong Skills</h2>
    <table>
      <thead>
        <tr><th>Skill</th><th>Demand</th><th>Market Count</th></tr>
      </thead>
      <tbody>
`;
      analysis.strong.slice(0, 10).forEach(skill => {
        html += `        <tr><td>${skill.skill}</td><td>${skill.demand}</td><td>${skill.count}</td></tr>\n`;
      });
      html += `      </tbody>
    </table>
`;
    }
    
    // Gaps
    if (analysis.gaps && analysis.gaps.length > 0) {
      html += `<h2 class="gap">⚠ Skill Gaps</h2>
    <table>
      <thead>
        <tr><th>Skill</th><th>Priority</th><th>Market Count</th></tr>
      </thead>
      <tbody>
`;
      analysis.gaps.slice(0, 10).forEach(skill => {
        html += `        <tr><td>${skill.skill}</td><td>${skill.demand}</td><td>${skill.count}</td></tr>\n`;
      });
      html += `      </tbody>
    </table>
`;
    }
    
    html += `  </div>
</body>
</html>`;
    
    fs.writeFileSync(filepath, html);
    return { success: true, filepath };
  } catch (err) {
    return { success: false, error: err.message };
  }
}

export function listExports() {
  try {
    if (!fs.existsSync('./output')) {
      return [];
    }
    
    const files = fs.readdirSync('./output');
    return files.map(file => ({
      name: file,
      path: path.join('./output', file),
      size: fs.statSync(path.join('./output', file)).size,
      created: fs.statSync(path.join('./output', file)).birthtime
    }));
  } catch (err) {
    return [];
  }
}
