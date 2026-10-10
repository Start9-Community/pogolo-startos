# pogolo

pogolo is a solo Bitcoin mining pool for the miners on your own network. Every block your miners find pays out in full to the address they mine to.

## Documentation

- [pogolo README](https://github.com/0xf0xx0/pogolo#readme)

## Getting set up

1. Install and sync **Bitcoin**. When pogolo asks, let it enable ZMQ on Bitcoin.
2. Optionally open **Actions → Configure** to set a default payout address and your coinbase tag.
3. Start pogolo. It begins accepting miners once Bitcoin has finished syncing.

## Connecting miners

Open the **Stratum Server** interface on the Dashboard to see the address, then point each miner at:

- Stratum V1: `stratum+tcp://<address>:5661`
- Stratum V2: `stratum2+tcp://<address>:5661`

Use your Bitcoin address as the worker username (for example `bc1q....worker1`). If you set a default payout address, miners can use any username.

## Watching the pool

Open the **Web UI** interface for the pool dashboard: total hashrate with a graph of the last hour, day or week, every connected miner with its hashrate, difficulty and shares, and any blocks found. pogolo's live log is under the **Logs** tab.

Pool stats as JSON are on the **API** interface at `/api/v1/info`.

## Limitations

- Meant for your LAN, not the public internet. Stratum is not encrypted.
