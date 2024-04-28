import { Actor, BoxBody, Hero, ImageSprite, JetLagGameConfig, KeyCodes, ManualMovement, initializeAndLaunch, stage } from "../jetlag";
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
    imageNames: ["sprites.json", "mid.png"]
  };
}

/**
 * Build the levels of the game.
 *
 * @param level Which level should be displayed
 */
function builder(_level: number) {
  // Sometimes, we want to make an actor move when we press a control, but when
  // we release we don't want an immediate stop. This shows how to achieve that
  // effect.
  stage.world.setGravity(0, 0);
  boundingBox();

  let hero = new Actor({
    appearance: new ImageSprite({ width: 0.75, height: 1.5, img: "green_ball.png" }),
    rigidBody: new BoxBody({ cx: 2, cy: 4, width: 0.75, height: 1.5, }),
    movement: new ManualMovement(),
    role: new Hero(),
  });

  // Be sure to turn off each of these, and watch what happens as the hero moves
  (hero.movement as ManualMovement).setDamping(1);
  (hero.movement as ManualMovement).setAngularDamping(1);

  stage.keyboard.setKeyDownHandler(KeyCodes.KEY_LEFT, () => ((hero.movement as ManualMovement).updateXVelocity(-5)));
  stage.keyboard.setKeyDownHandler(KeyCodes.KEY_RIGHT, () => ((hero.movement as ManualMovement).updateXVelocity(5)));
  stage.keyboard.setKeyDownHandler(KeyCodes.KEY_UP, () => ((hero.movement as ManualMovement).updateYVelocity(-5)));
  stage.keyboard.setKeyDownHandler(KeyCodes.KEY_DOWN, () => ((hero.movement as ManualMovement).updateYVelocity(5)));
  stage.keyboard.setKeyDownHandler(KeyCodes.KEY_A, () => ((hero.movement as ManualMovement).updateAngularVelocity(-1)));
  stage.keyboard.setKeyDownHandler(KeyCodes.KEY_S, () => ((hero.movement as ManualMovement).updateAngularVelocity(1)));

  stage.backgroundColor = "#17b4ff";
  stage.background.addLayer({ anchor: { cx: 8, cy: 4.5, }, imageMaker: () => new ImageSprite({ width: 16, height: 9, img: "mid.png" }), speed: 0 });
}

// call the function that kicks off the game
initializeAndLaunch("game-player", new Config(), builder);
