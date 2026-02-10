# ClawCall

AI-powered autonomous phone calling system. Make calls, negotiate, leave voicemails, handle conversations on your behalf.

![Project Map](map.svg)

## Vision

- Call collections and negotiate debt
- Call businesses (UVic, etc.) and ask questions
- Leave intelligent voicemails
- Call you with reminders/updates
- Transcribe conversations and report back

## Tech Stack

- **Voice:** Twilio (phone calls)
- **TTS:** ElevenLabs (natural voice)
- **STT:** Whisper/Deepgram (speech recognition)
- **AI:** Claude Sonnet 4.5 (conversation logic)
- **Integration:** OpenClaw automation

## Phases

### Phase 1: Basic Calling (Tonight)
- [ ] Twilio account setup
- [ ] Basic outbound call (call your phone)
- [ ] TTS announcement ("This is a test call")
- [ ] Verify everything works

### Phase 2: Voicemail
- [ ] Detect voicemail vs human answer
- [ ] Leave pre-scripted messages
- [ ] Confirm delivery

### Phase 3: Interactive Conversations
- [ ] Real-time STT (listen to responses)
- [ ] AI generates responses on the fly
- [ ] Handle interruptions/turn-taking
- [ ] Call scripts for different scenarios

### Phase 4: Autonomous Negotiation
- [ ] Collections debt negotiation scripts
- [ ] UVic inquiry handling
- [ ] Context-aware conversations
- [ ] Post-call summaries/reports

## Status

**Current:** Phase 1 setup in progress
**Started:** 2026-02-09
