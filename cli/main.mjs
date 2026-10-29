#!/usr/bin/env node
// The `jetlag` command: everything a JetLag workspace needs to make, serve, and
// build games, and to make a multiplayer server.
//
// The command works from a workspace's package.json (`"serve": "jetlag
// serve"`). It also works via `npx jetlag`.
//
// The script takes any of the following commands:
//
//   {create, serve, build, zip, clean, create-server, help}
//
// For more information, see the help function.
//
// A workspace can have MANY game projects side by side under `src/`.  A project
// is a folder `src/<name>/` that has a `<name>.ts` and a `<name>.html`.

import * as fs from 'fs';
import * as path from 'path';
import { fileURLToPath } from 'url';
import * as esbuild from 'esbuild';
import chalk from 'chalk';
import AdmZip from 'adm-zip';
import * as readline from 'readline/promises';

/** Print usage information */
function help() {
  console.log(`npm run <command> [name]: Runs a command from package.json

  Commands for Working on a Project
    create [name]  Create a new project: makes a src/<name>/ folder from a
                   template.  Prompts for [name] if none given.
    serve [name]   Serve a project in development mode, rebuilding and
                   live-reloading the browser whenever the code changes.
    check          Run TypeScript's type checker (no output files) on all of
                   the code

  Commands for Shipping
    build [name]   Build a project as a standalone, ready-to-deploy package
                   (dist/<name>/)
    zip [name]     Build a project (as \`build\` does), and then put the
                   package in a single file, dist/<name>.zip

  Commands for Cleaning Up
    clean          Remove any built files that aren't tracked by git

  Other Commands
    help           Print this message

  [name] is the name of a folder in src/.  If you leave it out, serve, build,
  and zip ask you to pick one.  Giving a command a name looks like this: 
  \`npm run serve my_game\`.

  To make a multiplayer server, run \`npx jetlag create-server <folder>\`.
`);
}

/** The root of the engine: the parent of the folder that holds main.mjs */
const engineRoot = fs.realpathSync(path.join(path.dirname(fileURLToPath(import.meta.url)), ".."));

/**
 * The root of the workspace being worked on: the nearest folder, starting from
 * where the command was run and going up, that has a package.json.  (`npm run`
 * starts in that folder already.)
 */
function findWorkspaceRoot() {
  const start = fs.realpathSync(process.cwd());
  for (let dir = start; ; dir = path.dirname(dir)) {
    if (fs.existsSync(path.join(dir, "package.json"))) return dir;
    if (path.dirname(dir) === dir) return start;
  }
}
const root = findWorkspaceRoot();

/** The folder that holds every project's own sub-folder */
const srcFolder = path.join(root, "src");

/**
 * Projects import the engine as "jetlag".  In a workspace, that's the installed
 * package, so there's nothing to do.  In the engine's own repo, there is no
 * installed package, so esbuild finds it via this alias instead.
 *
 * NB: This mapping is also in tsconfig.json's `paths`, for the type checking.
 */
const ENGINE_ALIAS = root === engineRoot ? { jetlag: path.join(srcFolder, "jetlag.ts") } : {};

/** The checked-in template a new project is created from */
const templateFolder = path.join(engineRoot, "templates", "game");

/** Where `npm run build` puts each project's deployable package */
const DEPLOY_OUTPUT_FOLDER = path.join(root, "dist");

/** Written at the top of every served bundle for hot reload */
const LIVE_RELOAD_BANNER = `new EventSource("/esbuild").addEventListener("change", () => location.reload());`;

/** Clean up by deleting the output folder */
function clean() {
  fs.rmSync(DEPLOY_OUTPUT_FOLDER, { recursive: true, force: true });
  console.log(chalk.green(`  ✓ Removed build output folders`));
}

/**
 * Find every project: a folder in `src/` with a `<name>.ts` and a `<name>.html`
 * in it
 *
 * @returns The names of the projects, in alphabetical order
 */
function findProjects() {
  const names = [];
  for (const entry of fs.readdirSync(srcFolder, { withFileTypes: true })) {
    if (!entry.isDirectory()) continue;
    const ts = path.join(srcFolder, entry.name, `${entry.name}.ts`);
    const html = path.join(srcFolder, entry.name, `${entry.name}.html`);
    if (fs.existsSync(ts) && fs.existsSync(html)) names.push(entry.name);
  }
  return names.sort();
}

/**
 * Pick the project that a command should work on.  If the command was given a
 * name, use it.  If not, use the only project, or (in a terminal) ask which one,
 * suggesting the one whose code was edited most recently.  Otherwise say what
 * to do and which projects exist, and exit.
 *
 * @param command The command that needs a project, such as "serve"
 * @param name    The name given on the command line, if any
 *
 * @returns The name of the project
 */
async function chooseProject(command, name) {
  const projects = findProjects();
  if (projects.length === 0) {
    console.error(`No projects yet.  Run ${chalk.green("npm run create")} to make one.`);
    process.exit(1);
  }
  if (name) {
    if (projects.includes(name)) return name;
    console.error(chalk.red(`No project named '${name}'.`));
  } else if (projects.length === 1) {
    return projects[0];
  } else if (process.stdin.isTTY) {
    return await askForProject(projects);
  } else {
    console.error(chalk.red(`'${command}' needs the name of a project.`));
  }
  console.error(`Usage: ${chalk.green(`npm run ${command} <name>`)}`);
  console.error(`Projects that exist: ${projects.join(", ")}`);
  process.exit(1);
}

/**
 * List the projects, most recently edited first, and let the user choose one by
 * number or name.  Pressing enter chooses the first.
 *
 * @param projects The names of all of the projects
 *
 * @returns The name of the chosen project
 */
async function askForProject(projects) {
  const edited = (p) => fs.statSync(path.join(srcFolder, p, `${p}.ts`)).mtimeMs;
  const ordered = [...projects].sort((a, b) => edited(b) - edited(a));
  ordered.forEach((p, i) => console.log(`  ${i + 1}. ${p}${i === 0 ? chalk.gray("  (edited most recently)") : ""}`));
  const rl = readline.createInterface({ input: process.stdin, output: process.stdout });
  const answer = (await rl.question(`Which project? [1] `)).trim();
  rl.close();
  const choice = answer === "" ? ordered[0] : ordered[Number(answer) - 1] ?? ordered.find((p) => p === answer);
  if (!choice) {
    console.error(chalk.red(`'${answer}' isn't one of the projects.`));
    process.exit(1);
  }
  return choice;
}

/**
 * Create a new project: make `src/<name>/` and copy the template into it
 * (renamed to match `<name>`).
 *
 * @param name The new project's folder name, or undefined to prompt for one
 */
async function create(name) {
  if (!name) {
    if (!process.stdin.isTTY) {
      console.error(chalk.red(`Run this with a name (e.g. \`npm run create my_game\`) when not in an interactive terminal.`));
      process.exit(1);
    }
    const rl = readline.createInterface({ input: process.stdin, output: process.stdout });
    name = (await rl.question("Name for the new project (letters, numbers, _, - only): ")).trim();
    rl.close();
  }

  if (!/^[A-Za-z0-9_-]+$/.test(name)) {
    console.error(chalk.red(`'${name}' isn't a valid project name.  Use only letters, numbers, '_', and '-'.`));
    process.exit(1);
  }
  const destFolder = path.join(srcFolder, name);
  if (fs.existsSync(destFolder)) {
    console.error(chalk.red(`src/${name}/ already exists.`));
    process.exit(1);
  }
  fs.mkdirSync(destFolder, { recursive: true });

  // The template's own script tag points at "./game.js", because it doesn't
  // know its own eventual name.  Point it at this project's real output name.
  const templateHtml = fs.readFileSync(path.join(templateFolder, "game.html"), "utf8");
  fs.writeFileSync(path.join(destFolder, `${name}.html`), templateHtml.replace('src="./game.js"', `src="./${name}.js"`));
  fs.copyFileSync(path.join(templateFolder, "game.ts"), path.join(destFolder, `${name}.ts`));
  // Every project keeps its images, sounds, and fonts in its own `assets`
  // folder.  The .gitkeep makes git track the folder while it's empty; `build`
  // doesn't copy it.
  fs.mkdirSync(path.join(destFolder, "assets"));
  fs.writeFileSync(path.join(destFolder, "assets", ".gitkeep"), "");

  console.log(chalk.green(`  ✓ Created src/${name}/${name}.ts, src/${name}/${name}.html, and src/${name}/assets/`));
  console.log(`\nNext steps:`);
  console.log(`  - Edit src/${name}/${name}.ts`);
  console.log(`  - Run ${chalk.green(`npm run serve ${name}`)} to see it`);
}

/**
 * Build and serve a project in development mode, rebuilding and reloading the
 * browser whenever its code changes.
 *
 * esbuild does all of the work.  It serves everything in `src/` as it is, so
 * the project's HTML and assets are served from where they are.  The only thing
 * that isn't a file on disk is the compiled code, which esbuild makes on the
 * fly, in memory (`write: false`), at the path where the HTML expects it.
 *
 * @param name The project to serve
 */
async function serve(name) {
  const project = await chooseProject("serve", name);
  const ctx = await esbuild.context({
    entryPoints: [path.join(srcFolder, project, `${project}.ts`)],
    alias: ENGINE_ALIAS,
    outdir: srcFolder,
    outbase: srcFolder,
    write: false,
    bundle: true,
    sourcemap: true,
    platform: "browser",
    banner: { js: LIVE_RELOAD_BANNER },
  });
  await ctx.watch();
  const port = 7000;
  await ctx.serve({ port, host: "localhost", servedir: srcFolder });
  console.log(chalk.green(`\nServing at http://localhost:${port}/${project}/${project}.html`));
  console.log(`  - The browser will auto-reload when code, assets, or an HTML file change`);
  console.log(`  - Press ${chalk.red("ctrl-c")} to stop the server`);
}

/**
 * Build a project as a standalone, ready-to-deploy package: a single
 * self-contained, minified bundle, so `dist/<name>/` can be zipped up and
 * hosted anywhere on its own.
 *
 * Assets come from the project's own `assets/` folder, if it has one.  Files
 * whose names start with "." (such as `.gitkeep`) are not copied.
 *
 * @param name The project to build
 */
async function build(name) {
  const project = await chooseProject("build", name);
  console.log(`\nBuilding '${project}' for deployment\n`);
  const deployFolder = path.join(DEPLOY_OUTPUT_FOLDER, project);
  fs.rmSync(deployFolder, { recursive: true, force: true });
  fs.mkdirSync(deployFolder, { recursive: true });

  fs.copyFileSync(path.join(srcFolder, project, `${project}.html`), path.join(deployFolder, "index.html"));
  console.log(`  ✓ Copied '${project}.html' to '${deployFolder}' as 'index.html'`);

  const assets = path.join(srcFolder, project, "assets");
  if (fs.existsSync(assets)) {
    fs.cpSync(assets, path.join(deployFolder, "assets"), {
      recursive: true,
      filter: (src) => !path.basename(src).startsWith("."),
    });
    console.log(`  ✓ Copied assets from '${assets}'`);
  }

  await esbuild.build({
    entryPoints: [path.join(srcFolder, project, `${project}.ts`)],
    alias: ENGINE_ALIAS,
    outfile: path.join(deployFolder, `${project}.js`),
    bundle: true,
    minify: true,
    sourcemap: false,
    platform: "browser",
  });
  console.log(chalk.green(`  ✓ Compiled TypeScript to JavaScript\n`));
  console.log(chalk.green(`Build complete: '${deployFolder}'\n`));
}

/**
 * Build a project as a standalone package, and then put that package into a
 * single .zip file, next to the package's folder.
 *
 * @param name The project to build and zip
 */
async function zip(name) {
  const project = await chooseProject("zip", name);
  await build(project);
  const zipFile = path.join(DEPLOY_OUTPUT_FOLDER, `${project}.zip`);
  // Everything in the package goes at the top of the zip, which is what itch.io and its kind need
  const archive = new AdmZip();
  archive.addLocalFolder(path.join(DEPLOY_OUTPUT_FOLDER, project));
  archive.writeZip(zipFile);
  console.log(chalk.green(`  ✓ Zipped it into '${zipFile}'\n`));
}

/**
 * Make a new multiplayer server project from the template: a folder with
 * everything the server needs, which is meant to be edited.  It's separate from
 * any workspace, so it goes wherever the user says, relative to where they ran
 * the command.
 *
 * @param dir The folder to make, which must not already have things in it
 */
function createServer(dir) {
  if (!dir) {
    console.error(chalk.red(`'create-server' needs the name of a folder to make.`));
    console.error(`Usage: ${chalk.green("npx jetlag create-server <folder>")}`);
    process.exit(1);
  }
  const dest = path.resolve(dir);
  if (fs.existsSync(dest) && fs.readdirSync(dest).length > 0) {
    console.error(chalk.red(`'${dir}' already exists and isn't empty.`));
    process.exit(1);
  }
  fs.cpSync(path.join(engineRoot, "templates", "server"), dest, {
    recursive: true,
    filter: (src) => !["node_modules", "dist"].includes(path.basename(src)),
  });

  // Give the server its own package name, since the template's is generic
  const packageFile = path.join(dest, "package.json");
  const pkg = JSON.parse(fs.readFileSync(packageFile, "utf8"));
  pkg.name = path.basename(dest).toLowerCase().replace(/[^a-z0-9._-]+/g, "-").replace(/^[._-]+/, "") || pkg.name;
  fs.writeFileSync(packageFile, JSON.stringify(pkg, null, 2) + "\n");

  console.log(chalk.green(`  ✓ Created the server in '${dir}'`));
  console.log(`\nNext steps:`);
  console.log(`  - Run ${chalk.green(`cd ${dir} && npm install && npm start`)}`);
  console.log(`  - Read ${path.join(dir, "README.md")}, especially before putting it on the internet`);
}

/**
 * Dispatch to the appropriate code based on the request given as a command
 * line argument.
 *
 * @param command The requested command
 * @param arg     The (optional, command-dependent) argument after it
 */
async function main(command, arg) {
  if (command === "create") {
    await create(arg);
  } else if (command === "serve") {
    await serve(arg);
  } else if (command === "build") {
    await build(arg);
  } else if (command === "zip") {
    await zip(arg);
  } else if (command === "clean") {
    clean();
  } else if (command === "create-server") {
    createServer(arg);
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
await main(process.argv[2], process.argv[3]);
