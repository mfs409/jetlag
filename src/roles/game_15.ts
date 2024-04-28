import { Actor, BoxBody, CircleBody, Enemy, Hero, ImageSprite, JetLagGameConfig, KeyCodes, TiltMovement, initializeAndLaunch, stage } from "../jetlag";
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

  // Heroes can use jumping and crawling to defeat enemies.  This doesn't
  // involve the hero's strength
  //
  // You might use crawling to simulate crawling, ducking, rolling, spinning,
  // etc.

  stage.world.setGravity(0, 10);
  let hero = new Actor({
    appearance: new ImageSprite({ width: 0.8, height: 0.8, img: "green_ball.png" }),
    rigidBody: new BoxBody({ cx: 2, cy: 3, width: 0.8, height: 0.8 }, { density: 2 }),
    movement: new TiltMovement(),
    role: new Hero(),
  });

  new Actor({
    appearance: new ImageSprite({ width: 0.8, height: 0.8, img: "red_ball.png" }),
    rigidBody: new CircleBody({ cx: 12, cy: 8.6, radius: 0.4 }),
    role: new Enemy({ defeatByCrawl: true, }),
  });

  new Actor({
    appearance: new ImageSprite({ width: 0.8, height: 0.8, img: "red_ball.png" }),
    rigidBody: new CircleBody({ cx: 14, cy: 8.6, radius: 0.4 }),
    role: new Enemy({ defeatByJump: true }),
  });

  stage.keyboard.setKeyDownHandler(KeyCodes.KEY_SPACE, () => { (hero.role as Hero).jump(0, -7.5); });

  stage.keyboard.setKeyDownHandler(KeyCodes.KEY_TAB, () => { (hero.role as Hero).crawlOn(Math.PI / 2); });
  stage.keyboard.setKeyUpHandler(KeyCodes.KEY_TAB, () => { (hero.role as Hero).crawlOff(Math.PI / 2); });
}


// call the function that kicks off the game
initializeAndLaunch("game-player", new Config(), builder);
