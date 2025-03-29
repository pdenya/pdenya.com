# CLAUDE.md - Development Guide

## Commands

- **Development server**: `hugo server -D` (draft mode, http://localhost:1313)
- **Build site**: `hugo` (output to ./public)
- **Build with drafts**: `hugo -D`
- **Create new post**: `hugo new content posts/post-name.md`
- **Create new page**: `hugo new content pages/page-name.md`
- **Install dependencies**: `npm install`

## File Structure

- **content/posts/**: Blog posts (frontmatter: title, date, draft, category, tags)
- **content/pages/**: Static pages
- **static/**: Static files (images, css, js)
- **layouts/**: Custom layouts and templates
- **themes/PaperMod/**: Theme files
- **assets/scss/**: SCSS files for customizing Bootstrap
- **assets/js/**: JavaScript files

## Content Guidelines

- Use kebab-case for filenames (e.g., `my-new-post.md`)
- Always include proper frontmatter (title, date, categories)
- Set `draft: false` when ready to publish
- Use Markdown for content formatting
- Image paths should be relative to static directory
- Max width for images: 800px

## Bootstrap Integration

The site uses Bootstrap 5 with custom SCSS variables for styling:

- Color palette can be customized in `assets/scss/custom.scss`
- Use the `{{< button >}}` shortcode for Bootstrap buttons
- Button options:
  - `url`: Link destination (default: "#")
  - `text`: Button text (alternative to inner content)
  - `class`: Button type/color (primary, secondary, success, danger, warning, info, light, dark)
  - `size`: Button size (lg, sm, or empty for default)
  - `outline`: Whether to use outline style (true/false)
  - `icon`: Font Awesome icon class (e.g., "fas fa-download")

Button examples:
```
{{< button url="/blog" text="Read Blog" class="primary" />}}
{{< button url="/contact" text="Contact" class="primary" outline="true" />}}
{{< button url="/download" text="Download" class="success" icon="fas fa-download" size="lg" />}}
```

## Theme Configuration

Theme settings are in `hugo.yaml`. Custom layouts override theme defaults.