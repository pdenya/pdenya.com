# Writing Style Guide

Based on analysis of recent blog posts (2025).

## Tone and Voice

### Direct and Solution-Focused
- Get straight to the solution—show the command or code within the first few lines
- Brief context, then immediate action
- Example: "If you're trying to set up Browser MCP with Claude Code here's what you actually need to run:" followed immediately by the command
- No lengthy preambles or scene-setting

### Conversational but Technical
- Write like you're helping a peer who has the same problem you just solved
- Slightly dry humor and sarcastic asides: "of course macOS doesn't ship updated core tools"
- Technical precision without being pedantic
- Minimal hype—mostly matter-of-fact, occasional "amazing" when something is genuinely impressive

### Pragmatic and Experience-Driven
- Frame posts around real problems you encountered
- Personal motivation: "I wanted a scratchpad that lives with the code..."
- Show real workflow examples and realistic use cases
- "or more realistically, a list of the class names you're trying to include"

## Structure

### Frontmatter
- YAML format with `---` delimiters
- **Title**: Direct and descriptive, sometimes with subtitle after colon
- **Categories**: Broad (e.g., "Development", "devtools")
- **Tags**: Specific tools and technologies
- **Date**: ISO format with timezone

### Post Organization
1. **Opening**: Problem statement or personal context (1-2 sentences)
2. **Solution**: Command/code shown immediately, often within first 3-5 lines
3. **Sections**: Explain details, show configurations, provide context
4. **Closing**: May include "Pro tip", GitHub link, or closing remark

### Headings
- Use ## for main sections
- Use ### for subsections
- Common section headers:
  - "Why" / "Why not..."
  - "How it works"
  - "Configuration"
  - "Commands" / "Usage"
  - "Tips" / "Pro tip"
  - "Get the script"
  - "What is X?" (explainer sections)

## Content Patterns

### Code Blocks
- Always include language tags (bash, zsh, ini, etc.)
- Use `#=>` to show expected output in command examples
- Use `#` for inline explanatory comments in code examples
- Full, copy-pasteable configuration blocks when relevant

### Example Output Style
```bash
note first-idea
#=>  Created: SideNotes/2025-08-08_14-22_first-idea.md
```

or with `$` prompt to show input/output:

```bash
$ catcopy "issue|problem"
Copied contents of 5 file(s) to clipboard:
 - ./content/posts/os-x-pg-gem-install-or-bundle-install-issues.md
```

### Lists
- Use `-` for bullet points
- Lists for features, reasons, or tips
- Often start with casual lead-ins: "Mostly because..."
- Keep items parallel in structure
- Parenthetical examples inline: (e.g. `note performance-sweep`)

### Screenshots
- Include for UI navigation or visual results
- Descriptive alt text
- Format: `![description](/images/filename.png)`

### Links
- Inline tool/library links on first mention with standard markdown: `[tool name](url)`

## Language Quirks

### Opening Patterns
- Exclamatory personal update: "Big upgrades to my `git diff` experience today!"
- Personal motivation: "I wanted a scratchpad that..."
- Problem-focused: "If you're trying to set up..."
- Contextual explanation: "Copilot, Cursor, Claude Code, etc are convenient for automatically pulling relevant files..."

### Common Phrases
- "That's it!" (after showing simple solution)
- "or more realistically..."
- "Mostly because..."
- "can't keep every little thing..."
- "of course..." (sarcastic)
- "Here's what you actually need..." (cutting through confusion)
- "First, install..." / "Next, configure..." (sequential instructions)
- "Now you can..." (showing the payoff)
- "Try it out immediately with:"
- "Grab the code here:"
- "Hope this saves someone else the time I spent hunting for this!"

### Typography
- Inline code with `backticks` for commands, filenames, variables, and tool names
- Bold for UI navigation: **Preferences → Advanced**
- Parenthetical clarifications throughout (e.g. `note performance-sweep`)

### Technical Details
- Show exact file paths: `~/.gitconfig`, `~/.zsh_functions/catcopy.sh`
- Include real examples from actual workflow
- Specific tool versions or package names where relevant
- UI navigation spelled out with arrow (→): **Preferences → Advanced**

## What to Avoid

- Long introductions before the solution
- Overly formal or academic tone
- Excessive marketing language (unless genuinely warranted)
- Over-explaining obvious steps to developers
- Generic advice without specific commands/code

## Signature Moves

1. **Command First**: Show the executable solution within first few lines
2. **Realistic Qualifier**: "or more realistically..." when showing practical usage
3. **Sarcastic Aside**: Acknowledge frustrations with dry humor
4. **Full Config**: Provide complete, copy-pasteable configuration files
5. **Pro Tip Section**: Optional advanced usage note
6. **Time-Saver Close**: "Hope this saves someone else the time I spent..."
7. **GitHub Link**: When sharing custom tools, end with repo link

## Closing Styles

Choose one based on the post type:
- GitHub link: "Grab the code here: [Tool on GitHub](url)"
- Community-minded: "Hope this saves someone else the time I spent hunting for this!"
- Explanatory: Describe what config options do (end with explanation)
- Clean finish: Just end after the code/explanation

## Voice Consistency Checklist

- [ ] Does the solution appear in the first 3-5 lines?
- [ ] Are all code blocks tagged with language?
- [ ] Are commands actually copy-pasteable?
- [ ] Is the tone conversational without being chatty?
- [ ] Have I removed obvious explanations?
- [ ] Are examples from real usage, not made up?
- [ ] Did I use `#=>` for example output?
- [ ] Does it solve a real problem I actually had?
