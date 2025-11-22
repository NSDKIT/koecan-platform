interface ExchangePayload {
  userId: string;
  rewardId: string;
  points: number;
  callbackUrl?: string;
}

export async function requestPexExchange(payload: ExchangePayload) {
  const baseUrl = process.env.PEX_API_BASE;
  const apiKey = process.env.PEX_API_KEY;
  if (!baseUrl || !apiKey) {
    console.warn('PEX API is not configured. Skipping actual exchange request.');
    return { success: true, message: 'PEX API未設定のためダミー完了' };
  }

  const response = await fetch(`${baseUrl}/exchange`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${apiKey}`
    },
    body: JSON.stringify({ ...payload, callbackUrl: payload.callbackUrl ?? process.env.PEX_CALLBACK_URL })
  });

  if (!response.ok) {
    const body = await response.text();
    throw new Error(`PEX API error: ${response.status} ${body}`);
  }

  return response.json();
}
