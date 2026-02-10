# ClawCall - Quick Start

## Tonight's Goal
Get a phone call from your AI working in 30 minutes.

## Steps

### 1. Sign up for Twilio (5 min)
https://www.twilio.com/try-twilio

- Use email + phone number
- Credit card required (won't charge, $15 free credit)

### 2. Get credentials (2 min)
After signup, copy these from console:
- Account SID
- Auth Token
- Buy a phone number (Voice-enabled)

### 3. Configure (2 min)
```bash
nano ~/.openclaw/openclaw.json
```

Add this:
```json
{
  "twilio": {
    "accountSid": "AC...",
    "authToken": "your_token",
    "phoneNumber": "+1604..."
  }
}
```

### 4. Install dependencies (1 min)
```bash
cd ~/Documents/Code/ClawCall
npm install
```

### 5. Make test call (30 sec)
```bash
npm test
```

Your phone should ring! Answer it and hear Claude speaking.

## What's Next?

Once this works:
- Add voicemail detection
- Real-time conversation (STT + AI responses)
- Autonomous calling scripts
- Collections negotiation logic

## Need Help?

Read SETUP.md for detailed troubleshooting.
