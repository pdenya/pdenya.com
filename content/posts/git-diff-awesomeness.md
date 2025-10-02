---
title: "Git Diff Awesomeness"
date: 2025-10-02T10:20:37-04:00
draft: false
categories: ["Development"]
tags: ["git", "terminal", "iterm2", "tools"]
---

Big upgrades to my `git diff` experience today! Mouse scrolling in git diffs and much easier to read syntax-highlighted diffs with word-level changes.

## Mouse scrolling in git diffs

First, install a newer version of `less` because of course macOS doesn't ship updated core tools.

```bash
brew install less && brew link less
```

Next, configure [iTerm2](https://iterm2.com/) to pass arrow keys on scroll in alternate screen mode. Go to **Preferences → Advanced** and search for "scroll" to find the setting "Scroll wheel sends arrow keys when in alternate screen mode" and set it to **Yes**.

![iTerm2 alternate screen mode setting](/images/git-diff-iterm-settings.png)

Now you can use your mouse wheel to scroll through git diffs instead of being stuck with keyboard navigation!

## Readable diffs with git-delta

[git-delta](https://github.com/dandavison/delta) provides amazing diff visualization with syntax highlighting and word-level diff highlights. Install it with:

```bash
brew install git-delta
```

Try it out immediately with:

```bash
git diff --color=always | delta --syntax-theme=Dracula
```

![git-delta diff output with syntax highlighting](/images/git-diff-delta-example.png)

You can browse available themes with:

```bash
# For dark themes
delta --show-syntax-themes --dark

# For light themes
delta --show-syntax-themes --light
```

## Configuration

To make delta your default git pager, add this to your `~/.gitconfig`:

```ini
[core]
    excludesFile = /Users/pdenya/.gitignore
    pager = LESS='FR --redraw-on-quit' delta
[interactive]
    diffFilter = delta --color-only
[delta]
    navigate = true
    syntax-theme = Dracula
[merge]
    conflictStyle = zdiff3
```

The `navigate = true` setting enables n/N keyboard shortcuts to jump between files in multi-file diffs, and the `LESS='FR --redraw-on-quit'` flags enable mouse scrolling and proper screen cleanup when exiting.
