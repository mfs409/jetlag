import esbuildServe from "esbuild-serve";
import { mkdirSync, copyFileSync } from "fs";

// Try to make the destination folder.  Don't erase it first, since we
// sometimes build several things into one place
mkdirSync("./dist", { recursive: true });

// Copy static assets
copyFileSync("src/index.html", "./dist/index.html");
copyFileSync("src/404.html", "./dist/404.html");
copyFileSync("node_modules/socket.io/client-dist/socket.io.js", "./dist/socket.io.js");

// Build the game into the destination folder
esbuildServe({
    logLevel: "info",
    entryPoints: ["./src/index.ts"],
    bundle: true,
    platform: "node",
    outfile: "./dist/index.js",
    minify: true,
    sourcemap: false,
});