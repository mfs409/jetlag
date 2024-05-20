import { Actor, CircleBody, Goodie, Hero, ImageSprite, JetLagGameConfig, KeyCodes, TiltMovement, initializeAndLaunch, stage } from "../jetlag";
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

  // Whenever a hero collides with a goodie, it automatically collects it.
  // JetLag has four built-in "goodie counters".  When you collide with a
  // goodie, the default is that the "0" goodie counter increments by one.
  //
  // NB:  Heroes are always dynamic, since they're involved in so many important
  //      collisions...
  new Actor({
    appearance: new ImageSprite({ width: 0.8, height: 0.8, img: "green_ball.png" }),
    rigidBody: new CircleBody({ cx: 2, cy: 3, radius: 0.4 }),
    movement: new TiltMovement(),
    role: new Hero(),
  });

  new Actor({
    appearance: new ImageSprite({ width: 0.8, height: 0.8, img: "blue_ball.png" }),
    rigidBody: new CircleBody({ cx: 12, cy: 3, radius: 0.4 }),
    role: new Goodie(),
  });

  // Set up a way to quickly get the goodie counts by pressing the '?' key
  stage.keyboard.setKeyDownHandler(KeyCodes.KEY_SLASH, () =>
    window.alert(`${stage.score.getGoodieCount(0)}, ${stage.score.getGoodieCount(1)}, ${stage.score.getGoodieCount(2)}, ${stage.score.getGoodieCount(3)}`));
}

// call the function that kicks off the game
initializeAndLaunch("game-player", new Config(), builder);
