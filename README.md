# JetLag Tutorials

This branch contains the content that is specific to the JetLag Tutorials
book/website.

## Organization

Each subfolder within `src` folder contains all markdown and code for building a
chapter of the book.  In accordance with mdbook's defaults, the SUMMARY.md file
is a table of contents, and it lives in the `src` folder, too.

A chapter should keep its images and other assets with it, unless those
images/assets are part of a game.  If that is the case, those assets should go
in the `src/assets` folder.  The top-level Makefile will ensure that assets wind
up in the right places and are referenced correctly.

Each chapter should also have a Makefile for building all of the games that are
embedded in that chapter.  Each game (.ts and .html) should be in the same
folder as the markdown for a chapter.

Please note that the current build system is a bit brittle, and that is not
going to change.  At the bottom of this file, you can find more details.

Also note that `raw_assets` is for developer-only content.  For example, the
inputs to a spritesheet might go in `raw_assets`, even if the tutorial only
deals with the spritesheet.

## Before You Begin: Setting Up Symlinks

(Note: these instructions have only been tested on Linux.)

- Check out this branch as a folder called `jetlag-tutorials`
- Check out the JetLag main branch as a peer folder to this folder.  Call it
  `jetlag-main`
- Create two symlinks into `jetlag-main`:
    - `cd src`
    - `ln -s ../../jetlag-main/src/jetlag jetlag`
    - `ln -s ../../jetlag-main/src/jetlag.ts jetlag.ts`
    - `cd ..`
- Several of the subfolders of `src` will also require a symlink to
  `src/common/common.ts`.

## Before You Begin: Setting Up `mdbook`

This guide assumes that you have installed `mdbook`, `mdbook-admonish`,
`mdbook-katex`, and `mdbook-mermaid` globally.

- See <https://github.com/badboy/mdbook-mermaid> for help setting up and using
  the mermaid plugin
- See <https://github.com/tommilligan/mdbook-admonish> for hel setting up and
  using the admonish plugin

You will also need to have `npm` and `node.js` installed.  You should be able to
type `npm install` in the top-level folder to get all of the dependencies for
building/running the example code.

## Building the Book

The makefile will do all the work.  This entails two steps:

- Use `mdbook build` to transform markdown into html
- Use `esbuild` to transpile the example code and put it in the same output
  folder.

`make` will produce a single compiled copy of JetLag as an IIFE (immediately
invoked function expression).  It then transpiles each code example to a `.js`
file.  It manually concatenates imports, and uses esbuild to transpile without
type checking.  It also hacks the .html files so that they load the IIFE.  This
build process is fast (especially with `make -j`), but somewhat brittle and
ill-suited to anything other than deployment.  For building/debugging code,
please run `npm run help` to learn about the environment variables that are used
by `npm start`.

### A Warning

This build process is brittle.  We are using `make` to transpile from TypeScript
to JavaScript, and we're avoiding embedding the 2.2MB JetLag library into each
of the 120+ example games that are being built.  This requires a few hacks, and
a few conventions.  If you just follow the existing examples, things should
work.  Below is a partial list of sources of brittleness:

- Code examples cannot not have line breaks when importing from `jetlag`, must
  only import from `jetlag` via the top-level `jetlag.ts` file, and must do all
  `jetlag`-related imports (including `b2Vec2`) through that one import.
- If an example uses `common.ts`, it needs to symlink it into its folder, and
  include it as a dependency in the Makefile (this ensures it gets appended to
  the .js output file).
- Code examples should only draw resources from the `src/assets` folder.  This
  folder should not be a subfolder of the chapter, or else assets could get
  duplicated 20+ times.  Instead, the Makefile re-routes assets.
- In addition to the basic mdbook features, markdown can assume the availability
  of the admonish, katex, and mermaid extensions.
- The JetLag IIFE will include all of Box2D, PIXI, Howler, HammerJS, etc.  It
  gets injected into each chapter's games' HTML files.
- We transform each jetlag dependency (e.g., `jetlag.Actor`) into a global var
  (e.g., `Actor`), so there can be naming bugs if you re-use a JetLag name in
  your chapter's game code.
- `stage` is a late-bound singleton, so we have re-initialize its global var
  during `initializeAndLaunch`.
- All local imports for a tutorial (`common.ts`, etc.) must be expressed in the
  Makefile as a dependency, so that we can merge all tutorial TypeScript into a
  single file for processing with esbuild.
- `npm start` manually invokes chokidar to watch for filesystem changes.  Expect
  hot reloading to be brittle while developing new demo games.

On the bright side, doing this all with esbuild and a Makefile is fast.  You can
even do most of it in parallel (e.g., `make -j`).
