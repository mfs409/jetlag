import { Actor, BoxBody, CircleBody, FilledBox, Hero, HoverMovement, ImageSprite, JetLagGameConfig, b2Vec2, initializeAndLaunch, stage } from "../jetlag";
import { boundingBox } from "./common";

/**
 * Screen dimensions and other game configuration, such as the names of all
 * the assets (images and sounds) used by this game.
 */
class Config implements JetLagGameConfig {
  // Use 16/9 for landscape mode, and 9/16 for portrait mode
  aspectRatio = { width: 16, height: 9 };
  hitBoxes = true;
  resources = {
    prefix: "./assets/",
    imageNames: ["sprites.json"]
  };
}

/**
 * Build the levels of the game.
 *
 * @param level Which level should be displayed
 */
function builder(level: number) {
  // There will be winning and losing in these chapters, and we'll always want
  // to restart
  stage.score.onLose = { level, builder };
  stage.score.onWin = { level, builder };

  // There is a "pseudo-movement" called Hover.  It makes an actor stay at the
  // same part of the HUD, while behaving like it is in the world.
  stage.world.setGravity(0, 10);
  boundingBox();

  // make a hero who doesn't start moving until it is touched
  let hover_walk = new Actor({
    appearance: new ImageSprite({ width: 0.75, height: 0.75, img: "green_ball.png" }),
    rigidBody: new CircleBody({ cx: 0.5, cy: 8.25, radius: 0.375 }, { density: 1, friction: 0, disableRotation: true }),
    movement: new HoverMovement(0.5, 8.25),
    role: new Hero(),
  });
  // The `HoverMovement` isn't a full-fledged movement component, so if you
  // want to make its actor move, you'll need to work with the body directly.
  hover_walk.gestures.tap = () => {
    (hover_walk.movement as HoverMovement).stopHover();
    hover_walk.rigidBody.body.SetLinearVelocity({ x: 5, y: 0 });
    hover_walk.gestures.tap = undefined;
    return true;
  }

  // Make a hero who is hovering, but who we will eventually flick
  new Actor({
    appearance: new ImageSprite({ width: 1, height: 1, img: "green_ball.png" }),
    rigidBody: new CircleBody({ cx: 1, cy: 7, radius: .5 }),
    movement: new HoverMovement(1, 7),
    role: new Hero(),
    extra: { flickSpeed: .5 }
  });

  // Set up a "swipe" zone on the HUD, for swiping that hero
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
    // Don't forget to turn off hovering!
    (foundActor.movement as HoverMovement).stopHover();
    foundActor.rigidBody.body.SetLinearVelocity(v);
    return true;
  };
  new Actor({
    appearance: new FilledBox({ width: 16, height: 9, fillColor: "#00000000" }),
    rigidBody: new BoxBody({ cx: 8, cy: 4.5, width: 16, height: 9, }, { scene: stage.hud }),
    gestures: { swipe },
  });
}

// call the function that kicks off the game
initializeAndLaunch("game-player", new Config(), builder);
