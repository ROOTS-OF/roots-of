# Rootfs-instance descriptor contract (v1.1)

**v1.1 change** (real-world driven, same day as v1.0): a Docker daemon
running multiple Compose projects (LeagueOS_Blue's real case: four
`leagueos-*` stacks) gets a separate auto-generated bridge and subnet per
project, not one shared bridge for the whole daemon. `isolation.bridge` and
`isolation.addressPool` widened from a single string to an array of
strings, same shape as `networks`/`volumes`, so a descriptor can list the
real, full set instead of forcing a false single-value choice.
`contractVersion` bumped to `"1.1.0"`.

This is the real answer to the P1 gap Meridian Red flagged on this repo's
bootstrap PR (`roots-of/roots-of#1`): a versioned, machine-readable
descriptor that any "rootfs instance" repo built on this org's meta-schema
can be validated against, so a collision (two instances claiming the same
Docker bridge, the same host ports, the same Compose project name) is
mechanically detectable instead of a matter of convention and careful
reading.

This is v1 — deliberately minimal, covering exactly the fields Red named.
Extend it by adding fields, never by silently repurposing an existing one;
bump the `contractVersion` on any breaking change.

## Schema

The machine-readable schema is [`schema/rootfs-instance.schema.json`](schema/rootfs-instance.schema.json)
(JSON Schema draft 2020-12). A descriptor is a single JSON file validating
against it. Required top-level fields:

- **`contractVersion`** — string, must be `"1.0.0"` for this version.
- **`artifact`** — `{ type, platform, architecture, digest }`. `type` is one
  of `wsl-export`, `oci-image`, `debootstrap`, `mkosi`, `distrobuilder`,
  `packer`. `digest` is the artifact's own content digest (e.g.
  `sha256:...`) once a real artifact exists — `null` is valid for a
  descriptor that only describes a planned/not-yet-built instance, which
  must NOT be mistaken for a real digest.
- **`source`** — `{ recipe, provenance }`. `recipe` points at the real
  build input (a Dockerfile, a `wsl --export` source distro name, a Packer
  template path) relative to this descriptor's own repo. `provenance` is a
  short human sentence on where that recipe came from.
- **`lifecycle`** — `{ build, export, restore, validate }`, each a real
  shell command string (or `null` if genuinely not yet implemented — not a
  placeholder for "I didn't check"). `validate` MUST be non-mutating: it
  may inspect the instance but must never create, delete, or modify any
  resource it reports on.
- **`supportedTarget`** — short string naming the real host/distro/platform
  this instance is built for (e.g. `WSL2 on Windows 11`).
- **`acceptanceReceipt`** — `{ command, lastRunAt, lastResult }`. `command`
  is the exact command that produced the receipt (normally the same as
  `lifecycle.validate`). Never a secret value, never a credential, never a
  raw log — just enough to show the descriptor was checked against a real
  environment at a real time, with a real pass/fail.
- **`isolation`** — required whenever the instance runs under Docker.
  `{ team, dockerDataRoot, bridge, addressPool, networks, volumes,
  composeProject, hostPorts, bindMounts }`. `team` is `"red"`, `"blue"`,
  or `"shared"`. Any field whose real value is not yet confirmed must be
  the literal string `"unknown — needs verification"`, never a guessed or
  fabricated value — a wrong guess here is worse than an honest unknown,
  because it defeats the entire point of mechanical collision detection.

## Non-mutating validation command

`scripts/validate-descriptor.js <path-to-descriptor.json>` — a small,
dependency-free Node script that checks a descriptor file's shape against
the schema above (required keys present, `contractVersion` matches,
`isolation.team` is one of the three allowed values) and prints a receipt
line (`PASS`/`FAIL` + which field failed) to stdout. It never writes
anything, never calls Docker/WSL/git, and never needs network access —
exactly the "non-mutating validation command/receipt" Red's review asked
for. See [`scripts/validate-descriptor.js`](scripts/validate-descriptor.js).

## Real next step after this lands

Each real rootfs-instance repo (starting with `Roots-Of/MERIDIAN-0QQ`) adds
its own `descriptor.json` validating against this schema, plus a CI/local
hook that runs `validate-descriptor.js` against it before merge. This repo
does not and should not hold any instance's own descriptor — that content
lives in the instance repo, per this repo's own "meta-schema, not a
template" principle above.
