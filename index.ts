import html from "./index.html" with { type: "file" };
import recipeParser from "./recipes";

const server = Bun.serve({
  async fetch({ url }) {
    const path = new URL(url).pathname;

    if (path === "/") {
      return new Response(Bun.file(html));
    }

    if (path === "/recipe") {
      const link = new URL(url).searchParams.get("link");
      if (!link) {
        return new Response("Page not found, please enter a valid link", {
          status: 404,
        });
      }

      const html = await recipeParser(link);
      return new Response(html, { headers: { "Content-Type": "text/html" } });
    }

    return new Response("Not found", { status: 404 });
  },
});

console.log(`Server started at ${server.url}`);
