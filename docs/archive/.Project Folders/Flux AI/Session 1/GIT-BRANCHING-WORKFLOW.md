# Git Branching Workflow for Flux AI Chat Implementation
**Complete guide for working on feature branches**
**Date:** November 26, 2025

---

## WHY USE BRANCHES

Since you're implementing major AI chat functionality, you want to:
- Keep main branch stable and deployable at all times
- Work on AI chat features without breaking existing app
- Test thoroughly before merging
- Have ability to rollback if something goes wrong
- Maintain clean commit history

---

## YOUR CURRENT SETUP

**Repository:** C:\Users\watte\OneDrive\Documents\flux-2.0
**Remote:** GitHub (already connected)
**Current branch:** Likely `main`

---

## COMPLETE WORKFLOW - START TO FINISH

### Step 1: Ensure Main is Up to Date

Open PowerShell in your project directory:

```powershell
cd C:\Users\watte\OneDrive\Documents\flux-2.0

# Check current branch
git branch

# Ensure you're on main
git checkout main

# Pull latest changes (in case you worked from another location)
git pull origin main
```

**Expected output:**
```
Already on 'main'
Already up to date.
```

---

### Step 2: Create Feature Branch

Create a new branch for AI chat work:

```powershell
# Create and switch to new branch in one command
git checkout -b feature/ai-chat-integration

# Verify you're on the new branch
git branch
```

**Expected output:**
```
  main
* feature/ai-chat-integration    # Asterisk shows current branch
```

**Branch naming convention:**
- `feature/` prefix for new features
- `bugfix/` prefix for bug fixes
- `hotfix/` prefix for urgent production fixes
- Use hyphens, lowercase

**Examples:**
- `feature/ai-chat-integration` ✅
- `feature/habit-scheduling` ✅
- `bugfix/balance-calculation` ✅

---

### Step 3: Push Branch to GitHub (Backup)

Immediately push the new branch to GitHub:

```powershell
# Push branch to GitHub
git push -u origin feature/ai-chat-integration
```

**What this does:**
- Creates the branch on GitHub
- Sets up tracking (so future `git push` works without arguments)
- `-u` means "set upstream"

**Expected output:**
```
Branch 'feature/ai-chat-integration' set up to track remote branch 'feature/ai-chat-integration' from 'origin'.
```

---

### Step 4: Work on Your Feature

Now implement the AI chat following the Technical Architecture doc.

**Phase 1 Example - Adding API Service:**

1. Create new files:
```powershell
# Create directories if needed
mkdir src\services
mkdir src\constants

# Create files (in VS Code or your editor)
# - src/services/claudeAPI.js
# - src/constants/systemPrompt.js
# - .env.local (with API key)
```

2. Make changes, test in browser

3. Commit your work:

```powershell
# Check what changed
git status

# Stage specific files
git add src/services/claudeAPI.js
git add src/constants/systemPrompt.js
git add .gitignore   # If you updated it to exclude .env.local

# Commit with clear message
git commit -m "Add Claude API service for chat integration

- Create claudeAPI.js with sendMessage function
- Add system prompt constant file
- Configure environment variables for API key"
```

**Commit message best practices:**
- First line: Short summary (50 chars or less)
- Blank line
- Detailed description if needed
- Use present tense: "Add feature" not "Added feature"

---

### Step 5: Push Changes to GitHub Regularly

After each commit (or end of work session):

```powershell
# Push to GitHub
git push
```

**Why push regularly:**
- Backup in case local machine fails
- Can access from other devices
- Shows progress to collaborators
- Creates restore points

---

### Step 6: Continue Development (Repeat Step 4-5)

**Example commit flow for full implementation:**

```powershell
# Phase 1: API Service
git add src/services/claudeAPI.js src/constants/systemPrompt.js
git commit -m "Add Claude API integration service"
git push

# Phase 2: Response Parser
git add src/utils/responseParser.js
git commit -m "Add response parser to extract JSON from Claude"
git push

# Phase 3: Action Executor
git add src/services/actionExecutor.js
git commit -m "Add action executor for habit operations"
git push

# Phase 4: Conversation Manager
git add src/utils/conversationManager.js
git commit -m "Add conversation state management"
git push

# Phase 5: FluxChat Component Update
git add src/components/FluxChat/FluxChat.jsx
git add src/context/FluxChatContext.jsx
git commit -m "Connect FluxChat to AI service with full conversation flow"
git push
```

**Keep commits focused:**
- One logical change per commit
- Don't mix unrelated changes
- Commit working code (should at least compile)

---

### Step 7: Test Thoroughly Before Merging

Before merging to main, test everything:

```powershell
# Run your dev server
npm run dev

# Test in browser (localhost:5173)
# - All Console test scenarios
# - Create habit flow
# - Log activity
# - Query status
# - Edge cases

# Check for errors in console
# Test on mobile viewport
```

**Testing checklist:**
- [ ] No console errors
- [ ] All core flows work (create, log, query)
- [ ] Mobile responsive
- [ ] Data persists across page refresh
- [ ] HabitContext integration works
- [ ] API errors handled gracefully

---

### Step 8: Merge to Main (When Ready)

Once thoroughly tested:

```powershell
# First, ensure feature branch is up to date
git push

# Switch to main branch
git checkout main

# Pull any changes from GitHub (in case you worked elsewhere)
git pull origin main

# Merge feature branch into main
git merge feature/ai-chat-integration

# Push updated main to GitHub
git push origin main
```

**What happens:**
- Your feature branch commits get added to main
- Main now has all AI chat functionality
- Deployment (Vercel) will auto-deploy from main

---

### Step 9: Verify Deployment

After merging to main:

1. Check Vercel dashboard - new deployment should trigger
2. Test production site once deployed
3. Verify everything works in production

---

### Step 10: Clean Up (Optional)

After successful merge and deployment:

```powershell
# Delete local branch
git branch -d feature/ai-chat-integration

# Delete remote branch (optional - keeps GitHub tidy)
git push origin --delete feature/ai-chat-integration
```

**Note:** You can keep branches for historical reference if you want.

---

## COMMON SCENARIOS

### Scenario 1: Need to Switch Back to Main Temporarily

**Situation:** Working on feature branch, but need to fix urgent bug on main.

```powershell
# Save current work (even if incomplete)
git add .
git commit -m "WIP: In progress work on AI chat"
git push

# Switch to main
git checkout main

# Fix bug, commit, push
git add src/components/Portfolio/Portfolio.jsx
git commit -m "Fix balance calculation bug"
git push

# Switch back to feature branch
git checkout feature/ai-chat-integration

# Continue working
```

---

### Scenario 2: Want to Start Over on Something

**Situation:** Made changes you don't like, want to revert.

```powershell
# Discard uncommitted changes to specific file
git checkout -- src/components/FluxChat/FluxChat.jsx

# Discard ALL uncommitted changes (careful!)
git reset --hard HEAD

# Go back to previous commit (loses current changes)
git reset --hard HEAD~1
```

**⚠️ Warning:** These are destructive. Make sure you don't need the changes.

---

### Scenario 3: Merge Conflicts

**Situation:** Main branch changed since you started feature branch.

```powershell
# Update feature branch with main's changes
git checkout feature/ai-chat-integration
git merge main

# If conflicts occur, Git will tell you which files
# Open conflicted files in VS Code
# Look for conflict markers:
# <<<<<<< HEAD
# Your changes
# =======
# Main's changes
# >>>>>>> main

# Edit to resolve, then:
git add <resolved-file>
git commit -m "Merge main into feature/ai-chat-integration"
git push
```

**VS Code helps with conflicts:**
- Shows visual diff
- "Accept Current Change" / "Accept Incoming Change" buttons
- Much easier than manual editing

---

### Scenario 4: Need Multiple Feature Branches

**Situation:** Working on AI chat, but also want to fix unrelated bug.

```powershell
# From main, create another branch
git checkout main
git checkout -b bugfix/portfolio-balance-display

# Work on bug fix
# Commit and push
# Merge when ready

# Meanwhile, AI chat branch remains separate
git checkout feature/ai-chat-integration
# Continue AI chat work
```

**Branches are independent:**
- Can have many branches at once
- Merge each when ready
- Don't interfere with each other

---

## CRITICAL GIT RULES

### Rule 1: Never Commit Secrets
```powershell
# Add to .gitignore
echo ".env.local" >> .gitignore
git add .gitignore
git commit -m "Add .env.local to gitignore"
```

**Never commit:**
- `.env.local` (API keys)
- `node_modules/` (should already be in .gitignore)
- Personal data or test data with PII

---

### Rule 2: Commit Often, Push Regularly

**Good practice:**
- Commit every 1-2 hours of work
- Push at end of each work session
- Push before switching machines

**Bad practice:**
- 1 giant commit with 50 files changed
- Working for days without commits
- Only committing when "perfect"

---

### Rule 3: Write Clear Commit Messages

**Good commits:**
```
Add Claude API integration service

Create claudeAPI.js with sendMessage function that:
- Sends user messages to Claude API
- Includes system prompt with user context
- Handles errors gracefully
- Returns parsed response
```

**Bad commits:**
```
stuff
fixes
more changes
asdf
```

---

### Rule 4: Test Before Merging to Main

**Never merge to main if:**
- Code has console errors
- Features don't work
- You haven't tested key flows
- "I'll fix it later"

**Main should always be deployable.**

---

## QUICK REFERENCE COMMANDS

**Daily workflow:**
```powershell
# Start work session
git checkout feature/ai-chat-integration
git pull    # Get latest from GitHub

# Make changes, test

# End work session
git add .
git commit -m "Clear description of changes"
git push
```

**Check status:**
```powershell
git status              # What changed
git branch              # Which branch am I on
git log --oneline -10   # Recent commits
```

**Undo things:**
```powershell
git checkout -- <file>   # Discard changes to file
git reset --hard HEAD    # Discard ALL changes (careful!)
git revert <commit-hash> # Undo specific commit
```

**Branch management:**
```powershell
git branch                           # List branches
git checkout -b feature/new-thing    # Create and switch
git checkout main                    # Switch to main
git merge feature/new-thing          # Merge into current branch
git branch -d feature/new-thing      # Delete branch
```

---

## WORKFLOW DIAGRAM

```
main branch (always stable)
  │
  ├─> feature/ai-chat-integration (your work)
  │     │
  │     ├─ Commit: Add API service
  │     ├─ Commit: Add response parser
  │     ├─ Commit: Add action executor
  │     ├─ Commit: Update FluxChat component
  │     │
  │     └─ Merge back to main (when ready)
  │
  └─> Continues, now with AI chat
```

---

## YOUR IMPLEMENTATION PLAN

**Week 1: Foundation (Branch: feature/ai-chat-integration)**

```powershell
# Day 1-2: API Service
git checkout -b feature/ai-chat-integration
git push -u origin feature/ai-chat-integration

# Add files, commit, push
git add src/services/claudeAPI.js src/constants/systemPrompt.js
git commit -m "Add Claude API integration service"
git push

# Day 3: Response Parser
git add src/utils/responseParser.js
git commit -m "Add response parser for Claude responses"
git push

# Day 4-5: Action Executor
git add src/services/actionExecutor.js
git commit -m "Add action executor for habit CRUD operations"
git push

# Day 6-7: Conversation Manager
git add src/utils/conversationManager.js
git commit -m "Add conversation state management"
git push

# Day 8-9: FluxChat Update
git add src/components/FluxChat/FluxChat.jsx src/context/FluxChatContext.jsx
git commit -m "Integrate AI service into FluxChat component"
git push

# Day 10-11: Testing
# Fix bugs, refine, commit as you go

# Day 12: Merge to main
git checkout main
git merge feature/ai-chat-integration
git push origin main
```

---

## BEST PRACTICES FOR YOUR PROJECT

**1. Create .gitignore if not exists:**
```
node_modules/
dist/
.env
.env.local
.DS_Store
*.log
.vercel
```

**2. Commit messages for AI chat:**
- "Add [component name] for [purpose]"
- "Update [component] to [do thing]"
- "Fix [issue] in [component]"
- "Test [feature] with [scenario]"

**3. Branch naming for this project:**
- `feature/ai-chat-integration` (main AI chat work)
- `feature/system-prompt-refinement` (if iterating on prompt)
- `bugfix/chat-parsing-error` (if fixing issues)
- `test/console-validation` (if creating test suite)

---

## EMERGENCY: Something Went Wrong

**If you mess up badly:**

```powershell
# See all recent commits
git log --oneline -20

# Go back to specific commit (loses changes after that)
git reset --hard <commit-hash>

# Force push (overwrites GitHub - use cautiously)
git push --force
```

**Before doing anything destructive:**
- Make manual backup of files
- Copy entire directory somewhere safe
- Can always delete branch and start over

---

## GITHUB WEB INTERFACE

**Useful for:**
- Viewing code on phone/tablet
- Checking what's in each branch
- Reviewing commit history
- Creating pull requests (optional - not needed for solo work)

**Access:** https://github.com/[your-username]/flux-2.0

---

## SUMMARY: Your AI Chat Branch Workflow

1. **Create branch:** `git checkout -b feature/ai-chat-integration`
2. **Push to GitHub:** `git push -u origin feature/ai-chat-integration`
3. **Work → Commit → Push:** Repeat throughout development
4. **Test thoroughly:** Before merging to main
5. **Merge to main:** `git checkout main` → `git merge feature/ai-chat-integration`
6. **Push main:** `git push origin main`
7. **Verify deployment:** Check Vercel

**Key principle:** Main stays stable, features developed in branches, merge only when ready.

---

**Ready to start? First command:**
```powershell
git checkout -b feature/ai-chat-integration
```

This creates your branch and switches to it. All your AI chat work happens here until you're ready to merge.
