import { Actor, ActorPoolSystem, CircleBody, Hero, ImageSprite, JetLagGameConfig, KeyCodes, ManualMovement, Projectile, ProjectileMovement, initializeAndLaunch, stage } from "../jetlag";
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
  stage.score.onLose = { level, builder };
  stage.score.onWin = { level, builder };

  // Making all of those projectiles is a bad idea... we'll end up with too
  // many, and the game will slow down.  We can use a "pool" to hold just
  // enough to make the game work:
  boundingBox();
  let projectiles = new ActorPoolSystem();
  for (let i = 0; i < 10; ++i) {
    // Where we put them doesn't matter, because the pool will disable them
    let p = new Actor({
      appearance: new ImageSprite({ width: .2, height: .2, img: "grey_ball.png" }),
      rigidBody: new CircleBody({ cx: -10, cy: -10, radius: .1 }),
      movement: new ProjectileMovement(),
      role: new Projectile()
    });
    projectiles.put(p);
  }
  let hero = new Actor({
    appearance: new ImageSprite({ width: 0.8, height: 0.8, img: "green_ball.png" }),
    rigidBody: new CircleBody({ cx: 0.25, cy: 5.25, radius: 0.4 }, { density: 2, disableRotation: true }),
    movement: new ManualMovement(),
    role: new Hero(),
  });
  stage.keyboard.setKeyDownHandler(KeyCodes.KEY_SPACE, () => {
    let p = projectiles.get();
    if (p) (p.role as Projectile).tossFrom(hero, .2, 0, 5, 0);
  });
  stage.keyboard.setKeyDownHandler(KeyCodes.KEY_LEFT, () => { (hero.movement as ManualMovement).setAbsoluteVelocity(-5, hero.rigidBody.getVelocity().y); });
  stage.keyboard.setKeyUpHandler(KeyCodes.KEY_LEFT, () => { (hero.movement as ManualMovement).setAbsoluteVelocity(0, hero.rigidBody.getVelocity().y); });
  stage.keyboard.setKeyDownHandler(KeyCodes.KEY_RIGHT, () => { (hero.movement as ManualMovement).setAbsoluteVelocity(5, hero.rigidBody.getVelocity().y); });
  stage.keyboard.setKeyUpHandler(KeyCodes.KEY_RIGHT, () => { (hero.movement as ManualMovement).setAbsoluteVelocity(0, hero.rigidBody.getVelocity().y); });
  stage.world.setGravity(0, 10);
}

// call the function that kicks off the game
initializeAndLaunch("game-player", new Config(), builder);
