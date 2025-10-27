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

I've found through some digging on the Supabase subreddit that people are often confused on how to set this up. And I think that might be because the docs cover _what_ exists and what you can do really well, but I don't know if it gives enough consideration to _where_ you might be coming from.

And this is important because it's one thing to set this environment up _before_ you've set up your production flow, but if you followed the quick-start guides, it's likely you're already pushing to production. So in a sense, you actually need to take a step back, change some environment variables, and think differently about your environment. This is as much a technical change as it is a shift in mindset.

That said, we will be approaching this from what seems to be the most common scenario:

- You're pushing to production already and
- You want to be able to safely make changes and test them in an isolated environment and, when things are safe, ship those changes to production

My goal here is to give context (_when_, _why_, _how_) to the docs (_what_).

## What You'll Learn

- How to build a local development environment around a full-stack application
- Which environment variables you need to change between development and production
- How to implement Google OAuth between the two environments

## Prerequisites

- A container runtime compatible with Docker APIs ([Docker](https://docs.docker.com/desktop/), [Rancher Desktop](https://rancherdesktop.io/), [Podman](https://podman.io/), [OrbStack](https://orbstack.dev/))

## Sample Starter Application (Optional)

To make this guide more concrete, I've created a simple React/Express full-stack application that can hopefully lend some clarity into implementation with your stack.

> You can skip this section if you already have an application. The environment configuration principles apply to any stack.
