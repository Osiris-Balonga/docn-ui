# PDF qualification font

The four files in this directory are unmodified Latin subsets from the published `@fontsource/noto-sans@5.3.0` and `@fontsource/noto-serif@5.3.0` packages. They are static WOFF files suitable for React-pdf, not the variable WOFF2 files used by the site.

| File | Source | Bytes | SHA-256 |
| --- | --- | ---: | --- |
| `noto-sans-latin-400-normal.woff` | `@fontsource/noto-sans@5.3.0` | 16,688 | `18e2e5b23a9bc5e8e636d6c7984b8ac6635aefc1c497ed1c5012f3c637761b91` |
| `noto-sans-latin-700-normal.woff` | `@fontsource/noto-sans@5.3.0` | 16,956 | `cac2e44ebc446d5c71a9a16fd5592bf80abf6f56dd564a7b90eb01c5f9d29793` |
| `noto-serif-latin-400-normal.woff` | `@fontsource/noto-serif@5.3.0` | 17,812 | `084719f02390eba8960814e1845fba7e6857d63895f53fe8321bcac6b4c73d40` |
| `noto-serif-latin-700-normal.woff` | `@fontsource/noto-serif@5.3.0` | 18,544 | `7057093244f719a3fd3706e9d1941b4161941ffcce81ecc661bc93644bbbd6df` |

License: SIL Open Font License 1.1; see `OFL.txt`. Sans 700 was extracted from the npm package tarball. The two Serif files were retrieved from the exact published package paths through unpkg after the registry tarball stalled, then matched byte-for-byte against jsDelivr's mirror. The asset manifest is the canonical inventory.

Qualification examples: English `Precise documents, open sources.` and French `Documents précis, sources ouvertes. Élodie Mbemba.` Broader script support remains unqualified.
