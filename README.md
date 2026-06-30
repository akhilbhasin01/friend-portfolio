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
2. Choose **Issues** -> **New issue** -> **Add portfolio project**.
3. Fill in the form with title, category, description, and image links.
4. Submit the issue.
5. GitHub Actions opens a pull request with updated `content/projects.json` and downloaded images.
6. Merge the pull request to publish.

## Add content locally

```bash
npm run content:new -- "Project Title" portrait 2026
```

Then edit the generated project entry in `content/projects.json`.

## Deploy

The site deploys to GitHub Pages through `.github/workflows/deploy.yml` whenever changes land on `main`. The build step validates `content/projects.json` and copies the publishable files into `dist/`.

## Custom domain

1. Edit `public/CNAME` and replace `your-domain.com`.
2. In the repo, go to **Settings** -> **Pages** -> **Custom domain**.
3. Configure DNS at your domain registrar.

For `www.example.com`, create a `CNAME` DNS record pointing to `USERNAME.github.io`.
For `example.com`, create GitHub's apex `A` records in your registrar's DNS settings.
