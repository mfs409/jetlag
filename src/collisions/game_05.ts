import { Actor, AdvancedCollisionSystem, BoxBody, CircleBody, Hero, ImageSprite, JetLagGameConfig, Obstacle, TextSprite, TiltMovement, initializeAndLaunch, stage } from "../jetlag";
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

  // Everything we've looked at so far deals with when collisions *start*.
  // Sometimes, we want to do something when the collision *ends*.
  boundingBox();
  enableTilt(10, 10);
  let h = new Actor({
    appearance: new ImageSprite({ width: 0.8, height: 0.8, img: "green_ball.png" }),
    rigidBody: new CircleBody({ cx: 2, cy: 3, radius: 0.4, }),
    movement: new TiltMovement(),
    role: new Hero(),
  });

  let collisions = 0;
  let messages = ["Please leave me alone", "Why do you bother me so?", "Fine, you win."]
  let o = new Actor({
    appearance: new ImageSprite({ width: 0.8, height: 0.8, img: "mustard_ball.png" }),
    rigidBody: new CircleBody({ cx: 15, cy: 8, radius: 0.4 }),
    role: new Obstacle({
      heroCollision: () => {
        let text = new Actor({
          appearance: new TextSprite({ center: false, face: "Arial", size: 30, color: "#FF00FF" }, () => messages[collisions]),
          rigidBody: new BoxBody({ cx: 12, cy: 6, width: .01, height: .01 })
        });
        (stage.world.physics as AdvancedCollisionSystem).addEndContactHandler(o, h, () => {
          collisions++;
          text.remove();
          if (collisions == 3) stage.score.winLevel();
        });
      }
    }),
  });
}

// call the function that kicks off the game
initializeAndLaunch("game-player", new Config(), builder);
