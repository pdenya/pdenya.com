# pdenya.com

This is the source code for my personal website and blog — [pdenya.com](https://pdenya.com).

I built it with [Hugo (Extended)](https://gohugo.io/) and a customized version of the [PaperMod](https://github.com/adityatelange/hugo-PaperMod) theme.


## Prerequisites

- [Hugo](https://gohugo.io/installation/)
- Node.js

## Quick Start

```bash
# Install dependencies
yarn

# Start development server
yarn dev

# Build for production
hugo

# Build and deploy
yarn deploy && yarn invalidate
```

## Commands

- `hugo server -D` - Development server with drafts (http://localhost:1313)
- `hugo` - Build site to `./public`
- `hugo new content posts/post-name.md` - Create new blog post
- `hugo new content pages/page-name.md` - Create new page
- `yarn deploy` - Deploy to AWS
- `yarn invalidate` - Clear CloudFront cache

## Deployment

Site deploys to AWS S3/CloudFront.

## License & Usage
The content on this site is copyright © Paul Denya.

You’re welcome to use the structure, theme customizations, and setup as inspiration for your own site. Please replace my content, credits, and license details with your own before publishing.