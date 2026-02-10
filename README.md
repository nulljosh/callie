# Callie

AI-powered daily briefing phone calls. Calls you every morning with weather, calendar, Moltbook, and news.

## How It Works

```
9:00 AM daily
     │
     ▼
┌─────────┐    ┌──────────┐    ┌─────────┐
│ /day    │───▶│ briefing │───▶│ Twilio  │───▶ Your Phone
│ script  │    │ formatter│    │ TTS Call │
└─────────┘    └──────────┘    └─────────┘
     │
     ├── wttr.in (weather)
     ├── icalBuddy (calendar)
     ├── reminders
     ├── Moltbook API (hot posts)
     └── Google News RSS (headlines)
```

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

## Project Map

```mermaid
graph TD
    A[Callie] --> B[Scheduler]
    A --> C[Caller]
    A --> D[Briefing Generator]

    B --> B1[9:00 AM daily trigger]
    B --> B2[setTimeout loop]

    C --> C1[Twilio API]
    C1 --> C2[TwiML + Polly.Matthew TTS]
    C2 --> C3[Outbound Call]

    D --> D1[/day script]
    D1 --> D2[Weather - wttr.in]
    D1 --> D3[Calendar - icalBuddy]
    D1 --> D4[Reminders]
    D1 --> D5[Moltbook API]
    D1 --> D6[Google News RSS]

    D --> D7[Speech Formatter]
    D7 --> D8[Strip emojis/URLs]
    D7 --> D9[TTS-friendly text]

    style A fill:#0071e3,color:#fff
    style C fill:#34c759,color:#fff
    style D fill:#ff9500,color:#fff
```

## Tech Stack

- **Voice:** Twilio (outbound calls)
- **TTS:** Amazon Polly via Twilio (Matthew voice)
- **Data:** wttr.in, icalBuddy, Moltbook API, Google News RSS
- **Runtime:** Node.js

## Project Structure

```
callie/
  index.js          # CLI entry point (call/briefing/schedule/test)
  src/
    caller.js       # Twilio outbound call logic
    briefing.js     # Runs /day script, formats for TTS
    config.js       # Loads .env credentials
  .env              # Twilio creds (gitignored)
  package.json
```

## Roadmap

- [x] Phase 1: Basic test call
- [x] Phase 2: Daily briefing via TTS
- [x] Phase 3: Scheduler (9 AM daily)
- [ ] Phase 4: Voicemail detection
- [ ] Phase 5: Interactive conversations (STT + AI responses)
- [ ] Phase 6: Autonomous calling (collections, inquiries)

## Status

**Current:** v0.2.0 - Daily briefing calls working
**Started:** 2026-02-09
