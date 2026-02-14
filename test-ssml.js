const { getBriefing } = require('./src/briefing');
const { callWithBriefing } = require('./src/caller');

async function test() {
  const briefing = await getBriefing();
  console.log('=== BRIEFING TEXT ===');
  console.log(briefing.substring(0, 300));
  
  // Simulate what happens in caller.js
  const fs = require('fs');
  const callerCode = fs.readFileSync('./src/caller.js', 'utf8');
  
  // Extract the functions
  const escapeXmlMatch = callerCode.match(/function escapeXml\(text\) \{[\s\S]+?^}/m);
  const briefingToSsmlMatch = callerCode.match(/function briefingToSsml\(text\) \{[\s\S]+?^}/m);
  
  if (!escapeXmlMatch || !briefingToSsmlMatch) {
    console.error('Could not extract functions');
    return;
  }
  
  eval(escapeXmlMatch[0]);
  eval(briefingToSsmlMatch[0]);
  
  const ssml = briefingToSsml(briefing);
  console.log('\n=== SSML OUTPUT (first 500 chars) ===');
  console.log(ssml.substring(0, 500));
  
  console.log('\n=== VALIDATION ===');
  if (ssml.includes('Currently')) console.log('✅ "Currently" present');
  else console.log('❌ "Currently" MISSING or corrupted');
  
  if (briefing.includes('Congress') && ssml.includes('Congress')) console.log('✅ "Congress" present');
  else if (briefing.includes('Congress')) console.log('❌ "Congress" MISSING or corrupted');
}

test().catch(console.error);
