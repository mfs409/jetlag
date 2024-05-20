import { Actor, CircleBody, Hero, ImageSprite, JetLagGameConfig, KeyCodes, ManualMovement, Projectile, ProjectileMovement, initializeAndLaunch, stage } from "../jetlag";
import { boundingBox } from "./common";

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

  // Projectiles are something that we can "toss" on the screen.  They are
  // unique among roles, because it really only makes sense to have a
  // Projectile role along with Projectile movement.
  boundingBox();
  stage.world.setGravity(0, 10);
  let hero = new Actor({
    appearance: new ImageSprite({ width: 0.8, height: 0.8, img: "green_ball.png" }),
    rigidBody: new CircleBody({ cx: 1.25, cy: 5.25, radius: 0.4 }, { density: 2, disableRotation: true }),
    movement: new ManualMovement(),
    role: new Hero(),
  });
  // Note that you could have different buttons, or different keys, for
  // tossing projectiles in a few specific directions
  stage.keyboard.setKeyDownHandler(KeyCodes.KEY_SPACE, () => {
    let p = new Actor({
      appearance: new ImageSprite({ width: .2, height: .2, img: "grey_ball.png" }),
      rigidBody: new CircleBody({ cx: hero.rigidBody.getCenter().x + .2, cy: hero.rigidBody.getCenter().y, radius: .1 }),
      movement: new ProjectileMovement(),
      role: new Projectile()
    });
    // We can use "tossFrom" to throw in a specific direction, starting at a
    // point, such as the hero's center.
    (p.role as Projectile).tossFrom(hero, .2, 0, 5, 0);
  });
  stage.keyboard.setKeyDownHandler(KeyCodes.KEY_LEFT, () => { (hero.movement as ManualMovement).setAbsoluteVelocity(-5, hero.rigidBody.getVelocity().y); });
  stage.keyboard.setKeyUpHandler(KeyCodes.KEY_LEFT, () => { (hero.movement as ManualMovement).setAbsoluteVelocity(0, hero.rigidBody.getVelocity().y); });
  stage.keyboard.setKeyDownHandler(KeyCodes.KEY_RIGHT, () => { (hero.movement as ManualMovement).setAbsoluteVelocity(5, hero.rigidBody.getVelocity().y); });
  stage.keyboard.setKeyUpHandler(KeyCodes.KEY_RIGHT, () => { (hero.movement as ManualMovement).setAbsoluteVelocity(0, hero.rigidBody.getVelocity().y); });
}

// call the function that kicks off the game
initializeAndLaunch("game-player", new Config(), builder);
