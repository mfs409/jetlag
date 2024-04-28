import { Actor, BoxBody, CircleBody, FilledBox, ImageSprite, JetLagGameConfig, ManualMovement, Obstacle, initializeAndLaunch, stage } from "../jetlag";
import { boundingBox } from "./common";

/**
 * Screen dimensions and other game configuration, such as the names of all
 * the assets (images and sounds) used by this game.
 */
class Config implements JetLagGameConfig {
  // Use 16/9 for landscape mode, and 9/16 for portrait mode
  aspectRatio = { width: 16, height: 9};
  hitBoxes = true;
  resources = {
    prefix: "./assets/",
    imageNames: ["sprites.json", "noise.png"]
  };
}

/**
 * Build the levels of the game.
 *
 * @param level Which level should be displayed
 */
function builder(level: number) {
  // There will be winning and losing in these tutorials, and we'll always want
  // to restart
  stage.score.onLose = { level, builder };
  stage.score.onWin = { level, builder };

  // Now that we understand how to translate coordinates, let's try to use it
  // to implement some dragging of actors using pan events.

  boundingBox();
  stage.world.setGravity(0, 10);

  // draw two obstacles that we can drag, and one that we can't.  The whole
  // key to deciding who is draggable and who isn't will be whether we give
  // them "extra" information.
  new Actor({
    appearance: new ImageSprite({ width: 0.75, height: 0.75, img: "purple_ball.png" }),
    rigidBody: new CircleBody({ cx: 15, cy: 2, radius: 0.375 }, { dynamic: true }),
    movement: new ManualMovement(),
    role: new Obstacle(),
    extra: { drag: true }
  });

  new Actor({
    appearance: new ImageSprite({ width: 0.75, height: 0.75, img: "purple_ball.png" }),
    rigidBody: new CircleBody({ cx: 14, cy: 1, radius: 0.375 }, { elasticity: 1 }),
    movement: new ManualMovement(),
    role: new Obstacle(),
    extra: { drag: true }
  });

  new Actor({
    appearance: new ImageSprite({ width: 0.75, height: 0.75, img: "purple_ball.png" }),
    rigidBody: new CircleBody({ cx: 13, cy: 1, radius: 0.375 }, { elasticity: 1 }),
    movement: new ManualMovement(),
    role: new Obstacle(),
  });

  // We need a way to keep track of the actor currently being dragged.  We'll
  // use this local variable (but we *could* use "level" storage)
  let foundActor: Actor | undefined;
  // pan start updates foundActor if there is an actor where the touch began
  let panStart = (_actor: Actor, hudCoords: { x: number; y: number }) => {
    // Turn HUD coordinates to world coordinates
    let pixels = stage.hud.camera.metersToScreen(hudCoords.x, hudCoords.y);
    let world_coords = stage.world.camera.screenToMeters(pixels.x, pixels.y);
    // Ask the physics world for all actors at that position, and stop when we find one who is draggable:
    for (let actor of stage.world.physics!.actorsAt(world_coords)) {
      if (actor.extra.drag) {
        foundActor = actor;
        return true;
      }
    }
    return false;
  };

  // pan move changes the actor's position
  let panMove = (_actor: Actor, hudCoords: { x: number; y: number }) => {
    // If we have an Actor, move it using the translated coordinates
    if (!foundActor) return false;
    let pixels = stage.hud.camera.metersToScreen(hudCoords.x, hudCoords.y);
    let meters = stage.world.camera.screenToMeters(pixels.x, pixels.y);
    foundActor.rigidBody?.setCenter(meters.x, meters.y);
    return true;
  };

  // pan stop clears foundActor to stop letting this actor be dragged
  let panStop = () => {
    if (!foundActor) return false;
    // This turns gravity back on, if appropriate
    foundActor.rigidBody.body.SetAwake(true);
    foundActor = undefined;
    return true;
  };

  // Now we can cover the HUD with a button that handles the pan gestures
  new Actor({
    appearance: new FilledBox({ width: .1, height: .1, fillColor: "#00000000" }),
    rigidBody: new BoxBody({ cx: 8, cy: 4.5, width: 16, height: 9 }, { scene: stage.hud }),
    gestures: { panStart, panMove, panStop },
  });

  // Fun fact: more than 1M downloads came from a game that noticed that you
  // could use panMove as a way to "scribble" on the screen to make a track
  // for a car.
}

// call the function that kicks off the game
initializeAndLaunch("game-player", new Config(), builder);
