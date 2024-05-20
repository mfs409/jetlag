import { JetLagGameConfig, initializeAndLaunch, stage } from "../jetlag";
import { boundingBox, enableTilt } from "./common";
import { winMessage, loseMessage, makeScoreInfo } from "./score_helpers";

/**
 * Screen dimensions and other game configuration, such as the names of all
 * the assets (images and sounds) used by this game.
 */
class Config implements JetLagGameConfig {
  // Use 16/9 for landscape mode, and 9/16 for portrait mode
  aspectRatio = { width: 16, height: 9 };
  hitBoxes = true;
}

/**
 * Build the levels of the game.
 *
 * @param level Which level should be displayed
 */
function builder(level: number) {
  // first, set up winning and losing to both restart
  stage.score.onLose = { level, builder };
  stage.score.onWin = { level, builder };
  winMessage("Yay");
  loseMessage("Try Again");

  makeScoreInfo();

  // Set up some movement
  enableTilt(10, 10);
  boundingBox();

  // Automatically lose in 5 seconds
  stage.score.setLoseCountdownRemaining(5);
}

// call the function that kicks off the game
initializeAndLaunch("game-player", new Config(), builder);
