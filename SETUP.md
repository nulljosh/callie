# Callie Setup Guide

## Phase 1: Twilio Basics (Tonight)

### 1. Create Twilio Account

Go to: https://www.twilio.com/try-twilio

**You'll need:**
- Email address
- Phone number (for verification)
- Credit card (required but won't charge during trial - $15 free credit)

### 2. Get Your Credentials

After signup:
1. Go to Twilio Console: https://console.twilio.com
2. Find these values:
   - **Account SID** (starts with `AC...`)
   - **Auth Token** (click to reveal)
3. Save them somewhere secure

### 3. Buy a Phone Number

1. In Twilio Console, go to **Phone Numbers > Manage > Buy a number**
2. Search for a local number (Langley/Vancouver area code 604 or 778)
3. Select one with **Voice** capability
4. Purchase it (uses your $15 trial credit - costs ~$1/month)
5. Save the phone number

### 4. Configure OpenClaw

Add Twilio credentials to OpenClaw config:

```bash
# Edit config
nano ~/.openclaw/openclaw.json
```

Add this section:

```json
{
  "twilio": {
    "accountSid": "YOUR_ACCOUNT_SID",
    "authToken": "YOUR_AUTH_TOKEN",
    "phoneNumber": "YOUR_TWILIO_NUMBER"
  }
}
```

### 5. Test Basic Call

We'll create a simple script to call your phone:

```bash
cd ~/Documents/Code/callie
node test-call.js
```

## Next Steps

Once basic calling works, we'll add:
- ElevenLabs voice (natural TTS)
- Voicemail detection
- Real-time conversation handling

## Troubleshooting

**"Credit card required"**
- Twilio requires it for trial, won't charge during free tier

**"Number not working"**
- Make sure it has Voice capability enabled
- Check number format: +17788462726 (with country code)

**"Call fails immediately"**
- Verify credentials are correct
- Check Twilio account is active
