import { Actor, BoxBody, CircleBody, FilledBox, ImageSprite, JetLagGameConfig, Obstacle, TimedEvent, initializeAndLaunch, stage } from "../jetlag";

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
function builder(_level: number) {
  // In this level, a joint relates the rectangle to the circle.  The circle
  // is the pivot point, and the rectangle rotates around it
  let revolving = new Actor({
    appearance: new FilledBox({ width: 5, height: 1, fillColor: "#FF0000" }),
    rigidBody: new BoxBody({ cx: 1.5, cy: 4, width: 5, height: 1, }),
    role: new Obstacle(),
  });

  let anchor = new Actor({
    appearance: new ImageSprite({ width: 1, height: 1, img: "blue_ball.png" }),
    rigidBody: new CircleBody({ cx: 7.5, cy: 4, radius: 0.5 }),
    role: new Obstacle(),
  });

  revolving.rigidBody!.setRevoluteJoint(anchor, 0, 0, 0, 2);
  // Add some limits, then give some speed to make it move
  revolving.rigidBody!.setRevoluteJointLimits(1.7, -1.7);
  revolving.rigidBody!.setRevoluteJointMotor(0.5, Number.POSITIVE_INFINITY);

  // Notice that we can change the motor at any time...
  stage.world.timer.addEvent(new TimedEvent(5, false, () => {
    // The order in which we do these changes doesn't matter :)
    revolving.rigidBody!.setRevoluteJointMotor(-.5, Number.POSITIVE_INFINITY);
    revolving.rigidBody!.setRevoluteJointLimits(1.7, -.5);
  }));
}

// call the function that kicks off the game
initializeAndLaunch("game-player", new Config(), builder);
