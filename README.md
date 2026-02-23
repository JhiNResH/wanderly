# Wanderly ✨

> Save anything, understand everything. AI-powered content curator for iOS.

Share links from Instagram, YouTube, TikTok, 小紅書, or any webpage — Wanderly extracts key info, summarizes with Claude AI, and organizes into smart collections.

## Features

- 📱 **iOS native app** (Expo + React Native)
- 🔗 **Share Extension** — save from any app with iOS Share button
- 🤖 **Claude AI** — auto-summarization, key points, smart categorization
- 📊 **Auto-collections** — content organized by topic automatically
- 🎬 **YouTube transcripts** — full transcript extraction + summary
- 🌏 **Multi-platform** — YouTube, Instagram, TikTok, 抖音, 小紅書, web
- 🌙 **Dark mode** support
- ⚡ **Real-time sync** via Supabase

## Tech Stack

| Layer | Tech |
|-------|------|
| Mobile | Expo SDK 52, React Native, TypeScript |
| Navigation | expo-router (file-based) |
| Backend | Supabase (PostgreSQL + Realtime) |
| AI | Anthropic Claude 3.5 Haiku |
| iOS Extension | Swift (Share Extension) |
| Serverless | Vercel (Telegram bot, content processing) |

## Screens

```
(tabs)/
  index      → Home: Recent saves feed
  collections → Collections grid (旅遊, 美食, 攝影, 開發, 健身...)
  add        → Manual URL input

/item/[id]        → Item detail: summary, key points, full content
/collection/[id]  → Collection detail: all items in collection
```

## Getting Started

### 1. Install dependencies

```bash
npm install
```

### 2. Configure environment

```bash
cp .env.example .env
# Fill in Supabase URL + anon key
```

### 3. Set up Supabase

Run `supabase/schema.sql` in your Supabase SQL editor.

### 4. Start

```bash
npx expo start --ios
```

## iOS Share Extension Setup

See [`ios/ShareExtension/README.md`](ios/ShareExtension/README.md) for full Xcode setup instructions.

**TL;DR:**
1. Run `npx expo prebuild` to generate the `ios/` Xcode project
2. Add a new Share Extension target in Xcode
3. Replace with files from `ios/ShareExtension/`
4. Configure App Group: `group.com.wanderly.app`

## Architecture

```
┌─────────────────────────────────────────────────┐
│              iOS Device                          │
│  ┌───────────┐     ┌──────────────────────────┐ │
│  │   Share   │────▶│       Wanderly App        │ │
│  │ Extension │     │  (Expo + React Native)    │ │
│  │  (Swift)  │     │                          │ │
│  └───────────┘     │  Home / Collections /    │ │
│   App Group        │  Add / Item Detail        │ │
│   UserDefaults     └───────────┬──────────────┘ │
└───────────────────────────────┼─────────────────┘
                                │
                    ┌───────────▼───────────┐
                    │      Supabase         │
                    │  (PostgreSQL +        │
                    │   Realtime)           │
                    └───────────┬───────────┘
                                │
                    ┌───────────▼───────────┐
                    │   Vercel Functions    │
                    │  (Content Processing) │
                    │  Claude AI + YouTube  │
                    └───────────────────────┘
```

## Supported Platforms

| Platform | URL Detection | Transcript | Thumbnail |
|----------|--------------|------------|-----------|
| YouTube | ✅ | ✅ via oEmbed | ✅ |
| Instagram | ✅ | ❌ | Limited |
| TikTok | ✅ | ❌ | ✅ via oEmbed |
| 小紅書 | ✅ | ❌ | ❌ (no public API) |
| Any web page | ✅ | ❌ | ✅ via og:image |

## Legacy

The original Next.js web version is preserved at branch [`legacy/nextjs`](https://github.com/JhiNResH/wanderly/tree/legacy/nextjs).

---

Built with ❤️ by Jensen (Claude Code subagent)
