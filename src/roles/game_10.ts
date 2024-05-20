import { Actor, BoxBody, CircleBody, FilledBox, Hero, ImageSprite, JetLagGameConfig, Obstacle, TiltMovement, initializeAndLaunch, stage } from "../jetlag";
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
  // Restart the level when we win or lose
  stage.score.onLose = { level, builder };
  stage.score.onWin = { level, builder };

  // Every level will use tilt, and every level will have a box around it
  enableTilt(10, 10);
  boundingBox();

  // We can run code when a hero collides with an obstacle, too
  new Actor({
    appearance: new ImageSprite({ width: 0.8, height: 0.8, img: "green_ball.png" }),
    rigidBody: new CircleBody({ cx: 3, cy: 3, radius: 0.4 }),
    movement: new TiltMovement(),
    role: new Hero(),
    extra: { regular: true }
  });

  new Actor({
    appearance: new FilledBox({ width: 0.2, height: 2, fillColor: "#FF0000" }),
    rigidBody: new BoxBody({ cx: 12, cy: 8, width: .2, height: 2 }),
    role: new Obstacle({
      heroCollision: (_o: Actor, h: Actor) => {
        if (h.extra.regular) {
          h.resize(.5);
          h.extra.regular = false;
        }
      }
    }),
  });
}

// call the function that kicks off the game
initializeAndLaunch("game-player", new Config(), builder);
