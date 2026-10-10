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
| Architectures | x86_64, aarch64                       |
| Command       | `/pogolo --conf /data/pogolo.toml`    |

| Subcontainer | Purpose                                       |
| ------------ | --------------------------------------------- |
| `pogolo-sub` | The `primary` daemon — the one to `attach` to |

`NO_COLOR=1` is set so the StartOS log viewer shows plain text.

## Volume and Data Layout

| Volume              | Mount Point     | Purpose                                |
| ------------------- | --------------- | -------------------------------------- |
| `main`              | `/data`         | Holds `pogolo.toml`                    |
| `bitcoind` / `main` | `/mnt/bitcoind` | Read-only, for Bitcoin's RPC `.cookie` |

## File Models

`pogolo.toml` (`startos/fileModels/pogolo.toml.ts`). pogolo rejects unknown keys, so the schema is strict. The wrapper pins `backend.cookie`, `pogolo.host`, `pogolo.port` and `pogolo.http_port`; the rest is set through the Configure action.

## Dependencies

**Bitcoin** (`bitcoind`), running and healthy. A critical task asks the user to enable ZMQ on Bitcoin. RPC host and ZMQ endpoint are resolved over the LXC bridge and passed as `POGOLO_BACKEND_HOST` / `POGOLO_BACKEND_ZMQHOST`. Auth uses Bitcoin's cookie; pogolo restarts when the cookie changes.

## Network Access and Interfaces

| Interface      | Id        | Type | Port | Protocol                    |
| -------------- | --------- | ---- | ---- | --------------------------- |
| Stratum Server | `stratum` | api  | 5661 | raw TCP (Stratum V1 and V2) |
| API            | `api`     | api  | 5662 | HTTP, read-only             |

Both are bound on the `main` MultiHost with matching external ports. Stratum has no TLS.

## Actions

- **Configure** (`config`) — default payout address, coinbase tag, Stratum V1 password, starting difficulty, job interval, target share interval. Saving restarts pogolo.

## Health Checks

| Check     | Displayed        | Method                 |
| --------- | ---------------- | ---------------------- |
| `primary` | "Stratum Server" | Port 5661 is listening |

pogolo waits for Bitcoin to finish its initial sync before listening, so this check fails until then.

## Backups and Restore

The `main` volume (just `pogolo.toml`) is backed up wholesale.

## Limitations and Differences

1. Only the backends StartOS Bitcoin provides (JSON-RPC + ZMQ) are wired up; btcd websocket is not.
2. Logs go to the StartOS log viewer, not a log file.

---

## Quick Reference for AI Consumers

```yaml
package_id: pogolo
image: 0xf0xx0/pogolo
architectures: [x86_64, aarch64]
subcontainers: [pogolo-sub]
volumes:
  main: /data
file_models: [pogolo.toml]
startos_managed_env_vars:
  [POGOLO_BACKEND_HOST, POGOLO_BACKEND_ZMQHOST, NO_COLOR]
dependencies: [bitcoind]
interfaces:
  stratum: { type: api, port: 5661 }
  api: { type: api, port: 5662 }
actions: [config]
tasks: [bitcoind zmqEnabled]
health_checks: [primary]
```
