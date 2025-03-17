---
author: Paul
category:
  - git
date: "2013-09-18T15:00:00+00:00"
guid: https://pdenya.com/?p=343
title: Aggressively removing DS_Store files in git repos
url: /2013/09/18/aggressively-removing-ds_store-files-in-git-repos/

---
DS\_Store files in git repositories is a minor problem for a [lot of people](https://twitter.com/search?q=github%20ds_store). Global .gitignore files are a great solution to not commiting DS\_Store files but it won't actively remove them from your project directories.

This is my shortcut for `git status`:

```bash
function s() {
    find . -name '*.DS_Store' -type f -delete   #find and delete DS_Store files
    git status -s -b        #s - simple output, b - include branch name
}

```
