---
author: Paul
category:
  - devtools
date: "2013-07-31T18:02:31+00:00"
guid: https://pdenya.com/?p=147
title: A less frustrating suspend shortcut for VMWare Fusion
url: /2013/07/31/frustrating-vmware-fusion-suspend-shortcut/

---
"⌘ \+ w" in VMWare has been frustrating me for months. The situation goes something like this:

- I have a VM open and active
- I hit "⌘ + W" like an idiot
- My VM starts suspending, forcing me to wait for suspending and resuming to complete

I needed a way to stop myself from accidentally closing my VMs multiple times per week.

## The Fix

It's pretty simple, we just remap "⌘ + w" to something else like "⌘ + ⇧ + w" in System Preferences. First, open System Preferences and go to Keyboard > Keyboard Shortcuts > Application Shortcuts. Use "File->Close" as the menu title and VMWare Fusion as the application.

![Keyboard Shortcuts](/wp-content/uploads/2013/07/Screen-Shot-2013-07-31-at-10.28.28-AM.png)
