# JetLag Tutorials Branch

This branch houses the JetLag tutorial source codes. Unless you are a JetLag
tutorial developer, you probably don't want to check out this branch.  If you
*are* a JetLag tutorial developer, then the following instructions will be
useful.

## Components

This branch contains the following pieces:

- A series of tutorials.  The markdown source for each tutorial is in
  `tutorials`, and a live demo for each tutorial is in `/src/tutorials`.
  Note that the markdown, its subfolder in `tutorials`, and its files in
  `src` must have the same base name.
- A set of assets (`tut_assets`) for use in the tutorials.  These assets may be
  optimized.  If so, their related sources are in `raw_assets`.
- A web app for displaying markdown files as web pages, used for the tutorials
  (`src/viewer`).

## Using This Branch

(Note: these instructions rely on symlinks, and have only been tested on Linux)

- Check out this branch as a folder called `jetlag-tutorials`
- Check out the JetLag main branch as a peer folder to this folder.  Call it
  `jetlag-main`
- Create a symlink to the `src/jetlag` folder of `jetlag-main` as `src/jetlag`
  in `jetlag-tutorials`:
    - `cd src`
    - `ln -s ../../jetlag-main/src/jetlag jetlag`
    - `cd ..`

With the above configuration complete, you should be able to `TUT=X npm run
start`, `npm run build-all`, and `npm run serve-all`.
