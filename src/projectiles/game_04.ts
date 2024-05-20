import { Actor, ActorPoolSystem, BoxBody, CircleBody, FilledBox, Hero, ImageSprite, JetLagGameConfig, Projectile, ProjectileMovement, TiltMovement, TimedEvent, b2Vec2, initializeAndLaunch, stage } from "../jetlag";
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

  // Projectiles don't have to be circles.  Here, we make them long, skinny
  // rectangles, so they look like laser beams
  boundingBox();

  let h = new Actor({
    appearance: new ImageSprite({ width: 0.8, height: 0.8, img: "green_ball.png" }),
    rigidBody: new CircleBody({ cx: 8, cy: 4.5, radius: 0.4 }),
    movement: new TiltMovement(),
    role: new Hero(),
  });

  // set up a pool of projectiles with fixed velocity.  They will be rotated
  // in the direction they travel.
  let projectiles = new ActorPoolSystem();
  // set up the pool of projectiles
  for (let i = 0; i < 100; ++i) {
    let appearance = new FilledBox({ width: 0.02, height: 1, fillColor: "#FF0000" });
    let rigidBody = new BoxBody({ width: 0.02, height: .5, cx: -100, cy: -100 }, { collisionsEnabled: false });
    // let's not let gravity affect these projectiles
    let reclaimer = (actor: Actor) => { projectiles.put(actor); }
    let role = new Projectile({ disappearOnCollide: true, reclaimer });
    let p = new Actor({ appearance, rigidBody, movement: new ProjectileMovement({ fixedVectorVelocity: 10, rotateVectorToss: true }), role });
    projectiles.put(p);
  }

  // Now let's cover the HUD with a button for shooting these "laser beams".
  // This will have the same "toggle" feeling from the Gesture chapter.  But
  // we'll use gestures to figure out *where* to toss the projectile, and a
  // timer to limit the rate at which they are tossed.
  let v = new b2Vec2(0, 0);
  let isHolding = false;
  // On the initial touch, figure out where in the world it's happening
  let touchDown = (_actor: Actor, hudCoords: { x: number; y: number }) => {
    isHolding = true;
    let pixels = stage.hud.camera.metersToScreen(hudCoords.x, hudCoords.y);
    let world = stage.world.camera.screenToMeters(pixels.x, pixels.y);
    v.x = world.x;
    v.y = world.y;
    return true;
  };
  // On a release of the touch, stop tossing
  let touchUp = () => { isHolding = false; return true; };
  // Move will be the same as touchDown
  let panMove = touchDown;

  // Set up a timer to run at high frequency
  let lastToss = 0;
  stage.world.timer.addEvent(new TimedEvent(.01, true, () => {
    if (isHolding) {
      let now = stage.renderer.now;
      // Only throw once per 100 ms
      if (lastToss + 100 < now) {
        lastToss = now;
        // We can use "tossAt" to throw toward a specific point
        (projectiles.get()?.role as Projectile | undefined)?.tossAt(h.rigidBody.getCenter().x, h.rigidBody.getCenter().y, v.x, v.y, h, 0, 0);
      }
    }
  }));

  new Actor({
    appearance: new FilledBox({ width: 16, height: 9, fillColor: "#00000000" }),
    rigidBody: new BoxBody({ cx: 8, cy: 4.5, width: 16, height: 9 }, { scene: stage.hud }),
    gestures: { touchDown, touchUp, panMove }
  });

  // Warning!  If your projectiles seem to "not shoot", it might be because
  // they are colliding with something.
}

// call the function that kicks off the game
initializeAndLaunch("game-player", new Config(), builder);
