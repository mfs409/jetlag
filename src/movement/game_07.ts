import { Actor, CircleBody, Hero, ImageSprite, JetLagGameConfig, KeyCodes, ManualMovement, initializeAndLaunch, stage } from "../jetlag";

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
    imageNames: ["green_ball.png", "mid.png"]
  };
}

/**
 * Build the levels of the game.
 *
 * @param level Which level should be displayed
 */
function builder(_level: number) {
  // We can use ManualMovement along with fixed speeds, so that there's only
  // control in one dimension

  stage.backgroundColor = "#17b4ff";
  stage.background.addLayer({ anchor: { cx: 8, cy: 4.5, }, imageMaker: () => new ImageSprite({ width: 16, height: 9, img: "mid.png" }), speed: 0 });
  let hero = new Actor({
    appearance: new ImageSprite({ width: 0.8, height: 0.8, img: "green_ball.png" }),
    rigidBody: new CircleBody({ cx: 0.25, cy: 5.25, radius: 0.4, }, { disableRotation: true }),
    movement: new ManualMovement(),
    role: new Hero(),
  });
  (hero.movement as ManualMovement).addVelocity(5, 0);

  stage.world.camera.setCameraFocus(hero);

  stage.keyboard.setKeyDownHandler(KeyCodes.KEY_UP, () => ((hero.movement as ManualMovement).updateYVelocity(-5)));
  stage.keyboard.setKeyDownHandler(KeyCodes.KEY_DOWN, () => ((hero.movement as ManualMovement).updateYVelocity(5)));
  stage.keyboard.setKeyUpHandler(KeyCodes.KEY_UP, () => ((hero.movement as ManualMovement).updateYVelocity(0)));
  stage.keyboard.setKeyUpHandler(KeyCodes.KEY_DOWN, () => ((hero.movement as ManualMovement).updateYVelocity(0)));
}

// call the function that kicks off the game
initializeAndLaunch("game-player", new Config(), builder);
