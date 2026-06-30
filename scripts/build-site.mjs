import { cp, mkdir, rm } from "node:fs/promises";
import { existsSync } from "node:fs";

await import("./validate-content.mjs");

await rm("dist", { recursive: true, force: true });
await mkdir("dist", { recursive: true });

for (const file of ["index.html", "styles.css", "site.js"]) {
  await cp(file, `dist/${file}`);
}

for (const directory of ["content", "public"]) {
  if (existsSync(directory)) {
    await cp(directory, `dist/${directory === "public" ? "." : directory}`, { recursive: true });
  }
}

console.log("Built static site into dist/.");
