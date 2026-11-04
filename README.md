# JetLag: 2D Games for Web and Mobile

JetLag is a framework for making 2D games that run in desktop and mobile browsers.
It uses PIXI.js and Box2D for graphics and physics, respectively.

## Documentation and Support

There is a [tutorial series for JetLag](https://mfs409.github.io/jetlag-tutorials/ "JetLag Tutorials").

Documentation for JetLag is available on [GitHub Pages](https://mfs409.github.io/jetlag/ "JetLag GitHub Pages").

If you find any bugs, please use the [Issue Tracker](https://github.com/mfs409/jetlag/issues).

## Quick Start

You'll need to install [Node.js](https://nodejs.org/).
To make a workspace called `my-games` for your games, run:

```bash
npx jetlag2d init my-games
cd my-games
npm install
```

Then make your first game, and run it:

```bash
npm run create my_game
npm run serve my_game
```

`create` makes `src/my_game/` with a small starter game in it.
`serve` compiles it, serves it, and prints the address to open, such as `http://localhost:7000/my_game/my_game.html`.
JetLag uses `esbuild` for compilation, so every time you save a change, the code recompiles and your browser reloads.

The workspace can hold many games.
Each one is a folder `src/<name>/` with a `<name>.ts` and a `<name>.html` in it.
They all share one installed copy of JetLag.
See `npm run help` for the rest of the commands, and the `README.md` in your workspace for more guidance.

A game's images, sounds, fonts, videos, and SVG files go in its own `src/<name>/assets/` folder, which `npm run create` makes for you:

1. Copy the asset file into the game's `assets` folder
2. Add the name of the file to the appropriate list in `resources` in the game's `Config`
3. Now you can refer to the asset by its filename in your code

`npm run build <name>` copies the game's `assets` folder into `dist/<name>/`.
A game that loads its assets from somewhere else, such as a CDN, can set `resources.cdn` in its `Config`.
JetLag also supports sprite sheets made with [TexturePacker](https://www.codeandweb.com/texturepacker).
Please see the tutorials for more information.

## Multiplayer Server

JetLag games can talk to each other through a small Socket.IO server.
A sample server is available, to help you get started.
To set it up, run `npx jetlag2d create-server <folder>`, and read the README in the folder it makes.
It's just starter code.
It's not secure, and it has fake authentication.
You should not use it in production, but it's a way to get started quickly.

## Versions

JetLag 2 changed some things that break games written for JetLag 1.
JetLag 1 is no longer maintained.
Its final release is the `v1.0.0` tag of this repository.

A workspace pins the exact version of JetLag that made it, in `package.json`, so your games don't change underneath you.
It is probably not a good idea to upgrade.
Instead, create a new workspace for new projects, and leave the old workspace for old projects.

## Working on JetLag Itself

This repository holds the engine (the `jetlag2d` package), the `jetlag2d` command, and the templates behind `init`, `create`, and `create-server`:

| Folder                         | What's in it                                                         |
|--------------------------------|----------------------------------------------------------------------|
| `src/jetlag/`, `src/jetlag.ts` | The engine.  `src/jetlag.ts` lists everything that a game can import |
| `cli/`                         | The `jetlag2d` command                                               |
| `templates/game/`              | The starter game that `create` copies                                |
| `templates/workspace/`         | The files that `init` copies                                         |
| `templates/server/`            | The multiplayer server that `create-server` copies                   |

To work on JetLag, clone the repository and run `npm install`.
`npm run check` type-checks the engine.
The repository is also a workspace, so you can test a change by making a game inside it.
`npm run create` and `npm run serve` work the same way, and games in `src/` import the engine as `"jetlag2d"`.

To try your changes in a different workspace, edit its `package.json` so that the dependency points at your clone, and run `npm install`:

```json
"jetlag2d": "file:../my-clone-of-jetlag"
```

Your edits will show up the next time that workspace builds or reloads, with no reinstall.
To share them, fork the repository and open a pull request.

To release a new version, set `version` in `package.json`, run `npm pack --dry-run` to check the list of files, and then `npm publish` and tag the commit.
New workspaces pin the version of the engine that made them, so nothing else needs to change.

## Contributors

The following people have contributed to JetLag and its predecessors, LibLOL and ALE.
If you contributed, and we missed your name, please send a note reminding us to give you credit!

- Mike Spear
- Dan Spear
- Greyson Parrelli
- Jennifer Bayzick
- Rachel Santangelo
- Micah Carlisle
- Maximilian Hasselbusch
- Jimmy Johnson
- Marc Soda
- Egide Ntwari
- Nana Nyanor
- Sebastian Chavarro
- Anh Nguyen
- Yassine Rafih
- James Goodwin
