<p align="center">
  <img src="icon.svg" alt="pogolo Logo" width="21%">
</p>

# pogolo on StartOS

> Everything not listed in this document should behave the same as upstream
> pogolo. If a feature, setting, or behavior is not mentioned here, the
> upstream documentation is accurate and fully applicable.

[pogolo](https://github.com/0xf0xx0/pogolo) is a solo, db-less Bitcoin mining pool meant for LAN swarms. It speaks Stratum V1 and Stratum V2 on the same port.

- **Upstream repo:** <https://github.com/0xf0xx0/pogolo>
- **Wrapper repo:** <https://github.com/WantClue/pogolo-startos>

---

## Image and Container Runtime

| Property      | Value                                 |
| ------------- | ------------------------------------- |
| Image         | `0xf0xx0/pogolo` (Docker Hub, pinned) |
| Image         | `nginx` (dashboard + sampler)         |
| Architectures | x86_64, aarch64                       |
| Command       | `/pogolo --conf /data/pogolo.toml`    |

| Subcontainer  | Purpose                                       |
| ------------- | --------------------------------------------- |
| `pogolo-sub`  | The `primary` daemon — the one to `attach` to |
| `ui-sub`      | The `ui` daemon (nginx serving the dashboard) |
| `sampler-sub` | The `sampler` daemon (records hashrate)       |

pogolo logs to stdout with `NO_COLOR=1`, so the StartOS Logs tab shows plain text.

The dashboard (`assets/dashboard/index.html`) is a single static page with no external dependencies. nginx (`assets/nginx.conf`) serves it on 5663 and proxies `/api/` to pogolo on `127.0.0.1:5662`. pogolo keeps no history, so the `sampler` daemon (`assets/sampler.sh`) reads `/api/v1/info` once a minute and appends `unix_seconds,MH/s` to `/data/hashrate.csv` (7 days kept), which nginx serves as `/history.csv` for the graph.

## Volume and Data Layout

| Volume              | Mount Point     | Purpose                                |
| ------------------- | --------------- | -------------------------------------- |
| `main`              | `/data`         | `pogolo.toml` and `hashrate.csv`       |
| `bitcoind` / `main` | `/mnt/bitcoind` | Read-only, for Bitcoin's RPC `.cookie` |

## File Models

`pogolo.toml` (`startos/fileModels/pogolo.toml.ts`). pogolo rejects unknown keys, so the schema is strict. The wrapper pins `backend.cookie`, `pogolo.host`, `pogolo.port` and `pogolo.http_port`; the rest is set through the Configure action.

## Dependencies

**Bitcoin** (`bitcoind`), running and healthy. A critical task asks the user to enable ZMQ on Bitcoin. RPC host and ZMQ endpoint are resolved over the LXC bridge and passed as `POGOLO_BACKEND_HOST` / `POGOLO_BACKEND_ZMQHOST`. Auth uses Bitcoin's cookie; pogolo restarts when the cookie changes.

## Network Access and Interfaces

| Interface      | Id        | Type | Port | Protocol                                                                         |
| -------------- | --------- | ---- | ---- | -------------------------------------------------------------------------------- |
| Stratum Server | `stratum` | api  | 5661 | raw TCP (Stratum V1 and V2)                                                      |
| API            | `api`     | api  | 5662 | HTTP, read-only (`/api/v1/info`, `/api/v1/gophers`, `/openapi.yaml`, `/metrics`) |
| Web UI         | `ui`      | ui   | 5663 | HTTP, dashboard                                                                  |

All are bound on the `main` MultiHost with matching external ports. Stratum has no TLS.

## Actions

- **Configure** (`config`) — default payout address, coinbase tag, Stratum V1 password, starting difficulty, job interval, target share interval. Saving restarts pogolo.

## Health Checks

| Check     | Displayed        | Method                 |
| --------- | ---------------- | ---------------------- |
| `primary` | "Stratum Server" | Port 5661 is listening |
| `ui`      | "Web Interface"  | Port 5663 is listening |

pogolo waits for Bitcoin to finish its initial sync before listening, so this check fails until then.

## Backups and Restore

The `main` volume (just `pogolo.toml`) is backed up wholesale.

## Limitations and Differences

1. Only the backends StartOS Bitcoin provides (JSON-RPC + ZMQ) are wired up; btcd websocket is not.
2. Hashrate history only covers time the sampler was running; gaps longer than 3 minutes are drawn as breaks.

---

## Quick Reference for AI Consumers

```yaml
package_id: pogolo
images: [0xf0xx0/pogolo, nginx]
architectures: [x86_64, aarch64]
subcontainers: [pogolo-sub, ui-sub, sampler-sub]
volumes:
  main: /data
file_models: [pogolo.toml]
startos_managed_env_vars:
  [POGOLO_BACKEND_HOST, POGOLO_BACKEND_ZMQHOST, NO_COLOR]
dependencies: [bitcoind]
interfaces:
  stratum: { type: api, port: 5661 }
  api: { type: api, port: 5662 }
  ui: { type: ui, port: 5663 }
actions: [config]
tasks: [bitcoind zmqEnabled]
health_checks: [primary, ui]
```
