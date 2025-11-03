---
date: '2025-11-03T10:32:59-05:00'
draft: false
title: 'Claude Code Timesheets: Track Your AI-Assisted Development Time'
categories: [Development]
tags: [python, claude-code, productivity, time-tracking, cli]
---

I've been freelancing and using [Claude Code](https://claude.com/claude-code) for client work. Claude saves your full conversation history w/timestamps on disk. I wrote [cctimesheet](https://github.com/pdenya/cctimesheet) to parse these files and give me data I can use for billing. Tracking 15 minute increments, it's much more granular than the way I track it myself.

## Usage

```bash
# Last 30 days
pipx run cctimesheet 30

# Since October 1, 2025
pipx run cctimesheet 20251001

# Filter by client/project
pipx run cctimesheet 20251001 -p "*acme*" -g
```

## Output

```
================================================================================
CLAUDE CODE TIMESHEET
================================================================================
Since October 01, 2025 | Filter: *client-project*

WEEKLY SUMMARY
--------------------------------------------------------------------------------
  Oct 27 - Nov 02, 2025                                         19.75 hrs
  Oct 20 - Oct 26, 2025                                         21.50 hrs
  Oct 13 - Oct 19, 2025                                          5.25 hrs
  Oct 06 - Oct 12, 2025                                         11.00 hrs


DAILY BREAKDOWN
--------------------------------------------------------------------------------

Friday, Nov 01, 2025

  client-project/api                                                 3.50 hrs
  client-project/frontend                                            1.25 hrs
  ----------------------------------------------------------------- ---------
  Daily Total                                                        4.75 hrs

Thursday, Oct 31, 2025

  client-project/api                                                 5.00 hrs
  ----------------------------------------------------------------- ---------
  Daily Total                                                        5.00 hrs

[...]

================================================================================
  TOTAL HOURS                                                       57.50 hrs
================================================================================
```

Weekly summaries are perfect for billing cycles—no more manual addition.

## Why 15-minute blocks?

Messages are grouped into 15-minute intervals. Multiple messages in the same interval count as one block (0.25 hours). Gaps with no activity are automatically excluded.

```
14:42 - User message
14:43 - Assistant response  } → 1 block (0.25 hrs)
14:44 - User follow-up

14:50 - Assistant response  } → 1 block (0.25 hrs)

Total: 0.5 billable hours
```

This naturally filters out breaks, lunch hours, and idle time.

## Pro tips

Use `--group-time` (`-g`) when you have the same client spread across multiple project directories. By default, if you work on multiple projects during the same 15-minute block, each project counts that block separately. With `-g`, unique timeblocks are counted only once across all filtered projects—so you don't bill the same client twice for the same work.

```bash
pipx run cctimesheet -p "*acme*" -g
```

Use `-e` (exclude) to filter out any directories accidentally getting included in your `-p` filter.

```bash
pipx run cctimesheet -p "*acme*" -e "*stacme*" -g
```

Grab the code here: [cctimesheet on GitHub](https://github.com/pdenya/cctimesheet)
