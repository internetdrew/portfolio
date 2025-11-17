import { defineConfig } from "astro/config";
import remarkToc from "remark-toc";
import rehypeAutolinkHeadings from "rehype-autolink-headings";
import rehypeSlug from "rehype-slug";
import react from "@astrojs/react";
import sitemap from "@astrojs/sitemap";
import tailwindcss from "@tailwindcss/vite";

// https://astro.build/config
export default defineConfig({
  site: "https://www.internetdrew.com/",
  integrations: [
    react(),
    sitemap({
      filter: (page) => !page.startsWith("https://www.internetdrew.com/hello/"),
    }),
  ],
  vite: { plugins: [tailwindcss()] },
  markdown: {
    remarkPlugins: [[remarkToc, { tight: true, maxDepth: 3 }]],
    rehypePlugins: [
      rehypeSlug,
      [rehypeAutolinkHeadings, { behavior: "append" }],
    ],
    shikiConfig: {
      wrap: true,
      langs: ["tsx", "typescript", "javascript", "json", "css", "html"],
    },
  },
});
