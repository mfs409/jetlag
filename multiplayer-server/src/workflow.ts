import { Socket } from "socket.io";
import { Broadcast, EvtUserJoined, EvtUserLeft, Message, ReqCreate, ReqJoin, ReqLoginToken, ReqLogout, ResCreated, ResErrFormat, ResErrHasRoom, ResErrHasUser, ResErrNoRoom, ResErrNoUser, ResErrUserTaken, ResJoined, ResLoggedIn, ResLoggedOut, ResSent, Room, User } from "./types";

// The following Mermaid.js Graph describes all of the transitions and events in
// the workflow.  The "Server" is replicated in the diagram, to make it easier
// to see the relationship between requests and responses.  The client can be in
// one of three states, so to keep the diagram clean, each client state is
// isolated.
//
// graph LR
//     C1A[Client: No User, No Room]
//     S1A[Server]
//     C1A-->|ReqLoginToken| S1A
//     S1A-->|ResErrFormat| C1A
//     S1A-->|ResErrUserTaken| C1A
//     S1A-->|ResLoggedIn| C1AOK[Client: User, No Room]
//     S1B[Server]
//     C1A-->|ReqCreate| S1B
//     C1A-->|ReqJoin| S1B
//     C1A-->|ReqLogout| S1B
//     C1A-->|Broadcast| S1B
//     S1B-->|ResErrNoUser| C1A
//     S1C[Server]
//     C1A-->|Disconnect| S1C
//
//     C2A[Client: User, No Room]
//     S2A[Server]
//     C2A-->|ReqLoginToken|S2A
//     S2A-->|ResErrHasUser|C2A
//     S2B[Server]
//     C2A-->|ReqCreate|S2B
//     S2B-->|ResCreated|C2BOK[Client: User, Room]
//     S2C[Server]
//     C2A-->|ReqJoin|S2C
//     S2C-->|ResErrFormat|C2A
//     S2C-->|ResErrNoRoom|C2A
//     S2C-->|ResJoined|C2BOK[Client: User, Room]
//     S2C-->|EvtUserJoined|C2C2(Room)
//     S2D[Server]
//     C2A-->|ReqLogout|S2D
//     S2D-->|ResLoggedOut|C2D2[Client: No User, No Room]
//     S2E[Server]
//     C2A-->|Broadcast|S2E
//     S2E-->|ResErrNoRoom|C2A
//     S2F[Server]
//     C2A-->|Disconnect|S2F
//
//     C3A[Client: User, Room]
//     S3A[Server]
//     C3A-->|ReqLoginToken|S3A
//     S3A-->|ResErrHasUser|C3A
//     S3B[Server]
//     C3A-->|ReqCreate|S3B
//     C3A-->|ReqJoin|S3B
//     S3B-->|ResErrHasRoom|C3A
//     S3C[Server]
//     C3A-->|ReqLogout|S3C
//     S3C-->|ResLoggedOut|C3C2[Client: No User, No Room]
//     S3C-->|EvtUserLeft|C3C3(Room)
//     S3D[Server]
//     C3A-->|Broadcast|S3D
//     S3D-->|ResSent|C3A
//     S3D-->|Broadcast|C3C3(Room)
//     S3E[Server]
//     C3A-->|Disconnect|S3E
//     S3E-->|EvtUserLeft|C3C3(Room)

/**
 * Send a Message object as JSON across `socket` to `peer`
 *
 * @param socket The socket on which to send
 * @param peer   The peer who should receive the message
 * @param tag    The message tag, for easy disambiguation on the client
 * @param msg    The message to send
 */
function sendAsJson(socket: Socket, peer: User, tag: string, msg: Message) {
  socket.to(peer.socketId).emit(tag, JSON.stringify(msg));
}

/**
 * Send a Message object as JSON to the `socket` owner
 *
 * @param socket The socket on which to send
 * @param tag    The message tag, for easy disambiguation on the client
 * @param msg    The message to send
 */
function emitAsJson(socket: Socket, tag: string, msg: Message) {
  socket.emit(tag, JSON.stringify(msg));
}

/**
 * The workflow for managing a connection.  This mostly just forwards to
 * internal handlers for the various messages and events.
 *
 * @param socket  The socket that was just connected
 * @param users   A mapping from user Id to User objects
 * @param rooms   A mapping from room Id to Room objects
 * @param sockets A mapping from socket Id to User object
 * @param tables  The set of tables holding all socket Ids, users, and rooms
 */
export function workflow(socket: Socket, users: Map<string, User>, rooms: Map<string, Room>, sockets: Map<string, User>) {
  // When a connection happens, we don't know if it's a new connection or a
  // recovery
  //
  // For now, just print a message for the sake of debugging, but don't do
  // anything until the user provides some information
  console.log(`${socket.id} connected`);

  // Route the different events and requests to their handlers
  socket.on(ReqLoginToken.TAG, (msg) => reqLoginToken(msg, socket, users, sockets));
  socket.on(ReqCreate.TAG, () => reqCreate(socket, rooms, sockets));
  socket.on(ReqJoin.TAG, (msg) => reqJoin(msg, socket, rooms, sockets));
  socket.on(ReqLogout.TAG, () => reqLogout(socket, users, rooms, sockets));
  socket.on(Broadcast.TAG, (msg) => broadcast(msg, socket, sockets));
  socket.on('disconnect', () => evtDrop(socket, users, rooms, sockets));

  // NB: When debugging, this next line can be helpful
  // socket.onAny((a, b, c) => console.log(a, b, c))
}

/**
 * Handle a request to log in a new user
 *
 * @param msg     The message (token is a csv with user Id and user Name)
 * @param socket  The socket on which the request arrived
 * @param users   A mapping from user Id to User objects
 * @param sockets A mapping from socket Id to User object
 */
function reqLoginToken(msg: string, socket: Socket, users: Map<string, User>, sockets: Map<string, User>) {
  // The socket must not have a user associated with it
  if (sockets.has(socket.id)) return emitAsJson(socket, ResErrHasUser.TAG, new ResErrHasUser("This socket already has a logged-in user"));
  // The token must be valid
  //
  // TODO: This will become an OAuth flow eventually
  let parts = ((JSON.parse(msg) as ReqLoginToken).token ?? "").split(',');
  if (parts.length != 2) return emitAsJson(socket, ResErrFormat.TAG, new ResErrFormat("Invalid request format"));
  // The user cannot be logged in somewhere else
  if (users.has(parts[0])) return emitAsJson(socket, ResErrUserTaken.TAG, new ResErrUserTaken("This user is active on another socket"));
  // Create a user with the given userId and userName, put it in the table
  let newUser = new User(parts[0], parts[1], socket.id);
  users.set(parts[0], newUser);
  // Set up reverse lookup
  sockets.set(socket.id, newUser);
  // Tell the user "you're logged in"
  emitAsJson(socket, ResLoggedIn.TAG, new ResLoggedIn("Ok"));
}

/**
 * Generate a random 5-character room Id
 *
 * @returns The room Id, as a string
 */
function makeRoomId() {
  const chars = "abcdefghijklmnopqrstuvwxyz0123456789";
  const nameLen = 5;
  let result = "";
  const randomArray = new Uint8Array(nameLen);
  crypto.getRandomValues(randomArray);
  randomArray.forEach((number) => { result += chars[number % chars.length]; });
  return result;
}

/**
 * Handle a request to make a new room for the current user
 *
 * @param socket  The socket on which the request arrived
 * @param rooms   A mapping from room Id to Room objects
 * @param sockets A mapping from socket Id to User object
 */
function reqCreate(socket: Socket, rooms: Map<string, Room>, sockets: Map<string, User>) {
  // The socket must have a user associated with it
  let user = sockets.get(socket.id);
  if (!user) return emitAsJson(socket, ResErrNoUser.TAG, new ResErrNoUser("This socket does not have a user"));
  if (user.room) return emitAsJson(socket, ResErrHasRoom.TAG, new ResErrHasRoom("This user already has a room"));

  // Create a unique Room Id
  let id = makeRoomId();
  while (rooms.has(id)) id = makeRoomId();

  // Make a room, do a bidirectional link between room and user
  let newRoom = new Room(id);
  newRoom.users.add(user);
  rooms.set(id, newRoom);
  user.room = newRoom;

  // Send back the room
  emitAsJson(socket, ResCreated.TAG, new ResCreated(id));
}

/**
 * Handle a request to join an existing room with the current user
 *
 * @param msg     The message (just a room id)
 * @param socket  The socket on which the request arrived
 * @param rooms   A mapping from room Id to Room objects
 * @param sockets A mapping from socket Id to User object
 */
function reqJoin(msg: string, socket: Socket, rooms: Map<string, Room>, sockets: Map<string, User>) {
  // The socket must have a user associated with it
  let user = sockets.get(socket.id);
  if (!user) return emitAsJson(socket, ResErrNoUser.TAG, new ResErrNoUser("This socket does not have a user"));
  // The user cannot already have a room
  if (user.room) return emitAsJson(socket, ResErrHasRoom.TAG, new ResErrHasRoom("This user already has a room"));
  // The message must include a room Id
  let roomId = (JSON.parse(msg) as ReqJoin).roomId;
  if (!roomId) return emitAsJson(socket, ResErrFormat.TAG, new ResErrFormat("Invalid request format"));
  // The room must exist
  let room = rooms.get(roomId);
  if (!room) return emitAsJson(socket, ResErrNoRoom.TAG, new ResErrNoRoom("Room does not exist"));

  // Make a bidirectional link between room and user
  user.room = room;
  room.users.add(user);

  // Broadcast the new member to the room
  room.users.forEach((peer) => { if (peer != user) sendAsJson(socket, peer, EvtUserJoined.TAG, new EvtUserJoined(user.id, user.name)); });

  // Send the new member a list of all members
  let peers = [] as { id: string, name: string }[];
  room.users.forEach((peer) => { if (peer != user) peers.push({ id: peer.id, name: peer.name }); });
  emitAsJson(socket, ResJoined.TAG, new ResJoined(roomId, peers));
}

/**
 * Handle a request to log a user out
 *
 * @param socket  The socket on which the request arrived
 * @param users   A mapping from user Id to User objects
 * @param rooms   A mapping from room Id to Room objects
 * @param sockets A mapping from socket Id to User object
 */
function reqLogout(socket: Socket, users: Map<string, User>, rooms: Map<string, Room>, sockets: Map<string, User>) {
  // The socket must have a user associated with it
  let user = sockets.get(socket.id);
  if (!user) {
    emitAsJson(socket, ResErrNoUser.TAG, new ResErrNoUser("This socket does not have a user"));
    return;
  }
  // If the user has a room, remove the user from the room and notify peers
  if (user.room) {
    user.room.users.delete(user);
    user.room.users.forEach((peer) => sendAsJson(socket, peer, EvtUserLeft.TAG, new EvtUserLeft(user.id, user.name)));
    // Five-second timeout before we close an empty room
    if (user.room.users.size == 0) {
      let roomId = user.room.id;
      setTimeout(() => {
        let room = rooms.get(roomId);
        if (room && room.users.size == 0)
          rooms.delete(roomId);
      }, 5000);
    }
  }
  // Remove the user from any tables, then send an Ack
  sockets.delete(socket.id)
  users.delete(user.id)
  emitAsJson(socket, ResLoggedOut.TAG, new ResLoggedOut("Ok"));
}

/**
 * Handle a dropped socket
 *
 * @param socket  The socket on which the request arrived
 * @param users   A mapping from user Id to User objects
 * @param rooms   A mapping from room Id to Room objects
 * @param sockets A mapping from socket Id to User object
 */
function evtDrop(socket: Socket, users: Map<string, User>, rooms: Map<string, Room>, sockets: Map<string, User>) {
  console.log(`${socket.id} disconnected`);
  // If the user hadn't logged in yet, we're just done
  let user = sockets.get(socket.id);
  if (!user) return;
  // If the user has a room, remove the user from the room and notify peers
  if (user.room) {
    user.room.users.delete(user);
    user.room.users.forEach((peer) => sendAsJson(socket, peer, EvtUserLeft.TAG, new EvtUserLeft(user.id, user.name)));
    // Five-second timeout before we close an empty room
    if (user.room.users.size == 0) {
      let roomId = user.room.id;
      setTimeout(() => {
        let room = rooms.get(roomId);
        if (room && room.users.size == 0) rooms.delete(roomId);
      }, 5000);
    }
  }
  // Remove the user from any tables (NB: Nobody to send an Ack to)
  sockets.delete(socket.id);
  users.delete(user.id);
}

/**
 * Broadcast a message to the sender's peers in the sender's room
 *
 * @param msg     The message to broadcast
 * @param socket  The socket on which the request arrived
 * @param sockets A mapping from socket Id to User object
 */
function broadcast(msg: string, socket: Socket, sockets: Map<string, User>) {
  // The socket must have a user associated with it
  let user = sockets.get(socket.id);
  if (!user) return emitAsJson(socket, ResErrNoUser.TAG, new ResErrNoUser("This socket does not have a user"));
  // The user must be in a room
  if (!user.room) return emitAsJson(socket, ResErrNoRoom.TAG, new ResErrNoRoom("This user does not have a room"));
  // Broadcast to peers, then send an Ack
  user.room.users.forEach((peer) => { if (peer != user) sendAsJson(socket, peer, Broadcast.TAG, new Broadcast(user.id, user.name, msg)); });
  emitAsJson(socket, ResSent.TAG, new ResSent("Ok"));
}
