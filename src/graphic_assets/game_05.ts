import { Actor, BoxBody, CircleBody, Hero, ImageSprite, JetLagGameConfig, TiltMovement, initializeAndLaunch } from "../jetlag";
import { boundingBox, enableTilt } from "./common";

/**
 * Screen dimensions and other game configuration, such as the names of all
 * the assets (images and sounds) used by this game.
 */
class Config implements JetLagGameConfig {
  // Use 16/9 for landscape mode, and 9/16 for portrait mode
  aspectRatio = { width: 16, height: 9 };
  hitBoxes = true;
  // Here's where we name all the images/sounds/background music files.
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
  enableTilt(10, 10);
  boundingBox();

  // This actor will go "under" everything else in Z=0, since it was drawn first
  new Actor({
    appearance: new ImageSprite({ width: 1, height: 1, img: "green_ball.png" }),
    rigidBody: new CircleBody({ radius: .5, cx: 8, cy: 1 }),
    role: new Hero(),
    movement: new TiltMovement()
  });

  new Actor({
    appearance: new ImageSprite({ width: 1, height: 1, img: "left_arrow.png" }),
    rigidBody: new BoxBody({ width: 1, height: 1, cx: 15, cy: 1 })
  });

  // But the actor will go *over* this, since its Z is -1
  new Actor({
    appearance: new ImageSprite({ width: 1, height: 1, img: "right_arrow.png", z: -1 }),
    rigidBody: new BoxBody({ width: 1, height: 1, cx: 1, cy: 1 })
  });
}

// call the function that kicks off the game
initializeAndLaunch("game-player", new Config(), builder);
