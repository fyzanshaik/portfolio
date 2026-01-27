---
layout: ../../layouts/BlogPost.astro
title: 'Multiple GitHub Accounts on One Machine'
description: 'A simple guide to using both personal and work GitHub accounts on your workstation'
date: 2026-01-27
tags: ['git', 'github', 'devtools']
---

# Would You Like to Use Both GitHub Accounts on Your Workstation?

If you're like me, you probably have a work GitHub account for your company projects and a personal account for your side projects. The problem? Your workstation is configured for work, and cloning personal repos becomes a nightmare of authentication errors.

Good news: you can have both accounts working seamlessly on the same machine. Here's how I set it up.

---

## The Solution: SSH Keys with Host Aliases

The cleanest approach is using separate SSH keys for each account and configuring SSH to automatically pick the right one based on a host alias.

### Step 1: Generate a New SSH Key for Your Personal Account

```bash
ssh-keygen -t ed25519 -C "your-personal-email@gmail.com" -f ~/.ssh/id_ed25519_personal
```

This creates a new key pair specifically for your personal GitHub account. The `-f` flag ensures it doesn't overwrite your existing work key.

### Step 2: Configure SSH Host Aliases

Edit (or create) your `~/.ssh/config` file:

```bash
# Work account (default)
Host github.com
  HostName github.com
  User git
  IdentityFile ~/.ssh/id_ed25519

# Personal account
Host github.com-personal
  HostName github.com
  User git
  IdentityFile ~/.ssh/id_ed25519_personal
```

The magic here is `github.com-personal` - it's an alias that still connects to `github.com` but uses your personal SSH key.

### Step 3: Add the Public Key to GitHub

Copy your new public key:

```bash
cat ~/.ssh/id_ed25519_personal.pub
```

Then add it to your personal GitHub account:

1. Go to [github.com/settings/keys](https://github.com/settings/keys)
2. Click "New SSH key"
3. Set the key type to **Authentication Key**
4. Paste your key and save

### Step 4: Test the Connection

```bash
ssh -T git@github.com-personal
```

You should see:

```
Hi yourusername! You've successfully authenticated, but GitHub does not provide shell access.
```

---

## Setting Up Commit Signing (Optional but Recommended)

Signed commits show a "Verified" badge on GitHub, proving the commits actually came from you.

### Generate a Signing Key

```bash
ssh-keygen -t ed25519 -C "your-personal-email@gmail.com" -f ~/.ssh/id_ed25519_signing_personal
```

Add this key to GitHub as a **Signing Key** (same process as above, but select "Signing Key" as the type).

---

## Usage: Day-to-Day Workflow

### Cloning Repos

**Work repos** - continue using HTTPS as usual:

```bash
git clone https://github.com/company/repo.git
```

**Personal repos** - use the SSH alias:

```bash
git clone git@github.com-personal:yourusername/repo.git
```

### Configuring a Personal Repo

After cloning a personal repo, you need to set your identity and signing config locally:

```bash
cd your-personal-repo
git config user.name "yourusername"
git config user.email "your-personal-email@gmail.com"
git config gpg.format ssh
git config user.signingkey ~/.ssh/id_ed25519_signing_personal
git config commit.gpgsign true
```

---

## Pro Tip: Create a Shell Alias

Running those config commands every time is tedious. Add this function to your `~/.zshrc` (or `~/.bashrc`):

```bash
# Personal GitHub setup
git-personal() {
  git config user.name "yourusername"
  git config user.email "your-personal-email@gmail.com"
  git config gpg.format ssh
  git config user.signingkey ~/.ssh/id_ed25519_signing_personal
  git config commit.gpgsign true
  echo "✓ Configured for personal GitHub"
}
```

Now your workflow becomes:

```bash
git clone git@github.com-personal:yourusername/repo.git
cd repo
git-personal
```

Three commands, and you're ready to code with signed commits!

---

## Quick Reference

| Task                | Command                                           |
| ------------------- | ------------------------------------------------- |
| Clone personal repo | `git clone git@github.com-personal:user/repo.git` |
| Clone work repo     | `git clone https://github.com/company/repo.git`   |
| Setup personal repo | `git-personal` (after adding the alias)           |
| Test personal SSH   | `ssh -T git@github.com-personal`                  |

---

## Summary

- SSH keys with host aliases let you use multiple GitHub accounts without conflicts
- Your work HTTPS workflow stays completely unchanged
- Personal repos use `github.com-personal` as the host
- A shell alias makes per-repo setup a one-liner
- Signing keys add that nice "Verified" badge to your commits

No more authentication headaches. Both accounts, one machine, zero friction.

Happy coding!
