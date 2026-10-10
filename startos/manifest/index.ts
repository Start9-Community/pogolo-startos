import { setupManifest } from '@start9labs/start-sdk'
import { long, short } from './i18n'

export const manifest = setupManifest({
  id: 'pogolo',
  title: 'pogolo',
  license: 'AGPL-3.0',
  packageRepo: 'https://github.com/WantClue/pogolo-startos',
  upstreamRepo: 'https://github.com/0xf0xx0/pogolo',
  marketingUrl: 'https://github.com/0xf0xx0/pogolo',
  donationUrl: null,
  description: { short, long },
  volumes: ['main'],
  images: {
    pogolo: {
      source: { dockerTag: '0xf0xx0/pogolo:v1.1.6' },
      arch: ['x86_64', 'aarch64'],
      emulateMissing: false,
    },
  },
})
