import { Actor, BoxBody, CircleBody, DIRECTION, FilledBox, Hero, ImageSprite, JetLagGameConfig, KeyCodes, Obstacle, TiltMovement, initializeAndLaunch, stage } from "../jetlag";
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

  // We won't explore obstacle-projectile interactions (or projectiles at
  // all!) in this chapter.  But there's one more thing about obstacles to
  // discuss.  We can use them to decide when a hero can jump again.

  stage.world.setGravity(0, 10);

  let hero = new Actor({
    appearance: new ImageSprite({ width: 0.8, height: 0.8, img: "green_ball.png" }),
    rigidBody: new CircleBody({ cx: 3, cy: 3, radius: 0.4 }),
    movement: new TiltMovement(),
    role: new Hero(),
  });

  // By default, obstacles reenable jumping upon any collision, any side, so
  // colliding with a border will re-enable jumps
  let jump_attempts = 0;
  stage.keyboard.setKeyDownHandler(KeyCodes.KEY_SPACE, () => {
    jump_attempts += 1;
    console.log("jump attempt " + jump_attempts);
    (hero.role as Hero).jump(0, -7.5);
  });

  // But this one only works from the top
  new Actor({
    appearance: new FilledBox({ width: 2, height: 2, fillColor: "#FF0000" }),
    rigidBody: new BoxBody({ cx: 12, cy: 5, width: 2, height: 2 }),
    role: new Obstacle({ jumpReEnableSides: [DIRECTION.N] }),
  });
}


// call the function that kicks off the game
initializeAndLaunch("game-player", new Config(), builder);
