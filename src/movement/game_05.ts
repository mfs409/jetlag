import { Actor, ChaseMovement, CircleBody, Hero, ImageSprite, JetLagGameConfig, Obstacle, TiltMovement, b2Vec2, initializeAndLaunch, stage } from "../jetlag";
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
    imageNames: ["sprites.json", "mid.png"]
  };
}

/**
 * Build the levels of the game.
 *
 * @param level Which level should be displayed
 */
function builder(_level: number) {
  // Sometimes we only want chasing in one direction.
  enableTilt(10, 0);
  stage.world.setGravity(0, 10);
  boundingBox();

  // Just for fun, we'll have an auto-scrolling background, to make it look
  // like we're moving all the time
  stage.background.addLayer({ anchor: { cx: 8, cy: 4.5 }, imageMaker: () => new ImageSprite({ width: 16, height: 9, img: "mid.png" }), speed: -5 / 1000, isAuto: true });

  // Make a hero and an enemy that slowly moves toward the hero
  let h = new Actor({
    appearance: new ImageSprite({ width: 0.8, height: 0.8, img: "green_ball.png" }),
    role: new Hero(),
    rigidBody: new CircleBody({ cx: 0.25, cy: 5.25, radius: 0.4 }),
    movement: new TiltMovement(),
    gestures: { tap: () => { h.rigidBody.setVelocity(new b2Vec2(h.rigidBody.getVelocity().x, -10)); return true; } }
  });

  // This enemy will slowly move toward the hero
  new Actor({
    appearance: new ImageSprite({ width: 0.8, height: 0.8, img: "red_ball.png" }),
    role: new Obstacle(),
    rigidBody: new CircleBody({ cx: 15, cy: 2, radius: 0.4 }, { dynamic: true }),
    movement: new ChaseMovement({ target: h, chaseInY: false, speed: 0.9 })
  });
}

// call the function that kicks off the game
initializeAndLaunch("game-player", new Config(), builder);
