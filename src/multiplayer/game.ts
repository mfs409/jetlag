import { Actor, BoxBody, CircleBody, Hero, ImageSprite, JetLagGameConfig, TextSprite, TiltMovement, initializeAndLaunch, stage } from "../jetlag";
import { boundingBox, enableTilt } from "./common";

/** Screen dimensions and other game configuration */
class Config implements JetLagGameConfig {
  // Use {16, 9} for landscape mode, and {9, 16} for portrait mode.
  aspectRatio = { width: 16, height: 9 };
  hitBoxes = true;
  resources = {
    prefix: "assets/",
    imageNames: ["sprites.json"]
  };
}

/**
 * The RemoteActor type is just a way of bundling together several pieces of
 * information that we need to track in order to know how to use a remote user's
 * network messages to move their actor on our screen.
 */
class RemoteActor {
  /**
   * Construct a RemoteActor object
   *
   * @param userId    The id of the user
   * @param userName  The name of the user
   * @param actor     The Actor object in the game that is controlled by userId
   */
  constructor(public userId: string, public userName: string, public actor: Actor) { }
}

/**
 * The ActorState type is a convenient way of bundling up the information that
 * gets sent by a remote user to let us know how to move their actor in our
 * world.
 */
class ActorState {
  /**
   * Construct an ActorState object
   *
   * @param userId The Id of the user who created this ActorState
   * @param cx     The center X for userId's Actor
   * @param cy     The center Y for userId's Actor
   * @param rot    The rotation for userId's Actor
   * @param img    The image to display for the actor
   */
  constructor(public userId: string, public cx: number, public cy: number, public rot: number, public img: string) { }
}

/**
 * Make an actor and put it on the screen.  This can make a local actor who is
 * controlled by tilt and broadcasts its state over the network, or a remote
 * actor who will be controlled by the network.
 *
 * @param local   True if this actor is controlled locally, false if it is
 *                controlled by the network.
 * @param userId  The Id of the person who controls this actor
 * @param img     The initial image to use for the actor.  Note that we don't
 *                use AnimatedSprite, instead we manually toggle the image.
 *
 * @returns       The actor that was created
 */
function makeActor(local: boolean, userId: string, img: string) {
  if (local) {
    // The local actor will be a Hero controlled by Tilt.  We have to give it a
    // role, or it will pass through the walls!
    let actor = new Actor({
      appearance: new ImageSprite({ width: .75, height: .75, img }),
      rigidBody: new CircleBody({ cx: 1, cy: 1, radius: .375 }, { friction: .3 }),
      movement: new TiltMovement(),
      role: new Hero(),
    });
    // Every time the screen is drawn, tell everyone where this actor is
    stage.world.repeatEvents.push(() => {
      stage.network.doBroadcast(JSON.stringify(new ActorState(userId, actor.rigidBody.getCenter().x, actor.rigidBody.getCenter().y, actor.rigidBody.getRotation(), (actor.appearance[0] as ImageSprite).img)))
    });
    return actor;
  }
  else {
    // A local actor will not have a role or a movement controller.  The network
    // will handle it for us.
    return new Actor({
      appearance: new ImageSprite({ width: .75, height: .75, img: "green_ball.png" }),
      rigidBody: new CircleBody({ cx: -1, cy: -1, radius: .375 }, { kinematic: true })
    });
  }
}

/**
 * Connect the current user to a server, then set up the actor for this user
 * once they're connected.
 *
 * @param userId     The Id to use for the new user
 * @param userName   The name to use for the new user
 * @param createRoom Should the user go into a new room (else we'll ask what
 *                   room to join)
 * @param imgName    The image to use when making this user's actor
 */
function connectUser(userId: string, userName: string, createRoom: boolean, imgName: string) {
  // If we've already called this and it didn't fail, then don't try to connect
  // again
  if (stage.storage.getSession("user")) return;

  // This is where we'll keep all the info about the distributed game state.
  let loginInfo = { userId: "", userName: "", connected: false, room: "", remoteActors: new Map<string, RemoteActor>(), myActor: undefined as (Actor | undefined) };
  stage.storage.setSession("user", loginInfo);

  // We aren't going to deal with these events in this demo, so instruct JetLag
  // to just print something when any of them happen:
  let fatalError = (msg: string) => { window.alert(msg); stage.network.doDisconnect(); stage.network.reset(); stage.storage.setSession("user", undefined) }
  stage.network.evtDisconnected = fatalError;
  stage.network.resErrHasUser = fatalError;
  stage.network.resErrNoUser = fatalError;
  stage.network.resErrHasRoom = fatalError;
  stage.network.resErrNoRoom = fatalError;
  stage.network.resErrFormat = fatalError;
  stage.network.resLoggedOut = fatalError;
  stage.network.resErrUserTaken = fatalError;

  // Before we can connect, we have to set up the handlers for the various
  // network events
  stage.network.evtConnected = () => {
    // Once we connect, remember that we're connected, and try to log in
    loginInfo.connected = true;
    stage.network.doReqLoginToken(userId, userName);
  };
  stage.network.resLoggedIn = () => {
    // We're logged in.  First, save this user's info to loginInfo
    loginInfo.userId = userId;
    loginInfo.userName = userName;
    // Should we ask the server to create a room for us?
    if (createRoom) {
      stage.network.doReqCreate()
    }
    // If not, get a room Id from the user, ask the server to join us to it
    else {
      // NB: You should use a nicer UI for this!
      let roomId = window.prompt("Enter a Room Id");
      if (roomId == null) {
        fatalError("Invalid Room Id");
        return;
      }
      stage.network.doReqJoin(roomId);
    }
  };
  stage.network.resCreated = (msg: string) => {
    // Once the server creates a room for us, put an actor in it
    let m = JSON.parse(msg);
    // Tell the user their room, so they can tell their friends.
    // NB: You should use a nicer UI for this!
    window.alert(`You are now in room ${m.roomId}`)
    loginInfo.room = m.roomId;
    loginInfo.myActor = makeActor(true, userId, imgName);
  };
  stage.network.evtUserJoined = (msg: string) => {
    // When a remote user joins a room, add it to the remote actors list, and
    // set up an Actor for it in the world
    //
    // NB: The image doesn't really matter... it will get overridden soon, and
    //     we initially draw the actor off-screen
    let m = JSON.parse(msg);
    loginInfo.remoteActors.set(m.userId, new RemoteActor(m.userId, m.userName, makeActor(false, m.userId, "red_ball.png")));
  };
  stage.network.evtUserLeft = (msg: string) => {
    // When a remote user exits the room, take them out of the world and remote
    // actor list
    let m = JSON.parse(msg);
    if (loginInfo.remoteActors.has(m.userId)) {
      loginInfo.remoteActors.get(m.userId)!.actor.enabled = false;
      loginInfo.remoteActors.delete(m.userId);
    }
  };
  stage.network.broadcast = (msg: string) => {
    // When a remote user sends a state update, handle it
    let outer = JSON.parse(msg);
    let m = JSON.parse(outer.msg) as ActorState;
    let a = loginInfo.remoteActors.get(m.userId);
    if (!a) return;
    (a.actor.appearance[0] as ImageSprite).setImage(m.img);
    a.actor.rigidBody.setCenter(m.cx, m.cy);
    a.actor.rigidBody.setRotation(m.rot);
  };
  stage.network.resSent = () => {
    // We don't bother announcing when a broadcast succeeds
  };
  stage.network.resJoined = (msg: string) => {
    // When joining an existing room, be sure to add all users and oneself
    let m = JSON.parse(msg);
    loginInfo.room = m.roomId;
    for (let p of m.peers)
      loginInfo.remoteActors.set(p.id, new RemoteActor(p.id, p.name, makeActor(false, p.id, "red_ball.png")));
    loginInfo.myActor = makeActor(true, userId, imgName);
  };

  // Now that the event handlers are all set, we can ask for the server address
  // and then connect
  // NB: You should use a nicer UI for this!
  let address = window.prompt("Enter the Address:");
  if (address == null) return;
  stage.network.connect(address);
}

/**
 * This function draws the first scene that shows when the game starts.  In this
 * code, it's an interactive world that cannot be won or lost.  After your game
 * starts becoming more polished, you will probably want to use several
 * functions like this one as a way to organize the parts of your game (levels,
 * chooser, welcome screen, store, etc).
 *
 * @param level Which level of the game should be displayed
 */
function builder(_level: number) {
  // Set up three buttons for creating three different users
  new Actor({
    appearance: new TextSprite({ center: true, face: "Arial", size: 24, color: "#000000" }, "Log In User #1"),
    rigidBody: new BoxBody({ cx: 14, cy: .5, width: 2, height: .25 }, { scene: stage.hud }),
    gestures: { tap: () => { connectUser("user1", "User #1", true, "green_ball.png"); return true; } }
  });
  new Actor({
    appearance: new TextSprite({ center: true, face: "Arial", size: 24, color: "#000000" }, "Log In User #2"),
    rigidBody: new BoxBody({ cx: 14, cy: 1, width: 2, height: .25 }, { scene: stage.hud }),
    gestures: { tap: () => { connectUser("user2", "User #2", false, "blue_ball.png"); return true; } }
  });
  new Actor({
    appearance: new TextSprite({ center: true, face: "Arial", size: 24, color: "#000000" }, "Log In User #3"),
    rigidBody: new BoxBody({ cx: 14, cy: 1.5, width: 2, height: .25 }, { scene: stage.hud }),
    gestures: { tap: () => { connectUser("user3", "User #3", false, "purple_ball.png"); return true; } }
  });

  // Set up the walls, give them some friction
  let walls = boundingBox();
  walls.l.rigidBody.setPhysics({ friction: .2 });
  walls.r.rigidBody.setPhysics({ friction: .2 });
  walls.t.rigidBody.setPhysics({ friction: .2 });
  walls.b.rigidBody.setPhysics({ friction: .2 });

  enableTilt(5, 5);
}

// call the function that starts running the game in the `game-player` div tag
// of `index.html`
initializeAndLaunch("game-player", new Config(), builder);