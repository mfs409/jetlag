import { Actor, CircleBody, Destination, Hero, ImageSprite, JetLagGameConfig, KeyCodes, TextSprite, TiltMovement, initializeAndLaunch, stage } from "../jetlag";
import { boundingBox, enableTilt } from "./common";

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
    imageNames: ["sprites.json"]
  };
}

/**
 * Build the levels of the game.
 *
 * @param level Which level should be displayed
 */
function builder(level: number) {
  // We can also have timers so that you lose if you don't finish a level
  // within an amount of time:
  stage.world.setGravity(0, 10);
  enableTilt(10, 0);
  boundingBox();

  // Make a destination
  new Actor({
    appearance: new ImageSprite({ width: 0.8, height: 0.8, img: "mustard_ball.png" }),
    rigidBody: new CircleBody({ cx: 15, cy: 8, radius: 0.4 }),
    role: new Destination(),
  });

  let h = new Actor({
    appearance: new ImageSprite({ width: 0.8, height: 0.8, img: "green_ball.png" }),
    rigidBody: new CircleBody({ cx: 2, cy: 8, radius: 0.4 }),
    movement: new TiltMovement(),
    role: new Hero(),
  });

  stage.keyboard.setKeyDownHandler(KeyCodes.KEY_SPACE, () => (h.role as Hero).jump(0, -10));

  // Specify default win and lose behaviors
  stage.score.setVictoryDestination(1);
  stage.score.onLose = { level, builder };
  stage.score.onWin = { level, builder };

  stage.score.setLoseCountdownRemaining(5);
  new Actor({
    appearance: new TextSprite({ face: "Arial", center: false, size: 22, color: "#000000" }, () => (stage.score.getLoseCountdownRemaining()!.toFixed(2))),
    rigidBody: new CircleBody({ cx: 0.5, cy: 0.2, radius: 0.01 }, { scene: stage.hud })
  });
}

// call the function that kicks off the game
initializeAndLaunch("game-player", new Config(), builder);
