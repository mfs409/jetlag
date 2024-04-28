import { Actor, CircleBody, Hero, ImageSprite, JetLagGameConfig, Sensor, TiltMovement, initializeAndLaunch, stage } from "../jetlag";
import { boundingBox, enableTilt } from "./common";

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
    imageNames: ["sprites.json"]
  };
}

/**
 * Build the levels of the game.
 *
 * @param level Which level should be displayed
 */
function builder(level: number) {
  // Throughout this tutorial, we'll have levels that can be "won" or "lost".
  // In all cases, we'll go right back to the same level.
  stage.score.onLose = { level, builder };
  stage.score.onWin = { level, builder };

  // Every level will use tilt, and every level will have a box around it
  enableTilt(10, 10);
  boundingBox();

  new Actor({
    appearance: new ImageSprite({ width: 0.8, height: 0.8, img: "green_ball.png" }),
    rigidBody: new CircleBody({ cx: 2, cy: 3, radius: 0.4 }),
    movement: new TiltMovement(),
    role: new Hero(),
  });

  // Now draw three sensors, with different collision behaviors.  Note that
  // the Z-index completely controls if the hero goes over or under two of
  // these. For the third, an index of 0 (the default), coupled with it being
  // drawn after the hero, means the hero still goes under it

  // This pad effect multiplies by -1, causing a "bounce off" effect even
  // though collisions are not enabled
  new Actor({
    appearance: new ImageSprite({ width: 0.8, height: 0.8, img: "grey_ball.png" }),
    rigidBody: new CircleBody({ cx: 5, cy: 3, radius: 0.4 }),
    role: new Sensor({
      heroCollision: (_self: Actor, h: Actor) => { h.rigidBody!.setVelocity(h.rigidBody!.getVelocity().Scale(-10)); }
    }),
  });

  // This pad multiplies by five, causing a speedup
  new Actor({
    appearance: new ImageSprite({ width: 0.8, height: 0.8, img: "grey_ball.png" }),
    rigidBody: new CircleBody({ cx: 7, cy: 3, radius: 0.4 }),
    role: new Sensor({
      heroCollision: (_self: Actor, h: Actor) => { h.rigidBody!.setVelocity(h.rigidBody!.getVelocity().Scale(5)); }
    }),
  });

  // A fraction causes a slowdown
  new Actor({
    appearance: new ImageSprite({ width: 0.8, height: 0.8, img: "grey_ball.png" }),
    rigidBody: new CircleBody({ cx: 9, cy: 3, radius: 0.4 }, { rotationSpeed: 2 }),
    role: new Sensor({
      heroCollision: (_self: Actor, h: Actor) => { h.rigidBody!.setVelocity(h.rigidBody!.getVelocity().Scale(0.2)); }
    }),
  });
}

// call the function that kicks off the game
initializeAndLaunch("game-player", new Config(), builder);
