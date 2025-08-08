+++
title = "SideNotes: zero‑friction project notes next to your code"
date = "2025-08-08T10:00:00-04:00"
draft = false
category = ["devtools"]
tags = ["notes", "cli", "productivity", "git"]
+++

I wanted a scratchpad that lives with the code but never in Git. SideNotes is a tiny shell helper that gives every repo a persistent notes area you can open instantly in your editor. It shows up as a `SideNotes` folder in your project tree, but the notes live outside the repo and are globally ignored.

### Why

- Keep brainstorming and temporary thinking near the code without polluting commits or PRs
- One consistent place for notes across all repos
- Fast to open and create notes from the shell
- Plain Markdown on disk, editor‑agnostic

### Install

```bash
curl -fsSL https://raw.githubusercontent.com/pdenya/side-notes/main/install.sh | bash
```

This copies a small script into your shell functions, ensures the base notes directory exists (defaults to `~/Code/SideNotes`), and adds `SideNotes` to your global Git ignore. Restart your shell (or `source ~/.zshrc`) to load the functions.

### Quickstart

```bash
# In any project directory
notes_init            # one-time per project
note first-idea       # creates a timestamped Markdown note
notes_latest          # opens the most recent note in your editor
notes                 # shows usage and lists your notes
```

By default, files open with `$EDITOR` (falls back to VS Code via `code`). Use lowercase with hyphens for note names: `note exploring-build-flags`.

### How it works

- Per project, notes live under a central directory (e.g. `~/Code/SideNotes/<project>/`)
- A `SideNotes` symlink is created in your repo so notes appear in your editor’s file tree
- Git ignores the `SideNotes` symlink globally, so nothing lands in version control

```text
~/Code/SideNotes/
  api-server/
    2025-08-08_14-22_performance-sweep.md

/path/to/your/repo/
  SideNotes -> ~/Code/SideNotes/api-server/
```

### Commands

- `notes_init [project_name]`: Initialize notes for the current repo (optional custom name)
- `note <slug>`: Create a timestamped Markdown file and open it (e.g. `note performance-sweep`)
- `notes`: Show usage and list notes newest‑first
- `notes_latest`: Open the most recent note
- `notes_projects`: List all projects with notes and counts

### Tips

- Set your editor with `export EDITOR=vim` (or `nvim`, `nano`, etc.)
- Want a different base directory? `export SIDENOTES_DIR=~/Notes/Projects`
- The symlink name (`SideNotes`) can be changed in the script if you prefer something else

### Why not keep notes in the repo?

I like design docs and durable decisions in Git. But daily sketches, half‑ideas, and quick experiments create noise in diffs and PRs. SideNotes keeps that stream next to the code and out of the history.

Grab the code here: [SideNotes on GitHub](https://github.com/pdenya/side-notes).
