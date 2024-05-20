import { Actor, CircleBody, Destination, Hero, ImageSprite, JetLagGameConfig, TiltMovement, initializeAndLaunch, stage } from "../jetlag";
import { boundingBox, enableTilt } from "./common";

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
  // Restart the level when we win or lose
  stage.score.onLose = { level, builder };
  stage.score.onWin = { level, builder };

  // Every level will use tilt, and every level will have a box around it
  enableTilt(10, 10);
  boundingBox();

  // The "default" behavior: the destination accepts a hero
  new Actor({
    appearance: new ImageSprite({ width: 0.8, height: 0.8, img: "green_ball.png" }),
    rigidBody: new CircleBody({ cx: 2, cy: 3, radius: 0.4 }),
    movement: new TiltMovement(),
    role: new Hero(),
  });

  new Actor({
    appearance: new ImageSprite({ width: 0.8, height: 0.8, img: "mustard_ball.png" }),
    rigidBody: new CircleBody({ cx: 12, cy: 3, radius: 0.4 }),
    role: new Destination(),
  });

  // The default is that one hero in the destination == win, so the game will reset
}

// call the function that kicks off the game
initializeAndLaunch("game-player", new Config(), builder);
