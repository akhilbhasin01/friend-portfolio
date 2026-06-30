const categories = ["portrait", "event", "personal", "commercial"];
const titleCase = (value) => `${value.charAt(0).toUpperCase()}${value.slice(1)}`;

let projects = [];

const views = {
  home: document.querySelectorAll('[data-view="home"]'),
  archive: document.querySelector('[data-view="archive"]'),
  project: document.querySelector('[data-view="project"]'),
  contact: document.querySelector('[data-view="contact"]'),
};

const featuredGrid = document.querySelector("#featured-grid");
const archiveGrid = document.querySelector("#archive-grid");
const archiveTitle = document.querySelector("#archive-title");
const archiveEmpty = document.querySelector("#archive-empty");
const projectBack = document.querySelector("#project-back");
const projectTitle = document.querySelector("#project-title");
const projectYear = document.querySelector("#project-year");
const projectDescription = document.querySelector("#project-description");
const projectImages = document.querySelector("#project-images");

init();

async function init() {
  const response = await fetch("content/projects.json", { cache: "no-store" });
  const data = await response.json();
  projects = data.projects
    .filter((project) => project.published !== false)
    .sort((a, b) => Number(Boolean(b.featured)) - Number(Boolean(a.featured)) || b.year - a.year);

  renderGrid(featuredGrid, projects);
  window.addEventListener("hashchange", route);
  route();
}

function route() {
  const raw = window.location.hash.replace(/^#\/?/, "") || "home";
  const [first, second] = raw.split("/");

  setActive(first);

  if (first === "contact") {
    showOnly("contact");
    return;
  }

  if (first === "project" && second) {
    renderProject(second);
    return;
  }

  if (categories.includes(first)) {
    renderArchive(first);
    return;
  }

  showOnly("home");
}

function showOnly(view) {
  views.home.forEach((element) => {
    element.hidden = view !== "home";
  });
  views.archive.hidden = view !== "archive";
  views.project.hidden = view !== "project";
  views.contact.hidden = view !== "contact";
}

function renderArchive(category) {
  const categoryProjects = projects.filter((project) => project.category === category);
  archiveTitle.textContent = titleCase(category);
  archiveEmpty.hidden = categoryProjects.length > 0;
  renderGrid(archiveGrid, categoryProjects);
  showOnly("archive");
}

function renderProject(slug) {
  const project = projects.find((item) => item.slug === slug);
  if (!project) {
    window.location.hash = "#home";
    return;
  }

  projectBack.href = `#${project.category}`;
  projectBack.textContent = project.category;
  projectTitle.textContent = project.title;
  projectYear.textContent = project.year;
  projectDescription.textContent = project.description || "";
  projectImages.replaceChildren(...(project.images?.length ? project.images : [project.cover]).filter(Boolean).map(image));
  showOnly("project");
}

function renderGrid(container, items) {
  container.replaceChildren(...items.map(projectTile));
}

function projectTile(project) {
  const link = document.createElement("a");
  link.className = "project-tile";
  link.href = `#project/${project.slug}`;

  if (project.cover) {
    link.append(image(project.cover));
  } else {
    const placeholder = document.createElement("div");
    placeholder.className = "image-placeholder";
    placeholder.setAttribute("aria-hidden", "true");
    link.append(placeholder);
  }

  const meta = document.createElement("span");
  meta.className = "project-meta";

  const title = document.createElement("span");
  title.textContent = project.title;
  const year = document.createElement("span");
  year.textContent = project.year;
  meta.append(title, year);
  link.append(meta);

  return link;
}

function image(src) {
  const img = document.createElement("img");
  img.src = src;
  img.alt = "";
  img.loading = "lazy";
  return img;
}

function setActive(routeName) {
  document.querySelectorAll("[data-route]").forEach((link) => {
    link.classList.toggle("active", link.dataset.route === routeName);
  });
}
