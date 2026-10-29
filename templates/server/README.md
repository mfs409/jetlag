# JetLag Multiplayer Server

A small Socket.IO server to support multiplayer JetLag games.
The server simulates logging in, and supports making/joining rooms and broadcasting messages to a room.
It doesn't know anything about any specific game game: a `Broadcast` carries whatever string a game sends.
Edit `src/workflow.ts` to change the rules.

## Running it

- `npm install` once
- `npm start` runs the server on port 3000, or on the port in the `PORT` environment variable
- `npm run dev` does the same, restarting whenever you change the code
- `npm run check` type-checks the code (running the server doesn't)

With the server running, <http://localhost:3000> shows a page for sending each kind of request by hand.
The page and its 404 are in `public/` and exist only for testing; a real server can delete them.

## Before you put it on the internet

- **Logins aren't secure.**
  The "token" is just `userId,userName`.
  Any user can claim any name.
  You'll want to replace that token with something you get via real authentication.
- Set the `PORT` and `ALLOWED_ORIGIN` environment variables to match where your server and game are hosted.
  `ALLOWED_ORIGIN` is the web address of the page that runs your game, such as `https://example.com`, and it can be a comma-separated list.
  If you don't set them, the server uses port 3000 and only accepts games served from `http://localhost:7000`.

## The protocol version

A client tells the server which version of the messages it speaks when it connects, and the server turns away a client with a different one.
The client then gets an `onErrVersion` event, so a mismatch shows up as a clear message instead of strange behavior.
The number is `PROTOCOL_VERSION` in `src/types.ts`, and it has to match the one in `jetlag2d`'s `Network.ts`.
Servers made with `npx jetlag2d create-server` start out matching the version of JetLag that made them.
If you upgrade JetLag later and a game starts getting `onErrVersion`, make a new server with the newer version, and bring your changes over.
You don't need to change the number yourself unless you're modifying JetLag's client.
