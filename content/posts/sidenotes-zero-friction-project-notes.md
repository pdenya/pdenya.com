+++
title = "SideNotes: zero‑friction project notes next to your code"
date = "2025-08-08T10:00:00-04:00"
draft = false
category = ["devtools"]
tags = ["notes", "productivity", "git"]
+++

I wanted a scratchpad that lives with the code but never in Git. SideNotes is a tiny shell helper that gives every repo a persistent notes that are already available in your editor. It shows up as a `SideNotes` folder in your project tree, but the notes live outside the repo and are globally git ignored.

### Why

- Mostly because I always use VS Code for scratch notes anyway
- Keep brainstorming and temporary thinking near the code without polluting commits or PRs
- One consistent place for notes across all repos
- Fast to open and create notes from the shell
- Plain Markdown on disk, editor‑agnostic


### How it works

- Per-project notes live under a central directory (e.g. `~/Code/SideNotes/<project>/`)
- A `SideNotes` symlink is created in your repo so notes appear in your editor’s file tree
- Git ignores the `SideNotes` symlink globally, so nothing lands in version control

```zsh
# Create a new note
note first-idea
#=>  Created: SideNotes/2025-08-08_14-22_first-idea.md

# Disk location
~/Code/SideNotes/your-repo/2025-08-08_14-22_first-idea.md

# You and your editor see
./your-repo/SideNotes/2025-08-08_14-22_first-idea.md

# Git sees
git status
#=>  On branch develop
#=>  nothing to commit, working tree clean
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

Documentation should be kept in the repo but can't keep every little thing in there for someone else to review.

Grab the code here: [SideNotes on GitHub](https://github.com/pdenya/side-notes).
