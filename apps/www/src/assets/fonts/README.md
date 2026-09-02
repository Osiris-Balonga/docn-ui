# Site fonts

Unmodified variable WOFF2 files from the published `geist@1.7.2` npm tarball. Copyright 2023 Vercel, in collaboration with basement.studio. See [OFL.txt](OFL.txt) for the SIL Open Font License 1.1.

| File                     | Bytes | SHA-256                                                          |
| ------------------------ | ----- | ---------------------------------------------------------------- |
| Geist-Variable.woff2     | 69652 | a369fcf5628ea2aa4e1b9e2ec6a5b3624e365bda588e1f0f2f12b564f728fbb8 |
| GeistMono-Variable.woff2 | 71368 | fba8f577f38a2bbcbe818efa6348dd58f36303a10b8737c42fefad275be563ab |

CSS references these local files; Next bundles them as hashed static assets. Literal font-family names avoid a circular generated `--font-sans` token. No Google Fonts import or build-time font fetch is needed. These are web assets only; PDF fonts and their independent asset contract start in L02.
