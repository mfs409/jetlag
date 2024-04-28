import { Actor, CircleBody, Enemy, GravityMovement, Hero, ImageSprite, JetLagGameConfig, Obstacle, TiltMovement, TimedEvent, initializeAndLaunch, stage } from "../jetlag";
import { enableTilt, boundingBox } from "./common";

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
  // There's lots more we can explore in the configuration of rigid bodies,
  // but having some better ways of moving the hero would make it easier for
  // us to explore them, so let's switch gears and start looking at ways to
  // move an actor.  We've already seen Tilt, which is nice and
  // straightforward.  We've also seen "Inert", the default movement policy.

  // A rather uninteresting movement is the "GravityMovement".  This isn't
  // really a movement at all... it just says that gravity will affect the
  // actor.  It's not really any different from making the body "dynamic", but
  // sometimes it's useful.  Let's try it out here.  We'll make "enemies" that
  // fall from the sky, and the "hero" needs to dodge them.  When enemies
  // collide with the ground, they'll disappear.  Don't worry if some of this
  // doesn't make sense yet... we'll explain it all later.
  enableTilt(10, 0); // Now tilt will only control left/right
  let walls = boundingBox();
  (walls.b.role as Obstacle).enemyCollision = (_thisActor: Actor, enemy: Actor) => {
    (enemy.role as Enemy).defeat(false);
  }
  walls.t.enabled = false; // No top wall

  // Downward gravity
  stage.world.setGravity(0, 10);

  // Falling enemies
  stage.world.timer.addEvent(new TimedEvent(1, true, () => new Actor({
    appearance: new ImageSprite({ width: 1, height: 1, img: "red_ball.png" }),
    rigidBody: new CircleBody({ radius: .5, cy: -.5, cx: .5 + (Math.random() * 15) }),
    role: new Enemy(),
    movement: new GravityMovement(),
  })));

  // A hero moving via tilt.  Notice that the ball "rolls" on the ground, even
  // though there's no friction.  That's because of gravity.
  new Actor({
    appearance: new ImageSprite({ width: 0.8, height: 0.8, img: "green_ball.png" }),
    rigidBody: new CircleBody({ cx: 8, cy: 8.6, radius: 0.4 }),
    movement: new TiltMovement(),
    role: new Hero(),
  });

  // Any time it's possible to "lose", we need to tell JetLag what to do if the level is lost
  stage.score.onLose = { level, builder }
}

// call the function that kicks off the game
initializeAndLaunch("game-player", new Config(), builder);
