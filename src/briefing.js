#!/usr/bin/env node
/**
 * Callie - Daily Briefing Generator
 * Runs the /day script and formats output for phone TTS
 */

const { execSync } = require('child_process');

/**
 * Run the /day script and capture output
 */
function getDayBriefing() {
  try {
    const raw = execSync('/Users/joshua/.local/bin/day', {
      encoding: 'utf8',
      timeout: 90000,
      env: { ...process.env, PATH: process.env.PATH + ':/usr/local/bin:/opt/homebrew/bin' }
    });
    return raw;
  } catch (err) {
    return `Good morning Joshua. I couldn't fetch your full briefing today. ${err.message}`;
  }
}

/**
 * Convert raw /day output into phone-friendly speech text
 * Strips emojis, URLs, and formats for TTS
 */
function formatForSpeech(raw) {
  let text = raw
    // Strip emojis
    .replace(/[\u{1F300}-\u{1FFFF}]/gu, '')
    .replace(/[\u{2600}-\u{27BF}]/gu, '')
    // Strip URLs
    .replace(/https?:\/\/\S+/g, '')
    // Strip markdown-style links
    .replace(/\[([^\]]+)\]\([^)]+\)/g, '$1')
    // Clean up section headers
    .replace(/^WEATHER/m, 'Here is your weather.')
    .replace(/^CALENDAR/m, 'Your calendar.')
    .replace(/^REMINDERS/m, 'Your reminders.')
    .replace(/^STOCKS/m, 'Stocks.')
    // Strip Moltbook section entirely (everything from MOLTBOOK to next section header)
    .replace(/MOLTBOOK[\s\S]*?(?=\n [A-Z]|\nYOUTUBE|\nSTOCKS|\nThat's)/,  '')
    .replace(/^YOUTUBE NEWS/m, 'News headlines.')
    .replace(/^Today's Headlines:/m, '')
    .replace(/^Canadian News Channels.*$/m, '')
    .replace(/^Trending News Searches.*$/m, '')
    // Strip search/channel lines
    .replace(/^.*Search YouTube:.*$/gm, '')
    .replace(/^[•●] .*$/gm, '')
    // Clean whitespace
    .replace(/\n{3,}/g, '\n\n')
    .replace(/^\s+|\s+$/g, '')
    .trim();

  // Add greeting
  const hour = new Date().getHours();
  let greeting;
  if (hour < 12) greeting = 'Good morning';
  else if (hour < 17) greeting = 'Good afternoon';
  else greeting = 'Good evening';

  return `${greeting} Joshua. Here is your daily briefing.\n\n${text}\n\nThat's your briefing for today. Have a great day.`;
}

/**
 * Get the formatted briefing ready for TTS
 */
function getBriefing() {
  const raw = getDayBriefing();
  return formatForSpeech(raw);
}

module.exports = { getBriefing, getDayBriefing, formatForSpeech };

// Run standalone
if (require.main === module) {
  console.log(getBriefing());
}
