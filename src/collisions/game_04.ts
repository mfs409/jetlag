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

  // We previously saw that we can have "sticky" actors, and also allow actors
  // to pass through other actors by making only certain sides rigid.  In this
  // example, we make sure they work together, by letting the hero jump
  // through a platform, and then stick to it.
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

  // This obstacle is sticky on top, and only rigid on its top
  new Actor({
    appearance: new FilledBox({ width: 2, height: 0.25, fillColor: "#FF0000" }),
    rigidBody: new BoxBody({ cx: 2, cy: 6, width: 2, height: 0.25, }, { stickySides: [Sides.TOP], singleRigidSide: Sides.TOP, density: 100, friction: 0.1 }),
    movement: new PathMovement(new Path().to(2, 6).to(4, 8).to(6, 6).to(4, 4).to(2, 6), 1, true),
    role: new Obstacle(),
  });

  // This obstacle is not sticky, and it is rigid on all sides
  new Actor({
    appearance: new FilledBox({ width: 2, height: 0.25, fillColor: "#FF0000" }),
    rigidBody: new BoxBody({ cx: 11, cy: 6, width: 2, height: 0.25, }, { density: 100, friction: 1 }),
    movement: new PathMovement(new Path().to(10, 6).to(12, 8).to(14, 6).to(12, 4).to(10, 6), 1, true),
    role: new Obstacle(),
  })
}

// call the function that kicks off the game
initializeAndLaunch("game-player", new Config(), builder);
