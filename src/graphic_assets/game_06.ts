import { Actor, CircleBody, Goodie, Hero, ImageSprite, JetLagGameConfig, TiltMovement, initializeAndLaunch, stage } from "../jetlag";
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
  boundingBox();
  stage.world.setGravity(0, 10);
  enableTilt(10, 0);

  new Actor({
    appearance: new ImageSprite({ width: 1, height: 1, img: "green_ball.png" }),
    rigidBody: new CircleBody({ cx: .5, cy: 8.5, radius: .5 }),
    movement: new TiltMovement(),
    role: new Hero({ strength: 1 })
  });
  let onCollect = (_g: Actor, h: Actor) => {
    let s = ++(h.role as Hero).strength;
    (h.appearance[0] as ImageSprite).setImage("color_star_" + s + ".png");
    return true;
  }
  new Actor({
    appearance: new ImageSprite({ width: 1, height: 1, img: "blue_ball.png" }),
    rigidBody: new CircleBody({ cx: 2.5, cy: 8.5, radius: .5 }),
    role: new Goodie({ onCollect }),
  });
  new Actor({
    appearance: new ImageSprite({ width: 1, height: 1, img: "blue_ball.png" }),
    rigidBody: new CircleBody({ cx: 4.5, cy: 8.5, radius: .5 }),
    role: new Goodie({ onCollect }),
  });
  new Actor({
    appearance: new ImageSprite({ width: 1, height: 1, img: "blue_ball.png" }),
    rigidBody: new CircleBody({ cx: 6.5, cy: 8.5, radius: .5 }),
    role: new Goodie({ onCollect }),
  });
  new Actor({
    appearance: new ImageSprite({ width: 1, height: 1, img: "blue_ball.png" }),
    rigidBody: new CircleBody({ cx: 6.5, cy: 8.5, radius: .5 }),
    role: new Goodie({ onCollect }),
  });
}

// call the function that kicks off the game
initializeAndLaunch("game-player", new Config(), builder);
