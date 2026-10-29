# My JetLag Games

This folder is a workspace for making games with [JetLag](https://github.com/mfs409/jetlag).
It can hold many games.
Each one is a folder in `src/`.

## Getting started

1. `npm install` (once)
2. `npm run create my_game` makes `src/my_game/` with a small starter game
3. `npm run serve my_game` runs it.  Open the address it prints, such as <http://localhost:7000/my_game/my_game.html>.
   The browser reloads whenever you save.

## Commands

| Command                 | What it does                                         |
|-------------------------|------------------------------------------------------|
| `npm run create [name]` | Make a new game in `src/<name>/`                     |
| `npm run serve [name]`  | Run a game, reloading when you change it             |
| `npm run check`         | Type-check all of your code                          |
| `npm run build [name]`  | Make a deployable copy of a game in `dist/<name>/`   |
| `npm run zip [name]`    | Do `build`, then put the result in `dist/<name>.zip` |
| `npm run clean`         | Delete `dist/`                                       |
| `npm run help`          | List the commands                                    |

## Where things go

- A game is a folder `src/<name>/` with the files `<name>.ts` and `<name>.html`.
- A game's images, sounds, and fonts go in `src/<name>/assets/` folder, and its `Config` lists them in the `resources` section.
  A game that loads its assets from somewhere else, such as a CDN, can set `resources.cdn`.
- Games import JetLag with `import { ... } from "jetlag2d"`.
  To see what's available, read `node_modules/jetlag2d/src/jetlag.ts`, or the [API documentation](https://mfs409.github.io/jetlag/).
  Don't edit files in `node_modules`.

## A multiplayer server

`npx jetlag2d create-server <folder>` makes a small server that games can use to talk to each other.
The server is not production-quality.
It is not secure.
It is just to help you get started.
Be sure to read the README in the folder it makes, especially before putting it on the internet.
