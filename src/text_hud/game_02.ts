import { Actor, BoxBody, JetLagGameConfig, TextSprite, initializeAndLaunch } from "../jetlag";

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
    imageNames: ["sprites.json"],
  };
}

/**
 * Build the levels of the game.
 *
 * @param level Which level should be displayed
 */
function builder(_level: number) {
  // Let's stop that movement, and look at what's happening with that text
  new Actor({
    rigidBody: new BoxBody({ cx: 1, cy: 1, width: .5, height: .5 }),
    appearance: new TextSprite({ center: true, face: "Arial", size: 64, color: "#FF0000aa", strokeColor: "#0000FF", strokeWidth: 2 }, "Tap Me"),
    gestures: { tap: () => { console.log("tap"); return true; } }
  });
}

// call the function that kicks off the game
initializeAndLaunch("game-player", new Config(), builder);
