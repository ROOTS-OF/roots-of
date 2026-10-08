# roots-of/roots-of

This repo is the `ROOTS-OF` org's own abstract-class repo: the freeform
meta-schema for what a "rootfs" repo in this org looks like, not a literal
GitHub `--template` repo.

## What "rootfs" means here

A rootfs is the real artifact GitHub's own template mechanism cannot
express at the granularity this org needs: `wsl --export`/`--import`
(or an OCI image, a `debootstrap`/`mkosi`/`distrobuilder` build, a Packer
image) of an actual running environment — the "pets vs. cattle" /
immutable-infrastructure discipline applied to an agentic workspace's own
filesystem, not just its application code.

## Why this is a meta-schema, not a template

GitHub's native `--template` copies a whole repo tree as one fresh initial
commit. That's the right tool when there really is one canonical shape to
copy wholesale. It is explicitly NOT what `roots-of/roots-of` is: this
abstract-class zone is a place where multiple implementers can each
legitimately disagree about what "rootfs repo" even means or should look
like for their own case, and may each contribute their own opinionated
pattern here rather than one of them being declared the only correct
template.

`templates-of/` (a separate, not-yet-built org) is where a genuinely
single-opinion, whole-repo-sized, literally-templatable artifact would
live instead.

## Real monorepo instances built on this pattern

- `Roots-Of/MERIDIAN-0QQ` — MERIDIAN_Blue's own 2D agentic-system rootfs.
  Cast-subfolder structure (`AS/MERIDIAN-OTTOBOT/AS/PFM___/AS/LeagueOS/_`)
  scaffolded 2026-10-08; tracked in `PFM___/ROOTS-OF-PROGRESS.md` in the
  PlayFieldMultiplier office. Real next step there: a versioned
  rootfs-instance descriptor/lifecycle and a real Red/Blue isolation
  contract — flagged by Meridian Red's review, not yet built.
- Qadence Tessel's own rootfs — planned, not yet started, expected to
  adopt and contribute back to whatever pattern gets set down here.

## Branch hygiene

`main` is protected: every change here goes through a real PR, no direct
pushes, even for this bootstrap commit. See this repo's branch protection
settings and the PR that added this file for the real precedent.
