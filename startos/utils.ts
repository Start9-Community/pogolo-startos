import { T } from '@start9labs/start-sdk'
import {
  rpcHostId as btcRpcHostId,
  rpcPort as btcRpcPort,
  zmqHostId as btcZmqHostId,
  zmqPortBlock as btcZmqPortBlock,
} from 'bitcoin-core-startos/startos/utils'
import { sdk } from './sdk'

export const stratumPort = 5661
export const apiPort = 5662
export const bitcoindMountpoint = '/mnt/bitcoind'
export const configPath = '/data/pogolo.toml'

/**
 * bitcoind's RPC and ZMQ-block endpoints over the LXC bridge. Each subscription
 * fires only when its own assigned port changes, so bitcoind restarts don't
 * restart pogolo. undefined until bitcoind's bindings resolve.
 */
export const getBitcoindBridge = async (effects: T.Effects) => {
  const rpc = await sdk.host
    .getBridgeAddress(effects, {
      packageId: 'bitcoind',
      hostId: btcRpcHostId,
      internalPort: btcRpcPort,
      ssl: false,
    })
    .const()
  const zmq = await sdk.host
    .getBridgeAddress(effects, {
      packageId: 'bitcoind',
      hostId: btcZmqHostId,
      internalPort: btcZmqPortBlock,
    })
    .const()
  if (!rpc || !zmq) return undefined
  return { rpc, zmq }
}
