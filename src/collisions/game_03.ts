import { Actor, BoxBody, ChaseMovement, CircleBody, Enemy, FilledBox, Hero, ImageSprite, JetLagGameConfig, Obstacle, TiltMovement, initializeAndLaunch, stage } from "../jetlag";
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
  boundingBox();
  stage.score.onLose = { level, builder };
  stage.score.onWin = { level, builder };

  // Sometimes, we want to say that certain actors can pass through others
  enableTilt(10, 10);
  let h = new Actor({
    appearance: new ImageSprite({ width: 0.8, height: 0.8, img: "green_ball.png" }),
    rigidBody: new CircleBody({ cx: 0.25, cy: 5.25, radius: 0.4 }, { passThroughId: [7] }),
    movement: new TiltMovement(),
    role: new Hero(),
  });

  // the enemy chases the hero, but can't get through the wall
  new Actor({
    appearance: new ImageSprite({ width: 0.5, height: 0.5, img: "red_ball.png" }),
    rigidBody: new CircleBody({ cx: 14, cy: 2, radius: 0.25 }, { dynamic: true }),
    movement: new ChaseMovement({ speed: 1, target: h, chaseInX: true, chaseInY: true }),
    role: new Enemy(),
  });
  // Remember to make it dynamic, or it *will* go through the wall

  new Actor({
    appearance: new FilledBox({ width: 0.1, height: 7, fillColor: "#FF0000" }),
    rigidBody: new BoxBody({ cx: 12, cy: 1, width: 0.1, height: 7 }, { passThroughId: [7] }),
    role: new Obstacle(),
  });
}

// call the function that kicks off the game
initializeAndLaunch("game-player", new Config(), builder);
