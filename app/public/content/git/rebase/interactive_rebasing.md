# Understanding Interactive Rebasing in Git

Interactive rebasing is one of Git's most powerful features, allowing you to rewrite your commit history with precision and control. Let's explore this concept from first principles, building our understanding step by step.

## First Principles: What is a Git Commit?

To understand rebasing, we need to first understand what a Git commit truly is.

A Git commit is fundamentally a snapshot of your entire repository at a specific point in time. Each commit has:

1. A unique identifier (SHA-1 hash)
2. A pointer to the previous commit (parent)
3. Metadata (author, timestamp, message)
4. A complete snapshot of all tracked files

Git commits form a linked list structure, where each commit points to its parent. This creates a chain of commits that represents your project's history.

## What is Rebasing?

At its core, rebasing is the process of changing the base of your branch. Let's break down the term:

 **Re-base** : To change the base (starting point) of a series of commits.

When you create a branch, it starts from a specific commit (its "base"). As you make changes, your branch diverges from its original base. Rebasing allows you to move those changes to a different starting point, as if you had created your branch from that new location originally.

## Interactive Rebasing: The Core Concept

Interactive rebasing (`git rebase -i`) takes this concept further by allowing you to manipulate individual commits during the rebasing process. It's like saying: "I want to move my changes to a new starting point, AND I want to edit those changes along the way."

## The Mental Model: Commits as Patches

To truly understand rebasing, think of commits not as snapshots but as patches (changes from one state to another).

Regular rebasing says: "Take all my patches and apply them on top of this new commit."
Interactive rebasing says: "Let me review, edit, reorder, combine, or drop individual patches before applying them."

## When to Use Interactive Rebasing

Interactive rebasing is particularly useful when you want to:

1. Clean up your commit history before sharing it
2. Fix mistakes in previous commits
3. Combine related changes that were made in separate commits
4. Reorder commits to create a more logical history
5. Split large commits into smaller ones
6. Edit commit messages

## The Interactive Rebasing Process

Let's walk through the process step by step:

### 1. Starting the Interactive Rebase

The basic command is:

```bash
git rebase -i <base-commit>
```

Where `<base-commit>` is the commit you want to start applying your changes on top of. Often, this is specified as a relative reference like:

```bash
git rebase -i HEAD~3  # Interactively rebase the last 3 commits
```

### 2. The Rebase TODO List

After running this command, Git opens an editor with a "todo" list that looks something like this:

```
pick f7f3f6d Change button color
pick 310154e Update header text
pick a5f4a0d Fix navigation bug

# Rebase 710f0f8..a5f4a0d onto 710f0f8
#
# Commands:
# p, pick <commit> = use commit
# r, reword <commit> = use commit, but edit the commit message
# e, edit <commit> = use commit, but stop for amending
# s, squash <commit> = use commit, but meld into previous commit
# f, fixup <commit> = like "squash", but discard this commit's log message
# x, exec <command> = run command (the rest of the line) using shell
# b, break = stop here (continue rebase later with 'git rebase --continue')
# d, drop <commit> = remove commit
#
# These lines can be re-ordered; they are executed from top to bottom.
#
# If you remove a line here THAT COMMIT WILL BE LOST.
#
# However, if you remove everything, the rebase will be aborted.
```

This is your instruction list for Git. Each line represents a commit, and the command at the beginning tells Git what to do with that commit.

### 3. Modifying the Rebase TODO List

You can now edit this file to change how Git will apply your commits. Let's look at each command in detail:

#### `pick` - Use the commit as-is

```
pick f7f3f6d Change button color
```

This tells Git to include this commit without changes.

#### `reword` - Edit the commit message

```
reword f7f3f6d Change button color
```

Git will stop and let you modify the commit message, but won't change the commit's contents.

#### `edit` - Pause to amend the commit

```
edit f7f3f6d Change button color
```

This tells Git to stop at this commit, allowing you to make changes to the files themselves. After making changes, you'll need to:

```bash
git add <files>
git commit --amend
git rebase --continue
```

#### `squash` - Combine with the previous commit

```
pick f7f3f6d Change button color
squash 310154e Update header text
```

This will combine the second commit with the first one. Git will prompt you to edit the combined commit message.

#### `fixup` - Combine with the previous commit, discard message

```
pick f7f3f6d Change button color
fixup 310154e Update header text
```

Similar to squash, but it automatically uses the first commit's message without prompting.

#### `drop` - Remove the commit entirely

```
drop a5f4a0d Fix navigation bug
```

This eliminates the commit and its changes from history.

#### Reordering commits

You can also change the order of the lines to reorder your commits:

```
pick a5f4a0d Fix navigation bug
pick f7f3f6d Change button color
pick 310154e Update header text
```

### 4. Saving and Executing the Rebase

After making your changes, save and close the editor. Git will then execute your instructions one by one, applying each commit according to your instructions.

## Real-World Examples

Let's look at some practical examples to solidify our understanding:

### Example 1: Fixing a Typo in an Earlier Commit

Imagine you have this history:

```
A -- B -- C -- D (HEAD)
```

where C contains a typo in a comment. Here's how you'd fix it:

```bash
git rebase -i B
```

In the editor, change the line for commit C:

```
pick <hash-of-B> Add feature X
edit <hash-of-C> Fix bug in login
pick <hash-of-D> Update documentation
```

Save and close. Git will stop at commit C. Then:

```bash
# Edit your file to fix the typo
git add <file>
git commit --amend
git rebase --continue
```

### Example 2: Combining Related Commits

Imagine you have these commits:

```
A -- B -- C -- D -- E (HEAD)
```

where C, D, and E are all related to the same feature. To combine them:

```bash
git rebase -i B
```

In the editor:

```
pick <hash-of-C> Add login form HTML
squash <hash-of-D> Style login form
squash <hash-of-E> Add login form validation
```

Git will prompt you to edit the combined commit message, creating a new, cleaner history:

```
A -- B -- C' (HEAD)
```

where C' contains all the changes from C, D, and E.

### Example 3: Reordering and Dropping Commits

Let's say you have:

```
A -- B -- C -- D -- E (HEAD)
```

where D is an experimental change you don't want to keep, and you want to move C after E:

```bash
git rebase -i A
```

In the editor:

```
pick <hash-of-B> Update dependencies
pick <hash-of-E> Add user profile page
pick <hash-of-C> Fix navigation layout
drop <hash-of-D> Experiment with new color scheme
```

This gives you:

```
A -- B -- E' -- C' (HEAD)
```

## Potential Pitfalls and How to Handle Them

### 1. Merge Conflicts

When rebasing, Git is essentially replaying your changes on top of different commits. This can lead to conflicts if the same lines were changed in both places.

If a conflict occurs, Git will pause the rebase and let you resolve the conflict:

```bash
# Git shows conflict markers in the files
# Edit files to resolve conflicts
git add <resolved-files>
git rebase --continue
```

If you make a mistake or want to abort the rebase:

```bash
git rebase --abort
```

### 2. Changing Public History

One critical rule in Git:  **Never rebase commits that have been pushed to a shared repository** . Rebasing changes commit hashes, which means you're effectively creating new commits that replace the old ones. This can cause serious problems for collaborators.

### 3. Lost References

When you rebase, Git may perform garbage collection on unreferenced commits. If you realize you've made a mistake, you can often recover with:

```bash
git reflog
# Find the commit hash from before the rebase
git reset --hard <hash>
```

## Advanced Interactive Rebasing Techniques

### 1. Splitting a Commit

To split a single commit into multiple commits:

```bash
git rebase -i <commit>^  # The ^ means "parent of"
```

Mark the commit you want to split with `edit`. Then:

```bash
git reset HEAD^  # Undo the commit but keep changes staged
git reset HEAD   # Unstage all changes
# Stage and commit changes in logical groups
git add file1
git commit -m "First part"
git add file2
git commit -m "Second part"
git rebase --continue
```

### 2. Using `exec` to Test Each Commit

You can use the `exec` command to run tests after each commit:

```
pick abc123 Fix bug
exec npm test
pick def456 Add feature
exec npm test
```

This ensures each individual commit keeps your tests passing.

## Practical Workflow Example

Let's walk through a complete workflow example. Imagine you've been working on a feature branch with several commits:

```
main            A -- B -- C
                 \
feature          D -- E -- F -- G -- H
```

You realize:

* Commit E has a typo in its message
* Commits F and G should be combined
* Commit H should be split into two separate commits

Here's how you'd clean up your history:

```bash
git checkout feature
git rebase -i D
```

In the editor:

```
reword <hash-of-E> Add user authentication
pick <hash-of-F> Style login form
squash <hash-of-G> Add form validation
edit <hash-of-H> Add password reset
```

Git will first stop to let you fix the commit message for E. Then it will stop at H to let you split it:

```bash
git reset HEAD^
git add password-reset-request.js
git commit -m "Add password reset request"
git add password-reset-confirm.js
git commit -m "Add password reset confirmation"
git rebase --continue
```

The result:

```
main            A -- B -- C
                 \
feature          D -- E' -- F' -- H1 -- H2
```

Where:

* E' has the fixed commit message
* F' contains the changes from both F and G
* H1 and H2 are the split parts of the original H

## Conclusion: The Philosophy of Interactive Rebasing

Interactive rebasing embodies a key philosophy in Git: Your commit history should tell a clear, logical story about how your project evolved. It's not just a record of what happened, but a curated narrative that helps others (and your future self) understand the project.

By mastering interactive rebasing, you gain precise control over this narrative, allowing you to present your work in the most clear, logical, and professional manner possible.

Remember: With great power comes great responsibility. Use interactive rebasing judiciously, especially when working with shared repositories, and always communicate clearly with your team about your Git workflow practices.
