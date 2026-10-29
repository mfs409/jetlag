# JetLag Multiplayer Server

A small Socket.IO server to support multiplayer JetLag games.
The server simulates logging in, and supports making/joining rooms and broadcasting messages to a room.
It doesn't know anything about any specific game game: a `Broadcast` carries whatever string a game sends.
Edit `src/workflow.ts` to change the rules.

## Running it

- `npm install` once
- `npm start` runs the server on port 3000
- `npm run dev` does the same, restarting whenever you change the code
- `npm run check` type-checks the code (running the server doesn't)

With the server running, <http://localhost:3000> shows a page for sending each kind of request by hand.
The page and its 404 are in `public/` and exist only for testing; a real server can delete them.

## Before you put it on the internet

- **Logins aren't secure.**
  The "token" is just `userId,userName`.
  Any user can claim any name.
  You'll want to replace that token with something you get via real authentication.
- The port (`3000`) and the allowed web origin (`http://localhost:7000`, in the CORS setting) are written in `src/index.ts`.
  You should change them to match where your server and game are hosted, probably via environment variables.
