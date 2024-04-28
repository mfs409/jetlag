import { Actor, BoxBody, CircleBody, FilledBox, Hero, ImageSprite, JetLagGameConfig, KeyCodes, ManualMovement, Obstacle, Path, PathMovement, Sides, initializeAndLaunch, stage } from "../jetlag";
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
function builder(level: number) {
  boundingBox();
  stage.score.onLose = { level, builder };
  stage.score.onWin = { level, builder };

  // It can be useful to make a hero stick to an obstacle. As an example, if
  // the hero should stand on a platform that moves along a path, then we will
  // want the hero to "stick" to it, even as the platform moves downward.
  stage.world.setGravity(0, 10);
  let hero = new Actor({
    appearance: new ImageSprite({ width: 0.8, height: 0.8, img: "green_ball.png" }),
    rigidBody: new CircleBody({ cx: 0.25, cy: 5.25, radius: 0.4 }, { density: 2, disableRotation: true }),
    movement: new ManualMovement(),
    role: new Hero(),
  });
  stage.keyboard.setKeyDownHandler(KeyCodes.KEY_SPACE, () => { (hero.role as Hero).jump(0, -7.5); });
  stage.keyboard.setKeyDownHandler(KeyCodes.KEY_LEFT, () => { (hero.movement as ManualMovement).setAbsoluteVelocity(-5, hero.rigidBody.getVelocity().y); });
  stage.keyboard.setKeyUpHandler(KeyCodes.KEY_LEFT, () => { (hero.movement as ManualMovement).setAbsoluteVelocity(0, hero.rigidBody.getVelocity().y); });
  stage.keyboard.setKeyDownHandler(KeyCodes.KEY_RIGHT, () => { (hero.movement as ManualMovement).setAbsoluteVelocity(5, hero.rigidBody.getVelocity().y); });
  stage.keyboard.setKeyUpHandler(KeyCodes.KEY_RIGHT, () => { (hero.movement as ManualMovement).setAbsoluteVelocity(0, hero.rigidBody.getVelocity().y); });

  // This platform is sticky on top... Jump onto it and watch what happens
  new Actor({
    appearance: new FilledBox({ width: 2, height: 0.25, fillColor: "#FF0000" }),
    rigidBody: new BoxBody({ cx: 2, cy: 6, width: 2, height: 0.25 }, { stickySides: [Sides.TOP], density: 100, friction: 0.1 }),
    movement: new PathMovement(new Path().to(2, 6).to(4, 8).to(6, 6).to(4, 4).to(2, 6), 1, true),
    role: new Obstacle(),
  });
  // Be sure to try out bottomSticky, leftSticky, and rightSticky

  // This obstacle is not sticky... The hero can slip around on it
  //
  // It's tempting to think "I'll use some friction here", but that still
  // wouldn't help with when the platform reaches the top of its path
  new Actor({
    appearance: new FilledBox({ width: 2, height: 0.25, fillColor: "#FF0000" }),
    rigidBody: new BoxBody({ cx: 11, cy: 6, width: 2, height: 0.25 }, { density: 100, friction: 1 }),
    movement: new PathMovement(new Path().to(10, 6).to(12, 8).to(14, 6).to(12, 4).to(10, 6), 1, true),
    role: new Obstacle(),
  });
}

// call the function that kicks off the game
initializeAndLaunch("game-player", new Config(), builder);
