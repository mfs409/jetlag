import { JetLagGameConfig, initializeAndLaunch } from "../jetlag";
import { splashBuilder } from "./splash";

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
    musicNames: ["tune.ogg", "tune2.ogg"],
    imageNames: ["sprites.json"]
  };
}

// call the function that kicks off the game
initializeAndLaunch("game-player", new Config(), splashBuilder);
