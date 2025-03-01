
const { exec } = require('child_process');
const qrcode = require('qrcode-terminal');

// Get the Replit hostname
const replitHost = process.env.REPL_SLUG && process.env.REPL_OWNER 
  ? `${process.env.REPL_SLUG}.${process.env.REPL_OWNER}.repl.co` 
  : null;

if (replitHost) {
  const expoUrl = `exp://${replitHost}:8081`;
  console.log('\n\n📱 EXPO APP URL:\n');
  console.log(expoUrl);
  console.log('\n📱 SCAN THIS QR CODE WITH YOUR EXPO GO APP:\n');
  qrcode.generate(expoUrl, { small: false });
} else {
  console.log('Could not determine Replit hostname. Make sure you\'re running this in a Replit environment.');
}
