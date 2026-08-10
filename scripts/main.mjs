// All of the scripts that are executed through package.json are in this file.
//
// You can invoke this script with any of the following commands:
//
//   {create, serve, build, check, clean, help}
//
// For more information, see the help function.
//
// This repo supports having MANY game projects side by side under `src/`.
// `projects.json` (at the repo root) indicates which folders are real projects.
// Every command reads `projects.json` and trusts it. `create` (below) is the
// only thing that's supposed to write to it.

import * as fs from 'fs';
import * as path from 'path';
import { fileURLToPath } from 'url';
import * as esbuild from 'esbuild';
import chalk from 'chalk';
import { spawnSync } from 'child_process';
import * as readline from 'readline/promises';

/** Print usage information */
function help() {
  console.log(`npm run <command>: Runs a command from package.json

  Commands for Working on a Project
    create        Create a new project: makes a src/<name>/ folder from a
                  template, and registers it in projects.json
    serve [name]  Serve a project (or, with no name, ALL of them at once) in
                  development mode, rebuilding and live-reloading the
                  browser whenever the code changes. \`npm start\` is a
                  shortcut for \`npm run serve\` with no name.

  Commands for Shipping
    build [name]  With a name: build ONE project as a standalone,
                  ready-to-deploy package (dist/<name>/). With no name:
                  build a single portfolio site with EVERY project
                  (portfolio/), plus a gallery page linking to each.

  Commands for Type Checking
    check [name]  Run TypeScript's type checker (no output files) on one
                  project, or (with no name) on every project at once

  Commands for Cleaning Up
    clean         Remove any built files that aren't tracked by git

  Other Commands
    help          Print this message

  [name] everywhere above refers to a project's "folder" name in
  projects.json.  Targeting a project with other commands other than
  \`npm start\` looks like this: \`npm run serve -- my_game\`.
`);
}

/** The root of the project is the parent of the folder that holds main.mjs */
const root = path.join(path.dirname(fileURLToPath(import.meta.url)), "..");
/** The folder that holds every project's own sub-folder */
const srcFolder = path.join(root, "src");
/** The checked-in template a new project is created from */
const templateFolder = path.join(root, "scripts", "template");
/** The manifest of every real project.  See the file-level comment above */
const projectsFile = path.join(root, "projects.json");

/** Where `npm run serve` puts its build output */
const DEV_OUTPUT_FOLDER = path.join(root, "dev-serve");
/** Where `npm run build` (with no name) puts the portfolio site */
const PORTFOLIO_OUTPUT_FOLDER = path.join(root, "portfolio");
/** Where `npm run build <name>` puts that one project's deployable package */
const DEPLOY_OUTPUT_FOLDER = path.join(root, "dist");
/**
 * A throwaway tsconfig, written by check() and removed again when it's done.
 * See check() for why it's needed
 */
const TMP_TSCONFIG = path.join(root, ".tsconfig.check.json");

/**
 * Clobber a folder, and all of its contents, recursively. Then re-create the
 * folder.
 *
 * @param folder The folder to clobber. Nested folders are allowed.
 */
function resetFolder(folder) {
  fs.rmSync(folder, { recursive: true, force: true });
  fs.mkdirSync(folder, { recursive: true });
}

/**
 * Clean up by deleting all output folders (and the throwaway tsconfig, if a
 * `check` got interrupted)
 */
function clean() {
  for (const folder of [DEPLOY_OUTPUT_FOLDER, DEV_OUTPUT_FOLDER, PORTFOLIO_OUTPUT_FOLDER]) {
    fs.rmSync(folder, { recursive: true, force: true });
  }
  fs.rmSync(TMP_TSCONFIG, { force: true });
  console.log(chalk.green(`  ✓ Removed build output folders`));
}

/**
 * Read `projects.json`. Exits with an error message if it's missing or
 * unparsable.
 */
function loadProjects() {
  if (!fs.existsSync(projectsFile)) {
    console.error(chalk.red(`projects.json is missing. It should exist (even if empty) at the repo root.`));
    process.exit(1);
  }
  try {
    return JSON.parse(fs.readFileSync(projectsFile, "utf8"));
  } catch (e) {
    console.error(chalk.red(`projects.json isn't valid JSON: ${e.message}`));
    process.exit(1);
  }
}

/** Write `projects.json` back out, pretty-printed */
function saveProjects(projects) {
  fs.writeFileSync(projectsFile, JSON.stringify(projects, null, 2) + "\n");
}

/**
 * Every project's `folder`/`html`/`ts` describe where its files SHOULD be.
 * If a project got renamed or deleted by hand instead of through this
 * script, projects.json can drift from what's actually on disk. Rather than
 * crash, this filters those entries out (with a warning), so the rest of
 * the projects keep working.
 *
 * @param projects The full list from projects.json
 * @returns Only the entries whose folder/html/ts all still exist on disk
 */
function verifyProjectsExist(projects) {
  const ok = [];
  for (const p of projects) {
    const htmlPath = path.join(srcFolder, p.folder, p.html);
    const tsPath = path.join(srcFolder, p.folder, p.ts);
    if (fs.existsSync(htmlPath) && fs.existsSync(tsPath)) {
      ok.push(p);
    } else {
      console.error(chalk.red(`  ✗ Skipping '${p.folder}': projects.json says it should have '${p.html}' and '${p.ts}', but one or both are missing on disk.`));
    }
  }
  return ok;
}

/**
 * Load, verify, and require at least one project to exist; exits with a helpful
 * message otherwise
 */
function requireProjects() {
  const projects = verifyProjectsExist(loadProjects());
  if (projects.length === 0) {
    console.error(`No projects yet. Run ${chalk.green("npm run create")} to make one.`);
    process.exit(1);
  }
  return projects;
}

/**
 * Find one project by folder name, or exit with a helpful message listing what
 * does exist
 */
function requireProject(projects, name) {
  const found = projects.find((p) => p.folder === name);
  if (!found) {
    console.error(chalk.red(`No project named '${name}'.`));
    console.error(`Projects that do exist: ${projects.map((p) => p.folder).join(", ")}`);
    process.exit(1);
  }
  return found;
}

/**
 * Create a new project: make `src/<name>/`, copy the template into it (renamed
 * to match `<name>`), and register it in projects.json.
 *
 * @param name The new project's folder name, or undefined to prompt for one
 */
async function create(name) {
  if (!name) {
    if (!process.stdin.isTTY) {
      console.error(chalk.red(`Run this with a name (e.g. \`npm run create -- my_game\`) when not in an interactive terminal.`));
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
  if (name === "jetlag") {
    console.error(chalk.red(`'jetlag' is reserved for the engine folder.`));
    process.exit(1);
  }
  const projects = loadProjects();
  if (projects.some((p) => p.folder === name)) {
    console.error(chalk.red(`A project named '${name}' is already in projects.json.`));
    process.exit(1);
  }
  const destFolder = path.join(srcFolder, name);
  if (fs.existsSync(destFolder)) {
    console.error(chalk.red(`src/${name}/ already exists.`));
    process.exit(1);
  }

  const html = `${name}.html`;
  const ts = `${name}.ts`;
  fs.mkdirSync(destFolder, { recursive: true });

  // The template's own script tag points at "./game.js", because it doesn't
  // know its own eventual name.  Point it at this project's real output name.
  const templateHtml = fs.readFileSync(path.join(templateFolder, "game.html"), "utf8");
  fs.writeFileSync(path.join(destFolder, html), templateHtml.replace('src="./game.js"', `src="./${name}.js"`));
  fs.copyFileSync(path.join(templateFolder, "game.ts"), path.join(destFolder, ts));

  // Default to the shared top-level assets/ folder (the same one every tutorial
  // project uses).  See resolveAssetsDir() for how to point a standalone
  // project at its own assets instead.
  projects.push({ folder: name, html, ts, assets: "assets", description: "", screenshot: "" });
  saveProjects(projects);

  console.log(chalk.green(`  ✓ Created src/${name}/${ts} and src/${name}/${html}`));
  console.log(chalk.green(`  ✓ Registered '${name}' in projects.json`));
  console.log(`\nNext steps:`);
  console.log(`  - Edit src/${name}/${ts}`);
  console.log(`  - Run ${chalk.green(`npm run serve -- ${name}`)} to see it (or just ${chalk.green("npm start")}, if it's your only project)`);
}

/**
 * Rewrite a project's `<script src="./whatever.js"></script>` tag to load as an
 * ES module (`type="module"`).  This is needed whenever the JS was built with
 * esbuild's code-splitting (`serve`/`build` with no name), since a split bundle
 * uses real `import` statements that only work as a module.
 *
 * @param html The original HTML text
 * @returns The rewritten HTML text, or the original unchanged if no matching
 *          (and not-already-a-module) script tag was found
 */
function rewriteScriptTagAsModule(html) {
  return html.replace(/<script((?:(?!type=)[^>])*)src="(\.\/[^"]+\.js)"((?:(?!type=)[^>])*)><\/script>/, (whole, before, src, after) => {
    return `<script type="module"${before}src="${src}"${after}></script>`;
  });
}

/**
 * A tiny page that immediately navigates the browser to `url`. Used for the
 * "just show me my one game at the root URL" shortcut (see serve()): the ACTUAL
 * page has to be loaded from its own folder (not copied elsewhere), because
 * everything a project loads at runtime is fetched using a URL that's resolved
 * relative to whatever page the browser currently has loaded, not relative to
 * where the underlying files happen to sit on disk.
 *
 * @param url Where to send the browser
 */
function redirectPage(url) {
  return `<!DOCTYPE html><html><head><meta http-equiv="refresh" content="0; url=${url}"></head><body><a href="${url}">${url}</a></body></html>\n`;
}

/**
 * Build a gallery page linking to every project.  Makes a full "card" for
 * projects that have more info in the .json file.
 *
 * @param projects The projects to list
 * @returns The gallery page's HTML text
 */
function renderPortfolioIndex(projects) {
  const items = projects.map((p) => {
    const href = `${p.folder}/${p.html}`;
    if (!p.description && !p.screenshot) {
      return `      <li><a href="${href}">${p.folder}</a></li>`;
    }
    const img = p.screenshot ? `<img src="${p.folder}/${p.screenshot}" alt="${p.folder} screenshot">` : "";
    const desc = p.description ? `<p>${p.description}</p>` : "";
    return `      <li class="card">${img}<h3><a href="${href}">${p.folder}</a></h3>${desc}</li>`;
  });
  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <title>My JetLag Projects</title>
  <style>
    body { font-family: sans-serif; max-width: 800px; margin: 2em auto; padding: 0 1em; }
    ul { list-style: none; padding: 0; }
    li { margin-bottom: 1em; }
    li.card { border: 1px solid #ccc; border-radius: 8px; padding: 1em; }
    li.card img { max-width: 100%; border-radius: 4px; }
  </style>
</head>
<body>
  <h1>My JetLag Projects</h1>
  <ul>
${items.join("\n")}
  </ul>
</body>
</html>
`;
}

/**
 * Where a project's REAL assets live on disk, resolved from its own `assets`
 * field in projects.json.
 *
 * Warning: There's no way to check that this actually MATCHES the project's own
 * `resources.prefix` in the TypeScript code.  If they disagree, the project
 * will build fine but fail to find its images/sounds/fonts at runtime. Keeping
 * the two in sync is on the programmer.
 *
 * @param project A projects.json entry
 * @returns The absolute path to that project's real assets folder
 */
function resolveAssetsDir(project) {
  return path.resolve(root, project.assets);
}

/**
 * True if `project`'s real assets folder lives inside its OWN `src/<folder>/`
 * (as opposed to somewhere shared with other projects, like the default
 * top-level `assets/`). Determines how its assets get placed in a mirrored
 * (serve/portfolio) build.
 */
function hasOwnAssets(project) {
  const dir = resolveAssetsDir(project);
  const projectFolder = path.join(srcFolder, project.folder);
  return dir === projectFolder || dir.startsWith(projectFolder + path.sep);
}

/**
 * Copy a project's real assets folder into `<deployFolder>/assets`.  A project
 * with its OWN assets folder (the intended shape for something you're actually
 * going to ship) deploys correctly as-is.
 *
 * @param project      A projects.json entry
 * @param deployFolder The (already-created) folder to copy assets into
 */
function copyProjectAssetsFlat(project, deployFolder) {
  const from = resolveAssetsDir(project);
  if (!fs.existsSync(from)) {
    console.error(chalk.red(`  ✗ ${project.folder}: assets folder '${from}' doesn't exist, skipping it`));
    return;
  }
  const to = path.join(deployFolder, "assets");
  fs.cpSync(from, to, { recursive: true });
  console.log(`  ✓ Copied assets from '${from}' to '${to}'`);
}

/**
 * Where a project's assets land in a mirrored (serve/portfolio) build
 *
 * @param project    A projects.json entry
 * @param outputRoot The folder that holds one sub-folder per project
 * @returns Where that project's assets should be copied to
 */
function mirroredAssetsDest(project, outputRoot) {
  return hasOwnAssets(project)
    ? path.join(outputRoot, project.folder, "assets")
    : path.join(outputRoot, "assets");
}

/**
 * Copy a project's real assets folder into an `outputRoot` that mirrors
 * `src`'s own layout (one folder per project)
 *
 * @param project       A projects.json entry
 * @param outputRoot    The folder that holds one sub-folder per project
 * @param alreadyCopied A Set of destination paths already copied to, shared
 *                      across every project in this build
 */
function copyProjectAssetsMirrored(project, outputRoot, alreadyCopied) {
  const from = resolveAssetsDir(project);
  if (!fs.existsSync(from)) {
    console.error(chalk.red(`  ✗ ${project.folder}: assets folder '${from}' doesn't exist, skipping it`));
    return;
  }
  const to = mirroredAssetsDest(project, outputRoot);
  if (alreadyCopied.has(to)) return;
  alreadyCopied.add(to);
  fs.mkdirSync(path.dirname(to), { recursive: true });
  fs.cpSync(from, to, { recursive: true });
  console.log(`  ✓ Copied assets from '${from}' to '${to}'`);
}

/**
 * Copy a project's screenshot (if it has one) alongside its built HTML, for the
 * gallery page to load. Missing files are skipped with a warning instead of
 * failing the build.
 */
function copyScreenshotIfPresent(project, destFolder) {
  if (!project.screenshot) return;
  const srcPath = path.join(srcFolder, project.folder, project.screenshot);
  if (!fs.existsSync(srcPath)) {
    console.error(chalk.red(`  ✗ ${project.folder}: screenshot '${project.screenshot}' doesn't exist, skipping it`));
    return;
  }
  fs.copyFileSync(srcPath, path.join(destFolder, project.screenshot));
}

/**
 * Copy `game.html` to `<serveFolder>/index.html`, injecting a small live-reload
 * snippet that subscribes to esbuild's `/esbuild` server-sent-event stream
 * (automatically exposed by `ctx.serve()`) and reloads the page whenever a
 * rebuild happens. Dev-only: the source HTML and production builds never
 * get this snippet.
 *
 * @param html The already-built HTML text (module tag already rewritten, if needed)
 */
function injectLiveReload(html) {
  const liveReload = `<script>new EventSource("/esbuild").addEventListener("change", () => location.reload());</script>`;
  return html.replace("</body>", `  ${liveReload}\n</body>`);
}

/**
 * Build and serve, in development mode, either ONE project (if `name` is given)
 * or ALL of them at once (if it's not).  Rebuilds and reloads the browser
 * whenever any of their code changes.
 *
 * Whether one project or many are being served, this always goes through
 * esbuild's own code-splitting (`format: "esm", splitting: true`): with just
 * one entry point it behaves the same as a plain bundle (nothing to split), and
 * with many, the shared JetLag engine code compiles once instead of once per
 * project.
 *
 * @param name The project to serve, or undefined to serve everything
 */
async function serve(name) {
  const all = requireProjects();
  const targets = name ? [requireProject(all, name)] : all;

  console.log(`\nLaunching a development server for: ${targets.map((p) => p.folder).join(", ")}\n`);

  resetFolder(DEV_OUTPUT_FOLDER);
  const copiedAssetDirs = new Set();
  for (const p of targets) {
    copyProjectAssetsMirrored(p, DEV_OUTPUT_FOLDER, copiedAssetDirs);
    copyScreenshotIfPresent(p, path.join(DEV_OUTPUT_FOLDER, p.folder));
  }

  /**
   * Re-render every target's own HTML (and, if there's more than one, the
   * gallery page) into dev-serve/
   */
  function writeServedHtml() {
    for (const p of targets) {
      const raw = fs.readFileSync(path.join(srcFolder, p.folder, p.html), "utf8");
      const rewritten = injectLiveReload(rewriteScriptTagAsModule(raw));
      fs.mkdirSync(path.join(DEV_OUTPUT_FOLDER, p.folder), { recursive: true });
      fs.writeFileSync(path.join(DEV_OUTPUT_FOLDER, p.folder, p.html), rewritten);
    }
    // With exactly one target (whether because a name was given, or
    // because that's the only project that exists), serving it AT THE
    // ROOT url is much friendlier than making a beginner click through a
    // one-item gallery. With more than one, the root is the gallery. Either
    // way, the root page is never a COPY of the real one (see
    // redirectPage()'s own comment for why).
    if (targets.length === 1) {
      fs.writeFileSync(path.join(DEV_OUTPUT_FOLDER, "index.html"), redirectPage(`./${targets[0].folder}/${targets[0].html}`));
    } else {
      fs.writeFileSync(path.join(DEV_OUTPUT_FOLDER, "index.html"), injectLiveReload(renderPortfolioIndex(targets)));
    }
  }
  writeServedHtml();

  // Watch each target's own folder for HTML changes, and each target's real
  // assets folder, and keep dev-serve/ in sync.  Doesn't auto-refresh the
  // browser on these changes; only code changes do that (via esbuild's own
  // watch+serve below).
  for (const p of targets) {
    fs.watch(path.join(srcFolder, p.folder), (_eventType, filename) => {
      if (!filename || !filename.endsWith(".html")) return;
      writeServedHtml();
      console.log(`  ✓ Refreshed ${p.folder}/${p.html}`);
    });

    const from = resolveAssetsDir(p);
    const to = mirroredAssetsDest(p, DEV_OUTPUT_FOLDER);
    if (!fs.existsSync(from)) continue; // already warned about this in copyProjectAssetsMirrored
    fs.watch(from, { recursive: true }, (_eventType, filename) => {
      if (!filename) return;
      const fromFile = path.join(from, filename);
      const toFile = path.join(to, filename);
      try {
        if (fs.existsSync(fromFile)) {
          fs.mkdirSync(path.dirname(toFile), { recursive: true });
          fs.copyFileSync(fromFile, toFile);
          console.log(`  ✓ Asset updated: ${filename}`);
        } else if (fs.existsSync(toFile)) {
          fs.unlinkSync(toFile);
          console.log(`  ✓ Asset removed: ${filename}`);
        }
      } catch (err) {
        console.error(chalk.red(`  ✗ Error syncing asset '${filename}':`), err.message);
      }
    });
  }
  console.log(`  ✓ Installed watchers to keep '${DEV_OUTPUT_FOLDER}' up to date with source changes`);

  const ctx = await esbuild.context({
    entryPoints: targets.map((p) => ({ in: path.join(srcFolder, p.folder, p.ts), out: `${p.folder}/${path.basename(p.ts, ".ts")}` })),
    outdir: DEV_OUTPUT_FOLDER,
    bundle: true,
    splitting: true,
    format: "esm",
    chunkNames: "chunks/[hash]",
    minify: false,
    sourcemap: true,
    platform: "browser",
  });
  await ctx.watch();

  const serveOptions = { port: 7000, host: "localhost", servedir: DEV_OUTPUT_FOLDER };
  console.log(chalk.green(`\nServing at http://localhost:${serveOptions.port}/`));
  console.log(`  - The browser will auto-reload when code, assets, or an HTML file change`);
  console.log(`  - Press ${chalk.red("ctrl-c")} to stop the server`);
  await ctx.serve(serveOptions);
}

/**
 * Build ONE project as a standalone, ready-to-deploy package: a single
 * self-contained (not code-split) minified bundle, so `dist/<name>/` can be
 * zipped up and hosted anywhere on its own.
 */
async function buildOne(project) {
  console.log(`\nBuilding '${project.folder}' for deployment\n`);
  const deployFolder = path.join(DEPLOY_OUTPUT_FOLDER, project.folder);
  resetFolder(deployFolder);

  const html = fs.readFileSync(path.join(srcFolder, project.folder, project.html), "utf8");
  fs.writeFileSync(path.join(deployFolder, "index.html"), html);
  console.log(`  ✓ Copied '${project.html}' to '${deployFolder}' as 'index.html'`);
  copyProjectAssetsFlat(project, deployFolder);
  copyScreenshotIfPresent(project, deployFolder);

  await esbuild.build({
    entryPoints: [path.join(srcFolder, project.folder, project.ts)],
    outfile: path.join(deployFolder, `${path.basename(project.ts, ".ts")}.js`),
    bundle: true,
    minify: true,
    sourcemap: false,
    platform: "browser",
  });
  console.log(chalk.green(`  ✓ Compiled TypeScript to JavaScript\n`));
  console.log(chalk.green(`Build complete: '${deployFolder}'\n`));
}

/**
 * Build a single portfolio site containing EVERY project at once
 * (`portfolio/`), code-split so the shared JetLag engine code compiles
 * once no matter how many projects there are, plus a gallery page (see
 * renderPortfolioIndex) linking to each.
 */
async function buildPortfolio(projects) {
  console.log(`\nBuilding a portfolio of ${projects.length} project(s)\n`);
  resetFolder(PORTFOLIO_OUTPUT_FOLDER);

  await esbuild.build({
    entryPoints: projects.map((p) => ({ in: path.join(srcFolder, p.folder, p.ts), out: `${p.folder}/${path.basename(p.ts, ".ts")}` })),
    outdir: PORTFOLIO_OUTPUT_FOLDER,
    bundle: true,
    splitting: true,
    format: "esm",
    chunkNames: "chunks/[hash]",
    minify: true,
    sourcemap: false,
    platform: "browser",
    logLevel: "info",
  });

  const copiedAssetDirs = new Set();
  for (const p of projects) {
    const raw = fs.readFileSync(path.join(srcFolder, p.folder, p.html), "utf8");
    const destFolder = path.join(PORTFOLIO_OUTPUT_FOLDER, p.folder);
    fs.mkdirSync(destFolder, { recursive: true });
    fs.writeFileSync(path.join(destFolder, p.html), rewriteScriptTagAsModule(raw));
    copyProjectAssetsMirrored(p, PORTFOLIO_OUTPUT_FOLDER, copiedAssetDirs);
    copyScreenshotIfPresent(p, destFolder);
  }

  fs.writeFileSync(path.join(PORTFOLIO_OUTPUT_FOLDER, "index.html"), renderPortfolioIndex(projects));
  console.log(chalk.green(`\nBuild complete: '${PORTFOLIO_OUTPUT_FOLDER}' (${projects.length} project(s) + a gallery page)\n`));
}

/**
 * With a name: build that one project as a standalone deployable package.
 * With no name: build the whole portfolio.
 *
 * @param name The project to build, or undefined to build everything
 */
async function build(name) {
  const all = requireProjects();
  if (name) {
    await buildOne(requireProject(all, name));
  } else {
    await buildPortfolio(all);
  }
}

/**
 * Type-check one project (or, with no name, every project) with `tsc
 * --noEmit`. No `.js` files are ever produced.
 *
 * tsc won't let you combine `--project <config>` with file arguments on the
 * command line, so there's no direct way to say "use tsconfig.json's
 * compilerOptions, but only check THESE files" without either duplicating
 * every compiler option as CLI flags, or (what this does instead) writing
 * a throwaway config that `extends` the real one and overrides `files`,
 * pointing `-p` at that instead. It's deleted again in a `finally`, even if
 * tsc itself fails.
 *
 * @param name The project to check, or undefined to check everything
 */
function check(name) {
  const all = requireProjects();
  const targets = name ? [requireProject(all, name)] : all;
  console.log(`Checking: ${targets.map((p) => p.folder).join(", ")}`);

  const files = targets.map((p) => path.join("src", p.folder, p.ts).split(path.sep).join("/"));
  fs.writeFileSync(TMP_TSCONFIG, JSON.stringify({ extends: "./tsconfig.json", files }, null, 2));

  try {
    const tscBin = path.join(root, "node_modules", ".bin", process.platform === "win32" ? "tsc.cmd" : "tsc");
    const result = spawnSync(tscBin, ["--noEmit", "-p", TMP_TSCONFIG], { cwd: root, stdio: "inherit" });
    if (result.status === 0) {
      console.log(chalk.green(`  ✓ No type errors`));
    } else {
      process.exitCode = result.status ?? 1;
    }
  } finally {
    fs.rmSync(TMP_TSCONFIG, { force: true });
  }
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
  } else if (command === "check") {
    check(arg);
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
await main(process.argv[2], process.argv[3]);
