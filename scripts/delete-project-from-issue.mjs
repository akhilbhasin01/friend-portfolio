import { readFile, writeFile } from "node:fs/promises";

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
const slugOrTitle = field(fields, "Project slug or title");
const confirmation = field(fields, "Confirm deletion");

if (confirmation !== "Delete this project") {
  throw new Error("Deletion was not confirmed.");
}

const contentPath = "content/projects.json";
const data = JSON.parse(await readFile(contentPath, "utf8"));
const before = data.projects.length;
const needle = normalize(slugOrTitle);

data.projects = data.projects.filter((project) => {
  return normalize(project.slug) !== needle && normalize(project.title) !== needle;
});

if (data.projects.length === before) {
  throw new Error(`No project matched "${slugOrTitle}".`);
}

await writeFile(contentPath, `${JSON.stringify(data, null, 2)}\n`, "utf8");

const summary = `Deleted project "${slugOrTitle}" from ${contentPath}.`;
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

function field(fields, key) {
  const value = fields.get(key)?.trim();
  if (!value || value === "_No response_") return "";
  return value;
}

function normalize(value) {
  return value.toLowerCase().trim();
}
