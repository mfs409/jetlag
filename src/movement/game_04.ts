import { Actor, ChaseMovement, CircleBody, Hero, ImageSprite, JetLagGameConfig, Obstacle, TiltMovement, initializeAndLaunch } from "../jetlag";
import { enableTilt, boundingBox } from "./common";

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
    imageNames: ["green_ball.png", "red_ball.png"]
  };
}

/**
 * Build the levels of the game.
 *
 * @param level Which level should be displayed
 */
function builder(_level: number) {
  // Chasing in only one dimension can be useful for neat UI effects, or for
  // things like a soccer goalie.  We'll try it out here.

  boundingBox();
  enableTilt(10, 10);

  // Make a hero who moves via tilt
  let h = new Actor({
    appearance: new ImageSprite({ width: 0.8, height: 0.8, img: "green_ball.png" }),
    rigidBody: new CircleBody({ cx: 5.25, cy: 5.25, radius: 0.4, }),
    movement: new TiltMovement(),
    role: new Hero(),
  });

  // These obstacles chase the hero, but only in one dimension
  new Actor({
    appearance: new ImageSprite({ width: 1, height: 1, img: "red_ball.png" }),
    rigidBody: new CircleBody({ cx: 0, cy: 2.5, radius: 0.5 }),
    movement: new ChaseMovement({ speed: 10, target: h, chaseInX: false }),
    role: new Obstacle(),
  });

  new Actor({
    appearance: new ImageSprite({ width: 1, height: 1, img: "red_ball.png" }),
    rigidBody: new CircleBody({ cx: 2.5, cy: 0, radius: 0.5, }),
    movement: new ChaseMovement({ speed: 10, target: h, chaseInY: false }),
    role: new Obstacle(),
  });
}

// call the function that kicks off the game
initializeAndLaunch("game-player", new Config(), builder);
