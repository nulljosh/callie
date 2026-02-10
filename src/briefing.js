#!/usr/bin/env node
/**
 * Callie - Daily Briefing Generator
 * Fetches weather, calendar, news directly (no /day dependency)
 */

const { execSync } = require('child_process');
const https = require('https');
const http = require('http');

function fetch(url, timeoutMs = 8000) {
  return new Promise((resolve, reject) => {
    const mod = url.startsWith('https') ? https : http;
    const req = mod.get(url, { timeout: timeoutMs }, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => resolve(data));
    });
    req.on('timeout', () => { req.destroy(); reject(new Error('timeout')); });
    req.on('error', reject);
    setTimeout(() => { req.destroy(); reject(new Error('timeout')); }, timeoutMs);
  });
}

async function getWeather() {
  try {
    const data = await fetch('https://wttr.in/?format=3', 5000);
    return data.trim();
  } catch {
    return 'Weather unavailable';
  }
}

async function getCalendar() {
  try {
    const out = execSync('icalBuddy -n -nc -iep "title,datetime" -b "" eventsToday+3 2>/dev/null | head -10', {
      encoding: 'utf8', timeout: 5000
    });
    return out.trim() || 'No upcoming events';
  } catch {
    return 'No upcoming events';
  }
}

async function getReminders() {
  try {
    const out = execSync('reminders show-lists 2>/dev/null | head -5', {
      encoding: 'utf8', timeout: 5000
    });
    return out.trim() || 'No active reminders';
  } catch {
    return 'No active reminders';
  }
}

async function getNews() {
  try {
    const out = execSync('/Users/joshua/.local/bin/youtube-news 2>/dev/null', {
      encoding: 'utf8', timeout: 15000,
      env: { ...process.env, PATH: process.env.PATH + ':/usr/local/bin:/opt/homebrew/bin' }
    });
    return out.trim();
  } catch {
    return '';
  }
}

/**
 * Build the briefing from all sources in parallel
 */
async function getBriefing() {
  const hour = new Date().getHours();
  let greeting;
  if (hour < 12) greeting = 'Good morning';
  else if (hour < 17) greeting = 'Good afternoon';
  else greeting = 'Good evening';

  const date = new Date().toLocaleDateString('en-US', {
    weekday: 'long', year: 'numeric', month: 'long', day: 'numeric'
  });

  // Fetch all sources in parallel
  const [weather, calendar, reminders, news] = await Promise.all([
    getWeather(),
    getCalendar(),
    getReminders(),
    getNews()
  ]);

  // Format news for speech
  let newsText = '';
  if (news) {
    newsText = news
      .replace(/[\u{1F300}-\u{1FFFF}]/gu, '')
      .replace(/[\u{2600}-\u{27BF}]/gu, '')
      .replace(/https?:\/\/\S+/g, '')
      .replace(/^.*YOUTUBE NEWS.*$/gm, '')
      .replace(/^Today's Headlines:/m, '')
      .replace(/^Canadian News Channels[\s\S]*$/gm, '')
      .replace(/^Trending News Searches[\s\S]*$/gm, '')
      .replace(/^.*Search YouTube:.*$/gm, '')
      .replace(/^[•●] .*$/gm, '')
      .replace(/\n{3,}/g, '\n\n')
      .trim();
  }

  let briefing = `${greeting} Joshua. Today is ${date}. Here is your daily briefing.\n\n`;
  briefing += `Weather. ${weather}\n\n`;
  briefing += `Your calendar. ${calendar}\n\n`;
  briefing += `Reminders. ${reminders}\n\n`;
  if (newsText) {
    briefing += `News headlines.\n${newsText}\n\n`;
  }
  briefing += `That's your briefing for today. Have a great day.`;

  return briefing;
}

module.exports = { getBriefing };

// Run standalone
if (require.main === module) {
  getBriefing().then(b => console.log(b));
}
