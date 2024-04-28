import { Actor, ActorPoolSystem, BoxBody, CircleBody, Enemy, FilledBox, GravityMovement, Hero, ImageSprite, JetLagGameConfig, Obstacle, Projectile, ProjectileMovement, TimedEvent, b2Vec2, initializeAndLaunch, stage } from "../jetlag";

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

  // This level is reminiscent of games where you need to keep asteroids from
  // hitting the ground. Note that now, the velocity of the projectile will
  // depend on the distance between the hero and the touch point
  stage.world.setGravity(0, 3);

  // We won't have a bounding box, just a floor:
  new Actor({
    appearance: new FilledBox({ width: 32, height: .1, fillColor: "#ff0000" }),
    rigidBody: new BoxBody({ cx: 16, cy: 9.05, width: 32, height: .1 }),
    role: new Obstacle(),
  });

  let h = new Actor({
    appearance: new ImageSprite({ width: 1, height: 1, img: "green_ball.png" }),
    rigidBody: new CircleBody({ cx: 8.5, cy: 0.5, radius: 0.5 }),
    role: new Hero(),
  });

  stage.score.setVictoryEnemyCount(20);

  // Set up our pool of projectiles.  With this throwing mechanism, the farther from the
  // hero we press, the faster the projectile goes, so we multiply the velocity by .8 to
  // slow it down a bit
  let projectiles = new ActorPoolSystem();
  for (let i = 0; i < 100; ++i) {
    // Be sure to explore the relationship between setCollisionsEnabled and disappearOnCollide
    let appearance = new ImageSprite({ width: 0.25, height: 0.25, img: "grey_ball.png", z: 0 });
    let rigidBody = new CircleBody({ radius: 0.125, cx: -100, cy: -100 });
    rigidBody.body.SetGravityScale(0); // immune to gravity
    rigidBody.setCollisionsEnabled(true); // No bouncing on a collision
    let reclaimer = (actor: Actor) => { projectiles.put(actor); }
    let role = new Projectile({ damage: 2, disappearOnCollide: true, reclaimer });
    // Put in some code for eliminating the projectile quietly if it has
    // traveled too far
    let range = 10;
    role.prerenderTasks.push((_elapsedMs: number, actor?: Actor) => {
      if (!actor) return;
      if (!actor.enabled) return;
      let role = actor.role as Projectile;
      let body = actor.rigidBody.body;
      let dx = Math.abs(body.GetPosition().x - role.rangeFrom.x);
      let dy = Math.abs(body.GetPosition().y - role.rangeFrom.y);
      if ((dx * dx + dy * dy) > (range * range)) reclaimer(actor);
    });
    let p = new Actor({ appearance, rigidBody, movement: new ProjectileMovement({ multiplier: .8 }), role });
    projectiles.put(p);
  }

  let v = new b2Vec2(0, 0);
  let isHolding = false;
  let touchDown = (_actor: Actor, hudCoords: { x: number; y: number }) => {
    isHolding = true;
    let pixels = stage.hud.camera.metersToScreen(hudCoords.x, hudCoords.y);
    let world = stage.world.camera.screenToMeters(pixels.x, pixels.y);
    v.x = world.x;
    v.y = world.y;
    return true;
  };
  let touchUp = () => { isHolding = false; return true; };
  let panMove = touchDown;
  new Actor({
    appearance: new FilledBox({ width: 16, height: 9, fillColor: "#00000000" }),
    rigidBody: new BoxBody({ cx: 8, cy: 4.5, width: 16, height: 9 }, { scene: stage.hud }),
    gestures: { touchDown, touchUp, panMove },
  });

  let lastToss = 0;
  stage.world.timer.addEvent(new TimedEvent(.01, true, () => {
    if (isHolding) {
      let now = stage.renderer.now;
      if (lastToss + 50 < now) {
        lastToss = now;
        let p = projectiles.get();
        if (p) (p.role as Projectile).tossAt(h.rigidBody.getCenter().x, h.rigidBody.getCenter().y, v.x, v.y, h, 0, -.5);
      }
    }
  }));

  // We'll set up a timer, so that enemies keep falling from the sky
  stage.world.timer.addEvent(new TimedEvent(1, true, () => {
    // get a random number between 0.0 and 15.0
    let x = Math.trunc(Math.random() * 151) / 10;
    new Actor({
      appearance: new ImageSprite({ width: 1, height: 1, img: "red_ball.png" }),
      rigidBody: new CircleBody({ cx: x, cy: -1, radius: 0.5 }),
      movement: new GravityMovement(),
      role: new Enemy(),
    });
  }));

}

// call the function that kicks off the game
initializeAndLaunch("game-player", new Config(), builder);
