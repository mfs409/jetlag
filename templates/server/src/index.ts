import { createServer } from "http";
import { createReadStream } from "fs";
import { join } from "path";
import { Server } from "socket.io";

import { workflow } from "./workflow";
import { User, Room } from "./types";

/** The demo page and 404 page live in the `public` folder, next to `src` */
const publicFolder = join(__dirname, "..", "public");

/** The main user table, indexed by userId */
let users = new Map<string, User>();

/** The table of rooms, indexed by roomId */
let rooms = new Map<string, Room>();

/** A table for reverse lookup of users from socket ids */
let sockets = new Map<string, User>();

// Set up a web server but don't start it yet
//
// NB: We have two routes in the server, both of which only exist for the sake
// of the demo.  Otherwise, we could have an empty server.  (The socket.io
// client library that the demo page loads, '/socket.io/socket.io.js', is
// served by socket.io itself.)
let app = createServer((req, res) => {
  // Route '/' and '/index.html' to the index.html file
  if (req.url == '/' || req.url == '/index.html') {
    res.writeHead(200, { "Content-Type": "text/html" });
    createReadStream(join(publicFolder, 'index.html')).pipe(res);
  }
  // Use 404.html for everything else
  else {
    res.writeHead(404, { "Content-Type": "text/html" });
    createReadStream(join(publicFolder, '404.html')).pipe(res);
  }
});

// Set up a websocket interface so that players can interact with each other
let io = new Server(app, { cors: { origin: "http://localhost:7000" } });
io.on('connection', (socket) => { workflow(socket, users, rooms, sockets); });

// Now call listen to actually start the web server
app.listen(3000);
