import { Actor, BoxBody, CircleBody, Destination, FilledBox, Hero, ImageSprite, JetLagGameConfig, KeyCodes, Obstacle, TiltMovement, initializeAndLaunch, stage } from "../jetlag";

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
    imageNames: ["green_ball.png", "mustard_ball.png", "noise.png"]
  };
}

/**
 * Build the levels of the game.
 *
 * @param level Which level should be displayed
 */
function builder(level: number) {
  // A simple overhead movement game with a big world and a HUD
  let h = new Actor({
    appearance: new ImageSprite({ width: 0.8, height: 0.8, img: "green_ball.png" }),
    rigidBody: new CircleBody({ cx: 2, cy: 3, radius: 0.4 }),
    movement: new TiltMovement(),
    role: new Hero(),
  });

  enableTilt(10, 10);

  // By default, the camera is centered on the point 8, 4.5f.  We can instead
  // have the camera stay centered on the hero, so that we can keep seeing the
  // hero as it moves around the world.  Note that this is the most
  // rudimentary way to follow the hero's movement, and it's not going to look
  // good when the hero is close to the level's boundaries.
  stage.world.camera.setCameraFocus(h);

  // As the hero moves around, it's going to be hard to see that it's really
  // moving.  Draw some "noise" in the background.  Note that we're changing
  // the Z index.
  //
  // This code uses "for loops".  The outer loop will run 4 times (0, 16, 32,
  // 48).  Each time, the inner loop will run 4 times (0, 9, 18, 27), drawing
  // a total of 16 images.
  for (let x = 0; x < 64; x += 16) {
    for (let y = 0; y < 36; y += 9) {
      // This is kind of neat: a picture is just an actor without a role or rigidBody
      new Actor({
        appearance: new ImageSprite({ width: 16, height: 9, img: "noise.png", z: -1 }),
        rigidBody: new BoxBody({ cx: x + 8, cy: y + 4.5, width: 16, height: 9 }, { collisionsEnabled: false }),
      });
    }
  }

  // Draw four walls, covering the four borders of the world
  new Actor({
    appearance: new FilledBox({ width: 64, height: .1, fillColor: "#ff0000" }),
    rigidBody: new BoxBody({ cx: 32, cy: -.05, width: 64, height: .1 }),
    role: new Obstacle(),
  });
  new Actor({
    appearance: new FilledBox({ width: 64, height: .1, fillColor: "#ff0000" }),
    rigidBody: new BoxBody({ cx: 32, cy: 36.05, width: 64, height: .1 }),
    role: new Obstacle(),
  });
  new Actor({
    appearance: new FilledBox({ width: .1, height: 36, fillColor: "#ff0000" }),
    rigidBody: new BoxBody({ cx: -.05, cy: 18, width: .1, height: 36 }),
    role: new Obstacle(),
  });
  new Actor({
    appearance: new FilledBox({ width: .1, height: 36, fillColor: "#ff0000" }),
    rigidBody: new BoxBody({ cx: 64.05, cy: 18, width: .1, height: 36 }),
    role: new Obstacle(),
  });

  // make the level really big
  stage.world.camera.setBounds(0, 0, 64, 36);

  // Set up a destination
  new Actor({
    appearance: new ImageSprite({ width: 0.8, height: 0.8, img: "mustard_ball.png" }),
    rigidBody: new CircleBody({ cx: 55, cy: 28, radius: 0.4 }),
    role: new Destination(),
  });
  stage.score.setVictoryDestination(1);
  stage.score.onWin = { level: level, builder: builder }

  // add zoom buttons. We are using blank images, which means that the buttons
  // will be invisible... that's nice, because we can make the buttons big
  // (covering the left and right halves of the screen).  When debug rendering
  // is turned on, we'll be able to see an outline of the two rectangles. You
  // could also use images, but if you did, you'd probably want to use some
  // transparency so that they don't cover up the gameplay.

  // Note: these go on the HUD
  new Actor({
    appearance: new FilledBox({ width: 8, height: 9, fillColor: "#00000000" }),
    rigidBody: new BoxBody({ cx: 4, cy: 4.5, width: 8, height: 9 }, { scene: stage.hud }),
    gestures: {
      tap: () => {
        if (stage.world.camera.getScale() > 50) stage.world.camera.setScale(stage.world.camera.getScale() - 10);
        return true;
      }
    }
  });
  new Actor({
    appearance: new FilledBox({ width: 8, height: 9, fillColor: "#00000000" }),
    rigidBody: new BoxBody({ cx: 12, cy: 4.5, width: 8, height: 9 }, { scene: stage.hud }),
    gestures: {
      tap: () => {
        if (stage.world.camera.getScale() < 200) stage.world.camera.setScale(stage.world.camera.getScale() + 20);
        return true;
      }
    }
  });
}

// call the function that kicks off the game
initializeAndLaunch("game-player", new Config(), builder);

/**
 * Enable Tilt, and set up arrow keys to simulate it
 *
 * @param xMax  The maximum X force
 * @param yMax  The maximum Y force
 */
function enableTilt(xMax: number, yMax: number) {
  // Put limits on how much force a tilt can produce
  stage.tilt.tiltMax.Set(xMax, yMax);
  // Set up arrows to simulate tilt on devices that don't have an accelerometer
  if (!stage.accelerometer.tiltSupported) {
    stage.keyboard.setKeyUpHandler(KeyCodes.KEY_UP, () => (stage.accelerometer.accel.y = 0));
    stage.keyboard.setKeyUpHandler(KeyCodes.KEY_DOWN, () => (stage.accelerometer.accel.y = 0));
    stage.keyboard.setKeyUpHandler(KeyCodes.KEY_LEFT, () => (stage.accelerometer.accel.x = 0));
    stage.keyboard.setKeyUpHandler(KeyCodes.KEY_RIGHT, () => (stage.accelerometer.accel.x = 0));
    stage.keyboard.setKeyDownHandler(KeyCodes.KEY_UP, () => (stage.accelerometer.accel.y = -5));
    stage.keyboard.setKeyDownHandler(KeyCodes.KEY_DOWN, () => (stage.accelerometer.accel.y = 5));
    stage.keyboard.setKeyDownHandler(KeyCodes.KEY_LEFT, () => (stage.accelerometer.accel.x = -5));
    stage.keyboard.setKeyDownHandler(KeyCodes.KEY_RIGHT, () => (stage.accelerometer.accel.x = 5));
  }
}
