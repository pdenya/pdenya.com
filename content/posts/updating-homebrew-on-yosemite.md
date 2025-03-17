---
author: Paul
category:
  - uncategorized
date: "2015-01-13T19:33:16+00:00"
guid: https://pdenya.com/?p=421
title: Updating Homebrew on Yosemite
url: /2015/01/13/updating-homebrew-yosemite/

---
### The Error

```bash
$ brew
/usr/local/bin/brew: /usr/local/Library/brew.rb: /System/Library/Frameworks/Ruby.framework/Versions/1.8/usr/bin/ruby: bad interpreter: No such file or directory
/usr/local/bin/brew: line 21: /usr/local/Library/brew.rb: Undefined error: 0

$ brew doctor
/usr/local/bin/brew: /usr/local/Library/brew.rb: /System/Library/Frameworks/Ruby.framework/Versions/1.8/usr/bin/ruby: bad interpreter: No such file or directory
/usr/local/bin/brew: line 21: /usr/local/Library/brew.rb: Undefined error: 0

```

### The Fix

Make homebrew think `/System/Library/Frameworks/Ruby.framework/Versions/1.8` still exists until you successfully update:

```bash
cd /System/Library/Frameworks/Ruby.framework/Versions
sudo ln -s Current 1.8
brew update
sudo rm 1.8
```
