// serve-one.mjs: 
//   Serve (development mode) the tutorial specified by the TUT environment
//   variable.  This is only intended for internal development of tutorials.
//
//   This script watches for changes to the code and automatically re-builds /
//   refreshes the browser.  Note that, unfortunately, on changes to the game's
//   main HTML file or assets, it does not know to automatically refresh the
//   browser.  In those cases, you'll need to manually refresh.

import * as path from 'path';
import { fileURLToPath } from 'url';
import { DEV_OUTPUT_FOLDER, run_dev_server } from './common.mjs';

// Compute the root folder of this project (`import.meta.url` is the path to
// *this file*, which is assumed to be in the `scripts/` subfolder of the root).
const root_folder = path.join(path.dirname(fileURLToPath(import.meta.url)), "..");

// Query the environment to figure out which of the games/tutorials to build.
// If none is provided, default to the demo game.
const chapter = process.env.CHAPTER;
if (!chapter) {
    throw "You must define the CHAPTER environment variable";
}

// Query the environment to figure out which of the games/tutorials to build.
// If none is provided, default to the demo game.
const name = process.env.NAME;
if (!name) {
    throw "You must define the NAME environment variable";
}

// Compute the source and destination folders
const src_folder = path.join(root_folder, "src", chapter);
const dest_folder = path.join(root_folder, DEV_OUTPUT_FOLDER);

// Figure out paths to the tutorial's main `ts` file, its `html` file, and its
// `assets` folder
const src = {
    folder: src_folder,
    html: path.join(src_folder, `${name}.html`),
    ts: path.join(src_folder, `${name}.ts`),
    assets: path.join(root_folder, "src/assets"),
}

// Figure out the paths where everything is going to be put
const dest = {
    folder: dest_folder,
    html: path.join(dest_folder, "index.html"),
    js: path.join(dest_folder, `${name}.js`),
    assets: path.join(dest_folder, "assets"),
}

// Launch the development server
console.log(`Launching a development server for ${chapter}/${name}`);
run_dev_server(src, dest);