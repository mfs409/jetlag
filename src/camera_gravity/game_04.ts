import { Actor, AnimatedSprite, AnimationSequence, AnimationState, BoxBody, CircleBody, Destination, Enemy, FilledBox, Hero, ImageSprite, JetLagGameConfig, KeyCodes, ManualMovement, Obstacle, Sides, TiltMovement, initializeAndLaunch, stage } from "../jetlag";

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
    imageNames: ["green_ball.png", "mustard_ball.png", "night_0.png", "night_1.png"]
  };
}

/**
 * Build the levels of the game.
 *
 * @param level Which level should be displayed
 */
function builder(level: number) {
  // Here's a doodle jump-like game.  It's not infinite, and we don't really
  // have the obstacle behaviors that we want, but it's a start.

  // Start with gravity
  stage.world.setGravity(0, 10);
  stage.world.camera.setBounds(0, undefined, 16, 9);

  // Make the floor
  new Actor({
    appearance: new FilledBox({ width: 16, height: .1, fillColor: "#ff0000" }),
    rigidBody: new BoxBody({ cx: 8, cy: 9.05, width: 20, height: .1 }),
    role: new Obstacle(),
  });

  // Set up tilt, with arrow keys simulating tilt on devices that lack an
  // accelerometer
  stage.tilt.tiltMax.Set(10, 10);
  if (!stage.accelerometer.tiltSupported) {
    stage.keyboard.setKeyUpHandler(KeyCodes.KEY_LEFT, () => (stage.accelerometer.accel.x = 0));
    stage.keyboard.setKeyUpHandler(KeyCodes.KEY_RIGHT, () => (stage.accelerometer.accel.x = 0));
    stage.keyboard.setKeyDownHandler(KeyCodes.KEY_LEFT, () => (stage.accelerometer.accel.x = -5));
    stage.keyboard.setKeyDownHandler(KeyCodes.KEY_RIGHT, () => (stage.accelerometer.accel.x = 5));
  }
  // Make the hero
  const h = new Actor({
    appearance: new ImageSprite({ width: 0.8, height: 0.8, img: "green_ball.png" }),
    rigidBody: new CircleBody({ cx: 1.25, cy: 5.25, radius: 0.4 }, { density: 1, friction: 0.5, disableRotation: true }),
    movement: new TiltMovement(),
    role: new Hero(),
  });
  // The camera should follow the hero, but it should focus on a spot 2 meters
  // above the hero
  stage.world.camera.setCameraFocus(h, 0, -2);
  // Set up the space bar to make the hero jump
  stage.keyboard.setKeyDownHandler(KeyCodes.KEY_SPACE, () => (h.role as Hero).jump(0, -10));

  // Make the sides as enemies, but put them a tad off screen, because that's a
  // bit more kind
  //
  // Remember that the floor is at 9, and up is negative.  That means we're
  // going up to about -41, which is a height of 50.  The center of that height
  // would be -16.
  new Actor({
    appearance: new FilledBox({ width: .1, height: 50, fillColor: "#ff0000" }),
    rigidBody: new BoxBody({ cx: -.5, cy: -16, width: .1, height: 50 }),
    role: new Enemy(),
  });
  new Actor({
    appearance: new FilledBox({ width: .1, height: 50, fillColor: "#ff0000" }),
    rigidBody: new BoxBody({ cx: 16.5, cy: -16, width: .1, height: 50 }),
    role: new Enemy(),
  });
  stage.score.onLose = { level: level, builder: builder }

  // Add a destination that is "up high"
  new Actor({
    appearance: new ImageSprite({ width: 1, height: 1, img: "mustard_ball.png" }),
    rigidBody: new CircleBody({ cx: 15, cy: -26, radius: 0.5 }),
    role: new Destination(),
  });
  stage.score.setVictoryDestination(1);
  stage.score.onWin = { level: level, builder: builder }

  // create a function that makes a platform that we can jump through from below
  function platform(cx: number, cy: number) {
    new Actor({
      appearance: new FilledBox({ z: -1, width: 2, height: 0.2, fillColor: "#FF0000" }),
      rigidBody: new BoxBody({ cx, cy, width: 2, height: 0.2, }, { collisionsEnabled: true, singleRigidSide: Sides.TOP }),
      // Set a callback, then re-enable the platform's collision effect.
      role: new Obstacle({ heroCollision: (_thisActor: Actor, collideActor: Actor) => (collideActor.movement as ManualMovement).updateYVelocity(-5) }),
    });
  }

  // Use that code to make many platforms
  platform(3, 7.5);
  platform(5, 3.5);
  platform(3, -1.5);
  platform(6, -5.5);
  platform(10, -9.5);
  platform(3, -13.5);
  platform(4, -17.5);
  platform(5, -21.5);
  platform(6, -24.5);

  // Set up a background
  let animations = new Map();
  animations.set(AnimationState.IDLE_E, AnimationSequence.makeSimple({ timePerFrame: 550, repeat: true, images: ["night_0.png", "night_1.png"] }))
  stage.background.addLayer({ anchor: { cx: 8, cy: 4.5 }, imageMaker: () => new AnimatedSprite({ width: 16, height: 9, animations }), speed: 0.3, isHorizontal: false, isAuto: false });
}

// call the function that kicks off the game
initializeAndLaunch("game-player", new Config(), builder);
