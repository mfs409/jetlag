import { Actor, BoxBody, CircleBody, FilledBox, Hero, ImageSprite, JetLagGameConfig, Obstacle, Sides, TiltMovement, initializeAndLaunch, stage } from "../jetlag";
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
  stage.score.onLose = { level, builder };
  stage.score.onWin = { level, builder };

  // Another popular feature is walls that can be passed through in one
  // direction, but not another
  boundingBox();
  enableTilt(10, 10);

  new Actor({
    appearance: new ImageSprite({ width: 0.8, height: 0.8, img: "green_ball.png" }),
    rigidBody: new CircleBody({ cx: 0.25, cy: 5.25, radius: 0.4, }),
    movement: new TiltMovement(),
    role: new Hero(),
  });

  // create a box that is easy to fall into, but hard to get out of,
  // by making its sides each "one-sided"
  new Actor({
    appearance: new FilledBox({ width: 3, height: 0.2, fillColor: "#FF0000" }),
    rigidBody: new BoxBody({ cx: 4.5, cy: 3.1, width: 3, height: 0.2 }, { singleRigidSide: Sides.BOTTOM }),
    role: new Obstacle(),
  });

  new Actor({
    appearance: new FilledBox({ width: 0.2, height: 3, fillColor: "#FF0000" }),
    rigidBody: new BoxBody({ cx: 3.1, cy: 4.5, width: 0.2, height: 3 }, { singleRigidSide: Sides.RIGHT }),
    role: new Obstacle(),
  });

  new Actor({
    appearance: new FilledBox({ width: 0.2, height: 3, fillColor: "#FF0000" }),
    rigidBody: new BoxBody({ cx: 5.9, cy: 4.5, width: 0.2, height: 3 }, { singleRigidSide: Sides.LEFT }),
    role: new Obstacle(),
  });

  new Actor({
    appearance: new FilledBox({ width: 3, height: 0.2, fillColor: "#FF0000" }),
    rigidBody: new BoxBody({ cx: 4.5, cy: 7.5, width: 3, height: 0.2 }, { singleRigidSide: Sides.TOP }),
    role: new Obstacle(),
  });
}

// call the function that kicks off the game
initializeAndLaunch("game-player", new Config(), builder);
