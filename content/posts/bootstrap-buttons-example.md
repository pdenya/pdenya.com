---
title: "Bootstrap Buttons Example"
date: 2025-03-20T12:00:00-05:00
draft: true
category: 
  - "devtools"
tags:
  - "bootstrap"
  - "hugo"
url: /posts/bootstrap-buttons-example/
---

## Bootstrap Buttons Example

This post demonstrates the various Bootstrap buttons available on the site.

### Standard Buttons

{{< button url="/blog" text="Primary Button" class="primary" />}}
{{< button url="/blog" text="Secondary Button" class="secondary" />}}
{{< button url="/blog" text="Success Button" class="success" />}}
{{< button url="/blog" text="Danger Button" class="danger" />}}
{{< button url="/blog" text="Warning Button" class="warning" />}}
{{< button url="/blog" text="Info Button" class="info" />}}
{{< button url="/blog" text="Light Button" class="light" />}}
{{< button url="/blog" text="Dark Button" class="dark" />}}

### Outline Buttons

{{< button url="/blog" text="Primary Outline" class="primary" outline="true" />}}
{{< button url="/blog" text="Secondary Outline" class="secondary" outline="true" />}}
{{< button url="/blog" text="Success Outline" class="success" outline="true" />}}
{{< button url="/blog" text="Danger Outline" class="danger" outline="true" />}}
{{< button url="/blog" text="Warning Outline" class="warning" outline="true" />}}
{{< button url="/blog" text="Info Outline" class="info" outline="true" />}}
{{< button url="/blog" text="Light Outline" class="light" outline="true" />}}
{{< button url="/blog" text="Dark Outline" class="dark" outline="true" />}}

### Button Sizes

{{< button url="/blog" text="Large Button" class="primary" size="lg" />}}
{{< button url="/blog" text="Normal Button" class="primary" />}}
{{< button url="/blog" text="Small Button" class="primary" size="sm" />}}

### Buttons with Icons

{{< button url="/blog" text="Read Blog" class="primary" icon="fas fa-book" />}}
{{< button url="/portfolio" text="View Portfolio" class="success" icon="fas fa-briefcase" />}}
{{< button url="https://github.com" text="GitHub" class="dark" icon="fab fa-github" />}}
{{< button url="mailto:hello@example.com" text="Contact Me" class="info" icon="fas fa-envelope" />}}
{{< button url="/download" text="Download" class="warning" icon="fas fa-download" outline="true" />}}

### Using HTML Content Inside Buttons

{{< button url="/blog" >}}
  Go to <strong>Blog</strong>
{{< /button >}}

You can also use positional parameters:

{{< button "/about" >}}About Me{{< /button >}}

Or mix named and inner content:

{{< button url="/portfolio" class="success" >}}My <strong>Portfolio</strong>{{< /button >}}