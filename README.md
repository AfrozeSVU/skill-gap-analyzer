# Skill Gap Analyzer

Analyze skill gaps between your current profile and target roles using real market data from GitHub and NewsAPI.

## What It Does

Instead of guessing which skills to learn, this tool:
- **Fetches real job market data** from GitHub (trending repos, skill frequency)
- **Identifies your skill gaps** by comparing your profile against market demand
- **Highlights trending skills** that are gaining traction (RAG, LLMs, Agents, etc.)
- **Provides actionable recommendations** on what to learn first

## Quick Start

### 1. Install Dependencies

```bash
npm install
```

### 2. Set Up API Keys (Optional but Recommended)

Copy `.env.example` to `.env`:

```bash
cp .env.example .env
```

Then edit `.env`:

```env
# GitHub API (optional - for higher rate limits)
# Get a free token at: https://github.com/settings/tokens
GITHUB_TOKEN=your_github_token_here

# NewsAPI (free tier)
# Get a free key at: https://newsapi.org/register
NEWSAPI_KEY=your_newsapi_key_here

CACHE_TTL_HOURS=24
```

**Why API keys?**
- **GitHub**: Without a token, you get 60 requests/hour. With a token, 5000/hour.
- **NewsAPI**: Free tier gives 100 requests/day. Needed for hiring trend analysis.

Both are **optional** — the tool works without them but with reduced functionality.

### 3. Create Your Profile

Create a `profile.yml` file in the project root:

```yaml
candidate:
  full_name: "Your Name"
  email: "your@email.com"
  location: "City, Country"

target_roles:
  primary:
    - "Junior AI/ML Engineer"
    - "Backend Engineer"

skills:
  languages:
    - Python
    - JavaScript
  ml_frameworks:
    - PyTorch
    - TensorFlow
  backend:
    - FastAPI
    - PostgreSQL
  cloud_infra:
    - AWS
    - Docker
  tools:
    - Git
    - Linux
```

 

### 4. Run Analysis

```bash
npm start analyze
```

Or with a custom profile path:

```bash
npm start analyze -- --profile ./my-profile.yml
```

## Output Example

```
╔════════════════════════════════════════════════════════════╗
║           SKILL GAP ANALYSIS REPORT                        ║
╚════════════════════════════════════════════════════════════╝

📍 Target Role: Junior AI/ML Engineer

✓ STRONG SKILLS (You have these)
────────────────────────────────────────────────────────────
  • Python               89% of AI jobs
  • PyTorch              72% of ML jobs
  • FastAPI              45% of backend AI roles

⚠ SKILL GAPS (Missing these)
────────────────────────────────────────────────────────────
  🔴 Kubernetes          CRITICAL (8,234 repos)
  🟠 Docker              HIGH     (6,891 repos)
  🟡 Rust                MEDIUM   (3,456 repos)

📈 TRENDING SKILLS (Learn these next)
────────────────────────────────────────────────────────────
  • RAG                          +340% YoY
    → langchain (⭐ 45,234)
    → llamaindex (⭐ 32,456)
  • LLM Fine-tuning              +280% YoY
    → peft (⭐ 12,345)

🎯 RECOMMENDATIONS
────────────────────────────────────────────────────────────
  1. Learn Kubernetes first (highest ROI)
  2. Then Docker
  3. Then Rust

📊 MARKET DATA
────────────────────────────────────────────────────────────
  • Total job postings analyzed: 45,234
  • Critical gaps: 3
  • High priority gaps: 5

╚════════════════════════════════════════════════════════════╝
```

## Commands

```bash
# Analyze skill gaps
npm start analyze

# Analyze with custom profile
npm start analyze -- --profile ./custom-profile.yml

# Override target role
npm start analyze -- --role "Senior ML Engineer"

# Check specific skill demand
npm start check-skill "Kubernetes"

# Clear cache
npm start cache -- --clear

# Show help
npm start help
```

## How It Works

### 1. Profile Loading
- Reads your `profile.yml` (YAML format)
- Extracts skills from: languages, frameworks, domains, tools, backend, cloud

### 2. Market Data Collection
- **GitHub API**: Searches for repos with each skill, counts total matches
- **NewsAPI**: Fetches recent articles about hiring trends and skill demand

### 3. Gap Analysis
- Compares your skills against market demand
- Categorizes as: Strong (you have), Gaps (missing), Trending (emerging)

### 4. Recommendations
- Ranks gaps by market demand (CRITICAL > HIGH > MEDIUM)
- Suggests learning order based on ROI

## Error Handling

The tool handles three failure modes gracefully:

### 1. Slow API Responses
- **Timeout**: 5 seconds per API call
- **Fallback**: Uses cached data if available
- **Message**: Shows warning but continues analysis

### 2. API Errors
- **Rate limit**: Uses cached results
- **Network error**: Falls back to cached data
- **Invalid response**: Skips that data source, continues with others

### 3. Bad User Input
- **Invalid profile path**: Shows error, exits gracefully
- **Invalid skill name**: Validates format (alphanumeric, 2-50 chars)
- **Missing profile**: Provides helpful error message

## Caching

Results are cached locally in `data/cache.json` to:
- Avoid rate limits
- Speed up repeated queries
- Work offline with cached data

Cache TTL: 24 hours (configurable via `CACHE_TTL_HOURS`)

Clear cache:
```bash
npm start cache -- --clear
```

## Project Structure

```
skill-gap-analyzer/
├── src/
│   ├── cli.js              # CLI entry point
│   ├── analyzer.js         # Core analysis logic
│   ├── github-api.js       # GitHub API integration
│   ├── news-api.js         # NewsAPI integration
│   ├── cache.js            # Caching utility
│   └── utils.js            # Helper functions
├── data/
│   └── cache.json          # Cached API responses
├── test/
│   └── test.js             # Basic tests
├── profile.yml             # Your profile (create this)
├── .env                    # API keys (create from .env.example)
├── .env.example            # Template
├── package.json
├── README.md
└── ANSWERS.md
```

## Requirements

- Node.js 16+
- npm 7+

## License

MIT

## Author

Afroze Mohammad
