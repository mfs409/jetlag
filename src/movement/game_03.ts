import { Actor, ChaseMovement, CircleBody, Enemy, Hero, ImageSprite, JetLagGameConfig, TiltMovement, initializeAndLaunch, stage } from "../jetlag";
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
function builder(level: number) {

  // Another way of moving things is via "chase".  Chase isn't incredibly
  // complicated... we just cast a line from the chasing actor to the actor it
  // is chasing.  Surprisingly, this can seem like a really smart "AI" in some
  // games.

  boundingBox();
  enableTilt(10, 10);

  // Make a hero who we control via tilt
  let h = new Actor({
    appearance: new ImageSprite({ width: 0.8, height: 0.8, img: "green_ball.png" }),
    rigidBody: new CircleBody({ cx: 0.25, cy: 5.25, radius: 0.4 }),
    movement: new TiltMovement(),
    role: new Hero(),
  });

  // create an enemy who chases the hero
  new Actor({
    appearance: new ImageSprite({ width: 0.5, height: 0.5, img: "red_ball.png" }),
    rigidBody: new CircleBody({ cx: 15, cy: 1, radius: 0.25 }),
    movement: new ChaseMovement({ speed: 1, target: h }),
    role: new Enemy(),
  });

  stage.score.onLose = { level, builder }
}

// call the function that kicks off the game
initializeAndLaunch("game-player", new Config(), builder);
