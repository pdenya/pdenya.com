---
date: '2025-04-12T13:46:25-04:00'
draft: false
title: 'Better File Formatting When Working With Llms'
---

Copilot, Cursor, Claude Code, etc are convenient for automatically pulling relevant files from your codebase when asking questions but with difficult or sprawling questions I get much better results by manually selecting the files I want to include.

To simplify this manual process, I wrote a small script named `catcopy`.

### What `catcopy` does

`catcopy` takes a regex pattern, searches the codebase for matching filenames, gets the contents of each, and copies to the clipboard broke up with big markdown headers.

#### Usage

```bash
$ catcopy "<regex pattern>"

# file names that contain "issue" or "problem"
$ catcopy "issue|problem"
Copied contents of 5 file(s) to clipboard:
 - ./content/posts/os-x-pg-gem-install-or-bundle-install-issues.md
 # ...

 # file names that end with ".md"
$ catcopy "\.md$"
Copied contents of 112 file(s) to clipboard:

# or more realistically, a list of the class names you're trying to include
$ catcopy "NavigationContainer|SidebarContainer|RootLayout"
# ...
```

#### The clipboard output looks like this:

```
# ==================
# File: ./content/posts/os-x-pg-gem-install-or-bundle-install-issues.md
# ==================

<file contents here>

# ==================
# File: ./content/posts/bonjour-issues-cause-problems-with-teleport.md
# ==================

<file contents here>

... and so on.
```

### Why this formatting helps

LLMs love markdown. Big, distinct headers make it easier to parse the input correctly. LLMs respond best to explicit, structured context rather than loosely organized snippets. The simpler and clearer the input, the faster and more accurate the output.

### Get the script

Put this in `~/.zsh_functions/catcopy.sh` and then add `source ~/.zsh_functions/catcopy.sh` to your `.zshrc`.

```bash
# ~/.zsh_functions/catcopy.sh
catcopy() {
  if (( $# == 0 )); then
    echo "Usage: catcopy <regex pattern>"
    return 1
  fi
  local regex="$1"
  local files=()
  # Search all files under ., filtering by regex match
  while IFS= read -r -d '' file; do
    if [[ $file =~ $regex ]]; then
      files+=("$file")
    fi
  done < <(find . -type f -print0)

  if (( ${#files[@]} == 0 )); then
    echo "No files found matching regex: $regex"
    return 0
  fi

  local tmpfile=$(mktemp)
  for file in "${files[@]}"; do
    echo "# ==================" >> "$tmpfile"
    echo "# File: $file" >> "$tmpfile"
    echo "# ==================" >> "$tmpfile"
    echo "" >> "$tmpfile"
    cat "$file" >> "$tmpfile"
    echo "" >> "$tmpfile"
    echo "" >> "$tmpfile"
    echo "" >> "$tmpfile"
  done

  # Copy the output to clipboard (plain text)
  pbcopy < "$tmpfile"

  # Print a colored summary
  printf "\033[36mCopied contents of %d file(s) to clipboard:\033[0m\n" ${#files[@]}
  for file in "${files[@]}"; do
    printf " - \033[33m%s\033[0m\n" "$file"
  done

  rm "$tmpfile"
}
```


