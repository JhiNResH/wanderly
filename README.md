# 🗺️ Wanderly

**Save anything. Organize everything. AI does the heavy lifting.**

Wanderly is an AI-powered content curator. Send URLs to a Telegram bot, and it automatically extracts content (YouTube transcripts, articles), summarizes them with Claude, auto-categorizes into collections, and displays everything in a clean web dashboard.

---

## ✨ Features

- 📱 **Telegram Bot** – Send any URL; bot acknowledges and processes in real-time
- ▶️ **YouTube Extraction** – Fetches transcripts automatically
- 🤖 **Claude AI Analysis** – Summarizes content, extracts key points
- 🏷️ **Auto-Categorization** – Detects travel, cooking, photography, fitness, dev, etc.
- 📚 **Collections** – Items auto-grouped into smart collections
- 🌐 **Web Dashboard** – Browse all collections and items
- 🗄️ **Supabase Storage** – Persistent database with full data model

---

## 🚀 Quick Start

### 1. Clone & Install

```bash
git clone https://github.com/JhiNResH/wanderly.git
cd wanderly
npm install
```

### 2. Set Up Environment Variables

```bash
cp .env.example .env.local
```

Fill in `.env.local`:

| Variable | Description |
|----------|-------------|
| `TELEGRAM_BOT_TOKEN` | From [@BotFather](https://t.me/BotFather) |
| `ANTHROPIC_API_KEY` | From [console.anthropic.com](https://console.anthropic.com) |
| `NEXT_PUBLIC_SUPABASE_URL` | Your Supabase project URL |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Supabase anon key |
| `SUPABASE_SERVICE_ROLE_KEY` | Supabase service role key |
| `NEXT_PUBLIC_APP_URL` | Your deployed URL (e.g. `https://wanderly.vercel.app`) |

### 3. Set Up Supabase

Run the schema in your Supabase SQL editor:

```sql
-- See supabase/schema.sql
```

Or paste the contents of `supabase/schema.sql` directly.

### 4. Run Locally

```bash
npm run dev
```

Visit [http://localhost:3000](http://localhost:3000)

### 5. Set Up Telegram Webhook

After deploying (or using [ngrok](https://ngrok.com) for local dev):

```bash
# Replace with your token prefix (first 10 chars)
curl "https://your-app.vercel.app/api/webhook?secret=YOUR_TOKEN_PREFIX"
```

Or using ngrok locally:
```bash
ngrok http 3000
# Then hit: https://YOUR_NGROK_URL/api/webhook?secret=YOUR_TOKEN_PREFIX
```

---

## 📁 Project Structure

```
wanderly/
├── app/
│   ├── layout.tsx              # Root layout with nav
│   ├── page.tsx                # Collections dashboard
│   ├── items/
│   │   └── page.tsx            # All items view
│   ├── collections/
│   │   └── [id]/page.tsx       # Collection detail view
│   └── api/
│       ├── webhook/route.ts    # Telegram bot webhook
│       ├── collections/route.ts
│       └── items/route.ts      # Save URL via API
├── lib/
│   ├── bot.ts                  # Telegram bot (grammy)
│   ├── claude.ts               # Claude AI integration
│   ├── youtube.ts              # YouTube transcript extraction
│   ├── processor.ts            # URL processing pipeline
│   └── supabase.ts             # Database client + queries
├── types/
│   └── index.ts                # TypeScript types
├── supabase/
│   └── schema.sql              # Database schema
└── .env.example
```

---

## 🤖 How It Works

```
User sends URL to Telegram bot
         ↓
Bot acknowledges immediately
         ↓
Platform detected (YouTube/Twitter/Web/etc.)
         ↓
Content extracted (YouTube transcript / metadata)
         ↓
Claude AI: Summarize + extract key points
         ↓
Claude AI: Categorize + suggest collection name
         ↓
Save to Supabase (Item + Collection)
         ↓
Bot replies with title, summary, tags
         ↓
Viewable on web dashboard
```

---

## 🛠️ Tech Stack

| Layer | Tech |
|-------|------|
| Framework | Next.js 14 (App Router) |
| Language | TypeScript |
| Styling | Tailwind CSS |
| Bot | grammy (Telegram Bot API) |
| AI | Anthropic Claude (claude-3-5-haiku) |
| Transcripts | youtube-transcript |
| Database | Supabase (PostgreSQL) |
| Deploy | Vercel |

---

## 📊 Data Model

### Collection
| Field | Type | Description |
|-------|------|-------------|
| id | UUID | Primary key |
| name | TEXT | e.g. "Japan Travel", "Pasta Recipes" |
| category | TEXT | travel / cooking / dev / etc. |
| created_at | TIMESTAMPTZ | Auto-set |

### Item
| Field | Type | Description |
|-------|------|-------------|
| id | UUID | Primary key |
| url | TEXT | Original URL |
| platform | TEXT | youtube / twitter / web / etc. |
| title | TEXT | AI-generated title |
| summary | TEXT | 2-3 sentence AI summary |
| extracted_content | TEXT | Full transcript or key points |
| category | TEXT | AI-detected category |
| tags | TEXT[] | AI-generated tags |
| collection_id | UUID | FK → collections |
| created_at | TIMESTAMPTZ | Auto-set |

---

## 🚢 Deploy to Vercel

```bash
npx vercel --prod
```

Add all environment variables in the Vercel dashboard.

---

## 📝 License

MIT — built with ❤️ by [@JhiNResH](https://github.com/JhiNResH)
