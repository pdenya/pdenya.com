# pdenya.com

Personal website of Paul Denya - software engineer and co-founder of PressFriendly.

Built with [Hugo](https://gohugo.io/) using a modified [PaperMod](https://github.com/adityatelange/hugo-PaperMod) theme.

## Prerequisites

- [Hugo](https://gohugo.io/installation/) (Extended version)
- Node.js (for Bootstrap dependencies)

## Quick Start

```bash
# Install dependencies
yarn

# Start development server
hugo server -D
# or
yarn dev

# Build for production
hugo
```

## Commands

- `hugo server -D` - Development server with drafts (http://localhost:1313)
- `hugo` - Build site to `./public`
- `hugo new content posts/post-name.md` - Create new blog post
- `hugo new content pages/page-name.md` - Create new page
- `yarn deploy` - Deploy to AWS
- `yarn invalidate` - Clear CloudFront cache

## Deployment

Site deploys to AWS S3/CloudFront. Use `--profile personal` for AWS CLI commands.

## License

This site's content is copyright � Paul Denya.