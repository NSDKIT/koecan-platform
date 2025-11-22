interface LineMessagePayload {
  to: string[];
  messages: { type: 'text'; text: string }[];
}

export async function sendLineNotification(payload: LineMessagePayload) {
  const token = process.env.LINE_CHANNEL_ACCESS_TOKEN;
  if (!token) {
    console.warn('LINE channel token not configured; skipping push.');
    return { success: false };
  }

  const response = await fetch('https://api.line.me/v2/bot/message/multicast', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`
    },
    body: JSON.stringify(payload)
  });

  if (!response.ok) {
    const body = await response.text();
    throw new Error(`LINE API error: ${response.status} ${body}`);
  }

  return response.json();
}
