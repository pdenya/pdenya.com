# CLAUDE.md - Development Guide

## Commands

- **Development server**: `hugo server -D` (draft mode, http://localhost:1313)
- **Build site**: `hugo` (output to ./public)
- **Build with drafts**: `hugo -D`
- **Create new post**: `hugo new content posts/post-name.md`
- **Create new page**: `hugo new content pages/page-name.md`

## File Structure

- **content/posts/**: Blog posts (frontmatter: title, date, draft, category, tags)
- **content/pages/**: Static pages
- **static/**: Static files (images, css, js)
- **layouts/**: Custom layouts and templates
- **themes/PaperMod/**: Theme files

## Content Guidelines

- Use kebab-case for filenames (e.g., `my-new-post.md`)
- Always include proper frontmatter (title, date, categories)
- Set `draft: false` when ready to publish
- Use Markdown for content formatting
- Image paths should be relative to static directory
- Max width for images: 800px

## Theme Configuration

Theme settings are in `hugo.yaml`. Custom layouts override theme defaults.