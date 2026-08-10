// All of the scripts that are executed through package.json are in this file.
//
// You can invoke this script with any of the following commands:
//
//   {start, build, clean, help}
//
// For more information, see the help function

import * as fs from 'fs';
import * as path from 'path';
import { fileURLToPath } from 'url';
import * as esbuild from 'esbuild';
import chalk from 'chalk';

/** Print usage information */
function help() {
  console.log(`npm run <command>: Runs a command from package.json

  Commands for Building and Serving the Main Game:
    start   Build the main game and start serving it, rebuilding and
            live-reloading the browser whenever the code changes
    build   Build a production version of the main game

  Commands for Type Checking
    check   Run TypeScript's type checker on all game and tutorial code
            in the repository

  Commands for Cleaning Up
    clean   Remove any built files that aren't tracked by git

  Other Commands
    help    Print this message
`);
}

/** The root of the project is the parent of the folder that holds main.mjs */
const root = path.join(path.dirname(fileURLToPath(import.meta.url)), "..");
/** The game's source folder */
const srcFolder = path.join(root, "src/game");
/** The folder with all the game's static assets */
const srcAssets = path.join(root, "assets");

/** Where `npm start` puts its build output */
const DEV_OUTPUT_FOLDER = path.join(root, "dev-serve");
/** Where `npm run build` puts its build output */
const GAME_DIST_FOLDER = path.join(root, "dist");

/**
 * Clobber a folder, and all of its contents, recursively.  Then re-create the
 * folder.
 *
 * @param folder The folder to clobber.  Nested folders are allowed.
 */
function resetFolder(folder) {
  fs.rmSync(folder, { recursive: true, force: true });
  fs.mkdirSync(folder, { recursive: true });
}

/** Clean up by deleting all output folders */
function clean() {
  for (const folder of [GAME_DIST_FOLDER, DEV_OUTPUT_FOLDER]) {
    fs.rmSync(folder, { recursive: true, force: true });
  }
  console.log(chalk.green(`  ✓ Removed build output folders`));
}

/** Copy the game asset files into `<deployFolder>/assets` */
function buildAssets(deployFolder) {
  const deployAssets = path.join(deployFolder, "assets");
  fs.cpSync(srcAssets, deployAssets, { recursive: true });
  console.log(`  ✓ Copied assets from '${srcAssets}' to '${deployAssets}'`);
  return deployAssets;
}

/**
 * Copy `game.html` to `<serveFolder>/index.html`, injecting a small live-reload
 * snippet that subscribes to esbuild's `/esbuild` server-sent- event stream
 * (automatically exposed by `ctx.serve()`) and reloads the page whenever a
 * rebuild happens.  Dev-only: the source `game.html` and the production build
 * never get this snippet.
 *
 * @param serveFolder The dev-server output folder
 */
function writeDevHtml(serveFolder) {
  const html = fs.readFileSync(path.join(srcFolder, "game.html"), "utf8");
  const liveReload = `<script>new EventSource("/esbuild").addEventListener("change", () => location.reload());</script>`;
  fs.writeFileSync(path.join(serveFolder, "index.html"), html.replace("</body>", `  ${liveReload}\n</body>`));
}

/**
 * Build and serve the game in development mode: rebuilds on any TypeScript
 * change and live-reloads the browser (via esbuild's own watch+serve support),
 * and re-copies the HTML file / assets folder whenever they change (via plain
 * `fs.watch`, since esbuild doesn't know about non-bundled files).
 */
async function start() {
  console.log(`\nLaunching a development server for 'game'\n`);

  const serveFolder = DEV_OUTPUT_FOLDER;
  resetFolder(serveFolder);
  const serveAssets = buildAssets(serveFolder);
  writeDevHtml(serveFolder);
  console.log(`  ✓ Copied 'game.html' to '${serveFolder}' as 'index.html'`);

  // Watch the game's source folder for changes to game.html (TypeScript
  // changes are handled separately, by esbuild's own watcher below).
  fs.watch(srcFolder, { recursive: true }, (_eventType, filename) => {
    if (!filename || !filename.endsWith(".html")) return;
    writeDevHtml(serveFolder);
    console.log(`  ✓ Refreshed 'index.html'`);
  });

  // Watch the assets folder, and keep the served copy in sync.
  //
  // Warning: if srcAssets is very big, this will take a long time
  fs.watch(srcAssets, { recursive: true }, (_eventType, filename) => {
    if (!filename) return;
    const srcFile = path.join(srcAssets, filename);
    const destFile = path.join(serveAssets, filename);
    try {
      if (fs.existsSync(srcFile)) {
        fs.mkdirSync(path.dirname(destFile), { recursive: true });
        fs.copyFileSync(srcFile, destFile);
        console.log(`  ✓ Asset updated: ${filename}`);
      } else if (fs.existsSync(destFile)) {
        fs.unlinkSync(destFile);
        console.log(`  ✓ Asset removed: ${filename}`);
      }
    } catch (err) {
      console.error(chalk.red(`  ✗ Error syncing asset '${filename}':`), err.message);
    }
  });
  console.log(`  ✓ Installed watchers to keep '${serveFolder}' up to date with source changes`);

  // Build (and watch/rebuild) the code, then serve it.  Combining watch() and
  // serve() on the same context is what makes esbuild's `/esbuild` live-reload
  // endpoint fire on every rebuild.
  const ctx = await esbuild.context({
    entryPoints: [path.join(srcFolder, "game.ts")],
    outfile: path.join(serveFolder, "game.js"),
    bundle: true,
    minify: false,
    sourcemap: true,
    platform: 'browser',
  });
  await ctx.watch();

  const serveOptions = { port: 7000, host: 'localhost', servedir: serveFolder };
  console.log(chalk.green(`\nServing at http://localhost:${serveOptions.port}/`));
  console.log(`  - The browser will auto-reload when code, assets, or game.html change`);
  console.log(`  - Press ${chalk.red("ctrl-c")} to stop the server`);
  await ctx.serve(serveOptions);
}

/** Build and bundle (production mode) the game in `src/game` */
async function build() {
  console.log(`\nBuilding 'game'\n`);

  const deployFolder = GAME_DIST_FOLDER;
  resetFolder(deployFolder);
  fs.copyFileSync(path.join(srcFolder, "game.html"), path.join(deployFolder, "game.html"));
  console.log(`  ✓ Copied 'game.html' to '${deployFolder}'`);
  buildAssets(deployFolder);

  await esbuild.build({
    entryPoints: [path.join(srcFolder, "game.ts")],
    outfile: path.join(deployFolder, "game.js"),
    bundle: true,
    minify: true,
    sourcemap: false,
    platform: 'browser',
  });
  console.log(chalk.green(`  ✓ Compiled TypeScript to JavaScript\n`));
  console.log(chalk.green(`Build complete: '${deployFolder}'\n`));
}

/**
 * Dispatch to the appropriate code based on the request given as a command line
 * argument.
 *
 * @param command The requested command
 */
async function main(command) {
  if (command === "start") {
    await start();
  } else if (command === "build") {
    await build();
  } else if (command === "clean") {
    clean();
  } else if (command === "help") {
    help();
  } else {
    help();
    if (command !== undefined) {
      console.log(chalk.red(`Unknown command '${command}'\n`));
      process.exitCode = 1;
    }
  }
}

// Run the requested operation
await main(process.argv[2]);
