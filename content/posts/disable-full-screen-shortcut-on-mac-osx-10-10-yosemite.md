---
author: Paul
category:
  - devtools
date: "2015-05-24T05:43:04+00:00"
guid: https://pdenya.com/?p=440
title: Disable Full Screen Shortcut on Mac OSX 10.10 Yosemite
url: /2015/05/23/disable-full-screen-shortcut-mac-osx-10-10-yosemite/

---
Full screen is super annoying on OS X lately. I use [SizeUp](http://www.irradiatedsoftware.com/sizeup/) which gives me a shortcut for expanding the windows instead of using the green button but i'm still having random encounters with full screen mode because of the shortcut ctrl+shift+f. So here's how to disable that..or at least make it harder to do by accident:

```bash
# Change full screen shortcut to Shift + Ctrl + Opt + Cmd + F
defaults write -g NSUserKeyEquivalents -dict-add "Enter Full Screen" "$~^@F"
```
