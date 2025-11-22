import { JWT } from 'google-auth-library';

interface PushPayload {
  title: string;
  body: string;
  data?: Record<string, string>;
}

const FCM_SCOPE = 'https://www.googleapis.com/auth/firebase.messaging';
let jwtClient: JWT | null = null;
let cachedToken: { token: string; expiresAt: number } | null = null;

export async function sendPushNotification(tokens: string[], payload: PushPayload) {
  const targetTokens = tokens.filter(Boolean);
  if (!targetTokens.length) {
    console.warn('No FCM tokens provided; skipping push.');
    return { success: false };
  }

  if (hasServiceAccountConfig()) {
    return sendWithHttpV1(targetTokens, payload);
  }

  if (process.env.FCM_SERVER_KEY) {
    return sendWithLegacyKey(targetTokens, payload);
  }

  console.warn('FCM credentials are not configured; skipping push.');
  return { success: false };
}

function hasServiceAccountConfig() {
  return Boolean(process.env.FIREBASE_PROJECT_ID && process.env.FIREBASE_CLIENT_EMAIL && process.env.FIREBASE_PRIVATE_KEY);
}

async function sendWithHttpV1(tokens: string[], payload: PushPayload) {
  const projectId = process.env.FIREBASE_PROJECT_ID!;
  const accessToken = await getAccessToken();
  const endpoint = `https://fcm.googleapis.com/v1/projects/${projectId}/messages:send`;

  await Promise.all(
    tokens.map(async (token) => {
      const response = await fetch(endpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${accessToken}`
        },
        body: JSON.stringify({
          message: {
            token,
            notification: {
              title: payload.title,
              body: payload.body
            },
            data: payload.data ?? {}
          }
        })
      });

      if (!response.ok) {
        const body = await response.text();
        throw new Error(`FCM v1 error: ${response.status} ${body}`);
      }
    })
  );

  return { success: true, count: tokens.length };
}

async function sendWithLegacyKey(tokens: string[], payload: PushPayload) {
  const serverKey = process.env.FCM_SERVER_KEY!;

  const response = await fetch('https://fcm.googleapis.com/fcm/send', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `key=${serverKey}`
    },
    body: JSON.stringify({
      registration_ids: tokens,
      notification: {
        title: payload.title,
        body: payload.body
      },
      data: payload.data ?? {}
    })
  });

  if (!response.ok) {
    const body = await response.text();
    throw new Error(`FCM legacy error: ${response.status} ${body}`);
  }

  return response.json();
}

async function getAccessToken() {
  if (cachedToken && cachedToken.expiresAt > Date.now() + 60_000) {
    return cachedToken.token;
  }

  const client = getJwtClient();
  const { access_token, expiry_date } = await client.authorize();
  if (!access_token) {
    throw new Error('Failed to obtain FCM access token.');
  }

  cachedToken = {
    token: access_token,
    expiresAt: typeof expiry_date === 'number' ? expiry_date : Date.now() + 45 * 1000
  };

  return cachedToken.token;
}

function getJwtClient() {
  if (jwtClient) {
    return jwtClient;
  }

  const clientEmail = process.env.FIREBASE_CLIENT_EMAIL;
  const privateKey = process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n');

  if (!clientEmail || !privateKey) {
    throw new Error('FIREBASE_CLIENT_EMAIL / FIREBASE_PRIVATE_KEY are not configured.');
  }

  jwtClient = new JWT({
    email: clientEmail,
    key: privateKey,
    scopes: [FCM_SCOPE]
  });

  return jwtClient;
}
