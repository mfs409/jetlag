# JetLag: 2D Games for Web and Mobile

JetLag is a framework for making 2D games that run in desktop and mobile
browsers.  It is the evolution of LibLOL, and at a high level, it is faithful
to the spirit of LibLOL.  In particular:

- JetLag is designed for beginners
- JetLag strives to put all of the code for a level of the game in a single
  section of a single file

As an HTML5 project, JetLag differs from LibLOL in a few ways:

- It uses PIXI.js and Howler.js, and a different version of Box2D than
  LibGDX, so some names and features are a little bit different
- It uses TypeScript instead of Java, which leads to simpler, cleaner code

Note that JetLag still is a mobile-friendly framework.  It uses Hammer.js for
multi-touch and gesture support, and also enables accelerometer by default.

## Documentation and Support

There is a tutorial series for JetLag, which is available at
<https://www.cse.lehigh.edu/~spear/jetlag_tutorials/>.

Documentation for JetLag is available on
[GitHub Pages](https://mfs409.github.io/jetlag/ "JetLag GitHub Pages")

## Quick Start

Once you have downloaded JetLag, enter the JetLag directory and type `npm
install` to fetch all of the supporting code for JetLag.  Once you have done
that, you can run `npm start` to compile your code.  JetLag uses `esbuild`
for compilation, so every time you make a change, the code will recompile.
To test your game, open a browser and navigate to <http://localhost:7000>.

The main file that you'll want to edit is `src/game/game.ts`.  When you
initially clone JetLag, you'll get a simple one-level game with very few
features.  Please see the tutorials for help getting started.

To add images and sounds to JetLag, follow these steps:

1. Copy the image or sound file into the assets folder
2. Add the name of the file to the appropriate list in `src/game/game.ts`
3. Now you can refer to the asset by its filename in your code

Note that JetLag supports spritesheets using
[TexturePacker](https://www.codeandweb.com/texturepacker).  Please see the
tutorials for more information.

## Coding Standards

JetLag is supposed to be a library that its users will hack for their own
purposes.  Consequently, we prefer that programmers preserve the structure we
have in the repository, where both `jetlag` and `game` are sub-folders of the
`src` folder.

## Contributors

The following people have contributed to JetLag and its predecessors, LibLOL and
ALE.  If you contributed, and we missed your name, please send a note reminding
us to give you credit!

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
