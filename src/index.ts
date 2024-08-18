import { Hono } from "hono";
import { serveStatic } from "hono/cloudflare-workers";
import manifest from "__STATIC_CONTENT_MANIFEST";
import recipeParser from "./recipe-parser";

const app = new Hono();

app.get("/", serveStatic({ path: "./index.html", manifest }));
app.get("/error", serveStatic({ path: "./error.html", manifest }));
app.get("/favicon.png", serveStatic({ path: "./favicon.png", manifest }));
app.get("/recipe", async (c) => {
  const link = c.req.query("link");
  if (!link) return c.redirect("/error");

  const recipePage = await recipeParser(link);
  if (!recipePage) return c.redirect("/error");

  return c.html(recipePage);
});

export default app;
