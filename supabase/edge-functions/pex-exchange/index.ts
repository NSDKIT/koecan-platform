import 'jsr:@supabase/functions-js/edge-runtime.d.ts';

declare const Deno: {
  serve: (handler: (req: Request) => Response | Promise<Response>) => void;
  env: {
    get: (key: string) => string | undefined;
  };
};

Deno.serve(async (req) => {
  const { userId, rewardId, points } = await req.json();
  if (!userId || !rewardId || !points) {
    return new Response(JSON.stringify({ error: 'Invalid payload' }), { status: 400 });
  }

  const apiBase = Deno.env.get('PEX_API_BASE');
  const apiKey = Deno.env.get('PEX_API_KEY');

  if (!apiBase || !apiKey) {
    return new Response(JSON.stringify({ message: 'PEX API is not configured' }), { status: 200 });
  }

  const response = await fetch(`${apiBase}/exchange`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${apiKey}`
    },
    body: JSON.stringify({ userId, rewardId, points, callbackUrl: Deno.env.get('PEX_CALLBACK_URL') })
  });

  if (!response.ok) {
    return new Response(await response.text(), { status: response.status });
  }

  return new Response(await response.text(), { status: 200 });
});
