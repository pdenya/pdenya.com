---
date: '2025-11-14T13:23:05-05:00'
draft: false
title: 'Claude Code Bash History: Extract Commands from AI Sessions'
categories: [Development]
tags: [python, claude-code, productivity, debugging, cli]
---

I had a long debugging session with [Claude Code](https://claude.com/claude-code) that eventually worked. When I asked it to write up the debugging process, the output was terrible. I grabbed the bash commands from the previous session with [ccbashhistory](https://github.com/pdenya/ccbashhistory), started a fresh Claude instance, and had it write clean documentation based on what actually ran.

## Usage

```bash
pipx run ccbashhistory
```

Shows an interactive list of your recent Claude Code sessions. Select one and get all the bash commands Claude ran during that session.

## Other uses

- Reconstruct what happened in yesterday's session
- Create runbooks from successful debugging workflows
- Review what Claude actually executed vs what you asked for
- Debug what went wrong when a session didn't work

## Why this exists

It's so amazing to be able to whip these things up with practically no time investment. Needed a tool, couldn't find it, built it in minutes with Claude Code, and now it's solving real problems.

Grab the code here: [ccbashhistory on GitHub](https://github.com/pdenya/ccbashhistory)
