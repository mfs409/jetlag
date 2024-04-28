import { Actor, CircleBody, Destination, FilledBox, Hero, ImageSprite, JetLagGameConfig, TextSprite, TiltMovement, TimedEvent, initializeAndLaunch, stage } from "../jetlag";
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
  // There is a lot more that you can do with timers.  One example is to chain
  // timers together, so that one leads to another.  Another is that you might
  // find that you need a timer to check if something has happened.  We'll
  // demonstrate that in this level.
  stage.world.setGravity(0, 0);
  enableTilt(10, 10);
  boundingBox();

  // Make an invisible destination
  let d = new Actor({
    appearance: new FilledBox({ width: 0.8, height: 0.8, fillColor: "#00000000" }),
    rigidBody: new CircleBody({ cx: 0.5 + 15 * Math.random(), cy: 0.5 + 8 * Math.random(), radius: 0.4 }),
    role: new Destination(),
  });
  stage.score.setVictoryDestination(1);

  let h = new Actor({
    appearance: new ImageSprite({ width: 0.8, height: 0.8, img: "green_ball.png" }),
    rigidBody: new CircleBody({ cx: 2, cy: 8, radius: 0.4 }),
    movement: new TiltMovement(),
    role: new Hero(),
  });

  // Specify default win and lose behaviors
  stage.score.onLose = { level, builder };
  stage.score.onWin = { level, builder };

  // We could do this computation in the ()=>{} code of the TextSprites, but
  // this is a quick way to show that we can have timers that get around
  // having to think about when other codes would run.
  let ud = "up";
  let lr = "left";
  stage.world.timer.addEvent(new TimedEvent(.01, true, () => {
    ud = h.rigidBody.getCenter().y < d.rigidBody.getCenter().y ? "down" : "up";
    lr = h.rigidBody.getCenter().x < d.rigidBody.getCenter().x ? "right" : "left";
  }));

  // Give some hints
  new Actor({
    appearance: new TextSprite({ face: "Arial", center: false, size: 22, color: "#000000" }, () => "go " + lr),
    rigidBody: new CircleBody({ cx: 0.5, cy: 0.2, radius: 0.01 }, { scene: stage.hud })
  });
  new Actor({
    appearance: new TextSprite({ face: "Arial", center: false, size: 22, color: "#000000" }, () => "go " + ud),
    rigidBody: new CircleBody({ cx: 0.5, cy: 0.7, radius: 0.01 }, { scene: stage.hud })
  });
}

// call the function that kicks off the game
initializeAndLaunch("game-player", new Config(), builder);
