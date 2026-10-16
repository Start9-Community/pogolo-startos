# AGENTS.md

This is a StartOS service-package repository — it builds a `.s9pk` for StartOS.

Develop it inside a StartOS packaging workspace created by `start-cli s9pk init-workspace`,
which provides the packaging guide and agent context one level up. If you're reading this in a
bare clone with no workspace, the full guide is at <https://docs.start9.com/packaging>.

- **pogolo refuses to start on a config key it does not know** (`DisallowUnknownFields`). On an upstream bump, diff `config.go` between the tags and keep `startos/fileModels/pogolo.toml.ts` in step.
- **Don't add `backend.host` or `backend.zmq_host` to the file model.** `main.ts` passes them as `POGOLO_BACKEND_HOST` / `POGOLO_BACKEND_ZMQHOST`, which win over the file, from bridge addresses resolved at each start.
