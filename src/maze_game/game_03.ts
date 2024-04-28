import { Actor, CircleBody, Destination, Hero, ImageSprite, JetLagGameConfig, KeyCodes, ManualMovement, initializeAndLaunch, stage } from "../jetlag";

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
  // Level 3 adds a destination and a background color
  stage.backgroundColor = "#b3cde0";

  // Create a hero whose movement we can control "explicitly"
  let h = new Actor({
    appearance: new ImageSprite({ width: 0.8, height: 0.8, img: "green_ball.png", z: 1 }),
    rigidBody: new CircleBody({ cx: .5, cy: .5, radius: 0.4, }),
    role: new Hero(),
    movement: new ManualMovement(),
  });

  // Set up the keyboard for controlling the hero
  stage.keyboard.setKeyUpHandler(KeyCodes.KEY_UP, () => (h.movement as ManualMovement).updateYVelocity(0));
  stage.keyboard.setKeyUpHandler(KeyCodes.KEY_DOWN, () => (h.movement as ManualMovement).updateYVelocity(0));
  stage.keyboard.setKeyUpHandler(KeyCodes.KEY_LEFT, () => (h.movement as ManualMovement).updateXVelocity(0));
  stage.keyboard.setKeyUpHandler(KeyCodes.KEY_RIGHT, () => (h.movement as ManualMovement).updateXVelocity(0));
  stage.keyboard.setKeyDownHandler(KeyCodes.KEY_UP, () => (h.movement as ManualMovement).updateYVelocity(-5));
  stage.keyboard.setKeyDownHandler(KeyCodes.KEY_DOWN, () => (h.movement as ManualMovement).updateYVelocity(5));
  stage.keyboard.setKeyDownHandler(KeyCodes.KEY_LEFT, () => (h.movement as ManualMovement).updateXVelocity(-5));
  stage.keyboard.setKeyDownHandler(KeyCodes.KEY_RIGHT, () => (h.movement as ManualMovement).updateXVelocity(5));

  // Create a destination
  new Actor({
    appearance: new ImageSprite({ width: 0.8, height: 0.8, img: "mustard_ball.png" }),
    rigidBody: new CircleBody({ cx: 14.5, cy: 8.5, radius: 0.4 }),
    role: new Destination(),
  });
  stage.score.setVictoryDestination(1);

  // Win/Lose transitions
  stage.score.onLose = { level, builder };
  stage.score.onWin = { level, builder };
}

// call the function that kicks off the game
initializeAndLaunch("game-player", new Config(), builder);
