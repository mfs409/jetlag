import { Actor, BoxBody, FilledBox, Hero, ImageSprite, JetLagGameConfig, KeyCodes, ManualMovement, Obstacle, initializeAndLaunch, stage } from "../jetlag";
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
    imageNames: ["sprites.json"]
  };
}

/**
 * Build the levels of the game.
 *
 * @param _level Which level should be displayed
 */
function builder(_level: number) {
  // In the last level, there was a "disableRotation" parameter.  This can be
  // very useful, especially in platformer-type games.
  stage.world.setGravity(0, 10);
  boundingBox();

  // If we don't have the `disableRotation` option here, then if the hero just
  // barely nicks the corner of the platform, it will rotate as it falls!
  let hero = new Actor({
    appearance: new ImageSprite({ width: 0.8, height: 0.8, img: "green_ball.png" }),
    rigidBody: new BoxBody({ cx: 1, cy: 5.25, width: .8, height: .8 }, { disableRotation: false }),
    movement: new ManualMovement(),
    role: new Hero(),
  });

  new Actor({
    appearance: new FilledBox({ width: 2, height: .25, fillColor: "#FF0000" }),
    rigidBody: new BoxBody({ width: 2, height: .25, cx: 4, cy: 7 }),
    role: new Obstacle(),
  });

  // "jumping" is a special behavior, and it's part of the *hero*, not the
  // *movement*.
  stage.keyboard.setKeyDownHandler(KeyCodes.KEY_SPACE, () => ((hero.role as Hero).jump(0, -7.5)));
  stage.keyboard.setKeyDownHandler(KeyCodes.KEY_LEFT, () => ((hero.movement as ManualMovement).updateXVelocity(-5)));
  stage.keyboard.setKeyDownHandler(KeyCodes.KEY_RIGHT, () => ((hero.movement as ManualMovement).updateXVelocity(5)));

  stage.keyboard.setKeyUpHandler(KeyCodes.KEY_LEFT, () => ((hero.movement as ManualMovement).updateXVelocity(0)));
  stage.keyboard.setKeyUpHandler(KeyCodes.KEY_RIGHT, () => ((hero.movement as ManualMovement).updateXVelocity(0)));
}

// call the function that kicks off the game
initializeAndLaunch("game-player", new Config(), builder);
