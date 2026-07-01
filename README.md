# Minimal Portfolio

A free GitHub Pages portfolio built as a zero-dependency static site.

## Local setup

```bash
npm run dev
```

Then open `http://localhost:4321`.

## Add content without code

Use GitHub Issues:

1. Open the repository on GitHub.
2. Choose **Issues** -> **New issue**.
3. Pick one of the forms:
   - **Add portfolio project** creates or updates a project.
   - **Delete portfolio project** removes a project by title or slug.
   - **Update homepage settings** changes the hero image, headline, description, LinkedIn URL, contact heading, and service list.
4. Submit the issue.
5. GitHub Actions opens a pull request with the content change.
6. Review and merge the pull request to publish.

This gives a no-code edit flow similar to a lightweight CMS, while still keeping every change reviewable before it goes live.

## Add content locally

```bash
npm run content:new -- "Project Title" design 2026
```

Then edit the generated project entry in `content/projects.json`.

Homepage/profile settings live in `content/site.json`.

## Deploy

The site deploys to GitHub Pages through `.github/workflows/deploy.yml` whenever changes land on `main`. The build step validates `content/projects.json` and copies the publishable files into `dist/`.

## Custom domain

1. Create `public/CNAME` with only the custom domain, such as `example.com`.
2. In the repo, go to **Settings** -> **Pages** -> **Custom domain**.
3. Configure DNS at your domain registrar.

For `www.example.com`, create a `CNAME` DNS record pointing to `USERNAME.github.io`.
For `example.com`, create GitHub's apex `A` records in your registrar's DNS settings.
