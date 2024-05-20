/** A user who is playing the game */
export class User {
  /**
   * Construct an object to hold all the information about a user
   *
   * @param id        The user's unique Id from their token
   * @param name      The user's name from their token
   * @param socketId  The socket Id for messaging the user
   * @param room      The room where the user is assigned (can be undefined early
   *                  in a login flow)
   */
  constructor(public id: string, public name: string, public socketId: string, public room?: Room) { }
}

/** A room that holds some users */
export class Room {
  /** The users currently in the room */
  readonly users = new Set<User>;
  /**
   * Construct an object to hold all the information about a room
   *
   * @param id The room's unique Id
   */
  constructor(public id: string) { }
}

/** A message broadcast to a room when a client enters */
export class EvtUserJoined {
  /** A string representation of the message type */
  static TAG: string = "EvtUserJoined";
  /**
   * Construct an EvtUserJoined message
   *
   * @param userId   The Id of the new user
   * @param userName The name of the new user
   */
  constructor(public userId: string, public userName: string) { }
}

/** A message broadcast to a room when a client leaves */
export class EvtUserLeft {
  /** A string representation of the message type */
  static TAG = "EvtUserLeft"
  /**
   * Construct an EvtUserLeft message
   *
   * @param userId   The Id of the user who is leaving the room
   * @param userName The name of the user who is leaving the room
   */
  constructor(public userId: string, public userName: string) { }
}

/** A message sent by a client and then broadcast to the client's room */
export class Broadcast {
  /** A string representation of the message type */
  static TAG = "Broadcast"
  /**
   * Construct a Broadcast message
   *
   * @param userId   The Id of the user who is broadcasting
   * @param userName The name of the user who is broadcasting
   * @param msg      The message to send (typically serialized JSON)
   */
  constructor(public userId: string, public userName: string, public msg: string) { }
}

/** An error message sent to a client tried to log in when already logged in */
export class ResErrHasUser {
  /** A string representation of the message type */
  static TAG = "ResErrHasUser"
  /**
   * Construct a ResErrHasUser message
   *
   * @param msg Some kind of message (typically "", but we still have a message
   *            so that all Res objects have some kind of payload)
   */
  constructor(public msg: string) { }
}

/** 
 * An error message sent to a client who made requests without providing a login
 * token 
 */
export class ResErrNoUser {
  /** A string representation of the message type */
  static TAG = "ResErrNoUser"
  /**
   * Construct a ResErrNoUser message
   *
   * @param msg Some kind of message (typically "", but we still have a message
   *            so that all Res objects have some kind of payload)
   */
  constructor(public msg: string) { }
}

/** 
 * An error message sent to a client trying to log in with an already-in-use
 * name
 */
export class ResErrUserTaken {
  /** A string representation of the message type */
  static TAG = "ResErrUserTaken"
  /**
   * Construct a ResErrUserTaken message
   *
   * @param msg Some kind of message (typically "", but we still have a message
   *            so that all Res objects have some kind of payload)
   */
  constructor(public msg: string) { }
}

/** 
 * An error message sent to a client who tried joining a room when in another
 * room */
export class ResErrHasRoom {
  /** A string representation of the message type */
  static TAG = "ResErrHasRoom"
  /**
   * Construct a ResErrHasRoom message
   *
   * @param msg Some kind of message (typically "", but we still have a message
   *            so that all Res objects have some kind of payload)
   */
  constructor(public msg: string) { }
}

/** An error message sent to a client who tried to join an invalid room */
export class ResErrNoRoom {
  /** A string representation of the message type */
  static TAG = "ResErrNoRoom"
  /**
   * Construct a ResErrNoRoom message
   *
   * @param msg Some kind of message (typically "", but we still have a message
   *            so that all Res objects have some kind of payload)
   */
  constructor(public msg: string) { }
}

/** A error message sent to a client whose request was formatted incorrectly */
export class ResErrFormat {
  /** A string representation of the message type */
  static TAG = "ResErrFormat"
  /**
   * Construct a ResErrFormat message
   *
   * @param msg Some kind of message (typically "", but we still have a message
   *            so that all Res objects have some kind of payload)
   */
  constructor(public msg: string) { }
}

/** A message sent to a client whose login succeeded */
export class ResLoggedIn {
  /** A string representation of the message type */
  static TAG = "ResLoggedIn"
  /**
   * Construct a ResLoggedIn message
   *
   * @param msg Some kind of message (typically "", but we still have a message
   *            so that all Res objects have some kind of payload)
   */
  constructor(public msg: string) { }
}

/** A message sent to a client whose logout succeeded */
export class ResLoggedOut {
  /** A string representation of the message type */
  static TAG = "ResLoggedOut"
  /**
   * Construct a ResLoggedOut message
   *
   * @param msg Some kind of message (typically "", but we still have a message
   *            so that all Res objects have some kind of payload)
   */
  constructor(public msg: string) { }
}

/** A message sent to a client whose broadcast succeeded */
export class ResSent {
  /** A string representation of the message type */
  static TAG = "ResSent"
  /**
   * Construct a ResSent message
   *
   * @param msg Some kind of message (typically "", but we still have a message
   *            so that all Res objects have some kind of payload)
   */
  constructor(public msg: string) { }
};

/** A message sent to a client who made a new room */
export class ResCreated {
  /** A string representation of the message type */
  static TAG = "ResCreated"
  /**
   * Construct a ResCreated message
   *
   * @param roomId The Id of the room that was just created
   */
  constructor(public roomId: string) { }
}

/** A message sent to a client who joined an existing room */
export class ResJoined {
  /** A string representation of the message type */
  static TAG = "ResJoined"
  /**
   * Construct a ResJoined message
   *
   * @param roomId The Id of the room that was joined
   * @param peers  A collection of users who are in the room already
   */
  constructor(public roomId: string, public peers: { id: string, name: string }[]) { };
}

/** A message sent by a client trying to log in */
export class ReqLoginToken {
  /** A string representation of the message type */
  static TAG = "ReqLoginToken"
  /**
   * Construct a ReqJoin message
   *
   * @param token The token that uniquely identifies this user.  It's
   *              string|undefined to facilitate checking for malformed requests
   */
  constructor(public token: string | undefined) { }
}

/** A message sent by a client trying to create a room */
export class ReqCreate {
  /** A string representation of the message type */
  static TAG = "ReqCreate"
  /** Construct a ReqCreate message */
  constructor() { }
}

/** A message sent by a client trying to join a room */
export class ReqJoin {
  /** A string representation of the message type */
  static TAG = "ReqJoin"
  /**
   * Construct a ReqJoin message
   *
   * @param roomId The Id of the room to join.  It's string|undefined to
   *               facilitate checking for malformed requests
   */
  constructor(public roomId: string | undefined) { }
}

/** A message sent by a client trying to log out */
export class ReqLogout {
  /** A string representation of the message type */
  static TAG = "ReqLogout"
  /** Construct a ReqLogout message */
  constructor() { }
}

/**
 * The Message type unions all of the message types, to make the rest of the
 * code easier to work with 
 */
export type Message = EvtUserJoined | EvtUserLeft | Broadcast | ResErrHasUser | ResErrNoRoom | ResErrUserTaken | ResErrHasRoom | ResErrNoRoom | ResErrFormat | ResLoggedIn | ResLoggedOut | ResSent | ResCreated | ResJoined | ReqLoginToken | ReqCreate | ReqJoin | ReqLogout;
