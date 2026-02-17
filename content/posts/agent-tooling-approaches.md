---
date: '2026-02-17T10:00:00-05:00'
draft: false
title: 'Agent Tooling Approaches: Building Efficient Persistent AI Workflows'
categories: [Development]
tags: [ai, automation, claude-code, productivity, architecture]
---

If you're running an AI agent daily or weekly, you need infrastructure that makes repetitive tasks efficient. The goal isn't full automation—it's effective collaboration where the agent handles grunt work and you make the decisions that matter.

This is a reference for planning these workflows. Each section describes a type of tooling, when it's useful, and how the pieces fit together.

## Scripts & Automation

**What they handle:** Volume. Anything repetitive, deterministic, and well-defined.

Scripts are the foundation. They fetch data from APIs, normalize it, apply hard filters (budget thresholds, date ranges, keyword blacklists), and write results somewhere durable. They're also the orchestration layer—a single script can pull new data, skip anything already processed, run LLM evaluations, and update the database with results.

For a persistent agent, scripts solve the efficiency problem directly. A data-pull script that tracks the last fetch timestamp and only grabs new items means the agent never reprocesses stale data. A filtering script that applies deterministic rules before anything touches an LLM means tokens are only spent on items that have a chance of being relevant.

Scripts should be designed as **agent-friendly tools**. That means structured JSON output (not human-formatted tables), semantic exit codes (0 = success, 1 = correctable error), no interactive prompts, and instructional error messages that tell the agent what went wrong and how to fix it.

**Build a script when:** the logic for a step can be fully specified, the step runs frequently, or the step processes more than a handful of items at a time.

---

## Database

**What it handles:** Memory across sessions. State that accumulates, evolves, and needs to be queried.

A database turns a stateless agent into one that learns. Without it, every session is isolated—the agent can't know what it evaluated yesterday, what you decided, or what outcomes resulted from past decisions. With a database, the agent can query for "new listings I haven't seen," update scores as criteria evolve, track which actions led to good outcomes, and avoid recommending something you already rejected.

The database is also the coordination layer between the agent and you. The agent writes scores and recommendations; you record decisions and outcomes through a dashboard or directly. Both sides read from the same source of truth.

The database enables **incremental processing**—the pattern that makes persistent workflows efficient. Every item gets a processing state (new → filtered → scored → reviewed → acted on), and each pipeline step only touches items in the state it cares about. A scoring script queries for `state = 'filtered'` items, processes them, and advances their state to `scored`. If the script runs again tomorrow, it skips everything it already handled.

SQLite is the default. It's a single file, needs no server, and the agent can read and write it directly via scripts or inline SQL. It handles tens of thousands of rows without issue.

**Build a database when:** data accumulates across sessions, you or the agent need to query it from multiple angles, or you need a shared state layer between automated steps and human input.

---

## Scripted LLM Evaluation

**What it handles:** Judgment at scale. Any step where the decision requires interpreting natural language, weighing ambiguous criteria, or reasoning about fit.

This is the bridge between what deterministic code can filter and what requires actual understanding. A script fills variables into a prompt template, calls a model for each item, parses the structured response, and writes results back to the database. The agent doesn't need to be in the loop—it's a batch process that runs as part of the pipeline.

The efficiency principle: LLM calls are the most expensive step per-item, so they belong after deterministic filtering has already eliminated the obvious misses.

**Use tiered models to manage cost.** Not every evaluation needs the best model. A three-tier approach works well: a local model (free) or small cloud model (cheap) for initial pass/fail scoring, a mid-tier model for nuanced ranking of the survivors, and a top-tier model only for high-stakes output like final recommendations or proposal drafts.

Prompt templates for these evaluations should be versioned and stored as files in the project, not embedded in scripts. This makes it easy for the agent to iterate on scoring criteria based on feedback.

**Build scripted LLM evaluation when:** a pipeline step requires interpreting unstructured text, classifying items against subjective criteria, or scoring/ranking based on nuanced fit—and the volume is high enough that doing it interactively would be wasteful.

---

## Dashboard (Human Interface)

**What it handles:** Human oversight, decisions, and feedback. The point where you see what the pipeline produced and tell it what to do differently.

A persistent agent workflow is not fully autonomous—it's a collaboration. The dashboard is where you stay in the loop without doing the grunt work. It surfaces the pipeline's output (top-scored items, flagged anomalies, summary stats), provides controls to act (approve, reject, annotate, override scores), and captures feedback that flows back into the system.

The dashboard also serves as the agent's feedback mechanism. When you mark a highly-scored item as "not interested" or a low-scored item as "actually great," that data can inform prompt refinements, filter adjustments, and scoring calibration.

**Design the dashboard for speed, not depth.** You should be able to review a full day's pipeline output in a few minutes—scan the top candidates, make quick approve/reject/flag decisions, and move on. If the dashboard demands significant time, the pipeline isn't filtering aggressively enough upstream.

**Build a dashboard when:** you need to review, approve, or override agent output—or when capturing your decisions and outcomes is necessary for the system to improve.

---

## Interactive Agent Sessions

**What they handle:** Synthesis, strategy, and anything that benefits from back-and-forth reasoning with full context.

This is the most capable and most expensive mode—a live conversation where the agent can reason, ask questions, analyze nuanced situations, and draft complex output. For a persistent workflow, the interactive session is where the agent reviews the cream-of-the-crop output from the pipeline, provides strategic advice, drafts proposals or responses, identifies patterns across accumulated data, and adjusts the workflow itself.

The key principle: **everything else in the pipeline exists to make interactive sessions as productive as possible.** The agent shouldn't spend a live session reading through 300 raw listings or applying filters it could have scripted. It should arrive at the session with the pipeline's work already done—a handful of high-quality candidates, summary stats on recent trends, and any flags or anomalies worth discussing.

Interactive sessions are also where the agent builds and improves the rest of the tooling. When a new workflow is being designed, the first few iterations happen interactively—the agent and user figure out the right filters, scoring criteria, and data model together. Once the patterns stabilize, they get codified into scripts, prompt templates, and skills so future sessions can focus on higher-level work.

**Use interactive sessions for:** strategic analysis of pipeline output, drafting complex deliverables, workflow design and iteration, and any decision that benefits from dialogue.

---

## Skills (Codified Procedures)

**What they handle:** Repeatable multi-step processes that should run consistently across sessions without re-explanation.

A skill packages a workflow's procedures—the specific steps, the order they run in, the conventions to follow, the prompt templates to use—into a reusable unit that loads on demand. For a persistent agent, skills solve the continuity problem: even when prior conversation context is gone (new session, context compacted, different day), the skill ensures the agent follows the established process exactly.

Skills should be designed with **progressive disclosure** in mind. At session start, only the skill name and a short description load into context—costing around 30-50 tokens each. The full instructions load only when the skill is activated, and detailed reference files load only when needed during execution.

Skills earn their place after a workflow has been iterated on enough that the steps are stable. A daily data-pull-and-score routine, a proposal drafting checklist, a weekly review procedure—these all benefit from being codified so the agent doesn't drift or skip steps. The anti-pattern is premature codification. If the scoring criteria or pipeline steps are still changing frequently, a skill adds friction.

**Build a skill when:** a multi-step process has been run enough times that the steps are stable, the process will run across many sessions, or consistency matters more than flexibility.

---

## Markdown Files (Context & Notes)

**What they handle:** Unstructured context that shapes how the agent works—goals, preferences, criteria, plans, and evolving notes.

Markdown is the lightest-weight persistence layer. It's where project goals live, where evaluation criteria get drafted before being formalized into prompts, where you capture preferences and the agent records observations.

The agent's memory files serve a specific role: they're the agent's own notes about what it's learned across sessions. Patterns like "this client prefers fixed-price proposals" or "listings from agency accounts tend to underperform" belong in memory files so the agent doesn't have to rediscover them. This follows the principle that **the LLM's context window is working memory; the filesystem is the source of truth.**

**Use markdown when:** information is unstructured, evolving, or primarily context for how work should be done rather than data to be queried. When a markdown file starts accumulating rows you want to filter or sort, it's time to move that data to a database.

---

## Putting It Together

A mature persistent workflow layers these tools in a funnel:

1. **Scripts** fetch new data and apply deterministic filters (high volume → reduced set)
2. **Database** stores everything with timestamps and processing state (enables incremental runs)
3. **Scripted LLM evaluation** scores the survivors against nuanced criteria (reduced set → ranked candidates)
4. **Dashboard** presents the top candidates for review, captures decisions and feedback
5. **Interactive sessions** analyze the best opportunities in depth, draft deliverables, and refine the pipeline
6. **Skills** codify the stable parts of this process so it runs consistently
7. **Markdown files** hold the goals, preferences, and evolving context that inform every other layer

Each layer exists to make the layers below it more efficient. Scripts keep LLM costs down. The database keeps the agent from redoing work. The dashboard keeps you in the loop without requiring your time on low-value items. Skills keep the whole thing running consistently even when context resets between sessions.

When planning a new workflow, three questions drive the design:

1. **Where does volume enter, and how aggressively can we filter before anything expensive happens?** Every item eliminated by a cheap script is a token saved on LLM evaluation.
2. **Where do you need to be involved, and how do we make that involvement as fast and high-leverage as possible?** The dashboard should present decisions, not raw data.
3. **What needs to survive between sessions?** Anything the agent or user learns that should inform future runs needs a durable home—database for structured data, markdown for context, skills for procedures.

The tooling follows from those answers.
