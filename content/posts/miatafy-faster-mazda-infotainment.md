---
title: "Miatafy: Making My Miata's Screen Wake Up Faster"
date: 2026-06-30T10:00:00-04:00
draft: false
categories: ["Projects"]
tags: ["miata", "mazda", "reverse-engineering", "side-project", "cars"]
---

Right before my 40th birthday I bought a 2022 ND Miata. I love almost everything about it, except the infotainment. The wireless CarPlay takes over a minute to connect on a cold start, and the MZD Connect screen lags enough that I notice it every single drive.

The first thing that got me was the touchscreen. Mazda disables it the moment the car starts moving, so every interaction has to go through the dial instead. Coming from a Tesla, where the whole interface is touch and works at any speed, it just felt broken. Re-enabling it was the first thing I got working.

Once I had that going I couldn't leave the rest alone. I bought a spare head unit off eBay so I wouldn't brick my own car, took the platform apart on the bench, and started measuring what actually makes it so slow.

That turned into [Miatafy](https://miatafy.com). The first product, ScreenTune, is a prepared USB stick. You plug it in while the car's running, give it about a minute to install, then pull it back out. Time from car-start to CarPlay-playing-music was about 16 seconds faster (71s -> 55s) on average.

It's a passion project and still early, basically running on one car (mine) while I line up testers. If you've got a Gen 6 Mazda and a screen that drives you nuts, take a look at [miatafy.com](https://miatafy.com). That touchscreen fix is free and open source: [TouchTune](https://miatafy.com/touchtune).
