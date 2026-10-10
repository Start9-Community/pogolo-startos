import { FileHelper } from '@start9labs/start-sdk'
import { manifest as bitcoinManifest } from 'bitcoin-core-startos/startos/manifest'
import { dependencies } from './dependencies'
import { pogoloToml } from './fileModels/pogolo.toml'
import { i18n } from './i18n'
import { sdk } from './sdk'
import {
  bitcoindMountpoint,
  configPath,
  getBitcoindBridge,
  stratumPort,
} from './utils'

export const main = sdk.setupMain(async ({ effects }) => {
  console.info(i18n('Starting pogolo!'))

  const depResult = await dependencies.check(effects)
  depResult.throwIfNotSatisfied()

  const bitcoind = await getBitcoindBridge(effects)
  if (!bitcoind)
    throw new Error(
      i18n(
        'Bitcoin is not yet reachable on the internal network. Ensure it is installed and running.',
      ),
    )

  // restart pogolo whenever the user changes its config
  await pogoloToml.read().const(effects)

  const sub = await sdk.SubContainer.of(
    effects,
    { imageId: 'pogolo' },
    sdk.Mounts.of()
      .mountVolume({
        volumeId: 'main',
        subpath: null,
        mountpoint: '/data',
        readonly: false,
      })
      .mountDependency<typeof bitcoinManifest>({
        dependencyId: 'bitcoind',
        volumeId: 'main',
        subpath: null,
        mountpoint: bitcoindMountpoint,
        readonly: true,
      }),
    'pogolo-sub',
  )

  // bitcoind rewrites its cookie on every restart; restart pogolo so it re-reads it
  await FileHelper.string(`${await sub.rootfs}${bitcoindMountpoint}/.cookie`)
    .read()
    .const(effects)

  return sdk.Daemons.of(effects).addDaemon('primary', {
    subcontainer: sub,
    exec: {
      command: ['/pogolo', '--conf', configPath],
      env: {
        POGOLO_BACKEND_HOST: bitcoind.rpc,
        POGOLO_BACKEND_ZMQHOST: bitcoind.zmq,
        NO_COLOR: '1',
      },
    },
    ready: {
      display: i18n('Stratum Server'),
      gracePeriod: 30_000,
      fn: () =>
        sdk.healthCheck.checkPortListening(effects, stratumPort, {
          successMessage: i18n('Stratum server is ready'),
          errorMessage: i18n(
            'Stratum server is not ready. pogolo waits for Bitcoin to finish syncing before accepting miners.',
          ),
        }),
    },
    requires: [],
  })
})
