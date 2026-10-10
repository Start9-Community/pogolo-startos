# Updating the upstream version

## Determining the upstream version

Latest tag on Docker Hub:

```sh
curl -s "https://hub.docker.com/v2/repositories/0xf0xx0/pogolo/tags?page_size=10" | jq -r '.results[].name'
```

The current pin lives in `startos/manifest/index.ts` at `images.pogolo.source.dockerTag`.

## Applying the bump

- Bump `dockerTag` and the version in `startos/versions/current.ts` (`<upstream>:0`).
- pogolo rejects unknown config keys. Diff `config.go` between the old and new tag and update `startos/fileModels/pogolo.toml.ts` if keys were added, renamed or removed.
