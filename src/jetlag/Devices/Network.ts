import { Socket, io } from "socket.io-client";

/** The state of the network, which ties to if we have a user and a room */
export enum NetworkState { Start, User, UserRoom }

/**
 * NetworkDevice interfaces with a server (see the "multiplayer-server" folder)
 * via socket.io to send and receive network events.
 */
export class NetworkDevice {
  /** A socket for communicating with the server */
  socket: Socket | undefined;

  /** The current state of the network stack */
  state: NetworkState = NetworkState.Start;

  /** An event handler for when the socket initially connects */
  evtConnected: () => void = () => { };

  /** An event handler for when the socket disconnects */
  evtDisconnected: (msg: string) => void = () => { };

  /** An event handler for when a remote user joins the room */
  evtUserJoined: (msg: string) => void = () => { };

  /** An event handler for when a remote user exits the room */
  evtUserLeft: (msg: string) => void = () => { };

  /** An event handler for when a remote user sends a message */
  broadcast: (msg: string) => void = () => { };

  /** An event handler for when we try to log in when we're already logged in */
  resErrHasUser: (msg: string) => void = () => { };

  /** An event handler for errors due to not logging in first */
  resErrNoUser: (msg: string) => void = () => { };

  /** An event handler for when the server says our username is taken */
  resErrUserTaken: (msg: string) => void = () => { };

  /** An event handler for when we request a room but already have one */
  resErrHasRoom: (msg: string) => void = () => { };

  /** An event handler for errors due to not having a room */
  resErrNoRoom: (msg: string) => void = () => { };

  /** An event handler for errors due to incorrectly formatted requests */
  resErrFormat: (msg: string) => void = () => { };

  /** An event handler for when a login request succeeds */
  resLoggedIn: (msg: string) => void = () => { };

  /** An event handler for when a logout request succeeds */
  resLoggedOut: (msg: string) => void = () => { };

  /** An event handler for when a broadcast is sent successfully */
  resSent: (msg: string) => void = () => { };

  /** An event handler for when we succeed in making a new room */
  resCreated: (msg: string) => void = () => { };

  /** An event handler for when we succeed in joining an existing room */
  resJoined: (msg: string) => void = () => { };

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
    this.socket.on("EvtConnected", this.evtConnected);
    this.socket.on("EvtDisconnected", this.evtDisconnected);
    this.socket.on("EvtUserJoined", this.evtUserJoined);
    this.socket.on("EvtUserLeft", this.evtUserLeft);
    this.socket.on("Broadcast", this.broadcast);
    this.socket.on("ResErrHasUser", this.resErrHasUser);
    this.socket.on("ResErrNoUser", this.resErrNoUser);
    this.socket.on("ResErrUserTaken", this.resErrUserTaken);
    this.socket.on("ResErrHasRoom", this.resErrHasRoom);
    this.socket.on("ResErrNoRoom", this.resErrNoRoom);
    this.socket.on("ResErrFormat", this.resErrFormat);
    this.socket.on("ResLoggedIn", this.resLoggedIn);
    this.socket.on("ResLoggedOut", this.resLoggedOut);
    this.socket.on("ResSent", this.resSent);
    this.socket.on("ResCreated", this.resCreated);
    this.socket.on("ResJoined", this.resJoined);
    this.socket.on("connect", this.evtConnected);
    this.socket.on("disconnect", this.evtDisconnected);
  }

  /**
   * Send a message to the server to try to log in
   *
   * @param userId   The desired userId
   * @param userName The desired userName
   */
  doReqLoginToken(userId: string, userName: string) {
    this.socket?.emit("ReqLoginToken", JSON.stringify({ token: `${userId},${userName}` }))
  }

  /** Send a message to the server to try to create a new room */
  doReqCreate() { this.socket?.emit("ReqCreate", ""); }

  /**
   * Send a message to the server to try to join an existing room
   *
   * @param roomId The Id of the room to join
   */
  doReqJoin(roomId: string) {
    this.socket?.emit("ReqJoin", JSON.stringify({ roomId }))
  }

  /** Send a request to the server to log out */
  doReqLogout() { this.socket?.emit("ReqLogout", ""); }

  /**
   * Broadcast a message to all other recipients in the room
   *
   * @param message The message to send
   */
  doBroadcast(message: string) { this.socket?.emit("Broadcast", message); }

  /** Forcibly disconnect from the server */
  doDisconnect() {
    this.socket?.disconnect();
    this.socket = undefined;

  }

  /**
   * Reset all of the event handlers.  This is a good thing to do after
   * disconnecting.
   */
  reset() {
    this.evtConnected = () => { };
    this.evtDisconnected = () => { };
    this.evtUserJoined = () => { };
    this.evtUserLeft = () => { };
    this.broadcast = () => { };
    this.resErrHasUser = () => { };
    this.resErrNoUser = () => { };
    this.resErrUserTaken = () => { };
    this.resErrHasRoom = () => { };
    this.resErrNoRoom = () => { };
    this.resErrFormat = () => { };
    this.resLoggedIn = () => { };
    this.resLoggedOut = () => { };
    this.resSent = () => { };
    this.resCreated = () => { };
    this.resJoined = () => { };
  }
}