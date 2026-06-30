import { mkdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";

const eventPath = process.env.GITHUB_EVENT_PATH;
if (!eventPath) {
  console.error("GITHUB_EVENT_PATH is required.");
  process.exit(1);
}

const event = JSON.parse(await readFile(eventPath, "utf8"));
const issue = event.issue;
if (!issue?.body) {
  console.error("Issue body was not found.");
  process.exit(1);
}

const fields = parseIssueForm(issue.body);
const title = field(fields, "Project title", issue.title.replace(/^Add project:\s*/i, ""));
const category = normalizeCategory(field(fields, "Category", "portrait"));
const year = Number.parseInt(field(fields, "Year", `${new Date().getFullYear()}`), 10) || new Date().getFullYear();
const description = field(fields, "Description", "").trim() || "Add a short project description here.";
const featured = /^yes$/i.test(field(fields, "Featured on homepage?", "No"));
const published = !/^no$/i.test(field(fields, "Publish now?", "Yes"));
const imageInput = field(fields, "Image URLs or uploaded images", "");
const imageUrls = extractUrls(imageInput);
const slug = slugify(title);
const uploadDir = path.join("public", "uploads", slug);

await mkdir(uploadDir, { recursive: true });

const images = [];
for (let index = 0; index < imageUrls.length; index += 1) {
  const url = imageUrls[index];
  const ext = extensionFromUrl(url) || ".jpg";
  const filename = `${String(index + 1).padStart(2, "0")}${ext}`;
  const target = path.join(uploadDir, filename);

  try {
    const response = await fetch(url);
    if (!response.ok) throw new Error(`HTTP ${response.status}`);
    const bytes = Buffer.from(await response.arrayBuffer());
    await writeFile(target, bytes);
    images.push(`uploads/${slug}/${filename}`);
  } catch (error) {
    console.warn(`Could not download ${url}: ${error.message}`);
    images.push(url);
  }
}

const cover = images[0] || "";
const contentPath = "content/projects.json";
const data = JSON.parse(await readFile(contentPath, "utf8"));
const existingIndex = data.projects.findIndex((project) => project.slug === slug);
const project = {
  slug,
  title,
  year,
  category,
  description,
  cover,
  images,
  published,
  featured,
};

if (existingIndex >= 0) {
  data.projects[existingIndex] = project;
} else {
  data.projects.push(project);
}

await writeFile(contentPath, `${JSON.stringify(data, null, 2)}\n`, "utf8");

const summary = [
  `${existingIndex >= 0 ? "Updated" : "Added"} ${title} in ${contentPath}`,
  images.length ? `Added ${images.length} image reference(s).` : "No images were provided.",
].join("\n");

await writeFile("content-summary.txt", summary, "utf8");
console.log(summary);

function parseIssueForm(body) {
  const fields = new Map();
  const sections = body.split(/\n###\s+/g);
  for (const section of sections) {
    const [rawTitle, ...rest] = section.split("\n");
    if (!rawTitle || rest.length === 0) continue;
    fields.set(rawTitle.trim(), rest.join("\n").trim());
  }
  return fields;
}

function field(fields, key, fallback) {
  const value = fields.get(key)?.trim();
  if (!value || value === "_No response_") return fallback;
  return value;
}

function normalizeCategory(value) {
  const category = value.toLowerCase().trim();
  if (["design", "photography", "social", "marketing"].includes(category)) return category;
  return "design";
}

function extractUrls(value) {
  return Array.from(value.matchAll(/https?:\/\/[^\s)>"']+/g), (match) => match[0]);
}

function extensionFromUrl(url) {
  try {
    const pathname = new URL(url).pathname.toLowerCase();
    const ext = path.extname(pathname);
    if ([".jpg", ".jpeg", ".png", ".webp", ".gif", ".avif"].includes(ext)) return ext;
  } catch {
    return "";
  }
  return "";
}

function slugify(value) {
  return value
    .toLowerCase()
    .trim()
    .replace(/['"]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}
