import { FileHelper, z } from '@start9labs/start-sdk'
import { sdk } from '../sdk'
import { apiPort, bitcoindMountpoint, stratumPort } from '../utils'

const backend = z.looseObject({
  cookie: z
    .literal(`${bitcoindMountpoint}/.cookie`)
    .catch(`${bitcoindMountpoint}/.cookie`),
  poll_interval: z.number().int().min(100).catch(500),
})

const pogolo = z.looseObject({
  host: z.literal('0.0.0.0').catch('0.0.0.0'),
  port: z.literal(stratumPort).catch(stratumPort),
  http_port: z.literal(apiPort).catch(apiPort),
  tag: z.string().catch('/pogolo on StartOS - decentralize or die/'),
  pool_address: z.string().optional().catch(undefined),
  password: z.string().optional().catch(undefined),
  default_difficulty: z.number().min(0.16).catch(1024),
  job_interval: z.number().int().min(1).catch(60),
  target_share_interval: z.number().int().min(1).catch(5),
})

const shape = z.looseObject({
  backend: backend.catch(() => backend.parse({})),
  pogolo: pogolo.catch(() => pogolo.parse({})),
})

export const pogoloToml = FileHelper.toml(
  {
    base: sdk.volumes.main,
    subpath: 'pogolo.toml',
  },
  shape,
)
