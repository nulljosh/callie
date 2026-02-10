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
 */
function briefingToSsml(text) {
  const sections = text.split(/\n\n+/);

  let ssml = '';
  for (const section of sections) {
    const trimmed = section.trim();
    if (!trimmed) continue;

    // Pause between sections
    if (ssml) ssml += '<break time="800ms"/>';

    // Escape text first, then add SSML tags around headers
    const escaped = escapeXml(trimmed);
    const withHeaders = escaped.replace(
      /^(Weather|Your calendar|Reminders|Markets|News headlines|That&apos;s your briefing)\./m,
      '<emphasis level="moderate">$1.</emphasis><break time="400ms"/>'
    );

    ssml += withHeaders;
  }

  return ssml;
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
 */
function escapeXml(text) {
  return text
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
