import * as readline from 'readline';
import * as fs from 'fs';
import * as path from 'path';

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
});

function question(prompt: string): Promise<string> {
  return new Promise((resolve) => {
    rl.question(prompt, resolve);
  });
}

async function setupGitHubToken() {
  console.log('\n🔧 GitHub Token Setup\n');
  console.log('To scrape GitHub repositories, you need a GitHub Personal Access Token.');
  console.log('\nHow to get one:');
  console.log('1. Go to https://github.com/settings/tokens');
  console.log('2. Click "Generate new token (classic)"');
  console.log('3. Give it a name like "Find the Others Scraper"');
  console.log('4. Select scopes: "public_repo" (minimum required)');
  console.log('5. Generate and copy the token\n');
  
  const token = await question('Enter your GitHub Personal Access Token (or press Enter to skip): ');
  
  if (token.trim()) {
    // Update .env file
    const envPath = path.join(process.cwd(), '.env');
    let envContent = fs.readFileSync(envPath, 'utf-8');
    
    if (envContent.includes('GITHUB_ACCESS_TOKEN=')) {
      envContent = envContent.replace(
        /# GITHUB_ACCESS_TOKEN=.*/,
        `GITHUB_ACCESS_TOKEN="${token}"`
      );
    } else {
      envContent += `\n# GitHub API (for data collection)\nGITHUB_ACCESS_TOKEN="${token}"\n`;
    }
    
    fs.writeFileSync(envPath, envContent);
    console.log('\n✅ GitHub token saved to .env file');
    console.log('You can now run: npm run scrape:github\n');
  } else {
    console.log('\n⚠️  No token provided. You can add it later to .env as GITHUB_ACCESS_TOKEN\n');
  }
  
  rl.close();
}

setupGitHubToken();