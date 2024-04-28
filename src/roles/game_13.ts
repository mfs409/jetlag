import { Actor, CircleBody, Hero, ImageSprite, JetLagGameConfig, KeyCodes, TiltMovement, initializeAndLaunch, stage } from "../jetlag";
import { boundingBox, enableTilt, levelController } from "./common";

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

  // Set up for quick switching among levels
  levelController(level, 17, builder);

  // We saw jumping in level 12.  Of course, we can also double-jump :)
  stage.world.setGravity(0, 10);

  let hero = new Actor({
    appearance: new ImageSprite({ width: 0.8, height: 0.8, img: "green_ball.png" }),
    rigidBody: new CircleBody({ cx: 3, cy: 3, radius: 0.4 }),
    movement: new TiltMovement(),
    role: new Hero({ numJumpsAllowed: 2 }),
  });

  // By default, obstacles reenable jumping upon any collision, any side, so
  // colliding with a border will re-enable jumps
  let jump_attempts = 0;
  stage.keyboard.setKeyDownHandler(KeyCodes.KEY_SPACE, () => {
    jump_attempts += 1;
    console.log("jump attempt " + jump_attempts);
    (hero.role as Hero).jump(0, -7.5);
  });
}

// call the function that kicks off the game
initializeAndLaunch("game-player", new Config(), builder);
