---
title: "Building a Fast, Lean Stack with React and Express"
description: "Quickly go from 0 to 1 building a lightweight stack that provides speed, great tooling, and eliminates the black-box nature of meta-frameworks."
pubDate: 2025-10-12
ogImageSrc: "react-express-og.png"
isDraft: true
videoUrl: "https://www.youtube.com/watch?v=xgopQxHIs0o"
---

## Table of Contents

## Why React + Express

I like using React and Express because they let you build bloat-free full-stack applications that stay lightweight and fast.

The biggest value for me is having full control and transparency, without the black-box behavior you often get from meta-frameworks. After spending over a year with Next.js, I went back to this base setup for a few reasons:

1. I ran into several cases where framework abstractions made standard web tasks surprisingly difficult.
2. Those abstractions can hide how things actually work, which slows down learning for newer developers.
3. I find this setup to be dramatically faster to develop with, especially for smaller or early-stage projects.

That doesn’t make meta-frameworks bad. They just do more of the driving for you. Sometimes that’s great. But sometimes it hides too much.

## What You'll Learn

- How to create a simple full-stack application with React (via Vite) and Express
- How to connect your API layer through Vite’s proxy server in a clean, semantically-friendly way

## Prerequisites

- [Node.js](https://nodejs.org/en/download) (at the time of writing this, the Long Term Support (LTS) version of Node.js is v22.20.0)

## Scaffolding the Codebase

To start off, we'll start by scaffolding our directories.

First, let's start by opening your terminal and creating your directory:

```bash
mkdir react-express
```

Now we can change our current directory and make the client and server directories:

```bash
cd react-express && mkdir client server
```

Once we have this, we can create our application with clear separation. First, we'll create the React-based front-end of our application.

## Creating the Client

To build the React front-end, we'll be using a [Vite, a fast, lightweight build tool](https://vite.dev/guide/). If you normally use `create-react-app`, I strongly encourage you to [use something else due to its deprecation](https://react.dev/blog/2025/02/14/sunsetting-create-react-app).

In our client directory:

```bash
npm create vite@latest .
```

Follow the prompt to install and, when prompted to select a framework, choose React then select your variant. Since I work primarily with TypeScript, I usually choose TypeScript + [SWC](https://swc.rs/) (a fast, Rust-based compiler).

At the time of writing this, `rolldown-vite` is experimental, so I'm opting out of that.

When prompted to install npm and start now, choose yes.

Doing so should install everything you need. You should now be able to visit [http://localhost:5173](http://localhost:5173/) to see the current front-end.

## Creating the Server

To build out our server, we will be using a handful of tools:

- [Express.js](https://expressjs.com/) (server framework)
- [nodemon](https://www.npmjs.com/package/nodemon) (for hot refreshes when we make changes to our server code)
- [ts-node](https://github.com/TypeStrong/ts-node) (to execute our TypeScript files)
- [TypeScript](https://www.typescriptlang.org/) (we'll install at the project level)

We'll start by installing Express:

```bash
npm install express --save
```

Then we can install nodemon, ts-node, and TypeScript as dev dependencies:

```bash
npm install -D nodemon ts-node typescript
```

To scaffold our server code, we'll create a `src` directory to house all of our source code and create our main server file:

```bash
mkdir src && touch src/index.ts
```

With that file, we can now write our server code:

```typescript
import express from "express";

const app = express();
const port = 3000;

app.get("/", (req, res) => {
  res.send("Hello World!");
});

app.listen(port, () => {
  console.log(`Server is running at http://localhost:${port}`);
});
```

If you get the `Could not find a declaration file for module 'express'.` error, you just need to install types for Express to get your IDE settled. In your terminal:

```bash
npm i --save-dev @types/express
```

Now that we wrote out our server code, we need a script to run it. Right now, you might have this in your `package.json` file:

```json
{
  "devDependencies": {
    "nodemon": "^3.1.10",
    "ts-node": "^10.9.2",
    "typescript": "^5.9.3"
  }
}
```

To run our development server, we need to add `scripts` to the json object. Once we add that dev script, we should have this:

```json
{
  "scripts": {
    "dev": "nodemon --watch 'src/**/*.ts' --exec 'ts-node' src/index.ts"
  },
  "devDependencies": {
    "nodemon": "^3.1.10",
    "ts-node": "^10.9.2",
    "typescript": "^5.9.3"
  }
}
```

This script in a nutshell:

1. Use nodemon to watch for changes to TypeScript (.ts) files throughout the `src` directory.
2. Whenever changes are made, run `ts-node` to execute the code in `src/index.ts`

By doing this, we make sure our server automatically restarts when we make changes. Without this, every time we make a change to the code, we would have to manually kill the server and bring it back up again for the changes to take effect.

You don't want those problems.

Before we can run that script, we need one last file, our TypeScript config file. Without this, you'll get a message about `.ts` being an unknown file type:

```bash
touch tsconfig.json
```

Once we have the file, we can paste in a simple config:

```json
{
  "compilerOptions": {
    "target": "ES2020",
    "module": "commonjs",
    "outDir": "./dist",
    "rootDir": ".",
    "strict": true,
    "esModuleInterop": true,
    "skipLibCheck": true,
    "forceConsistentCasingInFileNames": true
  },
  "include": ["src/**/*"],
  "exclude": ["node_modules"]
}
```

With that, we should now be able to run `npm run dev` and get our server running on [http://localhost:3000](http://localhost:3000/). If you open it in your browser, you should see `Hello World!`.

## Allowing Cross Origin Resource Sharing

Let's update our server code so that we have a `/hello` endpoint. In `/server/src/index.ts` we can update our original endpoint to return a JSON object with our message:

```typescript
app.get("/hello", (req, res) => {
  res.json({ message: "Hello World!" });
});
```

Typically, to get your data from this endpoint, you might reach for your backend like this (feel free to navigate and add this to your `/client/src/App.tsx` file):

```typescript
useEffect(() => {
  (async () => {
    const response = await fetch("http://localhost:3000/hello");
    const data = await response.json();
    console.log(data);
  })();
}, []);
```

If you look in your browser's console (right-click, hit inspect, go to console) you _might_ see this message:

```bash
Access to fetch at 'http://localhost:3000/hello' from origin 'http://localhost:5173' has been blocked by CORS policy: No 'Access-Control-Allow-Origin' header is present on the requested resource.
```

We get this message as a result of [Cross-Origin Resource Sharing (CORS)](https://developer.mozilla.org/en-US/docs/Web/HTTP/Guides/CORS#what_requests_use_cors), which you might want to take a look at if you're not familiar.

In short, it means we are trying to get resources from one site from another, which can be a major vulnerability. To enable us to reach this, we'll need to allow that origin. That's where the `cors` package comes in.

In the `server` directory:

```bash
npm i cors
```

```bash
npm i --save-dev @types/cors
```

Then in our `src/index.ts` file we can update our code with the import and usage:

```typescript
import express from "express";
import cors from "cors";

const app = express();
const port = 3000;

app.use(
  cors({
    origin: "http://localhost:5173",
  }),
);

app.get("/hello", (req, res) => {
  res.json({ message: "Hello World!" });
});

app.listen(port, () => {
  console.log(`Server is running at http://localhost:${port}`);
});
```

The most important thing here with using `cors` is to make sure you use it before your first route.

If you look back in your browser console, you should now see your JSON object with your message.

## Adding a Server Proxy

This is not a necessary piece, but I do find that it adds a nice little touch to my apps and makes my API routes a bit cleaner.

Right now, we are calling our backend by listing out the entire port address:

```typescript
const response = await fetch("http://localhost:3000/hello");
```

But I love being able to just do this, instead:

```typescript
const response = await fetch("/api/hello");
```

That way, when I write `/api`, my fetches automatically get routed to the server. Here's how we do that with Vite.

In our `vite.config.ts` file, we can add a server proxy like this:

```typescript
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    proxy: {
      "/api": {
        target: "http://localhost:3000",
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api/, ""),
      },
    },
  },
});
```

Here's what each part does:

- **target**: Where to send the request (our Express server on port 3000)
- **changeOrigin**: Tells the proxy to pretend the request is coming from the target server instead of your React app. This prevents CORS issues and makes the Express server think the request originated from `localhost:3000` rather than `localhost:5173`.
- **rewrite**: Removes `/api` from the URL before sending it to the Express server. So when you call `/api/hello` from React, it gets rewritten to just `/hello` when it reaches Express (which matches our actual route).

Think of it like a forwarding service: when your React app says "send this to `/api/hello`", the proxy says "I'll forward this to the Express server, but I'll change the address to just `/hello` and make it look like it came from the right place."

And just like that, we've now set up a basic full-stack React + Express application. From here, the sky's the limit, and I'll be following with more tutorials to get you from 0 to 1 with some popular tools you'll love.
