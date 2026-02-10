#!/usr/bin/env node
/**
 * Callie - Phone Caller
 * Makes outbound calls via Twilio with TTS briefing
 */

const twilio = require('twilio');
const { getBriefing } = require('./briefing');
const { getConfig } = require('./config');

/**
 * Make a phone call with the daily briefing
 */
async function callWithBriefing(toNumber) {
  const config = getConfig();
  const client = twilio(config.twilio.accountSid, config.twilio.authToken);

  const briefing = getBriefing();

  // Twilio TwiML has a ~4096 char limit per <Say>, so chunk if needed
  const chunks = chunkText(briefing, 3500);
  const sayElements = chunks
    .map(chunk => `<Say voice="Polly.Matthew">${escapeXml(chunk)}</Say><Pause length="1"/>`)
    .join('\n');

  const twiml = `<Response>\n${sayElements}\n</Response>`;

  try {
    const call = await client.calls.create({
      from: config.twilio.phoneNumber,
      to: toNumber || config.yourPhone,
      twiml: twiml
    });

    console.log(`Call initiated: ${call.sid}`);
    console.log(`From: ${config.twilio.phoneNumber} -> To: ${toNumber || config.yourPhone}`);
    return call;
  } catch (err) {
    console.error(`Call failed: ${err.message}`);
    throw err;
  }
}

/**
 * Split text into chunks under maxLen characters
 */
function chunkText(text, maxLen) {
  if (text.length <= maxLen) return [text];

  const chunks = [];
  const sentences = text.split(/(?<=[.!?])\s+/);
  let current = '';

  for (const sentence of sentences) {
    if (current.length + sentence.length + 1 > maxLen) {
      if (current) chunks.push(current.trim());
      current = sentence;
    } else {
      current += (current ? ' ' : '') + sentence;
    }
  }
  if (current) chunks.push(current.trim());
  return chunks;
}

/**
 * Escape XML special characters for TwiML
 */
function escapeXml(text) {
  return text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;');
}

module.exports = { callWithBriefing };

// Run standalone
if (require.main === module) {
  const toNumber = process.argv[2];
  callWithBriefing(toNumber)
    .then(() => console.log('Done'))
    .catch(err => {
      console.error(err.message);
      process.exit(1);
    });
}
