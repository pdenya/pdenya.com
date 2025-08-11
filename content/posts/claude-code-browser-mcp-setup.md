---
title: "Getting Claude Code to Work with Browser MCP"
date: 2025-08-11T12:54:00-04:00
draft: false
categories: ["Development"]
tags: ["claude", "ai", "mcp", "browser-automation", "tools"]
---

If you're trying to set up [Browser MCP](https://browsermcp.io/) ([https://browsermcp.io/](https://browsermcp.io/)) with Claude Code here's what you actually need to run:

```bash
claude mcp add --scope user browsermcp npx @browsermcp/mcp@latest
```

That's it! Browser MCP will be available from any directory you're running claude in to whichever browser tab you are currently sharing

## What is Browser MCP?

Browser MCP (Model Context Protocol) is a tool that allows Claude to control a browser instance, enabling it to:
- Navigate to websites
- Take screenshots
- Click elements
- Fill out forms
- Extract information from web pages

This is incredibly useful for web scraping, testing, or anything else that requires interacting with web content.

## After installation

You'll need to have installed the BrowserMCP extension and "Connect" a tab with it. Tell claude specifically "use browser mcp tools to do X".

## Pro tip

If you're setting this up for a project rather than globally, you can use `--scope project` instead of `--scope user` to keep the MCP configuration project-specific.

Hope this saves someone else the time I spent hunting for this command!