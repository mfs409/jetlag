import { JetLagGameConfig, initializeAndLaunch } from "../jetlag";

/** Screen dimensions and other game configuration */
class Config implements JetLagGameConfig {
  // Use {16, 9} for landscape mode, and {9, 16} for portrait mode.
  aspectRatio = { width: 16, height: 9 };
  hitBoxes = true; // Set to `false` when everything is done
}

/**
 * Draw the first scene that shows when the game starts.
 *
 * @param level Which level of the game should be displayed
 */
function builder(_level: number) {
}

// call the function that starts running the game in the `game-player` div tag
// of `index.html`
initializeAndLaunch("game-player", new Config(), builder);
