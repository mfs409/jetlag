import { Actor, BoxBody, CircleBody, FilledBox, Hero, ImageSprite, JetLagGameConfig, Obstacle, TiltMovement, initializeAndLaunch, stage } from "../jetlag";
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
function builder(_level: number) {
  // In this demo, we have a joint that welds one actor to another
  enableTilt(10, 10);
  stage.world.setGravity(0, 10);
  boundingBox();

  // Set up a hero
  new Actor({
    appearance: new ImageSprite({ width: 0.8, height: 0.8, img: "green_ball.png" }),
    rigidBody: new CircleBody({ cx: 4, cy: 8.5, radius: 0.4 }, { disableRotation: true }),
    movement: new TiltMovement(),
    role: new Hero(),
  });

  // When the hero collides with this box, it will stick to the hero
  new Actor({
    appearance: new FilledBox({ width: .5, height: .5, fillColor: "#FF0000" }),
    // Note that for the weld joint to work, you probably want the obstacle to
    // have a dynamic body.
    rigidBody: new BoxBody({ width: .5, height: .5, cx: 7, cy: 8.5 }, { dynamic: true }),
    role: new Obstacle({
      heroCollision: (o: Actor, h: Actor) => {
        h.rigidBody!.setWeldJoint(o, -.25, 0, .4, 0, 0);
      }
    }),
  });
}

// call the function that kicks off the game
initializeAndLaunch("game-player", new Config(), builder);
