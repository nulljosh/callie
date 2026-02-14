#!/usr/bin/env node
/**
 * Callie - Phone Caller
 * Makes outbound calls via Twilio with SSML briefing
 */

const twilio = require('twilio');
const { getBriefing } = require('./briefing');
const { getConfig } = require('./config');

const VOICE = process.env.VOICE || 'Polly.Joanna-Neural';

/**
 * Convert briefing text to SSML with pauses between sections
 * Simplified to avoid SSML parsing errors
 */
function briefingToSsml(text) {
  // Simple approach: just escape the text, skip complex SSML tags
  // Polly Neural voices sound good without heavy SSML markup
  const escaped = escapeXml(text);
  
  // Replace double newlines with pauses
  const withPauses = escaped.replace(/\n\n+/g, '<break time="800ms"/> ');
  
  // Replace single newlines with short pauses (for news headlines)
  const final = withPauses.replace(/\n/g, '<break time="300ms"/> ');
  
  return final;
}

/**
 * Make a phone call with the daily briefing
 */
async function callWithBriefing(toNumber) {
  const config = getConfig();
  const client = twilio(config.twilio.accountSid, config.twilio.authToken);

  const briefing = await getBriefing();

  // Build chunks (Twilio ~4096 char limit per <Say>)
  // No <speak> wrapper — Polly voices work with plain <Say> + inline SSML tags
  const chunks = chunkText(briefingToSsml(briefing), 3500);
  const sayElements = chunks
    .map(chunk => `<Say voice="${VOICE}">${chunk}</Say><Pause length="1"/>`)
    .join('\n');

  const twiml = `<Response>\n${sayElements}\n</Response>`;
  console.log('TwiML:', twiml.substring(0, 200), '...');

  try {
    const callOpts = {
      from: config.twilio.phoneNumber,
      to: toNumber || config.yourPhone,
      twiml: twiml,
      machineDetection: 'Enable',
      asyncAmd: 'true',
      asyncAmdStatusCallback: config.statusCallback || undefined
    };

    // Status callback for call lifecycle events
    if (config.statusCallback) {
      callOpts.statusCallback = config.statusCallback;
      callOpts.statusCallbackEvent = ['initiated', 'ringing', 'answered', 'completed'];
    }

    // Remove undefined keys
    Object.keys(callOpts).forEach(k => callOpts[k] === undefined && delete callOpts[k]);

    const call = await client.calls.create(callOpts);

    console.log(`Call initiated: ${call.sid}`);
    console.log(`From: ${config.twilio.phoneNumber} -> To: ${toNumber || config.yourPhone}`);
    console.log(`Voice: ${VOICE} | AMD: enabled`);
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
 * Escape XML special characters for TwiML/SSML
 * Also normalize smart quotes and special characters
 */
function escapeXml(text) {
  return text
    // Normalize smart quotes and special chars first
    .replace(/[\u2018\u2019]/g, "'")  // Smart single quotes → straight
    .replace(/[\u201C\u201D]/g, '"')  // Smart double quotes → straight
    .replace(/[\u2013\u2014]/g, '-')  // En/em dashes → hyphen
    .replace(/\u2026/g, '...')        // Ellipsis → three dots
    // Then escape XML special characters
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;');
}

/**
 * Make a phone call with arbitrary text
 */
async function callWithText(text, toNumber) {
  const config = getConfig();
  const client = twilio(config.twilio.accountSid, config.twilio.authToken);

  const escaped = escapeXml(text);
  const chunks = chunkText(escaped, 3500);
  const sayElements = chunks
    .map(chunk => `<Say voice="${VOICE}">${chunk}</Say><Pause length="1"/>`)
    .join('\n');

  const twiml = `<Response>\n${sayElements}\n</Response>`;
  console.log('TwiML:', twiml.substring(0, 200), '...');

  try {
    const call = await client.calls.create({
      from: config.twilio.phoneNumber,
      to: toNumber || config.yourPhone,
      twiml: twiml,
      machineDetection: 'Enable',
      asyncAmd: 'true'
    });

    console.log(`Call initiated: ${call.sid}`);
    console.log(`Voice: ${VOICE} | Text length: ${text.length} chars, ${chunks.length} chunk(s)`);
    return call;
  } catch (err) {
    console.error(`Call failed: ${err.message}`);
    throw err;
  }
}

module.exports = { callWithBriefing, callWithText };

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
