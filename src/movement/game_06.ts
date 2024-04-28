import { Actor, CircleBody, Hero, ImageSprite, JetLagGameConfig, KeyCodes, ManualMovement, initializeAndLaunch, stage } from "../jetlag";
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
 * @param level Which level should be displayed
 */
function builder(_level: number) {
  // Most of the movements we've looked at so far have been kind of automatic.
  // Now let's look at the last movement technique, ManualMovement.  This is
  // for when you want complete control over the movement of the actor.
  stage.world.setGravity(0, 0);
  boundingBox();

  // First, make the hero with ManualMovement as its movement component
  let hero = new Actor({
    appearance: new ImageSprite({ width: 0.5, height: 0.5, img: "green_ball.png" }),
    rigidBody: new CircleBody({ cx: 4, cy: 8, radius: 0.25 }),
    movement: new ManualMovement(),
    role: new Hero(),
  });

  // Now let's say that pressing a key should update its velocity, and
  // releasing should set that part of the velocity to 0:
  stage.keyboard.setKeyDownHandler(KeyCodes.KEY_UP, () => ((hero.movement as ManualMovement).updateYVelocity(-5)));
  stage.keyboard.setKeyDownHandler(KeyCodes.KEY_DOWN, () => ((hero.movement as ManualMovement).updateYVelocity(5)));
  stage.keyboard.setKeyDownHandler(KeyCodes.KEY_LEFT, () => ((hero.movement as ManualMovement).updateXVelocity(-5)));
  stage.keyboard.setKeyDownHandler(KeyCodes.KEY_RIGHT, () => ((hero.movement as ManualMovement).updateXVelocity(5)));

  stage.keyboard.setKeyUpHandler(KeyCodes.KEY_UP, () => ((hero.movement as ManualMovement).updateYVelocity(0)));
  stage.keyboard.setKeyUpHandler(KeyCodes.KEY_DOWN, () => ((hero.movement as ManualMovement).updateYVelocity(0)));
  stage.keyboard.setKeyUpHandler(KeyCodes.KEY_LEFT, () => ((hero.movement as ManualMovement).updateXVelocity(0)));
  stage.keyboard.setKeyUpHandler(KeyCodes.KEY_RIGHT, () => ((hero.movement as ManualMovement).updateXVelocity(0)));

  // We'll use the 'a' and 's' keys to rotate counterclockwise and clockwise
  stage.keyboard.setKeyDownHandler(KeyCodes.KEY_A, () => (hero.movement as ManualMovement).increaseRotation(-0.05))
  stage.keyboard.setKeyDownHandler(KeyCodes.KEY_S, () => (hero.movement as ManualMovement).increaseRotation(0.05))
}

// call the function that kicks off the game
initializeAndLaunch("game-player", new Config(), builder);
