import { pogoloToml } from '../fileModels/pogolo.toml'
import { sdk } from '../sdk'

// write pogolo.toml with defaults on install, and coerce it back into shape on update
export const seedFiles = sdk.setupOnInit(async (effects) => {
  await pogoloToml.merge(effects, {})
})
