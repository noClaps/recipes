import getTimeString from "./duration";
import errorPage from "./error.html" with { type: "text" };

type time = string;

type Recipe = {
  "@graph"?: Recipe[];
  "@type": "Recipe";
  name?: string;
  author?: { name: string };
  cookTime?: time;
  datePublished?: time;
  description?: string;
  nutrition?: { calories: string };
  prepTime?: time;
  recipeIngredient?: string[];
  recipeInstructions?: (HowToStep | HowToSection)[];
  recipeYield?: number | string | (string | number)[];
  totalTime?: time;
};

type HowToSection = {
  "@type": "HowToSection";
  name: string;
  itemListElement: HowToStep[];
};

type HowToStep = {
  "@type": "HowToStep";
  itemListElement?: { "@type": "HowToDirection" | "HowToTip"; text: string }[];
  text?: string;
  name?: string;
};

export default async function recipeParser(url: string) {
  const originalHTML = await fetch(url).then((r) => r.text());

  const matches = [
    ...originalHTML.matchAll(
      /<script type="application\/ld\+json"(?:.*)>({.*})<\/script>/gm,
    ),
  ];

  if (matches.length === 0) {
    return errorPage;
  }

  const json = JSON.parse(
    matches[0].filter((m) => m.startsWith("{"))[0],
  ) as Recipe;

  if (json["@graph"]) {
    return createRecipePage(
      json["@graph"].filter((m) => m["@type"] === "Recipe")[0],
    );
  }

  return createRecipePage(json);
}

function createRecipePage(json: Recipe) {
  const recipe = {
    name: json.name,
    author: json.author?.name,
    cookTime: json.cookTime,
    datePublished: json.datePublished,
    description: json.description,
    calories: json.nutrition?.calories,
    prepTime: json.prepTime,
    ingredients: json.recipeIngredient,
    instructions: json.recipeInstructions,
    yield: json.recipeYield,
    totalTime: json.totalTime,
  };

  let yieldStr = "";
  if (recipe.yield) {
    if (typeof recipe.yield === "number") {
      yieldStr = `${recipe.yield} servings`;
    } else if (typeof recipe.yield === "string") {
      yieldStr = recipe.yield;
    } else if (recipe.yield) {
      const str = recipe.yield.find((y) => !+y);
      const num = recipe.yield.find((y) => +y);
      if (str) {
        yieldStr = str.toString();
      } else if (num) {
        yieldStr = `${num} servings`;
      } else {
        yieldStr = recipe.yield[0].toString();
      }
    }
  }

  const html = `
<!doctype html>
<html>
  <head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width,initial-scale=1.0">
    <title>${recipe.name}</title>
    ${recipe.description ? `<meta name="description" content=${recipe.description}>` : ""}
    <style>
      :root {
          color-scheme: dark light;
          font-family: system-ui;
      }
    </style>
  </head>
  <body>
    <h1>${recipe.name}</h1>
    <p>${recipe.description}</p>
    <section class="meta">
      ${recipe.datePublished ? `<p>Published on <time datetime="${recipe.datePublished}">${new Date(recipe.datePublished).toDateString()}</time></p>` : ""}
      ${recipe.author ? `<p>Author: ${recipe.author}</p>` : ""}
    </section>
    ${
      recipe.cookTime || recipe.prepTime || recipe.totalTime
        ? `
    <section class="time">
      ${recipe.cookTime ? `<p>Cook time: <time datetime="${recipe.cookTime}">${getTimeString(recipe.cookTime)}</time></p>` : ""}
      ${recipe.prepTime ? `<p>Prep time: <time datetime="${recipe.prepTime}">${getTimeString(recipe.prepTime)}</time></p>` : ""}
      ${recipe.totalTime ? `<p>Total time: <time datetime="${recipe.totalTime}">${getTimeString(recipe.totalTime)}</time></p>` : ""}
    </section>`
        : ""
    }
    ${recipe.yield ? `<p>Serves: ${yieldStr}</p>` : ""}

    <h2>Ingredients</h2>
    <ul>${recipe.ingredients?.map((i) => `<li>${i}</li>`).join("")}</ul>

    <h2>Instructions</h2>
    <ol>
      ${recipe.instructions
        ?.map((instruction) => {
          if (instruction["@type"] === "HowToSection") {
            return `
          <li>
            <h3>${instruction.name}</h3>
            <ol>
              ${instruction.itemListElement
                .map((item) => {
                  if (item.text) {
                    return `<li>${item.text}</li>`;
                  }

                  return `
                <li>
                  ${item.name}
                  <ol>
                    ${item.itemListElement?.map((i) => `<li>${i.text}</li>`).join("")}
                  </ol>
                </li>`;
                })
                .join("")}
            </ol>
          </li>`;
          }

          if (instruction.text) {
            return `<li>${instruction.text}</li>`;
          }

          return `
        <li>
          ${instruction.name}
          <ol>
            ${instruction.itemListElement?.map((i) => `<li>${i.text}</li>`).join("")}
          </ol>
        </li>`;
        })
        .join("")}
    </ol>
  </body>
</html>
    `;

  return html;
}
