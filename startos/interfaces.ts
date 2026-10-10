import { i18n } from './i18n'
import { sdk } from './sdk'
import { apiPort, stratumPort } from './utils'

export const mainHostId = 'main'
export const stratumInterfaceId = 'stratum'
export const apiInterfaceId = 'api'

export const setInterfaces = sdk.setupInterfaces(async ({ effects }) => {
  const multiHost = sdk.MultiHost.of(effects, mainHostId)

  // Stratum V1 and V2 share one plain TCP port. secure: { ssl: false } keeps it
  // exposed on regular LAN gateways; miners don't speak TLS.
  const stratumOrigin = await multiHost.bindPort(stratumPort, {
    protocol: null,
    addSsl: null,
    preferredExternalPort: stratumPort,
    secure: { ssl: false },
  })
  const stratum = sdk.createInterface(effects, {
    name: i18n('Stratum Server'),
    id: stratumInterfaceId,
    description: i18n(
      'Where your miners connect, using stratum+tcp:// or stratum2+tcp://',
    ),
    type: 'api',
    masked: false,
    schemeOverride: { ssl: null, noSsl: 'stratum+tcp' },
    username: null,
    path: '',
    query: {},
  })
  const stratumReceipt = await stratumOrigin.export([stratum])

  // read-only JSON API (spec served at /openapi.yaml)
  const apiOrigin = await multiHost.bindPort(apiPort, {
    protocol: 'http',
    preferredExternalPort: apiPort,
  })
  const api = sdk.createInterface(effects, {
    name: i18n('API'),
    id: apiInterfaceId,
    description: i18n('Read-only pool statistics API'),
    type: 'api',
    masked: false,
    schemeOverride: null,
    username: null,
    path: '',
    query: {},
  })
  const apiReceipt = await apiOrigin.export([api])

  return [stratumReceipt, apiReceipt]
})
