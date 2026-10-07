# Campaign import

The source of truth is `resources/levels/packs.json` and the DAT files it lists.
The manifest orders pack `02` before `01`, with 56 maps per pack and a 16×31 board.
Source hashes are recorded in [the canonical-source notes](../resources/levels/README.md).

Run `npm run import:levels` after an intentional importer/manifest change. It
generates `src/generated/packs.ts` and [import-diagnostics.md](import-diagnostics.md).
`npm run check:levels` compares both files byte-for-byte during each build.
Git attributes preserve LF for generated text and preserve original DAT bytes.

The parser validates the complete campaign before publishing output. Historical
record counts are advisory. The canonical manifest explicitly permits stale
metadata and resolves duplicates using last-wins; mismatching metadata is
reported and ignored. Preserve these policies and original puzzles.

## Candidate packs

`resources/levels/candidates/original-campaign-reference.dat` is retained as an
unvalidated source. It is absent from the manifest and is not playable or shipped
as an extra campaign. Validate dimensions, consecutive level numbers, total count,
supported symbols, termination, metadata coordinates/types and six-digit palettes
before proposing its inclusion. New packs use strict metadata unless an explicit,
documented compatibility policy is approved. Never silently convert unknown
symbols or simplify a puzzle to pass validation.
