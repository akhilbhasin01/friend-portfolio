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
const contentPath = "content/site.json";
const site = JSON.parse(await readFile(contentPath, "utf8"));

assign(site, "name", field(fields, "Display name"));
assign(site, "headline", field(fields, "Hero headline"));
assign(site, "description", field(fields, "Hero description"));
assign(site, "linkedinUrl", cleanLinkedIn(field(fields, "LinkedIn URL")));
assign(site, "contactHeading", field(fields, "Contact heading"));

const services = field(fields, "Services");
if (services) {
  site.services = services
    .split(/\r?\n|,/)
    .map((service) => service.trim())
    .filter(Boolean);
}

const heroInput = field(fields, "Hero image URLs or uploaded image");
const heroUrls = extractUrls(heroInput || "");
if (heroUrls.length > 0) {
  site.heroImage = await downloadFirstImage(heroUrls[0]);
}

site.metaDescription = `${site.name} portfolio: ${site.services.join(", ")}.`;

await writeFile(contentPath, `${JSON.stringify(site, null, 2)}\n`, "utf8");

const summary = [
  `Updated homepage settings in ${contentPath}.`,
  heroUrls.length > 0 ? `Updated hero image to ${site.heroImage}.` : "Hero image unchanged.",
].join("\n");

await writeFile("content-summary.txt", summary, "utf8");
console.log(summary);

function parseIssueForm(body) {
  const fields = new Map();
  const sections = body.replace(/^###\s+/, "").split(/\n###\s+/g);
  for (const section of sections) {
    const [rawTitle, ...rest] = section.split("\n");
    if (!rawTitle || rest.length === 0) continue;
    fields.set(rawTitle.trim(), rest.join("\n").trim());
  }
  return fields;
}

function field(fields, key) {
  const value = fields.get(key)?.trim();
  if (!value || value === "_No response_") return "";
  return value;
}

function assign(object, key, value) {
  if (value) object[key] = value;
}

function cleanLinkedIn(value) {
  if (!value) return "";
  return value.replace(/\?.*$/, "").replace(/\/$/, "");
}

function extractUrls(value) {
  return Array.from(value.matchAll(/https?:\/\/[^\s)>"']+/g), (match) => match[0]);
}

async function downloadFirstImage(url) {
  const uploadDir = path.join("public", "uploads", "site");
  await mkdir(uploadDir, { recursive: true });
  const ext = extensionFromUrl(url) || ".jpg";
  const target = path.join(uploadDir, `hero${ext}`);

  const response = await fetch(url);
  if (!response.ok) {
    throw new Error(`Could not download hero image: HTTP ${response.status}`);
  }

  const bytes = Buffer.from(await response.arrayBuffer());
  await writeFile(target, bytes);
  return `uploads/site/hero${ext}`;
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
