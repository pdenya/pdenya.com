---
author: Paul
title: Work
url: /work
draft: false
---

I've built a lot of cool things. Here's a few of them.

### PitchFriendly

PitchFriendly is a PR outreach platform that helps professionals send better pitches, manage press lists, track media coverage, and collaborate with teams. It includes Gmail and Outlook email integration, read receipts, reply handling, scheduled sending, a reporter database with automated enrichment, AI-powered pitch suggestions via OpenAI, semantic reporter search using pgvector embeddings, team permissions, and a campaign analytics dashboard.

*Rails 7, React, Redux, PostgreSQL (pgvector), Redis, Sidekiq, Docker, AWS, OpenAI*

<div class="work-screenshot-row">
  <img src="/images/work/pitchfriendly-new-pitch-page.png" alt="PitchFriendly pitch page">
  <img src="/images/work/pitchfriendly-new-reporters.png" alt="PitchFriendly reporters">
  <img src="/images/work/pitchfriendly-new-pitch-send.png" alt="PitchFriendly pitch send">
</div>

[Visit PitchFriendly](https://www.pitchfriendly.com/) | [PitchFriendly Through the Years](/posts/pitchfriendly-through-the-years/)

---

### Mmention

[MMention.com](http://mmention.com/) aggregates the most recommended videos in a few select subreddits. It came about easily because Google Cloud Query has an archive of all reddit comments in every sub organized by month.

MMention.com is currently game focused with videos aggregated for 15 popular games. The framework will work for any subreddit that we import.

*Rails, Google Cloud Query*

![Mmention](/images/work/mmention-main.png)

<div class="work-screenshot-row">
  <img src="/images/work/mmention-1.jpg" alt="Mmention screenshot 1">
  <img src="/images/work/mmention-2.jpg" alt="Mmention screenshot 2">
  <img src="/images/work/mmention-3.jpg" alt="Mmention screenshot 3">
</div>

[Visit MMention](http://www.mmention.com/) | [View on GitHub](https://github.com/pdenya/mmention)

---

### HelloSign for Gmail

A browser extension for Chrome, FireFox and Safari that lets users fill out and sign documents without ever leaving Gmail. I built the first version of this while working at HelloSign. They've continued development and it's more amazing than ever. Pictured is the first version which fit in well with Gmail's old design.

I learned a lot about cross domain issues while building this extension but the main challenge was getting the document to upload to Gmail as an attachment on the message. Tricking an HTML form isn't difficult, for the most part you can replace an `<input type="file" />` with a Blob and have things work correctly. This didn't work in Gmail because they retain a reference to the original `<input type="file" />` that it creates inside a closure so we had to override some methods like document.createElement to get things working.

*JavaScript*

![HelloSign for Gmail](/images/work/hellosign-main.png)

[Visit HelloSign for Gmail](https://www.hellosign.com/gmail) | [More details about the build](/2013/08/06/hellosign-for-gmail/)

---

### Audibly

Audibly is a menubar application for OS X 10.7+ that lets you record audio anytime by holding a hotkey. When you're done recording the audio will be available on your desktop (like a screenshot). The recording is then uploaded to the cloud and a shareable link to it is copied to your clipboard.

*Objective-C, PHP*

![Audibly](/images/work/audibly-main.png)

[Audibly](http://audibly.nextmarvel.net)

---

### Status for Facebook

Status was an iOS Facebook client for viewing your friend's statuses chronologically, similarly to twitter clients at the time, which were very text focused.

*Objective-C*

<div class="work-screenshot-row">
  <img src="/images/work/status-fb-1.png" alt="Status for Facebook screenshot 1">
  <img src="/images/work/status-fb-2.png" alt="Status for Facebook screenshot 2">
  <img src="/images/work/status-fb-3.png" alt="Status for Facebook screenshot 3">
  <img src="/images/work/status-fb-4.png" alt="Status for Facebook screenshot 4">
</div>

[View on GitHub](https://github.com/pdenya/status)

---

### Microsites

I worked in advertising for a while as both a full time employee and a freelancer. During those years I built dozens of campaign sites on a variety of stacks. My favorites were the Dos Equis Most Interesting Man campaign sites which had different contests for a few years in a row.

Advertising clients included Dos Equis, Charles Schwab, NYSE, Volvo Cars, Kraft, Exxon, Claritin, Oppenheimer, Allure, Hyatt, Plantronics, Paypal, LiveActive, Barilla, Qream, Lacoste, PetArmor, Heineken, IBM, and more.

![Microsites](/images/work/microsites-main.jpg)
