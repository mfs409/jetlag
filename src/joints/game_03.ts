import { Actor, BoxBody, CircleBody, FilledBox, Hero, ImageSprite, JetLagGameConfig, Obstacle, initializeAndLaunch, stage } from "../jetlag";
import { boundingBox } from "./common";

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
  // Revolute joints without limits can be the foundation for things like cars
  stage.world.setGravity(0, 10);

  // If the ground and wheels don't have friction, then this level won't work!
  let sides = boundingBox();
  sides.b.rigidBody.setPhysics({ friction: 1 });

  // We'll make the body of our car as a hero with just a red square
  let car = new Actor({
    appearance: new FilledBox({ width: 2, height: 0.5, fillColor: "#FF0000" }),
    rigidBody: new BoxBody({ cx: 1, cy: 8, width: 2, height: 0.5 }),
    role: new Hero(),
  });

  // Connect a back wheel... heavy tires make for good traction
  let backWheel = new Actor({
    appearance: new ImageSprite({ width: 0.5, height: 0.5, img: "blue_ball.png" }),
    rigidBody: new CircleBody({ cx: 0.75, cy: 8.5, radius: 0.25 }, { density: 3, friction: 1 }),
    role: new Obstacle(),
  });
  backWheel.rigidBody.setRevoluteJoint(car, -1, 0.5, 0, 0);
  backWheel.rigidBody.setRevoluteJointMotor(10, 10);

  // Connect a front wheel... it'll be all-wheel drive :)
  let frontWheel = new Actor({
    appearance: new ImageSprite({ width: 0.5, height: 0.5, img: "blue_ball.png" }),
    rigidBody: new CircleBody({ cx: 2.75, cy: 8.5, radius: 0.25 }, { density: 3, friction: 1 }),
    role: new Obstacle(),
  });
  frontWheel.rigidBody.setRevoluteJoint(car, 1, 0.5, 0, 0);
  frontWheel.rigidBody.setRevoluteJointMotor(10, 10);
}

// call the function that kicks off the game
initializeAndLaunch("game-player", new Config(), builder);
