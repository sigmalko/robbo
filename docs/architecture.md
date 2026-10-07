# Architecture

Robbo has one npm package and one browser entrypoint, `src/app/main.ts`.
It starts the game controller; no application starts merely by importing the
engine, session, renderer or theme controller.

| Area | Allowed dependencies inside src | Responsibility |
| --- | --- | --- |
| `engine` | `engine` | World rules, entities, symbols and commands |
| `application` | `application`, `engine` | Session lifecycle and replay |
| `generated` | `engine` | Imported campaign records |
| `browser` | `browser`, `engine` | Input, audio, optional localStorage |
| `presentation` | `presentation`, `engine` | Canvas rendering, camera, themes, messages |
| `app` | All areas | Assemble dependencies and handle browser lifecycle |

Production code must not import tests or build tools. Presentation may import
the shipped artwork in `website`; inline image imports keep generated atlases
usable through file URLs. Theme/storage/protocol IDs and static asset URLs are
unchanged by the reorganization.

`tsconfig.json` checks all active source with strict types. `tsconfig.game.json`
additionally checks engine, application and generated data without DOM libraries.
`tsconfig.test.json` preserves the existing non-strict type check for test fixtures;
it does not relax the separate strict check of production sources.
The engine uses injected randomness. Session seed selection remains outside the
simulation. Canvas rendering reads world state; resizing never changes it.

The game controller coordinates input, session ticks, persistence and browser
events. The theme controller owns asynchronous atlas loading, request ordering
and inventory previews. The board renderer owns canvas sizing and terrain cache;
the camera and sprite-frame mapping are separate modules. Storage helpers are
shared by the campaign and preference stores without coupling those stores.

`website` holds shipped HTML/CSS/assets, while TypeScript lives in `src`. Vite
uses `website` as its root and `src/app/main.ts` as its library entry.
HTML's `/src` URL is mapped to the repository's source directory by a Vite alias;
`test:dev` verifies this separately from the portable package. The release
tool copies static files, includes the IIFE and replaces the development module
tag. `release/robbo` is both the offline package and the GitHub Pages artifact.

The retired sprite/UI/user implementation and its four test suites were removed.
Recover them from commit `8969890` if historical research requires them. jQuery
was only referenced by that implementation and is no longer a dependency.
Historical map data is still active; `legacy-route.spec.ts` tests the current
engine and is retained. Unused sounds live in `archive`, outside release inputs.
