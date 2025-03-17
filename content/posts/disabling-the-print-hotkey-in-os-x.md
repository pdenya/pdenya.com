---
author: Paul
category:
  - devtools
date: "2013-07-23T17:20:24+00:00"
guid: https://pdenya.com/?p=132
title: Disabling the Print hotkey in OS X
url: /2013/07/23/disabling-the-print-hotkey-in-os-x/

---
The print hotkey is not useful to me. If it opened immediately and was immediately dismissible with `esc` it would be less frustrating but as it is every time the print dialogue opens I need to wait several seconds before I can dismiss it regardless of which app it's in.

"⌘+P" has been frustrating me for a while, being next to "⌘+\[". Now that i'm using Sublime Text 2 as my editor of choice it's worse because "⌘+P" is ST2's default quick open hotkey.

## Addressing the situation

Turns out disabling the print hotkey globally is difficult but changing it is simple and that's just as good. Pick a key combination you don't use for anything else, i used "⌃⌥⇧⌘+P".

Open System Preferences > Keyboard > Keyboard Shortcuts > Application Shortcuts. Add custom shortcuts for:

- Print
- Print...

If you have any apps like iTerm that use custom menu shortcuts for printing you can also specify those here, using "->" to indicate submenus

- Shell->Print->Screen

[![print_remap](/wp-content/uploads/2013/07/print_remap1.png)](/wp-content/uploads/2013/07/print_remap1.png)

## Exceptions

If you want the print hotkey to continue working in a particular program (Word for example) you can add an application specific short cut mapping Print back to "⌘+P".
