# Issue tracker: GitHub

Issues and specs live in GitHub Issues for `dotknewt/tools`.
Use the `gh` CLI from this repository.

## Operations

- Create: `gh issue create --title "..." --body "..."`
- Read: `gh issue view <number> --json number,title,body,labels,comments`
- List: `gh issue list --state open --json number,title,body,labels`
- Comment: `gh issue comment <number> --body "..."`
- Label: `gh issue edit <number> --add-label "..." --remove-label "..."`
- Close: `gh issue close <number> --comment "..."`

Use a heredoc for multiline bodies.
"Publish to the issue tracker" means create a GitHub issue.
"Fetch the relevant ticket" means read the GitHub issue.

## Pull requests as a triage surface

PRs as a request surface: no.

## Parent tickets and dependencies

Use native GitHub sub-issues and issue dependencies when available.
Otherwise, add `Part of #<parent>` and `Blocked by: #<number>` lines
to child issue bodies, and link children in the parent's task list.
A ticket is unblocked when all its blockers are closed.
