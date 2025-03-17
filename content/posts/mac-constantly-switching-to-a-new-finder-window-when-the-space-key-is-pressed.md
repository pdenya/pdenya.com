---
author: Paul
category:
  - devtools
date: "2013-08-13T15:00:13+00:00"
guid: https://pdenya.com/?p=227
title: Mac constantly switching to a new finder window when the space key is pressed
url: /2013/08/13/mac-constantly-switching-to-a-new-finder-window-when-the-space-key-is-pressed/

---
If whenever you press the space key your mac shifts focus to a finder window you should be able to fix it by hard booting Finder. Open terminal and run:

```sh
killall Finder

```
