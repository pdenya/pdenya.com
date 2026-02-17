---
date: '2026-02-17T10:00:00-05:00'
draft: false
title: 'Anthropic API knows more pirate jokes than AWS Bedrock (and is faster)'
categories: [Development]
tags: [claude-code, aws, bedrock, performance, cli]
---

A quick test to see if Claude Code runs faster using the Anthropic API or the AWS Bedrock API (same model, folder, environment) revealed something *shocking*. Anthropic API knows double the number of pirate jokes compared to AWS Bedrock. If this is a metric you care about then the results speak for themselves.

## Speed Results

Same prompt, same model, 6 runs each:

| Provider | Avg | Min | Max |
|---|---|---|---|
| **Anthropic** | **5.90s** | 5.66s | 6.12s |
| **Bedrock** | **7.22s** | 5.91s | 9.01s |

Anthropic's API is **~1.3 seconds** faster. ~18% for short requests. 

Bedrock also had more variance (3.1s spread vs 0.5s for Anthropic), with one outlier run hitting 9 seconds.

## Raw data

### AWS Bedrock
```bash
$ time claude --print "Tell me a short pirate joke (one or two sentences max)"
Why couldn't the pirate play cards? Because he was standing on the deck!
claude --print "Tell me a short pirate joke (one or two sentences max)"  1.26s user 0.44s system 23% cpu 7.341 total

$ time claude --print "Tell me a short pirate joke (one or two sentences max)"
Why couldn't the pirate play cards? Because he was standing on the deck!
claude --print "Tell me a short pirate joke (one or two sentences max)"  1.21s user 0.39s system 17% cpu 9.007 total

$ time claude --print "Tell me a short pirate joke (one or two sentences max)"
Why couldn't the pirate play cards? Because he was standing on the deck!
claude --print "Tell me a short pirate joke (one or two sentences max)"  1.10s user 0.38s system 21% cpu 6.852 total

$ time claude --print "Tell me a short pirate joke (one or two sentences max)"
Why couldn't the pirate play cards? Because he was standing on the deck!
claude --print "Tell me a short pirate joke (one or two sentences max)"  1.27s user 0.41s system 23% cpu 6.988 total

$ time claude --print "Tell me a short pirate joke (one or two sentences max)"
Why couldn't the pirate play cards? Because he was standing on the deck!
claude --print "Tell me a short pirate joke (one or two sentences max)"  1.22s user 0.41s system 27% cpu 5.912 total

$ time claude --print "Tell me a short pirate joke (one or two sentences max)"
Why couldn't the pirate play cards? Because he was standing on the deck!
claude --print "Tell me a short pirate joke (one or two sentences max)"  1.17s user 0.41s system 21% cpu 7.216 total
```

### Anthropic

```bash
$ time claude --print "Tell me a short pirate joke (one or two sentences max)"
Why did the pirate go to school? Because he wanted to improve his "arrrr-ticulation."
claude --print "Tell me a short pirate joke (one or two sentences max)"  1.21s user 0.42s system 27% cpu 5.911 total

$ time claude --print "Tell me a short pirate joke (one or two sentences max)"
Why couldn't the pirate play cards? Because he was standing on the deck.
claude --print "Tell me a short pirate joke (one or two sentences max)"  1.27s user 0.41s system 27% cpu 6.017 total

$ time claude --print "Tell me a short pirate joke (one or two sentences max)"
Why did the pirate go to school? Because he wanted to improve his "arrrr-ticulation."
claude --print "Tell me a short pirate joke (one or two sentences max)"  1.26s user 0.44s system 28% cpu 5.877 total

$ time claude --print "Tell me a short pirate joke (one or two sentences max)"
Why did the pirate go to school? Because he wanted to improve his "arrrticulation."
claude --print "Tell me a short pirate joke (one or two sentences max)"  1.25s user 0.41s system 27% cpu 6.121 total

$ time claude --print "Tell me a short pirate joke (one or two sentences max)"
Why couldn't the pirate play cards? Because he was standing on the deck.
claude --print "Tell me a short pirate joke (one or two sentences max)"  1.17s user 0.40s system 27% cpu 5.658 total

$ time claude --print "Tell me a short pirate joke (one or two sentences max)"
Why did the pirate go to school? Because he wanted to improve his "arrrr"-ticulation!
claude --print "Tell me a short pirate joke (one or two sentences max)"  1.32s user 0.43s system 30% cpu 5.804 total
```

## Takeaway

Pretty surprised that Anthropic is faster. Anthropic API goes down sometimes, Bedrock is still a great fallback.