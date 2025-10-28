---
title: "Setting Up Supabase's Local Development Environment with Docker"
description: "A comprehensive guide to setting up Supabase locally with Docker, creating separate development and production environments for professional database workflows and seamless deployment."
pubDate: 2025-10-27
ogImageSrc: "supabase-local.png"
isDraft: true
---

## Table of Contents

## Why and When to Use

Like many, you've probably been so excited to use Supabase that you followed all of their easy to follow guides to get you from 0 to production. They're awesome. But if you're here, you might have realized that there's a problem: everything you do is going _straight_ to production.

When you develop professionally, you usually have at least two seperate environments (one for development, one for production, likely one for staging, etc.).

You'll want to use the local development environment for a few reasons:

1. **Isolated development** - You can make massive changes without needing to make changes to production.
2. **Faster iteration cycles** - No network latency when testing database operations, auth flows, or Edge Functions.
3. **Safe experimentation** - Test destructive operations, schema migrations, and data transformations without risk.
4. **Cost savings** - Avoid using production resources during development, especially important for functions, storage, and bandwidth.
5. **Easier debugging** - Full access to logs, direct database access, and the ability to reset state instantly.

## How We'll Approach This

I've found through some digging on the Supabase subreddit that people are often confused on how to set this up.

And I think that might be because the docs cover _what_ exists and what you can do really well, but I don't know if it gives enough consideration to _where_ you might be coming from.

And this is important because it's one thing to set this environment up _before_ you've set up your production flow, but if you followed the quick-start guides, it's likely you're already pushing to production.

So in a sense, you actually need to take a step back, change some environment variables, and think differently about your environment. This is as much a technical change as it is a shift in mindset. Both are subtle shifts, but as you know, sometimes the subtle shift not made gives you **hours** of confusion and headache.

I'll save you from that!

To make it easier to understand where you'll need to make changes between development and production environment values, I'll build everything from scratch for development first and show you exactly which values you'll need to change for deployment, for both Supabase and Google OAuth, because you'll need to make changes within your auth platform console.

My goal here is to give context (_when_, _why_, _how_) to the docs (_what_) and get you up and running in less than 10 minutes, unconfused.

## What You'll Learn

- How to build a local development environment around a full-stack application
- Which environment variables you need to change between development and production
- How to implement Google OAuth between the two environments

## Prerequisites

- A container runtime compatible with Docker APIs ([Docker](https://docs.docker.com/desktop/), [Rancher Desktop](https://rancherdesktop.io/), [Podman](https://podman.io/), [OrbStack](https://orbstack.dev/))

## Sample Starter Application (Optional)

To make this guide more concrete, I've created a simple React/Express full-stack application for you to start with that can hopefully lend some clarity into implementation with your stack.

If you want to, you can [clone the app from the GitHub repo here](https://github.com/internetdrew/react-express-starter.git) and follow instructions to get the app up and running in development.

> You can skip this section if you already have an application. The environment configuration principles apply to any stack.

## Connecting to Our Supabase Project

To begin, we'll start by connecting a clean app to our Supabase project's production database, then transition to a local development environment.

While this approach may seem backwards from a typical development workflow, it mirrors the path most developers take when following Supabase's quick-start guides.

> You can skip this part if you’re already connected to production. If you cloned the repo I linked to earlier or are starting your project from scratch, this section is for you.

First, lets get out API keys to connect to the Supabase project from [the API Keys section](https://supabase.com/dashboard/project/_/settings/api-keys/).

I'll be using the new API Keys, but the principals of these are the same from an implementation standpoint.

There are essentially two keys available here:

- One is safe to for the browser if you've enabled Row Level Security (RLS), which I believe is on by default
- The other is absolutely **not safe to use in the browser** because if has access to bypass

If you're using Legacy API Keys, those are respectively the anon public key and the service role (secret) key.

If you're using the new API Keys, they're respectively the Publishable key (`sb_...`) and the secret key (`sb_secret_...`)

### Adding Keys as Environment Variables

To protect our keys and not ship them with our code, we can add them as environment variables.

From the root of the app, we can add a `.env` file:

```bash
touch .env
```

Just be sure to include that file in your `.gitignore` file.
In your `.env` file, add three values:

```bash
 # .env
SUPABASE_PUB_KEY=your_public_anon_key
SUPABASE_URL=https://your_supabase_url.supabase.co
SUPABASE_SEC_KEY=your_service_role_or_secret_key
```

### Creating Type-safe Clients

First, we'll start off with our initial types from our Supabase instance. For the stack I created, one where the client and server are in their own directories, I approach this with a third directory for shared things like this.

From the root of the application, make a new directory as a sibling to the `client` and `server` directories:

```bash
mkdir shared
```

Then create a `package.json` file and make it `commonjs` to bridge the gap between the client and server code:

```bash
cd shared && touch package.json
```

```json
{
  "type": "commonjs"
}
```

Then add our types into that shared directory:

```bash
# Replace abcdefghijklmnopqrst with your Supabase project ID
supabase gen types typescript --project-id abcdefghijklmnopqrst > /shared/database.types.ts
```

This will give your client-side and server-side Supabase clients type-safety with your database schema, so if you're missing something or using something you shouldn't be during an operation, it'll flag the usage in your IDE.

Next, let's install the packages we'll be using to create our clients:

In both the client and server directories:

```bash
npm install @supabase/ssr
```

Then we can create our client:

Some people also get tripped up on why they cannot get expected data returned when they successfully connect to their database and they end up having issues with RLS.

There's actually a really simple workaround for this. And to leverage that workaround, we will install this in our `server` directory:

```bash
npm install @supabase/supabase-js
```
