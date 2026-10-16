# pogolo

pogolo needs a fully synced **Bitcoin** with ZMQ enabled, and does not start until Bitcoin has finished syncing.

## Documentation

- [pogolo README](https://github.com/0xf0xx0/pogolo/blob/logopo/README.MD) — the upstream guide, including the config file reference.

## Getting set up

1. When Bitcoin shows a task asking to enable ZMQ for pogolo, run it.
2. Optionally open **Actions → Configure** to set a default payout address and your coinbase tag.
3. Point your miners at the **Stratum Server** address (below).

## Connecting miners

Open the **Stratum Server** interface to see its address, then point each miner at it:

- Stratum V1: `stratum+tcp://<address>:5661`
- Stratum V2: `stratum2+tcp://<address>:5661`

Use your Bitcoin address as the worker username, for example `bc1q….worker1`. Every block a miner finds pays out to the address it mines with. If you set a default payout address, a miner whose username is not an address mines to it instead.

## Watching the pool

The **Web UI** interface is the pool dashboard: total hashrate with a graph of the last hour, day or week, every connected miner with its hashrate, difficulty and shares, and any blocks found. Connected miners and found blocks reset when pogolo restarts; the hashrate graph keeps a week of history.

The **API** interface serves the same statistics as JSON at `/api/v1/info`.

## Actions

- **Configure** — default payout address, coinbase tag, Stratum V1 password, and difficulty and timing. Saving restarts pogolo; your miners reconnect on their own.

## Limitations

- pogolo is meant for your own network. Stratum is not encrypted, so don't expose the Stratum Server to the internet.
- If you set a Stratum V1 password, it appears in pogolo's logs.
- Stratum V2 works only with miners that don't ask for the pool's authority public key. pogolo has none to give, so Stratum V2 clients that require one, including the Stratum V2 service, cannot connect. Use Stratum V1 for those miners.
