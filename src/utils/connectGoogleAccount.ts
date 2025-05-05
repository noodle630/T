import fs from 'fs';
import path from 'path';
import readline from 'readline';
import { google } from 'googleapis';
import open from 'open';

const SCOPES = ['https://www.googleapis.com/auth/calendar.readonly'];
const TOKEN_PATH = path.join(process.cwd(), 'token.json');
const CREDENTIALS_PATH = path.join(process.cwd(), 'credentials.json');

function askQuestion(query: string): Promise<string> {
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
  });
  return new Promise((resolve) => rl.question(query, (ans) => {
    rl.close();
    resolve(ans);
  }));
}

async function saveCredentials(client: any) {
  const content = await fs.promises.readFile(CREDENTIALS_PATH, 'utf8');
  const keys = JSON.parse(content).installed;
  const payload = JSON.stringify({
    type: 'authorized_user',
    client_id: keys.client_id,
    client_secret: keys.client_secret,
    refresh_token: client.credentials.refresh_token,
  });
  await fs.promises.writeFile(TOKEN_PATH, payload);
}

async function authorize() {
  const content = await fs.promises.readFile(CREDENTIALS_PATH, 'utf8');
  const keys = JSON.parse(content).installed;

  const oAuth2Client = new google.auth.OAuth2(
    keys.client_id,
    keys.client_secret,
    keys.redirect_uris[0]
  );

  const authUrl = oAuth2Client.generateAuthUrl({
    access_type: 'offline',
    scope: SCOPES,
  });

  console.log('🌍 Opening browser for Google login...');
  console.log('🔗 If it doesn’t open, paste this URL manually:\n', authUrl);

  try {
    await open(authUrl, { wait: false });
    console.log('🧭 Browser open attempted');
  } catch (err) {
    console.error('❌ Could not auto-open browser:', err);
  }

  const code = await askQuestion('🔐 Paste the code from the browser here: ');
  const { tokens } = await oAuth2Client.getToken(code);
  oAuth2Client.setCredentials(tokens);

  await saveCredentials(oAuth2Client);
  console.log('💾 Token saved to', TOKEN_PATH);

  return oAuth2Client;
}

authorize().catch(console.error);
