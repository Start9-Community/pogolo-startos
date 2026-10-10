import { FileHelper, z } from '@start9labs/start-sdk'
import { sdk } from '../sdk'
import { apiPort, bitcoindMountpoint, stratumPort } from '../utils'

// pogolo decodes its config with DisallowUnknownFields, so the shape is strict:
// a key outside it would stop the service from starting. Backend host and ZMQ
// endpoint are passed as env vars by main.ts, since they're resolved at runtime.
const shape = z.object({
  backend: z
    .object({
      cookie: z
        .literal(`${bitcoindMountpoint}/.cookie`)
        .catch(`${bitcoindMountpoint}/.cookie`),
      poll_interval: z.number().int().min(100).catch(500),
    })
    .catch({ cookie: `${bitcoindMountpoint}/.cookie`, poll_interval: 500 }),
  pogolo: z
    .object({
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
    .catch({
      host: '0.0.0.0' as const,
      port: stratumPort,
      http_port: apiPort,
      tag: '/pogolo on StartOS - decentralize or die/',
      default_difficulty: 1024,
      job_interval: 60,
      target_share_interval: 5,
    }),
})

export const pogoloToml = FileHelper.toml(
  {
    base: sdk.volumes.main,
    subpath: 'pogolo.toml',
  },
  shape,
)
