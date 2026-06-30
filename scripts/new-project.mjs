import { readFile, writeFile } from "node:fs/promises";

const [title, category = "design", year = new Date().getFullYear().toString()] = process.argv.slice(2);

if (!title) {
  console.error('Usage: npm run content:new -- "Project Title" design 2026');
  process.exit(1);
}

const slug = slugify(title);
const filePath = "content/projects.json";
const data = JSON.parse(await readFile(filePath, "utf8"));

data.projects.push({
  slug,
  title,
  year: Number.parseInt(year, 10) || new Date().getFullYear(),
  category,
  description: "Add a short project description here.",
  cover: "",
  images: [],
  published: false,
  featured: false,
});

await writeFile(filePath, `${JSON.stringify(data, null, 2)}\n`, "utf8");
console.log(`Added ${slug} to ${filePath}`);

function slugify(value) {
  return value
    .toLowerCase()
    .trim()
    .replace(/['"]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}
