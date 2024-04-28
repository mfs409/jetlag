# JetLag Tutorials

TODO: There is a lot in flux right now.  When the tutorials build nicely,
revisit whether we (1) need the scripts folder anymore, and (2) if so, how to
set it up to build things correctly.

This branch contains the content that is specific to the JetLag Tutorials
book/website.

## Organization

The `src/book` folder contains the markdown files that represent the chapters of
the book.  In accordance with mdbook's defaults, the SUMMARY.md file is a table
of contents.

The `src/tutorials` folder contains the typescript files that correspond to the
playable code examples in the book.

The name of each chapter of the book is reflected in its markdown file's name.
Since mdbook represents sub-chapters by using additional markdown files, we use
the convention that the names of parts will be numbered (e.g., `_00`, `_01`).
Sub-parts will be numbered in the same way.

To keep things consistent, a part will have at most one runnable code example.
Code examples will have the same name as their corresponding part, but with a different extension.

Please note that the current build system is a bit brittle.  Below is a partial
list of rules:

- Code examples should not have line breaks when importing from `jetlag`
- Code examples are allowed to use the code in `common.ts`
- Code examples should only draw resources from the `assets` folder
- Code examples will be transpiled into `book/jl-out`
- In addition to the basic mdbook features, markdown can assume the availability
  of the admonish, katex, and mermaid extensions.
- Markdown should link images in the `src/book/assets/` folder unless they are
  used in source code.  Then they should be referred to via `jl-out/assets`, and
  stored in `src/tutorials/assets/`.

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

## Before You Begin: Setting Up `mdbook`

This guide assumes that you have installed `mdbook`, `mdbook-admonish`,
`mdbook-katex`, and `mdbook-mermaid` globally.

- See <https://github.com/badboy/mdbook-mermaid> for help setting up and using the mermaid plugin
- See <https://github.com/tommilligan/mdbook-admonish> for hel setting up and using the admonish plugin

You will also need to have `npm` and `node.js` installed.  You should be able to
type `npm install` in the top-level folder to get all of the dependencies for
building/running the example code.

## Building the Book

There are two steps when building the book

- Use `mdbook build` to transform markdown into html
- Use `make` to transpile the example code and put it in the same output folder.

`make` will produce a single compiled copy of JetLag as an IIFE (immediately
invoked function expression).  It then transpiles each code example to a `.js`
file.  It manually concatenates imports, and uses esbuild to transpile without
type checking.  This build process is fast (especially with `make -j`), but
somewhat brittle and ill-suited to anything other than deployment.  For
building/debugging code, please see the next section.

### TODO: What Else?

It's hard, because JetLag isn't a library, so people who write JetLag code don't
do the things you'd do if it was a library.  We get around this with some
tricks:

- All JetLag imports in a tutorial are in a single import from `src/jetlag`.
- Tutorials don't import from box2d or Pixi.  `src/jetlag.ts` re-exports those
  things instead.
- We compile the JetLag folder to an IIFE, which we inject into each tutorial's
  HTML.  The IIFE includes all JetLag dependencies (Box2D, PIXI, Howler,
  HammerJS, etc).
- We transform each jetlag dependency (e.g., `jetlag.Actor`) into a global var
  (e.g., `Actor`).
- `stage` is a late-bound singleton, so we have re-initialize its global var
  during `initializeAndLaunch`.
- All local imports for a tutorial (`common.ts`, etc.) must be expressed in the
  Makefile as a dependency, so that we can merge all tutorial TypeScript into a
  single file for processing with esbuild.

This is kind of brittle.  But doing this all with esbuild and a Makefile is
fast.  You can even do most of it in parallel (e.g., `make -j`).  You don't even
need to install TypeScript.

## Running a Tutorial

With the above configuration complete, you should be able to `TUT=X npm run
start`, `npm run build-all`, and `npm run serve-all`.

TODO: also `ln -s ../../jetlag-main/src/game`
