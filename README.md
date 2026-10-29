# JetLag: 2D Games for Web and Mobile

JetLag is a framework for making 2D games that run in desktop and mobile browsers.
It is the evolution of LibLOL, and at a high level, it is faithful to the spirit of LibLOL.
In particular:

- JetLag is designed for beginners
- JetLag strives to put all of the code for a level of the game in a single section of a single file

As an HTML5 project, JetLag differs from LibLOL in a few ways:

- It uses PIXI.js and Howler.js, and a different version of Box2D than LibGDX, so some names and features are a little bit different
- It uses TypeScript instead of Java, which leads to simpler, cleaner code

Note that JetLag still is a mobile-friendly framework.
It uses Hammer.js for multi-touch and gesture support, and also enables accelerometer by default.

## Documentation and Support

There is a tutorial series for JetLag, which is available at <https://www.cse.lehigh.edu/~spear/jetlag_tutorials/>.

Documentation for JetLag is available on [GitHub Pages](https://mfs409.github.io/jetlag/ "JetLag GitHub Pages").

If you find any bugs, please use the [Issue Tracker](https://github.com/mfs409/jetlag/issues).

## Quick Start

Once you have downloaded JetLag, enter the JetLag directory and type `npm install` to fetch all of the supporting code for JetLag.
Next, make your first project:

```bash
npm run create
```

This will ask for a name, then create `src/<name>/` with a small starter game in it.
Once you've done that, run `npm start` to compile and serve your code.
JetLag uses `esbuild` for compilation, so every time you make a change, the code will recompile and your browser will auto-reload.
The terminal says which address to open, such as <http://localhost:7000/my_game/my_game.html>.

This folder is set up to allow you to make many games from the same checkout of JetLag.
Running `npm run create` again makes another `src/<name>/` folder alongside the first.
A project is any `src/<name>/` folder that has a `<name>.ts` and a `<name>.html` in it.
To serve a project, you must provide its name: `npm run serve <name>`.
See `npm run help` for the rest of the commands.

To make a multiplayer server for your games, run `npx jetlag create-server <folder>`, and read the README in the folder it makes.

Every project keeps its images, sounds, fonts, videos, and SVG files in its own `src/<name>/assets/` folder, which `npm run create` makes for you.
`npm run build <name>` copies the project's `assets` folder into `dist/<name>/`.
A game that loads its assets from somewhere else, such as a CDN, can set `resources.cdn` in its `Config`.

To add images and sounds to your game, follow these steps:

1. Copy the asset file into your project's `assets` folder
2. Add the name of the file to the appropriate list in your project's `.ts` file
3. Now you can refer to the asset by its filename in your code

Note that JetLag supports sprite sheets using [TexturePacker](https://www.codeandweb.com/texturepacker).
Please see the tutorials for more information.

## Coding Standards

JetLag is supposed to be a library that its users will modify and extend for their own purposes.
Consequently, we prefer that programmers preserve the structure we have in the repository, where `jetlag`, `assets`, and every project made via `npm run create` are sub-folders of the `src` folder.

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
