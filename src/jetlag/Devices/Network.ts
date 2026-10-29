import { Socket, io } from "socket.io-client";

/** The state of the network, which ties to if we have a user and a room */
export enum NetworkState { Start, User, UserRoom }

/**
 * NetworkDevice interfaces with a server (see the "templates/server" folder)
 * via socket.io to send and receive network events.
 *
 * Naming convention: every incoming event handler is `onX` (assign your own
 * function to react to it); every outgoing action is `requestX` (for anything
 * the server can accept or reject) or a bare verb that pairs with `connect()`
 * (`disconnect()`, `sendBroadcast()`).
 */
export class NetworkDevice {
  /** A socket for communicating with the server */
  socket: Socket | undefined;

  /** The current state of the network stack */
  state: NetworkState = NetworkState.Start;

  /** An event handler for when the socket initially connects */
  onConnected: () => void = () => { };

  /** An event handler for when the socket disconnects */
  onDisconnected: (msg: string) => void = () => { };

  /** An event handler for when a remote user joins the room */
  onUserJoined: (msg: string) => void = () => { };

  /** An event handler for when a remote user exits the room */
  onUserLeft: (msg: string) => void = () => { };

  /** An event handler for when a remote user sends a message */
  onBroadcast: (msg: string) => void = () => { };

  /** An event handler for when we try to log in when we're already logged in */
  onErrHasUser: (msg: string) => void = () => { };

  /** An event handler for errors due to not logging in first */
  onErrNoUser: (msg: string) => void = () => { };

  /** An event handler for when the server says our username is taken */
  onErrUserTaken: (msg: string) => void = () => { };

  /** An event handler for when we request a room but already have one */
  onErrHasRoom: (msg: string) => void = () => { };

  /** An event handler for errors due to not having a room */
  onErrNoRoom: (msg: string) => void = () => { };

  /** An event handler for errors due to incorrectly formatted requests */
  onErrFormat: (msg: string) => void = () => { };

  /** An event handler for when a login request succeeds */
  onLoggedIn: (msg: string) => void = () => { };

  /** An event handler for when a logout request succeeds */
  onLoggedOut: (msg: string) => void = () => { };

  /** An event handler for when a broadcast is sent successfully */
  onSent: (msg: string) => void = () => { };

  /** An event handler for when we succeed in making a new room */
  onCreated: (msg: string) => void = () => { };

  /** An event handler for when we succeed in joining an existing room */
  onJoined: (msg: string) => void = () => { };

  /**
   * Construct a NetworkDevice, for interacting with a remote server via
   * Socket.IO.  Note that by default, the network device is not connected to
   * anything.
   */
  constructor() { }

  /**
   * Connect to a server and start sending/receiving events
   *
   * @param serverAddress The address of the server to connect to
   */
  connect(serverAddress: string) {
    // Connect to the server
    this.socket = io(serverAddress);

    // Set up listeners for all event messages
    //
    // NB: Arrow functions allow for games to redefine these on the fly
    this.socket.on("EvtUserJoined", (msg) => this.onUserJoined(msg));
    this.socket.on("EvtUserLeft", (msg) => this.onUserLeft(msg));
    this.socket.on("Broadcast", (msg) => this.onBroadcast(msg));
    this.socket.on("ResErrHasUser", (msg) => this.onErrHasUser(msg));
    this.socket.on("ResErrNoUser", (msg) => this.onErrNoUser(msg));
    this.socket.on("ResErrUserTaken", (msg) => this.onErrUserTaken(msg));
    this.socket.on("ResErrHasRoom", (msg) => this.onErrHasRoom(msg));
    this.socket.on("ResErrNoRoom", (msg) => this.onErrNoRoom(msg));
    this.socket.on("ResErrFormat", (msg) => this.onErrFormat(msg));
    this.socket.on("ResSent", (msg) => this.onSent(msg));

    // These four also update `state`, since they mark a transition in the
    // login/room lifecycle.
    this.socket.on("ResLoggedIn", (msg) => { this.state = NetworkState.User; this.onLoggedIn(msg); });
    this.socket.on("ResLoggedOut", (msg) => { this.state = NetworkState.Start; this.onLoggedOut(msg); });
    this.socket.on("ResCreated", (msg) => { this.state = NetworkState.UserRoom; this.onCreated(msg); });
    this.socket.on("ResJoined", (msg) => { this.state = NetworkState.UserRoom; this.onJoined(msg); });

    // These are socket.io events
    this.socket.on("connect", () => this.onConnected());
    this.socket.on("disconnect", (msg) => { this.state = NetworkState.Start; this.onDisconnected(msg); });
  }

  /**
   * Send a message to the server to try to log in
   *
   * @param userId   The desired userId
   * @param userName The desired userName
   */
  requestLogin(userId: string, userName: string) {
    this.socket?.emit("ReqLoginToken", JSON.stringify({ token: `${userId},${userName}` }))
  }

  /** Send a message to the server to try to create a new room */
  requestCreate() { this.socket?.emit("ReqCreate", ""); }

  /**
   * Send a message to the server to try to join an existing room
   *
   * @param roomId The Id of the room to join
   */
  requestJoin(roomId: string) {
    this.socket?.emit("ReqJoin", JSON.stringify({ roomId }))
  }

  /** Send a request to the server to log out */
  requestLogout() { this.socket?.emit("ReqLogout", ""); }

  /**
   * Broadcast a message to all other recipients in the room
   *
   * @param message The message to send
   */
  sendBroadcast(message: string) { this.socket?.emit("Broadcast", message); }

  /** Forcibly disconnect from the server */
  disconnect() {
    this.socket?.disconnect();
    this.socket = undefined;
    this.state = NetworkState.Start;
  }

  /**
   * Reset all of the event handlers.  This is a good thing to do after
   * disconnecting.
   */
  reset() {
    this.state = NetworkState.Start;
    this.onConnected = () => { };
    this.onDisconnected = () => { };
    this.onUserJoined = () => { };
    this.onUserLeft = () => { };
    this.onBroadcast = () => { };
    this.onErrHasUser = () => { };
    this.onErrNoUser = () => { };
    this.onErrUserTaken = () => { };
    this.onErrHasRoom = () => { };
    this.onErrNoRoom = () => { };
    this.onErrFormat = () => { };
    this.onLoggedIn = () => { };
    this.onLoggedOut = () => { };
    this.onSent = () => { };
    this.onCreated = () => { };
    this.onJoined = () => { };
  }
}
