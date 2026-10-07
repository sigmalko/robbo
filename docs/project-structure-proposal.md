# Propozycja organizacji projektu Robbo

Status: **wdrożone w PR #4**. Audyt: 2026-10-07, baza `8969890`.

Poniżej zachowano pierwotną propozycję i uzasadnienie. Na polecenie właściciela
wdrożenie wykonano w tym samym PR, zamiast w osobnych PR-ach. Aktualny stan
opisuje [architektura](architecture.md), a komendy — [README](../README.md).
Usunięto nieużywaną implementację i jQuery, przeniesiono moduły oraz testy,
wydzielono kontrolery, renderer, kamerę i adapter storage. Silnika reguł
nie dzielono dalej. Wszystkie aktywne źródła podlegają strict TypeScript.

## Rekomendacja

Zachować jedno repozytorium, jeden pakiet npm i jeden proces wydania. Podzielić
kod według odpowiedzialności: silnik, aplikacja, integracje przeglądarkowe,
prezentacja. Nieużywaną implementację usunąć, pozostawiając historię w Git. Nie ma obecnie uzasadnienia dla monorepo
z wieloma pakietami ani dodatkowego frameworka. Organizacja projektu oznacza tu
granice modułów i odpowiedzialność za utrzymanie; repozytorium nie dostarcza
podstaw do proponowania zmian personalnych lub struktury firmy.

## Co wynika z obecnego kodu

| Obserwacja | Konsekwencja | Propozycja |
| --- | --- | --- |
| `website/main.ts` importuje `src/main/game`, a obok istnieją `src/main/sprites`, `ui`, `levels`, `user` | Dwa modele świata (`game/World.ts` i `sprites/World.ts`) wyglądają na równorzędne | Usunąć starszą implementację i testy dotyczące wyłącznie jej |
| `src/main/game` zawiera zarówno symulację, jak i audio, dotyk, preferencje, teksty i atlas | Nazwa `game` nie wyjaśnia granic zależności | Rozdzielić silnik od przeglądarki i prezentacji |
| `website/main.ts` ma 421 linii; `game/World.ts` ma 460 | Bootstrap zarządza wieloma aspektami; symulacja jest wrażliwa na kolejność operacji | Najpierw podzielić bootstrap; podział świata rozważyć osobno po zabezpieczeniu deterministyczności |
| `Preferences.ts` importuje funkcje storage z `Progress.ts` | Ustawienia zależą od modułu postępu kampanii dla technicznej usługi | Wydzielić wspólny adapter storage |
| Pliki używają PascalCase i kebab-case; występują `missle`, `RobboAffectsWordStrategy` | Trudniejsze wyszukiwanie i niejednoznaczne nazwy | Jedna konwencja plików, osobna dla symboli TypeScript |
| `packs.ts` i `docs/import-diagnostics.md` są generowane przez importer | Ręczne przenosiny mogą zepsuć kontrolę świeżości | Zmienić generator wraz z lokalizacją jego wyników |
| Vite buduje IIFE, a pakowacz kopiuje `website` i podmienia tag skryptu | Przeniesienie HTML/assets wpływa na wydanie offline | Zachować wynik `release/robbo` i działanie przez `file://` |
| Brakuje głównego README; dokumenty odsyłają do nieobecnych plików | Nowa osoba nie ma punktu wejścia | Dodać instrukcję uruchomienia i indeks dokumentacji; naprawić odnośniki |

Starszy kod jest kompilowany przez szeroki tsconfig i ma własne testy, ale
nie jest używany przez obecną aplikację. Jej punkt wejścia i moduły korzystają
z src/main/game. Konsumenci starszych katalogów to ich własny kod i testy.
Rekomenduję usunięcie tego zamkniętego podzbioru zamiast tworzenia src/legacy.
Historia Git (punkt odniesienia: 8969890) wystarczy do jego odzyskania.

Zakres usunięcia: src/main/{sprites,ui,levels,user}, src/main/KeyboardDelta.ts,
src/test/{sprites,ui,user} i historyczny src/TODO. Usunąć jquery i @types/jquery
z manifestu oraz lockfile, a także kopiowanie licencji jQuery w pakowaczu,
gdy zależność przestanie być dostarczana. Zachować cały src/test/game, w tym
LegacyRoute.spec.ts: ten test używa aktualnego GameWorld. Zachować również
kanoniczne mapy w resources/levels. Historyczny format nie oznacza martwych danych.
Archiwum .unused/sounds to osobna kategoria materiałów.

## Docelowa struktura

```text
robbo/
├── README.md
├── CONTRIBUTING.md
├── src/
│   ├── engine/                 # symulacja bez DOM, audio i storage
│   │   ├── game-world.ts
│   │   ├── model.ts
│   │   └── level-symbols.ts
│   ├── application/            # przebieg rozgrywki i powtórki
│   │   ├── game-session.ts
│   │   └── replay.ts
│   ├── browser/                # integracje z przeglądarką
│   │   ├── input/              # klawiatura, gamepad, dotyk
│   │   ├── audio/              # game-audio.ts
│   │   └── persistence/        # storage, campaign-store, preference-store
│   ├── presentation/           # canvas, atlas, kamera, teksty, motywy
│   │   ├── rendering/
│   │   ├── themes/
│   │   └── i18n/
│   ├── app/                    # składanie aplikacji i kontrolery DOM
│   │   ├── main.ts
│   │   ├── game-controller.ts
│   │   ├── theme-controller.ts
│   │   └── replay-controls.ts
│   └── generated/              # packs.ts, wyłącznie z importera
├── website/                   # HTML, CSS i zasoby dostarczane graczowi
│   ├── index.html
│   ├── styles-page.css
│   ├── artwork/
│   ├── backgrounds/
│   ├── sounds/
│   └── *.png
├── resources/                 # źródła danych i edytowalne materiały
│   ├── levels/                # kanoniczne DAT, manifest, candidates
│   └── artwork/               # materiały źródłowe, np. PDN
├── archive/                   # zachowane, niedostarczane materiały
│   └── sounds/
├── tests/
│   ├── unit/                  # podkatalogi zgodne z modułami src
│   ├── integration/           # kampanie, importer, kontrakty wielu modułów
│   ├── browser/               # istniejące skrypty Playwright
│   ├── tooling/               # testy narzędzi wydawniczych
│   └── fixtures/              # builders i dane pomocnicze testów
├── scripts/
│   ├── levels/                # importer i parser kampanii
│   ├── release/               # pakowanie i publikacja preview PR
│   └── dev/                   # serwer i capture-artwork-review
├── docs/
│   ├── README.md              # indeks dokumentacji
│   ├── architecture.md        # zatwierdzony podział odpowiedzialności
│   ├── project-structure-proposal.md
│   └── import-diagnostics.md  # generowany raport, stabilna lokalizacja
├── .github/workflows/
├── package.json               # jeden zestaw publicznych komend npm
├── tsconfig.json
├── tsconfig.game.json
├── vite.config.mts
├── vitest.config.mts
├── dist/                      # ignorowane wyniki bundlera
└── release/                   # ignorowane paczki dystrybucyjne
```

Celowo zachować `website` jako katalog publikowanych plików i dotychczasowe
ścieżki grafik oraz dźwięków. Rozdzielenie kodu od zasobów nie wymaga jednoczesnej
zmiany wszystkich URL-i. `resources/levels` pozostaje źródłem prawdy, nawet jeśli
format pochodzi z historycznej wersji gry. Nie tworzyć pustych katalogów na zapas.

## Granice modułów i odpowiedzialność

Dozwolony kierunek zależności:

```text
app → application → engine
app → browser → engine (typy/zdarzenia)
app → presentation → engine (stan do odczytu)
app → generated → engine (typy danych)
```

`engine` nie importuje `app`, `browser`, `presentation`, danych wygenerowanych
ani usuniętej implementacji. Sesja otrzymuje kampanię i seed; symulacja nie czyta `Date.now()`,
DOM ani localStorage. Prezentacja nie modyfikuje świata. Składanie zależności
odbywa się w `app/main.ts`; kod produkcyjny nie importuje `tests` ani `scripts`.
Nie wprowadzać zbiorczych `index.ts` ani aliasów importów, dopóki nie upraszczają
realnych zależności. Relatywne importy wystarczą na obecnej skali.

W przeglądzie PR stosować obszary odpowiedzialności: **reguły i replay**,
**interfejs i dostępność**, **dane i grafika**, **narzędzia i wydania**.
To role przeglądu, nie propozycja czterech zespołów. Jedna osoba może pełnić kilka
ról. `CODEOWNERS` dodać dopiero po wskazaniu rzeczywistych opiekunów; nie wpisywać
fikcyjnych użytkowników. Zmiana reguł wymaga oceny zgodności replay, zmiana
pakowania — sprawdzenia wydania offline i Pages.

## Mapa przenosin i nazewnictwo

| Obecnie | Docelowo / działanie |
| --- | --- |
| `src/main/game/World.ts` | `src/engine/game-world.ts`; zachować klasę `GameWorld` |
| `src/main/game/model.ts`, `Symbols.ts` | `src/engine/model.ts`, `level-symbols.ts` |
| `src/main/game/Session.ts`, `Replay.ts` | `src/application/game-session.ts`, `replay.ts` |
| `src/main/game/Input.ts`, `Touch.ts`, `Audio.ts` | `src/browser/input/action-input.ts`, `touch-input.ts`; `src/browser/audio/game-audio.ts` |
| `src/main/game/Progress.ts`, `Preferences.ts` | `src/browser/persistence/campaign-store.ts`, `preference-store.ts`; helpery do `storage.ts` |
| `src/main/game/Art.ts` | Rozdzielić `src/presentation/rendering/sprite-frames.ts` i `camera.ts` |
| `src/main/game/Viewport.ts`, `Theme.ts`, `Text.ts` | `presentation/rendering/viewport.ts`, `presentation/themes/theme.ts`, `presentation/i18n/messages.ts` |
| `website/modern-art.ts`, `journey-art.ts`, `journey-terrain.ts` | `src/presentation/rendering/`, zachować opisowe nazwy |
| `website/main.ts`, `replay-controls.ts` | `src/app/`; wydzielić obsługę sesji i motywów z main |
| `src/main/game/packs.ts` | `src/generated/packs.ts`; zmienić import typu i generator |
| Pozostałe katalogi `src/main` oraz `KeyboardDelta.ts` | Usunąć wraz z testami tej implementacji |
| `src/test/game` | `tests/unit` lub `tests/integration` według faktycznego zakresu testu |
| `src/test/sprites`, `ui`, `user` | Usunąć; dotyczą wyłącznie starej implementacji |
| `src/main/levels/LevelProviderTesting.ts`, `src/main/user/UserProviderFake.ts` | Usunąć wraz ze starszą implementacją |
| `scripts/*browser*.js`, `render-performance-check.js` | `tests/browser`; ujednolicić końcówkę `*.check.cjs` |
| `scripts/pr-release.test.js` | `tests/tooling/pr-release.test.cjs`, nadal runner `node --test` |
| `scripts/*.js` (pozostałe) | Podkatalog właściwy dla odpowiedzialności; CommonJS oznaczyć `.cjs` |
| `.unused/sounds` | `archive/sounds` z README opisującym pochodzenie i brak użycia w wydaniu |
| `src/TODO` | Usunąć historyczną listę; aktualne braki opisać jako zweryfikowane issues |
| `tsconfig-game.json` | `tsconfig.game.json`; poprawić odwołanie w build |

Pliki i katalogi: **kebab-case**; klasy, interfejsy i typy: **PascalCase**;
funkcje i zmienne: **camelCase**; stałe protokołów: **UPPER_SNAKE_CASE**.
Test jednostkowy/integracyjny: `<temat>.spec.ts`. Zachować oddzielny runner Node
dla testów narzędzi. CommonJS pozostawić CommonJS — zmiana rozszerzenia na `.cjs`
wymaga także jawnego rozszerzenia w lokalnych `require`, nie globalnej zmiany
`package.json` na ESM.

Literówki missle i RobboAffectsWordStrategy znikną wraz z usuwanym kodem;
nie planować osobnej refaktoryzacji jego nazw. Na Windows zmiany samej wielkości
liter wykonywać przez tymczasową nazwę (git mv dwukrotnie).

Nazwy plików i klas nie uprawniają do zmiany identyfikatorów danych. Zachować
`robbo.progress.v1`, identyfikatory kampanii, replay (`robbo-java-1`, `java-v1`),
symbole map. Klucze fabryk starszej implementacji znikną wraz z nią.
Zmiana takich kontraktów wymaga osobnej migracji oraz testów kompatybilności.

## Kolejność wdrożenia

1. **Dokumentacja i punkt odniesienia.** Dodać główne README z wymaganiem Node
   z `package.json`, komendami i mapą repozytorium; CONTRIBUTING z zasadami PR.
   Naprawić brakujące cele linków (`docs/README.md`, `campaign-import.md`,
   `javascript-prototype.md`) albo usunąć nieaktualne odwołania u źródła.
   Raport importu poprawiać w generatorze. Uruchomić istniejące kontrole.
2. **Usunięcie nieużywanej implementacji.** Usunąć wskazany wyżej podzbiór,
   jego testy i jQuery; poprawić pakowacz oraz lockfile. Przed usunięciem zapisać
   wyniki testów i builda; po usunięciu porównać kod wynikowy gry oraz uruchomić
   kontrole aktywnego silnika i przeglądarki. Spadek liczby testów ma wynikać
   wyłącznie z usuniętych zestawów. Nie usuwać map ani testów obecnej gry na
   podstawie słowa legacy. Wykonać ten etap w osobnym PR przed przenosinami.
3. **Przenosiny aktywnych modułów i testów.** Zastosować mapę powyżej bez zmiany
   algorytmów. Zaktualizować oba tsconfig (strict musi obejmować wszystkie nowe
   aktywne katalogi), `vitest.config.mts`, importy w testach i generator kampanii.
   Rozdzielenie helperów storage wykonać jako następny mały krok.
4. **Bootstrap i prezentacja.** Przenieść entrypoint do `src/app/main.ts`,
   ustawić właściwy `build.lib.entry` względem `root: website` w Vite, poprawić
   tag modułu w HTML i jego podmianę w pakowaczu. Sprawdzić dev server oraz IIFE.
   Następnie wydzielić kontrolery i rendering, zachowując kolejność zdarzeń.
5. **Narzędzia i porządki.** Przenieść skrypty, poprawić `require`, ścieżki
   względem katalogu roboczego/pliku, komendy npm i bezpośrednie wywołania w CI.
   Zachować obecne publiczne nazwy npm (`test:browser`, `test:input` itd.).
   Archiwum zasobów uporządkować w oddzielnym małym commicie.

Każdy etap powinien być osobnym PR z działającym buildem. Przenosin nie łączyć
ze zmianami zasad gry ani przeformatowaniem całego repozytorium. W razie regresji
wycofać konkretny etap; nie utrzymywać dwóch aktywnych kopii silnika. Dalszy
podział `GameWorld` na mechaniki jest opcjonalny i wymaga osobnego projektu,
ponieważ zmiana kolejności aktualizacji może zmienić powtórki i zagadki.

## Kryteria akceptacji migracji

- `npm run check:levels`, `npm test`, `node --test scripts/pr-release.test.js`
  (po przeniesieniu: nowa ścieżka) i `npm run package` przechodzą.
- Istniejące `test:browser`, `test:input`, `test:session-browser`,
  `test:viewport`, `test:artwork` i `test:performance` przechodzą; viewport
  sprawdzony także w Firefox zgodnie z aktualnym workflow.
- Gra uruchamia się z dev servera i `release/robbo/index.html` przez `file://`;
  grafika, dźwięk, sterowanie, replay i zapis postępu działają po przenosinach.
- Importer nadal odtwarza oba pakiety po 56 map, zachowuje ich kolejność i pack
  `02` jako domyślny. Sumy źródłowych DAT zgadzają się z `resources/levels/README.md`.
- Istniejące regresje replay/schedulingu oraz kampanii przechodzą; dla ekstrakcji
  logiki porównać checkpointy tych samych wejść i seedów przed i po zmianie.
- Wydanie zawiera te same potrzebne zasoby, informacje o buildzie PR i wymagane
  pliki licencyjne. Preview PR działa; wdrożenie Pages weryfikowane po merge.
- Nie ma pozostałych odwołań do usuniętej implementacji ani starych ścieżek;
  linki dokumentacji działają, wygenerowane pliki są odtwarzalne, a strict
  obejmuje cały aktywny kod. Docelowo dodać automatyczną kontrolę granic importów.

Powyższa lista stanowi plan weryfikacji migracji. Wyniki dla wdrożenia
są podane w opisie PR #4; historyczne ścieżki w tym dokumencie służą
wyłącznie do odtworzenia mapy przenosin.
