import { Actor, BoxBody, CircleBody, FilledBox, Hero, ImageSprite, JetLagGameConfig, ManualMovement, Obstacle, b2Vec2, initializeAndLaunch, stage } from "../jetlag";
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

  // This level shows that we can use "flick" or "swipe" gestures to move
  // actors

  boundingBox();
  stage.world.setGravity(0, 10);

  // create a few Actors that can be flicked, and one who cannot
  new Actor({
    appearance: new ImageSprite({ width: 0.8, height: 0.8, img: "green_ball.png" }),
    rigidBody: new CircleBody({ cx: 1, cy: 1, radius: 0.4 }),
    movement: new ManualMovement(),
    role: new Hero(),
    extra: { flickSpeed: 1 }
  });
  new Actor({
    appearance: new ImageSprite({ width: 0.8, height: 0.8, img: "purple_ball.png" }),
    rigidBody: new CircleBody({ cx: 6, cy: 6, radius: 0.4 }, { dynamic: true }),
    movement: new ManualMovement(),
    role: new Obstacle(),
    extra: { flickSpeed: 0.5 }
  });
  new Actor({
    appearance: new ImageSprite({ width: 0.8, height: 0.8, img: "purple_ball.png" }),
    rigidBody: new CircleBody({ cx: 6, cy: 5, radius: 0.4 }, { dynamic: true }),
    movement: new ManualMovement(),
    role: new Obstacle(),
  });

  // A swipe gesture consists of starting coordinates and ending coordinates,
  // as well as the amount of time the swipe took
  let swipe = (_actor: Actor, hudCoord1: { x: number; y: number }, hudCoord2: { x: number; y: number }, time: number) => {
    // Convert starting coordinates from hud to world
    let screenCoord1 = stage.hud.camera.metersToScreen(hudCoord1.x, hudCoord1.y);
    let worldCoord1 = stage.world.camera.screenToMeters(screenCoord1.x, screenCoord1.y);
    // Is there a flickable actor there?
    let foundActor: Actor | undefined = undefined;
    for (let actor of stage.world.physics!.actorsAt(worldCoord1)) {
      if (actor.extra.flickSpeed != undefined) {
        foundActor = actor;
        break;
      }
    }
    if (!foundActor) return false;

    // Figure out the velocity to apply, then apply it
    let v = new b2Vec2(hudCoord2.x, hudCoord2.y)
    v = v.Subtract(hudCoord1);
    v.Normalize();
    v.Scale(foundActor.extra.flickSpeed * 2000 / time);
    (foundActor.movement as ManualMovement).updateVelocity(v.x, v.y);
    return true;
  };

  // Make the area on the HUD that receives swipe gestures
  new Actor({
    appearance: new FilledBox({ width: 16, height: 9, fillColor: "#00000000" }),
    rigidBody: new BoxBody({ cx: 8, cy: 4.5, width: 16, height: 9 }, { scene: stage.hud }),
    gestures: { swipe }
  });
}

// call the function that kicks off the game
initializeAndLaunch("game-player", new Config(), builder);
