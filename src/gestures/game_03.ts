import { Actor, CircleBody, Destination, Hero, ImageSprite, JetLagGameConfig, ManualMovement, initializeAndLaunch, stage } from "../jetlag";
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

  // So far, we've only really looked at the tap gesture.  Now let's look at
  // panning.
  //
  // Panning has three parts: what to do when the pan begins, what to do while
  // it continues, and what to do when it ends.  We'll demonstrate it with a
  // joystick.

  boundingBox();

  // A hero with ManualMovement, so that the joystick can control it
  let hero = new Actor({
    appearance: new ImageSprite({ width: 0.8, height: 0.8, img: "green_ball.png" }),
    rigidBody: new CircleBody({ cx: 1, cy: 1.5, radius: 0.4 }),
    movement: new ManualMovement(),
    role: new Hero(),
  });

  // A destination to reach
  new Actor({
    appearance: new ImageSprite({ width: 0.8, height: 0.8, img: "mustard_ball.png" }),
    rigidBody: new CircleBody({ cx: 11, cy: 6, radius: 0.4 }),
    role: new Destination(),
  });

  // Let's put a joystick in the bottom left.  We'll define the code for
  // moving the hero first:
  let jcx = 1, jcy = 8; // center of joystick
  let scale = 2;
  // here's code for moving the hero, based on how hard we're pushing the
  // joystick and where the touch is relative to the joystick center
  function doMove(_actor: Actor, hudCoords: { x: number; y: number }) {
    (hero.movement as ManualMovement).setAbsoluteVelocity(scale * (hudCoords.x - jcx), scale * (hudCoords.y - jcy));
    return true;
  }
  // And here's code for stopping the hero:
  function doStop() {
    (hero.movement as ManualMovement).setAbsoluteVelocity(0, 0);
    hero.rigidBody.clearRotation(); // be sure to try without this
    return true;
  }

  // Make a joystick
  new Actor({
    appearance: new ImageSprite({ width: 2, height: 2, img: "grey_ball.png" }),
    rigidBody: new CircleBody({ cx: jcx, cy: jcy, radius: 1 }, { scene: stage.hud }),
    gestures: { panStart: doMove, panMove: doMove, panStop: doStop },
  });

  // Notice that if you glide your finger off the joystick, the panStop event
  // won't happen.  That is a problem that can be fixed, but we're not going
  // to worry about it for now.
}

// call the function that kicks off the game
initializeAndLaunch("game-player", new Config(), builder);
