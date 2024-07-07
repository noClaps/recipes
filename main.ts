import recipeParser from "./src/scripts/recipes";
import Elysia from "elysia";
import staticPlugin from "@elysiajs/static";

const { server } = new Elysia()
  .use(staticPlugin())
  .get("/", () => Bun.file("src/pages/index.html"))
  .get("/recipe", async ({ query }) => {
    const link = query.link;
    if (!link) {
      return new Response("Page not found, please enter a valid link", {
        status: 404,
      });
    }

    const html = await recipeParser(link);
    return new Response(html, { headers: { "Content-Type": "text/html" } });
  })
  .listen(Bun.env.PORT || 8080);

console.log(`Server started at ${server?.url}`);
