# Contributing

Thanks for helping with RemitBridge. Before you start, read `CLAUDE.md` (the project's rules,
including the ones that are also code rules) and `DECISIONS.md`.

## Sign off every commit (Developer Certificate of Origin)

Every commit must be signed off under the Developer Certificate of Origin, version 1.1
(https://developercertificate.org). Signing off certifies that you wrote the change, or
otherwise have the right to submit it under this project's license (MIT, see `LICENSE`),
and that you understand the contribution is public and kept with the project.

Sign off by committing with `-s`:

```bash
git commit -s -m "Explain why the change was made"
```

This adds a line with your real name and email to the commit message:

```
Signed-off-by: Your Name <you@example.com>
```

Git takes the name and email from `git config user.name` and `git config user.email`, so set
those first. To sign off commits you already made on your branch:

```bash
git rebase --signoff main
```

Only you can sign off your own work. Nobody, including a maintainer or an AI tool, may add a
sign-off on your behalf.

A check that refuses unsigned commits will be turned on, for pull requests and for pushes
to `main`, when the first outside contributor starts (DECISIONS.md D141).

## Commits

- Commit messages explain why, in plain prose, including what was tried and didn't work.
- Never commit keys or `.env` files.
- Run the tests for what you changed (see `README.md`).
