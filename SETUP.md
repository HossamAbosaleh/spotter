# Spotter — Setup Guide

> A complete walkthrough for getting your Spotter project running locally and pushed to GitHub. Written assuming you've never deployed a Node.js project before.

This guide has two parts:

1. **Get it running on your computer** (~15 minutes)
2. **Push it to GitHub and Vercel** (~10 minutes)

Then you're ready to start Phase P0.5 with `/impeccable teach`.

---

## Part 1 — Run it locally

### Step 1: Install Node.js (if you don't already have it)

You need **Node.js 20 or newer**. Check what you have:

```bash
node --version
```

If it says `v20.x.x` or higher, you're good. If it says something lower or "command not found":

- **macOS:** install via [Homebrew](https://brew.sh/) — `brew install node@20`
- **Windows:** download from [nodejs.org](https://nodejs.org/) (LTS version)
- **Linux:** use your distro's package manager, or [nvm](https://github.com/nvm-sh/nvm)

After installing, restart your terminal and run `node --version` again to confirm.

### Step 2: Open the project in your terminal

If you got this project as a folder, open a terminal and navigate to it:

```bash
cd path/to/spotter
```

You should see files like `package.json`, `README.md`, and folders like `src/`, `tests/`, `.github/`.

### Step 3: Install the dependencies

```bash
npm install
```

This downloads everything the project needs. Takes 1-3 minutes the first time. You'll see a `node_modules/` folder appear (it's huge — that's normal, and `.gitignore` already excludes it from git).

### Step 4: Run it

```bash
npm run dev
```

You'll see something like:

```
VITE v5.4.x  ready in 423 ms

  ➜  Local:   http://localhost:5173/
  ➜  Network: http://192.168.x.x:5173/
```

Open `http://localhost:5173/` in your browser. You should see the Spotter landing page with the lime tagline. Press **Ctrl+C** in the terminal to stop the dev server.

### Step 5: Run the quality checks

These are the same checks GitHub will run on every PR:

```bash
npm run check
```

This runs (in order): TypeScript type check → ESLint → Prettier format check → unit tests.

All four should pass. If they don't, something's broken with the install — try deleting `node_modules` and running `npm install` again.

✅ **You now have Spotter running locally.**

---

## Part 2 — Push to GitHub and deploy on Vercel

### Step 6: Create a GitHub account (if you don't have one)

Sign up at [github.com](https://github.com). Free.

### Step 7: Install Git (if you don't have it)

Check:

```bash
git --version
```

If you see `git version 2.x.x`, you're good. If not:

- **macOS:** `brew install git` or just run any `git` command and macOS will offer to install it
- **Windows:** [git-scm.com](https://git-scm.com/download/win)
- **Linux:** your package manager — `sudo apt install git` or equivalent

### Step 8: Configure Git (one-time)

```bash
git config --global user.name "Your Name"
git config --global user.email "your-email@example.com"
```

Use the same email as your GitHub account.

### Step 9: Verify project name availability

Before creating the GitHub repo, quickly check:

1. Go to `https://github.com/hossamabosaleh/spotter` in your browser. If it 404s (page not found), the name is available for you. If it shows a repo, that means you (or someone with the same username pattern) already has one — pick a different name.
2. Optional: search "spotter app" on Google to see if there's a major existing project with the same name.

If "spotter" is taken, use one of these alternatives in the next steps:

- `spotter-app`
- `spotter-gym`
- `getspotter`

For the rest of this guide, replace "spotter" with whatever you chose.

### Step 10: Create the GitHub repository

1. Go to [github.com/new](https://github.com/new)
2. Repository name: `spotter` (or your alternative)
3. Description: `Your gym, your data, your AI coach.`
4. Public (open source means public)
5. **Do NOT** check "Add a README", "Add .gitignore", or "Add a license" — we already have all three
6. Click **Create repository**

GitHub will show you a page with commands. **Don't run those yet** — we'll do this differently.

### Step 11: Initialize git in your project

In your terminal, in the spotter folder:

```bash
git init
git branch -M main
```

This creates a local git repo on the `main` branch.

### Step 12: Update the README and package.json with your username

Open `README.md` and `package.json`. Find the `hossamabosaleh` placeholders and replace them with your actual GitHub username. The same in `LICENSE` and `SECURITY.md`.

Quick search-and-replace if your editor supports it:

- Find: `hossamabosaleh`
- Replace: your actual GitHub username

### Step 13: First commit

```bash
git add .
git commit -m "feat(p0): initial project foundation

- Vite + React + TypeScript + Tailwind scaffold
- GitHub Actions CI (typecheck, lint, format, test, build, audit)
- Vercel config with strict CSP and security headers
- PWA setup
- Spotter design skill and starter design system
- Spec Kit input files
- README, CONTRIBUTING, SECURITY, MIT LICENSE"
```

You should see something like `33 files changed, X insertions(+)`.

### Step 14: Connect to GitHub and push

Replace `hossamabosaleh` with your actual GitHub username:

```bash
git remote add origin https://github.com/hossamabosaleh/spotter.git
git push -u origin main
```

GitHub may ask you to authenticate. If it asks for a password, you'll need to use a [Personal Access Token](https://docs.github.com/en/authentication/keeping-your-account-and-data-secure/managing-your-personal-access-tokens) (regular password auth was deprecated). Or set up SSH keys for an easier long-term experience.

After it pushes, refresh your GitHub repo page. You should see all your files there.

✅ **Your code is on GitHub.**

### Step 15: Verify CI works

GitHub will automatically run the CI workflow on your push. Click the **Actions** tab in your repo. You should see "CI" running, then green ✓ within a few minutes. If it fails, click into it to see why — usually a small fix.

### Step 16: Deploy to Vercel (optional but recommended)

1. Go to [vercel.com](https://vercel.com) and sign up with your GitHub account
2. Click **Add New** → **Project**
3. Import your `spotter` repository
4. Vercel auto-detects it as Vite — leave the defaults
5. Click **Deploy**

About 2 minutes later, Vercel gives you a URL like `https://spotter-xyz.vercel.app/`. Visit it. Your landing page is live.

Every push to `main` from now on auto-deploys. No further setup needed.

✅ **Your app is publicly deployed.**

---

## Part 3 — What to do next

### Immediate next steps (Phase P0 wrap-up)

1. **Archive the old `gym-guide-v3` repo** — go to its Settings → "Archive this repository" — and add a README pointer to the new Spotter repo
2. **Add an "Export my data" button to the old `gym-guide-v3` deployment** — a small one-off task so you don't lose your training history when migrating in P7
3. **Add Vercel project URL to README** — replace any placeholder URLs

### Starting Phase P0.5 (Design System Foundation)

Open Claude Code in the Spotter project folder. Then:

1. **Install Spec Kit** in Claude Code (follow the [official Spec Kit installation guide](https://github.com/github/spec-kit))

2. **Install the design skills** (commands are in `.claude/skills/spotter-design/README.md`):
   - Impeccable
   - AccessLint
   - Vercel composition-patterns

3. **Run `/speckit.constitution`** — paste the content of `spec-kit-input/constitution-prompt.md` as the prompt. This generates `spec/constitution.md`.

4. **Run `/speckit.specify`** for Phase P0 — point at `spec-kit-input/plan.md` and ask it to specify Phase P0. This will mostly confirm what we already built. (Alternatively, skip ahead to P0.5 if you're comfortable that P0 is done.)

5. **For Phase P0.5, run `/impeccable teach`** — this is the magic moment. It interactively interviews you about Spotter's identity, audience, tone, and constraints, then generates a refined `DESIGN.md`. The starter `DESIGN.md` we shipped will be the input it builds on.

6. **Continue with `/speckit.plan` and `/speckit.tasks` for P0.5.** Then `/speckit.implement`.

### Common issues and fixes

**`npm install` fails with "EACCES" or permission errors:**
You might be using sudo. Don't. Either fix npm's default directory ([guide](https://docs.npmjs.com/resolving-eacces-permissions-errors-when-installing-packages-globally)) or use [nvm](https://github.com/nvm-sh/nvm).

**`npm run dev` says "port 5173 already in use":**
Either close the other instance, or run on a different port: `npm run dev -- --port 3000`.

**TypeScript errors after pulling new code:**
Run `npm install` again — dependencies may have changed.

**Vercel build fails but local build works:**
Usually a Node version mismatch. Check Vercel's project settings → ensure Node version is 20.x.

**Claude Code skills don't trigger:**
Restart Claude Code after installing skills. Verify they appear in `/skills`. If using the `spotter-design` skill, it auto-triggers on UI work — try mentioning a UI task.

### Where to ask for help

- GitHub Discussions on your repo (if you turn them on in Settings)
- The Spec Kit GitHub repo for Spec Kit-specific questions
- The Impeccable repo or Discord for design skill questions

---

## You're set up. Now go build Spotter. 💪

The hard part of any new project is the first commit. You've already done it. Phases P1 through P9 are step-by-step from here — and the spec, plan, and design system already exist. Just follow the road map.
