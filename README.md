# Paul Denya's Personal Website

This is a static website built with [Hugo](https://gohugo.io/) using the [PaperMod](https://github.com/adityatelange/hugo-PaperMod) theme.

## Getting Started

### Prerequisites
- [Hugo](https://gohugo.io/installation/) (Extended version)

### Development

Clone the repository and start the Hugo development server:

```bash
# Start development server
hugo server -D

# Access the site at http://localhost:1313
```

### Building the site

```bash
# Build the site (output to ./public)
hugo

# Build including draft content
hugo -D
```

## Creating New Content

### New Blog Post

```bash
# Create a new blog post
hugo new content posts/my-new-post.md
```

Edit the front matter in the new file:

```yaml
---
title: "My New Post"
date: "2025-03-17T12:00:00-07:00"
draft: false
category:
  - category-name
tags:
  - tag-name
---

Write your content here using Markdown.
```

### New Page

```bash
# Create a new page
hugo new content pages/my-new-page.md
```

## Deployment

This site is deployed by building the static files and serving them with nginx.

```bash
# Build the site
hugo

# Files are generated in the public/ directory
```

## License

This site's content is copyright © Paul Denya.