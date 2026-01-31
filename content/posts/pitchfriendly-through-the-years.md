---
title: "PitchFriendly Through the Years"
date: 2026-01-30T12:00:00-04:00
draft: false
categories: ["Projects"]
tags: ["pitchfriendly", "rails", "react", "ember", "saas"]
---

PitchFriendly started as a side project in 2015 to help PR professionals send better pitches to reporters. Over 10 years it has grown from a simple EmberJS CRUD app into a full-featured PR platform with AI-powered reporter discovery, email integration, team collaboration, and more. Here's how it evolved.

## V1: EmberJS + Rails (2015–2019)

The first version of PitchFriendly was built on **Rails** with an **EmberJS** frontend. The core idea was simple: give PR people a better way to organize pitches, manage press lists, and track outreach. The design was bright cyan with a friendly tree mascot.

**Tech stack:** Rails, EmberJS, PostgreSQL, Heroku

**Core features:**
- Pitch management with press lists
- Email composition with mail merge
- Read receipts and reply tracking
- Reporter status tracking (awaiting reply, read, received reply)
- A basic metrics dashboard showing pitched/read/replied/committed counts
- A machine learning classifier that identified reporters likely to respond to specific stories, trained on articles they'd recently published

![PitchFriendly V1 - Pitches Dashboard](/images/work/pitchfriendly-1.png)

The home screen showed a list of pitches with activity counts and a 30-day activity summary. Each pitch belonged to a client and tracked how many reporters were on the list and how many had been sent.

![PitchFriendly V1 - Press List](/images/work/pitchfriendly-2.png)

The press list view was the heart of the app. You could see at a glance how many contacts were pitched, how many read the email, and how many replied. Each reporter had a status badge and filter options on the right made it easy to segment by engagement level.

![PitchFriendly V1 - Email Composer](/images/work/pitchfriendly-3.png)

The email composer let you write personalized pitches to individual reporters. Emails were sent through the user's connected account so they appeared indistinguishable from regular email. A sidebar showed reporter details, their social profiles, and a notes section.

## V2: React + Rails 7 (2020–Present)

The current version is a ground-up rebuild. EmberJS was replaced with **React** and **Redux**, the backend was upgraded to **Rails 7**, and the entire infrastructure moved to **Docker** with **Kamal** deployments to **AWS**.

**Tech stack:** Rails 7, React 17, Redux, React Query, PostgreSQL 16 (with pgvector), Redis, Sidekiq, Docker, Kamal, AWS (EC2, ECR, RDS, S3), OpenAI API, Stripe, Mailgun, TinyMCE

![PitchFriendly today — pitch page with activity stats and recent hits](/images/work/pitchfriendly-new-pitch-page.png)

The pitch page now shows a reporter list with engagement statuses, an activity & stats sidebar with pitched/read/replied counts, recent hits (published coverage), and recent activity from team members.

![PitchFriendly — conversation view, pitch list, and reporter details](/images/work/pitchfriendly-new-pitch-reporter.png)

Multiple views layer together: threaded email conversations on the left, the pitch reporter list in the center, and a detailed activity & stats panel on the right.

### What changed

**Email integration got serious.** The V1 email system was straightforward SMTP. V2 integrates directly with **Gmail via OAuth** and supports **Outlook and custom SMTP/IMAP** providers. Emails are threaded, labeled in Gmail automatically, and replies are detected and synced back. App passwords are encrypted with Lockbox.

![PitchFriendly — email composer](/images/work/pitchfriendly-new-email.png)

The email composer generates pitch emails from story wizard inputs, sent from the user's own address. The sidebar shows reporter details, status, and quick actions.

**The reporter database became a real product.** V1 had basic reporter contacts on press lists. V2 maintains a full reporter database with automated enrichment — scraping publications, discovering email addresses, validating deliverability with DNS/MX checks, and tracking social media profiles. There are 41 models in the current schema supporting reporters, publications, sources, properties, and more.

![PitchFriendly — reporter database](/images/work/pitchfriendly-new-reporters.png)

The reporter database lists 1,200+ contacts with filters for engagement (replied to pitches, read pitches, been pitched), scope (my team vs. full PitchFriendly DB), and time range.

**AI features.** PitchFriendly now uses **OpenAI** for pitch suggestions (PitchAssist), subject line recommendations, and semantic search. Reporter embeddings are stored in **pgvector** so you can find similar reporters based on what they write about rather than just keyword matching.

![PitchFriendly — story wizard](/images/work/pitchfriendly-new-wizard.png)

The story wizard walks users through structuring their pitch step by step, collecting a summary, proof points, and categories, then generating optimized email templates.

**Team collaboration.** V1 had a basic "Create a team!" CTA. V2 has a full permission system with OWNER/EDIT/VIEW roles, privacy levels (TEAM/PUBLIC/PRIVATE), shared properties, activity feeds, collision detection to prevent duplicate pitches, and approval workflows.

![PitchFriendly — team overview](/images/work/pitchfriendly-new-team.png)

The team overview shows all members with their pitch stats, an activity report chart, and a feed of recent team actions.

**Batch sending and scheduling.** The pitch send view lets you select segments of reporters, create drafts from templates, and batch send or schedule delivery.

![PitchFriendly — pitch send workflow](/images/work/pitchfriendly-new-pitch-send.png)

**Press list management.** Press lists track each reporter's status through the outreach lifecycle with per-reporter message history.

![PitchFriendly — press list](/images/work/pitchfriendly-new-presslists.png)

**Background processing.** Sidekiq handles 10 job types across 4 priority queues. Clockwork schedules recurring tasks — sending queued emails in batches, syncing Gmail threads, fetching IMAP emails, processing RSS feeds from publications, and running enrichment pipelines.

**Infrastructure.** The app runs in Docker containers deployed via Kamal v2 to AWS EC2 (arm64). PostgreSQL 16 with pgvector extensions, Redis for caching and sessions, Caddy for local SSL, and CloudWatch for production logging.

### By the numbers

- **41 models**, 27 API controllers, 27 frontend feature bundles
- **27 services** handling enrichment, validation, deduplication, imports, web scraping
- **10 background job types** across 4 priority queues
- **30+ internal docs** covering features, deployment, architecture, and patterns
- Over **10 years** of continuous development

## What stayed the same

Despite the complete rewrite, the core value proposition hasn't changed: help PR people send better pitches to the right reporters and track what happens. The original insight — that PR outreach is tedious, disorganized, and could be dramatically improved with software — still drives every feature.

[Visit PitchFriendly](https://www.pitchfriendly.com/)
