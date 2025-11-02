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

> You can skip this section if you already have an application. The environment configuration principles apply to any stack.

To make this guide more concrete, I've created a simple React/Express full-stack application for you to start with that can hopefully lend some clarity into implementation with your stack.

If you want to, you can [clone the app from the GitHub repo here](https://github.com/internetdrew/react-express-starter.git) and follow instructions to get the app up and running in development.

## Connecting to Your Supabase Project

> If you've already connected your project, you can jump down to [setting up the dev environment](#setting-up-the-dev-environment).

To begin, we'll start by connecting a clean app to our Supabase project's production database, then transition to a local development environment.

While this approach may seem backwards from a typical development workflow, it mirrors the path most developers take when following Supabase's quick-start guides.

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
VITE_SUPABASE_KEY=your_public_anon_key
VITE_SUPABASE_URL=https://your_supabase_url.supabase.co
SUPABASE_SECRET_KEY=your_service_role_key
```

> The "Vite" prefix I'm using above is to that the client code can read these values. You can [learn more about that here](https://vite.dev/guide/env-and-mode.html#env-variables). Keep in mind, other frameworks may have similar conventions to make sure you are intentfully allowing client-side code to use these values.

### Adding the Supabase CLI

The Supabase Command-Line Interface (CLI) is what you'll be using to manage all operations within your local development environment. You can install this at the application level if you'd like, but I find it much easier to manage from the operating system level.

You can [choose how you want to go about that here](https://supabase.com/docs/guides/local-development/cli/getting-started#installing-the-supabase-cli).

I'll be moving forward with the macOS approach, but you can adjust for your case.

Open a new terminal window and install:

```bash
brew install supabase/tap/supabase
```

Once installed, we can move on creating our Supabase browser and server clients.

### Creating Type-safe Supabase Clients

The Supabase clients are what we'll use to interact with our backend.

First, we'll start off with our initial types from our Supabase instance. For the stack I created, one where the client and server are in their own directories, I approach this with a third directory for shared things like this because this will allow you the flexibility of being able to use type definitions from your database on either side of your application.

From the root of the application, make a new directory as a sibling to the `client` and `server` directories:

```bash
mkdir shared
```

Then create a `package.json` file within that directory and make it `commonjs` to bridge the gap between the client and server code. Create the file:

```bash
cd shared && touch package.json
```

Then paste this inside of it:

```json
{
  "type": "commonjs"
}
```

Then add our types into that shared directory by generating them from the root directory:

```bash
# Replace abcdefghijklmnopqrst with your Supabase project ID
# You can find the ID in Project Settings -> General
supabase gen types typescript --project-id abcdefghijklmnopqrst > shared/database.types.ts
```

You should now see a new file in your shared directory.

This will give your client-side and server-side Supabase clients type-safety with your database schema, which will make it easy to identify type issues, both when sending data to your backend and when fetching. Whenever you update your database schema, you'll want to run this code again.

To avoid headaches, you might want to just create a script to run it. That's what I do and it makes updates far less of a headache.

Next, let's install the packages we'll be using to create our clients:

In both the `client` and `server` directories:

```bash
npm install @supabase/ssr
```

The `ssr` package makes it really easy for us to keep auth simple and well connected between the client and server code.

### Setting Up the Browser Client

Let's change directory to the client directory and create a new sub-directory for utils:

```bash
cd client
```

```bash
# You want this within your src directory, otherwise you'll get issues with your env variables
mkdir src/utils
```

Then create the file:

```bash
touch src/utils/supabase.ts
```

Within that file:

```typescript
// Be sure to double check this import path if you deviate.
import type { Database } from "../../../shared/database.types";
import { createBrowserClient } from "@supabase/ssr";

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseKey = import.meta.env.VITE_SUPABASE_KEY;

if (!supabaseUrl || !supabaseKey) {
  throw new Error("Missing Supabase environment variables");
}

// Because we imported our database types, we can provide type safety to the browser client
export const supabaseBrowserClient = createBrowserClient<Database>(
  supabaseUrl,
  supabaseKey,
);
```

### Setting up the Server Client

Because I'm using a Node backend, I'll be using `dotenv` and `path` to access my environment variables. I also create my client appropriately for this framework. You can [learn how to setup different implementations across Next.js, SvelteKit, and more here in the docs](https://supabase.com/docs/guides/auth/server-side/creating-a-client?queryGroups=package-manager&package-manager=npm&queryGroups=framework&framework=express&queryGroups=environment&environment=middleware#create-a-client).

First, let's install `dotenv` and the `@supabase/supabase-js` package in the server directory:

```bash
npm i dotenv @supabase/supabase-js
```

From the file we're about to create, we're exporting two clients:

The first is the server client that will make it easy for us to manage authentication across the stack with ease, which is great for user based access.

The second is an admin client. The reason for the admin client is due to a situation many people run into when first encountering Row-Level Security (RLS.) You can [read all about Row-Level Security with Supabase here](https://supabase.com/docs/guides/database/postgres/row-level-security).

In short, RLS makes your database handle “who can see or change what” automatically at query time. Every request runs as the user who made it, which is great for normal app reads and writes. But for trusted stuff—like seed scripts, migrations, admin dashboards, or batch jobs, writing detailed policies for every case can get messy fast.

That’s where the admin client comes in. It uses a service key that bypasses RLS, so your server can do privileged work while the rest of your app still gets all the benefits of RLS by default. The important thing to remember here is that, by bypassing, it means your access logic needs to happen at the application (not database) level, so map out your access properly because this is like having keys to the entire building.

**Only use the admin client on the server and never ship its secret key to the browser.**

In the server's `src` directory, create a new `utils` directory and add a `supabase.ts` file in it.

Within that file:

```typescript
import { createServerClient, serializeCookieHeader } from "@supabase/ssr";
import { createClient } from "@supabase/supabase-js";
import { Request, Response } from "express";
import type { Database } from "../../../shared/database.types";
import dotenv from "dotenv";
import path from "path";

const baseDir: string =
  typeof __dirname !== "undefined" ? __dirname : process.cwd();

dotenv.config({ path: path.resolve(baseDir, "../.env") });

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseKey = process.env.VITE_SUPABASE_KEY;

if (!supabaseUrl || !supabaseKey) {
  throw new Error("Missing Supabase environment variables");
}

export const createServerSupabaseClient = (req: Request, res: Response) => {
  // Sidenote: I've never gotten parseCookieHeader to work for me,
  // which is why this deviates from the docs a bit for getAll
  return createServerClient<Database>(supabaseUrl, supabaseKey, {
    cookies: {
      getAll() {
        return Object.keys(req.cookies).map((name) => ({
          name,
          value: req.cookies[name] || "",
        }));
      },
      setAll(cookiesToSet) {
        cookiesToSet.forEach(({ name, value, options }) =>
          res.appendHeader(
            "Set-Cookie",
            serializeCookieHeader(name, value, options),
          ),
        );
      },
    },
  });
};

const supabaseAdminKey = process.env.SUPABASE_SECRET_KEY;

if (!supabaseAdminKey) {
  throw new Error("Missing Supabase admin key");
}

export const supabaseAdminClient = createClient<Database>(
  supabaseUrl,
  supabaseAdminKey,
);
```

> If you get a root directory TypeScript warning, open up your server directory's `tsconfig.json` file and change your rootDir from `.` to `..`, which tells it to start from one level up, which is where the shared directory is. I'm not sure if this is the ideal way to do this, so use your discretion.

With that, we should be set up to use Supabase within our application. Now let's move on to the parts that trip people up.

## Setting Up the Dev Environment

I'll be using Docker for this, but the flow should be about the same for your respective container runtime.

First, let's open up Docker:

```bash
open -a docker
```

Once Docker is running, go to the root of your project and enter this into your terminal:

```bash
supabase init
```

This should create a new directory for you named `supabase`. You should also see a prompt for setting up VS Code/IntelliJ setting for Deno. You can choose what you'd like, but I usually choose no because I've never needed Deno, but you might.

The next step is to get the container running. You can do that by running `supabase start`. Sometimes, this can be unpredictable. My advice if you do everything right and it shuts the container down, just run the command again. Sometimes, I've had to run `supabase start` multiple times to get it working as intended.

After initial downloads, you should see a container with your project directory name in Docker. This could take a while, especially on the first run, but you'll know things are fully set up when you see this:

```bash
Started supabase local development setup.

API URL: http://127.0.0.1:54321
GraphQL URL: http://127.0.0.1:54321/graphql/v1
S3 Storage URL: http://127.0.0.1:54321/storage/v1/s3
MCP URL: http://127.0.0.1:54321/mcp
Database URL: postgresql://postgres:postgres@127.0.0.1:54322/postgres
Studio URL: http://127.0.0.1:54323
Mailpit URL: http://127.0.0.1:54324
Publishable key: sb_publishable_ACJWlzQHlZjBrEguHvfOxg_3BJgxAaH
Secret key: sb_secret_N7UND0UgjKTVK-Uodkm0Hg_xSvEMPvz
S3 Access Key: 625729a08b95bf1b7ff351a663f3a23c
S3 Secret Key: 850181e4652dd023b7a98c58ae0d2d34bd487ee0cc3254aed6eda37307425907
S3 Region: local
```

In order to complete our connection, we'll need to update our key values in our `.env` file.

```bash
# VITE_SUPABASE_KEY=your_public_anon_key
# VITE_SUPABASE_URL=https://your_supabase_url.supabase.co
# SUPABASE_SECRET_KEY=your_service_role_key

VITE_SUPABASE_KEY=sb_publishable_ACJWlzQHlZjBrEguHvfOxg_3BJgxAaH
VITE_SUPABASE_URL=https://your_supabase_url.supabase.co
SUPABASE_SECRET_KEY=sb_secret_N7UND0UgjKTVK-Uodkm0Hg_xSvEMPvz
```

The values that are commented out? Those are your production values and should be added to your production environment. You'll no longer be using those in development.

And that should complete the initial setup to get you up and running.

But before we move on, here's a quick recap of what just happened.

When you ran `supabase start`, Docker spun up a few containers, each running a part of Supabase.

You’ve got:

- A Postgres database at http://127.0.0.1:54322
- Supabase’s API and auth layers handling logins, permissions, and storage
- Studio at http://127.0.0.1:54323 where you can click around your data like a pro
- And Mailpit, so you can test emails without spamming real inboxes

Think of it like this: your computer is now hosting a full Supabase stack. You can create tables, experiment with policies, and break stuff without breaking production.

To make sure things are running well, you might want to restart your client and server code. If you navigate to http://127.0.0.1:54323, you should see a Supabase studio setup that looks like your production environment but without the data you already added to production.

This brings us to the first task, pulling our table schemas from the production environment into our development environment.

## Pulling Production Schemas into Local Dev

In order for us to pull our schemas from the production environment, since that's where we started, we need to first link our local environment to our production environment.

In your project root directory:

```bash
supabase login
```

Just follow the prompts, enter your verification code, and you should be in.

Next, we need to link our local environment with our project. To do that, enter in your terminal:

```bash
# Replace <project-id> with your actual project ID from: https://supabase.com/dashboard/project/<project-id>
supabase link --project-ref <project-id>
# You can get <project-id> from your project's dashboard URL:
```

Then you can pull your database:

```bash
supabase db pull
```

You might be met here with a warning:

```bash
The remote database's migration history does not match local files in supabase/migrations directory.
```

If so, you should run the suggested migration repairs **one at a time**, that way you can easily isolate any issues.

If you run into issues here with connections, I'd suggest running `supabase stop` and `supabase start` again.

-> Pick up from here <-

## Troubleshooting

Many of the issues I've run into when using the local development environment have been with the CLI. Some issues are clearly logged and others can be a bit difficult to debug. I'll keep a running list of issues I've run into with what worked for me to solve them.

### Issues Getting the Container to Start

The most common issue I've run into has been failed starts due to the _analytics_ container being unhealthy. If your issues are from there (run your command with the `--debug` flag and take a look at the logs or share them with an LLM to find the cause), you can also start without that or any other container by using the `--exclude` flag:

```bash
supabase start --exclude logflare
```

If you run into issues with your containers not running (or starting and stopping back-to-back), one of the things I've done to start over is to stop and remove the containers and the volumes holding their backup data.

This sets you back to pre-container, so you'll be rebuilding the container from scratch, but you shouldn't have to worry about losing any data because that is all in your code.

To remove the containers:

```bash
# Replace your-project-name with the name of your project directory
docker stop $(docker ps -aq --filter label=com.supabase.cli.project=your-project-name)
docker rm $(docker ps -aq --filter label=com.supabase.cli.project=your-project-name)
```

To remove the volumes:

```bash
docker volume rm $(docker volume ls -q --filter label=com.supabase.cli.project=your-project-name)
```

From there, you should be able to get things up and running via `supabase start`.

Also ran into some issues I think are because of this:

```bash
Update your supabase/config.toml to fix it:
[db]
major_version = 15
```
