import { Actor, BoxBody, CircleBody, FilledBox, JetLagGameConfig, Scene, TextSprite, initializeAndLaunch, stage } from "../jetlag";
import { boundingBox, enableTilt } from "./common";

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
  // In this tutorial, we're going to briefly discuss how scores work in JetLag.
  // JetLag tracks a lot of information while your game is playing, through
  // `stage.score`.  Below are the main score items, which you might want to
  // print on the HUD in your game:
  //
  // - stage.score.getDestinationArrivals()
  // - stage.score.getEnemiesDefeated()
  // - stage.score.getEnemiesCreated()
  // - stage.score.getGoodieCount(i) // i in (0,1,2,3)
  // - stage.score.getHeroesDefeated()
  // - stage.score.getHeroesCreated()
  // - stage.score.getLoseCountdownRemaining()
  // - stage.score.getStopwatch()
  // - stage.score.getWinCountdownRemaining()

  // Along with this, you'll note that there are several ways to defeat an
  // enemy:
  // - Hero collides with it, hero is invincible
  // - Hero collides with it, hero strength > enemy damage
  // - Projectile collides with it, decreases its damage
  // - Hero jumps on it, it's able to be defeated by jump
  // - Hero crawls into it, it's able to be defeated by crawl
  // - You call enemy.defeat() on the enemy, e.g., in an obstacle callback,
  //   gesture callback, or timer.

  // There are several ways to set up how a game is won
  // - Defeat a specific number of enemies
  // - Defeat all enemies
  // - Collect a certain amount of goodies (of each type)
  // - Have enough heroes reach destinations
  // - Survive for long enough
  // - You call score.winLevel()

  // Finally, there are a few ways to set up how a game is lost
  // - All heroes are defeated
  // - A specific, important hero is defeated
  // - Time runs out
  // - You call score.loseLevel()

  // Let's try each of these out...

  // first, set up winning and losing to both restart
  stage.score.onLose = { level, builder };
  stage.score.onWin = { level, builder };
  winMessage("Yay");
  loseMessage("Try Again");

  // Put all the info on the screen
  new Actor({
    appearance: new TextSprite({ center: false, face: "Arial", size: 20, color: "#000000" }, () => "Arrivals: " + stage.score.getDestinationArrivals()),
    rigidBody: new CircleBody({ cx: .1, cy: .1, radius: .01 }, { scene: stage.hud })
  });
  new Actor({
    appearance: new TextSprite({ center: false, face: "Arial", size: 20, color: "#000000" }, () => "Defeated: " + stage.score.getEnemiesDefeated() + " / " + stage.score.getEnemiesCreated()),
    rigidBody: new CircleBody({ cx: .1, cy: .4, radius: .01 }, { scene: stage.hud })
  });
  new Actor({
    appearance: new TextSprite({ center: false, face: "Arial", size: 20, color: "#000000" }, () => "Goodies: " + stage.score.getGoodieCount(0) + ", " + stage.score.getGoodieCount(1) + ", " + stage.score.getGoodieCount(2) + ", " + stage.score.getGoodieCount(3)),
    rigidBody: new CircleBody({ cx: .1, cy: .7, radius: .01 }, { scene: stage.hud })
  });
  new Actor({
    appearance: new TextSprite({ center: false, face: "Arial", size: 20, color: "#000000" }, () => "Heroes: " + stage.score.getHeroesDefeated() + " / " + stage.score.getHeroesCreated()),
    rigidBody: new CircleBody({ cx: .1, cy: 1, radius: .01 }, { scene: stage.hud })
  });
  new Actor({
    appearance: new TextSprite({ center: false, face: "Arial", size: 20, color: "#000000" }, () => "Stopwatch: " + stage.score.getStopwatch().toFixed(2)),
    rigidBody: new CircleBody({ cx: .1, cy: 1.3, radius: .01 }, { scene: stage.hud })
  });
  new Actor({
    appearance: new TextSprite({ center: false, face: "Arial", size: 20, color: "#000000" }, () => "FPS: " + stage.renderer.getFPS().toFixed(2)),
    rigidBody: new CircleBody({ cx: .1, cy: 1.6, radius: .01 }, { scene: stage.hud })
  });
  new Actor({
    appearance: new TextSprite({ center: false, face: "Arial", size: 20, color: "#000000" }, () => stage.score.getWinCountdownRemaining() ? "Time Until Win: " + stage.score.getWinCountdownRemaining()?.toFixed(2) : ""),
    rigidBody: new CircleBody({ cx: .1, cy: 1.9, radius: .01 }, { scene: stage.hud })
  });
  new Actor({
    appearance: new TextSprite({ center: false, face: "Arial", size: 20, color: "#000000" }, () => stage.score.getLoseCountdownRemaining() ? "Time Until Lose: " + stage.score.getLoseCountdownRemaining()?.toFixed(2) : ""),
    rigidBody: new CircleBody({ cx: .1, cy: 1.9, radius: .01 }, { scene: stage.hud })
  });

  // Set up some movement
  enableTilt(10, 10);
  boundingBox();

  // Automatically win in 5 seconds
  stage.score.setVictorySurvive(5);
}

// call the function that kicks off the game
initializeAndLaunch("game-player", new Config(), builder);

/**
 * Create an overlay (blocking all game progress) consisting of a black screen
 * with text.  Clearing the overlay will start the next level.
 *
 * @param message A message to display in the middle of the screen
 */
function winMessage(message: string) {
  stage.score.winSceneBuilder = (overlay: Scene) => {
    new Actor({
      appearance: new FilledBox({ width: 16, height: 9, fillColor: "#000000" }),
      rigidBody: new BoxBody({ cx: 8, cy: 4.5, width: 16, height: 9 }, { scene: overlay }),
      gestures: {
        tap: () => {
          stage.clearOverlay();
          stage.switchTo(stage.score.onWin.builder, stage.score.onWin.level);
          return true;
        }
      },
    });
    new Actor({
      appearance: new TextSprite({ center: true, face: "Arial", color: "#FFFFFF", size: 28, z: 0 }, message),
      rigidBody: new BoxBody({ cx: 8, cy: 4.5, width: .1, height: .1 }, { scene: overlay }),
    });
  };
}

/**
 * Create an overlay (blocking all game progress) consisting of a black screen
 * with text.  Clearing the overlay will restart the level.
 *
 * @param message A message to display in the middle of the screen
 */
function loseMessage(message: string) {
  stage.score.loseSceneBuilder = (overlay: Scene) => {
    new Actor({
      appearance: new FilledBox({ width: 16, height: 9, fillColor: "#000000" }),
      rigidBody: new BoxBody({ cx: 8, cy: 4.5, width: 16, height: 9 }, { scene: overlay }),
      gestures: {
        tap: () => {
          stage.clearOverlay();
          stage.switchTo(stage.score.onLose.builder, stage.score.onLose.level);
          return true;
        }
      },
    });
    new Actor({
      appearance: new TextSprite({ center: true, face: "Arial", color: "#FFFFFF", size: 28, z: 0 }, message),
      rigidBody: new BoxBody({ cx: 8, cy: 4.5, width: .1, height: .1 }, { scene: overlay }),
    })
  };
}
