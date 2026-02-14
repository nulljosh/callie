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
    // Get location from IP
    const geo = JSON.parse(await fetch('https://ipinfo.io/json', 5000));
    const [lat, lon] = geo.loc.split(',');
    const city = geo.city || 'your area';

    // Open-Meteo - free, no API key, reliable
    const url = `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&current=temperature_2m,weather_code&daily=temperature_2m_max,temperature_2m_min,precipitation_probability_max&temperature_unit=celsius&timezone=auto&forecast_days=1`;
    const data = JSON.parse(await fetch(url, 5000));

    const temp = Math.round(data.current.temperature_2m);
    const high = Math.round(data.daily.temperature_2m_max[0]);
    const low = Math.round(data.daily.temperature_2m_min[0]);
    const rain = data.daily.precipitation_probability_max[0];

    const codes = { 0: 'Clear', 1: 'Mostly clear', 2: 'Partly cloudy', 3: 'Overcast',
      45: 'Foggy', 48: 'Foggy', 51: 'Light drizzle', 53: 'Drizzle', 55: 'Heavy drizzle',
      61: 'Light rain', 63: 'Rain', 65: 'Heavy rain', 71: 'Light snow', 73: 'Snow', 75: 'Heavy snow',
      80: 'Rain showers', 81: 'Rain showers', 82: 'Heavy rain showers',
      95: 'Thunderstorm', 96: 'Thunderstorm with hail' };
    const condition = codes[data.current.weather_code] || 'Unknown';

    return `${city}. Currently ${temp} degrees, ${condition.toLowerCase()}. High of ${high}, low of ${low}. ${rain}% chance of precipitation.`;
  } catch {
    return 'Weather unavailable';
  }
}

async function getCalendar() {
  try {
    const out = execSync('icalBuddy -n -nc -iep "title,datetime" -b "" eventsToday+2 2>/dev/null | head -5', {
      encoding: 'utf8', timeout: 5000
    });
    // Clean up for speech - just first 3 events, remove duplicates
    const events = out.trim()
      .split('\n')
      .map(line => line.trim())
      .filter(line => line && !line.match(/^\s+$/))
      .slice(0, 3); // Max 3 events
    
    // Remove exact duplicates
    const unique = [...new Set(events)];
    
    return unique.length > 0 ? unique.join(', ') : 'Nothing scheduled';
  } catch {
    return 'Nothing scheduled';
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

const STOCKS = {
  AAPL: 'Apple', NVDA: 'Nvidia', TSLA: 'Tesla', MSFT: 'Microsoft', GOOGL: 'Google'
};

async function getStocks() {
  try {
    // Try multiple sources in sequence
    // 1. Yahoo Finance (alternate endpoint)
    try {
      const url = 'https://query2.finance.yahoo.com/v8/finance/chart/%5EGSPC?interval=1d&range=1d';
      const data = JSON.parse(await fetch(url, 8000));
      const meta = data.chart.result[0].meta;
      const prev = meta.chartPreviousClose;
      const price = meta.regularMarketPrice;
      const pct = ((price - prev) / prev * 100).toFixed(1);
      const dir = pct >= 0 ? 'up' : 'down';
      return `S and P ${dir} ${Math.abs(pct)} percent.`;
    } catch {
      // 2. Fallback to simple generic message
      return 'Markets steady.';
    }
  } catch {
    return '';
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
  const [weather, calendar, reminders, news, stocks] = await Promise.all([
    getWeather(),
    getCalendar(),
    getReminders(),
    getNews(),
    getStocks()
  ]);

  // Format news for speech - extract just the headline titles (2 max, no numbering)
  let newsText = '';
  if (news) {
    const lines = news.split('\n');
    const headlines = lines
      .filter(line => /^\d+\.\s/.test(line.trim()))
      .map(line => line.replace(/^\d+\.\s*/, '').trim())
      .slice(0, 2);  // Only 2 headlines
    if (headlines.length > 0) {
      newsText = headlines.join('. '); // Just periods between, no numbering
    }
  }

  let briefing = `${greeting} Joshua. ${date}.\n\n`;
  briefing += `Weather. ${weather}\n\n`;
  briefing += `Calendar. ${calendar}\n\n`;
  // Skip reminders if none
  if (reminders && !reminders.includes('No active')) {
    briefing += `Reminders. ${reminders}\n\n`;
  }
  if (stocks) {
    briefing += `Markets. ${stocks}\n\n`;
  }
  if (newsText) {
    briefing += `Headlines.\n${newsText}\n\n`;
  }
  briefing += `That's your briefing.`;

  return briefing;
}

module.exports = { getBriefing };

// Run standalone
if (require.main === module) {
  getBriefing().then(b => console.log(b));
}
