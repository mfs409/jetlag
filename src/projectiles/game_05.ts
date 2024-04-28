import { Actor, ActorPoolSystem, CircleBody, Enemy, Hero, ImageSprite, JetLagGameConfig, KeyCodes, ManualMovement, Projectile, ProjectileMovement, initializeAndLaunch, stage } from "../jetlag";
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

  // What happens if projectiles go "too far"?  We might want to put them back
  // in the pool before they collide with something off-screen.  Also, when we
  // toss a projectile, we could randomly pick its image.
  //
  // Also, we didn't really get into *why* one would want projectiles.  Let's
  // use them to defeat enemies!
  boundingBox();
  stage.world.setGravity(0, 10);

  let hero = new Actor({
    appearance: new ImageSprite({ width: 0.8, height: 0.8, img: "green_ball.png" }),
    rigidBody: new CircleBody({ cx: 0.25, cy: 5.25, radius: 0.4 }, { density: 2, disableRotation: true }),
    movement: new ManualMovement(),
    role: new Hero(),
  });
  stage.keyboard.setKeyDownHandler(KeyCodes.KEY_LEFT, () => { (hero.movement as ManualMovement).setAbsoluteVelocity(-5, hero.rigidBody.getVelocity().y); });
  stage.keyboard.setKeyUpHandler(KeyCodes.KEY_LEFT, () => { (hero.movement as ManualMovement).setAbsoluteVelocity(0, hero.rigidBody.getVelocity().y); });
  stage.keyboard.setKeyDownHandler(KeyCodes.KEY_RIGHT, () => { (hero.movement as ManualMovement).setAbsoluteVelocity(5, hero.rigidBody.getVelocity().y); });
  stage.keyboard.setKeyUpHandler(KeyCodes.KEY_RIGHT, () => { (hero.movement as ManualMovement).setAbsoluteVelocity(0, hero.rigidBody.getVelocity().y); });

  // set up the pool of projectiles
  let projectiles = new ActorPoolSystem();
  for (let i = 0; i < 3; ++i) {
    let appearance = new ImageSprite({ img: "color_star_1.png", width: 0.5, height: 0.5, z: 0 });
    let rigidBody = new CircleBody({ radius: 0.25, cx: -100, cy: -100 });
    rigidBody.setCollisionsEnabled(false);
    let reclaimer = (actor: Actor) => { projectiles.put(actor); }
    let role = new Projectile({ damage: 2, disappearOnCollide: true, reclaimer });
    // Put in some code for eliminating the projectile quietly if it has
    // traveled too far
    let range = 5;
    role.prerenderTasks.push((_elapsedMs: number, actor?: Actor) => {
      if (!actor) return;
      if (!actor.enabled) return;
      let role = actor.role as Projectile;
      let body = actor.rigidBody.body;
      let dx = Math.abs(body.GetPosition().x - role.rangeFrom.x);
      let dy = Math.abs(body.GetPosition().y - role.rangeFrom.y);
      if ((dx * dx + dy * dy) > (range * range)) reclaimer(actor);
    });
    let p = new Actor({ appearance, rigidBody, movement: new ProjectileMovement(), role });
    p.rigidBody.body.SetGravityScale(0);
    projectiles.put(p);
  }

  let images = ["color_star_1.png", "color_star_2.png", "color_star_3.png", "color_star_4.png"];
  stage.keyboard.setKeyDownHandler(KeyCodes.KEY_SPACE, () => {
    let p = projectiles.get();
    if (!p) return;
    (p.appearance[0] as ImageSprite).setImage(images[Math.trunc(Math.random() * 4)]);
    (p.role as Projectile).tossFrom(hero, .2, 0, 5, 0);
    p.rigidBody.body.SetAngularVelocity(4);
  });

  // draw some enemies to defeat
  for (let i = 0; i < 5; i++) {
    new Actor({
      appearance: new ImageSprite({ width: 1, height: 1, img: "red_ball.png" }),
      rigidBody: new CircleBody({ cx: 2 + 2 * i, cy: 8.5, radius: 0.5 }),
      role: new Enemy({ damage: i + 1 }),
    });
  }
}

// call the function that kicks off the game
initializeAndLaunch("game-player", new Config(), builder);
