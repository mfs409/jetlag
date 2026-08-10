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

This will ask for a name, then create `src/<name>/` with a small starter game in it, and register it in `projects.json`.
Once you've done that, run `npm start` to compile and serve your code.
JetLag uses `esbuild` for compilation, so every time you make a change, the code will recompile and your browser will auto-reload.
To test your game, open a browser and navigate to <http://localhost:7000>.

This folder is set up to allow you to make many games from the same checkout of JetLag.
Running `npm run create` again makes another `src/<name>/` folder alongside the first, and both are tracked in `projects.json`.
With more than one project, `npm start`/`npm run serve` (with no name given) serves all of them at once, with a gallery page linking to each; to work on just one, use `npm run serve -- <name>`.
You can edit `projects.json` to customize the gallery page.
See `npm run help` for the rest of the commands (`build`, `check`, `clean`).

By default, every project made via `npm run create` shares the single top-level `assets` folder, so a set of assets only needs to exist once no matter how many projects you make.
If you'd rather a project keep its own private assets (e.g. a real game you intend to ship on its own), make an `assets` folder inside its `src/<name>/` folder, and change that project's entry in `projects.json` to point at it: `"assets": "src/<name>/assets"`.
Whichever you choose, that path and the `resources.prefix` your project's `.ts` file uses need to agree, since nothing checks that for you.

To add images and sounds to your game, follow these steps:

1. Copy the image or sound file into the appropriate assets folder
2. Add the name of the file to the appropriate list in your project's `.ts` file
3. Now you can refer to the asset by its filename in your code

Note that JetLag supports sprite sheets using [TexturePacker](https://www.codeandweb.com/texturepacker).
Please see the tutorials for more information.

## Coding Standards

JetLag is supposed to be a library that its users will modify and extend for their own purposes.
Consequently, we prefer that programmers preserve the structure we have in the repository, where `jetlag` and every project made via `npm run create` are sub-folders of the `src` folder, and `projects.json` (at the repository root) always reflects exactly which of those sub-folders are real projects.

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

## Third-Party Assets

JetLag itself is MIT licensed (see `LICENSE`), but `assets/Arimo-Regular.ttf` and `assets/Arimo-Bold.ttf` are the Arimo font from Google Fonts, licensed separately under the SIL Open Font License, Version 1.1 (see `assets/Arimo-OFL.txt`).
