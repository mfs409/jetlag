import { Actor, CircleBody, ImageSprite, JetLagGameConfig, initializeAndLaunch } from "../jetlag";

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
    imageNames: ["green_ball.png",]
  };
}

/**
 * Build the levels of the game.
 *
 * @param level Which level should be displayed
 */
function builder(_level: number) {
  // This will produce an error, because "bird.png" isn't in the imageNames list
  new Actor({
    appearance: new ImageSprite({ width: 2, height: 2, img: "bird.png" }),
    rigidBody: new CircleBody({ cx: 5, cy: 2, radius: 1 }),
  });
}

// call the function that kicks off the game
initializeAndLaunch("game-player", new Config(), builder);
