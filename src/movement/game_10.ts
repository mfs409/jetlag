import { Actor, CircleBody, Destination, ImageSprite, JetLagGameConfig, ManualMovement, initializeAndLaunch, stage } from "../jetlag";
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
  // Another neat feature in ManualMovement is that we can force an actor to
  // be immune to gravity.
  stage.world.setGravity(0, 10);
  boundingBox();

  // Destinations default to having collisions disabled.  We don't want this
  // to fly off screen, so we need to re-enable collisions, and we need to
  // make it dynamic.
  let d = new Actor({
    appearance: new ImageSprite({ width: 1, height: 1, img: "mustard_ball.png" }),
    rigidBody: new CircleBody({ cx: 15, cy: 4, radius: 0.5 }, { dynamic: true }),
    movement: new ManualMovement(),
    role: new Destination(),
  });
  (d.movement as ManualMovement).setAbsoluteVelocity(-2, 0);
  d.rigidBody.setCollisionsEnabled(true);

  // But now that it's dynamic, gravity affects it, and it falls.  This fixes
  // it:
  (d.movement as ManualMovement).setGravityDefy();
}

// call the function that kicks off the game
initializeAndLaunch("game-player", new Config(), builder);
