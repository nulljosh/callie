# Callie

AI-powered daily briefing phone calls. Calls you every morning with weather, calendar, stocks, and news.

![Callie Architecture](map.svg)

## Usage

```bash
# Call now with today's briefing
node index.js call

# Preview briefing text (no call)
node index.js briefing

# Start scheduler (calls at 9:00 AM daily)
node index.js schedule

# Quick test call (short message)
node index.js test
```

## Setup

1. Create `.env` with Twilio credentials:
```
TWILIO_ACCOUNT_SID=AC...
TWILIO_AUTH_TOKEN=...
TWILIO_PHONE_NUMBER=+1...
YOUR_PHONE=+1...
CALL_HOUR=9
CALL_MINUTE=0
```

2. Install and run:
```bash
npm install
node index.js test
```

## Tech Stack

- **Voice:** Twilio (outbound calls)
- **TTS:** Amazon Polly Neural via Twilio (Matthew-Neural voice, SSML)
- **Data:** Open-Meteo (weather), icalBuddy (calendar), Yahoo Finance (stocks), Google News RSS
- **Runtime:** Node.js

## Project Structure

```
callie/
  index.js          # CLI entry point (call/briefing/schedule/test)
  src/
    caller.js       # Twilio outbound call logic
    briefing.js     # Fetches weather, calendar, stocks, news; formats for TTS
    config.js       # Loads .env credentials
  .env              # Twilio creds (gitignored)
  package.json
```

## Roadmap

- [x] Phase 1: Basic test call
- [x] Phase 2: Daily briefing via TTS
- [x] Phase 3: Scheduler (9 AM daily)
- [x] Phase 4: Voicemail detection (AMD) + Neural voice + SSML
- [ ] Phase 5: Interactive conversations (ConversationRelay + Claude API)
- [ ] Phase 6: Autonomous calling (collections, inquiries)

## Status

**Current:** v0.3.0 - Neural voice, SSML, stocks, voicemail detection
**Started:** 2026-02-09
