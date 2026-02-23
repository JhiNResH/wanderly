import { Bot, webhookCallback } from 'grammy';
import { processUrl } from './processor';
import { isValidUrl } from './youtube';

let botInstance: Bot | null = null;

export function getBot(): Bot {
  if (!botInstance) {
    const token = process.env.TELEGRAM_BOT_TOKEN;
    if (!token) throw new Error('TELEGRAM_BOT_TOKEN is not set');
    botInstance = new Bot(token);
    setupBotHandlers(botInstance);
  }
  return botInstance;
}

function setupBotHandlers(bot: Bot) {
  // Start command
  bot.command('start', async (ctx) => {
    await ctx.reply(
      `👋 Welcome to *Wanderly*! 🗺️\n\n` +
      `I help you save and organize content from anywhere.\n\n` +
      `*How to use:*\n` +
      `• Send me any URL (YouTube, articles, etc.)\n` +
      `• I'll extract, summarize, and categorize it\n` +
      `• View your saved content at ${process.env.NEXT_PUBLIC_APP_URL}\n\n` +
      `Try sending a YouTube URL!`,
      { parse_mode: 'Markdown' }
    );
  });

  // Help command
  bot.command('help', async (ctx) => {
    await ctx.reply(
      `*Wanderly Bot Commands:*\n\n` +
      `• Send any URL → auto-save & categorize\n` +
      `/start — Welcome message\n` +
      `/help — This message\n\n` +
      `*Supported platforms:*\n` +
      `YouTube, Twitter/X, Instagram, Reddit, Articles & more`,
      { parse_mode: 'Markdown' }
    );
  });

  // Handle messages with URLs
  bot.on('message:text', async (ctx) => {
    const text = ctx.message.text.trim();

    // Check if the text is a URL
    if (!isValidUrl(text)) {
      await ctx.reply(
        `Please send me a valid URL to save! 🔗\n\nExample: https://www.youtube.com/watch?v=...`
      );
      return;
    }

    // Acknowledge immediately
    await ctx.reply(
      `⏳ Got it! Processing your link...\n\n${text}`,
      { parse_mode: 'Markdown' }
    );

    try {
      const item = await processUrl(text);

      await ctx.reply(
        `✅ *Saved!*\n\n` +
        `📌 *${item.title}*\n` +
        `📂 Category: ${item.category}\n` +
        `🏷️ Tags: ${item.tags.length > 0 ? item.tags.join(', ') : 'none'}\n\n` +
        `📝 *Summary:*\n${item.summary}\n\n` +
        `View all items: ${process.env.NEXT_PUBLIC_APP_URL}`,
        { parse_mode: 'Markdown' }
      );
    } catch (err) {
      console.error('Error processing URL:', err);
      await ctx.reply(
        `❌ Sorry, I couldn't process that URL.\n\n` +
        `Error: ${err instanceof Error ? err.message : 'Unknown error'}`
      );
    }
  });
}

export const handleWebhook = (bot: Bot) => webhookCallback(bot, 'std/http');
