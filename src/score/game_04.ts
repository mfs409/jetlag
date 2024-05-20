import { Actor, CircleBody, Enemy, Goodie, Hero, ImageSprite, JetLagGameConfig, TiltMovement, initializeAndLaunch, stage } from "../jetlag";
import { boundingBox, enableTilt } from "./common";
import { winMessage, loseMessage, makeScoreInfo } from "./score_helpers";

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
  // first, set up winning and losing to both restart
  stage.score.onLose = { level, builder };
  stage.score.onWin = { level, builder };
  winMessage("Yay");
  loseMessage("Try Again");

  makeScoreInfo();

  // Set up some movement
  enableTilt(10, 10);
  boundingBox();

  // Defeat via invincibility
  new Actor({
    appearance: new ImageSprite({ width: 1, height: 1, img: "green_ball.png" }),
    rigidBody: new CircleBody({ cx: .5, cy: 8.5, radius: .5 }),
    movement: new TiltMovement(),
    role: new Hero({ strength: 1 })
  });
  new Actor({
    appearance: new ImageSprite({ width: 1, height: 1, img: "blue_ball.png" }),
    rigidBody: new CircleBody({ cx: 2.5, cy: 8.5, radius: .5 }),
    role: new Goodie({ onCollect: (_g: Actor, h: Actor) => { (h.role as Hero).invincibleRemaining = 10; return true; } }),
  });
  new Actor({
    appearance: new ImageSprite({ width: 1, height: 1, img: "red_ball.png" }),
    rigidBody: new CircleBody({ cx: 3.5, cy: 8.5, radius: .5 }),
    role: new Enemy(),
  });
  new Actor({
    appearance: new ImageSprite({ width: 1, height: 1, img: "red_ball.png" }),
    rigidBody: new CircleBody({ cx: 4.5, cy: 8.5, radius: .5 }),
    role: new Enemy(),
  });
  stage.score.setVictoryEnemyCount(2);
}

// call the function that kicks off the game
initializeAndLaunch("game-player", new Config(), builder);
