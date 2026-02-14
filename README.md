# Callie

AI-powered daily briefing phone calls. Calls you every morning with weather, calendar, stocks, and news.

![Callie Architecture](map.svg)

## Usage

```bash
# Call now with today's briefing
node index.js call

# Say anything
node index.js say "your text here"

# Preview briefing text (no call)
node index.js briefing

# Start scheduler (calls at 9:00 AM daily)
node index.js schedule

# Quick test call (short message)
node index.js test

# Use a different voice
VOICE=Polly.Joanna-Neural node index.js call
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
  index.js          # CLI entry point (call/briefing/schedule/say/test)
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

## What You Get

**~30 second morning briefing with:**
- 🌤️ Weather (location, temp, conditions, precipitation)
- 📅 Calendar (next 3 events, deduplicated)
- 📈 Markets (S&P 500 live % change)
- 📰 News (2 top headlines)
- ⏭️ Skips empty sections (reminders, etc.)

## Recent Updates (v0.4.0)

- ✅ **Optimized briefing** - Cut from 63s to ~30s
- ✅ **Real stock data** - Live S&P 500 % change via Yahoo Finance
- ✅ **Fixed all errors** - Removed SSML parsing issues, fixed asyncAmd
- ✅ **Smart sections** - Skips reminders if none, deduplicates calendar
- ✅ **Faster** - 2 headlines instead of 5, shorter intro/outro

## Status

**Current:** v0.4.0 - Production-ready, optimized 30s briefing
**Started:** 2026-02-09
