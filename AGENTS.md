# Instructions for AI coding assistants

This repository is a copy of JetLag, a 2D game framework for the web, written in
TypeScript on top of Box2D (physics), PIXI.js (graphics), and Howler.js (sound).
The person you're working with is probably learning game development from the
JetLag book, so your job is to help them make a good game *and* to help them
understand the code they end up with.

## Where to learn JetLag

Read these before guessing at an API.  JetLag's API is small, but don't rely on
what you remember about it.

- **The engine source**, `src/jetlag/`, is the final word on what exists and
  how it behaves.  `src/jetlag.ts` lists everything a game can import.
- **The tutorial book**: <https://www.cse.lehigh.edu/~spear/jetlag_tutorials/>.
  Each unit teaches one area (bodies and physics, movement, gestures,
  collisions, behaviors, timers, data-driven design, scene flow, audio and
  HUD, endless games and storage, animation and effects, assets), with a
  complete example game.
- **The API documentation**: <https://mfs409.github.io/jetlag/>.

## How this repository is organized

- `src/jetlag/` is the engine.  Don't change it unless you're explicitly
  asked to.  If something seems impossible without changing the engine,
  say so and suggest a workaround instead.
- Each game lives in its own folder, `src/<name>/`, with a `<name>.ts` and a
  `<name>.html` file.  Make new games with `npm run create`, not by hand.
- Assets (images, sounds, fonts) go in the `src/assets/` folder, which every
  game shares, unless a game has an `assets/` folder of its own.  Every asset
  a game uses must also be listed in its `Config`'s `resources`, and
  `resources.prefix` has to match where the files are.
- `npm run serve -- <name>` serves a game with automatic reloading.  `npm run
  check` type-checks all of the code; run it after every change.

## How JetLag games are written

- A level is a `builder` function passed to `stage.switchTo()` (or to
  `initializeAndLaunch()` for the first one).  Switching levels throws away the
  whole world, keyboard handlers, timers, and score, so any data that has to
  survive goes in `stage.storage` (level, session, or persistent).
- Everything on screen is an `Actor`, built from an `appearance` (one component,
  or an array drawn in order), a `rigidBody` (`BoxBody`, `CircleBody`, or
  `PolygonBody`), and optionally `behaviors` and a `movement`.  An actor with no
  behaviors doesn't collide with anything.
- The world is measured in meters, with y increasing downward.  Most games show
  16 by 9 meters at a time.
- Rules are written as functions: `stage.score.addWinCondition(() => ...)`,
  `addLoseCondition`, `TimedEvent`s, `TextSprite`s whose text is a function.
  Prefer these over polling in `stage.world.repeatEvents` when they fit.
- Keep each level's code readable top to bottom: the setup, then the actors,
  then the rules.  Pull repeated actor-making code into small helper functions
  with good names, and put layouts, recipes, and other tables in data (arrays
  and objects) rather than in long runs of code.
- `hitBoxes = true` in `Config`, plus `DebugToggle.enable()` at the top of each
  builder, lets the player press `b` to see every actor's physical outline. Keep
  it on while developing.
- If the book's `common.ts` helpers are in the project (`boundingBox`,
  `heroBehaviors`, `endScreen`, `switchToLevel`/`nextLevel`/`restartLevel`, and
  so on), use them instead of rewriting them.

## Working with a learner

- **Explain what you changed and why**, in terms of JetLag's ideas (which
  behavior, which body type, which callback), and point to the part of the book
  that covers it when you can.  Keep changes small enough to read.
- **Don't invent APIs.**  If you aren't sure a method or option exists, check
  `src/jetlag/` first.  Say when you're unsure.
- **Numbers that decide how a game feels are the person's call.**  Speeds, jump
  heights, timers, spawn rates, damage, prices: pick a reasonable first value,
  say that it's a guess, and suggest what to watch for while play-testing.
  Don't present a tuning value as correct.
- **Gameplay and art have to fit each other.**  When adding art, keep hitboxes,
  sizes, and readability in step with the gameplay (for example, an enemy's
  attack should be readable from its animation before it lands). Prototyping
  with plain, labeled shapes and adding art later is a good default.
- **Boilerplate is fine to write** (animation tables, key bindings, menus,
  repeated actor setup), but keep it tidy, so the parts that matter stay easy to
  find.
