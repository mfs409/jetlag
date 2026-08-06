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
import { spawn } from 'child_process';
import * as esbuild from 'esbuild';
import chalk from 'chalk';

/** Print usage information */
function help() {
  console.log(`npm run <command>: Runs a command from package.json

  Commands for Building and Running the Server:
    start   Build the server and run it, rebuilding and automatically
            restarting the process whenever the code changes
    build   Build a production version of the server

  Commands for Type Checking
    check   Run TypeScript's type checker on all server code

  Commands for Cleaning Up
    clean   Remove any built files that aren't tracked by git

  Other Commands
    help    Print this message
`);
}

/** The root of the project is the parent of the folder that holds main.mjs */
const root = path.join(path.dirname(fileURLToPath(import.meta.url)), "..");
/** The server's source folder */
const srcFolder = path.join(root, "src");
/** Where build output goes */
const DIST_FOLDER = path.join(root, "dist");
/** Where `npm run check` puts its output */
const TYPE_CHECK_FOLDER = path.join(root, "check");

/** Static files that just get copied into `dist`, not bundled */
const staticFiles = ["index.html", "404.html"];

/** Copy `index.html`/`404.html`/the socket.io client bundle into `deployFolder` */
function buildStaticFiles(deployFolder) {
  for (const f of staticFiles) fs.copyFileSync(path.join(srcFolder, f), path.join(deployFolder, f));
  fs.copyFileSync(
    path.join(root, "node_modules/socket.io/client-dist/socket.io.js"),
    path.join(deployFolder, "socket.io.js"));
  console.log(`  ✓ Copied static files to '${deployFolder}'`);
}

/** Clean up by deleting all output folders */
function clean() {
  for (const folder of [TYPE_CHECK_FOLDER, DIST_FOLDER]) {
    fs.rmSync(folder, { recursive: true, force: true });
  }
  console.log(chalk.green(`  ✓ Removed build output folders`));
}

/** Build and bundle (production mode) the server */
async function build() {
  console.log(`\nBuilding the server\n`);
  fs.mkdirSync(DIST_FOLDER, { recursive: true });
  buildStaticFiles(DIST_FOLDER);

  await esbuild.build({
    entryPoints: [path.join(srcFolder, "index.ts")],
    outfile: path.join(DIST_FOLDER, "index.js"),
    bundle: true,
    platform: 'node',
    minify: true,
    sourcemap: false,
  });
  console.log(chalk.green(`  ✓ Compiled TypeScript to JavaScript\n`));
  console.log(chalk.green(`Build complete: '${DIST_FOLDER}'\n`));
}

/**
 * Build and run the server in development mode: rebuilds whenever the code
 * changes, and restarts the running server process after each successful
 * rebuild.  (Unlike a browser, there's no page to live-reload -- restarting
 * the process is the server equivalent.)
 */
async function start() {
  console.log(`\nLaunching the server in development mode\n`);
  fs.mkdirSync(DIST_FOLDER, { recursive: true });
  buildStaticFiles(DIST_FOLDER);

  /** The currently-running server process, if any */
  let child;

  /** Kill the running server (if any), then start a fresh one from dist/index.js */
  function restart() {
    if (child) child.kill();
    child = spawn(process.execPath, [path.join(DIST_FOLDER, "index.js")], { stdio: 'inherit' });
  }

  const ctx = await esbuild.context({
    entryPoints: [path.join(srcFolder, "index.ts")],
    outfile: path.join(DIST_FOLDER, "index.js"),
    bundle: true,
    platform: 'node',
    minify: false,
    sourcemap: true,
    plugins: [{
      name: 'restart-on-rebuild',
      setup(build) {
        build.onEnd((result) => {
          if (result.errors.length > 0) {
            console.error(chalk.red(`  ✗ Build failed, server not restarted`));
            return;
          }
          console.log(chalk.green(`  ✓ Rebuilt -- restarting server`));
          restart();
        });
      },
    }],
  });
  await ctx.watch();
  console.log(`  ✓ Watching '${srcFolder}' for changes`);
  console.log(`  - Press ${chalk.red("ctrl-c")} to stop\n`);
}

/**
 * Dispatch to the appropriate code based on the request given as a command
 * line argument.
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
