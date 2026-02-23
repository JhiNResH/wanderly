import { NextRequest, NextResponse } from 'next/server';
import { getBot, handleWebhook } from '@/lib/bot';

export const dynamic = 'force-dynamic';

export async function POST(req: NextRequest) {
  try {
    const bot = getBot();
    const handler = handleWebhook(bot);
    return handler(req);
  } catch (err) {
    console.error('Webhook error:', err);
    return NextResponse.json({ error: 'Webhook error' }, { status: 500 });
  }
}

// Endpoint to set the webhook URL
export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const secret = searchParams.get('secret');

  // Simple auth: require a secret param matching bot token prefix
  if (!secret || secret !== process.env.TELEGRAM_BOT_TOKEN?.slice(0, 10)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const webhookUrl = `${process.env.NEXT_PUBLIC_APP_URL}/api/webhook`;
  const bot = getBot();
  await bot.api.setWebhook(webhookUrl);

  return NextResponse.json({ ok: true, webhook: webhookUrl });
}
