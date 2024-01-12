# JetLag Docs Branch

This branch serves two purposes:

- It is the branch from which GitHub serves the JetLag documentation
- It is the branch from which we generate the JetLag documentation

Unless you are a JetLag maintainer, you probably don't want to check out this
branch.  If you *are* a JetLag maintainer, then the following instructions will
be useful.

## Using This Branch

(Note: these instructions rely on symlinks, and have only been tested on Linux)

- Check out this branch as a folder called `jetlag-docs`
- Check out the JetLag main branch as a peer folder to this folder.  Call it
  `jetlag-main`
- Create a subfolder called `src`
    - `mkdir src`
- Create a symlink to the `src/jetlag` folder of `jetlag-main` as `src/jetlag`
  in `jetlag-docs`:
    - `cd src`
    - `ln -s ../../jetlag-main/src/jetlag jetlag`
    - `cd ..`
- Create a symlink to the `README.md` folder of `jetlag-main` as `README.md` in
  this branch's root:
    - `ln -s ../jetlag-main/README.md README.md`

With the above configuration complete, you should be able to `npm run
build-docs` to create/re-create the `docs` folder from the main branch.  You can
then commit it, which will update JetLag's GitHub Pages.

You may also wish to preview the updated documentation locally, before
committing it.  You can do so via `npm run serve-docs`.
