import { readFile } from "node:fs/promises";

const validCategories = new Set(["portrait", "event", "personal", "commercial"]);
const data = JSON.parse(await readFile("content/projects.json", "utf8"));

if (!Array.isArray(data.projects)) {
  throw new Error("content/projects.json must contain a projects array.");
}

const slugs = new Set();
for (const project of data.projects) {
  for (const key of ["slug", "title", "category"]) {
    if (!project[key] || typeof project[key] !== "string") {
      throw new Error(`Project is missing string field: ${key}`);
    }
  }
  if (!Number.isInteger(project.year)) {
    throw new Error(`${project.slug} must have an integer year.`);
  }
  if (!validCategories.has(project.category)) {
    throw new Error(`${project.slug} has unsupported category ${project.category}.`);
  }
  if (slugs.has(project.slug)) {
    throw new Error(`Duplicate slug: ${project.slug}`);
  }
  slugs.add(project.slug);
}

console.log(`Validated ${data.projects.length} project(s).`);
