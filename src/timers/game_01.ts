import { Actor, CircleBody, Destination, Hero, ImageSprite, JetLagGameConfig, KeyCodes, TiltMovement, TimedEvent, initializeAndLaunch, stage } from "../jetlag";
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
  // The simplest thing we can do with a timer is ask for something to happen
  // after some time transpires.  In this case, the destination won't appear
  // for five seconds.
  stage.world.setGravity(0, 10);
  enableTilt(10, 0);
  boundingBox();

  stage.world.timer.addEvent(new TimedEvent(5, false, () => {
    // Make a destination
    new Actor({
      appearance: new ImageSprite({ width: 0.8, height: 0.8, img: "mustard_ball.png" }),
      rigidBody: new CircleBody({ cx: 15, cy: 8, radius: 0.4 }),
      role: new Destination(),
    });
    stage.score.setVictoryDestination(1);
  }))

  let h = new Actor({
    appearance: new ImageSprite({ width: 0.8, height: 0.8, img: "green_ball.png" }),
    rigidBody: new CircleBody({ cx: 2, cy: 8, radius: 0.4 }),
    movement: new TiltMovement(),
    role: new Hero(),
  });

  stage.keyboard.setKeyDownHandler(KeyCodes.KEY_SPACE, () => (h.role as Hero).jump(0, -10));

  // Specify default win and lose behaviors
  stage.score.onLose = { level, builder };
  stage.score.onWin = { level, builder };
}

// call the function that kicks off the game
initializeAndLaunch("game-player", new Config(), builder);
